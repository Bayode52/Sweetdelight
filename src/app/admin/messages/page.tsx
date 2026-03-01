"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import {
    Mail,
    MessageSquare,
    Clock,
    User,
    Phone,
    ChevronRight,
    Search,
    Filter,
    CheckCircle2,
    Trash2,
    ArrowLeft
} from "lucide-react";
import { format } from "date-fns";
import { Badge, Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface Message {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    status: 'new' | 'read' | 'replied';
    created_at: string;
}

export default function MessagesPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const fetchMessages = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from("contact_messages")
                .select("*")
                .order("created_at", { ascending: false });

            if (filterStatus !== "all") {
                query = query.eq("status", filterStatus);
            }

            const { data, error } = await query;

            if (error) throw error;
            setMessages(data || []);
        } catch (error: any) {
            console.error("Error fetching messages:", error);
            toast.error("Failed to load messages");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, [filterStatus]);

    const handleMarkAsRead = async (id: string) => {
        try {
            const { error } = await supabase
                .from("contact_messages")
                .update({ status: 'read' })
                .eq("id", id);

            if (error) throw error;
            setMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'read' } : m));
            if (selectedMessage?.id === id) {
                setSelectedMessage(prev => prev ? { ...prev, status: 'read' } : null);
            }
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this message?")) return;

        try {
            const { error } = await supabase
                .from("contact_messages")
                .delete()
                .eq("id", id);

            if (error) throw error;
            setMessages(prev => prev.filter(m => m.id !== id));
            setSelectedMessage(null);
            toast.success("Message deleted");
        } catch (error) {
            toast.error("Failed to delete message");
        }
    };

    const filteredMessages = messages.filter(m =>
        m.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-playfair font-black text-bakery-primary">Customer Messages</h1>
                    <p className="text-bakery-primary/60">Manage inquiries and support requests from the contact form.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-bakery-primary/5 p-1 flex">
                        {['all', 'new', 'read', 'replied'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                    filterStatus === status
                                        ? "bg-bakery-cta text-white shadow-lg shadow-bakery-cta/20"
                                        : "text-bakery-primary/40 hover:text-bakery-primary"
                                )}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-280px)]">
                {/* List */}
                <div className={cn(
                    "lg:col-span-5 bg-white rounded-[40px] luxury-shadow border border-bakery-primary/5 flex flex-col overflow-hidden",
                    selectedMessage ? "hidden lg:flex" : "flex"
                )}>
                    <div className="p-6 border-b border-bakery-primary/5 space-y-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-bakery-primary/20 group-focus-within:text-bakery-cta transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search messages..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-bakery-primary/5 border-none rounded-2xl py-3.5 pl-12 pr-6 text-sm font-bold placeholder:text-bakery-primary/20 focus:ring-2 focus:ring-bakery-cta/20 transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="h-24 bg-bakery-primary/5 rounded-3xl animate-pulse" />
                            ))
                        ) : filteredMessages.length === 0 ? (
                            <div className="text-center py-12 space-y-3">
                                <div className="text-4xl">📩</div>
                                <p className="text-sm font-bold text-bakery-primary/30 uppercase tracking-widest">No messages found</p>
                            </div>
                        ) : (
                            filteredMessages.map((msg) => (
                                <button
                                    key={msg.id}
                                    onClick={() => {
                                        setSelectedMessage(msg);
                                        if (msg.status === 'new') handleMarkAsRead(msg.id);
                                    }}
                                    className={cn(
                                        "w-full text-left p-5 rounded-3xl transition-all duration-300 relative group",
                                        selectedMessage?.id === msg.id
                                            ? "bg-bakery-primary text-white luxury-shadow"
                                            : "hover:bg-bakery-primary/5 bg-transparent"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <p className={cn(
                                            "text-xs font-black uppercase tracking-widest",
                                            selectedMessage?.id === msg.id ? "text-white/60" : "text-bakery-primary/40"
                                        )}>
                                            {format(new Date(msg.created_at), "MMM d, h:mm a")}
                                        </p>
                                        {msg.status === 'new' && (
                                            <span className="w-2 h-2 rounded-full bg-bakery-cta animate-pulse" />
                                        )}
                                    </div>
                                    <h3 className="font-bold text-sm mb-1 truncate">{msg.subject}</h3>
                                    <p className={cn(
                                        "text-xs truncate",
                                        selectedMessage?.id === msg.id ? "text-white/70" : "text-bakery-primary/60"
                                    )}>
                                        {msg.full_name} • {msg.email}
                                    </p>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Detail */}
                <div className={cn(
                    "lg:col-span-7 bg-white rounded-[40px] luxury-shadow border border-bakery-primary/5 flex flex-col overflow-hidden",
                    !selectedMessage ? "hidden lg:flex" : "flex"
                )}>
                    {selectedMessage ? (
                        <div className="flex flex-col h-full">
                            <div className="p-8 border-b border-bakery-primary/5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setSelectedMessage(null)}
                                        className="lg:hidden p-2 rounded-xl bg-bakery-primary/5 text-bakery-primary"
                                    >
                                        <ArrowLeft size={18} />
                                    </button>
                                    <div>
                                        <h2 className="text-xl font-playfair font-black text-bakery-primary">{selectedMessage.subject}</h2>
                                        <p className="text-xs font-black uppercase tracking-widest text-bakery-primary/40">From: {selectedMessage.full_name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-500 hover:bg-red-50"
                                        onClick={() => handleDelete(selectedMessage.id)}
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                    <a
                                        href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                                        className="inline-flex items-center gap-2 bg-bakery-cta text-white px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-bakery-cta/20"
                                    >
                                        <Mail size={14} />
                                        Reply via Email
                                    </a>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
                                {/* Info Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-bakery-primary/5 p-6 rounded-3xl space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-bakery-primary/30 flex items-center gap-2">
                                            <User size={10} /> Sender Name
                                        </p>
                                        <p className="font-bold text-bakery-primary">{selectedMessage.full_name}</p>
                                    </div>
                                    <div className="bg-bakery-primary/5 p-6 rounded-3xl space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-bakery-primary/30 flex items-center gap-2">
                                            <Mail size={10} /> Email Address
                                        </p>
                                        <p className="font-bold text-bakery-primary">{selectedMessage.email}</p>
                                    </div>
                                    {selectedMessage.phone && (
                                        <div className="bg-bakery-primary/5 p-6 rounded-3xl space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-bakery-primary/30 flex items-center gap-2">
                                                <Phone size={10} /> Phone Number
                                            </p>
                                            <p className="font-bold text-bakery-primary">{selectedMessage.phone}</p>
                                        </div>
                                    )}
                                    <div className="bg-bakery-primary/5 p-6 rounded-3xl space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-bakery-primary/30 flex items-center gap-2">
                                            <Clock size={10} /> Received At
                                        </p>
                                        <p className="font-bold text-bakery-primary">{format(new Date(selectedMessage.created_at), "eeee, MMMM do, yyyy 'at' h:mm a")}</p>
                                    </div>
                                </div>

                                {/* Message Content */}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-bakery-primary/30 border-b border-bakery-primary/5 pb-2 flex items-center gap-2">
                                        <MessageSquare size={12} /> Message Content
                                    </h4>
                                    <div className="bg-[#FDF6F0] p-8 rounded-[40px] text-bakery-primary leading-relaxed whitespace-pre-wrap font-medium">
                                        {selectedMessage.message}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-6">
                            <div className="w-24 h-24 bg-bakery-primary/5 rounded-[40px] flex items-center justify-center text-4xl">
                                📬
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-playfair font-black text-bakery-primary">Select a message</h2>
                                <p className="text-bakery-primary/40 max-w-xs mx-auto">Choose an inquiry from the list to view full details and reply to the customer.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
