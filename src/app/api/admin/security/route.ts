import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/auth-helpers-nextjs";

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

export async function GET() {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        // Fetch last 100 security events
        const { data: events, error: eventError } = await adminClient
            .from("security_events")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(100);

        if (eventError) throw eventError;

        // Calculate stats
        const now = new Date();
        const past24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

        const { count: botCount } = await adminClient
            .from("security_events")
            .select("*", { count: "exact", head: true })
            .eq("event_type", "bot_detection")
            .gte("created_at", past24h);

        const { count: totalEvents } = await adminClient
            .from("security_events")
            .select("*", { count: "exact", head: true })
            .gte("created_at", past24h);

        return NextResponse.json({
            events,
            stats: {
                bots_24h: botCount || 0,
                total_events_24h: totalEvents || 0,
                status: "active"
            }
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
