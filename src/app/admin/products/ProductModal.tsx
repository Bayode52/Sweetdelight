"use client";

import { useState, useRef } from "react";
import { X, Upload, Loader2, Image as ImageIcon, Edit2, Plus, Trash2, GripVertical, AlertCircle } from "lucide-react";
import Image from "next/image";
import { motion, Reorder } from "framer-motion";

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
        image_url: product?.image_url || "",
        images: product?.images || [] as ProductImage[],
        meta_title: product?.meta_title || "",
        meta_description: product?.meta_description || ""
    });

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploadingImage(true);
        try {
            const newImages: ProductImage[] = [...form.images];

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const ext = file.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

                const resUrl = await fetch("/api/admin/upload", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ path: fileName, bucket: "products" })
                });
                if (!resUrl.ok) continue;
                const { signedUrl, publicUrl } = await resUrl.json();

                const resUpload = await fetch(signedUrl, {
                    method: "PUT",
                    body: file,
                    headers: { "Content-Type": file.type }
                });
                if (!resUpload.ok) continue;

                newImages.push({
                    id: Math.random().toString(36).substring(7),
                    url: publicUrl,
                    alt: form.name || "Product Image"
                });
            }

            setForm(prev => ({
                ...prev,
                images: newImages,
                image_url: newImages[0]?.url || prev.image_url
            }));
        } catch (error) {
            console.error(error);
            alert("Upload failed. Please try again.");
        } finally {
            setUploadingImage(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const removeImage = (id: string) => {
        const filtered = form.images.filter(img => img.id !== id);
        setForm(prev => ({
            ...prev,
            images: filtered,
            image_url: filtered[0]?.url || ""
        }));
    };

    const reorderImages = (newImages: ProductImage[]) => {
        setForm(prev => ({
            ...prev,
            images: newImages,
            image_url: newImages[0]?.url || prev.image_url
        }));
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
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-black text-bakery-primary uppercase tracking-widest">Product Images</label>
                            <span className="text-[10px] font-bold text-bakery-primary/40 uppercase tracking-widest">
                                {form.images.length} {form.images.length === 1 ? 'Image' : 'Images'}
                            </span>
                        </div>

                        <Reorder.Group axis="y" values={form.images} onReorder={reorderImages} className="space-y-3">
                            {form.images.map((image) => (
                                <Reorder.Item
                                    key={image.id}
                                    value={image}
                                    className="bg-bakery-primary/5 rounded-2xl p-3 flex items-center gap-4 group border border-transparent hover:border-bakery-primary/10 transition-colors"
                                >
                                    <div className="cursor-grab active:cursor-grabbing text-bakery-primary/20 hover:text-bakery-primary/40 transition-colors shrink-0">
                                        <GripVertical size={20} />
                                    </div>
                                    <div className="h-16 w-16 bg-white rounded-xl relative overflow-hidden shrink-0 shadow-sm border border-bakery-primary/5">
                                        <Image src={image.url} alt={image.alt} fill className="object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <input
                                            type="text"
                                            value={image.alt}
                                            placeholder="Alt text (SEO)"
                                            onChange={(e) => {
                                                const updated = form.images.map(img => img.id === image.id ? { ...img, alt: e.target.value } : img);
                                                setForm({ ...form, images: updated });
                                            }}
                                            className="w-full bg-transparent border-none text-sm font-medium text-bakery-primary p-0 h-6 focus:ring-0 placeholder:text-bakery-primary/20"
                                        />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-bakery-primary/30 mt-1 truncate">
                                            {image.url.split('/').pop()}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeImage(image.id)}
                                        className="p-2 text-bakery-primary/20 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </Reorder.Item>
                            ))}
                        </Reorder.Group>

                        <div
                            className="bg-bakery-cta/[0.03] border-2 border-dashed border-bakery-cta/20 rounded-[32px] p-8 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-bakery-cta/[0.06] hover:border-bakery-cta/40 transition-all group relative overflow-hidden min-h-[140px]"
                            onClick={() => !uploadingImage && fileInputRef.current?.click()}
                        >
                            <div className="w-14 h-14 bg-white rounded-[20px] flex items-center justify-center shadow-md text-bakery-cta group-hover:scale-110 transition-transform">
                                {uploadingImage ? <Loader2 size={24} className="animate-spin" /> : <Plus size={24} />}
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-black text-bakery-primary uppercase tracking-widest">
                                    {uploadingImage ? "Uploading..." : "Add Product Images"}
                                </p>
                                <p className="text-xs font-bold text-bakery-primary/40 mt-1">Drag and drop or click to browse</p>
                            </div>
                            <input type="file" multiple ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
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

                        <div className="pt-6 border-t border-bakery-primary/5 space-y-4">
                            <h3 className="text-sm font-black text-bakery-primary uppercase tracking-widest">Search Optimization (SEO)</h3>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-bakery-primary/40 uppercase tracking-widest">Meta Title</label>
                                <input
                                    type="text"
                                    value={form.meta_title}
                                    onChange={e => setForm({ ...form, meta_title: e.target.value })}
                                    placeholder="Search engine title..."
                                    className="w-full px-4 py-3 bg-bakery-primary/5 rounded-xl border-none focus:ring-2 focus:ring-bakery-cta outline-none text-bakery-primary font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-bakery-primary/40 uppercase tracking-widest">Meta Description</label>
                                <textarea
                                    rows={2}
                                    value={form.meta_description}
                                    onChange={e => setForm({ ...form, meta_description: e.target.value })}
                                    placeholder="Search engine summary..."
                                    className="w-full px-4 py-3 bg-bakery-primary/5 rounded-xl border-none focus:ring-2 focus:ring-bakery-cta outline-none text-bakery-primary font-medium resize-none"
                                />
                            </div>
                        </div>
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
