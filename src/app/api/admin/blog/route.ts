import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifyAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: p } = await adminClient.from("profiles").select("role").eq("id", user.id).single();
    return p?.role === "admin" ? user : null;
}

// GET /api/admin/blog
export async function GET() {
    const user = await verifyAdmin();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await adminClient
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ posts: data });
}

// POST /api/admin/blog
export async function POST(req: Request) {
    const user = await verifyAdmin();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

        const { data, error } = await adminClient.from("blog_posts").insert({
            title: body.title,
            slug: body.slug ?? slug,
            category: body.category,
            excerpt: body.excerpt,
            content: body.content,
            cover_image: body.cover_image,
            tags: body.tags ?? [],
            status: body.status ?? "draft",
            author_id: user.id
        }).select().single();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json(data, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
}
