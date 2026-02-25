"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Copy, Check, Users, Gift } from "lucide-react";
import toast from "react-hot-toast";

interface Profile {
    id: string;
    referral_code?: string;
    store_credit: number;
    is_affiliate?: boolean;
    commission_rate?: number;
}

interface ReferralHistoryItem {
    id: string;
    created_at: string;
    status: string;
    commission_earned: number;
    referred?: {
        email: string;
    };
}

export default function CustomerReferralDashboard() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [stats, setStats] = useState({ clicks: 0, signups: 0, conversions: 0 });
    const [history, setHistory] = useState<ReferralHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    // Affiliate Modal
    const [showAffiliateModal, setShowAffiliateModal] = useState(false);
    const [affiliateForm, setAffiliateForm] = useState({ reason: '', ig: '', tiktok: '', reach: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Fetch profile for code & store credit
            let { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();

            // Generate code if none exists
            if (prof && !prof.referral_code) {
                const code = Array.from(Array(8), () => Math.floor(Math.random() * 36).toString(36)).join('').toUpperCase();
                const { data: updated } = await supabase.from('profiles').update({ referral_code: code }).eq('id', user.id).select().single();
                prof = updated;
            }
            setProfile(prof);

            // 2. Fetch referrals history
            const { data } = await supabase
                .from('referrals')
                .select('*, referred:auth.users(email)')
                .eq('referrer_id', user.id)
                .order('created_at', { ascending: false });

            const refs = data as ReferralHistoryItem[] | null;

            if (refs) {
                setHistory(refs);
                setStats({
                    clicks: 0, // Would need page view tracking for exact clicks
                    signups: refs.length,
                    conversions: refs.filter(r => r.status === 'credited').length
                });
            }

        } catch (error) {
            console.error("Error fetching referral data:", error);
        } finally {
            setLoading(false);
        }
    };

    const referralLink = typeof window !== 'undefined' && profile?.referral_code
        ? `${window.location.origin}/ref/${profile.referral_code}`
        : '';

    const copyLink = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        toast.success("Link copied!");
        setTimeout(() => setCopied(false), 2000);
    };

    const submitAffiliateApp = async () => {
        if (!profile) return;
        try {
            const { error } = await supabase.from('affiliate_applications').insert({
                user_id: profile.id,
                reason: affiliateForm.reason,
                instagram_handle: affiliateForm.ig,
                tiktok_handle: affiliateForm.tiktok,
                monthly_reach: affiliateForm.reach
            });
            if (error) throw error;
            toast.success("Application submitted! We'll review it soon.");
            setShowAffiliateModal(false);
        } catch (error: unknown) {
            toast.error((error as Error).message);
        }
    };

    if (loading) return <div className="p-8 text-center animate-pulse">Loading dashboard...</div>;

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
            <h1 className="text-3xl font-serif text-gray-900">Refer a Friend, Get £5</h1>

            {/* Store Credit Banner */}
            <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white p-8 rounded-3xl shadow-lg relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <p className="text-white/80 font-medium uppercase tracking-wider text-sm mb-1">Available Store Credit</p>
                        <p className="text-5xl font-bold font-serif leading-none">£{(profile?.store_credit || 0).toFixed(2)}</p>
                    </div>
                    {profile?.is_affiliate ? (
                        <div className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-md">
                            🔥 Active Affiliate • {profile.commission_rate}% Commission Tier
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowAffiliateModal(true)}
                            className="bg-white text-orange-600 px-6 py-3 rounded-xl font-bold hover:bg-orange-50 transition-colors"
                        >
                            Become an Affiliate
                        </button>
                    )}
                </div>
                <div className="absolute -right-10 -bottom-10 opacity-20"><Gift size={200} /></div>
            </div>

            {/* Your Link Section */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-4">
                <div className="flex-1 w-full">
                    <label className="text-sm font-semibold text-gray-700 block mb-2">Your Unique Referral Link</label>
                    <div className="flex border border-gray-200 rounded-xl overflow-hidden bg-gray-50 focus-within:ring-2 focus-within:ring-orange-500 transition-all">
                        <input
                            type="text"
                            readOnly
                            value={referralLink}
                            className="flex-1 bg-transparent p-4 outline-none text-gray-700 font-mono text-sm"
                        />
                        <button
                            onClick={copyLink}
                            className="px-6 bg-bakery-cta text-white font-medium flex items-center gap-2 hover:bg-orange-600 transition-colors"
                        >
                            {copied ? <Check size={18} /> : <Copy size={18} />}
                            {copied ? 'Copied' : 'Copy'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{stats.signups}</p>
                        <p className="text-sm text-gray-500 font-medium">Friends Signed Up</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                        <Check size={24} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{stats.conversions}</p>
                        <p className="text-sm text-gray-500 font-medium">Successful Orders (Credits Earned)</p>
                    </div>
                </div>
            </div>

            {/* History Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 font-serif">Referral History</h3>
                </div>
                {history.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">
                        No referrals yet. Share your link to get started!
                    </div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-medium">
                            <tr>
                                <th className="p-4 pl-6">Friend</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 pr-6 text-right">Reward</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {history.map((h, i) => (
                                <tr key={i} className="hover:bg-gray-50">
                                    <td className="p-4 pl-6 font-medium text-gray-900">{h.referred?.email || 'Unknown User'}</td>
                                    <td className="p-4 text-gray-500">{new Date(h.created_at).toLocaleDateString()}</td>
                                    <td className="p-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${h.status === 'credited' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            {h.status}
                                        </span>
                                    </td>
                                    <td className="p-4 pr-6 text-right font-bold text-gray-900">
                                        +£{h.commission_earned.toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Affiliate Modal */}
            {showAffiliateModal && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full p-8 relative">
                        <button onClick={() => setShowAffiliateModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900">
                            <X size={24} />
                        </button>
                        <h2 className="text-2xl font-bold font-serif mb-2">Become an Affiliate</h2>
                        <p className="text-gray-600 text-sm mb-6">Unlock higher commission tiers (up to 15%) and dedicated support by applying for our creator affiliate program.</p>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-700 mb-1 block">Why do you want to partner with us?</label>
                                <textarea
                                    value={affiliateForm.reason} onChange={e => setAffiliateForm({ ...affiliateForm, reason: e.target.value })}
                                    className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-bakery-cta"
                                    rows={3} required
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-xs font-semibold text-gray-700 mb-1 block">IG Handle</label>
                                    <input type="text" value={affiliateForm.ig} onChange={e => setAffiliateForm({ ...affiliateForm, ig: e.target.value })} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-bakery-cta" />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs font-semibold text-gray-700 mb-1 block">TikTok Handle</label>
                                    <input type="text" value={affiliateForm.tiktok} onChange={e => setAffiliateForm({ ...affiliateForm, tiktok: e.target.value })} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-bakery-cta" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-700 mb-1 block">Estimated Monthly Reach</label>
                                <select value={affiliateForm.reach} onChange={e => setAffiliateForm({ ...affiliateForm, reach: e.target.value })} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-bakery-cta">
                                    <option value="">Select an option</option>
                                    <option value="< 10k">Under 10,000</option>
                                    <option value="10k - 50k">10,000 - 50,000</option>
                                    <option value="50k+">50,000+</option>
                                </select>
                            </div>
                            <button onClick={submitAffiliateApp} className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors mt-2">
                                Submit Application
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Ensure X icon comes from lucide-react (Added explicit import below the main one)
import { X } from "lucide-react";
