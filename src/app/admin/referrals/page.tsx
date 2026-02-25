"use client";

import * as React from "react";
import { createBrowserClient } from "@supabase/auth-helpers-nextjs";
import { Users, TrendingUp, DollarSign, Award } from "lucide-react";

type Referral = {
    id: string;
    referrer_id: string;
    referred_id: string;
    status: string;
    commission_earned: number | null;
    commission_rate: number | null;
    created_at: string;
    referrer: { full_name: string; email: string; is_affiliate: boolean } | null;
    referred: { full_name: string; email: string } | null;
};

const STATUS_COLORS: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    credited: "bg-green-100 text-green-700",
    expired: "bg-red-100 text-red-600",
};

export default function AdminReferralsPage() {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const [referrals, setReferrals] = React.useState<Referral[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [filter, setFilter] = React.useState<"all" | "pending" | "credited">("all");

    React.useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            const { data } = await supabase
                .from("referrals")
                .select("*, referrer:profiles!referrer_id(full_name, email, is_affiliate), referred:profiles!referred_id(full_name, email)")
                .order("created_at", { ascending: false });
            setReferrals((data as Referral[]) ?? []);
            setLoading(false);
        };
        fetch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filtered = filter === "all" ? referrals : referrals.filter((r) => r.status === filter);
    const totalCommissions = referrals.filter((r) => r.status === "credited").reduce((s, r) => s + (r.commission_earned ?? 0), 0);
    const pendingCount = referrals.filter((r) => r.status === "pending").length;
    const affiliateCount = referrals.filter((r) => r.referrer?.is_affiliate).length;

    return (
        <div className="min-h-screen bg-[#FDF6F0] p-6 space-y-6">
            <h1 className="text-3xl font-playfair font-black text-bakery-primary">Referrals & Affiliates</h1>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { icon: <Users size={20} />, label: "Total Referrals", value: referrals.length },
                    { icon: <TrendingUp size={20} />, label: "Pending", value: pendingCount },
                    { icon: <DollarSign size={20} />, label: "Commissions Paid", value: `£${totalCommissions.toFixed(2)}` },
                    { icon: <Award size={20} />, label: "Affiliates", value: affiliateCount },
                ].map((s) => (
                    <div key={s.label} className="bg-white rounded-2xl p-5 border border-bakery-primary/10 space-y-2">
                        <div className="text-bakery-cta">{s.icon}</div>
                        <div className="text-2xl font-playfair font-black text-bakery-primary">{s.value}</div>
                        <div className="text-xs text-bakery-primary/40 font-black uppercase tracking-widest">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Filter tabs */}
            <div className="flex bg-white border border-bakery-primary/10 rounded-2xl p-1 w-fit">
                {(["all", "pending", "credited"] as const).map((t) => (
                    <button
                        key={t}
                        onClick={() => setFilter(t)}
                        className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === t ? "bg-bakery-cta text-white" : "text-bakery-primary/40 hover:text-bakery-primary"}`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-bakery-primary/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="border-b border-bakery-primary/10">
                            <tr>
                                {["Referrer", "Referred", "Type", "Status", "Commission", "Date"].map((h) => (
                                    <th key={h} className="text-left px-5 py-4 text-xs font-black uppercase tracking-widest text-bakery-primary/40">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-bakery-primary/5">
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-10 text-bakery-primary/30">Loading…</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-10 text-bakery-primary/30">No referrals found</td></tr>
                            ) : filtered.map((r) => (
                                <tr key={r.id} className="hover:bg-bakery-primary/[0.02]">
                                    <td className="px-5 py-4">
                                        <div className="font-bold">{r.referrer?.full_name ?? "—"}</div>
                                        <div className="text-xs text-bakery-primary/40">{r.referrer?.email}</div>
                                        {r.referrer?.is_affiliate && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">Affiliate</span>}
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="font-bold">{r.referred?.full_name ?? "—"}</div>
                                        <div className="text-xs text-bakery-primary/40">{r.referred?.email}</div>
                                    </td>
                                    <td className="px-5 py-4 font-bold text-bakery-primary/60">
                                        {r.referrer?.is_affiliate ? "Affiliate" : "Referral"}
                                        {r.commission_rate && <span className="ml-1 text-xs text-bakery-cta">({r.commission_rate}%)</span>}
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-black ${STATUS_COLORS[r.status] ?? "bg-gray-100 text-gray-600"}`}>
                                            {r.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 font-black text-bakery-cta">
                                        {r.commission_earned ? `£${r.commission_earned.toFixed(2)}` : "—"}
                                    </td>
                                    <td className="px-5 py-4 text-bakery-primary/40 font-bold">
                                        {new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
