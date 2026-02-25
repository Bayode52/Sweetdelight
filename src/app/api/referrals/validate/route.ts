import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    try {
        const { code } = await req.json();
        if (!code || typeof code !== "string") {
            return NextResponse.json({ valid: false }, { status: 400 });
        }
        const normalised = code.trim().toUpperCase();

        // 1. Check promo_codes table
        const { data: promo } = await supabase
            .from("promo_codes")
            .select("*")
            .eq("code", normalised)
            .eq("is_active", true)
            .single();

        if (promo) {
            const now = new Date();
            const expired = promo.expires_at && new Date(promo.expires_at) < now;
            const maxed = promo.max_uses && promo.used_count >= promo.max_uses;
            if (!expired && !maxed) {
                return NextResponse.json({
                    valid: true,
                    type: "promo",
                    discount: promo.discount_percent,
                    description: promo.description ?? `${promo.discount_percent}% off your order`,
                });
            }
        }

        // 2. Check referral codes in profiles table
        const { data: profile } = await supabase
            .from("profiles")
            .select("id, full_name, referral_code")
            .eq("referral_code", normalised)
            .single();

        if (profile) {
            return NextResponse.json({
                valid: true,
                type: "referral",
                discount: 10,
                description: "10% off your first order",
                referrerName: profile.full_name?.split(" ")[0] ?? "a friend",
                referrerId: profile.id,
            });
        }

        return NextResponse.json({ valid: false }, { status: 404 });
    } catch {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
