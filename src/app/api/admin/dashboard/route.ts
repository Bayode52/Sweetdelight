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

    // Use regular supabase with session since RLS policy "Admins can read all" 
    // allows admins to check their own role via is_admin() function.
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") return null;
    return user;
}

export async function GET() {
    const user = await verifyAdmin();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const today = new Date();
    const todayStr = today.toISOString().substring(0, 10);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().substring(0, 10);

    // 30 days ago
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString();

    // 7 days ago for top products
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
        { data: todayOrders },
        { data: yesterdayOrders },
        { data: pendingOrders },
        { data: pendingReviews },
        { data: revenueHistory },
        { data: ordersByStatusRaw },
        { data: topProductsRaw },
    ] = await Promise.all([
        adminClient.from("orders").select("total_amount").gte("created_at", `${todayStr}T00:00:00`).eq("payment_status", "paid"),
        adminClient.from("orders").select("id").gte("created_at", `${yesterdayStr}T00:00:00`).lt("created_at", `${todayStr}T00:00:00`),
        adminClient.from("orders").select("id", { count: "exact" }).eq("status", "pending"),
        adminClient.from("reviews").select("id", { count: "exact" }).eq("status", "pending"),
        adminClient.from("orders").select("created_at, total_amount").gte("created_at", thirtyDaysAgoStr).eq("payment_status", "paid").order("created_at"),
        adminClient.from("orders").select("status").gte("created_at", `${todayStr}T00:00:00`),
        adminClient.from("order_items").select("product_name, quantity, line_total, orders(created_at)").gte("orders.created_at", sevenDaysAgo.toISOString()),
    ]);

    // Aggregate revenue by day for 30-day chart
    const revMap: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        revMap[d.toISOString().substring(0, 10)] = 0;
    }
    (revenueHistory ?? []).forEach((o) => {
        const day = o.created_at.substring(0, 10);
        if (revMap[day] !== undefined) revMap[day] += o.total_amount ?? 0;
    });
    const revenueChart = Object.entries(revMap).map(([date, amount]) => ({
        date: new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
        amount: Math.round(amount * 100) / 100,
    }));

    // Orders by status today
    const statusMap: Record<string, number> = {};
    (ordersByStatusRaw ?? []).forEach((o) => { statusMap[o.status] = (statusMap[o.status] ?? 0) + 1; });
    const ordersByStatus = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

    // Top 5 products this week
    const prodMap: Record<string, { name: string; units: number; revenue: number }> = {};
    (topProductsRaw ?? []).forEach((item) => {
        if (!prodMap[item.product_name]) prodMap[item.product_name] = { name: item.product_name, units: 0, revenue: 0 };
        prodMap[item.product_name].units += item.quantity;
        prodMap[item.product_name].revenue += item.line_total ?? 0;
    });
    const topProducts = Object.values(prodMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5).map((p, i) => ({ ...p, rank: i + 1 }));

    const revenueToday = (todayOrders ?? []).reduce((s, o) => s + (o.total_amount ?? 0), 0);
    const ordersDiff = (todayOrders?.length ?? 0) - (yesterdayOrders?.length ?? 0);

    return NextResponse.json({
        metrics: {
            revenueToday: Math.round(revenueToday * 100) / 100,
            ordersToday: todayOrders?.length ?? 0,
            ordersDiff,
            pendingOrders: pendingOrders?.length ?? 0,
            pendingReviews: pendingReviews?.length ?? 0,
        },
        revenueChart,
        ordersByStatus,
        topProducts,
    });
}
