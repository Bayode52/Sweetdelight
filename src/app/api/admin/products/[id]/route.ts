import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/auth-helpers-nextjs";

export const dynamic = "force-dynamic";

const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifyAdmin() {
    const cookieStore = cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get: (n) => cookieStore.get(n)?.value, set: () => { }, remove: () => { } } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: p } = await adminClient.from("profiles").select("role").eq("id", user.id).single();
    return p?.role === "admin" ? user : null;
}

// PUT /api/admin/products/[id]
export async function PUT(req: Request, { params }: { params: { id: string } }) {
    const user = await verifyAdmin();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const updates: Record<string, unknown> = {
            name: body.name,
            category: body.category,
            short_description: body.short_description ?? null,
            description: body.description ?? null,
            price: body.price,
            sale_price: body.sale_price ?? null,
            images: body.images ?? [],
            image: body.images?.[0] ?? body.image ?? null,
            badge: body.badge ?? null,
            serves: body.serves ?? null,
            allergens: body.allergens ?? [],
            may_contain: body.may_contain ?? [],
            kitchen_handles: body.kitchen_handles ?? null,
            is_available: body.is_available ?? true,
            is_featured: body.is_featured ?? false,
            sort_order: body.sort_order ?? 0,
            updated_at: new Date().toISOString(),
        };
        if (body.slug) updates.slug = body.slug;

        const { data, error } = await adminClient.from("products").update(updates).eq("id", params.id).select().single();
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json(data);
    } catch {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
}

// DELETE /api/admin/products/[id]
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
    const user = await verifyAdmin();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check if product has orders
    const { count: orderCount } = await adminClient
        .from("order_items")
        .select("id", { count: "exact" })
        .eq("product_id", params.id);

    if ((orderCount ?? 0) > 0) {
        // Soft delete — hide from storefront but preserve order history
        await adminClient.from("products").update({ is_available: false, is_featured: false }).eq("id", params.id);
        return NextResponse.json({ softDeleted: true, message: "Product hidden from menu. Order history is preserved." });
    }

    // Hard delete — remove images from storage first
    const { data: product } = await adminClient.from("products").select("images").eq("id", params.id).single();
    if (product?.images?.length) {
        const paths = product.images.map((url: string) => {
            const parts = url.split("/storage/v1/object/public/products/");
            return parts[1] ?? null;
        }).filter(Boolean);
        if (paths.length) await adminClient.storage.from("products").remove(paths);
    }

    const { error } = await adminClient.from("products").delete().eq("id", params.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ deleted: true });
}
