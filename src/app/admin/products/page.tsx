"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, Star, AlertCircle } from "lucide-react";
import Image from "next/image";
import ProductModal from "./ProductModal";

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

export default function AdminProducts() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const { data: products = [], isLoading } = useQuery<Product[]>({
        queryKey: ["admin-products"],
        queryFn: async () => {
            const res = await fetch("/api/admin/products");
            if (!res.ok) throw new Error("Failed to fetch products");
            return res.json();
        }
    });

    const toggleStatus = useMutation({
        mutationFn: async ({ id, field, value }: { id: string; field: string; value: boolean }) => {
            const res = await fetch(`/api/admin/products/${id}/toggle`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ field, value })
            });
            if (!res.ok) throw new Error("Failed to update status");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-products"] });
        }
    });

    const deleteProduct = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete product");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-products"] });
        }
    });

    const categories = ["all", ...Array.from(new Set(products.map(p => p.category)))];

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto pb-24">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-playfair font-black text-bakery-primary">Products</h1>
                    <p className="text-bakery-primary/60 mt-1">Manage your bakery menu, pricing, and availability.</p>
                </div>
                <button
                    onClick={() => { setEditingProduct(null); setModalOpen(true); }}
                    className="bg-bakery-cta text-white px-5 py-2.5 rounded-xl font-black text-sm hover:bg-orange-600 transition-colors flex items-center gap-2 w-fit"
                >
                    <Plus size={18} /> Add Product
                </button>
            </div>

            <div className="bg-white rounded-3xl border border-bakery-primary/10 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-bakery-primary/5 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-bakery-primary/40" size={18} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-bakery-primary/5 rounded-xl border-none focus:ring-2 focus:ring-bakery-cta text-sm font-medium outline-none text-bakery-primary placeholder:text-bakery-primary/40"
                        />
                    </div>
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="bg-bakery-primary/5 py-2.5 px-4 rounded-xl border-none focus:ring-2 focus:ring-bakery-cta text-sm font-bold text-bakery-primary outline-none capitalize min-w-[150px]"
                    >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="p-12 flex justify-center"><div className="w-8 h-8 border-4 border-bakery-cta border-t-transparent rounded-full animate-spin" /></div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="p-12 text-center flex flex-col items-center">
                            <AlertCircle className="text-bakery-primary/20 mb-3" size={40} />
                            <p className="text-bakery-primary/60 font-bold">No products found.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-bakery-primary/5 text-xs uppercase tracking-widest text-bakery-primary/40 font-black">
                                    <th className="p-4 font-black">Product</th>
                                    <th className="p-4 font-black">Price</th>
                                    <th className="p-4 font-black">Category</th>
                                    <th className="p-4 font-black text-center">Status</th>
                                    <th className="p-4 font-black text-center">Featured</th>
                                    <th className="p-4 font-black text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-bakery-primary/5">
                                {filteredProducts.map(p => (
                                    <tr key={p.id} className={`hover:bg-bakery-primary/[0.02] transition-colors ${!p.is_available ? "opacity-50" : ""}`}>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-12 w-12 rounded-xl bg-bakery-primary/5 relative overflow-hidden shrink-0">
                                                    {p.image_url ? (
                                                        <Image src={p.image_url} alt={p.name} fill className="object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-bakery-primary/20"><Star size={16} /></div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-bakery-primary truncate max-w-[200px]">{p.name}</p>
                                                    {p.on_sale && <span className="bg-orange-100 text-orange-700 text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider mt-1 inline-block">Sale</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm font-black text-bakery-primary">
                                            {p.on_sale && p.sale_price ? (
                                                <div className="flex flex-col">
                                                    <span className="text-bakery-cta">£{p.sale_price.toFixed(2)}</span>
                                                    <span className="text-bakery-primary/40 line-through text-xs">£{p.price.toFixed(2)}</span>
                                                </div>
                                            ) : (
                                                `£${p.price.toFixed(2)}`
                                            )}
                                        </td>
                                        <td className="p-4 text-sm font-bold capitalize text-bakery-primary/70">{p.category}</td>
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => toggleStatus.mutate({ id: p.id, field: "is_available", value: !p.is_available })}
                                                className={`p-2 rounded-lg transition-colors ${p.is_available ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-700 hover:bg-red-200"}`}
                                                title={p.is_available ? "Mark Unavailable" : "Mark Available"}
                                            >
                                                {p.is_available ? <Eye size={16} /> : <EyeOff size={16} />}
                                            </button>
                                        </td>
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => toggleStatus.mutate({ id: p.id, field: "is_featured", value: !p.is_featured })}
                                                className={`p-2 rounded-lg transition-colors ${p.is_featured ? "bg-amber-100 text-amber-600 hover:bg-amber-200" : "bg-bakery-primary/5 text-bakery-primary/30 hover:bg-bakery-primary/10"}`}
                                            >
                                                <Star size={16} className={p.is_featured ? "fill-amber-600" : ""} />
                                            </button>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => { setEditingProduct(p); setModalOpen(true); }}
                                                    className="p-2 text-bakery-primary/40 hover:text-bakery-cta hover:bg-bakery-cta/10 rounded-lg transition-colors"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => { if (window.confirm("Are you sure you want to delete this product?")) deleteProduct.mutate(p.id); }}
                                                    className="p-2 text-bakery-primary/40 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {modalOpen && (
                <ProductModal
                    product={editingProduct}
                    onClose={() => setModalOpen(false)}
                    onSuccess={() => { setModalOpen(false); queryClient.invalidateQueries({ queryKey: ["admin-products"] }); }}
                />
            )}
        </div>
    );
}
