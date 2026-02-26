"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Users, Search, Filter, MoreVertical, Ban, ShieldCheck,
    Bot, Wallet, Clock, Mail, Phone, ChevronRight,
    Loader2, AlertCircle, ShoppingBag, ArrowUpRight
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

interface Customer {
    id: string;
    email: string;
    full_name: string;
    avatar_url: string;
    role: string;
    created_at: string;
    banned: boolean;
    is_bot: boolean;
    store_credit: number;
    phone: string;
    orders: any[];
}

export default function CustomersPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"all" | "active" | "banned" | "bots">("all");
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    const { data: customers, isLoading } = useQuery({
        queryKey: ["admin-customers"],
        queryFn: async () => {
            const res = await fetch("/api/admin/customers");
            if (!res.ok) throw new Error("Failed to fetch customers");
            return res.json() as Promise<Customer[]>;
        }
    });

    const banMutation = useMutation({
        mutationFn: async ({ id, reason }: { id: string, reason: string }) => {
            const res = await fetch(`/api/admin/customers/${id}/ban`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reason })
            });
            if (!res.ok) throw new Error("Failed to ban customer");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
            toast.success("Customer banned successfully");
        }
    });

    const unbanMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/admin/customers/${id}/unban`, { method: "POST" });
            if (!res.ok) throw new Error("Failed to unban customer");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
            toast.success("Customer unbanned successfully");
        }
    });

    const botMutation = useMutation({
        mutationFn: async ({ id, isBot }: { id: string, isBot: boolean }) => {
            const res = await fetch(`/api/admin/customers/${id}/bot`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isBot })
            });
            if (!res.ok) throw new Error("Failed to update bot status");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
            toast.success("Bot status updated");
        }
    });

    const creditMutation = useMutation({
        mutationFn: async ({ id, amount, reason }: { id: string, amount: number, reason: string }) => {
            const res = await fetch(`/api/admin/customers/${id}/credit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount, reason })
            });
            if (!res.ok) throw new Error("Failed to update credit");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
            toast.success("Store credit updated");
        }
    });

    const filteredCustomers = customers?.filter(c => {
        const matchesSearch =
            c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
            c.email?.toLowerCase().includes(search.toLowerCase());

        if (!matchesSearch) return false;

        if (filter === "banned") return c.banned;
        if (filter === "bots") return c.is_bot;
        if (filter === "active") return !c.banned;
        return true;
    });

    if (isLoading) return (
        <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
            <Loader2 size={40} className="text-bakery-cta animate-spin" />
            <p className="font-playfair font-black text-bakery-primary/40 uppercase tracking-widest text-sm">Gathering the Crave community...</p>
        </div>
    );

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-bakery-cta/10 rounded-2xl flex items-center justify-center text-bakery-cta">
                            <Users size={24} />
                        </div>
                        <h1 className="text-4xl font-playfair font-black text-bakery-primary italic tracking-tight">Customer Records</h1>
                    </div>
                    <p className="text-bakery-primary/40 font-medium uppercase tracking-[0.2em] text-[10px] ml-1">Absolute control over the Crave database</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-bakery-primary/30" size={18} />
                        <input
                            type="text"
                            placeholder="Name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-bakery-primary/5 rounded-2xl border-none focus:ring-2 focus:ring-bakery-cta outline-none text-bakery-primary font-medium"
                        />
                    </div>

                    <div className="flex bg-bakery-primary/5 p-1.5 rounded-2xl">
                        {(["all", "active", "banned", "bots"] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => setFilter(t)}
                                className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === t ? "bg-white text-bakery-primary shadow-sm" : "text-bakery-primary/40 hover:text-bakery-primary/60"
                                    }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Customers Table */}
            <div className="bg-white rounded-[40px] luxury-shadow overflow-hidden border border-bakery-primary/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-bakery-primary/5">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-bakery-primary/40">Customer</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-bakery-primary/40">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-bakery-primary/40">Activity</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-bakery-primary/40">Credit</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-bakery-primary/40"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-bakery-primary/5">
                            {filteredCustomers?.map((customer) => (
                                <tr key={customer.id} className="group hover:bg-bakery-primary/[0.01] transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-bakery-primary/5 overflow-hidden border border-bakery-primary/10 shrink-0">
                                                {customer.avatar_url ? (
                                                    <img src={customer.avatar_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-bakery-primary/20 bg-gradient-to-br from-gray-50 to-gray-100">
                                                        <Users size={20} />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-playfair font-black text-bakery-primary group-hover:text-bakery-cta transition-colors">{customer.full_name || "Guest User"}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Mail size={12} className="text-bakery-primary/30" />
                                                    <p className="text-xs font-bold text-bakery-primary/40 lowercase">{customer.email}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-wrap gap-2">
                                            {customer.banned ? (
                                                <span className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-100">
                                                    <Ban size={10} /> Banned
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">
                                                    <ShieldCheck size={10} /> Active
                                                </span>
                                            )}
                                            {customer.is_bot && (
                                                <span className="flex items-center gap-1.5 px-3 py-1 bg-bakery-primary/10 text-bakery-primary/60 rounded-full text-[10px] font-black uppercase tracking-widest border border-bakery-primary/20">
                                                    <Bot size={10} /> Bot
                                                </span>
                                            )}
                                            {customer.role === "admin" && (
                                                <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-purple-100 italic">
                                                    Admin
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2">
                                                <ShoppingBag size={14} className="text-bakery-primary/30" />
                                                <p className="text-xs font-black text-bakery-primary">{customer.orders?.length || 0} Orders</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock size={12} className="text-bakery-primary/30" />
                                                <p className="text-[10px] font-bold text-bakery-primary/40">Joined {format(new Date(customer.created_at), "MMM yyyy")}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <Wallet size={16} className="text-green-600" />
                                            <p className="font-playfair font-black text-bakery-primary text-xl">£{(customer.store_credit || 0).toFixed(2)}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button
                                            onClick={() => setSelectedCustomer(customer)}
                                            className="p-2.5 bg-bakery-primary/5 hover:bg-bakery-cta hover:text-white rounded-xl transition-all text-bakery-primary/30 hover:shadow-lg hover:shadow-bakery-cta/20"
                                        >
                                            <MoreVertical size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredCustomers?.length === 0 && (
                    <div className="py-20 flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-bakery-primary/5 rounded-full flex items-center justify-center text-bakery-primary/20">
                            <Users size={32} />
                        </div>
                        <div className="text-center space-y-1">
                            <p className="font-playfair font-black text-bakery-primary text-xl tracking-tight">No customers found</p>
                            <p className="text-bakery-primary/40 font-medium text-sm">Try adjusting your search or filters.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Customer Details Backdrop/Modal */}
            <AnimatePresence>
                {selectedCustomer && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedCustomer(null)}
                            className="absolute inset-0 bg-bakery-primary/20 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-[40px] w-full max-w-xl luxury-shadow overflow-hidden relative z-10"
                        >
                            {/* Modal Content */}
                            <div className="p-10 space-y-8">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 rounded-3xl bg-bakery-primary/5 overflow-hidden border-2 border-bakery-primary/10">
                                            {selectedCustomer.avatar_url ? (
                                                <img src={selectedCustomer.avatar_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-bakery-primary/20">
                                                    <Users size={32} />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-playfair font-black text-bakery-primary leading-tight lowercase">
                                                {selectedCustomer.full_name || "Guest User"}
                                            </h2>
                                            <p className="text-bakery-cta font-bold text-sm tracking-widest uppercase">{selectedCustomer.role}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedCustomer(null)} className="p-3 bg-bakery-primary/5 hover:bg-bakery-primary/10 rounded-2xl transition-colors text-bakery-primary/40">
                                        <Filter size={20} className="rotate-45" /> {/* Close icon substitution */}
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => {
                                            if (selectedCustomer.banned) unbanMutation.mutate(selectedCustomer.id);
                                            else {
                                                const reason = prompt("Reason for ban?");
                                                if (reason) banMutation.mutate({ id: selectedCustomer.id, reason });
                                            }
                                            setSelectedCustomer(null);
                                        }}
                                        className={`p-6 rounded-[32px] border-2 transition-all text-left flex flex-col gap-3 group ${selectedCustomer.banned
                                                ? "border-green-100 bg-green-50/50 hover:bg-green-50"
                                                : "border-red-100 bg-red-50/50 hover:bg-red-50"
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${selectedCustomer.banned ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                                            }`}>
                                            <Ban size={20} />
                                        </div>
                                        <div>
                                            <p className="font-black text-bakery-primary text-sm uppercase tracking-widest">{selectedCustomer.banned ? "Unban User" : "Ban User"}</p>
                                            <p className="text-[10px] font-bold text-bakery-primary/40 mt-1 uppercase tracking-wider">Access Control</p>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => {
                                            botMutation.mutate({ id: selectedCustomer.id, isBot: !selectedCustomer.is_bot });
                                            setSelectedCustomer(null);
                                        }}
                                        className="p-6 rounded-[32px] border-2 border-bakery-primary/5 bg-bakery-primary/[0.02] hover:bg-bakery-primary/5 transition-all text-left flex flex-col gap-3"
                                    >
                                        <div className="w-10 h-10 bg-bakery-primary/10 rounded-2xl flex items-center justify-center text-bakery-primary/40">
                                            <Bot size={20} />
                                        </div>
                                        <div>
                                            <p className="font-black text-bakery-primary text-sm uppercase tracking-widest">{selectedCustomer.is_bot ? "Mark Human" : "Mark Bot"}</p>
                                            <p className="text-[10px] font-bold text-bakery-primary/40 mt-1 uppercase tracking-wider">AI Detection</p>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => {
                                            const amount = prompt("Amount to add (positive) or subtract (negative)?");
                                            if (amount && !isNaN(parseFloat(amount))) {
                                                const reason = prompt("Reason for adjustment?");
                                                creditMutation.mutate({ id: selectedCustomer.id, amount: parseFloat(amount), reason: reason || "Admin adjustment" });
                                            }
                                            setSelectedCustomer(null);
                                        }}
                                        className="p-6 rounded-[32px] border-2 border-bakery-cta/10 bg-bakery-cta/[0.03] hover:bg-bakery-cta/[0.06] transition-all text-left flex flex-col gap-3 md:col-span-2"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-bakery-cta shadow-sm">
                                                <Wallet size={20} />
                                            </div>
                                            <p className="font-playfair font-black text-bakery-primary text-2xl">£{(selectedCustomer.store_credit || 0).toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="font-black text-bakery-primary text-sm uppercase tracking-widest">Adjust Store Credit</p>
                                            <p className="text-[10px] font-bold text-bakery-primary/40 mt-1 uppercase tracking-wider">Current Balance shown above</p>
                                        </div>
                                    </button>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-bakery-primary/5">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-bakery-primary/40">Email Address</p>
                                            <p className="font-bold text-bakery-primary text-sm">{selectedCustomer.email}</p>
                                        </div>
                                        <a href={`mailto:${selectedCustomer.email}`} className="p-3 bg-bakery-primary/5 hover:bg-bakery-primary/10 rounded-2xl transition-all">
                                            <Mail size={16} className="text-bakery-primary/40" />
                                        </a>
                                    </div>
                                    {selectedCustomer.phone && (
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-bakery-primary/40">Phone Number</p>
                                                <p className="font-bold text-bakery-primary text-sm">{selectedCustomer.phone}</p>
                                            </div>
                                            <a href={`tel:${selectedCustomer.phone}`} className="p-3 bg-bakery-primary/5 hover:bg-bakery-primary/10 rounded-2xl transition-all">
                                                <Phone size={16} className="text-bakery-primary/40" />
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
