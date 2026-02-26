"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Shield, ShieldAlert, ShieldCheck, Activity, Globe, Terminal, UserX, AlertTriangle, RefreshCw, Clock, Search, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

interface SecurityEvent {
    id: string;
    event_type: string;
    severity: "info" | "warning" | "high" | "critical";
    description: string;
    ip_address: string;
    user_agent: string;
    metadata: any;
    created_at: string;
}

export default function AdminSecurity() {
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");

    const { data, isLoading, refetch, isFetching } = useQuery<{ events: SecurityEvent[], stats: any }>({
        queryKey: ["admin-security"],
        queryFn: async () => {
            const res = await fetch("/api/admin/security");
            if (!res.ok) throw new Error("Failed to fetch security events");
            return res.json();
        },
        refetchInterval: 30000 // Refresh every 30s
    });

    const filteredEvents = data?.events.filter(e => {
        const matchesFilter = filter === "all" || e.event_type === filter;
        const matchesSearch = e.description.toLowerCase().includes(search.toLowerCase()) || e.ip_address.includes(search);
        return matchesFilter && matchesSearch;
    }) || [];

    const getSeverityColor = (sev: string) => {
        switch (sev) {
            case "critical": return "bg-red-500 text-white";
            case "high": return "bg-orange-500 text-white";
            case "warning": return "bg-amber-500 text-white";
            default: return "bg-blue-500 text-white";
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "bot_detection": return <UserX size={18} className="text-red-500" />;
            case "review_moderation": return <Terminal size={18} className="text-blue-500" />;
            default: return <Activity size={18} className="text-bakery-primary/40" />;
        }
    };

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto pb-24">
            <div className="flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-bakery-primary text-white rounded-2xl luxury-shadow">
                            <Shield size={24} />
                        </div>
                        <h1 className="text-4xl font-playfair font-black text-bakery-primary tracking-tight">Security Dashboard</h1>
                    </div>
                    <p className="text-bakery-primary/60 font-medium">Real-time threat detection and security event monitoring.</p>
                </div>
                <button
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="flex items-center gap-2 px-4 py-2 bg-bakery-primary/5 rounded-xl text-sm font-bold text-bakery-primary hover:bg-bakery-primary/10 transition-colors"
                >
                    <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
                    Refresh
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-[40px] p-8 luxury-shadow border border-bakery-primary/5 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 text-bakery-primary/5 group-hover:scale-110 transition-transform duration-500">
                        <ShieldAlert size={120} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-bakery-primary/40 mb-1">Bots Blocked (24h)</p>
                    <div className="flex items-end gap-3">
                        <span className="text-5xl font-playfair font-black text-red-600 leading-none">{data?.stats.bots_24h || 0}</span>
                        <div className="px-2 py-1 rounded-lg bg-red-50 text-red-600 text-[10px] font-black mb-1">LIVE</div>
                    </div>
                </div>

                <div className="bg-white rounded-[40px] p-8 luxury-shadow border border-bakery-primary/5 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 text-bakery-primary/5 group-hover:scale-110 transition-transform duration-500">
                        <Activity size={120} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-bakery-primary/40 mb-1">Security Events (24h)</p>
                    <div className="flex items-end gap-3">
                        <span className="text-5xl font-playfair font-black text-bakery-primary leading-none">{data?.stats.total_events_24h || 0}</span>
                    </div>
                </div>

                <div className="bg-white rounded-[40px] p-8 luxury-shadow border border-bakery-primary/5 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 text-bakery-primary/5 group-hover:scale-110 transition-transform duration-500">
                        <ShieldCheck size={120} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-bakery-primary/40 mb-1">System Status</p>
                    <div className="flex items-center gap-2 text-green-600">
                        <div className="w-3 h-3 bg-current rounded-full animate-pulse" />
                        <span className="text-2xl font-playfair font-black uppercase tracking-tight">Protected</span>
                    </div>
                </div>
            </div>

            {/* Live Feed */}
            <div className="bg-white rounded-[40px] luxury-shadow border border-bakery-primary/5 overflow-hidden">
                <div className="p-8 border-b border-bakery-primary/5 flex flex-col md:flex-row justify-between gap-6 bg-bakery-background/30">
                    <div>
                        <h2 className="text-xl font-playfair font-black text-bakery-primary">Live Security Feed</h2>
                        <p className="text-xs text-bakery-primary/40 font-bold uppercase tracking-widest mt-1">Updates every 30 seconds</p>
                    </div>

                    <div className="flex gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-bakery-primary/30" size={16} />
                            <input
                                type="text"
                                placeholder="Search IP or event..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-white rounded-xl border border-bakery-primary/10 text-xs font-bold focus:ring-2 focus:ring-bakery-cta outline-none w-[240px]"
                            />
                        </div>
                        <div className="flex bg-white rounded-xl p-1 border border-bakery-primary/10">
                            {["all", "bot_detection", "review_moderation"].map(t => (
                                <button
                                    key={t}
                                    onClick={() => setFilter(t)}
                                    className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-tighter transition-all ${filter === t ? "bg-bakery-primary text-white" : "text-bakery-primary/40 hover:bg-bakery-primary/5"}`}
                                >
                                    {t.replace("_", " ")}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-bakery-primary/5 text-[10px] uppercase tracking-widest text-bakery-primary/40 font-black">
                                <th className="p-6">Event</th>
                                <th className="p-6">Description</th>
                                <th className="p-6">Source IP</th>
                                <th className="p-6">Severity</th>
                                <th className="p-6 text-right">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-bakery-primary/5">
                            <AnimatePresence mode="popLayout">
                                {isLoading ? (
                                    <tr><td colSpan={5} className="p-12 text-center"><RefreshCw className="animate-spin mx-auto text-bakery-primary/20" /></td></tr>
                                ) : filteredEvents.length === 0 ? (
                                    <tr><td colSpan={5} className="p-12 text-center text-bakery-primary/30 font-bold">No events recorded</td></tr>
                                ) : (
                                    filteredEvents.map((event) => (
                                        <motion.tr
                                            key={event.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="hover:bg-bakery-primary/[0.01] group transition-colors"
                                        >
                                            <td className="p-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-bakery-primary/5 shrink-0">
                                                        {getIcon(event.event_type)}
                                                    </div>
                                                    <span className="text-xs font-black uppercase tracking-tight text-bakery-primary">{event.event_type.replace("_", " ")}</span>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <p className="text-xs font-medium text-bakery-primary/70 line-clamp-1">{event.description}</p>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex items-center gap-2">
                                                    <Globe size={14} className="text-bakery-primary/20" />
                                                    <span className="text-xs font-mono font-bold text-bakery-primary/60">{event.ip_address}</span>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${getSeverityColor(event.severity)}`}>
                                                    {event.severity}
                                                </span>
                                            </td>
                                            <td className="p-6 text-right">
                                                <div className="flex items-center justify-end gap-2 text-bakery-primary/40">
                                                    <Clock size={12} />
                                                    <span className="text-[10px] font-bold">{formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}</span>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Security Notice */}
            <div className="bg-amber-50 rounded-[32px] p-6 border border-amber-200 flex items-start gap-4">
                <AlertTriangle className="text-amber-600 shrink-0 mt-1" size={24} />
                <div className="space-y-1">
                    <h4 className="text-sm font-black text-amber-900 uppercase tracking-widest">Active Protection Notice</h4>
                    <p className="text-xs text-amber-700 leading-relaxed font-medium">
                        The firewall is currently monitoring for automated bot activity and suspicious traffic patterns.
                        Users triggering the honeypot or exceeding rate limits are automatically logged and temporarily throttled.
                        Severe incidents are escalated for IP-level blocking.
                    </p>
                </div>
            </div>
        </div>
    );
}
