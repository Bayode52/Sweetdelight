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
        const checks = [];
        let score = 0;

        // 1. Inventory Check
        const { count: productCount } = await adminClient.from("products").select("*", { count: 'exact', head: true });
        const hasProducts = (productCount || 0) > 0;
        checks.push({
            id: "inventory",
            label: "Product Inventory",
            status: hasProducts ? "complete" : "missing",
            message: hasProducts ? `${productCount} products active` : "You haven't added any products yet."
        });
        if (hasProducts) score += 25;

        // 2. CMS Content Check
        const { count: cmsCount } = await adminClient.from("site_content").select("*", { count: 'exact', head: true });
        const hasCms = (cmsCount || 0) > 10;
        checks.push({
            id: "cms",
            label: "Website Content",
            status: hasCms ? "complete" : "warning",
            message: hasCms ? "Core website content is populated" : "Some website sections are still using default placeholders."
        });
        if (hasCms) score += 25;

        // 3. Store Configuration Check
        const { data: settings } = await adminClient.from("settings").select("*").single();
        const hasContact = settings?.admin_whatsapp_number && settings?.contact_email;
        const hasFees = settings?.delivery_fee !== null;
        const configComplete = hasContact && hasFees;

        checks.push({
            id: "config",
            label: "Store Configuration",
            status: configComplete ? "complete" : "missing",
            message: configComplete ? "Business profile and fees set up" : "Missing contact info or delivery fee settings."
        });
        if (configComplete) score += 25;

        // 4. Security & Live Status
        const { count: securityCount } = await adminClient.from("security_events").select("*", { count: 'exact', head: true });
        const isProtected = (securityCount || 0) > 0;
        const isLive = settings?.is_live;

        checks.push({
            id: "security",
            label: "Security & Status",
            status: isProtected ? "complete" : "warning",
            message: isProtected ? "Security monitoring is active" : "Security middleware hasn't recorded any activity yet."
        });
        if (isProtected) score += 25;

        return NextResponse.json({
            score,
            checks,
            isLive: !!isLive
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
