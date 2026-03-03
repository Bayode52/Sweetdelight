"use client";

import { useState, useEffect, useRef, ReactNode } from "react";
import { MessageCircle, X, Send, User, ChevronDown } from "lucide-react";

type Message = {
    id: string;
    role: "customer" | "assistant" | "bot" | "human_agent";
    content: string;
};

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: "Hello! Welcome to Sweet Delight 🍰 I'm Chloe. How can I help you today?",
        }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [sessionToken, setSessionToken] = useState("");
    const [status, setStatus] = useState<"bot" | "waiting" | "human" | "resolved">("bot");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initialize session token
    useEffect(() => {
        let token = localStorage.getItem("sweetdelight_chat_session");
        if (!token) {
            token = Math.random().toString(36).substring(7);
            localStorage.setItem("sweetdelight_chat_session", token);
        }
        setSessionToken(token);
    }, []);

    // Scroll to bottom when messages change
    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isOpen, loading]);

    // Simple markdown renderer for chat messages
    function renderMessage(text: string): ReactNode[] {
        return text
            .split('\n')
            .map((line, i) => {
                // Bold text
                const parts = line.split(/\*\*(.*?)\*\*/g)
                return (
                    <p key={i} className={line === '' ? 'h-2' : 'leading-relaxed mb-1 last:mb-0'}>
                        {parts.map((part, j) =>
                            j % 2 === 1
                                ? <strong key={j} className="font-bold text-[#1C0A00]">{part}</strong>
                                : <span key={j}>{part}</span>
                        )}
                    </p>
                )
            })
    }

    const smart = (m: string) => {
        const t = m.toLowerCase()
        if (/hi|hello|hey/.test(t)) return "Hello! Welcome to Sweet Delight 🍰 How can I help?"
        if (/price|cost/.test(t)) return "Cakes from £45, small chops from £35, puff puff £6/dozen! Free delivery over £50."
        if (/deliver/.test(t)) return "We deliver across the UK! Free delivery over £50 🚚"
        return "For quickest help, WhatsApp us Mon–Fri 9am–7pm! 🍰"
    }

    const sendMessage = async (inputText?: string) => {
        const text = (inputText ?? input).trim()
        if (!text || loading) return

        // 1. Add user message immediately using functional updater
        const userMessage = {
            id: `u_${Date.now()}`,
            role: 'customer' as const,
            content: text
        }
        setMessages(prev => [...prev, userMessage])
        setInput('')
        setLoading(true)

        try {
            // 2. Get current messages for history
            const currentHistory = messages.map(m => ({
                role: m.role === 'customer' ? 'user' : 'assistant',
                content: m.content
            }))

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    history: currentHistory.slice(-8)
                })
            })

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`)
            }

            const data = await response.json()
            const reply = data?.message || smart(text)

            // 3. Add bot reply using functional updater
            setMessages(prev => [...prev, {
                id: `a_${Date.now()}`,
                role: 'assistant' as const,
                content: reply
            }])

        } catch (error) {
            console.error('Chat error:', error)
            // 4. Add error message using functional updater
            setMessages(prev => [...prev, {
                id: `e_${Date.now()}`,
                role: 'assistant' as const,
                content: "I had a quick issue! 😊 Please try again or WhatsApp us directly."
            }])
        } finally {
            setLoading(false)
        }
    }

    const handleEscalate = () => {
        sendMessage("speak to a person");
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end font-inter">
            {/* Chat Panel */}
            {isOpen && (
                <div className="w-[380px] h-[600px] max-w-[calc(100vw-48px)] max-h-[calc(100vh-120px)] bg-white rounded-3xl shadow-[0_15px_35px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden mb-4 border border-black/5 animate-in slide-in-from-bottom-5 fade-in duration-300 relative">

                    {/* Header */}
                    <div className="bg-gradient-to-br from-[#2C1810] to-[#1a0e09] text-white p-5 pt-6 flex flex-col gap-3 relative shrink-0">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-12 blur-2xl pointer-events-none" />

                        <div className="flex justify-between items-start relative z-10">
                            <div className="space-y-1">
                                <h3 className="font-playfair font-black text-2xl flex items-center gap-2 drop-shadow-sm">
                                    Sweet Delight <span className="text-2xl animate-in zoom-in spin-in-12 duration-500 delay-150">🧁</span>
                                </h3>
                                <p className="text-xs text-white/80 font-medium tracking-wide flex items-center gap-1.5">
                                    <span className={`w-2 h-2 rounded-full ${status === 'human' ? 'bg-green-400' : 'bg-bakery-cta'} animate-pulse`} />
                                    Typically replies in seconds
                                </p>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white hover:rotate-90 transition-all p-1 bg-white/5 rounded-full hover:bg-white/20">
                                <X size={20} />
                            </button>
                        </div>

                        <button
                            onClick={handleEscalate}
                            className="text-xs font-bold text-[#2C1810] bg-white hover:bg-bakery-accent hover:text-white transition-all py-1.5 px-3 rounded-full self-start flex items-center gap-1.5 shadow-sm transform hover:-translate-y-0.5"
                        >
                            <User size={12} /> Talk to a person
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-5 bg-[#FAFAFA] flex flex-col gap-4 relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-bakery-primary/5 pointer-events-none" />

                        {/* Message History */}
                        {messages.map((msg, index) => {
                            const isCustomer = msg.role === 'customer';
                            return (
                                <div key={msg.id || index} className={`flex flex-col ${isCustomer ? "items-end" : "items-start"} relative z-10 animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                    <div className={`flex items-end gap-2 max-w-[85%]`}>
                                        {!isCustomer && (
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2C1810] to-[#5a3625] flex items-center justify-center text-white text-xs font-black shadow-md border border-white/20 shrink-0">
                                                CB
                                            </div>
                                        )}
                                        <div
                                            className={`px-4 py-3 text-sm shadow-sm leading-relaxed ${isCustomer
                                                ? "bg-gradient-to-br from-[#2C1810] to-[#4a281a] text-white rounded-2xl rounded-br-sm"
                                                : "bg-white text-[#2C1810] border border-black/5 rounded-2xl rounded-bl-sm"
                                                }`}
                                        >
                                            {renderMessage(msg.content)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {loading && (
                            <div className="flex items-start gap-2 mb-3">
                                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-sm flex-shrink-0 shadow-sm border border-orange-200">🍰</div>
                                <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 border border-black/5 shadow-sm">
                                    <div className="flex gap-1 items-center">
                                        <div className="w-2 h-2 bg-[#D4421A] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-2 h-2 bg-[#D4421A] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-2 h-2 bg-[#D4421A] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Chloe is typing...</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} className="h-1 shrink-0" />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-black/5 shrink-0 z-20">
                        <form
                            onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                            className="flex items-center gap-2 relative"
                        >
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault()
                                        sendMessage()
                                    }
                                }}
                                placeholder="Type a message..."
                                className="flex-1 bg-black/5 text-sm p-3 pl-4 rounded-xl border border-transparent outline-none focus:border-bakery-cta/30 focus:bg-white focus:shadow-[0_0_0_4px_rgba(235,94,40,0.1)] transition-all placeholder:text-black/30 text-[#2C1810]"
                            />
                            <button
                                type="button"
                                onClick={() => sendMessage()}
                                disabled={!input.trim() || loading}
                                className="bg-gradient-to-r from-bakery-cta to-[#d75b3b] text-white p-3 rounded-xl hover:shadow-lg hover:shadow-bakery-cta/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                            >
                                <Send size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Floating Widget Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-16 h-16 bg-gradient-to-br from-[#2C1810] to-[#4a281a] rounded-full shadow-2xl flex items-center justify-center text-white hover:-translate-y-1.5 hover:shadow-[0_10px_25px_rgba(44,24,16,0.3)] transition-all relative group border border-white/10"
                >
                    <MessageCircle size={28} className="group-hover:scale-110 transition-transform" />
                </button>
            )}
        </div>
    );
}
