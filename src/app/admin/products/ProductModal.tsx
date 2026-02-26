"use client";

import { useState, useRef } from "react";
import { X, Upload, Loader2, Image as ImageIcon, Edit2, Plus, Trash2, GripVertical, AlertCircle } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

interface ProductImage {
    id: string;
    url: string;
    alt: string;
}

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image_url: string;
    images?: ProductImage[];
    category: string;
    is_available: boolean;
    is_featured: boolean;
    on_sale: boolean;
    sale_price: number | null;
    meta_title?: string;
    meta_description?: string;
}

export default function ProductModal({ product, onClose, onSuccess }: { product: Product | null, onClose: () => void, onSuccess: () => void }) {
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [form, setForm] = useState({
        name: product?.name || "",
        description: product?.description || "",
        price: product?.price?.toString() || "",
        category: product?.category || "Cupcakes",
        is_available: product?.is_available ?? true,
        is_featured: product?.is_featured ?? false,
        on_sale: product?.on_sale ?? false,
        sale_price: product?.sale_price?.toString() || "",
        image_url: product?.image_url || "",
        images: product?.images?.map(img => img.url) || [] as string[],
        meta_title: product?.meta_title || "",
        meta_description: product?.meta_description || ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            ...form,
            price: parseFloat(form.price),
            sale_price: form.on_sale && form.sale_price ? parseFloat(form.sale_price) : null,
            images: form.images, // Now matches database text[]
            image_url: form.images[0] || ""
        };

        try {
            const res = await fetch(product ? `/api/admin/products/${product.id}` : `/api/admin/products`, {
                method: product ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Failed to save product");
            onSuccess();
            toast.success(product ? "Product updated!" : "Product created!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to save product.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bakery-primary/20 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[40px] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative"
            >
                <div className="flex justify-between items-center p-8 border-b border-bakery-primary/5">
                    <div>
                        <h2 className="text-3xl font-playfair font-black text-bakery-primary italic">{product ? "Edit Delight" : "New Creation"}</h2>
                        <p className="text-[10px] font-black uppercase tracking-widest text-bakery-primary/30 mt-1">Product Details & Imagery</p>
                    </div>
                    <button onClick={onClose} className="p-3 bg-bakery-primary/5 hover:bg-bakery-primary/10 rounded-2xl transition-all text-bakery-primary/40"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto p-8 space-y-8 flex-1 custom-scrollbar">
                    {/* Images Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-bakery-primary/40">Product Imagery</label>
                            <span className="text-[10px] font-bold text-bakery-primary/20">{form.images.length}/6 Images</span>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {form.images.map((img, idx) => (
                                <div key={idx} className="aspect-square rounded-3xl overflow-hidden relative group luxury-shadow border border-bakery-primary/5">
                                    <img src={img} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setForm({ ...form, images: form.images.filter((_, i) => i !== idx) })}
                                            className="p-2 bg-red-500 text-white rounded-xl shadow-lg hover:scale-110 transition-transform"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-[8px] text-white font-black uppercase tracking-widest">
                                        {idx === 0 ? "Main" : `Alt ${idx}`}
                                    </div>
                                </div>
                            ))}

                            {form.images.length < 6 && (
                                <label className="aspect-square rounded-3xl border-2 border-dashed border-bakery-primary/10 bg-bakery-primary/[0.02] hover:bg-bakery-primary/[0.05] hover:border-bakery-cta/30 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer group">
                                    <div className="w-10 h-10 bg-white rounded-2xl shadow-sm flex items-center justify-center text-bakery-primary/20 group-hover:text-bakery-cta group-hover:scale-110 transition-all">
                                        {uploading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-bakery-primary/40">Add Image</span>
                                    <input
                                        type="file"
                                        className="hidden"
                                        multiple
                                        accept="image/*"
                                        onChange={async (e) => {
                                            const files = Array.from(e.target.files || []);
                                            if (files.length === 0) return;

                                            setUploading(true);
                                            try {
                                                const uploadPromises = files.map(async (file) => {
                                                    const fileName = `products/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
                                                    const res = await fetch("/api/admin/upload", {
                                                        method: "POST",
                                                        headers: { "Content-Type": "application/json" },
                                                        body: JSON.stringify({ path: fileName, bucket: "products" })
                                                    });

                                                    const { signedUrl, publicUrl } = await res.json();

                                                    await fetch(signedUrl, {
                                                        method: "PUT",
                                                        body: file,
                                                        headers: { "Content-Type": file.type }
                                                    });

                                                    return publicUrl;
                                                });

                                                const uploadedUrls = await Promise.all(uploadPromises);
                                                setForm({ ...form, images: [...form.images, ...uploadedUrls].slice(0, 6) });
                                                toast.success("Images uploaded successfully");
                                            } catch (err) {
                                                toast.error("Upload failed");
                                            } finally {
                                                setUploading(false);
                                            }
                                        }}
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-bakery-primary/40">Delight Name</label>
                            <input required type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full h-14 px-6 bg-bakery-primary/5 rounded-2xl border-none focus:ring-2 focus:ring-bakery-cta outline-none text-bakery-primary font-bold text-lg" placeholder="e.g. Red Velvet Dream" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-bakery-primary/40">Description</label>
                            <textarea required rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-6 py-4 bg-bakery-primary/5 rounded-2xl border-none focus:ring-2 focus:ring-bakery-cta outline-none text-bakery-primary font-medium resize-none" placeholder="Describe the flavors..." />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-bakery-primary/40">Regular Price (£)</label>
                            <input required type="number" step="0.01" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full h-14 px-6 bg-bakery-primary/5 rounded-2xl border-none focus:ring-2 focus:ring-bakery-cta outline-none text-bakery-primary font-bold" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-bakery-primary/40">Category</label>
                            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full h-14 px-6 bg-bakery-primary/5 rounded-2xl border-none focus:ring-2 focus:ring-bakery-cta outline-none text-bakery-primary font-bold capitalize cursor-pointer">
                                <option value="Cupcakes">Cupcakes</option>
                                <option value="Brownies">Brownies</option>
                                <option value="Cookies">Cookies</option>
                                <option value="Cakes">Cakes</option>
                                <option value="Pastries">Pastries</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4">
                        <div className="flex items-center justify-between p-6 rounded-[32px] border border-bakery-primary/10 hover:bg-bakery-primary/[0.01] transition-all cursor-pointer group" onClick={() => setForm({ ...form, is_available: !form.is_available })}>
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${form.is_available ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    <AlertCircle size={24} />
                                </div>
                                <div>
                                    <p className="font-black text-bakery-primary text-sm uppercase tracking-widest">Available for Purchase</p>
                                    <p className="text-[10px] font-bold text-bakery-primary/40 mt-0.5">Toggle customer access</p>
                                </div>
                            </div>
                            <div className={`w-14 h-8 rounded-full relative transition-colors ${form.is_available ? 'bg-bakery-cta' : 'bg-bakery-primary/10'}`}>
                                <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all shadow-sm ${form.is_available ? 'left-7' : 'left-1'}`} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="p-5 rounded-[32px] border border-bakery-primary/10 flex items-center gap-4 cursor-pointer hover:bg-bakery-primary/[0.01] transition-all">
                                <input type="checkbox" checked={form.is_featured} onChange={e => setForm({ ...form, is_featured: e.target.checked })} className="w-6 h-6 rounded-xl text-bakery-cta focus:ring-bakery-cta bg-bakery-primary/5 border-transparent" />
                                <div>
                                    <p className="font-black text-bakery-primary text-sm uppercase tracking-widest">Featured</p>
                                    <p className="text-[10px] font-bold text-bakery-primary/40">Home spotlight</p>
                                </div>
                            </label>
                            <label className="p-5 rounded-[32px] border border-bakery-primary/10 flex items-center gap-4 cursor-pointer hover:bg-bakery-primary/[0.01] transition-all">
                                <input type="checkbox" checked={form.on_sale} onChange={e => setForm({ ...form, on_sale: e.target.checked })} className="w-6 h-6 rounded-xl text-bakery-cta focus:ring-bakery-cta bg-bakery-primary/5 border-transparent" />
                                <div>
                                    <p className="font-black text-bakery-primary text-sm uppercase tracking-widest">On Sale</p>
                                    <p className="text-[10px] font-bold text-bakery-primary/40">Sale pricing active</p>
                                </div>
                            </label>
                        </div>

                        {form.on_sale && (
                            <div className="p-6 rounded-[32px] bg-orange-50 border border-orange-100 space-y-3 animate-in slide-in-from-top-4 duration-300">
                                <label className="text-[10px] font-black uppercase tracking-widest text-orange-600">Flash Sale Price (£)</label>
                                <input required={form.on_sale} type="number" step="0.01" min="0" value={form.sale_price} onChange={e => setForm({ ...form, sale_price: e.target.value })} className="w-full h-14 px-6 bg-white rounded-2xl border border-orange-200 focus:ring-2 focus:ring-orange-500 outline-none text-orange-700 font-bold text-xl" placeholder="0.00" />
                            </div>
                        )}
                    </div>

                    <div className="pt-8 border-t border-bakery-primary/5 space-y-6">
                        <div className="flex items-center gap-2">
                            <ImageIcon size={16} className="text-bakery-primary/30" />
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-bakery-primary/40">Search & Metadata (SEO)</h3>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-bakery-primary/40 ml-1">Meta Title</label>
                            <input type="text" value={form.meta_title} onChange={e => setForm({ ...form, meta_title: e.target.value })} className="w-full h-12 px-6 bg-bakery-primary/5 rounded-2xl border-none focus:ring-2 focus:ring-bakery-cta outline-none text-bakery-primary text-sm font-medium" placeholder="Baker's best seller..." />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-bakery-primary/40 ml-1">Meta Description</label>
                            <textarea rows={2} value={form.meta_description} onChange={e => setForm({ ...form, meta_description: e.target.value })} className="w-full px-6 py-4 bg-bakery-primary/5 rounded-2xl border-none focus:ring-2 focus:ring-bakery-cta outline-none text-bakery-primary text-sm font-medium resize-none" placeholder="A brief summary for search engines..." />
                        </div>
                    </div>
                </form>

                <div className="p-8 border-t border-bakery-primary/5 bg-gray-50 flex justify-end gap-4 shrink-0">
                    <button type="button" onClick={onClose} className="px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-bakery-primary/40 hover:text-bakery-primary hover:bg-black/5 transition-all">Cancel</button>
                    <button onClick={handleSubmit} disabled={loading} className="bg-bakery-cta text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-orange-600 transition-all shadow-lg shadow-bakery-cta/20 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading ? <Loader2 size={16} className="animate-spin" /> : product ? "Update Delight" : "Create Delight"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
