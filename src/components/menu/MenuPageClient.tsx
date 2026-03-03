"use client";

import React, { useState, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight, ShoppingCart, Info, Star } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { motion, AnimatePresence } from "framer-motion";

export function MenuPageClient() {
    const supabase = createClientComponentClient();
    const [activeCategory, setActiveCategory] = useState("All");
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedProduct, setSelectedProduct] = useState<any>(null);

    useEffect(() => {
        async function fetchProducts() {
            setLoading(true);
            const { data, error } = await supabase
                .from("products")
                .select("*")
                .eq("is_available", true)
                .order("category");

            if (!error) {
                setProducts(data || []);
            }
            setLoading(false);
        }
        fetchProducts();
    }, []);

    const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

    const filtered = products.filter((p) => {
        const matchesCategory = activeCategory === "All" || p.category === activeCategory;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.description || "").toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-[#FAF7F2] pt-28 pb-20 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl md:text-6xl font-playfair font-black text-[#1C0A00] mb-4 italic">
                        Our <span className="text-[#D4421A]">Menu</span>
                    </h1>
                    <p className="text-[#7C6B5E] max-w-2xl mx-auto font-medium">
                        Handcrafted Nigerian pastries and artisanal bakes, made fresh daily with love and the finest ingredients.
                    </p>
                </div>

                {/* Search and Categories */}
                <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-12">
                    <div className="relative w-full md:max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search our delicious bakes..."
                            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-none bg-white shadow-sm focus:ring-2 focus:ring-[#D4421A]/20 transition-all text-[#1C0A00]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 w-full md:w-auto">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeCategory === category
                                        ? "bg-[#D4421A] text-white shadow-lg shadow-[#D4421A]/30"
                                        : "bg-white text-[#1C0A00] hover:bg-gray-50"
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                            <div key={n} className="h-80 bg-gray-100 animate-pulse rounded-3xl" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AnimatePresence>
                            {filtered.map((product) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    key={product.id}
                                    onClick={() => setSelectedProduct(product)}
                                    className="cursor-pointer group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                                >
                                    <div className="relative overflow-hidden h-64">
                                        <img
                                            src={product.image_url || product.image || "/placeholder-product.jpg"}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        {product.badge && (
                                            <span className="absolute top-4 left-4 text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full"
                                                style={{ background: '#D4421A', color: 'white' }}>
                                                {product.badge}
                                            </span>
                                        )}
                                    </div>
                                    <div className="p-6">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#D4421A] mb-2 block">
                                            {product.category}
                                        </span>
                                        <h3 className="text-xl font-bold text-[#1C0A00] mb-2"
                                            style={{ fontFamily: "'Playfair Display', serif" }}>
                                            {product.name}
                                        </h3>
                                        <p className="text-sm text-[#7C6B5E] mb-4 line-clamp-2">{product.description}</p>
                                        <div className="flex items-center justify-between mt-auto">
                                            <span className="text-2xl font-black text-[#1C0A00]"
                                                style={{ fontFamily: "'Playfair Display', serif" }}>
                                                £{Number(product.price).toFixed(2)}
                                            </span>
                                            <div className="bg-[#FAF7F2] p-2 rounded-xl group-hover:bg-[#D4421A] group-hover:text-white transition-colors">
                                                <Plus size={20} />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {filtered.length === 0 && !loading && (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🥐</div>
                        <h3 className="text-xl font-bold text-[#1C0A00]">No products found</h3>
                        <p className="text-[#7C6B5E]">Try adjusting your search or category filters.</p>
                    </div>
                )}
            </div>

            {/* Product detail modal */}
            <AnimatePresence>
                {selectedProduct && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setSelectedProduct(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-[40px] overflow-hidden max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
                            onClick={e => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="absolute top-6 right-6 z-10 bg-white/90 backdrop-blur rounded-full w-10 h-10 flex items-center justify-center text-[#1C0A00] font-bold hover:bg-white shadow-lg transition-all"
                            >
                                <X size={20} />
                            </button>

                            <div className="flex flex-col md:flex-row">
                                <div className="md:w-1/2 h-80 md:h-auto overflow-hidden">
                                    <img
                                        src={selectedProduct.image_url || selectedProduct.image || "/placeholder-product.jpg"}
                                        alt={selectedProduct.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                <div className="md:w-1/2 p-8 md:p-10 flex flex-col">
                                    <div className="mb-6">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#D4421A] mb-2 block">
                                            {selectedProduct.category}
                                        </span>
                                        <h2 className="text-3xl font-bold text-[#1C0A00] mb-2"
                                            style={{ fontFamily: "'Playfair Display', serif" }}>
                                            {selectedProduct.name}
                                        </h2>
                                        <div className="flex items-center gap-1 mb-4">
                                            {[1, 2, 3, 4, 5].map((_, i) => (
                                                <Star key={i} size={14} className="fill-[#D4AF37] text-[#D4AF37]" />
                                            ))}
                                            <span className="text-xs font-bold text-[#7C6B5E] ml-2">5.0 (Reviewer Choice)</span>
                                        </div>
                                        <p className="text-[#7C6B5E] leading-relaxed text-sm">
                                            {selectedProduct.description}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        <div className="bg-[#FAF7F2] rounded-2xl p-4">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-[#7C6B5E] mb-1">Serving</p>
                                            <p className="text-sm font-bold text-[#1C0A00]">Perfect for sharing</p>
                                        </div>
                                        <div className="bg-[#FAF7F2] rounded-2xl p-4">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-[#7C6B5E] mb-1">Notice</p>
                                            <p className="text-sm font-bold text-[#1C0A00]">Freshly Baked</p>
                                        </div>
                                    </div>

                                    <div className="mt-auto space-y-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[#7C6B5E]">Total Price</span>
                                            <span className="text-3xl font-black text-[#1C0A00]" style={{ fontFamily: "'Playfair Display', serif" }}>
                                                £{Number(selectedProduct.price).toFixed(2)}
                                            </span>
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => {
                                                    // Add to cart logic would go here
                                                    setSelectedProduct(null);
                                                }}
                                                className="flex-1 py-4 rounded-2xl bg-[#D4421A] text-white font-bold text-sm shadow-xl shadow-[#D4421A]/30 hover:-translate-y-0.5 transition-all"
                                            >
                                                Add to Cart 🛒
                                            </button>
                                            <a
                                                href={`https://wa.me/447000000000?text=Hi! I'd like to order: ${selectedProduct.name}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-4 rounded-2xl border-2 border-[#25D366] text-[#25D366] font-bold hover:bg-[#25D366] hover:text-white transition-all"
                                            >
                                                <MessageCircle size={20} />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

const Plus = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);
