import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/requireAdmin";

export const dynamic = "force-dynamic";

const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);


// GET /api/admin/blog/[id]
export async function GET(req: Request, { params }: { params: { id: string } }) {
    const auth = await requireAdmin();
    if ('error' in auth) return auth.error;

    const { data, error } = await adminClient
        .from("blog_posts")
        .select("*")
        .eq("id", params.id)
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

// PATCH /api/admin/blog/[id]
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    const auth = await requireAdmin();
    if ('error' in auth) return auth.error;

    try {
        const body = await req.json();
        const { data, error } = await adminClient
            .from("blog_posts")
            .update(body)
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
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const auth = await requireAdmin();
    if ('error' in auth) return auth.error;

    const { error } = await adminClient
        .from("blog_posts")
        .delete()
        .eq("id", params.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
