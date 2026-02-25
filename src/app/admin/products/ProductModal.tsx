"use client";

import { useState, useRef } from "react";
import { X, Upload, Loader2, Image as ImageIcon, Edit2 } from "lucide-react";
import Image from "next/image";

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image_url: string;
    category: string;
    is_available: boolean;
    is_featured: boolean;
    on_sale: boolean;
    sale_price: number | null;
}

export default function ProductModal({ product, onClose, onSuccess }: { product: Product | null, onClose: () => void, onSuccess: () => void }) {
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState({
        name: product?.name || "",
        description: product?.description || "",
        price: product?.price?.toString() || "",
        category: product?.category || "Cupcakes",
        is_available: product?.is_available ?? true,
        is_featured: product?.is_featured ?? false,
        on_sale: product?.on_sale ?? false,
        sale_price: product?.sale_price?.toString() || "",
        image_url: product?.image_url || ""
    });

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        try {
            const ext = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

            // 1. Get signed URL from admin route
            const resUrl = await fetch("/api/admin/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ path: fileName, bucket: "products" })
            });
            if (!resUrl.ok) throw new Error("Failed to get upload URL");
            const { signedUrl, publicUrl } = await resUrl.json();

            // 2. Upload file directly to Supabase storage using the signed URL
            const resUpload = await fetch(signedUrl, {
                method: "PUT",
                body: file,
                headers: { "Content-Type": file.type }
            });
            if (!resUpload.ok) throw new Error("Failed to upload file to storage");

            // 3. Update form state
            setForm(prev => ({ ...prev, image_url: publicUrl }));
        } catch (error) {
            console.error(error);
            alert("Upload failed. Please try again.");
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            ...form,
            price: parseFloat(form.price),
            sale_price: form.on_sale && form.sale_price ? parseFloat(form.sale_price) : null
        };

        try {
            const res = await fetch(product ? `/api/admin/products/${product.id}` : `/api/admin/products`, {
                method: product ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Failed to save product");
            onSuccess();
        } catch (error) {
            console.error(error);
            alert("Failed to save product.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bakery-primary/20 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-6 border-b border-bakery-primary/5">
                    <h2 className="text-2xl font-playfair font-black text-bakery-primary">{product ? "Edit Product" : "New Product"}</h2>
                    <button onClick={onClose} className="p-2 bg-bakery-primary/5 hover:bg-bakery-primary/10 rounded-full transition-colors text-bakery-primary"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1">
                    {/* Image Upload Area */}
                    <div className="space-y-2">
                        <label className="text-sm font-black text-bakery-primary uppercase tracking-widest">Product Image</label>
                        <div
                            className="bg-bakery-primary/5 border-2 border-dashed border-bakery-primary/20 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-bakery-primary/10 transition-colors relative overflow-hidden h-48"
                            onClick={() => !uploadingImage && fileInputRef.current?.click()}
                        >
                            {form.image_url ? (
                                <>
                                    <Image src={form.image_url} alt="Preview" fill className="object-cover opacity-50" />
                                    <div className="relative z-10 bg-white/90 backdrop-blur px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm">
                                        <Edit2 size={16} /> Change Image
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-bakery-cta"><ImageIcon size={24} /></div>
                                    <div className="text-center">
                                        <p className="text-sm font-bold text-bakery-primary">Click to upload image</p>
                                        <p className="text-xs font-medium text-bakery-primary/50 mt-1">JPEG, PNG, WEBP max 5MB</p>
                                    </div>
                                </>
                            )}
                            {uploadingImage && (
                                <div className="absolute inset-0 bg-white/80 backdrop-blur flex items-center justify-center z-20">
                                    <div className="flex flex-col items-center gap-2 text-bakery-cta">
                                        <div className="w-8 h-8 border-4 border-bakery-cta border-t-transparent rounded-full animate-spin" />
                                        <span className="text-xs font-black uppercase tracking-wider">Uploading...</span>
                                    </div>
                                </div>
                            )}
                            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-bakery-primary/5 pb-6">
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-black text-bakery-primary uppercase tracking-widest">Name</label>
                            <input required type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 bg-bakery-primary/5 rounded-xl border-none focus:ring-2 focus:ring-bakery-cta outline-none text-bakery-primary font-medium" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-black text-bakery-primary uppercase tracking-widest">Description</label>
                            <textarea required rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-3 bg-bakery-primary/5 rounded-xl border-none focus:ring-2 focus:ring-bakery-cta outline-none text-bakery-primary font-medium resize-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-black text-bakery-primary uppercase tracking-widest">Regular Price (£)</label>
                            <input required type="number" step="0.01" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full px-4 py-3 bg-bakery-primary/5 rounded-xl border-none focus:ring-2 focus:ring-bakery-cta outline-none text-bakery-primary font-medium" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-black text-bakery-primary uppercase tracking-widest">Category</label>
                            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-3 bg-bakery-primary/5 rounded-xl border-none focus:ring-2 focus:ring-bakery-cta outline-none text-bakery-primary font-medium capitalize">
                                <option value="Cupcakes">Cupcakes</option>
                                <option value="Brownies">Brownies</option>
                                <option value="Cookies">Cookies</option>
                                <option value="Cakes">Cakes</option>
                                <option value="Pastries">Pastries</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-black text-bakery-primary uppercase tracking-widest">Pricing & Visibility</h3>

                        <label className="flex items-center gap-3 p-4 rounded-xl border border-bakery-primary/10 cursor-pointer hover:bg-bakery-primary/[0.02] transition-colors">
                            <input type="checkbox" checked={form.is_available} onChange={e => setForm({ ...form, is_available: e.target.checked })} className="w-5 h-5 rounded text-bakery-cta focus:ring-bakery-cta bg-bakery-primary/5 border-transparent" />
                            <div className="flex-1">
                                <p className="font-bold text-bakery-primary text-sm">Available for Purchase</p>
                                <p className="text-xs text-bakery-primary/60">Customers can add this item to basket.</p>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 p-4 rounded-xl border border-bakery-primary/10 cursor-pointer hover:bg-bakery-primary/[0.02] transition-colors">
                            <input type="checkbox" checked={form.is_featured} onChange={e => setForm({ ...form, is_featured: e.target.checked })} className="w-5 h-5 rounded text-bakery-cta focus:ring-bakery-cta bg-bakery-primary/5 border-transparent" />
                            <div className="flex-1">
                                <p className="font-bold text-bakery-primary text-sm">Featured Product</p>
                                <p className="text-xs text-bakery-primary/60">Highlight on the homepage and top spots.</p>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 p-4 rounded-xl border border-bakery-primary/10 cursor-pointer hover:bg-bakery-primary/[0.02] transition-colors">
                            <input type="checkbox" checked={form.on_sale} onChange={e => setForm({ ...form, on_sale: e.target.checked })} className="w-5 h-5 rounded text-bakery-cta focus:ring-bakery-cta bg-bakery-primary/5 border-transparent" />
                            <div className="flex-1">
                                <p className="font-bold text-bakery-primary text-sm">On Sale</p>
                                <p className="text-xs text-bakery-primary/60">Activate sale pricing for this item.</p>
                            </div>
                        </label>

                        {form.on_sale && (
                            <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                                <label className="text-sm font-black text-orange-600 uppercase tracking-widest">Sale Price (£)</label>
                                <input required={form.on_sale} type="number" step="0.01" min="0" value={form.sale_price} onChange={e => setForm({ ...form, sale_price: e.target.value })} className="w-full px-4 py-3 bg-orange-50 rounded-xl border border-orange-200 focus:ring-2 focus:ring-orange-500 outline-none text-orange-700 font-bold" />
                            </div>
                        )}
                    </div>
                </form>

                <div className="p-6 border-t border-bakery-primary/5 bg-gray-50 flex justify-end gap-3 shrink-0">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-black text-sm text-bakery-primary hover:bg-black/5 transition-colors">Cancel</button>
                    <button onClick={handleSubmit} disabled={loading} className="bg-bakery-cta text-white px-8 py-2.5 rounded-xl font-black text-sm hover:bg-orange-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading && <Loader2 size={16} className="animate-spin" />}
                        {product ? "Save Changes" : "Create Product"}
                    </button>
                </div>
            </div>
        </div>
    );
}
