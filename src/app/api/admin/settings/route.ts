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

// GET /api/admin/settings
export async function GET() {
    const user = await verifyAdmin();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await adminClient.from("settings").select("*").single();
    if (error && error.code !== "PGRST116") { // Ignore no row found
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Admins list
    const { data: admins } = await adminClient.from("profiles").select("id, full_name, email").eq("role", "admin");

    return NextResponse.json({ settings: data || {}, admins: admins || [] });
}

// PUT /api/admin/settings
export async function PUT(req: Request) {
    const user = await verifyAdmin();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const updates = { ...body, updated_at: new Date().toISOString() };

        // Settings is traditionally a singleton table with an 'id' = 1 or just one row.
        const { data: existing } = await adminClient.from("settings").select("id").limit(1).single();

        let query;
        if (existing) {
            query = adminClient.from("settings").update(updates).eq("id", existing.id);
        } else {
            query = adminClient.from("settings").insert(updates);
        }

        const { data, error } = await query.select().single();
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json(data);
    } catch {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
}
