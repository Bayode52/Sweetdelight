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
        {
            cookies: {
                get: (name) => cookieStore.get(name)?.value,
                set: () => { },
                remove: () => { },
            },
        }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: profile } = await adminClient.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") return null;
    return user;
}

export async function GET(request: Request) {
    const user = await verifyAdmin();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase();
    const filter = searchParams.get("filter") || "all"; // all, active, banned, affiliates, admins, bots

    let query = adminClient
        .from("profiles")
        .select(`
            *,
            orders:orders(id, total_amount, payment_status)
        `, { count: "exact" });

    // Apply search
    if (search) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Apply filters
    if (filter === "banned") {
        query = query.eq("banned", true);
    } else if (filter === "active") {
        query = query.eq("banned", false).eq("is_bot", false);
    } else if (filter === "affiliates") {
        query = query.eq("role", "affiliate");
    } else if (filter === "admins") {
        query = query.eq("role", "admin");
    } else if (filter === "bots") {
        query = query.eq("is_bot", true);
    }

    const { data: profiles, error, count } = await query.order("created_at", { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Process profiles to add spent and orders_count
    const processedProfiles = (profiles || []).map(profile => {
        const paidOrders = profile.orders?.filter((o: any) => o.payment_status === "paid") || [];
        const totalSpent = paidOrders.reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0);

        // Remove raw orders to keep payload light
        const { orders, ...profileData } = profile;

        return {
            ...profileData,
            orders_count: profile.orders?.length || 0,
            total_spent: Math.round(totalSpent * 100) / 100
        };
    });

    return NextResponse.json({
        customers: processedProfiles,
        total: count
    });
}
