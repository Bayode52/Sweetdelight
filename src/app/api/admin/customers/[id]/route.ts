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

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const user = await verifyAdmin();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const customerId = params.id;

    // Fetch profile, orders, and reviews
    const [
        { data: profile, error: profileError },
        { data: orders, error: ordersError },
        { data: reviews, error: reviewsError }
    ] = await Promise.all([
        adminClient.from("profiles").select("*").eq("id", customerId).single(),
        adminClient.from("orders").select("*").eq("user_id", customerId).order("created_at", { ascending: false }),
        adminClient.from("reviews").select("*, products(name)").eq("user_id", customerId).order("created_at", { ascending: false })
    ]);

    if (profileError) {
        return NextResponse.json({ error: profileError.message }, { status: 404 });
    }

    // Calculate spent
    const spent = (orders || [])
        .filter(o => o.payment_status === "paid")
        .reduce((sum, o) => sum + (o.total_amount || 0), 0);

    return NextResponse.json({
        profile,
        orders: orders || [],
        reviews: reviews || [],
        stats: {
            spent: Math.round(spent * 100) / 100,
            orders_total: orders?.length || 0,
            reviews_total: reviews?.length || 0
        }
    });
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    const user = await verifyAdmin();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const customerId = params.id;
    const body = await request.json();

    const { data, error } = await adminClient
        .from("profiles")
        .update({
            full_name: body.full_name,
            phone: body.phone,
            role: body.role
        })
        .eq("id", customerId)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    const user = await verifyAdmin();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const customerId = params.id;

    // Check if user has orders
    const { data: orders } = await adminClient.from("orders").select("id").eq("user_id", customerId).limit(1);

    if (orders && orders.length > 0) {
        // Anonymize
        const { error } = await adminClient
            .from("profiles")
            .update({
                full_name: "Anonymized User",
                email: `anonymized_${customerId}@cravebakery.co.uk`,
                phone: null,
                avatar_url: null,
                banned: true,
                ban_reason: "Account deleted by owner. Data anonymized due to order history."
            })
            .eq("id", customerId);

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ message: "User anonymized successfully" });
    } else {
        // Full delete
        const { error } = await adminClient.from("profiles").delete().eq("id", customerId);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ message: "User deleted successfully" });
    }
}
