import { NextResponse } from 'next/server';
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rateLimit";
import { sanitiseText, sanitiseEmail } from "@/lib/sanitise";

export async function POST(req: Request) {
    const limit = await rateLimit(req, 3, 60); // Strict limit for custom orders
    if (!limit.success) return limit.response!;

    try {
        const body = await req.json();
        const { productType, answers, aiPreview, customerDetails, totalEstimate } = body;

        // Sanitize customer details
        const cleanName = sanitiseText(customerDetails.name || '');
        const cleanEmail = sanitiseEmail(customerDetails.email || '');
        const cleanPhone = sanitiseText(customerDetails.phone || '');
        const cleanNotes = sanitiseText(customerDetails.notes || '');
        const cleanAddress = sanitiseText(customerDetails.address || '');

        const supabase = await createClient();

        // Get current user if logged in
        const { data: { session } } = await supabase.auth.getSession();
        const customer_id = session?.user?.id || null;

        // Generate a random order reference (e.g., CRV-CUST-1234)
        const order_reference = `CRV-CUST-${Math.floor(1000 + Math.random() * 9000)}`;

        // Map the fields for insertion
        const orderData = {
            order_reference,
            customer_id,
            customer_name: cleanName,
            customer_email: cleanEmail,
            customer_phone: cleanPhone,
            order_type: 'custom',
            custom_spec: {
                productType,
                answers,
                aiPreview,
            },
            status: 'pending',
            delivery_type: customerDetails.deliveryType || 'collection',
            delivery_address: cleanAddress || null,
            special_instructions: cleanNotes || '',
            total: totalEstimate ? parseFloat(totalEstimate.replace(/[^0-9.]/g, '')) : 0, // Fallback parsing
            payment_method: customerDetails.paymentMethod || 'dm_whatsapp',
            payment_status: 'pending'
        };

        const { data, error } = await supabase
            .from('orders')
            .insert(orderData)
            .select()
            .single();

        if (error) {
            console.error("Supabase insert error:", error);
            return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
        }

        // Trigger admin notification immediately for custom orders
        try {
            const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
            await fetch(`${baseUrl}/api/notifications`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.INTERNAL_API_SECRET}`
                },
                body: JSON.stringify({
                    type: 'admin_custom_order',
                    email: process.env.ADMIN_EMAIL || 'admin@example.com',
                    data: {
                        orderId: data.order_reference,
                        customSpec: data.custom_spec,
                        customer: {
                            name: data.customer_name,
                            email: data.customer_email,
                            phone: data.customer_phone,
                            notes: data.special_instructions
                        }
                    }
                })
            });
        } catch (notificationError) {
            console.error("Failed to send admin notification:", notificationError);
            // Don't fail the order if the notification fails
        }

        return NextResponse.json({ success: true, order: data });

    } catch (error: any) {
        console.error("Error creating custom order:", error);
        return NextResponse.json({ error: error.message || "Failed to process order" }, { status: 500 });
    }
}
