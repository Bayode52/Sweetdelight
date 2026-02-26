"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Layout, Home, Info, Phone, Mail, Save,
    Image as ImageIcon, Upload, Loader2, ArrowRight,
    Type, AlignLeft, Sparkles, Globe
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

interface ContentField {
    id?: string;
    page: string;
    section: string;
    field: string;
    value: string;
    label: string;
    type: 'text' | 'textarea' | 'image' | 'color';
}

const PAGE_DEFINITIONS = {
    home: {
        label: "Homepage",
        icon: Home,
        sections: [
            {
                id: 'hero', label: 'Hero Section', fields: [
                    { id: 'badge', label: 'Small Badge Title', type: 'text' },
                    { id: 'headline', label: 'Main Headline', type: 'text' },
                    { id: 'subheadline', label: 'Supporting Sub-headline', type: 'textarea' },
                    { id: 'cta_text', label: 'Call to Action Button', type: 'text' },
                    { id: 'hero_image', label: 'Floating Hero Image', type: 'image' },
                ]
            },
            {
                id: 'delivery_banner', label: 'Scrolling Banner', fields: [
                    { id: 'text', label: 'Banner Text Content', type: 'textarea' },
                ]
            },
            {
                id: 'categories', label: 'Categories Section', fields: [
                    { id: 'badge', label: 'Section Badge', type: 'text' },
                    { id: 'heading', label: 'Section Heading', type: 'text' },
                    { id: 'button_text', label: 'Action Button Text', type: 'text' },
                ]
            }
        ]
    },
    about: {
        label: "About Us",
        icon: Info,
        sections: [
            {
                id: 'header', label: 'Header Section', fields: [
                    { id: 'title', label: 'Page Title', type: 'text' },
                    { id: 'subtitle', label: 'Subtitle Paragraph', type: 'textarea' },
                    { id: 'hero_image', label: 'About Hero Image', type: 'image' },
                ]
            },
            {
                id: 'baker', label: 'The Baker Section', fields: [
                    { id: 'name', label: 'Baker Name', type: 'text' },
                    { id: 'bio', label: 'Baker Biography', type: 'textarea' },
                    { id: 'image', label: 'Baker Image', type: 'image' },
                ]
            }
        ]
    },
    contact: {
        label: "Contact",
        icon: Phone,
        sections: [
            {
                id: 'header', label: 'Header', fields: [
                    { id: 'title', label: 'Headline', type: 'text' },
                    { id: 'subtitle', label: 'Sub-headline', type: 'text' },
                ]
            },
            {
                id: 'info', label: 'Contact Details', fields: [
                    { id: 'address', label: 'Physical Address', type: 'textarea' },
                    { id: 'whatsapp', label: 'WhatsApp Number', type: 'text' },
                    { id: 'email', label: 'Contact Email', type: 'text' },
                ]
            }
        ]
    },
    footer: {
        label: "Global Footer",
        icon: Globe,
        sections: [
            {
                id: 'about', label: 'Footer Brand Box', fields: [
                    { id: 'text', label: 'About Brand Text', type: 'textarea' },
                ]
            }
        ]
    }
};

export default function ContentManagerPage() {
    const queryClient = useQueryClient();
    const [activePage, setActivePage] = useState<keyof typeof PAGE_DEFINITIONS>("home");
    const [localChanges, setLocalChanges] = useState<Record<string, string>>({});
    const [uploadingField, setUploadingField] = useState<string | null>(null);

    const { data: dbContent, isLoading } = useQuery({
        queryKey: ["site-content"],
        queryFn: async () => {
            const contentRes = await fetch("/api/admin/content?all=true");
            if (!contentRes.ok) return [];
            return await contentRes.json();
        }
    });

    const saveMutation = useMutation({
        mutationFn: async (fields: any[]) => {
            const res = await fetch("/api/admin/content", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fields })
            });
            if (!res.ok) throw new Error("Failed to save changes");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["site-content"] });
            setLocalChanges({});
            toast.success("Website content updated successfully!", {
                icon: '✨',
                style: { borderRadius: '20px', background: '#2D1806', color: '#fff', fontClass: 'font-black uppercase tracking-widest text-[10px]' }
            });
        }
    });

    const handleFieldChange = (section: string, field: string, value: string) => {
        setLocalChanges(prev => ({
            ...prev,
            [`${activePage}.${section}.${field}`]: value
        }));
    };

    const handleImageUpload = async (section: string, field: string, file: File) => {
        const key = `${activePage}.${section}.${field}`;
        setUploadingField(key);
        try {
            const fileName = `site/${activePage}/${section}-${field}-${Date.now()}`;
            const uploadRes = await fetch("/api/admin/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ path: fileName, bucket: "site-images" })
            });

            if (!uploadRes.ok) throw new Error("Upload failed");
            const { signedUrl, publicUrl } = await uploadRes.json();

            const putRes = await fetch(signedUrl, {
                method: "PUT",
                body: file,
                headers: { "Content-Type": file.type }
            });

            if (!putRes.ok) throw new Error("Storage failed");
            handleFieldChange(section, field, publicUrl);
        } catch (err) {
            toast.error("Image upload failed");
        } finally {
            setUploadingField(null);
        }
    };

    const getValue = (section: string, field: string) => {
        const key = `${activePage}.${section}.${field}`;
        if (localChanges[key] !== undefined) return localChanges[key];
        const dbItem = dbContent?.find((item: any) => item.page === activePage && item.section === section && item.field === field);
        return dbItem?.value || "";
    };

    if (isLoading) return (
        <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
            <Loader2 size={40} className="text-bakery-cta animate-spin" />
            <p className="font-playfair font-black text-bakery-primary/40 uppercase tracking-widest text-sm italic">Loading the Master Editor...</p>
        </div>
    );

    const hasChanges = Object.keys(localChanges).length > 0;

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-6xl mx-auto">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-bakery-cta/10 rounded-2xl flex items-center justify-center text-bakery-cta">
                            <Sparkles size={24} />
                        </div>
                        <h1 className="text-4xl font-playfair font-black text-bakery-primary italic tracking-tight">Website Editor</h1>
                    </div>
                    <p className="text-bakery-primary/40 font-medium uppercase tracking-[0.2em] text-[10px] ml-1">Live CMS for Absolute Brand Control</p>
                </div>

                {hasChanges && (
                    <motion.button
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => {
                            const fields = Object.entries(localChanges).map(([key, value]) => {
                                const [page, section, field] = key.split('.');
                                return { page, section, field, value };
                            });
                            saveMutation.mutate(fields);
                        }}
                        disabled={saveMutation.isPending}
                        className="bg-bakery-cta text-white px-8 py-4 rounded-[28px] font-black text-sm uppercase tracking-widest hover:brightness-110 shadow-xl shadow-bakery-cta/20 flex items-center gap-3 transition-all disabled:opacity-50"
                    >
                        {saveMutation.isPending ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                        Save All Changes
                    </motion.button>
                )}
            </header>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Navigation Sidebar */}
                <aside className="w-full lg:w-64 space-y-2">
                    {Object.entries(PAGE_DEFINITIONS).map(([id, def]) => {
                        const Icon = def.icon;
                        const pageChanges = Object.keys(localChanges).filter(k => k.startsWith(id)).length;
                        return (
                            <button
                                key={id}
                                onClick={() => setActivePage(id as any)}
                                className={`w-full flex items-center justify-between p-5 rounded-[28px] transition-all group ${activePage === id
                                    ? "bg-bakery-primary text-white shadow-xl shadow-bakery-primary/10"
                                    : "bg-white text-bakery-primary/50 hover:bg-bakery-primary/5 luxury-shadow border border-bakery-primary/5"
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <Icon size={20} className={activePage === id ? "text-bakery-cta" : "group-hover:text-bakery-primary transition-colors"} />
                                    <span className="font-playfair font-black tracking-tight">{def.label}</span>
                                </div>
                                {pageChanges > 0 && (
                                    <span className="w-5 h-5 bg-bakery-cta text-white text-[10px] font-black flex items-center justify-center rounded-full shadow-sm">
                                        {pageChanges}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </aside>

                {/* Editor Surface */}
                <main className="flex-1 space-y-8">
                    {PAGE_DEFINITIONS[activePage].sections.map((section) => (
                        <div key={section.id} className="bg-white rounded-[40px] luxury-shadow border border-bakery-primary/5 overflow-hidden">
                            <div className="px-10 py-6 bg-bakery-primary/[0.02] border-b border-bakery-primary/5 flex items-center justify-between">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-bakery-primary/60">{section.label}</h3>
                                <div className="p-2 bg-white rounded-xl shadow-sm border border-bakery-primary/5">
                                    <Layout size={14} className="text-bakery-primary/20" />
                                </div>
                            </div>

                            <div className="p-10 space-y-8">
                                {section.fields.map((field) => (
                                    <div key={field.id} className="space-y-3">
                                        <div className="flex justify-between items-center px-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-bakery-primary/40">{field.label}</label>
                                            {field.type === 'image' && (
                                                <span className="text-[9px] font-bold text-bakery-cta/60 italic">Dimensions: Auto-fit</span>
                                            )}
                                        </div>

                                        {field.type === 'text' && (
                                            <input
                                                type="text"
                                                value={getValue(section.id, field.id)}
                                                onChange={(e) => handleFieldChange(section.id, field.id, e.target.value)}
                                                className="w-full h-14 px-6 bg-bakery-primary/[0.02] rounded-2xl border border-bakery-primary/5 focus:bg-white focus:border-bakery-cta focus:ring-4 focus:ring-bakery-cta/5 transition-all text-bakery-primary font-bold outline-none"
                                            />
                                        )}

                                        {field.type === 'textarea' && (
                                            <textarea
                                                rows={4}
                                                value={getValue(section.id, field.id)}
                                                onChange={(e) => handleFieldChange(section.id, field.id, e.target.value)}
                                                className="w-full p-6 bg-bakery-primary/[0.02] rounded-3xl border border-bakery-primary/5 focus:bg-white focus:border-bakery-cta focus:ring-4 focus:ring-bakery-cta/5 transition-all text-bakery-primary font-medium outline-none resize-none leading-relaxed"
                                            />
                                        )}

                                        {field.type === 'image' && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="h-40 bg-bakery-primary/[0.02] rounded-3xl border-2 border-dashed border-bakery-primary/10 overflow-hidden relative group">
                                                    {getValue(section.id, field.id) ? (
                                                        <>
                                                            <img src={getValue(section.id, field.id)} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                                                <button onClick={() => handleFieldChange(section.id, field.id, "")} className="p-3 bg-red-500 text-white rounded-2xl shadow-lg">
                                                                    <ArrowRight className="rotate-45" size={20} />
                                                                </button>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-bakery-primary/20">
                                                            <ImageIcon size={32} />
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-center px-4">No image selected</p>
                                                        </div>
                                                    )}
                                                </div>

                                                <label className="h-40 rounded-3xl border-2 border-dashed border-bakery-cta/20 bg-bakery-cta/[0.02] hover:bg-bakery-cta/[0.05] hover:border-bakery-cta/40 transition-all flex flex-col items-center justify-center gap-3 cursor-pointer group">
                                                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-bakery-cta group-hover:scale-110 transition-transform">
                                                        {uploadingField === `${activePage}.${section.id}.${field.id}` ? (
                                                            <Loader2 size={24} className="animate-spin" />
                                                        ) : (
                                                            <Upload size={24} />
                                                        )}
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-xs font-black text-bakery-primary uppercase tracking-widest">Upload Image</p>
                                                        <p className="text-[10px] font-bold text-bakery-primary/40 mt-1 uppercase tracking-widest">JPG, PNG OR WEBP</p>
                                                    </div>
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) handleImageUpload(section.id, field.id, file);
                                                        }}
                                                    />
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </main>
            </div>
        </div>
    );
}
