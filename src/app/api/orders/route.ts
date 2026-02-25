import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            items,
            customerDetails,
            subtotal,
            deliveryFee,
            discountAmount,
            total,
            paymentMethod,
            promoCode,
            status = 'pending'
        } = body;

        // 1. Create the order record
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
                payment_method: paymentMethod,
                payment_status: 'pending',
                status: status,
                special_instructions: customerDetails.specialInstructions,
                promo_code: promoCode,
            })
            .select()
            .single();

        if (orderError) throw orderError;

        // 2. Create order items
        const orderItems = items.map((item: { id: string, name: string, quantity: number, price: number, image: string }) => ({
            order_id: order.id,
            product_id: item.id,
            product_name: item.name,
            quantity: item.quantity,
            unit_price: item.price,
            total_price: item.price * item.quantity,
            image_url: item.image,
        }));

        const { error: itemsError } = await supabase
            .from("order_items")
            .insert(orderItems);

        if (itemsError) throw itemsError;

        // 3. Create a pending referral if referred
        const cookieStore = cookies();
        const refCookie = cookieStore.get('ref');

        if (refCookie && refCookie.value) {
            const referrerId = refCookie.value;
            const rewardAmount = 5.00; // Fixed £5 reward

            // Log a pending referral
            await supabase.from("referrals").insert({
                referrer_id: referrerId,
                referred_user_email: customerDetails.email,
                reward_amount: rewardAmount,
                status: 'pending'
            });
        }

        return NextResponse.json(order);
    } catch (error) {
        console.error("Order creation error:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
    }
}

export async function GET() {
    // Admin-only listing (simplified for now)
    try {
        const { data, error } = await supabase
            .from("orders")
            .select("*, order_items(*)")
            .order("created_at", { ascending: false });

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
    }
}
