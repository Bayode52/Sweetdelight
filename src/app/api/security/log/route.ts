import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/auth-helpers-nextjs";

const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { event_type, severity, description, metadata } = body;

        const ip = req.headers.get("x-forwarded-for") || "unknown";
        const ua = req.headers.get("user-agent") || "unknown";

        const { error } = await adminClient.from("security_events").insert({
            event_type,
            severity: severity || "info",
            description,
            ip_address: ip,
            user_agent: ua,
            metadata: metadata || {}
        });

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error("Security logging error:", err);
        return NextResponse.json({ error: "Failed to log event" }, { status: 500 });
    }
}
