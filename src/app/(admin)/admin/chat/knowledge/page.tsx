"use client";

import { useState, useEffect } from "react";
import { BookOpen, Plus, Search, Trash2, Save, X } from "lucide-react";

type KBEntry = {
    id: string;
    question: string;
    answer: string;
    category: string;
    times_used: number;
    created_at: string;
};

export default function KnowledgeBaseDashboard() {
    const [entries, setEntries] = useState<KBEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Add New State
    const [isAdding, setIsAdding] = useState(false);
    const [newQuestion, setNewQuestion] = useState("");
    const [newAnswer, setNewAnswer] = useState("");
    const [newCategory, setNewCategory] = useState("General");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchEntries();
    }, []);

    const fetchEntries = async () => {
        try {
            const res = await fetch("/api/admin/knowledge");
            const data = await res.json();
            if (res.ok) {
                setEntries(data.entries || []);
            }
        } catch (error) {
            console.error("Failed to fetch knowledge base", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddEntry = async () => {
        if (!newQuestion.trim() || !newAnswer.trim() || isSaving) return;

        setIsSaving(true);
        try {
            const res = await fetch("/api/admin/knowledge", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    question: newQuestion,
                    answer: newAnswer,
                    category: newCategory
                })
            });

            if (res.ok) {
                await fetchEntries();
                setNewQuestion("");
                setNewAnswer("");
                setNewCategory("General");
                setIsAdding(false);
            } else {
                alert("Failed to save entry");
            }
        } catch (error) {
            console.error("Error adding entry", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this FAQ?")) return;

        try {
            const res = await fetch("/api/admin/knowledge", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id })
            });

            if (res.ok) {
                setEntries(entries.filter(e => e.id !== id));
            } else {
                alert("Failed to delete entry");
            }
        } catch (error) {
            console.error("Error deleting entry", error);
        }
    };

    const filteredEntries = entries.filter(e =>
        e.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 pt-8 max-w-6xl mx-auto pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-playfair font-black text-bakery-primary">AI Knowledge Base</h1>
                    <p className="text-bakery-primary/60 mt-1">Train your AI Chatbot by adding Custom FAQs and Rules.</p>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="bg-bakery-cta text-white px-6 py-3 rounded-xl font-bold hover:bg-bakery-accent shadow-sm transition-all flex items-center gap-2"
                    >
                        <Plus size={20} /> Add Q&A Pair
                    </button>
                )}
            </div>

            {/* AI Training Intro */}
            <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-100 p-6 rounded-2xl flex gap-6 items-start shadow-sm">
                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 shrink-0">
                    <BookOpen size={24} />
                </div>
                <div className="flex-1 space-y-2">
                    <h3 className="font-bold text-lg text-purple-900">How this works</h3>
                    <p className="text-sm text-purple-800/70 leading-relaxed">
                        The AI Chatbot reads these questions and answers to learn about your business. When customers ask similar questions (even if worded differently), the AI will use this knowledge to answer accurately. Use this to enforce specific business rules, policies, and complex product answers.
                    </p>
                </div>
            </div>

            {/* Add Entry Form */}
            {isAdding && (
                <div className="bg-white p-6 rounded-2xl border border-bakery-primary/10 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex justify-between items-center mb-6 border-b border-bakery-primary/5 pb-4">
                        <h3 className="font-playfair font-black text-xl text-bakery-primary">New Knowledge Base Entry</h3>
                        <button onClick={() => setIsAdding(false)} className="text-bakery-primary/40 hover:text-bakery-error transition-colors p-2 hover:bg-bakery-error/10 rounded-full">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-3 space-y-1.5">
                                <label className="text-sm font-bold text-bakery-primary/70">Example Customer Question</label>
                                <input
                                    type="text"
                                    value={newQuestion}
                                    onChange={(e) => setNewQuestion(e.target.value)}
                                    placeholder="e.g. Do you offer vegan options?"
                                    className="w-full bg-bakery-background border border-bakery-primary/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-bakery-cta focus:ring-2 focus:ring-bakery-cta/10 transition-all font-medium"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-bakery-primary/70">Category</label>
                                <select
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    className="w-full bg-bakery-background border border-bakery-primary/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-bakery-cta focus:ring-2 focus:ring-bakery-cta/10 transition-all font-medium"
                                >
                                    <option value="General">General</option>
                                    <option value="Products">Products & Dietary</option>
                                    <option value="Delivery">Delivery & Logistics</option>
                                    <option value="Policies">Refunds & Policies</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-bakery-primary/70">Your Approved AI Answer</label>
                            <textarea
                                value={newAnswer}
                                onChange={(e) => setNewAnswer(e.target.value)}
                                placeholder="e.g. Yes! We have a dedicated vegan menu featuring eggless cakes and dairy-free pastries. They are prepared in a unified kitchen but we follow strict cross-contamination protocols."
                                rows={4}
                                className="w-full resize-y bg-bakery-background border border-bakery-primary/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-bakery-cta focus:ring-2 focus:ring-bakery-cta/10 transition-all font-medium"
                            />
                        </div>

                        <div className="pt-2 flex justify-end gap-3">
                            <button
                                onClick={() => setIsAdding(false)}
                                className="px-6 py-2.5 rounded-xl font-bold text-bakery-primary/60 hover:text-bakery-primary hover:bg-bakery-background transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddEntry}
                                disabled={!newQuestion.trim() || !newAnswer.trim() || isSaving}
                                className="bg-bakery-cta text-white px-8 py-2.5 rounded-xl font-bold hover:bg-bakery-accent shadow-sm disabled:opacity-50 transition-all flex items-center gap-2"
                            >
                                {isSaving ? "Saving..." : <><Save size={18} /> Save Entry</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="bg-white rounded-2xl shadow-sm border border-bakery-primary/10 overflow-hidden">
                <div className="p-6 border-b border-bakery-primary/10 flex justify-between items-center gap-4 bg-bakery-background/30">
                    <h2 className="font-playfair font-black text-xl relative z-10 w-fit">
                        Existing Knowledge base
                        <span className="absolute bottom-1 left-0 w-full h-3 bg-bakery-cta/20 -z-10 -rotate-1"></span>
                    </h2>

                    <div className="relative w-72">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-bakery-primary/40" />
                        <input
                            type="text"
                            placeholder="Search FAQs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-bakery-primary/10 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-bakery-cta focus:ring-2 focus:ring-bakery-cta/10 transition-all font-medium"
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="p-12 text-center text-bakery-primary/40 font-bold">Loading entries...</div>
                ) : filteredEntries.length === 0 ? (
                    <div className="p-16 text-center text-bakery-primary/40 flex flex-col items-center gap-3">
                        <BookOpen size={48} className="opacity-20" />
                        <p className="text-sm">Click &quot;Add Q&amp;A Pair&quot; to start training the AI.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-bakery-primary/10">
                        {filteredEntries.map((entry) => (
                            <div key={entry.id} className="p-6 hover:bg-bakery-background/50 transition-colors group">
                                <div className="flex justify-between items-start gap-8">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <span className="bg-bakery-primary/5 text-bakery-primary px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider">
                                                {entry.category}
                                            </span>
                                            <h4 className="font-bold text-lg text-bakery-primary/90 flex-1">{`"${entry.question}"`}</h4>
                                        </div>
                                        <p className="text-bakery-primary/70 text-sm leading-relaxed max-w-4xl whitespace-pre-wrap pl-2 border-l-2 border-bakery-primary/10">
                                            {entry.answer}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleDelete(entry.id)}
                                            className="text-white hover:text-white bg-red-100 hover:bg-red-500 text-red-600 p-2 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
