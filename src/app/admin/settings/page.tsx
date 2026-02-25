"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Settings as SettingsIcon, Bell, Truck, Percent, Save, ShieldCheck, Loader2 } from "lucide-react";

interface SettingsData {
    settings: {
        id?: number;
        delivery_fee: number;
        free_delivery_threshold: number;
        min_order_amount: number;
        referral_commission_percent: number;
        admin_whatsapp_number: string;
        order_alerts_enabled: boolean;
        review_alerts_enabled: boolean;
    };
    admins: Array<{ id: string; full_name: string; email: string }>;
}

export default function AdminSettings() {
    const queryClient = useQueryClient();
    const [form, setForm] = useState<SettingsData["settings"]>({
        delivery_fee: 4.99,
        free_delivery_threshold: 50,
        min_order_amount: 20,
        referral_commission_percent: 10,
        admin_whatsapp_number: "",
        order_alerts_enabled: true,
        review_alerts_enabled: true
    });

    const { data, isLoading } = useQuery<SettingsData>({
        queryKey: ["admin-settings"],
        queryFn: async () => {
            const res = await fetch("/api/admin/settings");
            if (!res.ok) throw new Error("Failed to fetch settings");
            return res.json();
        }
    });

    useEffect(() => {
        if (data?.settings) {
            setForm({
                delivery_fee: data.settings.delivery_fee ?? 4.99,
                free_delivery_threshold: data.settings.free_delivery_threshold ?? 50,
                min_order_amount: data.settings.min_order_amount ?? 20,
                referral_commission_percent: data.settings.referral_commission_percent ?? 10,
                admin_whatsapp_number: data.settings.admin_whatsapp_number ?? "",
                order_alerts_enabled: data.settings.order_alerts_enabled ?? true,
                review_alerts_enabled: data.settings.review_alerts_enabled ?? true,
            });
        }
    }, [data]);

    const saveMutation = useMutation({
        mutationFn: async (payload: SettingsData["settings"]) => {
            const res = await fetch("/api/admin/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error("Failed to save settings");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
            alert("Settings saved successfully!");
        },
        onError: () => alert("Failed to save settings.")
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        saveMutation.mutate({
            ...form,
            delivery_fee: Number(form.delivery_fee),
            free_delivery_threshold: Number(form.free_delivery_threshold),
            min_order_amount: Number(form.min_order_amount),
            referral_commission_percent: Number(form.referral_commission_percent)
        });
    };

    if (isLoading) return <div className="p-8"><div className="w-8 h-8 border-4 border-bakery-cta border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-[1200px] mx-auto pb-24">
            <div>
                <h1 className="text-3xl font-playfair font-black text-bakery-primary">Store Settings</h1>
                <p className="text-bakery-primary/60 mt-1">Manage delivery rates, commissions, and notification preferences.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* E-Commerce Logic */}
                <div className="bg-white rounded-3xl border border-bakery-primary/10 overflow-hidden">
                    <div className="p-6 border-b border-bakery-primary/5 bg-bakery-primary/[0.02] flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-bakery-primary"><Truck size={20} /></div>
                        <div>
                            <h2 className="text-lg font-playfair font-black text-bakery-primary">Checkout Rules</h2>
                            <p className="text-xs text-bakery-primary/60 font-bold uppercase tracking-wider">Delivery & minimums</p>
                        </div>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-bakery-primary uppercase tracking-widest">Base Delivery Fee (£)</label>
                            <input type="number" step="0.01" value={form.delivery_fee} onChange={e => setForm({ ...form, delivery_fee: Number(e.target.value) })} className="w-full px-4 py-3 bg-bakery-primary/5 rounded-xl border-none focus:ring-2 focus:ring-bakery-cta outline-none text-bakery-primary font-bold" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-bakery-primary uppercase tracking-widest">Free Delivery At (£)</label>
                            <input type="number" step="0.01" value={form.free_delivery_threshold} onChange={e => setForm({ ...form, free_delivery_threshold: Number(e.target.value) })} className="w-full px-4 py-3 bg-bakery-primary/5 rounded-xl border-none focus:ring-2 focus:ring-bakery-cta outline-none text-bakery-primary font-bold" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-bakery-primary uppercase tracking-widest">Minimum Order (£)</label>
                            <input type="number" step="0.01" value={form.min_order_amount} onChange={e => setForm({ ...form, min_order_amount: Number(e.target.value) })} className="w-full px-4 py-3 bg-bakery-primary/5 rounded-xl border-none focus:ring-2 focus:ring-bakery-cta outline-none text-bakery-primary font-bold" />
                        </div>
                    </div>
                </div>

                {/* Referrals */}
                <div className="bg-white rounded-3xl border border-bakery-primary/10 overflow-hidden">
                    <div className="p-6 border-b border-bakery-primary/5 bg-bakery-primary/[0.02] flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-green-600"><Percent size={20} /></div>
                        <div>
                            <h2 className="text-lg font-playfair font-black text-bakery-primary">Referral Program</h2>
                            <p className="text-xs text-bakery-primary/60 font-bold uppercase tracking-wider">Affiliate commissions</p>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="max-w-md space-y-2">
                            <label className="text-xs font-black text-bakery-primary uppercase tracking-widest">Affiliate Commission (%)</label>
                            <input type="number" step="1" max="100" min="0" value={form.referral_commission_percent} onChange={e => setForm({ ...form, referral_commission_percent: Number(e.target.value) })} className="w-full px-4 py-3 bg-bakery-primary/5 rounded-xl border-none focus:ring-2 focus:ring-bakery-cta outline-none text-bakery-primary font-bold" />
                            <p className="text-xs text-bakery-primary/50 font-medium pt-1">This percentage of the order total is added to the referrer's store credit upon delivery.</p>
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="bg-white rounded-3xl border border-bakery-primary/10 overflow-hidden">
                    <div className="p-6 border-b border-bakery-primary/5 bg-bakery-primary/[0.02] flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600"><Bell size={20} /></div>
                        <div>
                            <h2 className="text-lg font-playfair font-black text-bakery-primary">Notifications</h2>
                            <p className="text-xs text-bakery-primary/60 font-bold uppercase tracking-wider">Where to reach you</p>
                        </div>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="max-w-md space-y-2">
                            <label className="text-xs font-black text-bakery-primary uppercase tracking-widest">Admin WhatsApp Number</label>
                            <input type="text" placeholder="e.g. +447700900000" value={form.admin_whatsapp_number} onChange={e => setForm({ ...form, admin_whatsapp_number: e.target.value })} className="w-full px-4 py-3 bg-bakery-primary/5 rounded-xl border-none focus:ring-2 focus:ring-bakery-cta outline-none text-bakery-primary font-bold" />
                            <p className="text-xs text-bakery-primary/50 font-medium pt-1">Where direct message checkout orders will be sent.</p>
                        </div>

                        <div className="space-y-4">
                            <label className="flex items-center gap-3 p-4 rounded-xl border border-bakery-primary/10 cursor-pointer hover:bg-bakery-primary/[0.02] transition-colors max-w-xl">
                                <input type="checkbox" checked={form.order_alerts_enabled} onChange={e => setForm({ ...form, order_alerts_enabled: e.target.checked })} className="w-5 h-5 rounded text-bakery-cta focus:ring-bakery-cta bg-bakery-primary/5 border-transparent" />
                                <div className="flex-1">
                                    <p className="font-bold text-bakery-primary text-sm">New Order Email Alerts</p>
                                    <p className="text-xs text-bakery-primary/60">Receive an email when a new order is placed.</p>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 p-4 rounded-xl border border-bakery-primary/10 cursor-pointer hover:bg-bakery-primary/[0.02] transition-colors max-w-xl">
                                <input type="checkbox" checked={form.review_alerts_enabled} onChange={e => setForm({ ...form, review_alerts_enabled: e.target.checked })} className="w-5 h-5 rounded text-bakery-cta focus:ring-bakery-cta bg-bakery-primary/5 border-transparent" />
                                <div className="flex-1">
                                    <p className="font-bold text-bakery-primary text-sm">New Review Email Alerts</p>
                                    <p className="text-xs text-bakery-primary/60">Receive an email when a customer leaves a review.</p>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4 pb-12">
                    <button type="submit" disabled={saveMutation.isPending} className="bg-bakery-cta text-white px-8 py-4 rounded-xl font-black text-sm hover:bg-orange-600 transition-all flex items-center justify-center gap-2 whitespace-nowrap shadow-xl shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-0.5 w-full sm:w-auto min-w-[200px]">
                        {saveMutation.isPending ? <Loader2 size={20} className="animate-spin" /> : <><Save size={20} /> Save All Settings</>}
                    </button>
                </div>
            </form>

            {/* Admins List */}
            <div className="bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200 flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-700"><ShieldCheck size={20} /></div>
                    <div>
                        <h2 className="text-lg font-playfair font-black text-slate-800">Authorized Administrators</h2>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Users with CMS access</p>
                    </div>
                </div>
                <div className="divide-y divide-slate-200">
                    {data?.admins?.map((admin) => (
                        <div key={admin.id} className="p-4 px-6 flex items-center justify-between">
                            <div>
                                <p className="font-bold text-sm text-slate-800">{admin.full_name}</p>
                                <p className="text-xs text-slate-500">{admin.email}</p>
                            </div>
                            <span className="bg-slate-200 text-slate-700 text-xs px-3 py-1 rounded-full font-black uppercase tracking-wider">Admin</span>
                        </div>
                    ))}
                    {data?.admins?.length === 0 && <p className="p-6 text-slate-500 text-sm font-bold">No admins found.</p>}
                </div>
            </div>
        </div>
    );
}
