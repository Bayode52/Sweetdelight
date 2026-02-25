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

// PUT /api/admin/blog/[id]
export async function PUT(req: Request, { params }: { params: { id: string } }) {
    const user = await verifyAdmin();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();

        const updates: Record<string, unknown> = {
            title: body.title,
            category: body.category,
            excerpt: body.excerpt,
            content: body.content,
            cover_image: body.cover_image,
            tags: body.tags ?? [],
            status: body.status ?? "draft",
            updated_at: new Date().toISOString()
        };
        if (body.slug) updates.slug = body.slug;

        const { data, error } = await adminClient
            .from("blog_posts")
            .update(updates)
            .eq("id", params.id)
            .select()
            .single();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json(data);
    } catch {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
}

// DELETE /api/admin/blog/[id]
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
    const user = await verifyAdmin();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Hard delete - remove cover image from storage first
    const { data: post } = await adminClient.from("blog_posts").select("cover_image").eq("id", params.id).single();
    if (post?.cover_image) {
        const parts = post.cover_image.split("/storage/v1/object/public/blog/");
        if (parts[1]) await adminClient.storage.from("blog").remove([parts[1]]);
    }

    const { error } = await adminClient.from("blog_posts").delete().eq("id", params.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ deleted: true });
}
