import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { emailTemplates } from "@/lib/email-templates";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function getResend() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        console.warn('RESEND_API_KEY not set - emails disabled');
        return null;
    }
    return new Resend(apiKey);
}

export async function POST(req: Request) {
    try {
        const { orderId, status, adminNotes, estimatedTime } = await req.json();

        // Update the order in Supabase
        const { data: order, error } = await supabase
            .from("orders")
            .update({
                status,
                admin_notes: adminNotes,
                estimated_time: estimatedTime,
            })
            .eq("id", orderId)
            .select("id, customer_email, customer_name, order_ref")
            .single();

        if (error || !order) {
            return NextResponse.json({ error: "Failed to update order" }, { status: 400 });
        }

        // Send status update email
        if (order.customer_email) {
            try {
                const resend = getResend();
                if (resend) {
                    await resend.emails.send({
                        from: "Sweet Delight <onboarding@resend.dev>",
                        to: order.customer_email,
                        subject: `Order Update — PB-${order.order_ref.substring(0, 8).toUpperCase()}`,
                        html: emailTemplates.statusUpdate(order.customer_name, order.order_ref, status),
                    });
                } else {
                    console.log('Email skipped - Resend not configured');
                }
            } catch (emailErr) {
                console.warn("Status update email failed:", emailErr);
            }

            // If Delivered, send Review Request email
            if (status === "delivered") {
                try {
                    const resend = getResend();
                    if (resend) {
                        await resend.emails.send({
                            from: "Sweet Delight <onboarding@resend.dev>",
                            to: order.customer_email,
                            subject: "How did we do? ⭐️",
                            html: emailTemplates.reviewRequest(order.customer_name, order.id),
                        });
                    } else {
                        console.log('Email skipped - Resend not configured');
                    }
                } catch (reviewErr) {
                    console.warn("Review request email failed:", reviewErr);
                }
            }
        }

        return NextResponse.json({ success: true, order });
    } catch (e: any) {
        console.error("Status update error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
