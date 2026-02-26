"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Settings as SettingsIcon, Bell, Truck, Percent, Save, ShieldCheck,
    Loader2, Store, MapPin, Mail, Phone, Clock, Share2, Rocket,
    CheckCircle2, AlertCircle, Info, ExternalLink, Power
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import toast from "react-hot-toast";

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
        store_name: string;
        store_address: string;
        contact_email: string;
        contact_phone: string;
        opening_hours: Record<string, string>;
        social_links: Record<string, string>;
        is_live: boolean;
    };
    admins: Array<{ id: string; full_name: string; email: string }>;
}

interface ReadinessData {
    score: number;
    checks: Array<{
        id: string;
        label: string;
        status: "complete" | "warning" | "missing";
        message: string;
    }>;
    isLive: boolean;
}

export default function AdminSettings() {
    const queryClient = useQueryClient();
    const [form, setForm] = useState<Partial<SettingsData["settings"]>>({});

    const { data, isLoading } = useQuery<SettingsData>({
        queryKey: ["admin-settings"],
        queryFn: async () => {
            const res = await fetch("/api/admin/settings");
            if (!res.ok) throw new Error("Failed to fetch settings");
            return res.json();
        }
    });

    const { data: readiness, isLoading: isLoadingReadiness, refetch: refetchReadiness } = useQuery<ReadinessData>({
        queryKey: ["admin-readiness"],
        queryFn: async () => {
            const res = await fetch("/api/admin/readiness");
            if (!res.ok) throw new Error("Failed to fetch readiness");
            return res.json();
        }
    });

    useEffect(() => {
        if (data?.settings) {
            setForm(data.settings);
        }
    }, [data]);

    const saveMutation = useMutation({
        mutationFn: async (payload: Partial<SettingsData["settings"]>) => {
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
            refetchReadiness();
            toast.success("Settings updated successfully");
        },
        onError: (err: any) => toast.error(err.message || "Failed to save settings")
    });

    const handleSave = () => {
        saveMutation.mutate(form);
    };

    if (isLoading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-bakery-cta animate-spin" />
        </div>
    );

    const score = readiness?.score || 0;
    const scoreColor = score >= 90 ? "text-green-500" : score >= 50 ? "text-amber-500" : "text-red-500";

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-[1200px] mx-auto pb-24">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-bakery-primary text-white rounded-2xl shadow-xl">
                            <SettingsIcon size={24} />
                        </div>
                        <h1 className="text-4xl font-playfair font-black text-bakery-primary tracking-tight">Settings & Readiness</h1>
                    </div>
                    <p className="text-bakery-primary/60 font-medium">Configure your business profile and track your launch progress.</p>
                </div>

                <div className="flex bg-white rounded-2xl p-2 luxury-shadow border border-bakery-primary/5 items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-bakery-primary/5 rounded-xl">
                        <div className={cn("w-2 h-2 rounded-full", form.is_live ? "bg-green-500 animate-pulse" : "bg-red-500")} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-bakery-primary">
                            {form.is_live ? "Site is Live" : "Site is Maintenance"}
                        </span>
                    </div>
                    <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={saveMutation.isPending}
                        className="rounded-xl"
                    >
                        {saveMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} className="mr-2" />}
                        Save Changes
                    </Button>
                </div>
            </div>

            {/* Launch Readiness Score */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-[40px] p-8 luxury-shadow border border-bakery-primary/5 text-center relative overflow-hidden group h-full">
                        <div className="absolute top-0 right-0 p-4">
                            <Rocket size={40} className="text-bakery-primary/5 -rotate-12 group-hover:rotate-0 transition-transform duration-500" />
                        </div>

                        <p className="text-[10px] font-black uppercase tracking-widest text-bakery-primary/40 mb-6 font-primary">Launch Readiness</p>

                        <div className="relative inline-flex items-center justify-center mb-6">
                            <svg className="w-32 h-32">
                                <circle
                                    className="text-bakery-primary/5"
                                    strokeWidth="8"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="58"
                                    cx="64"
                                    cy="64"
                                />
                                <circle
                                    className={cn("transition-all duration-1000 ease-out",
                                        score >= 90 ? "text-green-500" : score >= 50 ? "text-amber-500" : "text-red-500"
                                    )}
                                    strokeWidth="8"
                                    strokeDasharray={364.4}
                                    strokeDashoffset={364.4 - (364.4 * score) / 100}
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="58"
                                    cx="64"
                                    cy="64"
                                />
                            </svg>
                            <span className={cn("absolute text-4xl font-playfair font-black", scoreColor)}>
                                {score}%
                            </span>
                        </div>

                        <div className="space-y-4 text-left">
                            {readiness?.checks.map((check) => (
                                <div key={check.id} className="flex gap-3 items-start">
                                    {check.status === "complete" ? (
                                        <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" />
                                    ) : check.status === "warning" ? (
                                        <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                                    ) : (
                                        <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
                                    )}
                                    <div>
                                        <p className="text-xs font-black text-bakery-primary uppercase tracking-tight">{check.label}</p>
                                        <p className="text-[10px] text-bakery-primary/60 font-medium leading-tight">{check.message}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-8">
                    {/* Business Profile */}
                    <div className="bg-white rounded-[40px] luxury-shadow border border-bakery-primary/5 overflow-hidden">
                        <div className="p-8 border-b border-bakery-primary/5 bg-bakery-background/30 flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-2xl luxury-shadow flex items-center justify-center text-bakery-primary">
                                <Store size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-playfair font-black text-bakery-primary">Business Profile</h2>
                                <p className="text-xs text-bakery-primary/40 font-bold uppercase tracking-widest mt-1">General Store Information</p>
                            </div>
                        </div>

                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-bakery-primary/40 flex items-center gap-2">
                                    <Store size={12} /> Store Name
                                </label>
                                <input
                                    type="text"
                                    value={form.store_name || ""}
                                    onChange={e => setForm({ ...form, store_name: e.target.value })}
                                    className="w-full px-4 py-3 bg-bakery-primary/5 rounded-xl border-none focus:ring-2 focus:ring-bakery-cta outline-none text-sm font-bold text-bakery-primary"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-bakery-primary/40 flex items-center gap-2">
                                    <Mail size={12} /> Public Contact Email
                                </label>
                                <input
                                    type="email"
                                    value={form.contact_email || ""}
                                    onChange={e => setForm({ ...form, contact_email: e.target.value })}
                                    className="w-full px-4 py-3 bg-bakery-primary/5 rounded-xl border-none focus:ring-2 focus:ring-bakery-cta outline-none text-sm font-bold text-bakery-primary"
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-bakery-primary/40 flex items-center gap-2">
                                    <MapPin size={12} /> Physical Address (or Kitchen Location)
                                </label>
                                <textarea
                                    value={form.store_address || ""}
                                    onChange={e => setForm({ ...form, store_address: e.target.value })}
                                    className="w-full px-4 py-3 bg-bakery-primary/5 rounded-xl border-none focus:ring-2 focus:ring-bakery-cta outline-none text-sm font-bold text-bakery-primary min-h-[100px]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Operational Settings */}
                    <div className="bg-white rounded-[40px] luxury-shadow border border-bakery-primary/5 overflow-hidden">
                        <div className="p-8 border-b border-bakery-primary/5 bg-bakery-background/30 flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-2xl luxury-shadow flex items-center justify-center text-bakery-primary">
                                <Truck size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-playfair font-black text-bakery-primary">Checkout Rules</h2>
                                <p className="text-xs text-bakery-primary/40 font-bold uppercase tracking-widest mt-1">Delivery & Commissions</p>
                            </div>
                        </div>

                        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-bakery-primary/40">Base Delivery Fee (£)</label>
                                <input type="number" step="0.01" value={form.delivery_fee || 0} onChange={e => setForm({ ...form, delivery_fee: Number(e.target.value) })} className="w-full px-4 py-3 bg-bakery-primary/5 rounded-xl border-none focus:ring-2 focus:ring-bakery-cta outline-none text-sm font-bold" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-bakery-primary/40">Free Delivery Threshold (£)</label>
                                <input type="number" step="0.01" value={form.free_delivery_threshold || 0} onChange={e => setForm({ ...form, free_delivery_threshold: Number(e.target.value) })} className="w-full px-4 py-3 bg-bakery-primary/5 rounded-xl border-none focus:ring-2 focus:ring-bakery-cta outline-none text-sm font-bold" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-bakery-primary/40">Min. Order Amount (£)</label>
                                <input type="number" step="0.01" value={form.min_order_amount || 0} onChange={e => setForm({ ...form, min_order_amount: Number(e.target.value) })} className="w-full px-4 py-3 bg-bakery-primary/5 rounded-xl border-none focus:ring-2 focus:ring-bakery-cta outline-none text-sm font-bold" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Socials & Hours Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Social Links */}
                <div className="bg-white rounded-[40px] luxury-shadow border border-bakery-primary/5 overflow-hidden">
                    <div className="p-8 border-b border-bakery-primary/5 bg-bakery-background/30 flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl luxury-shadow flex items-center justify-center text-bakery-primary">
                            <Share2 size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-playfair font-black text-bakery-primary">Social Links</h2>
                            <p className="text-xs text-bakery-primary/40 font-bold uppercase tracking-widest mt-1">Connect with customers</p>
                        </div>
                    </div>
                    <div className="p-8 space-y-6">
                        {["instagram", "facebook", "twitter"].map((platform) => (
                            <div key={platform} className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-bakery-primary/40 capitalize">{platform} Handle</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-bakery-primary/30 text-xs font-bold">@</div>
                                    <input
                                        type="text"
                                        value={form.social_links?.[platform] || ""}
                                        onChange={e => setForm({
                                            ...form,
                                            social_links: { ...form.social_links, [platform]: e.target.value }
                                        })}
                                        className="w-full pl-8 pr-4 py-3 bg-bakery-primary/5 rounded-xl border-none focus:ring-2 focus:ring-bakery-cta outline-none text-sm font-bold"
                                        placeholder={`username`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Opening Hours */}
                <div className="bg-white rounded-[40px] luxury-shadow border border-bakery-primary/5 overflow-hidden">
                    <div className="p-8 border-b border-bakery-primary/5 bg-bakery-background/30 flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl luxury-shadow flex items-center justify-center text-bakery-primary">
                            <Clock size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-playfair font-black text-bakery-primary">Opening Hours</h2>
                            <p className="text-xs text-bakery-primary/40 font-bold uppercase tracking-widest mt-1">When we're open for orders</p>
                        </div>
                    </div>
                    <div className="p-8 space-y-4">
                        {["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((day) => (
                            <div key={day} className="flex items-center gap-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-bakery-primary/40 w-12">{day}</label>
                                <input
                                    type="text"
                                    value={form.opening_hours?.[day] || ""}
                                    onChange={e => setForm({
                                        ...form,
                                        opening_hours: { ...form.opening_hours, [day]: e.target.value }
                                    })}
                                    className="flex-1 px-4 py-2 bg-bakery-primary/5 rounded-xl border-none focus:ring-2 focus:ring-bakery-cta outline-none text-xs font-bold"
                                    placeholder="e.g. 9am - 6pm"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Notification Preferences & Advanced */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Internal Alerts */}
                <div className="bg-white rounded-[40px] luxury-shadow border border-bakery-primary/5 overflow-hidden">
                    <div className="p-8 border-b border-bakery-primary/5 bg-bakery-background/30 flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl luxury-shadow flex items-center justify-center text-bakery-primary">
                            <Bell size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-playfair font-black text-bakery-primary">System Alerts</h2>
                            <p className="text-xs text-bakery-primary/40 font-bold uppercase tracking-widest mt-1">Internal notifications</p>
                        </div>
                    </div>
                    <div className="p-8 space-y-4">
                        <label className="flex items-center gap-4 p-4 rounded-2xl border border-bakery-primary/5 cursor-pointer hover:bg-bakery-primary/5 transition-colors group">
                            <input
                                type="checkbox"
                                checked={form.order_alerts_enabled}
                                onChange={e => setForm({ ...form, order_alerts_enabled: e.target.checked })}
                                className="w-6 h-6 rounded-lg text-bakery-cta focus:ring-bakery-cta border-bakery-primary/10"
                            />
                            <div className="flex-1">
                                <p className="text-sm font-black text-bakery-primary tracking-tight">Email Order Alerts</p>
                                <p className="text-[10px] text-bakery-primary/50 font-medium">Get notified via email for every new order.</p>
                            </div>
                        </label>

                        <label className="flex items-center gap-4 p-4 rounded-2xl border border-bakery-primary/5 cursor-pointer hover:bg-bakery-primary/5 transition-colors group">
                            <input
                                type="checkbox"
                                checked={form.review_alerts_enabled}
                                onChange={e => setForm({ ...form, review_alerts_enabled: e.target.checked })}
                                className="w-6 h-6 rounded-lg text-bakery-cta focus:ring-bakery-cta border-bakery-primary/10"
                            />
                            <div className="flex-1">
                                <p className="text-sm font-black text-bakery-primary tracking-tight">Review Alerts</p>
                                <p className="text-[10px] text-bakery-primary/50 font-medium">Get notified when customers leave feedback.</p>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Maintenance / Go Live */}
                <div className="bg-white rounded-[40px] luxury-shadow border border-bakery-primary/5 overflow-hidden">
                    <div className="p-8 border-b border-bakery-primary/5 bg-bakery-primary/[0.02] flex items-center gap-4">
                        <div className={cn("w-12 h-12 bg-white rounded-2xl luxury-shadow flex items-center justify-center", form.is_live ? "text-green-500" : "text-red-500")}>
                            <Power size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-playfair font-black text-bakery-primary">Store Status</h2>
                            <p className="text-xs text-bakery-primary/40 font-bold uppercase tracking-widest mt-1">Control public access</p>
                        </div>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className={cn("p-6 rounded-3xl border transition-all", form.is_live ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100")}>
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <p className={cn("text-lg font-playfair font-black", form.is_live ? "text-green-900" : "text-red-900")}>
                                        {form.is_live ? "Your store is currently LIVE" : "Your store is in MAINTENANCE"}
                                    </p>
                                    <p className={cn("text-xs font-medium", form.is_live ? "text-green-700" : "text-red-700")}>
                                        {form.is_live ? "Customers can browse and place orders." : "Only admins can access the storefront."}
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.is_live}
                                        onChange={e => {
                                            if (score < 100 && e.target.checked) {
                                                toast.error("Finish readiness checklist before going live!");
                                                return;
                                            }
                                            setForm({ ...form, is_live: e.target.checked });
                                        }}
                                        className="sr-only peer"
                                    />
                                    <div className="w-14 h-8 bg-bakery-primary/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500"></div>
                                </label>
                            </div>
                            {score < 100 && !form.is_live && (
                                <div className="flex items-center gap-2 p-3 bg-red-100 rounded-xl text-[10px] font-black text-red-700 uppercase tracking-widest">
                                    <AlertCircle size={14} />
                                    Readiness score must be 100% to enable Live Mode
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Notice */}
            <div className="bg-bakery-primary rounded-[32px] p-8 text-white luxury-shadow flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center border border-white/10">
                        <ShieldCheck size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-playfair font-black">Ready to scale?</h3>
                        <p className="text-white/60 text-sm font-medium">All settings are synchronized across Nigerian and UK delivery zones.</p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white hover:text-bakery-primary px-8 rounded-2xl"
                    onClick={handleSave}
                >
                    Finalize & Sync Changes
                </Button>
            </div>
        </div>
    );
}
