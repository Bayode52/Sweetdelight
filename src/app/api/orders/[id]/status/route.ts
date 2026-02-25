import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const { status, estimated_time, admin_notes } = await req.json();

        // Verify admin role (simplified check for this task)
        // In a real app, you would check the user's role from the session

        const { data, error } = await supabase
            .from("orders")
            .update({
                status,
                estimated_time,
                admin_notes,
                updated_at: new Date().toISOString()
            })
            .eq("id", params.id)
            .select()
            .single();

        if (error) throw error;

        // Auto-fulfill referral commissions if order is 'delivered'
        if (status === 'delivered') {
            // Check if there is a pending referral for this email
            const { data: referral } = await supabase
                .from("referrals")
                .select("*")
                .eq("referred_user_email", data.customer_email)
                .eq("status", "pending")
                .single();

            if (referral) {
                // 1. Mark referral as completed
                await supabase
                    .from("referrals")
                    .update({ status: 'completed', completed_at: new Date().toISOString() })
                    .eq("id", referral.id);

                // 2. Add store credit to the referrer
                // Easiest is to fetch the current store credit, then add to it
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("store_credit")
                    .eq("id", referral.referrer_id)
                    .single();

                const currentCredit = profile?.store_credit || 0;
                const newCredit = currentCredit + referral.reward_amount;

                await supabase
                    .from("profiles")
                    .update({ store_credit: newCredit })
                    .eq("id", referral.referrer_id);

                // 3. Log a store credit transaction
                await supabase
                    .from("store_credit_transactions")
                    .insert({
                        user_id: referral.referrer_id,
                        amount: referral.reward_amount,
                        type: 'earned',
                        description: `Referral bonus for order ${data.id}`
                    });
            }
        }

        // TODO: Auto-trigger email/notification here

        return NextResponse.json(data);
    } catch (error) {
        console.error("Status update error:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
    }
}
