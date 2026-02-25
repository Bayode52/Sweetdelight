import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        // 1. Get the order to see if it has a Stripe Session ID
        const { data: order, error: fetchError } = await supabase
            .from("orders")
            .select("*")
            .eq("id", params.id)
            .single();

        if (fetchError || !order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // 2. If it was a Stripe payment and confirmed, we might want to refund
        // For this prototype, we'll just mark as cancelled in DB
        // In a real app, you'd call stripe.refunds.create({ payment_intent: order.payment_intent_id })

        const { data, error } = await supabase
            .from("orders")
            .update({
                status: "cancelled",
                updated_at: new Date().toISOString(),
                admin_notes: `Order cancelled by admin at ${new Date().toLocaleString()}`
            })
            .eq("id", params.id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (err) {
        console.error("Cancel Order Error:", err);
        return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
    }
}
