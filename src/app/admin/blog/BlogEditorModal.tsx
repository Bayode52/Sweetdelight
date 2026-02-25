"use client";

import { useState, useRef } from "react";
import { X, Loader2, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    category: string;
    excerpt: string;
    content: string;
    cover_image: string;
    status: "published" | "draft" | "archived";
}

export default function BlogEditorModal({ post, onClose, onSuccess }: { post: BlogPost | null, onClose: () => void, onSuccess: () => void }) {
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState({
        title: post?.title || "",
        slug: post?.slug || "",
        category: post?.category || "Updates",
        excerpt: post?.excerpt || "",
        content: post?.content || "",
        cover_image: post?.cover_image || "",
        status: post?.status || "draft"
    });

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        try {
            const ext = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

            const resUrl = await fetch("/api/admin/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ path: fileName, bucket: "blog" }) // Note: Requires a 'blog' bucket in Supabase
            });
            if (!resUrl.ok) throw new Error("Failed to get upload URL");
            const { signedUrl, publicUrl } = await resUrl.json();

            const resUpload = await fetch(signedUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
            if (!resUpload.ok) throw new Error("Failed to upload file");

            setForm(prev => ({ ...prev, cover_image: publicUrl }));
        } catch (error) {
            console.error(error);
            alert("Upload failed. Ensure a 'blog' storage bucket exists in Supabase.");
        } finally {
            setUploadingImage(false);
        }
    };

    const generateSlug = () => {
        if (!form.title) return;
        const s = form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        setForm(prev => ({ ...prev, slug: s }));
    };

    const handleSubmit = async (e: React.FormEvent, isDraft = false) => {
        e.preventDefault();
        setLoading(true);

        const payload = { ...form, status: isDraft ? "draft" : "published" };

        try {
            const res = await fetch(post ? `/api/admin/blog/${post.id}` : `/api/admin/blog`, {
                method: post ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Failed to save post");
            onSuccess();
        } catch (error) {
            console.error(error);
            alert("Failed to save post.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6 bg-bakery-primary/20 backdrop-blur-sm">
            <div className="bg-white md:rounded-3xl w-full h-full md:max-h-[90vh] md:max-w-4xl overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-4 md:p-6 border-b border-bakery-primary/5 shrink-0">
                    <h2 className="text-2xl font-playfair font-black text-bakery-primary">{post ? "Edit Post" : "Compose Post"}</h2>
                    <button onClick={onClose} className="p-2 bg-bakery-primary/5 hover:bg-bakery-primary/10 rounded-full transition-colors text-bakery-primary"><X size={20} /></button>
                </div>

                <div className="overflow-y-auto p-4 md:p-6 flex-1 bg-bakery-primary/[0.02]">
                    <div className="max-w-3xl mx-auto space-y-6">

                        {/* Cover Image */}
                        <div
                            className="bg-white border hover:border-bakery-cta border-bakery-primary/10 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors relative overflow-hidden h-64 shadow-sm"
                            onClick={() => !uploadingImage && fileInputRef.current?.click()}
                        >
                            {form.cover_image ? (
                                <>
                                    <Image src={form.cover_image} alt="Cover" fill className="object-cover" />
                                    <div className="absolute inset-0 bg-black/20 hover:bg-black/40 transition-colors flex items-center justify-center">
                                        <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg text-bakery-primary">
                                            Change Cover Image
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="w-14 h-14 bg-bakery-primary/5 rounded-full flex items-center justify-center shadow-inner text-bakery-primary/30"><ImageIcon size={28} /></div>
                                    <div className="text-center">
                                        <p className="font-bold text-bakery-primary text-lg font-playfair">Add Cover Image</p>
                                        <p className="text-xs font-medium text-bakery-primary/50 mt-1 uppercase tracking-widest">Recommended: 1200x630px</p>
                                    </div>
                                </>
                            )}
                            {uploadingImage && (
                                <div className="absolute inset-0 bg-white/80 backdrop-blur flex flex-col items-center justify-center z-20">
                                    <div className="w-8 h-8 border-4 border-bakery-cta border-t-transparent rounded-full animate-spin mb-2" />
                                    <span className="text-xs font-black uppercase tracking-wider text-bakery-cta">Uploading...</span>
                                </div>
                            )}
                            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                        </div>

                        {/* Title & Slug */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-bakery-primary/5 space-y-6">
                            <div>
                                <label className="text-xs font-black text-bakery-primary/40 uppercase tracking-widest block mb-2">Title</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                    onBlur={() => !post && generateSlug()}
                                    placeholder="Enter an engaging title..."
                                    className="w-full text-3xl font-playfair font-black text-bakery-primary placeholder:text-bakery-primary/20 border-none outline-none focus:ring-0 p-0"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-bakery-primary/5">
                                <div>
                                    <label className="text-xs font-black text-bakery-primary/40 uppercase tracking-widest block mb-2">URL Slug</label>
                                    <div className="flex items-center text-sm font-medium bg-bakery-primary/5 rounded-xl px-3 py-2 border border-transparent focus-within:border-bakery-cta focus-within:ring-1 focus-within:ring-bakery-cta">
                                        <span className="text-bakery-primary/40 mr-1 shrink-0">/blog/</span>
                                        <input type="text" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="bg-transparent border-none outline-none w-full text-bakery-primary p-0" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-bakery-primary/40 uppercase tracking-widest block mb-2">Category</label>
                                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-2 bg-bakery-primary/5 rounded-xl border-none focus:ring-1 focus:ring-bakery-cta outline-none text-bakery-primary font-bold text-sm h-[38px] capitalize">
                                        <option value="Updates">Updates</option>
                                        <option value="Recipes">Recipes</option>
                                        <option value="Behind the Scenes">Behind the Scenes</option>
                                        <option value="Guides">Guides</option>
                                        <option value="News">News</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-bakery-primary/5">
                                <label className="text-xs font-black text-bakery-primary/40 uppercase tracking-widest block mb-2">Short Excerpt</label>
                                <textarea
                                    rows={2}
                                    value={form.excerpt}
                                    onChange={e => setForm({ ...form, excerpt: e.target.value })}
                                    placeholder="A brief summary for the blog listing page..."
                                    className="w-full px-4 py-3 bg-bakery-primary/5 rounded-xl border-none focus:ring-1 focus:ring-bakery-cta outline-none text-bakery-primary font-medium resize-none text-sm"
                                />
                            </div>
                        </div>

                        {/* Markdown Content */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-bakery-primary/5 h-96 flex flex-col">
                            <div className="flex items-center justify-between mb-4 border-b border-bakery-primary/5 pb-4 shrink-0">
                                <label className="text-xs font-black text-bakery-primary/40 uppercase tracking-widest">Blog Content (Markdown Supported) *</label>
                                <a href="https://www.markdownguide.org/cheat-sheet/" target="_blank" rel="noreferrer" className="text-xs font-bold text-bakery-cta hover:underline">Formatting Guide</a>
                            </div>
                            <textarea
                                value={form.content}
                                onChange={e => setForm({ ...form, content: e.target.value })}
                                placeholder="## Write your amazing content here..."
                                className="w-full flex-1 bg-transparent border-none outline-none text-bakery-primary text-base leading-relaxed resize-none p-0 focus:ring-0 font-medium"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-4 md:p-6 border-t border-bakery-primary/5 bg-white drop-shadow-2xl flex justify-between items-center shrink-0">
                    <p className="text-xs font-bold text-bakery-primary/40 hidden md:block">
                        {form.content.length > 0 ? `${form.content.trim().split(/\s+/).length} words` : "0 words"}
                    </p>
                    <div className="flex flex-1 md:flex-none justify-end gap-3 w-full md:w-auto">
                        <button type="button" onClick={(e) => handleSubmit(e, true)} disabled={loading} className="px-5 py-2.5 rounded-xl font-black text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors flex-1 md:flex-none text-center">
                            Save Draft
                        </button>
                        <button type="button" onClick={(e) => handleSubmit(e, false)} disabled={loading || !form.title || !form.content} className="bg-bakery-cta text-white px-8 py-2.5 rounded-xl font-black text-sm hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed flex-1 md:flex-none">
                            {loading ? <Loader2 size={16} className="animate-spin" /> : "Publish Post"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
