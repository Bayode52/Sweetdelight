"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, Search, Clock, Bot, User, CheckCircle2, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type ChatSession = {
    id: string;
    session_token: string;
    customer_name: string | null;
    customer_email: string | null;
    status: 'bot' | 'waiting' | 'human' | 'resolved';
    whatsapp_notified: boolean;
    created_at: string;
    updated_at: string;
};

type ChatMessage = {
    id: string;
    session_id: string;
    role: 'customer' | 'bot' | 'human_agent';
    content: string;
    created_at: string;
};

export default function AdminChatDashboard() {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [replyInput, setReplyInput] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const fetchSessions = useCallback(async (isBackground = false) => {
        if (!isBackground) setIsLoading(true);
        try {
            const url = filterStatus === "all" ? "/api/admin/chat" : `/api/admin/chat?status=${filterStatus}`;
            const res = await fetch(url);
            const data = await res.json();
            if (res.ok) {
                setSessions(data.sessions || []);
            }
        } catch (error) {
            console.error("Failed to fetch sessions", error);
        } finally {
            if (!isBackground) setIsLoading(false);
        }
    }, [filterStatus]);

    const fetchActiveMessages = useCallback(async (sessionToken: string) => {
        try {
            const res = await fetch(`/api/chat/messages?sessionToken=${sessionToken}`);
            const data = await res.json();
            if (res.ok) {
                setMessages(data.messages || []);
                // Update active session status if it changed
                if (activeSession && data.status !== activeSession.status) {
                    setActiveSession(prev => prev ? { ...prev, status: data.status as ChatSession['status'] } : prev);
                    fetchSessions(true); // refresh sidebar
                }
            }
        } catch (error) {
            console.error("Failed to fetch messages", error);
        }
    }, [activeSession, fetchSessions]);

    // Initial fetch
    useEffect(() => {
        fetchSessions();
    }, [filterStatus, fetchSessions]);

    // Polling for active sessions
    useEffect(() => {
        const interval = setInterval(() => {
            fetchSessions(true);
        }, 5000);
        return () => clearInterval(interval);
    }, [fetchSessions]);

    // Polling for active messages
    useEffect(() => {
        if (!activeSession) return;

        fetchActiveMessages(activeSession.session_token);

        const interval = setInterval(() => {
            fetchActiveMessages(activeSession.session_token);
        }, 3000);

        return () => clearInterval(interval);
    }, [activeSession, fetchActiveMessages]);

    // Scroll to bottom when new messages load
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);


    const handleSendReply = async () => {
        if (!activeSession || !replyInput.trim() || isSending) return;

        setIsSending(true);
        const prevInput = replyInput;
        setReplyInput("");

        try {
            const res = await fetch("/api/admin/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId: activeSession.id,
                    content: prevInput
                })
            });

            if (res.ok) {
                await fetchActiveMessages(activeSession.session_token);
                fetchSessions(true);
            } else {
                setReplyInput(prevInput); // restore input on failure
            }
        } catch (error) {
            console.error("Error sending reply", error);
            setReplyInput(prevInput);
        } finally {
            setIsSending(false);
        }
    };

    const updateSessionStatus = async (status: string) => {
        if (!activeSession) return;
        try {
            const res = await fetch("/api/admin/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId: activeSession.id,
                    action: "update_status",
                    status
                })
            });
            if (res.ok) {
                setActiveSession({ ...activeSession, status: status as ChatSession['status'] });
                fetchSessions(true);
            }
        } catch (error) {
            console.error("Error updating status", error);
        }
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "waiting": return { icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10", label: "Waiting" };
            case "human": return { icon: User, color: "text-blue-500", bg: "bg-blue-500/10", label: "Human Agent" };
            case "bot": return { icon: Bot, color: "text-purple-500", bg: "bg-purple-500/10", label: "AI Bot" };
            case "resolved": return { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10", label: "Resolved" };
            default: return { icon: MessageCircle, color: "text-gray-500", bg: "bg-gray-500/10", label: "Unknown" };
        }
    };

    return (
        <div className="space-y-8 h-[calc(100vh-6rem)] flex flex-col pt-8">
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h1 className="text-3xl font-playfair font-black text-bakery-primary">Live Chat Inbox</h1>
                    <p className="text-bakery-primary/60 mt-1">Monitor AI conversations and take over when needed.</p>
                </div>
            </div>

            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-bakery-primary/10 overflow-hidden flex min-h-0">

                {/* Sidebar List */}
                <div className="w-[350px] border-r border-bakery-primary/10 flex flex-col bg-bakery-background/30 shrink-0">
                    <div className="p-4 border-b border-bakery-primary/10 space-y-4 shrink-0">
                        <div className="relative">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-bakery-primary/40" />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                className="w-full bg-white border border-bakery-primary/10 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-bakery-cta focus:ring-2 focus:ring-bakery-cta/10 transition-all font-medium"
                            />
                        </div>
                        <div className="flex bg-bakery-primary/5 p-1 rounded-lg text-sm font-bold">
                            {["all", "waiting", "human"].map(filter => (
                                <button
                                    key={filter}
                                    onClick={() => setFilterStatus(filter)}
                                    className={`flex-1 py-1.5 capitalize rounded-md transition-colors ${filterStatus === filter ? "bg-white text-bakery-primary shadow-sm" : "text-bakery-primary/60 hover:text-bakery-primary"}`}
                                >
                                    {filter}
                                    {filter === "waiting" && sessions.filter(s => s.status === "waiting").length > 0 && (
                                        <span className="ml-1.5 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full inline-flex align-middle">
                                            {sessions.filter(s => s.status === "waiting").length}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto w-[350px]">
                        {isLoading ? (
                            <div className="p-8 text-center text-bakery-primary/40 text-sm font-bold">Loading inbox...</div>
                        ) : sessions.length === 0 ? (
                            <div className="p-8 text-center text-bakery-primary/40 text-sm flex flex-col items-center gap-2">
                                <MessageCircle size={32} className="opacity-20" />
                                <p>No conversations found</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-bakery-primary/5 w-[350px]">
                                {sessions.map((session) => {
                                    const isActive = activeSession?.id === session.id;
                                    const cfg = getStatusConfig(session.status);
                                    const StatusIcon = cfg.icon;

                                    return (
                                        <button
                                            key={session.id}
                                            onClick={() => setActiveSession(session)}
                                            className={`w-[350px] text-left p-4 hover:bg-white transition-all ${isActive ? "bg-white border-l-4 border-l-bakery-cta shadow-sm" : "border-l-4 border-l-transparent"}`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-sm truncate flex-1">
                                                    {session.customer_name || "Guest Customer"}
                                                </h4>
                                                <span className="text-xs text-bakery-primary/40 font-medium ml-2 whitespace-nowrap">
                                                    {formatDistanceToNow(new Date(session.updated_at), { addSuffix: true })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className={`px-2 py-0.5 rounded text-[10px] font-black uppercase flex items-center gap-1 w-fit ${cfg.bg} ${cfg.color}`}>
                                                    <StatusIcon size={12} />
                                                    {cfg.label}
                                                </div>
                                                {session.status === "waiting" && session.whatsapp_notified && (
                                                    <span className="text-[10px] text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded">Notified</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-bakery-primary/60 font-medium truncate w-[310px]">
                                                ID: {session.id.split('-')[0]}...
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Active Chat Area */}
                <div className="flex-1 flex flex-col min-w-0 bg-white">
                    {activeSession ? (
                        <>
                            {/* Chat Header */}
                            <div className="h-[73px] px-6 border-b border-bakery-primary/10 flex items-center justify-between shrink-0 bg-white">
                                <div>
                                    <h2 className="font-playfair font-black text-lg">
                                        {activeSession.customer_name || "Guest Conversation"}
                                    </h2>
                                    <p className="text-xs text-bakery-primary/60 font-medium">
                                        {activeSession.customer_email || "No email provided"} • Token: {activeSession.session_token.split('-')[0]}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className={`px-3 py-1 rounded-lg text-xs font-black uppercase flex items-center gap-1 ${getStatusConfig(activeSession.status).bg} ${getStatusConfig(activeSession.status).color}`}>
                                        {getStatusConfig(activeSession.status).label}
                                    </div>

                                    {activeSession.status === 'human' ? (
                                        <button onClick={() => updateSessionStatus('bot')} className="text-xs font-bold bg-purple-50 text-purple-600 border border-purple-200 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                                            <Bot size={14} /> Hand back to AI
                                        </button>
                                    ) : activeSession.status === 'bot' || activeSession.status === 'waiting' ? (
                                        <button onClick={() => updateSessionStatus('human')} className="text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                                            <User size={14} /> Take Over Silently
                                        </button>
                                    ) : null}

                                    {activeSession.status !== 'resolved' && (
                                        <button onClick={() => updateSessionStatus('resolved')} className="text-xs font-bold bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                                            <CheckCircle2 size={14} /> Mark Resolved
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Chat Messages */}
                            <div className="flex-1 overflow-y-auto p-6 bg-bakery-background/30 flex flex-col gap-4">
                                {messages.map((msg) => {
                                    const isCustomer = msg.role === 'customer';
                                    const isBot = msg.role === 'bot';

                                    return (
                                        <div key={msg.id} className={`flex flex-col max-w-[80%] ${isCustomer ? "self-end items-end" : "self-start items-start"}`}>
                                            <span className="text-[10px] font-bold text-bakery-primary/40 mb-1 ml-1 mr-1 uppercase tracking-wider">
                                                {isCustomer ? activeSession.customer_name || 'Customer' : isBot ? 'Crave AI' : 'Team / You'} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>

                                            <div className={`px-4 py-3 text-sm whitespace-pre-wrap rounded-2xl ${isCustomer
                                                ? "bg-bakery-background border border-bakery-primary/10 text-bakery-primary rounded-br-sm"
                                                : isBot
                                                    ? "bg-purple-50 text-purple-900 border border-purple-100 rounded-bl-sm"
                                                    : "bg-[#2C1810] text-white shadow-sm rounded-bl-sm"
                                                }`}>
                                                {msg.content}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Chat Input */}
                            <div className="p-4 bg-white border-t border-bakery-primary/10 shrink-0">
                                {activeSession.status === 'resolved' ? (
                                    <div className="p-4 text-center text-sm font-bold text-bakery-primary/40 bg-bakery-background rounded-xl">
                                        This conversation has been resolved.
                                    </div>
                                ) : (
                                    <form
                                        onSubmit={(e) => { e.preventDefault(); handleSendReply(); }}
                                        className="flex items-end gap-3"
                                    >
                                        <textarea
                                            value={replyInput}
                                            onChange={(e) => setReplyInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendReply();
                                                }
                                            }}
                                            placeholder="Type a reply as Admin... (Press Enter to send)"
                                            rows={2}
                                            className="flex-1 resize-none bg-bakery-background rounded-xl border border-bakery-primary/10 p-4 text-sm outline-none focus:border-bakery-cta focus:ring-2 focus:ring-bakery-cta/10 transition-all font-medium"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!replyInput.trim() || isSending}
                                            className="bg-[#2C1810] text-white p-4 h-[54px] w-[54px] rounded-xl flex items-center justify-center hover:bg-bakery-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm shrink-0"
                                        >
                                            <Send size={20} />
                                        </button>
                                    </form>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-bakery-primary/40">
                            <MessageCircle size={64} className="mb-4 opacity-20" />
                            <h3 className="text-xl font-playfair font-black text-bakery-primary/60">Select a conversation</h3>
                            <p className="text-sm">Click a chat on the left to view details and reply.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
