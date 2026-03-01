"use client";

export const dynamic = 'force-dynamic';

import { Suspense } from "react";
import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Search, Package, CheckCircle, ChefHat, Gift, Truck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { createBrowserClient } from "@supabase/auth-helpers-nextjs";
import toast from "react-hot-toast";
import Image from "next/image";

const STEPS = [
    { key: "pending", icon: Package, label: "Placed", emoji: "📋" },
    { key: "confirmed", icon: CheckCircle, label: "Confirmed", emoji: "✅" },
    { key: "preparing", icon: ChefHat, label: "Preparing", emoji: "👩‍🍳" },
    { key: "ready", icon: Gift, label: "Ready", emoji: "🎁" },
    { key: "delivered", icon: Truck, label: "Delivered", emoji: "🚀" },
];

const STATUS_ORDER = ["pending", "confirmed", "preparing", "ready", "delivered"];

type OrderItem = { product_name: string; quantity: number; price: number; line_total: number; image?: string };
type Order = {
    id: string;
    order_ref: string;
    status: string;
    payment_status: string;
    payment_method: string;
    customer_name: string;
    delivery_type: string;
    delivery_address: string;
    subtotal: number;
    delivery_fee: number;
    discount_amount: number;
    total_amount: number;
    special_instructions?: string;
    estimated_time?: string;
    created_at: string;
    order_items: OrderItem[];
};

export default function TrackOrderPage() {
    const searchParams = useSearchParams();
    const [tab, setTab] = React.useState<"ref" | "email">("ref");
    const [query, setQuery] = React.useState(searchParams.get("ref") ?? searchParams.get("email") ?? "");
    const [loading, setLoading] = React.useState(false);
    const [orders, setOrders] = React.useState<Order[]>([]);
    const [searched, setSearched] = React.useState(false);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const search = async () => {
        if (!query.trim()) return;
        setLoading(true);
        setSearched(true);
        try {
            const param = tab === "ref" ? `ref=${query.trim().toUpperCase()}` : `email=${query.trim()}`;
            const res = await fetch(`/api/orders/track?${param}`);
            const json = await res.json();
            setOrders(json.found ? json.orders : []);
        } catch {
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    // Auto-search from URL params
    React.useEffect(() => {
        const ref = searchParams.get("ref");
        const email = searchParams.get("email");
        if (ref) { setTab("ref"); setQuery(ref); }
        else if (email) { setTab("email"); setQuery(email); }
    }, [searchParams]);

    React.useEffect(() => {
        if (query && (searchParams.get("ref") || searchParams.get("email"))) {
            search();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Supabase Realtime subscription for first order
    React.useEffect(() => {
        if (!orders[0]?.id) return;
        const orderId = orders[0].id;
        const prevStatus = orders[0].status;

        const channel = supabase
            .channel(`order-${orderId}`)
            .on("postgres_changes", {
                event: "UPDATE",
                schema: "public",
                table: "orders",
                filter: `id=eq.${orderId}`,
            }, (payload) => {
                const newStatus = payload.new.status;
                if (newStatus !== prevStatus) {
                    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
                    const step = STEPS.find((s) => s.key === newStatus);
                    if (step) toast.success(`Order update: ${step.emoji} ${step.label}!`, { duration: 5000 });
                }
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orders[0]?.id]);

    const getStepIndex = (status: string) => STATUS_ORDER.indexOf(status);

    return (
        <div className="min-h-screen pt-16 pb-24 px-6 md:px-12 bg-[#FDF6F0]">
            <div className="max-w-2xl mx-auto px-4 space-y-10">
                {/* Header */}
                <div className="text-center space-y-3">
                    <h1 className="text-4xl font-playfair font-black text-bakery-primary">Track Your Order</h1>
                    <p className="text-bakery-primary/50">Enter your order reference or email address to see the latest status.</p>
                </div>

                {/* Search */}
                <div className="bg-white rounded-3xl border border-bakery-primary/10 p-6 space-y-5">
                    {/* Tabs */}
                    <div className="flex bg-bakery-primary/5 rounded-2xl p-1">
                        {(["ref", "email"] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                className={cn(
                                    "flex-1 py-2 rounded-xl text-sm font-black transition-all",
                                    tab === t ? "bg-white text-bakery-cta shadow-sm" : "text-bakery-primary/50"
                                )}
                            >
                                {t === "ref" ? "Order Reference" : "Email Address"}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-3">
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && search()}
                            placeholder={tab === "ref" ? "e.g. CB-ABC123" : "jane@example.com"}
                            className="flex-1 px-4 py-3 rounded-2xl border border-bakery-primary/15 bg-[#FDF6F0] font-bold text-bakery-primary text-sm focus:outline-none focus:border-bakery-cta focus:ring-2 focus:ring-bakery-cta/20"
                        />
                        <Button onClick={search} disabled={loading || !query.trim()}>
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                        </Button>
                    </div>
                </div>

                {/* Results */}
                {searched && !loading && orders.length === 0 && (
                    <div className="text-center py-12 space-y-4">
                        <div className="text-5xl">🔍</div>
                        <h2 className="text-xl font-playfair font-black text-bakery-primary">No order found</h2>
                        <p className="text-bakery-primary/50 text-sm">Double-check your reference or email and try again.</p>
                    </div>
                )}

                {orders.map((order) => {
                    const currentIdx = getStepIndex(order.status);
                    const isDelivered = order.status === "delivered";

                    return (
                        <div key={order.id} className="space-y-6">
                            {/* Status tracker */}
                            <div className="bg-white rounded-3xl border border-bakery-primary/10 p-6 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest text-bakery-primary/40">Order</p>
                                        <p className="text-xl font-playfair font-black text-bakery-primary">{order.order_ref}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-black uppercase tracking-widest text-bakery-primary/40">Total</p>
                                        <p className="text-xl font-black text-bakery-cta">£{order.total_amount?.toFixed(2)}</p>
                                    </div>
                                </div>

                                {/* Progress steps */}
                                <div className="relative">
                                    <div className="absolute top-5 left-0 right-0 h-0.5 bg-bakery-primary/10" />
                                    <div
                                        className="absolute top-5 left-0 h-0.5 bg-green-500 transition-all duration-700"
                                        style={{ width: currentIdx >= 0 ? `${(currentIdx / (STEPS.length - 1)) * 100}%` : "0%" }}
                                    />
                                    <div className="relative flex justify-between">
                                        {STEPS.map((step, i) => {
                                            const done = i < currentIdx;
                                            const active = i === currentIdx;
                                            return (
                                                <div key={step.key} className="flex flex-col items-center gap-2">
                                                    <div className={cn(
                                                        "relative w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                                                        done ? "bg-green-500 border-green-500 text-white"
                                                            : active ? "bg-bakery-cta border-bakery-cta text-white"
                                                                : "bg-white border-bakery-primary/15 text-bakery-primary/30"
                                                    )}>
                                                        {done ? <CheckCircle size={18} /> : <span className="text-base">{step.emoji}</span>}
                                                        {active && !isDelivered && (
                                                            <span className="absolute inset-0 rounded-full border-2 border-bakery-cta animate-ping opacity-40" />
                                                        )}
                                                    </div>
                                                    <span className={cn(
                                                        "text-xs font-black text-center hidden sm:block",
                                                        active ? "text-bakery-cta" : done ? "text-green-600" : "text-bakery-primary/30"
                                                    )}>
                                                        {step.label}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {order.estimated_time && (
                                    <p className="text-sm text-center text-bakery-primary/50 font-bold">
                                        ⏱️ Estimated: {order.estimated_time}
                                    </p>
                                )}
                            </div>

                            {/* Order details */}
                            <div className="bg-white rounded-3xl border border-bakery-primary/10 p-6 space-y-4">
                                <h3 className="font-playfair font-black text-lg text-bakery-primary">Order Details</h3>
                                <div className="space-y-2">
                                    {order.order_items?.map((item, i) => (
                                        <div key={i} className="flex items-center gap-4 py-2 border-b border-bakery-primary/5 last:border-0">
                                            {item.image && (
                                                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-bakery-accent shrink-0">
                                                    <Image src={item.image} alt={item.product_name} fill sizes="48px" className="object-cover" />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <p className="font-bold text-sm text-bakery-primary">{item.product_name}</p>
                                                <p className="text-xs text-bakery-primary/40">× {item.quantity}</p>
                                            </div>
                                            <span className="font-bold text-bakery-primary">£{item.line_total?.toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-2 space-y-1.5 border-t border-bakery-primary/10">
                                    <div className="flex justify-between text-sm"><span className="text-bakery-primary/50 font-bold">Delivery</span><span className="font-bold">{order.delivery_type}</span></div>
                                    {order.delivery_address && order.delivery_address !== "Collection" && (
                                        <div className="flex justify-between text-sm"><span className="text-bakery-primary/50 font-bold">Address</span><span className="font-bold text-right max-w-[55%]">{order.delivery_address}</span></div>
                                    )}
                                    {order.special_instructions && (
                                        <div className="flex justify-between text-sm"><span className="text-bakery-primary/50 font-bold">Notes</span><span className="font-bold text-right max-w-[55%] text-bakery-primary/70">{order.special_instructions}</span></div>
                                    )}
                                    <div className="flex justify-between font-black text-base pt-2 border-t border-bakery-primary/10">
                                        <span>Total Paid</span>
                                        <span className="text-bakery-cta">£{order.total_amount?.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
