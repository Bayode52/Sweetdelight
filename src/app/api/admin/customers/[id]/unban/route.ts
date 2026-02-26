import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: { id: string } }) {
    const supabase = await createClient();
    const customerId = params.id;

    // Admin check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response("Unauthorized", { status: 401 });
    const { data: admin } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (admin?.role !== "admin") return new Response("Forbidden", { status: 403 });

    const { error } = await supabase
        .from("profiles")
        .update({
            banned: false,
            ban_reason: null,
            banned_at: null
        })
        .eq("id", customerId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
