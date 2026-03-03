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
    const { data: profile } = await adminClient.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") return null;
    return user;
}

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    const user = await verifyAdmin();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const customerId = params.id;
    const body = await request.json();
    const { is_bot } = body;

    const { data, error } = await adminClient
        .from("profiles")
        .update({
            is_bot: !!is_bot
        })
        .eq("id", customerId)
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}
