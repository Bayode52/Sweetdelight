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

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    const user = await verifyAdmin();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { field, value } = await req.json();
        if (!["is_available", "is_featured", "on_sale"].includes(field)) {
            return NextResponse.json({ error: "Invalid field" }, { status: 400 });
        }

        const { data, error } = await adminClient
            .from("products")
            .update({ [field]: value, updated_at: new Date().toISOString() })
            .eq("id", params.id)
            .select()
            .single();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json(data);
    } catch {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
}
