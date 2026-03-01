"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronLeft, ChevronRight, ShoppingCart, Plus, Minus, Star, X } from "lucide-react";
import { Badge } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { ProductDetailModal } from "@/components/ui/ProductDetailModal";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { Product, useCartStore } from "@/store/useCartStore";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { ContentMap } from "@/lib/content";

// ─── Category definitions ────────────────────────────────────────────────────
const CATEGORY_DEFS = [
    { name: "Celebration Cakes", emoji: "🎂", description: "Custom & signature cakes for every occasion" },
    { name: "Small Chops Platters", emoji: "🍢", description: "Perfect party platters — samosas, puff puff, spring rolls and more" },
    { name: "Chin Chin & Snacks", emoji: "🟡", description: "Crunchy West African snacks made the traditional way" },
    { name: "Puff Puff", emoji: "🫓", description: "Soft, golden, deep-fried Nigerian doughnuts" },
    { name: "Pastries & Bakes", emoji: "🥐", description: "Flaky, buttery everyday bakes — meat pies, sausage rolls and more" },
    { name: "Party Boxes", emoji: "📦", description: "Curated boxes that feed the whole crowd" },
    { name: "Drinks", emoji: "🥤", description: "Nigerian favourites — zobo, chapman, tiger nut milk" },
];

const ALL_CATEGORIES = ["All", ...CATEGORY_DEFS.map((c) => c.name)];

const SORT_OPTIONS = [
    { label: "Recommended", value: "rec" },
    { label: "Price: Low to High", value: "price-asc" },
    { label: "Price: High to Low", value: "price-desc" },
    { label: "Top Rated", value: "rating" },
];

// ─── Mock products (replace with Supabase fetch in production) ───────────────
const MOCK_PRODUCTS: (Product & { badge?: "BEST SELLER" | "PREMIUM" | "SIGNATURE" | "NEW" | "MUST TRY" })[] = [
    { id: "c1", name: "Gold Tier Celebration Cake", price: 65.00, rating: 4.9, reviewCount: 84, category: "Celebration Cakes", description: "Luxurious 3-tier vanilla sponge with Italian meringue buttercream and edible gold leaf.", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=600", isAvailable: true, isFeatured: true, badge: "BEST SELLER" },
    { id: "c2", name: "Chocolate Fudge Layer Cake", price: 55.00, rating: 4.8, reviewCount: 62, category: "Celebration Cakes", description: "Rich dark chocolate sponge with velvety fudge filling and ganache drip.", image: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&q=80&w=600", isAvailable: true, isFeatured: false },
    { id: "c3", name: "Custom Birthday Cake (6\")", price: 45.00, rating: 5.0, reviewCount: 31, category: "Celebration Cakes", description: "Fully personalised — your flavours, your design, your message.", image: "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?auto=format&fit=crop&q=80&w=600", isAvailable: true, isFeatured: false, badge: "PREMIUM" },

    { id: "s1", name: "Small Chops Platter (30 pcs)", price: 35.00, rating: 5.0, reviewCount: 214, category: "Small Chops Platters", description: "Puff puff, samosas, mini spring rolls — the ultimate party starter.", image: "https://images.unsplash.com/photo-1606913084603-3e75fb777da1?auto=format&fit=crop&q=80&w=600", isAvailable: true, isFeatured: true, badge: "BEST SELLER" },
    { id: "s2", name: "Golden Meat Pie (6 pcs)", price: 12.00, rating: 4.8, reviewCount: 450, category: "Small Chops Platters", description: "Authentic flaky crust filled with seasoned beef, potatoes and carrots.", image: "https://images.unsplash.com/photo-1623334044303-242022f5a470?auto=format&fit=crop&q=80&w=600", isAvailable: true, isFeatured: false, badge: "SIGNATURE" },
    { id: "s3", name: "Sausage Roll Bites (12 pcs)", price: 9.00, rating: 4.7, reviewCount: 320, category: "Small Chops Platters", description: "Buttery puff pastry with herbed pork sausage — crowd pleasers every time.", image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=600", isAvailable: true, isFeatured: false },
    { id: "s4", name: "Fish Roll (8 pcs)", price: 10.00, rating: 4.6, reviewCount: 178, category: "Small Chops Platters", description: "Crispy pastry rolls filled with spiced tuna and peppered sauce.", image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=600", isAvailable: true, isFeatured: false },

    { id: "ch1", name: "Classic Chin Chin 500g", price: 8.50, rating: 4.9, reviewCount: 196, category: "Chin Chin & Snacks", description: "Crunchy, golden, slightly sweet — just like grandma's recipe.", image: "https://images.unsplash.com/photo-1548840410-dd0ad53a5763?auto=format&fit=crop&q=80&w=600", isAvailable: true, isFeatured: true, badge: "NEW" },
    { id: "ch2", name: "Coconut Chin Chin 400g", price: 9.00, rating: 4.8, reviewCount: 112, category: "Chin Chin & Snacks", description: "Coconut-infused crunch — a tropical West African classic.", image: "https://images.unsplash.com/photo-1533930027501-46bc3785256e?auto=format&fit=crop&q=80&w=600", isAvailable: true, isFeatured: false },

    { id: "pp1", name: "Puff Puff Dozen", price: 6.00, rating: 4.9, reviewCount: 388, category: "Puff Puff", description: "Soft, fluffy, deep-fried West African doughnuts — sweet and addictive.", image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=600", isAvailable: true, isFeatured: true, badge: "MUST TRY" },
    { id: "pp2", name: "Spiced Puff Puff (18 pcs)", price: 9.00, rating: 4.7, reviewCount: 142, category: "Puff Puff", description: "The classic with a chilli kick — bold, soft and completely moreish.", image: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&q=80&w=600", isAvailable: true, isFeatured: false },

    { id: "pa1", name: "Nigerian Beef Pie", price: 3.50, rating: 4.8, reviewCount: 210, category: "Pastries & Bakes", description: "A staple in every Nigerian home — flaky shortcrust with peppered beef.", image: "https://images.unsplash.com/photo-1623334044303-242022f5a470?auto=format&fit=crop&q=80&w=600", isAvailable: true, isFeatured: false },
    { id: "pa2", name: "Spring Roll (6 pcs)", price: 7.50, rating: 4.6, reviewCount: 94, category: "Pastries & Bakes", description: "Crispy golden rolls filled with vegetables and seasoned minced meat.", image: "https://images.unsplash.com/photo-1606913084603-3e75fb777da1?auto=format&fit=crop&q=80&w=600", isAvailable: true, isFeatured: false },

    { id: "pb1", name: "Premium Party Box (Feeds 15)", price: 85.00, originalPrice: 100.00, rating: 4.9, reviewCount: 47, category: "Party Boxes", description: "Small chops, chin chin, puff puff and celebration cake slices — feeds 15 guests.", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=600", isAvailable: true, isFeatured: true, badge: "PREMIUM", onSale: true },
    { id: "pb2", name: "Starter Party Box (Feeds 8)", price: 45.00, rating: 4.8, reviewCount: 28, category: "Party Boxes", description: "Perfect for smaller gatherings. Mixed selection of our bestselling snacks.", image: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&q=80&w=600", isAvailable: true, isFeatured: false },
];

const BADGE_COLORS: Record<string, string> = {
    "BEST SELLER": "bg-[#D4421A] text-white",
    "SIGNATURE": "bg-purple-600 text-white",
    "NEW": "bg-green-600 text-white",
    "PREMIUM": "bg-[#D4AF37] text-[#3D1A0F]",
    "MUST TRY": "bg-red-600 text-white",
};

// ─── Product Card ────────────────────────────────────────────────────────────
function MenuProductCard({ product, onViewDetail }: { product: typeof MOCK_PRODUCTS[0]; onViewDetail: (p: Product) => void }) {
    const { addItem, items, updateQuantity, removeItem } = useCartStore();
    const cartItem = items.find((i) => i.id === product.id);

    const handleAdd = (e: React.MouseEvent) => {
        e.stopPropagation();
        addItem(product);
        toast.success(`${product.name} added!`, { icon: "🧁", style: { borderRadius: "20px", background: "#3D1A0F", color: "#fff", fontWeight: "bold" } });
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="group bg-white rounded-[32px] overflow-hidden border border-bakery-primary/5 hover:border-bakery-cta/20 transition-all duration-300 hover:shadow-xl cursor-pointer"
            onClick={() => onViewDetail(product)}
        >
            <div className="relative aspect-square overflow-hidden bg-bakery-accent/20">
                <Image src={product.image} alt={product.name} fill sizes="(max-width: 768px) 50vw, 300px" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                {product.badge && (
                    <span className={cn("absolute top-3 left-3 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest", BADGE_COLORS[product.badge])}>
                        {product.badge}
                    </span>
                )}
                {"onSale" in product && product.onSale && product.originalPrice && (
                    <span className="absolute top-3 right-3 bg-red-500 text-white px-2 py-0.5 rounded-full text-[9px] font-black">SALE</span>
                )}
            </div>

            <div className="p-4 space-y-2">
                <span className="text-[9px] uppercase tracking-[0.2em] font-black text-bakery-primary/30">{product.category}</span>
                <h3 className="text-sm font-bold text-bakery-primary leading-tight line-clamp-2">{product.name}</h3>

                <Link
                    href={`/reviews?product=${product.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 hover:opacity-70 transition-opacity"
                >
                    <Star size={10} className="text-bakery-cta fill-bakery-cta" />
                    <span className="text-[10px] font-bold text-bakery-primary/50">{product.rating} ({product.reviewCount})</span>
                </Link>

                <div className="flex items-center justify-between pt-1">
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-black text-bakery-primary font-playfair">£{product.price.toFixed(2)}</span>
                        {product.originalPrice && <span className="text-xs line-through text-bakery-primary/30 font-bold">£{product.originalPrice.toFixed(2)}</span>}
                    </div>

                    {cartItem ? (
                        <div className="flex items-center gap-1 border border-bakery-primary/10 rounded-xl px-2 py-1" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => cartItem.quantity === 1 ? removeItem(product.id) : updateQuantity(product.id, -1)} className="w-5 h-5 flex items-center justify-center text-bakery-primary/50 hover:text-bakery-primary">
                                {cartItem.quantity === 1 ? <X size={10} /> : <Minus size={10} />}
                            </button>
                            <span className="text-xs font-black min-w-[16px] text-center">{cartItem.quantity}</span>
                            <button onClick={(e) => { e.stopPropagation(); addItem(product); }} className="w-5 h-5 flex items-center justify-center text-bakery-primary/50 hover:text-bakery-primary">
                                <Plus size={10} />
                            </button>
                        </div>
                    ) : (
                        <button onClick={handleAdd} className="w-9 h-9 rounded-xl bg-bakery-cta text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-md shadow-bakery-cta/20">
                            <ShoppingCart size={15} />
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export function MenuPageClient({ content }: { content: ContentMap }) {
    const [selectedCategory, setSelectedCategory] = React.useState("All");
    const [searchQuery, setSearchQuery] = React.useState("");
    const [sortBy, setSortBy] = React.useState("rec");
    const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
    const [isDetailOpen, setIsDetailOpen] = React.useState(false);
    const [loading] = React.useState(false);
    const categoryScrollRef = React.useRef<HTMLDivElement>(null);

    const scrollCats = (dir: "left" | "right") => {
        categoryScrollRef.current?.scrollBy({ left: dir === "right" ? 200 : -200, behavior: "smooth" });
    };

    const filteredProducts = MOCK_PRODUCTS.filter((p) => {
        // Normalise "Small Chops Platters" vs "Small Chops" for URL param compatibility
        const catMatch = selectedCategory === "All"
            || p.category === selectedCategory
            || (selectedCategory === "Small Chops" && p.category === "Small Chops Platters");
        const search = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase());
        return catMatch && search;
    }).sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "rating") return b.rating - a.rating;
        return 0;
    });

    const openDetail = (p: Product) => { setSelectedProduct(p); setIsDetailOpen(true); };

    // Grouped view
    const grouped = CATEGORY_DEFS.map((cat) => ({
        ...cat,
        products: filteredProducts.filter((p) => p.category === cat.name || (cat.name === "Small Chops Platters" && p.category === "Small Chops Platters")),
    })).filter((g) => g.products.length > 0);

    const isAllSelected = selectedCategory === "All" && searchQuery === "";

    return (
        <div className="min-h-screen pt-40 pb-24 px-6 md:px-12 bg-[#FDF6F0]">
            <div className="max-w-7xl mx-auto space-y-10">

                {/* Header */}
                <div className="space-y-4 text-center">
                    <h1 className="text-5xl md:text-7xl font-playfair font-black text-bakery-primary tracking-tighter">
                        {content['hero.heading'] || 'Explore Our'} <span className="text-bakery-cta italic">{content['hero.heading_italic'] || 'Bakes'}</span>
                    </h1>
                    <p className="text-bakery-primary/60 max-w-xl mx-auto font-medium">
                        {content['hero.subheading'] || 'From flaky golden snacks to decadent celebratory cakes, find your perfect treat here.'}
                    </p>
                </div>

                {/* Delivery banner */}
                <div className="bg-bakery-cta/5 border border-bakery-cta/10 rounded-2xl py-3 px-6 flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-bakery-primary/60">
                    <span>{content['banner.text1'] || '🚚 Free delivery on orders over £50'}</span>
                    <span className="hidden md:block text-bakery-primary/20">·</span>
                    <span>{content['banner.text2'] || '📦 Min order £20'}</span>
                    <span className="hidden md:block text-bakery-primary/20">·</span>
                    <span>{content['banner.text3'] || '🕐 48h notice for custom cakes'}</span>
                    <span className="hidden md:block text-bakery-primary/20">·</span>
                    <span>{content['banner.text4'] || '📍 Delivering across the UK'}</span>
                </div>

                {/* Search + Sort */}
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between sticky top-24 z-30 bg-[#FDF6F0]/90 backdrop-blur-xl p-4 rounded-[32px] border border-bakery-primary/5 luxury-shadow">
                    <div className="flex items-center gap-3 w-full lg:max-w-md bg-bakery-primary/5 rounded-[24px] px-5 py-1 border border-transparent focus-within:border-bakery-cta/20 focus-within:bg-white transition-all group">
                        <Search className="text-bakery-primary/20 group-focus-within:text-bakery-cta transition-colors shrink-0" size={20} />
                        <input type="text" placeholder="Search for chin chin, cakes..." className="w-full bg-transparent py-3.5 text-sm font-bold text-bakery-primary focus:outline-none placeholder:text-bakery-primary/20" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                    <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto no-scrollbar">
                        {SORT_OPTIONS.map((opt) => (
                            <button key={opt.value} onClick={() => setSortBy(opt.value)} className={cn("px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap", sortBy === opt.value ? "bg-bakery-primary text-white" : "bg-bakery-primary/5 text-bakery-primary/40 hover:bg-bakery-primary/10")}>
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Category tabs */}
                <div className="flex items-center gap-2">
                    <button onClick={() => scrollCats("left")} className="shrink-0 p-2 rounded-full border border-bakery-primary/10 hover:bg-bakery-primary hover:text-white transition-all">
                        <ChevronLeft size={16} />
                    </button>
                    <div ref={categoryScrollRef} className="flex gap-3 overflow-x-auto no-scrollbar py-1">
                        {ALL_CATEGORIES.map((cat) => (
                            <button key={cat} onClick={() => setSelectedCategory(cat)} className={cn("px-6 py-3 rounded-3xl text-xs font-black uppercase tracking-widest transition-all border-2 whitespace-nowrap", selectedCategory === cat ? "border-bakery-cta bg-bakery-cta text-white shadow-lg shadow-bakery-cta/20" : "border-bakery-primary/5 bg-white text-bakery-primary/40 hover:border-bakery-cta/20")}>
                                {cat}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => scrollCats("right")} className="shrink-0 p-2 rounded-full bg-bakery-primary text-white hover:bg-bakery-cta transition-all">
                        <ChevronRight size={16} />
                    </button>
                </div>

                {/* Skeleton loading */}
                {loading && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
                    </div>
                )}

                {/* GROUPED VIEW — when All is selected + no search */}
                {!loading && isAllSelected && (
                    <div className="space-y-16">
                        {grouped.map((group) => {
                            const shown = group.products.slice(0, 3);
                            const needPlaceholders = 3 - shown.length; // 0, 1, or 2
                            return (
                                <div key={group.name} className="space-y-6">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="text-3xl">{group.emoji}</span>
                                            <h2 className="text-2xl font-playfair font-black text-bakery-primary">{group.name}</h2>
                                        </div>
                                        <p className="text-sm text-bakery-primary/50 font-medium ml-11">{group.description}</p>
                                        <div className="ml-11 mt-3 border-t border-bakery-primary/5" />
                                    </div>

                                    <AnimatePresence mode="popLayout">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                            {shown.map((p) => (
                                                <MenuProductCard key={p.id} product={p} onViewDetail={openDetail} />
                                            ))}
                                            {/* Fill with Coming Soon placeholders to always show 3 */}
                                            {needPlaceholders > 0 && Array.from({ length: needPlaceholders }).map((_, i) => (
                                                <motion.div
                                                    key={`placeholder-${group.name}-${i}`}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="bg-[#FDF0E6] rounded-[32px] border-2 border-dashed border-bakery-primary/15 flex flex-col items-center justify-center gap-3 p-8 min-h-[200px] text-center"
                                                >
                                                    <span className="text-4xl">🔜</span>
                                                    <p className="text-sm font-bold text-bakery-primary/40">More products<br />coming soon</p>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </AnimatePresence>

                                    {group.products.length > 3 && (
                                        <button onClick={() => setSelectedCategory(group.name)} className="text-bakery-cta font-black text-sm uppercase tracking-widest hover:underline flex items-center gap-1">
                                            View all {group.name} ({group.products.length} items) →
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* FLAT VIEW — when specific category or search active */}
                {!loading && !isAllSelected && (
                    <>
                        <AnimatePresence mode="popLayout">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                                {filteredProducts.map((p) => (
                                    <MenuProductCard key={p.id} product={p} onViewDetail={openDetail} />
                                ))}
                            </div>
                        </AnimatePresence>

                        {filteredProducts.length === 0 && (
                            <div className="py-20 flex flex-col items-center text-center space-y-6">
                                <div className="text-8xl">🥐</div>
                                <h3 className="text-2xl font-bold">Nothing found{searchQuery && ` for "${searchQuery}"`}</h3>
                                <p className="text-bakery-primary/40">Try searching for something else or browse another category.</p>
                                <Button onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}>Reset All Filters</Button>
                            </div>
                        )}
                    </>
                )}
            </div>

            <ProductDetailModal product={selectedProduct} isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} />
        </div>
    );
}
