"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, Layout, Globe, Info, Image as ImageIcon, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

const CONTENT_STRUCTURE = {
    home: {
        title: "Home Page",
        sections: {
            hero: {
                title: "Hero Section",
                fields: [
                    { name: "headline", label: "Main Headline", type: "text" },
                    { name: "subheadline", label: "Sub-headline", type: "textarea" },
                    { name: "cta_text", label: "CTA Button Text", type: "text" },
                    { name: "hero_image", label: "Hero Image URL", type: "image", description: "Use full URL or relative path" }
                ] as { name: string, label: string, type: "text" | "textarea" | "image", description?: string }[]
            },
            features: {
                title: "Features / USP",
                fields: [
                    { name: "feature_1_title", label: "Feature 1 Title", type: "text" },
                    { name: "feature_1_desc", label: "Feature 1 Description", type: "textarea" },
                    { name: "feature_2_title", label: "Feature 2 Title", type: "text" },
                    { name: "feature_2_desc", label: "Feature 2 Description", type: "textarea" }
                ]
            }
        }
    },
    about: {
        title: "About Us",
        sections: {
            story: {
                title: "Our Story",
                fields: [
                    { name: "title", label: "Section Title", type: "text" },
                    { name: "content", label: "Main Content", type: "textarea" },
                    { name: "image", label: "Story Image URL", type: "image" }
                ]
            }
        }
    },
    footer: {
        title: "Global Footer",
        sections: {
            contact: {
                title: "Contact Info",
                fields: [
                    { name: "address", label: "Business Address", type: "textarea" },
                    { name: "phone", label: "Phone Number", type: "text" },
                    { name: "email", label: "Contact Email", type: "text" }
                ]
            },
            socials: {
                title: "Social Links",
                fields: [
                    { name: "instagram", label: "Instagram Link", type: "text" },
                    { name: "facebook", label: "Facebook Link", type: "text" }
                ]
            }
        }
    }
};

export default function AdminCMSPage() {
    const queryClient = useQueryClient();
    const [activePage, setActivePage] = useState<string>("home");
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [hasChanges, setHasChanges] = useState(false);

    const { data: siteContent, isLoading } = useQuery({
        queryKey: ["site-content"],
        queryFn: async () => {
            const res = await fetch("/api/admin/content");
            if (!res.ok) throw new Error("Failed to fetch content");
            return res.json();
        }
    });

    useEffect(() => {
        if (siteContent) {
            const initialData: Record<string, string> = {};
            siteContent.forEach((item: any) => {
                if (item.page === activePage) {
                    initialData[`${item.section}.${item.field}`] = item.value;
                }
            });
            setFormData(initialData);
            setHasChanges(false);
        }
    }, [siteContent, activePage]);

    const updateMutation = useMutation({
        mutationFn: async (updates: any[]) => {
            const res = await fetch("/api/admin/content", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ updates })
            });
            if (!res.ok) throw new Error("Failed to update content");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["site-content"] });
            toast.success("Content saved successfully!");
            setHasChanges(false);
        },
        onError: (err: any) => {
            toast.error(err.message || "Failed to save content");
        }
    });

    const handleFieldChange = (section: string, field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [`${section}.${field}`]: value
        }));
        setHasChanges(true);
    };

    const handleSave = () => {
        const updates = Object.entries(formData).map(([key, value]) => {
            const [section, field] = key.split(".");
            return { page: activePage, section, field, value };
        });
        updateMutation.mutate(updates);
    };

    const currentPageConfig = CONTENT_STRUCTURE[activePage as keyof typeof CONTENT_STRUCTURE];

    return (
        <div className="space-y-8 pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black font-playfair text-bakery-primary tracking-tighter">Website Content Editor</h1>
                    <p className="text-bakery-primary/40 font-bold uppercase tracking-widest text-xs mt-2 flex items-center gap-2">
                        <Globe size={14} /> LIVE CONTENT MANAGEMENT SYSTEM
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={!hasChanges || updateMutation.isPending}
                    className={`h-14 px-8 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg ${hasChanges
                        ? "bg-bakery-cta text-white hover:scale-[1.02] active:scale-95"
                        : "bg-bakery-primary/5 text-bakery-primary/20 cursor-not-allowed shadow-none"
                        }`}
                >
                    <Save size={18} />
                    {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </button>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white p-2 rounded-[32px] luxury-shadow border border-bakery-primary/5 flex gap-2 overflow-x-auto">
                {Object.entries(CONTENT_STRUCTURE).map(([key, config]) => (
                    <button
                        key={key}
                        onClick={() => setActivePage(key)}
                        className={`px-8 h-14 rounded-[24px] text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${activePage === key
                            ? "bg-bakery-primary text-white"
                            : "bg-transparent text-bakery-primary/60 hover:bg-bakery-primary/5"
                            }`}
                    >
                        <Layout size={16} />
                        {config.title}
                    </button>
                ))}
            </div>

            {/* Content Form */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                <div className="xl:col-span-8 space-y-8">
                    {Object.entries(currentPageConfig.sections).map(([sectionKey, section]: [string, any]) => (
                        <motion.div
                            key={sectionKey}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[40px] luxury-shadow border border-bakery-primary/5 overflow-hidden"
                        >
                            <div className="p-8 border-b border-bakery-primary/5 bg-bakery-background/30">
                                <h3 className="text-lg font-black font-playfair text-bakery-primary">{section.title}</h3>
                            </div>
                            <div className="p-8 space-y-6">
                                {(section.fields as any[]).map((field) => (
                                    <div key={field.name}>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-bakery-primary/40">
                                                {field.label}
                                            </label>
                                            {field.description && (
                                                <div className="group relative">
                                                    <Info size={14} className="text-bakery-primary/20 cursor-help" />
                                                    <div className="absolute right-0 bottom-full mb-2 w-48 p-2 bg-bakery-primary text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                                        {field.description}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {field.type === "textarea" ? (
                                            <textarea
                                                value={formData[`${sectionKey}.${field.name}`] || ""}
                                                onChange={(e) => handleFieldChange(sectionKey, field.name, e.target.value)}
                                                rows={4}
                                                className="w-full bg-bakery-primary/5 border-none rounded-2xl p-4 font-medium text-bakery-primary focus:ring-2 ring-bakery-cta/20 placeholder:text-bakery-primary/20"
                                            />
                                        ) : (
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={formData[`${sectionKey}.${field.name}`] || ""}
                                                    onChange={(e) => handleFieldChange(sectionKey, field.name, e.target.value)}
                                                    className="w-full h-14 bg-bakery-primary/5 border-none rounded-2xl px-4 font-black text-bakery-primary focus:ring-2 ring-bakery-cta/20"
                                                />
                                                {field.type === "image" && (
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-bakery-primary/20">
                                                        <ImageIcon size={20} />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="xl:col-span-4 space-y-8">
                    {/* Helper sidebar */}
                    <div className="bg-bakery-primary text-white rounded-[40px] p-8 luxury-shadow sticky top-8">
                        <SparklesIcon className="w-12 h-12 text-bakery-cta mb-6" />
                        <h3 className="text-2xl font-black font-playfair mb-4 leading-tight">Pro Editing Tips</h3>
                        <ul className="space-y-4">
                            {[
                                "Headlines work best under 50 characters",
                                "Images should be optimized (WebP preferred)",
                                "All changes go live instantly after saving",
                                "Use clear CTA text to drive conversions"
                            ].map((tip, i) => (
                                <li key={i} className="flex gap-3 text-sm font-medium text-white/70 italic">
                                    <div className="w-1.5 h-1.5 rounded-full bg-bakery-cta mt-1.5 shrink-0" />
                                    {tip}
                                </li>
                            ))}
                        </ul>

                        <div className="mt-8 pt-8 border-t border-white/10">
                            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl">
                                <CheckCircle2 className="text-green-400 shrink-0" />
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-white/40">Status</p>
                                    <p className="text-sm font-bold">Cloud Sync Active</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SparklesIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 3L14.5 10L21.5 12.5L14.5 15L12 21L9.5 15L2.5 12.5L9.5 10L12 3Z" fill="currentColor" />
        </svg>
    );
}
