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

// GET /api/admin/products
export async function GET(req: Request) {
    const user = await verifyAdmin();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";
    const category = searchParams.get("category") ?? "All";
    const status = searchParams.get("status") ?? "All";
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "50");
    const offset = (page - 1) * limit;

    let query = adminClient.from("products").select("*", { count: "exact" });

    if (search) query = query.ilike("name", `%${search}%`);
    if (category !== "All") query = query.eq("category", category);
    if (status === "Available") query = query.eq("is_available", true);
    if (status === "Unavailable") query = query.eq("is_available", false);
    if (status === "On Sale") query = query.not("sale_price", "is", null);
    if (status === "Featured") query = query.eq("is_featured", true);

    const { data, error, count } = await query.order("sort_order").order("created_at", { ascending: false }).range(offset, offset + limit - 1);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ products: data, total: count });
}

// POST /api/admin/products
export async function POST(req: Request) {
    const user = await verifyAdmin();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        const { data, error } = await adminClient.from("products").insert({
            name: body.name,
            slug: body.slug ?? slug,
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
            kitchen_handles: body.kitchen_handles ?? "gluten, dairy, eggs, nuts",
            is_available: body.is_available ?? true,
            is_featured: body.is_featured ?? false,
            sort_order: body.sort_order ?? 0,
        }).select().single();
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json(data, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
}
