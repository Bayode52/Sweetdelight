"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Package, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui";
import { createBrowserClient } from "@supabase/auth-helpers-nextjs";

type OrderItem = { product_name: string; quantity: number; price: number; line_total: number };
type Order = {
    order_ref: string;
    total_amount: number;
    payment_method: string;
    delivery_type: string;
    order_items: OrderItem[];
};

export default function CheckoutSuccessPage() {
    const searchParams = useSearchParams();
    const ref = searchParams.get("ref");
    const method = searchParams.get("method");
    const sessionId = searchParams.get("session_id");
    const [order, setOrder] = React.useState<Order | null>(null);
    const isDM = method === "dm" || ["dm_whatsapp", "dm_instagram"].includes(order?.payment_method ?? "");

    React.useEffect(() => {
        // Canvas confetti
        import("canvas-confetti").then((mod) => {
            const confetti = mod.default;
            confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ["#D4421A", "#F5E6D3", "#3D1A0F", "#F7A547"] });
            setTimeout(() => confetti({ particleCount: 60, spread: 50, origin: { y: 0.5 } }), 400);
        });

        // Fetch order details
        const fetchOrder = async () => {
            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );
            if (ref) {
                const { data } = await supabase
                    .from("orders")
                    .select("order_ref, total_amount, payment_method, delivery_type, order_items(product_name, quantity, price, line_total)")
                    .eq("order_ref", ref)
                    .single();
                if (data) setOrder(data as Order);
            } else if (sessionId) {
                const res = await fetch(`/api/orders/track?stripe_session=${sessionId}`);
                const json = await res.json();
                if (json.orders?.[0]) setOrder(json.orders[0]);
            }
        };
        fetchOrder();
    }, [ref, sessionId]);

    return (
        <div className="min-h-screen bg-[#FDF6F0] flex items-center justify-center px-4 py-20">
            <div className="max-w-lg w-full space-y-8 text-center">
                {/* Success icon */}
                <div className="flex justify-center">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="text-green-500" size={52} strokeWidth={1.5} />
                    </div>
                </div>

                <div className="space-y-3">
                    <h1 className="text-4xl font-playfair font-black text-bakery-primary">Order Placed! 🎉</h1>
                    {order?.order_ref && (
                        <div className="inline-block bg-bakery-primary text-white px-6 py-3 rounded-2xl">
                            <p className="text-xs font-black uppercase tracking-widest opacity-60">Order Reference</p>
                            <p className="text-xl font-black tracking-widest">{order.order_ref}</p>
                        </div>
                    )}
                </div>

                {/* Payment-method specific message */}
                <div className={`rounded-3xl p-6 text-left space-y-2 ${isDM ? "bg-orange-50 border border-orange-200" : "bg-green-50 border border-green-200"}`}>
                    {isDM ? (
                        <>
                            <div className="flex items-center gap-2 font-black text-orange-700">
                                <MessageCircle size={18} /> We&apos;ve received your order!
                            </div>
                            <p className="text-sm text-orange-600">
                                Please complete payment via WhatsApp or Instagram DM. Your order will be confirmed as soon as we receive payment — usually within 10 minutes.
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center gap-2 font-black text-green-700">
                                <CheckCircle size={18} /> Payment confirmed — you&apos;re all set!
                            </div>
                            <p className="text-sm text-green-600">
                                Your payment has been processed. We&apos;ll start preparing your order right away and send a confirmation email shortly.
                            </p>
                        </>
                    )}
                </div>

                {/* Order items */}
                {order?.order_items && order.order_items.length > 0 && (
                    <div className="bg-white rounded-3xl border border-bakery-primary/10 p-5 text-left space-y-3">
                        <h3 className="font-playfair font-black text-bakery-primary flex items-center gap-2">
                            <Package size={18} /> Your Order
                        </h3>
                        {order.order_items.map((item: OrderItem, i: number) => (
                            <div key={i} className="flex justify-between text-sm border-b border-bakery-primary/5 pb-2 last:border-0 last:pb-0">
                                <span className="text-bakery-primary/70 font-medium">{item.product_name} × {item.quantity}</span>
                                <span className="font-bold text-bakery-primary">£{item.line_total.toFixed(2)}</span>
                            </div>
                        ))}
                        <div className="flex justify-between font-black text-lg pt-1 border-t border-bakery-primary/10">
                            <span>Total</span>
                            <span className="text-bakery-cta">£{order.total_amount?.toFixed(2)}</span>
                        </div>
                    </div>
                )}

                {/* CTAs */}
                <div className="space-y-3">
                    <Link href={`/track-order${order?.order_ref ? `?ref=${order.order_ref}` : ""}`}>
                        <Button fullWidth size="lg">Track Your Order →</Button>
                    </Link>
                    <Link href="/menu" className="block text-sm font-bold text-bakery-primary/50 hover:text-bakery-primary transition-colors">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
}
