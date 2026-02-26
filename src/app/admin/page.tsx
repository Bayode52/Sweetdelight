"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { TrendingUp, TrendingDown, ShoppingBag, Clock, Star, Wallet } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Sparkles, ArrowRight, Plus, RefreshCw, ChevronRight } from "lucide-react";

interface DashboardData {
    metrics: { revenueToday: number; ordersToday: number; ordersDiff: number; pendingOrders: number; pendingReviews: number };
    revenueChart: Array<{ date: string; amount: number }>;
    ordersByStatus: Array<{ name: string; value: number }>;
    topProducts: Array<{ id: string; name: string; units: number; revenue: number; rank: number }>;
}

interface Order { id: string; order_ref: string; customer_name: string; total_amount: number; status: string; created_at: string; }

const STATUS_COLORS: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-blue-100 text-blue-700",
    preparing: "bg-purple-100 text-purple-700",
    ready: "bg-orange-100 text-orange-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
};

export default function AdminDashboard() {
    const [adminName, setAdminName] = useState("Admin");
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [justAdded, setJustAdded] = useState<string | null>(null);

    const { data, isLoading } = useQuery<DashboardData>({
        queryKey: ["admin-dashboard"],
        queryFn: async () => {
            const res = await fetch("/api/admin/dashboard");
            if (!res.ok) throw new Error("Failed to fetch dashboard data");
            return res.json();
        },
        refetchInterval: 300000,
    });

    const { data: products } = useQuery({
        queryKey: ["admin-products-summary"],
        queryFn: async () => {
            const res = await fetch("/api/admin/products");
            if (!res.ok) return [];
            return res.json();
        }
    });

    useEffect(() => {
        async function fetchInitial() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
                if (profile?.full_name) setAdminName(profile.full_name);
            }
            const { data: orders } = await supabase.from("orders").select("id, order_ref, customer_name, total_amount, status, created_at").order("created_at", { ascending: false }).limit(10);
            if (orders) setRecentOrders(orders as Order[]);
        }
        fetchInitial();

        const sub = supabase.channel("admin-orders-feed")
            .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, (payload) => {
                const newOrder = payload.new as Order;
                setRecentOrders(prev => [newOrder, ...prev.slice(0, 9)]);
                setJustAdded(newOrder.id);
                setTimeout(() => setJustAdded(null), 3000);
            }).subscribe();
        return () => { supabase.removeChannel(sub); };
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    };

    if (isLoading) return <div className="p-8"><div className="w-8 h-8 border-4 border-bakery-cta border-t-transparent rounded-full animate-spin" /></div>;

    // Setup Checker Logic
    const { data: dbContent } = useQuery({
        queryKey: ["site-content-summary"],
        queryFn: async () => {
            const res = await fetch("/api/admin/content?all=true");
            return res.json();
        }
    });

    const getSetupIssues = () => {
        const issues = [];
        const contentMap = (dbContent || []).reduce((acc: any, item: any) => {
            acc[`${item.page}.${item.section}.${item.field}`] = item.value;
            return acc;
        }, {});

        if (!contentMap["contact.info.whatsapp"]) {
            issues.push({ id: 'whatsapp', label: 'WhatsApp Number Missing', description: 'Customers cannot contact you directly via WhatsApp.', link: '/admin/content?page=contact' });
        }
        if (!contentMap["about.baker.image"]) {
            issues.push({ id: 'baker', label: 'Baker Photo Missing', description: 'Your brand story needs a face! Upload a photo in About Us.', link: '/admin/content?page=about' });
        }
        if (!contentMap["about.baker.bio"]) {
            issues.push({ id: 'bio', label: 'Baker Bio Missing', description: 'Introduce yourself to your customers! Add a bio in About Us.', link: '/admin/content?page=about' });
        }
        if (products && (products as any).products?.some((p: any) => !p.images || p.images.length === 0)) {
            issues.push({ id: 'products', label: 'Missing Product Images', description: 'Some products have no photos. Customers eat with their eyes first!', link: '/admin/products' });
        }
        return issues;
    };

    const setupIssues = getSetupIssues();

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-5xl font-playfair font-black text-bakery-primary tracking-tight italic">Dashboard</h1>
                    <p className="text-bakery-primary/40 font-medium uppercase tracking-[0.2em] text-[10px] ml-1">Live Store Analytics & Control</p>
                </div>

                <div className="flex bg-white rounded-[28px] p-2 luxury-shadow border border-bakery-primary/5">
                    <button className="px-6 py-3 bg-bakery-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-bakery-primary/20">Overview</button>
                    <button className="px-6 py-3 text-bakery-primary/40 hover:text-bakery-primary rounded-2xl font-black text-[10px] uppercase tracking-widest transition-colors">Reports</button>
                </div>
            </div>

            {/* Setup Checker Alert */}
            <AnimatePresence>
                {setupIssues.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-orange-50 border-2 border-orange-100 rounded-[40px] p-8 space-y-6 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-8 text-orange-200/50">
                            <Sparkles size={120} />
                        </div>

                        <div className="relative z-10 flex items-center gap-4">
                            <div className="w-12 h-12 bg-orange-200/30 rounded-2xl flex items-center justify-center text-orange-600">
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-playfair font-black text-bakery-primary">Complete Your Store Setup</h3>
                                <p className="text-sm font-medium text-bakery-primary/60 uppercase tracking-widest">We found {setupIssues.length} critical items needing attention</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
                            {setupIssues.map((issue) => (
                                <Link key={issue.id} href={issue.link}>
                                    <div className="bg-white p-5 rounded-3xl border border-orange-200/50 hover:border-orange-400 transition-all group overflow-hidden relative">
                                        <h4 className="font-black text-bakery-primary text-sm mb-1">{issue.label}</h4>
                                        <p className="text-xs text-bakery-primary/50 font-medium leading-relaxed">{issue.description}</p>
                                        <ArrowRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-200 group-hover:text-orange-600 transition-colors" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
                <Link href="/admin/products?action=add" className="bg-bakery-cta text-white px-5 py-2.5 rounded-xl font-black text-sm hover:bg-orange-600 transition-colors">➕ Add Product</Link>
                <Link href="/admin/orders?status=pending" className="bg-white border border-bakery-primary/10 text-bakery-primary px-5 py-2.5 rounded-xl font-black text-sm hover:border-bakery-cta transition-colors">📦 View Pending Orders</Link>
                <Link href="/admin/reviews?status=pending" className="bg-white border border-bakery-primary/10 text-bakery-primary px-5 py-2.5 rounded-xl font-black text-sm hover:border-bakery-cta transition-colors">⭐ Moderate Reviews</Link>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-bakery-primary/10 relative overflow-hidden">
                    <div className="w-10 h-10 bg-bakery-cta/10 rounded-xl flex items-center justify-center text-bakery-cta mb-3"><Wallet size={20} /></div>
                    <p className="text-xs font-black text-bakery-primary/40 uppercase tracking-widest mb-1">Revenue Today</p>
                    <h2 className="text-3xl font-black text-bakery-primary">£{data?.metrics.revenueToday?.toFixed(2)}</h2>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-bakery-primary/10 relative overflow-hidden">
                    <div className="w-10 h-10 bg-bakery-primary/5 rounded-xl flex items-center justify-center text-bakery-primary mb-3"><ShoppingBag size={20} /></div>
                    <p className="text-xs font-black text-bakery-primary/40 uppercase tracking-widest mb-1">Orders Today</p>
                    <div className="flex items-end gap-3">
                        <h2 className="text-3xl font-black text-bakery-primary">{data?.metrics.ordersToday}</h2>
                        <div className={`flex items-center gap-1 text-xs font-bold mb-1.5 ${(data?.metrics.ordersDiff || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {(data?.metrics.ordersDiff || 0) >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            {Math.abs(data?.metrics.ordersDiff || 0)} vs yesterday
                        </div>
                    </div>
                </div>
                <Link href="/admin/orders?status=pending" className={`p-6 rounded-3xl border relative overflow-hidden transition-all ${data?.metrics.pendingOrders ? "bg-orange-50 border-orange-200" : "bg-white border-bakery-primary/10 hover:border-bakery-cta"}`}>
                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 mb-3"><Clock size={20} /></div>
                    <p className={`text-xs font-black uppercase tracking-widest mb-1 ${data?.metrics.pendingOrders ? "text-orange-600/70" : "text-bakery-primary/40"}`}>Pending Orders</p>
                    <h2 className={`text-3xl font-black ${data?.metrics.pendingOrders ? "text-orange-600" : "text-bakery-primary"}`}>{data?.metrics.pendingOrders}</h2>
                </Link>
                <Link href="/admin/reviews?status=pending" className={`p-6 rounded-3xl border relative overflow-hidden transition-all ${data?.metrics.pendingReviews ? "bg-amber-50 border-amber-200" : "bg-white border-bakery-primary/10 hover:border-bakery-cta"}`}>
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 mb-3"><Star size={20} /></div>
                    <p className={`text-xs font-black uppercase tracking-widest mb-1 ${data?.metrics.pendingReviews ? "text-amber-600/70" : "text-bakery-primary/40"}`}>Reviews to Approve</p>
                    <h2 className={`text-3xl font-black ${data?.metrics.pendingReviews ? "text-amber-600" : "text-bakery-primary"}`}>{data?.metrics.pendingReviews}</h2>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <div className="bg-white p-6 rounded-3xl border border-bakery-primary/10 xl:col-span-2">
                    <h3 className="text-lg font-playfair font-black text-bakery-primary mb-6">Revenue — Last 30 Days</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data?.revenueChart}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `£${v}`} tick={{ fontSize: 12, fill: '#9CA3AF' }} dx={-10} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#FFF8F0', border: 'none', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                                    formatter={(v: any) => [`£${Number(v).toFixed(2)}`, 'Revenue']}
                                    labelStyle={{ fontWeight: 900, color: '#4A3B32', marginBottom: '4px' }}
                                />
                                <Line type="monotone" dataKey="amount" stroke="#F97316" strokeWidth={4} dot={false} activeDot={{ r: 8, fill: '#F97316', stroke: '#FFF', strokeWidth: 2 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Orders by Status */}
                <div className="bg-white p-6 rounded-3xl border border-bakery-primary/10">
                    <h3 className="text-lg font-playfair font-black text-bakery-primary mb-6">Today&apos;s Orders</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data?.ordersByStatus}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} dx={-10} allowDecimals={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(74, 59, 50, 0.05)' }}
                                    contentStyle={{ backgroundColor: '#4A3B32', color: 'white', border: 'none', borderRadius: '12px' }}
                                    itemStyle={{ color: 'white' }}
                                    formatter={(v: any) => [v, 'Orders']}
                                />
                                <Bar dataKey="value" fill="#4A3B32" radius={[6, 6, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Products */}
                <div className="bg-white rounded-3xl border border-bakery-primary/10 overflow-hidden">
                    <div className="p-6 border-b border-bakery-primary/5"><h3 className="text-lg font-playfair font-black text-bakery-primary">Top 5 Products This Week</h3></div>
                    <div className="divide-y divide-bakery-primary/5">
                        {data?.topProducts?.length === 0 ? <p className="p-6 text-bakery-primary/40 font-bold text-sm">No sales data this week.</p> : null}
                        {data?.topProducts?.map((p) => (
                            <div key={p.id} className="p-4 px-6 flex items-center justify-between hover:bg-bakery-primary/[0.02]">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-bakery-primary/5 flex items-center justify-center font-black text-bakery-primary/50 text-xs">#{p.rank}</div>
                                    <div>
                                        <p className="font-bold text-sm text-bakery-primary">{p.name}</p>
                                        <p className="text-xs text-bakery-primary/50">{p.units} units sold</p>
                                    </div>
                                </div>
                                <div className="font-black text-bakery-cta">£{p.revenue.toFixed(2)}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Live Feed */}
                <div className="bg-white rounded-3xl border border-bakery-primary/10 overflow-hidden flex flex-col h-[400px]">
                    <div className="p-6 border-b border-bakery-primary/5 flex items-center justify-between shrink-0">
                        <h3 className="text-lg font-playfair font-black text-bakery-primary flex items-center gap-2">
                            Live Feed <span className="flex h-2 w-2 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span>
                        </h3>
                        <Link href="/admin/orders" className="text-xs font-black text-bakery-cta hover:underline flex items-center gap-1">View All <ArrowRight size={12} /></Link>
                    </div>
                    <div className="overflow-y-auto flex-1 divide-y divide-bakery-primary/5">
                        {recentOrders.length === 0 ? <p className="p-6 text-bakery-primary/40 font-bold text-sm">No recent orders.</p> : null}
                        {recentOrders.map((o) => (
                            <Link key={o.id} href="/admin/orders" className={`block p-4 px-6 hover:bg-bakery-primary/[0.02] transition-colors ${justAdded === o.id ? "bg-yellow-50/50" : ""}`}>
                                <div className="flex justify-between items-start mb-1">
                                    <div>
                                        <span className="font-bold text-sm text-bakery-primary">{o.order_ref}</span>
                                        <span className="text-sm text-bakery-primary/60 ml-2">{o.customer_name}</span>
                                    </div>
                                    <span className="font-black text-sm text-bakery-cta">£{o.total_amount?.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs mt-2">
                                    <span className={`px-2 py-0.5 rounded-full font-bold capitalize ${STATUS_COLORS[o.status] ?? "bg-gray-100 text-gray-700"}`}>{o.status}</span>
                                    <span className="text-bakery-primary/40 font-bold">{formatDistanceToNow(new Date(o.created_at), { addSuffix: true })}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
