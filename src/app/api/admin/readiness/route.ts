import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifyAdmin() {
    const cookieStore = cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) { return cookieStore.get(name)?.value },
            },
        }
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
        const { data: products, count: productCount } = await adminClient
            .from("products")
            .select("images", { count: 'exact' });

        const hasProducts = (productCount || 0) > 0;
        const missingImages = products?.some(p => !p.images || p.images.length === 0);

        checks.push({
            id: "inventory",
            label: "Product Inventory",
            status: hasProducts ? (missingImages ? "warning" : "complete") : "missing",
            message: hasProducts
                ? (missingImages ? "Some products are missing images" : `${productCount} products ready`)
                : "You haven't added any products yet.",
            link: "/admin/products"
        });
        if (hasProducts) score += 25;

        // 2. CMS Content Check (site_content)
        const { data: content } = await adminClient.from("site_content").select("page, section, field, value");
        const contentMap = (content || []).reduce((acc: any, item: any) => {
            acc[`${item.page}.${item.section}.${item.field}`] = item.value;
            return acc;
        }, {});

        const hasHero = contentMap["home.hero.title"] && contentMap["home.hero.button_text"];
        const hasStory = contentMap["about.story.title"] && contentMap["about.story.paragraph1"];
        const hasBaker = contentMap["about.baker.image"];

        const cmsComplete = hasHero && hasStory && hasBaker;
        checks.push({
            id: "cms",
            label: "Website Content",
            status: cmsComplete ? "complete" : "warning",
            message: cmsComplete ? "Core website content is populated" : "Some website sections (Hero, Story, or Baker Image) need setup.",
            link: "/admin/content"
        });
        if (cmsComplete) score += 25;

        // 3. Business Profile (site_settings)
        const { data: siteSettings } = await adminClient.from("site_settings").select("key, value");
        const settingsMap = (siteSettings || []).reduce((acc: any, item: any) => {
            acc[item.key] = item.value;
            return acc;
        }, {});

        const hasBusinessInfo = settingsMap["business_name"] && settingsMap["email"] && settingsMap["whatsapp"];
        checks.push({
            id: "business",
            label: "Business Profile",
            status: hasBusinessInfo ? "complete" : "missing",
            message: hasBusinessInfo ? "Contact and business info set up" : "Missing business name, email, or WhatsApp.",
            link: "/admin/settings"
        });
        if (hasBusinessInfo) score += 25;

        // 4. Operational Settings (settings table)
        const { data: opSettings } = await adminClient.from("settings").select("*").single();
        const opComplete = opSettings?.delivery_fee !== null && opSettings?.min_order_amount !== null;

        checks.push({
            id: "operations",
            label: "Ordering Logic",
            status: opComplete ? "complete" : "warning",
            message: opComplete ? "Delivery fees and minimums set up" : "Verify your delivery fees and minimum order amounts.",
            link: "/admin/settings" // Assuming they are here or similar
        });
        if (opComplete) score += 25;

        return NextResponse.json({
            score: Math.min(100, score),
            checks,
            isLive: !!opSettings?.is_live
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
