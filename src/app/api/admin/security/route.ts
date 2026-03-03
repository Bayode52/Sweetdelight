import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/requireAdmin";

const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);


export async function GET() {
    const auth = await requireAdmin();
    if ('error' in auth) return auth.error;
    const { serviceClient: adminClient } = auth;

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
