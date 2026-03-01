"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Heart, Star, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Badge } from "@/components/ui";
import { Product, useCartStore } from "@/store/useCartStore";
import toast from "react-hot-toast";

interface ProductCardProps {
    product: Product;
    onViewDetail?: (product: Product) => void;
}

export function ProductCard({ product, onViewDetail }: ProductCardProps) {
    const addItem = useCartStore((state) => state.addItem);
    const [isAdded, setIsAdded] = useState(false);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        addItem(product);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);

        toast.success(`${product.name} added to cart!`, {
            icon: "🧁",
            style: {
                borderRadius: '20px',
                background: '#3D1A0F',
                color: '#fff',
                fontWeight: 'bold'
            }
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group bg-white rounded-[40px] p-4 luxury-shadow border border-bakery-primary/5 hover:border-bakery-cta/20 transition-all duration-500 hover:shadow-lg hover:-translate-y-1"
        >
            <div className="relative aspect-square rounded-[32px] overflow-hidden bg-bakery-accent/20">
                <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {product.on_sale && <Badge variant="sale">Sale</Badge>}
                    {product.is_featured && <Badge variant="highlight">Must Try</Badge>}
                </div>

                {/* Action Overlay */}
                <div className="absolute inset-0 bg-bakery-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                        onClick={() => onViewDetail?.(product)}
                        className="w-12 h-12 rounded-2xl bg-white text-bakery-primary hover:bg-bakery-cta hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 flex items-center justify-center shadow-lg"
                    >
                        <Eye size={20} />
                    </button>
                    <button className="w-12 h-12 rounded-2xl bg-white text-bakery-primary hover:text-bakery-error transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 delay-75 flex items-center justify-center shadow-lg">
                        <Heart size={20} />
                    </button>
                </div>
            </div>

            <div className="mt-6 px-2 space-y-3">
                <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-black text-bakery-primary/30">
                        {product.category}
                    </span>
                    <div className="flex items-center gap-1 text-bakery-cta">
                        <Star size={12} fill="currentColor" />
                        <span className="text-xs font-black">{product.rating}</span>
                    </div>
                </div>

                <h3 className="text-lg font-bold text-bakery-primary line-clamp-1">{product.name}</h3>

                <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black text-bakery-primary font-playfair">
                            £{(product.on_sale && product.sale_price ? product.sale_price : product.price).toFixed(2)}
                        </span>
                        {product.on_sale && product.sale_price && (
                            <span className="text-sm line-through text-bakery-primary/30 font-bold">
                                £{product.price.toFixed(2)}
                            </span>
                        )}
                    </div>

                    <button
                        onClick={handleAddToCart}
                        className={cn(
                            "min-w-10 h-10 px-3 rounded-xl flex items-center justify-center transition-all shadow-lg active:scale-95",
                            isAdded
                                ? "bg-green-500 text-white shadow-green-500/20"
                                : "bg-bakery-cta text-white shadow-bakery-cta/20 hover:scale-110"
                        )}
                    >
                        {isAdded ? (
                            <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1">
                                Added! <span className="text-sm">✓</span>
                            </span>
                        ) : (
                            <ShoppingCart size={18} />
                        )}
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
