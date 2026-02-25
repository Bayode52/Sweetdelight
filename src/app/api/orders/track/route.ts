import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const ref = searchParams.get("ref");
    const email = searchParams.get("email");

    if (!ref && !email) {
        return NextResponse.json({ error: "Provide ref or email" }, { status: 400 });
    }

    try {
        let query = supabase.from("orders").select(`
            id, order_ref, status, payment_status, payment_method,
            customer_name, customer_email, delivery_type, delivery_address,
            subtotal, delivery_fee, discount_amount, total_amount,
            special_instructions, created_at, estimated_time,
            order_items(product_name, quantity, price, line_total)
        `);

        if (ref) query = query.eq("order_ref", ref.toUpperCase());
        else if (email) query = query.eq("customer_email", email).order("created_at", { ascending: false }).limit(5);

        const { data: orders, error } = ref ? await query.single() : await query;

        if (error || !orders) {
            return NextResponse.json({ found: false }, { status: 404 });
        }

        return NextResponse.json({ found: true, orders: Array.isArray(orders) ? orders : [orders] });
    } catch {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
