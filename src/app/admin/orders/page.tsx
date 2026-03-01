"use client";

import * as React from "react";
import { createBrowserClient } from "@supabase/auth-helpers-nextjs";
import { Search, Filter, Eye, CheckCircle, Clock, Truck, XCircle, MessageCircle, CreditCard, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/utils";
import { generateOrderMessage } from "@/lib/whatsapp";
import toast from "react-hot-toast";

const STATUS_COLORS: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    confirmed: "bg-blue-100 text-blue-700 border-blue-200",
    preparing: "bg-purple-100 text-purple-700 border-purple-200",
    ready: "bg-orange-100 text-orange-700 border-orange-200",
    delivered: "bg-green-100 text-green-700 border-green-200",
    cancelled: "bg-red-100 text-red-700 border-red-200",
};
const STATUS_OPTIONS = ["pending", "confirmed", "preparing", "ready", "delivered", "cancelled"];

type OrderItem = { product_name: string; quantity: number; price: number; line_total: number };
type Order = {
    id: string; order_ref: string; customer_name: string; customer_email: string;
    customer_phone: string; delivery_type: string; delivery_address: string;
    subtotal: number; total_amount: number; payment_method: string; payment_status: string;
    status: string; created_at: string; estimated_time?: string; admin_notes?: string;
    special_instructions?: string; order_items: OrderItem[];
};

export default function AdminOrdersPage() {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const [orders, setOrders] = React.useState<Order[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [search, setSearch] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState("all");
    const [paymentFilter, setPaymentFilter] = React.useState("all");
    const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);
    const [updatingStatus, setUpdatingStatus] = React.useState(false);
    const [adminNotes, setAdminNotes] = React.useState("");
    const [estimatedTime, setEstimatedTime] = React.useState("");

    const fetchOrders = React.useCallback(async () => {
        setLoading(true);
        const { data } = await supabase
            .from("orders")
            .select("*, order_items(product_name, quantity, price, line_total)")
            .order("created_at", { ascending: false })
            .limit(200);
        setOrders((data as Order[]) ?? []);
        setLoading(false);
    }, [supabase]);

    React.useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const today = new Date().toISOString().substring(0, 10);
    const todayOrders = orders.filter((o) => o.created_at.startsWith(today));
    const todayRevenue = todayOrders.reduce((s, o) => s + (o.total_amount ?? 0), 0);
    const pendingCount = orders.filter((o) => o.status === "pending").length;
    const deliveredToday = todayOrders.filter((o) => o.status === "delivered").length;

    const filtered = orders.filter((o) => {
        const matchesSearch = !search || o.order_ref?.toLowerCase().includes(search.toLowerCase()) || o.customer_name?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "all" || o.status === statusFilter;
        const matchesPayment = paymentFilter === "all" || o.payment_method === paymentFilter;
        return matchesSearch && matchesStatus && matchesPayment;
    });

    const updateStatus = async (orderId: string, newStatus: string) => {
        setUpdatingStatus(true);
        try {
            const res = await fetch("/api/admin/orders/status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId,
                    status: newStatus,
                    adminNotes: adminNotes || undefined,
                    estimatedTime: estimatedTime || undefined
                })
            });

            if (res.ok) {
                toast.success(`Status updated to ${newStatus}`);
                setSelectedOrder((prev) => prev ? { ...prev, status: newStatus } : null);
                fetchOrders();
            } else {
                const data = await res.json();
                throw new Error(data.error || "Failed to update status");
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to update status");
        } finally {
            setUpdatingStatus(false);
        }
    };

    const getWhatsAppLink = (order: Order) => {
        if (!order.customer_phone) return null;
        const msg = `Hi ${order.customer_name}! 👋 This is Sweet Delight with an update on your order ${order.order_ref}:\n\nStatus: *${order.status.toUpperCase()}*${estimatedTime ? `\nEstimated: ${estimatedTime}` : ""}\n\nThank you for ordering with us! 🎂`;
        return `https://wa.me/${order.customer_phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(msg)}`;
    };

    return (
        <div className="min-h-screen bg-[#FDF6F0] p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-playfair font-black text-bakery-primary">Orders</h1>
                <button onClick={fetchOrders} className="flex items-center gap-2 text-sm font-bold text-bakery-primary/50 hover:text-bakery-primary transition-colors">
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Today's Orders", value: todayOrders.length, icon: "📦" },
                    { label: "Today's Revenue", value: `£${todayRevenue.toFixed(2)}`, icon: "💷" },
                    { label: "Pending", value: pendingCount, icon: "⏳", alert: pendingCount > 0 },
                    { label: "Delivered Today", value: deliveredToday, icon: "✅" },
                ].map((stat) => (
                    <div key={stat.label} className={cn("bg-white rounded-2xl p-5 border", stat.alert ? "border-orange-200 bg-orange-50" : "border-bakery-primary/10")}>
                        <div className="text-2xl mb-1">{stat.icon}</div>
                        <div className={cn("text-2xl font-playfair font-black", stat.alert ? "text-orange-600" : "text-bakery-primary")}>{stat.value}</div>
                        <div className="text-xs text-bakery-primary/50 font-bold uppercase tracking-widest">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 bg-white rounded-2xl border border-bakery-primary/10 px-4 py-2.5 flex-1 min-w-[200px]">
                    <Search size={16} className="text-bakery-primary/30" />
                    <input
                        value={search} onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by ref or customer…"
                        className="bg-transparent text-sm font-bold text-bakery-primary outline-none w-full placeholder:text-bakery-primary/30"
                    />
                </div>
                <div className="flex items-center gap-2 bg-white rounded-2xl border border-bakery-primary/10 px-4 py-2.5">
                    <Filter size={16} className="text-bakery-primary/30" />
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-transparent text-sm font-bold text-bakery-primary outline-none">
                        <option value="all">All Statuses</option>
                        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                </div>
                <div className="flex items-center gap-2 bg-white rounded-2xl border border-bakery-primary/10 px-4 py-2.5">
                    <CreditCard size={16} className="text-bakery-primary/30" />
                    <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="bg-transparent text-sm font-bold text-bakery-primary outline-none">
                        <option value="all">All Payments</option>
                        <option value="stripe">Card (Stripe)</option>
                        <option value="dm_whatsapp">WhatsApp DM</option>
                        <option value="dm_instagram">Instagram DM</option>
                    </select>
                </div>
            </div>

            {/* Orders table */}
            <div className="bg-white rounded-3xl border border-bakery-primary/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="border-b border-bakery-primary/10">
                            <tr>
                                {["Ref", "Customer", "Items", "Total", "Payment", "Status", "Date", ""].map((h) => (
                                    <th key={h} className="text-left px-5 py-4 text-xs font-black uppercase tracking-widest text-bakery-primary/40">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-bakery-primary/5">
                            {loading ? (
                                <tr><td colSpan={8} className="text-center py-12 text-bakery-primary/30 font-bold">Loading orders…</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={8} className="text-center py-12 text-bakery-primary/30 font-bold">No orders found</td></tr>
                            ) : filtered.map((order) => (
                                <tr key={order.id} className="hover:bg-bakery-primary/[0.02] transition-colors">
                                    <td className="px-5 py-4 font-black text-bakery-primary">{order.order_ref}</td>
                                    <td className="px-5 py-4">
                                        <div className="font-bold text-bakery-primary">{order.customer_name}</div>
                                        <div className="text-xs text-bakery-primary/40">{order.customer_email}</div>
                                    </td>
                                    <td className="px-5 py-4 text-bakery-primary/60 font-bold">{order.order_items?.length ?? 0} items</td>
                                    <td className="px-5 py-4 font-black text-bakery-cta">£{order.total_amount?.toFixed(2)}</td>
                                    <td className="px-5 py-4">
                                        {order.payment_method === "stripe"
                                            ? <CreditCard size={16} className="text-blue-500" />
                                            : <MessageCircle size={16} className="text-green-500" />}
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={cn("inline-flex px-2.5 py-1 rounded-full text-xs font-black border", STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-600")}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-bakery-primary/40 font-bold whitespace-nowrap">
                                        {new Date(order.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                    </td>
                                    <td className="px-5 py-4">
                                        <button
                                            onClick={() => { setSelectedOrder(order); setAdminNotes(order.admin_notes ?? ""); setEstimatedTime(order.estimated_time ?? ""); }}
                                            className="flex items-center gap-1.5 text-xs font-black text-bakery-cta hover:underline"
                                        >
                                            <Eye size={14} /> View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order detail modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 bg-bakery-primary/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
                    <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 space-y-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-2xl font-playfair font-black text-bakery-primary">{selectedOrder.order_ref}</h2>
                                <p className="text-bakery-primary/50 text-sm">{selectedOrder.customer_name} · {selectedOrder.customer_email} · {selectedOrder.customer_phone}</p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="text-bakery-primary/30 hover:text-bakery-primary text-2xl leading-none">&times;</button>
                        </div>

                        {/* Items */}
                        <div className="space-y-2">
                            {selectedOrder.order_items?.map((item, i) => (
                                <div key={i} className="flex justify-between text-sm border-b border-bakery-primary/5 pb-2">
                                    <span className="font-bold">{item.product_name} × {item.quantity}</span>
                                    <span className="font-black text-bakery-cta">£{item.line_total?.toFixed(2)}</span>
                                </div>
                            ))}
                            <div className="flex justify-between font-black text-lg pt-2">
                                <span>Total</span><span className="text-bakery-cta">£{selectedOrder.total_amount?.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Delivery */}
                        <div className="bg-bakery-primary/[0.03] rounded-2xl p-4 space-y-1.5 text-sm">
                            <p><span className="font-black text-bakery-primary/50">Delivery:</span> {selectedOrder.delivery_type}</p>
                            <p><span className="font-black text-bakery-primary/50">Address:</span> {selectedOrder.delivery_address}</p>
                            {selectedOrder.special_instructions && <p><span className="font-black text-bakery-primary/50">Notes:</span> {selectedOrder.special_instructions}</p>}
                        </div>

                        {/* Admin controls */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-bakery-primary/50">Estimated Time</label>
                                <input value={estimatedTime} onChange={(e) => setEstimatedTime(e.target.value)} placeholder="e.g. 45 mins, Ready by 3pm" className="w-full px-4 py-3 rounded-2xl border border-bakery-primary/15 text-sm font-bold focus:outline-none focus:border-bakery-cta" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-bakery-primary/50">Admin Notes</label>
                                <textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={2} placeholder="Internal notes…" className="w-full px-4 py-3 rounded-2xl border border-bakery-primary/15 text-sm font-bold resize-none focus:outline-none focus:border-bakery-cta" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-bakery-primary/50">Update Status</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {STATUS_OPTIONS.map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => updateStatus(selectedOrder.id, s)}
                                            disabled={updatingStatus || selectedOrder.status === s}
                                            className={cn(
                                                "px-3 py-2 rounded-xl text-xs font-black border transition-all",
                                                selectedOrder.status === s ? "border-bakery-cta bg-bakery-cta text-white" : "border-bakery-primary/10 hover:border-bakery-cta hover:text-bakery-cta",
                                                "disabled:opacity-50"
                                            )}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* WhatsApp update */}
                        {getWhatsAppLink(selectedOrder) && (
                            <a
                                href={getWhatsAppLink(selectedOrder)!}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-black rounded-2xl py-3 transition-colors"
                            >
                                <MessageCircle size={18} /> Send WhatsApp Update
                            </a>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
