import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { emailTemplates } from "@/lib/email-templates";

export const dynamic = "force-dynamic";

function getStripe() {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
        console.warn('STRIPE_SECRET_KEY not set - Stripe disabled');
        return null;
    }
    return new Stripe(apiKey, { apiVersion: "2026-01-28.clover" });
}
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
function getResend() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        console.warn('RESEND_API_KEY not set - emails disabled');
        return null;
    }
    return new Resend(apiKey);
}

export async function POST(req: Request) {
    const stripe = getStripe();
    if (!stripe) {
        return new NextResponse("Stripe not configured", { status: 503 });
    }

    const body = await req.text();
    const sig = req.headers.get("stripe-signature")!;

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err) {
        console.error("Webhook signature verification failed:", err);
        return new NextResponse("Webhook Error: Invalid signature", { status: 400 });
    }

    try {
        if (event.type === "checkout.session.completed") {
            const session = event.data.object as Stripe.Checkout.Session;
            const orderId = session.metadata?.orderId;
            if (!orderId) return new NextResponse("OK", { status: 200 });

            // Update order to paid + confirmed
            const { data: order } = await supabase
                .from("orders")
                .update({ payment_status: "paid", status: "confirmed", stripe_payment_intent: session.payment_intent })
                .eq("id", orderId)
                .select("*, order_items(*)")
                .single();

            if (!order) return new NextResponse("Order not found", { status: 404 });

            // Deduct store credit from user profile if used
            if (order.store_credit_used > 0 && order.customer_id) {
                await supabase.rpc("deduct_store_credit", {
                    p_user_id: order.customer_id,
                    p_amount: order.store_credit_used,
                });
                await supabase.from("store_credit_transactions").insert({
                    user_id: order.customer_id,
                    amount: -order.store_credit_used,
                    type: "used",
                    description: `Used on order ${order.order_ref}`,
                    order_id: orderId,
                });
            }

            // Send confirmation email to customer
            try {
                const items = order.order_items.map((item: any) => ({
                    name: item.product_name,
                    qty: item.quantity,
                    price: item.price
                }));
                const resend = getResend();
                if (resend) {
                    await resend.emails.send({
                        from: "Crave Bakery <onboarding@resend.dev>",
                        to: order.customer_email,
                        subject: `✅ Order Confirmed — PB-${order.order_ref.substring(0, 8).toUpperCase()}`,
                        html: emailTemplates.orderConfirmed(order.customer_name, order.id, items, order.total_amount),
                    });
                } else {
                    console.log('Email skipped - Resend not configured');
                }
            } catch (e) { console.warn("Email send failed:", e); }

            // Send alert to admin
            try {
                const resend = getResend();
                if (resend) {
                    await resend.emails.send({
                        from: "Crave Bakery Orders <onboarding@resend.dev>",
                        to: process.env.ADMIN_EMAIL || "admin@example.com",
                        subject: `🆕 New Order — PB-${order.order_ref.substring(0, 8).toUpperCase()} (£${order.total_amount?.toFixed(2)})`,
                        html: emailTemplates.adminNewOrder(order.id, order.total_amount),
                    });
                } else {
                    console.log('Email skipped - Resend not configured');
                }
            } catch (e) { console.warn("Admin email failed:", e); }

            // Check referral commission
            if (order.customer_id) {
                await triggerReferralCommission(order.customer_id, order.subtotal, orderId);
            }
        }

        if (event.type === "payment_intent.payment_failed") {
            const pi = event.data.object as Stripe.PaymentIntent;
            const { data: order } = await supabase
                .from("orders")
                .update({ payment_status: "failed" })
                .eq("stripe_payment_intent", pi.id)
                .select("customer_email, customer_name, order_ref")
                .single();

            if (order?.customer_email) {
                try {
                    const resend = getResend();
                    if (resend) {
                        await resend.emails.send({
                            from: "Crave Bakery <orders@cravebakery.co.uk>",
                            to: order.customer_email,
                            subject: "Payment Failed — Crave Bakery",
                            html: `<p>Hi ${order.customer_name}, unfortunately your payment for order ${order.order_ref} did not go through. Please try again or contact us.</p>`,
                        });
                    } else {
                        console.log('Email skipped - Resend not configured');
                    }
                } catch (e) { console.warn("Failure email error:", e); }
            }
        }
    } catch (e) {
        console.error("Webhook handler error:", e);
        return new NextResponse("Handler error", { status: 500 });
    }

    return new NextResponse("OK", { status: 200 });
}

async function triggerReferralCommission(customerId: string, subtotal: number, orderId: string) {
    const { data: referral } = await supabase
        .from("referrals")
        .select("*, profiles!referrer_id(store_credit, is_affiliate)")
        .eq("referred_id", customerId)
        .eq("status", "pending")
        .single();

    if (!referral) return;

    const isAffiliate = referral.profiles?.is_affiliate ?? false;
    const rate = isAffiliate ? 10 : 5;
    const commission = Math.round(subtotal * (rate / 100) * 100) / 100;

    // Credit the referrer
    await supabase.rpc("add_store_credit", { p_user_id: referral.referrer_id, p_amount: commission });
    await supabase.from("store_credit_transactions").insert({
        user_id: referral.referrer_id,
        amount: commission,
        type: "referral_commission",
        description: `${rate}% referral commission on order`,
        order_id: orderId,
    });
    const { data: updatedReferral } = await supabase.from("referrals").update({
        status: "credited",
        commission_earned: commission,
        commission_rate: rate,
    }).eq("id", referral.id).select("profiles!referrer_id(email, full_name)").single();

    // Send referral credited email
    const profile = updatedReferral?.profiles as any;
    if (profile?.email) {
        try {
            const resend = getResend();
            if (resend) {
                await resend.emails.send({
                    from: "Crave Bakery <onboarding@resend.dev>",
                    to: profile.email,
                    subject: "You've Got Store Credit! 💸",
                    html: emailTemplates.referralCredited(profile.full_name || "Friend", commission),
                });
            } else {
                console.log('Email skipped - Resend not configured');
            }
        } catch (e) { console.warn("Referral email failed:", e); }
    }
}
