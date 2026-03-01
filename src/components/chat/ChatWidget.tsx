"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, User, ChevronDown } from "lucide-react";

type Message = {
    id: string;
    role: "customer" | "bot" | "human_agent";
    content: string;
    created_at: string;
};

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [status, setStatus] = useState<"bot" | "waiting" | "human" | "resolved">("bot");
    const [sessionToken, setSessionToken] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [unreadCount, setUnreadCount] = useState(0);

    const quickReplies = ["🛍️ Browse Menu", "🎂 Custom Cake", "📦 Track Order", "🚚 Delivery Info"];

    // Initialize session token and fetch initial messages
    useEffect(() => {
        let token = localStorage.getItem("sweetdelight_chat_session");
        if (!token) {
            token = Math.random().toString(36).substring(7);
            localStorage.setItem("sweetdelight_chat_session", token);
        }
        setSessionToken(token);
        fetchMessages(token);
    }, []);

    // Polling for updates (especially for human takeover updates)
    useEffect(() => {
        if (!sessionToken) return;

        const interval = setInterval(() => {
            fetchMessages(sessionToken, true);
        }, 5000);

        return () => clearInterval(interval);
    }, [sessionToken]);

    // Scroll to bottom when messages change
    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isOpen, isLoading]);

    const fetchMessages = async (token: string, isBackground = false) => {
        try {
            const res = await fetch(`/api/chat/messages?sessionToken=${token}`);
            const data = await res.json();
            if (res.ok) {
                if (isBackground && !isOpen && data.messages.length > messages.length) {
                    // New messages arrived while closed
                    setUnreadCount(prev => prev + (data.messages.length - messages.length));
                }
                setMessages(data.messages || []);
                setStatus(data.status || "bot");
            }
        } catch (error) {
            console.error("Failed to fetch messages", error);
        }
    };

    const sendMessage = async (text: string) => {
        if (!text.trim() || isLoading) return;

        const tempMessage: Message = {
            id: Date.now().toString(),
            role: "customer",
            content: text,
            created_at: new Date().toISOString()
        };

        setMessages(prev => [...prev, tempMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: text,
                    sessionToken,
                })
            });

            const data = await res.json();
            if (res.ok) {
                // IMPORTANT: Append the bot's response to the history
                const botMessage: Message = {
                    id: Date.now().toString() + "-bot",
                    role: "bot",
                    content: data.message,
                    created_at: new Date().toISOString()
                };
                setMessages(prev => [...prev, botMessage]);
            } else {
                console.error("Failed to send message", data.error);
            }
        } catch (error) {
            console.error("Error sending message", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEscalate = () => {
        sendMessage("speak to a person");
    };

    const handleOpen = () => {
        setIsOpen(true);
        setUnreadCount(0);
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end font-inter">
            {/* Chat Panel */}
            {isOpen && (
                <div className="w-[380px] h-[600px] max-w-[calc(100vw-48px)] max-h-[calc(100vh-120px)] bg-white rounded-3xl shadow-[0_15px_35px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden mb-4 border border-black/5 animate-in slide-in-from-bottom-5 fade-in duration-300 relative">

                    {/* Header */}
                    <div className="bg-gradient-to-br from-[#2C1810] to-[#1a0e09] text-white p-5 pt-6 flex flex-col gap-3 relative shrink-0">
                        {/* Abstract Background pattern */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-12 blur-2xl pointer-events-none" />

                        <div className="flex justify-between items-start relative z-10">
                            <div className="space-y-1">
                                <h3 className="font-playfair font-black text-2xl flex items-center gap-2 drop-shadow-sm">
                                    Sweet Delight <span className="text-2xl animate-in zoom-in spin-in-12 duration-500 delay-150">🧁</span>
                                </h3>
                                <p className="text-xs text-white/80 font-medium tracking-wide flex items-center gap-1.5">
                                    <span className={`w-2 h-2 rounded-full ${status === 'human' ? 'bg-green-400' : 'bg-bakery-cta'} animate-pulse`} />
                                    {status === "waiting"
                                        ? "Waiting for an agent..."
                                        : status === "human"
                                            ? "Agent connected"
                                            : "Typically replies in seconds"
                                    }
                                </p>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white hover:rotate-90 transition-all p-1 bg-white/5 rounded-full hover:bg-white/20">
                                <X size={20} />
                            </button>
                        </div>

                        {status === "bot" && (
                            <button
                                onClick={handleEscalate}
                                className="text-xs font-bold text-[#2C1810] bg-white hover:bg-bakery-accent hover:text-white transition-all py-1.5 px-3 rounded-full self-start flex items-center gap-1.5 shadow-sm transform hover:-translate-y-0.5"
                            >
                                <User size={12} /> Talk to a person
                            </button>
                        )}
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-5 bg-[#FAFAFA] flex flex-col gap-4 relative">
                        {/* Subtle background pattern/gradient */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-bakery-primary/5 pointer-events-none" />

                        {/* Initial Greeting */}
                        {messages.length === 0 && (
                            <div className="flex flex-col gap-2 relative z-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="flex items-end gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2C1810] to-[#5a3625] flex items-center justify-center text-white text-xs font-black shadow-md border border-white/20 shrink-0">
                                        CB
                                    </div>
                                    <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm border border-black/5 text-sm text-[#2C1810] max-w-[85%] whitespace-pre-wrap leading-relaxed">
                                        Hi there! 👋 Welcome to Sweet Delight!
                                        {"\n\n"}
                                        I'm your AI assistant. I can help you with orders, products, delivery and more. What can I help you with today?
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-4 ml-10">
                                    {quickReplies.map((reply, i) => (
                                        <button
                                            key={reply}
                                            onClick={() => sendMessage(reply)}
                                            className="text-xs font-bold bg-white text-bakery-cta border border-bakery-cta/20 px-3 py-1.5 rounded-full hover:bg-bakery-cta hover:text-white transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 animate-in fade-in slide-in-from-left-2"
                                            style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}
                                        >
                                            {reply}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Message History */}
                        {messages.map((msg, index) => {
                            const isCustomer = msg.role === 'customer';
                            const isHumanAgent = msg.role === 'human_agent';

                            return (
                                <div key={msg.id || index} className={`flex flex-col ${isCustomer ? "items-end" : "items-start"} relative z-10 animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                    {isHumanAgent && (
                                        <span className="text-[10px] font-bold text-bakery-cta mb-1 ml-[40px] tracking-wide uppercase">Sweet Delight Team</span>
                                    )}
                                    <div className={`flex items-end gap-2 max-w-[85%]`}>

                                        {/* Bot Avatar */}
                                        {!isCustomer && (
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black shadow-md border border-white/20 shrink-0 ${isHumanAgent ? 'bg-gradient-to-br from-bakery-cta to-[#d75b3b]' : 'bg-gradient-to-br from-[#2C1810] to-[#5a3625]'}`}>
                                                CB
                                            </div>
                                        )}

                                        {/* Chat Bubble */}
                                        <div
                                            className={`px-4 py-3 text-sm whitespace-pre-wrap shadow-sm leading-relaxed ${isCustomer
                                                ? "bg-gradient-to-br from-[#2C1810] to-[#4a281a] text-white rounded-2xl rounded-br-sm"
                                                : "bg-white text-[#2C1810] border border-black/5 rounded-2xl rounded-bl-sm"
                                                }`}
                                        >
                                            {msg.content}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {isLoading && (
                            <div className="flex items-end gap-2 relative z-10 animate-in fade-in duration-300">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2C1810] to-[#5a3625] flex items-center justify-center text-white text-xs font-black shadow-md border border-white/20">
                                    CB
                                </div>
                                <div className="bg-white px-4 py-4 rounded-2xl rounded-bl-sm shadow-sm border border-black/5 flex gap-1 items-center justify-center">
                                    <div className="w-2 h-2 bg-[#2C1810]/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-[#2C1810]/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-[#2C1810]/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} className="h-1 shrink-0" />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-black/5 shrink-0 z-20">
                        {(status === "human" || status === "waiting") && messages.length > 0 && messages[messages.length - 1].role === 'bot' && (
                            <div className="text-xs text-center text-bakery-primary/80 mb-3 bg-bakery-cta/10 p-2 rounded-lg border border-bakery-cta/20 font-medium tracking-wide">
                                {status === 'waiting' ? '⌛ You are waiting for' : '👩‍💼 You are talking to'} a human agent.
                            </div>
                        )}
                        <form
                            onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
                            className="flex items-center gap-2 relative"
                        >
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        sendMessage(input);
                                    }
                                }}
                                placeholder="Type a message..."
                                className="flex-1 bg-black/5 text-sm p-3 pl-4 rounded-xl border border-transparent outline-none focus:border-bakery-cta/30 focus:bg-white focus:shadow-[0_0_0_4px_rgba(235,94,40,0.1)] transition-all placeholder:text-black/30 text-[#2C1810]"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="bg-gradient-to-r from-bakery-cta to-[#d75b3b] text-white p-3 rounded-xl hover:shadow-lg hover:shadow-bakery-cta/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                            >
                                <Send size={18} className={`${input.trim() && !isLoading ? 'translate-x-0.5 -translate-y-0.5' : ''} transition-transform`} />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Floating Widget Button */}
            {!isOpen && (
                <button
                    onClick={handleOpen}
                    className="w-16 h-16 bg-gradient-to-br from-[#2C1810] to-[#4a281a] rounded-full shadow-2xl flex items-center justify-center text-white hover:-translate-y-1.5 hover:shadow-[0_10px_25px_rgba(44,24,16,0.3)] transition-all relative group border border-white/10"
                >
                    <MessageCircle size={28} className="group-hover:scale-110 transition-transform" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-6 h-6 bg-bakery-cta rounded-full text-white text-xs font-black flex items-center justify-center border-2 border-white shadow-md animate-bounce">
                            {unreadCount}
                        </span>
                    )}
                </button>
            )}
        </div>
    );
}
