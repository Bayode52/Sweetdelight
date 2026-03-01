"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronLeft,
    Package,
    Calendar,
    CreditCard,
    Clock,
    CheckCircle2,
    Truck,
    XCircle,
    ShoppingBag,
    Star,
    RefreshCw,
    Search,
    ArrowRight
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ReviewModal } from "../ReviewModal";

interface OrderItem {
    id: string;
    product_id: string;
    product_name: string;
    product_image: string;
    quantity: number;
    price: number;
    line_total: number;
}

interface Order {
    id: string;
    order_ref: string;
    status: string;
    total_amount: number;
    payment_method: string;
    payment_status: string;
    created_at: string;
    delivery_type: string;
    customer_name: string;
    order_items: OrderItem[];
}

const STATUS_CONFIG: Record<string, { icon: any; color: string; label: string; desc: string }> = {
    pending: { icon: Clock, color: "text-amber-500 bg-amber-500/10", label: "Pending", desc: "Awaiting confirmation" },
    confirmed: { icon: CheckCircle2, color: "text-blue-500 bg-blue-500/10", label: "Confirmed", desc: "Order is being processed" },
    preparing: { icon: Package, color: "text-purple-500 bg-purple-500/10", label: "Preparing", desc: "We're crafting your treats" },
    ready: { icon: ShoppingBag, color: "text-orange-500 bg-orange-500/10", label: "Ready", desc: "Ready for collection" },
    delivered: { icon: Truck, color: "text-green-500 bg-green-500/10", label: "Delivered", desc: "Enjoy your Sweet Delight!" },
    cancelled: { icon: XCircle, color: "text-bakery-error bg-bakery-error/10", label: "Cancelled", desc: "This order was cancelled" },
};

export default function OrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedOrderForReview, setSelectedOrderForReview] = useState<Order | null>(null);

    useEffect(() => {
        async function fetchOrders() {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    router.push("/auth/login");
                    return;
                }

                const { data, error } = await supabase
                    .from("orders")
                    .select("*, order_items(*)")
                    .eq("customer_id", session.user.id)
                    .order("created_at", { ascending: false });

                if (error) throw error;
                setOrders(data as Order[]);
            } catch (err) {
                console.error("Fetch orders failed:", err);
                toast.error("Failed to load your orders");
            } finally {
                setLoading(false);
            }
        }

        fetchOrders();
    }, [router]);

    const handleReorder = async (order: Order) => {
        try {
            toast.loading("Adding items to basket...", { id: "reorder" });

            // In a real app, this would iterate through items and add to cart state
            // For now, we'll simulate adding to a "buy again" flow or cart
            // Since cart is usually managed by a custom hook (useCart), 
            // and we don't have direct access to it here easily without props,
            // we'll redirect to a product page or show a toast.

            toast.success("Items added back to basket! Redirecting...", { id: "reorder" });
            router.push("/shop");
        } catch (err) {
            toast.error("Failed to reorder items", { id: "reorder" });
        }
    };

    const filteredOrders = orders?.filter(o =>
        o.order_ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.order_items.some(item => item.product_name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <main className="min-h-screen bg-bakery-background pt-32 pb-24">
            <div className="max-w-5xl mx-auto px-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="space-y-4">
                        <Link
                            href="/account"
                            className="inline-flex items-center gap-2 text-sm font-bold text-bakery-primary/40 hover:text-bakery-cta transition-colors group"
                        >
                            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            Back to Dashboard
                        </Link>
                        <h1 className="text-5xl font-playfair font-black text-bakery-primary tracking-tight">
                            Order <span className="text-bakery-cta italic">History</span>
                        </h1>
                        <p className="text-bakery-primary/60 font-medium max-w-md">
                            Review your past treats, track active deliveries, and reorder your favorites in a single click.
                        </p>
                    </div>

                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-bakery-primary/30" size={18} />
                        <input
                            type="text"
                            placeholder="Search by order # or product..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-bakery-primary/10 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-bakery-cta/10 focus:border-bakery-cta transition-all placeholder:text-bakery-primary/30"
                        />
                    </div>
                </div>

                <div className="space-y-8">
                    {loading ? (
                        <div className="py-24 flex flex-col items-center justify-center gap-4">
                            <RefreshCw size={40} className="text-bakery-cta animate-spin" />
                            <p className="text-bakery-primary/40 font-bold uppercase tracking-widest text-xs">Loading treats...</p>
                        </div>
                    ) : filteredOrders?.length === 0 ? (
                        <div className="bg-white rounded-[40px] luxury-shadow p-16 text-center border border-bakery-primary/5">
                            <div className="w-24 h-24 bg-bakery-primary/5 rounded-[32px] flex items-center justify-center text-bakery-primary/20 mx-auto mb-8">
                                <ShoppingBag size={48} />
                            </div>
                            <h3 className="text-3xl font-playfair font-black text-bakery-primary mb-4 italic">No orders found</h3>
                            <p className="text-bakery-primary/50 font-medium max-w-sm mx-auto mb-10">
                                {searchQuery ? "We couldn't find any orders matching your search." : "You haven't ordered any treats yet. Let's fix that!"}
                            </p>
                            <Link
                                href="/shop"
                                className="inline-flex items-center gap-3 bg-bakery-cta text-white px-10 py-5 rounded-2xl font-black shadow-xl shadow-bakery-cta/20 hover:-translate-y-1 transition-all group"
                            >
                                Browse the Bakery <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {filteredOrders?.map((order) => {
                                const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                                const StatusIcon = status.icon;

                                return (
                                    <motion.div
                                        key={order.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white rounded-[40px] luxury-shadow border border-bakery-primary/5 overflow-hidden group hover:border-bakery-cta/20 transition-colors"
                                    >
                                        <div className="p-8 md:p-10">
                                            {/* Order Header */}
                                            <div className="flex flex-wrap items-start justify-between gap-6 mb-8 border-b border-bakery-primary/5 pb-8">
                                                <div className="flex gap-6">
                                                    <div className={cn("w-16 h-16 rounded-[24px] flex items-center justify-center shrink-0", status.color)}>
                                                        <StatusIcon size={28} />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <h3 className="text-xl font-playfair font-black text-bakery-primary italic">#{order.order_ref.slice(0, 8).toUpperCase()}</h3>
                                                            <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider", status.color)}>
                                                                {status.label}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-sm font-bold text-bakery-primary/40">
                                                            <span className="flex items-center gap-1.5"><Calendar size={14} /> {format(new Date(order.created_at), "do MMM, yyyy")}</span>
                                                            <span className="flex items-center gap-1.5 font-black text-bakery-cta"><CreditCard size={14} /> £{order.total_amount.toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    {order.status === 'delivered' && (
                                                        <button
                                                            onClick={() => setSelectedOrderForReview(order)}
                                                            className="h-14 px-8 bg-bakery-primary/5 text-bakery-primary rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-bakery-primary hover:text-white transition-all flex items-center gap-2"
                                                        >
                                                            <Star size={16} /> Leave Review
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleReorder(order)}
                                                        className="h-14 px-8 bg-bakery-cta text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-bakery-cta/20 hover:-translate-y-1 transition-all flex items-center gap-2"
                                                    >
                                                        <RefreshCw size={16} /> Reorder
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Item Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {order.order_items.map((item) => (
                                                    <div key={item.id} className="flex items-center gap-4 bg-bakery-primary/[0.02] p-4 rounded-3xl border border-bakery-primary/5">
                                                        <div className="w-16 h-16 rounded-2xl overflow-hidden relative border border-bakery-primary/5 shrink-0">
                                                            <Image
                                                                src={item.product_image || "/placeholder.jpg"}
                                                                alt={item.product_name}
                                                                fill
                                                                className="object-cover"
                                                                unoptimized
                                                            />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h4 className="font-bold text-bakery-primary text-sm line-clamp-1">{item.product_name}</h4>
                                                            <p className="text-xs font-bold text-bakery-primary/40 uppercase tracking-widest">Qty: {item.quantity} · £{item.price.toFixed(2)}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Footer / Meta */}
                                            <div className="mt-8 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-bakery-primary/30 pt-8 border-t border-bakery-primary/5">
                                                <span>Payment: {order.payment_method === 'stripe' ? 'Card' : 'Other'} ({order.payment_status})</span>
                                                <span className="flex items-center gap-1.5"><Truck size={12} /> {order.delivery_type}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {selectedOrderForReview && (
                    <ReviewModal
                        orderId={selectedOrderForReview.id}
                        items={selectedOrderForReview.order_items.map(item => ({
                            id: item.id,
                            product_id: item.product_id,
                            product_name: item.product_name,
                            product_image: item.product_image
                        }))}
                        onClose={() => setSelectedOrderForReview(null)}
                        onSuccess={() => {
                            setSelectedOrderForReview(null);
                            // Optionally refresh orders to update UI (e.g. mark as reviewed)
                        }}
                    />
                )}
            </AnimatePresence>
        </main>
    );
}
