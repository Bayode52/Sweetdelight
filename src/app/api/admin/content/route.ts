import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page");
    const all = searchParams.get("all") === "true";

    const supabase = await createClient();

    // Auth Check for "all" (admin view)
    if (all) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return new Response("Unauthorized", { status: 401 });
        const { data: p } = await supabase.from("profiles").select("role").eq("id", user.id).single();
        if (p?.role !== 'admin') return new Response("Forbidden", { status: 403 });
    }

    let query = supabase.from("site_content").select("*");

    if (page && !all) {
        query = query.eq("page", page);
    }

    const { data, error } = await query;

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}
