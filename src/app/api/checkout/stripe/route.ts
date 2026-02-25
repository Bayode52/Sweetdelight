import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

function getStripe() {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
        console.warn('STRIPE_SECRET_KEY not set - Stripe disabled');
        return null;
    }
    return new Stripe(apiKey, {
        apiVersion: "2026-01-28.clover",
    });
}

export async function POST(req: Request) {
    const stripe = getStripe();
    if (!stripe) {
        return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
    }
    try {
        const { cartItems, customerDetails, subtotal, deliveryFee, discountAmount, storeCreditApplied, total } = await req.json();

        // 1. First, create a pending order (reusing the same logic as the orders API)
        // We do this server-side to ensure consistency
        const { data: order, error: orderError } = await supabase
            .from("orders")
            .insert({
                customer_name: customerDetails.fullName,
                customer_email: customerDetails.email,
                customer_phone: customerDetails.phone,
                delivery_type: customerDetails.deliveryType,
                delivery_address: customerDetails.deliveryType === 'Home Delivery'
                    ? `${customerDetails.streetAddress}, ${customerDetails.city}`
                    : 'Pickup',
                subtotal,
                delivery_fee: deliveryFee,
                discount_amount: discountAmount,
                total_amount: total,
                payment_method: 'stripe',
                payment_status: 'pending',
                status: 'pending',
                special_instructions: customerDetails.specialInstructions,
            })
            .select()
            .single();

        if (orderError) throw orderError;

        // 2. Map cart items to Stripe line items
        const line_items = cartItems.map((item: { name: string, image: string, category: string, price: number, quantity: number }) => ({
            price_data: {
                currency: "gbp",
                product_data: {
                    name: item.name,
                    images: [item.image],
                    description: item.category,
                },
                unit_amount: Math.round(item.price * 100), // Stripe uses pence
            },
            quantity: item.quantity,
        }));

        // Add delivery as a line item if applicable
        if (deliveryFee > 0) {
            line_items.push({
                price_data: {
                    currency: "gbp",
                    product_data: {
                        name: "Home Delivery",
                        description: "UK Flat Rate Shipping",
                    },
                    unit_amount: Math.round(deliveryFee * 100),
                },
                quantity: 1,
            });
        }

        // Add discount as a negative line item if applicable
        if (discountAmount > 0) {
            line_items.push({
                price_data: {
                    currency: "gbp",
                    product_data: {
                        name: "Discount Applied",
                    },
                    unit_amount: -Math.round(discountAmount * 100),
                },
                quantity: 1,
            });
        }

        // Add store credit as a negative line item if applicable
        if (storeCreditApplied > 0) {
            line_items.push({
                price_data: {
                    currency: "gbp",
                    product_data: {
                        name: "Store Credit Applied",
                    },
                    unit_amount: -Math.round(storeCreditApplied * 100),
                },
                quantity: 1,
            });
        }

        // 3. Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items,
            mode: "payment",
            customer_email: customerDetails.email,
            success_url: `${req.headers.get("origin")}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
            cancel_url: `${req.headers.get("origin")}/checkout/cancel`,
            metadata: {
                orderId: order.id,
            },
        });

        // 4. Update order with Stripe session ID
        await supabase
            .from("orders")
            .update({ stripe_session_id: session.id })
            .eq("id", order.id);

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error("Stripe Checkout Error:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
    }
}
