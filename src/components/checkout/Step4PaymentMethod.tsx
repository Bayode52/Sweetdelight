"use client";

import * as React from "react";
import { CreditCard, MessageCircle, Instagram, Lock, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui";
import { generateOrderMessage } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { createBrowserClient } from "@supabase/auth-helpers-nextjs";
import type { CartItem } from "@/store/useCartStore";
import type { CustomerDetailsForm } from "./Step2CustomerDetails";

const DELIVERY_FEE = Number(process.env.NEXT_PUBLIC_DELIVERY_FEE ?? 5);
const FREE_DELIVERY_THRESHOLD = Number(process.env.NEXT_PUBLIC_FREE_DELIVERY_THRESHOLD ?? 50);
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "447000000000";
const INSTAGRAM_HANDLE = process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE ?? "sweetdelightuk";

interface Step4Props {
    customerDetails: CustomerDetailsForm;
    discountAmount: number;
    storeCreditUsed: number;
    promoCode: string;
    onBack: () => void;
}

function generateOrderRef(): string {
    return "CB-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function Step4PaymentMethod({ customerDetails, discountAmount, storeCreditUsed, promoCode, onBack }: Step4Props) {
    const { items, totalAmount, clearCart } = useCartStore();
    const [stripeLoading, setStripeLoading] = React.useState(false);
    const [dmLoading, setDmLoading] = React.useState<"whatsapp" | "instagram" | null>(null);
    const [selected, setSelected] = React.useState<"stripe" | "dm" | null>(null);

    const isHomeDelivery = customerDetails.deliveryType === "Home Delivery";
    const qualifiesFreeDelivery = totalAmount >= FREE_DELIVERY_THRESHOLD;
    const deliveryFee = isHomeDelivery ? (qualifiesFreeDelivery ? 0 : DELIVERY_FEE) : 0;
    const grandTotal = Math.max(0, totalAmount + deliveryFee - discountAmount - storeCreditUsed);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const createPendingOrder = async (paymentMethod: string, orderRef: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        const address = isHomeDelivery
            ? [customerDetails.addressLine1, customerDetails.addressLine2, customerDetails.city, customerDetails.postcode].filter(Boolean).join(", ")
            : "Collection";

        const { data: order, error } = await supabase.from("orders").insert({
            order_ref: orderRef,
            customer_id: user?.id ?? null,
            customer_name: customerDetails.fullName,
            customer_email: customerDetails.email,
            customer_phone: customerDetails.phone,
            delivery_type: customerDetails.deliveryType,
            delivery_address: address,
            delivery_note: customerDetails.deliveryNote ?? null,
            subtotal: totalAmount,
            delivery_fee: deliveryFee,
            discount_amount: discountAmount,
            store_credit_used: storeCreditUsed,
            promo_code: promoCode || null,
            total_amount: grandTotal,
            payment_method: paymentMethod,
            payment_status: "pending",
            status: "pending",
            special_instructions: customerDetails.specialInstructions ?? null,
        }).select().single();

        if (error) throw error;

        // Insert order items
        const orderItems = items.map((item: CartItem) => ({
            order_id: order.id,
            product_id: item.id,
            product_name: item.name,
            price: item.price,
            quantity: item.quantity,
            line_total: item.price * item.quantity,
        }));
        await supabase.from("order_items").insert(orderItems);
        return order;
    };

    const handleStripe = async () => {
        setStripeLoading(true);
        try {
            const orderRef = generateOrderRef();
            const order = await createPendingOrder("stripe", orderRef);
            const res = await fetch("/api/checkout/stripe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId: order.id,
                    cartItems: items,
                    customerDetails,
                    subtotal: totalAmount,
                    deliveryFee,
                    discountAmount,
                    storeCreditApplied: storeCreditUsed,
                    total: grandTotal,
                }),
            });
            const data = await res.json();
            if (data.url) {
                clearCart();
                window.location.href = data.url;
            } else {
                throw new Error(data.error ?? "Stripe error");
            }
        } catch (err) {
            toast.error("Payment setup failed. Please try again.");
            console.error(err);
        } finally {
            setStripeLoading(false);
        }
    };

    const handleDM = async (via: "whatsapp" | "instagram") => {
        setDmLoading(via);
        try {
            const orderRef = generateOrderRef();
            await createPendingOrder(via === "whatsapp" ? "dm_whatsapp" : "dm_instagram", orderRef);

            const orderSummary = {
                ref: orderRef,
                subtotal: totalAmount,
                deliveryFee,
                discountAmount,
                storeCreditUsed,
                total: grandTotal,
            };
            const message = generateOrderMessage(orderSummary, items, customerDetails);
            const encoded = encodeURIComponent(message);

            clearCart();

            if (via === "whatsapp") {
                window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, "_blank");
            } else {
                window.open(`https://instagram.com/${INSTAGRAM_HANDLE}`, "_blank");
            }
            window.location.href = `/checkout/success?ref=${orderRef}&method=dm`;
        } catch {
            toast.error("Could not place order. Please try again.");
        } finally {
            setDmLoading(null);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-playfair font-black text-bakery-primary mb-1">Choose Payment</h2>
                <p className="text-bakery-primary/50 text-sm">Pick how you&apos;d like to pay for your order.</p>
            </div>

            {/* Order total banner */}
            <div className="bg-bakery-primary text-white rounded-3xl px-6 py-5 flex justify-between items-center">
                <div>
                    <p className="text-white/50 text-sm font-bold">Amount due</p>
                    <p className="text-3xl font-playfair font-black">£{grandTotal.toFixed(2)}</p>
                </div>
                <div className="text-right text-sm text-white/60 space-y-0.5">
                    <p>{items.reduce((s, i) => s + i.quantity, 0)} items</p>
                    <p>{customerDetails.deliveryType}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Card A — Stripe */}
                <button
                    onClick={() => setSelected("stripe")}
                    className={cn(
                        "text-left p-6 rounded-3xl border-2 transition-all space-y-4 group",
                        selected === "stripe"
                            ? "border-bakery-cta bg-bakery-cta/5 shadow-lg shadow-bakery-cta/10"
                            : "border-bakery-primary/10 bg-white hover:border-bakery-primary/30"
                    )}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-xl", selected === "stripe" ? "bg-bakery-cta text-white" : "bg-bakery-primary/5 text-bakery-primary")}>
                                <CreditCard size={22} />
                            </div>
                            <h3 className="font-playfair font-black text-lg text-bakery-primary">Pay by Card</h3>
                        </div>
                        {selected === "stripe" && <CheckCircle className="text-bakery-cta" size={22} />}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-bakery-primary/40 font-bold">
                        <Lock size={12} />
                        <span>Secure payment via Stripe — Visa, Mastercard & Amex</span>
                    </div>
                    <p className="text-xs text-bakery-primary/50">You&apos;ll be redirected to Stripe&apos;s secure checkout page.</p>
                </button>

                {/* Card B — DM */}
                <button
                    onClick={() => setSelected("dm")}
                    className={cn(
                        "text-left p-6 rounded-3xl border-2 transition-all space-y-4",
                        selected === "dm"
                            ? "border-bakery-cta bg-bakery-cta/5 shadow-lg shadow-bakery-cta/10"
                            : "border-bakery-primary/10 bg-white hover:border-bakery-primary/30"
                    )}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-xl", selected === "dm" ? "bg-bakery-cta text-white" : "bg-bakery-primary/5 text-bakery-primary")}>
                                <MessageCircle size={22} />
                            </div>
                            <h3 className="font-playfair font-black text-lg text-bakery-primary">Pay via DM</h3>
                        </div>
                        {selected === "dm" && <CheckCircle className="text-bakery-cta" size={22} />}
                    </div>
                    <p className="text-xs text-bakery-primary/50">
                        Send your order via WhatsApp or Instagram DM. We&apos;ll reply with payment details within 10 minutes.
                    </p>
                </button>
            </div>

            {/* Action area based on selection */}
            {selected === "stripe" && (
                <div className="space-y-3">
                    <Button fullWidth size="xl" onClick={handleStripe} disabled={stripeLoading} className="shadow-2xl shadow-bakery-cta/20">
                        {stripeLoading
                            ? <><Loader2 size={20} className="animate-spin mr-2" /> Processing…</>
                            : <><Lock size={16} className="mr-2" /> Pay £{grandTotal.toFixed(2)} Now</>}
                    </Button>
                    <p className="text-center text-xs text-bakery-primary/30 font-bold">🔒 Secured by Stripe · No card details stored</p>
                </div>
            )}

            {selected === "dm" && (
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => handleDM("whatsapp")}
                        disabled={!!dmLoading}
                        className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 active:scale-95 text-white font-black rounded-2xl py-4 px-5 transition-all disabled:opacity-60"
                    >
                        {dmLoading === "whatsapp"
                            ? <Loader2 size={18} className="animate-spin" />
                            : <MessageCircle size={18} />}
                        <span className="text-sm">Chat on WhatsApp</span>
                    </button>
                    <button
                        onClick={() => handleDM("instagram")}
                        disabled={!!dmLoading}
                        className="flex items-center justify-center gap-2 text-white font-black rounded-2xl py-4 px-5 transition-all disabled:opacity-60 active:scale-95"
                        style={{ background: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)" }}
                    >
                        {dmLoading === "instagram"
                            ? <Loader2 size={18} className="animate-spin" />
                            : <Instagram size={18} />}
                        <span className="text-sm">DM on Instagram</span>
                    </button>
                </div>
            )}

            <div className="flex items-center gap-4">
                <button onClick={onBack} className="flex items-center gap-2 text-bakery-primary/50 hover:text-bakery-primary text-sm font-bold transition-colors">
                    <ArrowLeft size={16} /> Back
                </button>
                {!selected && (
                    <p className="text-sm text-bakery-primary/40 font-bold">← Select a payment method above</p>
                )}
            </div>
        </div>
    );
}
