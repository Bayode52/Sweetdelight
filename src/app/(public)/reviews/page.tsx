"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Star, MessageSquareQuote, ChevronDown, Video } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

type SortOption = "newest" | "oldest" | "highest" | "lowest";

interface Review {
    id: string;
    rating: number;
    comment: string;
    created_at: string;
    image_url?: string | null;
    status?: string;
    title?: string;
    is_pinned?: boolean;
    admin_edited?: boolean;
    text?: string;
    products?: { name?: string }[];
    media_urls?: string[];
    profiles?: {
        full_name?: string;
    };
    menu_items?: {
        name?: string;
    };
}

function StarDisplay({ rating }: { rating: number }) {
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    size={16}
                    fill={star <= rating ? "#F97316" : "transparent"}
                    className={star <= rating ? "text-bakery-cta" : "text-bakery-primary/20"}
                />
            ))}
        </div>
    );
}

export default function ReviewsPage() {
    const [ratingFilter, setRatingFilter] = useState<string>("all");
    const [productFilter, setProductFilter] = useState<string>("all");
    const [sortBy, setSortBy] = useState<SortOption>("newest");
    const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);

    const { data: products } = useQuery({
        queryKey: ["active-products-names"],
        queryFn: async () => {
            const { data } = await supabase
                .from("products")
                .select("id, name")
                .eq("is_active", true)
                .order("name");
            return data || [];
        }
    });

    const { data: reviews, isLoading } = useQuery({
        queryKey: ["public-reviews", ratingFilter, productFilter, sortBy],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (ratingFilter !== "all") params.append("rating", ratingFilter);
            if (productFilter !== "all") params.append("productId", productFilter);
            params.append("sort", sortBy);

            const res = await fetch(`/api/reviews?${params.toString()}`);
            if (!res.ok) throw new Error("Failed to fetch reviews");
            const { data } = await res.json();
            return data || [];
        }
    });

    return (
        <div className="min-h-screen bg-bakery-background pt-32 pb-24 px-6 md:px-12">
            <div className="max-w-7xl mx-auto">
                {/* Hero section */}
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 bg-bakery-cta/10 text-bakery-cta px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-bakery-cta/20">
                        <MessageSquareQuote size={14} />
                        Customer Love
                    </div>
                    <h1 className="text-5xl md:text-7xl font-playfair font-black text-bakery-primary mb-6 tracking-tighter">
                        Sweet Words
                    </h1>
                    <p className="text-xl text-bakery-primary/70 leading-relaxed font-medium">
                        Hear from our amazing community of pastry lovers. We take pride in delivering joy with every bite.
                    </p>
                </div>

                {/* Filters & Controls */}
                <div className="bg-white p-6 rounded-[32px] luxury-shadow border border-bakery-primary/5 mb-12 flex flex-col md:flex-row gap-6 items-center justify-between">
                    <div className="flex flex-col md:flex-row gap-6 w-full md:w-auto">
                        {/* Rating Filter */}
                        <div className="flex items-center gap-2 bg-bakery-primary/5 p-1 rounded-2xl shrink-0 overflow-x-auto">
                            <button
                                onClick={() => setRatingFilter("all")}
                                className={cn(
                                    "px-4 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                                    ratingFilter === "all" ? "bg-white text-bakery-primary luxury-shadow-sm" : "text-bakery-primary/60 hover:text-bakery-primary"
                                )}
                            >
                                All Stars
                            </button>
                            {[5, 4, 3, 2, 1].map((rating) => (
                                <button
                                    key={rating}
                                    onClick={() => setRatingFilter(rating.toString())}
                                    className={cn(
                                        "px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-1",
                                        ratingFilter === rating.toString() ? "bg-white text-bakery-primary luxury-shadow-sm" : "text-bakery-primary/60 hover:text-bakery-primary"
                                    )}
                                >
                                    {rating} <Star size={14} fill="currentColor" />
                                </button>
                            ))}
                        </div>

                        {/* Product Filter */}
                        <div className="relative w-full md:w-64">
                            <button
                                onClick={() => setIsProductDropdownOpen(!isProductDropdownOpen)}
                                className="w-full h-14 bg-bakery-primary/5 rounded-2xl px-6 flex justify-between items-center text-sm font-bold text-bakery-primary transition-all hover:bg-bakery-primary/10"
                            >
                                <span className="truncate pr-4">
                                    {productFilter === "all"
                                        ? "All Products"
                                        : products?.find(p => p.id === productFilter)?.name || "Unknown Product"}
                                </span>
                                <ChevronDown size={18} className="shrink-0 text-bakery-primary/40" />
                            </button>

                            <AnimatePresence>
                                {isProductDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl luxury-shadow border border-bakery-primary/10 overflow-hidden z-20 max-h-60 overflow-y-auto"
                                    >
                                        <button
                                            onClick={() => { setProductFilter("all"); setIsProductDropdownOpen(false); }}
                                            className={cn(
                                                "w-full text-left px-6 py-4 text-sm font-bold hover:bg-bakery-primary/5 transition-colors",
                                                productFilter === "all" ? "text-bakery-cta bg-bakery-cta/5" : "text-bakery-primary"
                                            )}
                                        >
                                            All Products
                                        </button>
                                        {products?.map((p) => (
                                            <button
                                                key={p.id}
                                                onClick={() => { setProductFilter(p.id); setIsProductDropdownOpen(false); }}
                                                className={cn(
                                                    "w-full text-left px-6 py-4 text-sm font-bold hover:bg-bakery-primary/5 transition-colors border-t border-bakery-primary/5",
                                                    productFilter === p.id ? "text-bakery-cta bg-bakery-cta/5" : "text-bakery-primary"
                                                )}
                                            >
                                                {p.name}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Sort */}
                    <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
                        <span className="text-xs font-black uppercase tracking-widest text-bakery-primary/40 shrink-0">Sort By</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                            className="h-14 bg-transparent border-none font-bold text-bakery-primary text-sm focus:ring-0 cursor-pointer"
                        >
                            <option value="newest">Newest First</option>
                            <option value="highest">Highest Rating</option>
                            <option value="lowest">Lowest Rating</option>
                            <option value="oldest">Oldest First</option>
                        </select>
                    </div>
                </div>

                {/* Reviews Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-bakery-primary/5 rounded-[40px] h-[300px] animate-pulse" />
                        ))}
                    </div>
                ) : reviews?.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-[40px] luxury-shadow border border-bakery-primary/5">
                        <MessageSquareQuote size={48} className="mx-auto text-bakery-primary/20 mb-6" />
                        <h3 className="text-2xl font-black font-playfair text-bakery-primary mb-2">No reviews found</h3>
                        <p className="text-bakery-primary/60">Try adjusting your filters to see more sweet words.</p>
                        <button
                            onClick={() => { setRatingFilter("all"); setProductFilter("all"); }}
                            className="mt-8 px-8 py-4 bg-bakery-primary/5 text-bakery-primary font-black rounded-full hover:bg-bakery-primary/10 transition-all text-sm uppercase tracking-widest"
                        >
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AnimatePresence>
                            {reviews?.map((review: Review, index: number) => (
                                <motion.div
                                    key={review.id}
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white p-8 rounded-[40px] luxury-shadow border border-bakery-primary/5 flex flex-col"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex gap-4 items-center">
                                            <div className="w-12 h-12 bg-bakery-primary text-white rounded-[16px] flex items-center justify-center text-xl font-black shrink-0 relative overflow-hidden">
                                                {review.profiles?.full_name?.charAt(0) || "C"}
                                                <div className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-bakery-primary">{review.profiles?.full_name || "Customer"}</h4>
                                                <p className="text-xs font-black uppercase tracking-widest text-bakery-primary/40 mt-1">
                                                    {new Date(review.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                        {review.status === 'featured' && (
                                            <div className="bg-bakery-cta/10 text-bakery-cta p-2 rounded-xl text-xs font-bold shrink-0">
                                                ★ Featured
                                            </div>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <StarDisplay rating={review.rating} />
                                    </div>

                                    {review.title && (
                                        <h5 className="font-black text-bakery-primary text-lg mb-2 flex items-center gap-2">
                                            {review.is_pinned && <span className="text-xl" title="Pinned Review">📌</span>}
                                            {review.title}
                                            {review.admin_edited && <span className="text-[9px] font-black uppercase bg-bakery-primary/5 text-bakery-primary/40 px-2 py-0.5 rounded ml-2">Edited</span>}
                                        </h5>
                                    )}

                                    <p className="text-bakery-primary/70 leading-relaxed font-medium mb-8 grow">
                                        &quot;{review.text}&quot;
                                    </p>

                                    <div className="mt-auto pt-6 border-t border-bakery-primary/5 flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-bakery-primary/40 mb-1">Purchased</p>
                                            <p className="text-sm font-bold text-bakery-primary truncate max-w-[150px]">
                                                {review.products?.[0]?.name}
                                            </p>
                                        </div>

                                        {review.media_urls && review.media_urls.length > 0 && (
                                            <div className="flex gap-2">
                                                {review.media_urls.slice(0, 3).map((url: string, i: number) => {
                                                    const isVideo = url.endsWith('.mp4') || url.endsWith('.mov');
                                                    return (
                                                        <div key={i} className="w-10 h-10 rounded-xl overflow-hidden relative border border-bakery-primary/10">
                                                            {isVideo ? (
                                                                <div className="w-full h-full bg-bakery-primary/5 flex items-center justify-center text-bakery-primary/40">
                                                                    <Video size={16} />
                                                                </div>
                                                            ) : (
                                                                <Image src={url} alt="Review media" fill className="object-cover" />
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
