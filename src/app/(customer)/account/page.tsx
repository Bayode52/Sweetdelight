"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ShoppingBag,
    Star,
    Users,
    Settings,
    Wallet,
    ChevronRight,
    MapPin,
    Package,
    History
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { ReviewModal } from "./ReviewModal";

type Tab = "orders" | "reviews" | "referrals" | "profile" | "credit";

interface User {
    id: string;
    email?: string;
    full_name?: string;
    phone?: string;
    store_credit?: number;
}

export default function AccountPage() {
    const [activeTab, setActiveTab] = useState<Tab>("orders");
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", user.id)
                    .single();
                setUser({ ...user, ...profile });
            }
        };
        fetchUser();
    }, []);

    const tabs = [
        { id: "orders", label: "My Orders", icon: ShoppingBag },
        { id: "reviews", label: "My Reviews", icon: Star },
        { id: "referrals", label: "My Referrals", icon: Users },
        { id: "profile", label: "Profile", icon: Settings },
        { id: "credit", label: "Store Credit", icon: Wallet },
    ];

    return (
        <div className="min-h-screen bg-bakery-background pt-32 pb-24 px-6">
            <div className="max-w-[1200px] mx-auto">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Sidebar Navigation */}
                    <div className="lg:w-80 shrink-0">
                        <div className="bg-white p-8 rounded-[40px] luxury-shadow border border-bakery-primary/5 sticky top-32">
                            <div className="mb-10 text-center">
                                <div className="w-20 h-20 bg-bakery-primary text-white rounded-[24px] flex items-center justify-center text-3xl font-black mx-auto mb-4">
                                    {user?.full_name?.charAt(0) || "U"}
                                </div>
                                <h2 className="text-xl font-black text-bakery-primary">{user?.full_name || "User"}</h2>
                                <p className="text-bakery-primary/40 text-sm font-bold uppercase tracking-widest">{user?.email}</p>
                            </div>

                            <nav className="space-y-2">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as Tab)}
                                        className={cn(
                                            "w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-black text-sm",
                                            activeTab === tab.id
                                                ? "bg-bakery-primary text-white luxury-shadow"
                                                : "text-bakery-primary/60 hover:bg-bakery-primary/5"
                                        )}
                                    >
                                        <tab.icon size={20} />
                                        {tab.label}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                {activeTab === "orders" && <OrdersTab />}
                                {activeTab === "reviews" && <ReviewsTab />}
                                {activeTab === "referrals" && <ReferralsTab />}
                                {activeTab === "profile" && <ProfileTab user={user} />}
                                {activeTab === "credit" && <CreditTab />}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Sub-components for each tab
function OrdersTab() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [reviewOrder, setReviewOrder] = useState<any>(null);
    const { data: orders, isLoading } = useQuery({
        queryKey: ["customer-orders"],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            const { data } = await supabase
                .from("orders")
                .select("*, order_items(*)")
                .eq("customer_id", user?.id)
                .order("created_at", { ascending: false });
            return data || [];
        }
    });

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <h3 className="text-3xl font-playfair font-black text-bakery-primary">Your Orders</h3>
            {orders?.length === 0 ? (
                <div className="bg-white p-12 rounded-[40px] text-center luxury-shadow border border-bakery-primary/5">
                    <Package size={48} className="mx-auto text-bakery-primary/20 mb-4" />
                    <p className="text-bakery-primary/40 font-bold uppercase tracking-widest">No orders yet</p>
                </div>
            ) : (
                orders?.map((order) => (
                    <div key={order.id} className="bg-white p-8 rounded-[40px] luxury-shadow border border-bakery-primary/5 group hover:border-bakery-cta transition-colors">
                        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                            <div>
                                <p className="text-xs font-black text-bakery-primary/40 uppercase tracking-widest mb-1">Order ID</p>
                                <p className="font-black text-bakery-primary">PB-{order.id.slice(0, 8).toUpperCase()}</p>
                            </div>
                            <Badge status={order.status}>{order.status}</Badge>
                            <div className="text-right">
                                <p className="text-xs font-black text-bakery-primary/40 uppercase tracking-widest mb-1">Date</p>
                                <p className="font-black text-bakery-primary">{new Date(order.created_at).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-black text-bakery-primary/40 uppercase tracking-widest mb-1">Total</p>
                                <p className="text-xl font-black text-bakery-cta">₦{order.total_amount.toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button className="flex-1 h-14 bg-bakery-primary/5 text-bakery-primary rounded-2xl font-black text-sm hover:bg-bakery-primary hover:text-white transition-all">
                                View Details
                            </button>
                            {order.status === 'delivered' && (
                                <button
                                    onClick={() => setReviewOrder(order)}
                                    className="flex-1 h-14 bg-bakery-cta text-white rounded-2xl font-black text-sm hover:scale-[1.02] transition-all luxury-shadow-sm"
                                >
                                    Leave a Review
                                </button>
                            )}
                            <button className="w-14 h-14 bg-bakery-primary/5 text-bakery-primary rounded-2xl flex items-center justify-center hover:bg-bakery-cta hover:text-white transition-all">
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                ))
            )}

            <AnimatePresence>
                {reviewOrder && (
                    <ReviewModal
                        orderId={reviewOrder.id}
                        items={reviewOrder.order_items || []}
                        onClose={() => setReviewOrder(null)}
                        onSuccess={() => {
                            setReviewOrder(null);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function ReviewsTab() {
    const { data: reviews, isLoading } = useQuery({
        queryKey: ["customer-reviews"],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            const { data } = await supabase
                .from("reviews")
                .select("*, products(name)")
                .eq("user_id", user?.id)
                .order("created_at", { ascending: false });
            return data || [];
        }
    });

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <h3 className="text-3xl font-playfair font-black text-bakery-primary">Your Reviews</h3>
            {reviews?.length === 0 ? (
                <div className="bg-white p-12 rounded-[40px] text-center luxury-shadow border border-bakery-primary/5">
                    <Star size={48} className="mx-auto text-bakery-primary/20 mb-4" />
                    <p className="text-bakery-primary/40 font-bold uppercase tracking-widest">No reviews yet</p>
                </div>
            ) : (
                reviews?.map((review) => (
                    <div key={review.id} className="bg-white p-8 rounded-[40px] luxury-shadow border border-bakery-primary/5">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="font-black text-bakery-primary text-xl">{review.products?.name}</h4>
                                <div className="flex gap-1 text-amber-500 mt-1">
                                    {[...Array(review.rating)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                                </div>
                            </div>
                            <Badge status={
                                review.status === 'approved' ? 'success' :
                                    review.status === 'featured' ? 'success' :
                                        review.status === 'rejected' ? 'error' :
                                            review.status === 'hidden' ? 'warning' : 'pending'
                            }>
                                {review.status === 'hidden' ? 'Under Review' : review.status}
                            </Badge>
                        </div>
                        <p className="text-bakery-primary/70 leading-relaxed italic">&quot;{review.comment}&quot;</p>
                        <p className="text-[10px] text-bakery-primary/30 font-black uppercase tracking-widest mt-6">
                            SUBMITTED {new Date(review.created_at).toLocaleDateString()}
                        </p>
                    </div>
                ))
            )}
        </div>
    );
}

function ReferralsTab() {
    // Re-use logic from Task 4 but styled for the account page
    return (
        <div className="space-y-6">
            <h3 className="text-3xl font-playfair font-black text-bakery-primary">Referral Dashboard</h3>
            <div className="bg-gradient-to-br from-bakery-primary to-bakery-primary-light p-10 rounded-[40px] text-white luxury-shadow relative overflow-hidden">
                <div className="relative z-10">
                    <p className="text-white/60 font-black uppercase tracking-widest text-xs mb-2">Total Earned</p>
                    <h2 className="text-6xl font-black mb-10">₦12,500</h2>
                    <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-10">
                        <div>
                            <p className="text-white/60 font-black uppercase tracking-widest text-[10px] mb-1">Total Referrals</p>
                            <p className="text-2xl font-black">24</p>
                        </div>
                        <div>
                            <p className="text-white/60 font-black uppercase tracking-widest text-[10px] mb-1">Conversion Rate</p>
                            <p className="text-2xl font-black">12%</p>
                        </div>
                    </div>
                </div>
            </div>
            {/* Referral logic details would go here */}
        </div>
    );
}

function ProfileTab({ user }: { user: User | null }) {
    return (
        <div className="space-y-6">
            <h3 className="text-3xl font-playfair font-black text-bakery-primary">Profile Settings</h3>
            <div className="bg-white p-10 rounded-[40px] luxury-shadow border border-bakery-primary/5 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-bakery-primary/40">Full Name</label>
                        <input className="w-full h-14 bg-bakery-primary/5 border-none rounded-2xl px-6 font-bold" defaultValue={user?.full_name} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-bakery-primary/40">Phone Number</label>
                        <input className="w-full h-14 bg-bakery-primary/5 border-none rounded-2xl px-6 font-bold" defaultValue={user?.phone} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-black uppercase tracking-widest text-bakery-primary/40">Email Address</label>
                        <input className="w-full h-14 bg-bakery-primary/5 border-none rounded-2xl px-6 font-bold opacity-50" readOnly defaultValue={user?.email} />
                    </div>
                </div>

                <div className="pt-6 border-t border-bakery-primary/5">
                    <h4 className="font-black text-bakery-primary mb-4 flex items-center gap-2">
                        <MapPin size={18} className="text-bakery-cta" />
                        Saved Addresses
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-6 rounded-2xl border-2 border-bakery-cta/20 bg-bakery-cta/[0.02] relative group">
                            <p className="font-bold text-bakery-primary">Home</p>
                            <p className="text-sm text-bakery-primary/60 mt-1">123 Baker Street, London, UK</p>
                            <Badge className="mt-3">Primary</Badge>
                        </div>
                        <button className="p-6 rounded-2xl border-2 border-dashed border-bakery-primary/10 flex flex-col items-center justify-center gap-2 hover:border-bakery-cta hover:bg-bakery-cta/5 transition-all group">
                            <div className="w-10 h-10 rounded-xl bg-bakery-primary/5 flex items-center justify-center text-bakery-primary group-hover:bg-bakery-cta group-hover:text-white transition-all">
                                +
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest">Add New Address</span>
                        </button>
                    </div>
                </div>

                <div className="pt-10 flex gap-4">
                    <button className="flex-1 h-16 bg-bakery-primary text-white rounded-2xl font-black luxury-shadow-sm hover:scale-[1.02] transition-all">
                        Save Changes
                    </button>
                    <button className="flex-1 h-16 bg-bakery-error/10 text-bakery-error rounded-2xl font-black hover:bg-bakery-error hover:text-white transition-all">
                        Delete Account
                    </button>
                </div>
            </div>
        </div>
    );
}

function CreditTab() {
    const { data: profile } = useQuery({
        queryKey: ["customer-profile"],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            const { data } = await supabase.from("profiles").select("*").eq("id", user?.id).single();
            return data;
        }
    });

    return (
        <div className="space-y-6">
            <h3 className="text-3xl font-playfair font-black text-bakery-primary">Store Credit</h3>
            <div className="bg-white p-10 rounded-[40px] luxury-shadow border border-bakery-primary/5 overflow-hidden relative">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-center md:text-left">
                        <p className="text-xs font-black text-bakery-primary/40 uppercase tracking-widest mb-2">Available Balance</p>
                        <h2 className="text-6xl font-black text-bakery-primary">₦{(profile?.store_credit || 0).toLocaleString()}</h2>
                    </div>
                    <div className="bg-bakery-cta/10 p-6 rounded-[32px] max-w-sm">
                        <p className="text-bakery-cta font-black text-sm mb-2 flex items-center gap-2">
                            <Wallet size={16} /> How to use?
                        </p>
                        <p className="text-xs text-bakery-primary/60 font-medium leading-relaxed">
                            Your store credit is automatically applied at checkout when you&apos;re logged in. Share your referral link to earn more!
                        </p>
                    </div>
                </div>

                <div className="mt-12">
                    <h4 className="font-black text-bakery-primary mb-6 flex items-center gap-2">
                        <History size={18} className="text-bakery-cta" />
                        Transaction History
                    </h4>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 rounded-2xl bg-bakery-primary/5">
                            <div>
                                <p className="font-bold text-bakery-primary">Referral Reward — ADE8821</p>
                                <p className="text-[10px] text-bakery-primary/40 font-black uppercase">Feb 15, 2026</p>
                            </div>
                            <p className="text-bakery-success font-black">+₦500</p>
                        </div>
                        <div className="flex justify-between items-center p-4 rounded-2xl bg-bakery-primary/5">
                            <div>
                                <p className="font-bold text-bakery-primary">Order Deduction — #PB-A2B3D4</p>
                                <p className="text-[10px] text-bakery-primary/40 font-black uppercase">Feb 10, 2026</p>
                            </div>
                            <p className="text-bakery-error font-black">-₦1,200</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
