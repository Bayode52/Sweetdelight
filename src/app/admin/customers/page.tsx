"use client";

import * as React from "react";
import {
    Search,
    Filter,
    Eye,
    UserPlus,
    Ban,
    Unlock,
    Robot,
    Trash2,
    Mail,
    Coins,
    ShieldCheck,
    UserCheck,
    MoreVertical,
    RefreshCw,
    User,
    Clock,
    ShoppingBag,
    Star,
    History
} from "lucide-react";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

type Customer = {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    role: string;
    avatar_url: string | null;
    created_at: string;
    banned: boolean;
    ban_reason: string | null;
    is_bot: boolean;
    last_seen: string | null;
    orders_count: number;
    total_spent: number;
    credit_balance: number;
};

type Order = {
    id: string;
    order_ref: string;
    total_amount: number;
    status: string;
    payment_status: string;
    created_at: string;
};

type Review = {
    id: string;
    rating: number;
    text: string;
    comment?: string;
    created_at: string;
    products?: { name: string };
};

export default function AdminCustomersPage() {
    const [customers, setCustomers] = React.useState<Customer[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [search, setSearch] = React.useState("");
    const [filter, setFilter] = React.useState("all");
    const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null);
    const [customerDetails, setCustomerDetails] = React.useState<{
        profile: Customer;
        orders: Order[];
        reviews: Review[];
        stats: { spent: number; orders_total: number; reviews_total: number };
    } | null>(null);
    const [loadingDetails, setLoadingDetails] = React.useState(false);

    // Modal states
    const [showBanModal, setShowBanModal] = React.useState(false);
    const [banReason, setBanReason] = React.useState("");
    const [banType, setBanType] = React.useState("Abusive behaviour");
    const [showCreditModal, setShowCreditModal] = React.useState(false);
    const [creditAmount, setCreditAmount] = React.useState("");
    const [creditReason, setCreditReason] = React.useState("");
    const [showDeleteModal, setShowDeleteModal] = React.useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = React.useState("");

    const fetchCustomers = React.useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/customers?search=${search}&filter=${filter}`);
            const data = await res.json();
            if (res.ok) {
                setCustomers(data.customers);
            } else {
                toast.error(data.error || "Failed to fetch customers");
            }
        } catch (error) {
            toast.error("An error occurred while fetching customers");
        } finally {
            setLoading(false);
        }
    }, [search, filter]);

    React.useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    const fetchCustomerDetails = async (id: string) => {
        setLoadingDetails(true);
        try {
            const res = await fetch(`/api/admin/customers/${id}`);
            const data = await res.json();
            if (res.ok) {
                setCustomerDetails(data);
            } else {
                toast.error(data.error || "Failed to fetch customer details");
            }
        } catch (error) {
            toast.error("An error occurred while fetching details");
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleBan = async () => {
        if (!selectedCustomer) return;
        try {
            const res = await fetch(`/api/admin/customers/${selectedCustomer.id}/ban`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ banned: true, reason: `${banType}: ${banReason}` })
            });
            if (res.ok) {
                toast.success(`${selectedCustomer.full_name} has been banned`);
                setShowBanModal(false);
                setBanReason("");
                fetchCustomers();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to ban customer");
            }
        } catch (error) {
            toast.error("Failed to ban customer");
        }
    };

    const handleUnban = async (customer: Customer) => {
        try {
            const res = await fetch(`/api/admin/customers/${customer.id}/ban`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ banned: false })
            });
            if (res.ok) {
                toast.success(`${customer.full_name} has been unbanned`);
                fetchCustomers();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to unban customer");
            }
        } catch (error) {
            toast.error("Failed to unban customer");
        }
    };

    const handleMarkBot = async (customer: Customer) => {
        try {
            const res = await fetch(`/api/admin/customers/${customer.id}/mark-bot`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_bot: !customer.is_bot })
            });
            if (res.ok) {
                toast.success(`Marked ${customer.full_name} as ${!customer.is_bot ? 'bot' : 'human'}`);
                fetchCustomers();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to update bot status");
            }
        } catch (error) {
            toast.error("Failed to update bot status");
        }
    };

    const handleAddCredit = async () => {
        if (!selectedCustomer || !creditAmount || isNaN(Number(creditAmount))) return;
        try {
            const res = await fetch(`/api/admin/customers/${selectedCustomer.id}/credit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: Number(creditAmount), reason: creditReason })
            });
            if (res.ok) {
                toast.success(`£${creditAmount} added to ${selectedCustomer.full_name}'s balance`);
                setShowCreditModal(false);
                setCreditAmount("");
                setCreditReason("");
                fetchCustomers();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to add credit");
            }
        } catch (error) {
            toast.error("Failed to add credit");
        }
    };

    const handleDelete = async () => {
        if (!selectedCustomer || deleteConfirmText !== "DELETE") return;
        try {
            const res = await fetch(`/api/admin/customers/${selectedCustomer.id}`, {
                method: "DELETE"
            });
            if (res.ok) {
                const data = await res.json();
                toast.success(data.message);
                setShowDeleteModal(false);
                setDeleteConfirmText("");
                fetchCustomers();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to delete customer");
            }
        } catch (error) {
            toast.error("Failed to delete customer");
        }
    };

    return (
        <div className="min-h-screen bg-[#FDF6F0] p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-playfair font-black text-bakery-primary">Customers</h1>
                    <p className="text-bakery-primary/50 font-bold text-sm">Manage users, roles, and moderation</p>
                </div>
                <button onClick={fetchCustomers} className="flex items-center gap-2 text-sm font-bold text-bakery-primary/50 hover:text-bakery-primary transition-colors">
                    <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
                </button>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-3 bg-white rounded-2xl border border-bakery-primary/10 px-4 py-3 flex-1 min-w-[300px] luxury-shadow-sm focus-within:ring-2 ring-bakery-cta/20 transition-all">
                    <Search size={18} className="text-bakery-primary/30" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name or email..."
                        className="bg-transparent text-sm font-bold text-bakery-primary outline-none w-full placeholder:text-bakery-primary/20"
                    />
                </div>

                <div className="flex items-center gap-2 bg-white rounded-2xl border border-bakery-primary/10 px-4 py-3 luxury-shadow-sm">
                    <Filter size={18} className="text-bakery-primary/30" />
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-transparent text-sm font-bold text-bakery-primary outline-none"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="banned">Banned</option>
                        <option value="affiliates">Affiliates</option>
                        <option value="admins">Admins</option>
                        <option value="bots">Bots</option>
                    </select>
                </div>
            </div>

            {/* Customers Table */}
            <div className="bg-white rounded-3xl border border-bakery-primary/10 overflow-hidden luxury-shadow">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-bakery-primary/[0.02] border-b border-bakery-primary/10">
                            <tr>
                                {["Customer", "Role", "Joined", "Orders", "Spent", "Status", ""].map((h) => (
                                    <th key={h} className="text-left px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-bakery-primary/40 leading-none">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-bakery-primary/5 font-bold">
                            {loading ? (
                                <tr><td colSpan={7} className="text-center py-20 text-bakery-primary/30">Loading database...</td></tr>
                            ) : customers.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-20 text-bakery-primary/30">No customers found</td></tr>
                            ) : customers.map((customer) => (
                                <tr key={customer.id} className="hover:bg-bakery-primary/[0.01] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-bakery-primary/10 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                                                {customer.avatar_url ? (
                                                    <img src={customer.avatar_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User size={20} className="text-bakery-primary/30" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="text-bakery-primary flex items-center gap-2">
                                                    {customer.full_name}
                                                    {customer.is_bot && <span title="Bot Account">🤖</span>}
                                                </div>
                                                <div className="text-[11px] text-bakery-primary/40">{customer.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant={customer.role === "admin" ? "default" : "secondary"} className="uppercase text-[9px] font-black tracking-widest px-2 py-0.5">
                                            {customer.role}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-bakery-primary/40 font-bold whitespace-nowrap">
                                        {new Date(customer.created_at).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4 text-bakery-primary/60">{customer.orders_count}</td>
                                    <td className="px-6 py-4 font-black text-bakery-cta">£{customer.total_spent.toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {customer.banned && (
                                                <span className="bg-red-100 text-red-700 text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest border border-red-200">
                                                    Banned
                                                </span>
                                            )}
                                            {!customer.banned && (
                                                <span className="bg-green-100 text-green-700 text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest border border-green-200">
                                                    Active
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="relative group/actions inline-block">
                                            <button className="p-2 hover:bg-bakery-primary/5 rounded-full transition-colors">
                                                <MoreVertical size={16} className="text-bakery-primary/40" />
                                            </button>
                                            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-2xl shadow-2xl border border-bakery-primary/10 overflow-hidden z-50 invisible group-hover/actions:visible opacity-0 group-hover/actions:opacity-100 transition-all pointer-events-none group-hover/actions:pointer-events-auto">
                                                <button onClick={() => { setSelectedCustomer(customer); fetchCustomerDetails(customer.id); }} className="w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-bakery-primary/[0.03] flex items-center gap-2 text-bakery-primary">
                                                    <Eye size={14} /> View Profile
                                                </button>
                                                <button onClick={() => { setSelectedCustomer(customer); setShowCreditModal(true); }} className="w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-bakery-primary/[0.03] flex items-center gap-2 text-bakery-cta">
                                                    <Coins size={14} /> Add Credit
                                                </button>
                                                <div className="h-px bg-bakery-primary/5 my-1" />
                                                {customer.banned ? (
                                                    <button onClick={() => handleUnban(customer)} className="w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-bakery-primary/[0.03] flex items-center gap-2 text-green-600">
                                                        <Unlock size={14} /> Unban Account
                                                    </button>
                                                ) : (
                                                    <button onClick={() => { setSelectedCustomer(customer); setShowBanModal(true); }} className="w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-bakery-primary/[0.03] flex items-center gap-2 text-red-600">
                                                        <Ban size={14} /> Ban Account
                                                    </button>
                                                )}
                                                <button onClick={() => handleMarkBot(customer)} className="w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-bakery-primary/[0.03] flex items-center gap-2 text-purple-600">
                                                    <Robot size={14} /> {customer.is_bot ? 'Mark as Human' : 'Mark as Bot'}
                                                </button>
                                                <div className="h-px bg-bakery-primary/5 my-1" />
                                                <button onClick={() => { setSelectedCustomer(customer); setShowDeleteModal(true); }} className="w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-red-50 flex items-center gap-2 text-red-400">
                                                    <Trash2 size={14} /> Delete Account
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Profile Detail Modal */}
            {customerDetails && (
                <div className="fixed inset-0 z-50 bg-bakery-primary/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setCustomerDetails(null)}>
                    <div className="bg-white rounded-[2rem] max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col luxury-shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="p-8 bg-bakery-primary text-white space-y-4 relative">
                            <button onClick={() => setCustomerDetails(null)} className="absolute top-6 right-8 text-white/50 hover:text-white transition-colors text-2xl">&times;</button>

                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 rounded-full border-4 border-white/10 bg-white/5 flex items-center justify-center overflow-hidden">
                                    {customerDetails.profile.avatar_url ? (
                                        <img src={customerDetails.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={48} className="text-white/20" />
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-3xl font-playfair font-black">{customerDetails.profile.full_name}</h2>
                                        {customerDetails.profile.is_bot && <Badge className="bg-purple-600">BOT</Badge>}
                                        {customerDetails.profile.banned && <Badge className="bg-red-600">BANNED</Badge>}
                                    </div>
                                    <p className="text-white/60 font-bold">{customerDetails.profile.email} · {customerDetails.profile.phone || 'No phone set'}</p>
                                    <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-bakery-cta pt-2">
                                        <span className="flex items-center gap-1.5"><Clock size={12} /> Joined {new Date(customerDetails.profile.created_at).toLocaleDateString()}</span>
                                        <span className="flex items-center gap-1.5 underline decoration-2 underline-offset-4">Last seen {customerDetails.profile.last_seen ? new Date(customerDetails.profile.last_seen).toLocaleString() : 'Never'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8 bg-[#FDF6F0]">
                            <div className="grid grid-cols-3 gap-6 mb-8">
                                <div className="bg-white p-5 rounded-3xl border border-bakery-primary/5 luxury-shadow-sm">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-bakery-primary/30 mb-1">Lifetime Spent</p>
                                    <p className="text-2xl font-black text-bakery-cta">£{customerDetails.stats.spent.toFixed(2)}</p>
                                </div>
                                <div className="bg-white p-5 rounded-3xl border border-bakery-primary/5 luxury-shadow-sm">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-bakery-primary/30 mb-1">Total Orders</p>
                                    <p className="text-2xl font-black text-bakery-primary">{customerDetails.stats.orders_total}</p>
                                </div>
                                <div className="bg-white p-5 rounded-3xl border border-bakery-primary/5 luxury-shadow-sm">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-bakery-primary/30 mb-1">Store Credit</p>
                                    <p className="text-2xl font-black text-green-600">£{(customerDetails.profile.credit_balance || 0).toFixed(2)}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                {/* Orders */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-playfair font-black text-lg text-bakery-primary flex items-center gap-2"><ShoppingBag size={20} /> Order History</h3>
                                    </div>
                                    <div className="space-y-3">
                                        {customerDetails.orders.length > 0 ? customerDetails.orders.map(order => (
                                            <div key={order.id} className="bg-white p-4 rounded-2xl border border-bakery-primary/5 flex items-center justify-between text-sm">
                                                <div>
                                                    <p className="font-black text-bakery-primary">{order.order_ref}</p>
                                                    <p className="text-xs text-bakery-primary/40 font-bold">{new Date(order.created_at).toLocaleDateString()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-black text-bakery-cta">£{order.total_amount.toFixed(2)}</p>
                                                    <Badge variant="outline" className="text-[9px] scale-90 origin-right">{order.status}</Badge>
                                                </div>
                                            </div>
                                        )) : <p className="text-center py-10 bg-bakery-primary/5 rounded-2xl text-bakery-primary/30 font-bold">No orders yet</p>}
                                    </div>
                                </div>

                                {/* Reviews */}
                                <div className="space-y-4">
                                    <h3 className="font-playfair font-black text-lg text-bakery-primary flex items-center gap-2"><Star size={20} /> Reviews Written</h3>
                                    <div className="space-y-3">
                                        {customerDetails.reviews.length > 0 ? customerDetails.reviews.map(review => (
                                            <div key={review.id} className="bg-white p-4 rounded-2xl border border-bakery-primary/5 space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex text-yellow-400">
                                                        {[...Array(5)].map((_, i) => <Star key={i} size={10} fill={i < review.rating ? "currentColor" : "none"} />)}
                                                    </div>
                                                    <span className="text-[10px] text-bakery-primary/40 font-bold">{new Date(review.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-xs font-bold text-bakery-primary/50 italic leading-relaxed">"{review.comment || review.text}"</p>
                                                <p className="text-[10px] font-black text-bakery-cta uppercase tracking-widest">{review.products?.name || 'Assorted Pastries'}</p>
                                            </div>
                                        )) : <p className="text-center py-10 bg-bakery-primary/5 rounded-2xl text-bakery-primary/30 font-bold">No reviews yet</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions Footer */}
                        <div className="p-6 bg-white border-t border-bakery-primary/10 flex items-center justify-between">
                            <div className="flex gap-2">
                                <button onClick={() => setShowCreditModal(true)} className="px-6 py-2.5 bg-green-100 text-green-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-green-200 transition-colors">Add Store Credit</button>
                                <button className="px-6 py-2.5 bg-bakery-cta/10 text-bakery-cta rounded-xl text-xs font-black uppercase tracking-widest hover:bg-bakery-cta/20 transition-colors">Send Email</button>
                            </div>
                            <div className="flex gap-2">
                                {customerDetails.profile.role !== 'admin' && (
                                    <button className="px-6 py-2.5 bg-bakery-primary text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-bakery-primary/90 transition-colors">Make Admin</button>
                                )}
                                {customerDetails.profile.banned ? (
                                    <button onClick={() => handleUnban(customerDetails.profile)} className="px-6 py-2.5 bg-green-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-green-700 transition-colors">Unban Account</button>
                                ) : (
                                    <button onClick={() => setShowBanModal(true)} className="px-6 py-2.5 bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-colors">Ban Account</button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Ban Modal */}
            {showBanModal && selectedCustomer && (
                <div className="fixed inset-0 z-[60] bg-bakery-primary/60 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full p-8 space-y-6 luxury-shadow-2xl">
                        <div className="text-center space-y-2">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Ban size={32} />
                            </div>
                            <h2 className="text-2xl font-playfair font-black text-bakery-primary">Ban {selectedCustomer.full_name}?</h2>
                            <p className="text-bakery-primary/50 text-sm font-bold">The customer will be blocked from accessing their account immediately.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-bakery-primary/40">Reason for Ban</label>
                                <select
                                    value={banType}
                                    onChange={(e) => setBanType(e.target.value)}
                                    className="w-full px-4 py-3 rounded-2xl border border-bakery-primary/15 text-sm font-bold outline-none focus:border-red-500 transition-all"
                                >
                                    <option>Abusive behaviour</option>
                                    <option>Spamming</option>
                                    <option>Fake reviews</option>
                                    <option>Policy violation</option>
                                    <option>Competitor attack</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-bakery-primary/40">Additional Details</label>
                                <textarea
                                    value={banReason}
                                    onChange={(e) => setBanReason(e.target.value)}
                                    placeholder="Brief description of why this account is being banned..."
                                    className="w-full px-4 py-3 rounded-2xl border border-bakery-primary/15 text-sm font-bold outline-none focus:border-red-500 h-24 resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setShowBanModal(false)} className="flex-1 px-4 py-3 rounded-2xl font-black text-sm text-bakery-primary/40 hover:bg-bakery-primary/5 transition-all">Cancel</button>
                            <button onClick={handleBan} className="flex-1 px-4 py-3 rounded-2xl font-black text-sm bg-red-600 text-white hover:bg-red-700 transition-all shadow-lg shadow-red-200">Confirm Ban</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Credit Modal */}
            {showCreditModal && selectedCustomer && (
                <div className="fixed inset-0 z-[60] bg-bakery-primary/60 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full p-8 space-y-6 luxury-shadow-2xl">
                        <div className="text-center space-y-2">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Coins size={32} />
                            </div>
                            <h2 className="text-2xl font-playfair font-black text-bakery-primary">Add Store Credit</h2>
                            <p className="text-bakery-primary/50 text-sm font-bold">Add balance to {selectedCustomer.full_name}'s account.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-bakery-primary/40">Amount (£)</label>
                                <input
                                    type="number"
                                    value={creditAmount}
                                    onChange={(e) => setCreditAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full px-4 py-4 rounded-2xl border border-bakery-primary/15 text-2xl font-black text-bakery-cta outline-none focus:border-green-500 text-center"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-bakery-primary/40">Reason Note</label>
                                <input
                                    value={creditReason}
                                    onChange={(e) => setCreditReason(e.target.value)}
                                    placeholder="e.g. Compensation, Giveaway winner, Referral..."
                                    className="w-full px-4 py-3 rounded-2xl border border-bakery-primary/15 text-sm font-bold outline-none focus:border-green-500"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setShowCreditModal(false)} className="flex-1 px-4 py-3 rounded-2xl font-black text-sm text-bakery-primary/40 hover:bg-bakery-primary/5 transition-all">Cancel</button>
                            <button onClick={handleAddCredit} className="flex-1 px-4 py-3 rounded-2xl font-black text-sm bg-green-600 text-white hover:bg-green-700 transition-all shadow-lg shadow-green-200">Add Credit</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && selectedCustomer && (
                <div className="fixed inset-0 z-[60] bg-bakery-primary/60 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full p-8 space-y-6 luxury-shadow-2xl border-4 border-red-500/20">
                        <div className="text-center space-y-2">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 size={32} />
                            </div>
                            <h2 className="text-2xl font-playfair font-black text-bakery-primary text-red-600">Delete Account?</h2>
                            <p className="text-bakery-primary/50 text-sm font-bold">This action cannot be undone. Accounts with orders will be anonymized to preserve business data.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5 text-center">
                                <label className="text-[10px] font-black uppercase tracking-widest text-red-500/50">Type DELETE to confirm</label>
                                <input
                                    value={deleteConfirmText}
                                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                                    placeholder="DELETE"
                                    className="w-full px-4 py-3 rounded-2xl border-2 border-red-100 text-center text-sm font-black outline-none focus:border-red-500 uppercase tracking-widest placeholder:text-red-200"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(""); }} className="flex-1 px-4 py-3 rounded-2xl font-black text-sm text-bakery-primary/40 hover:bg-bakery-primary/5 transition-all">Cancel</button>
                            <button
                                onClick={handleDelete}
                                disabled={deleteConfirmText !== "DELETE"}
                                className="flex-1 px-4 py-3 rounded-2xl font-black text-sm bg-red-600 text-white hover:bg-red-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-red-200"
                            >
                                DELETE FOREVER
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
