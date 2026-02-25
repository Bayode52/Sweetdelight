"use client";

import { motion } from "framer-motion";
import { ShoppingCart, Share2, Info, ChevronRight, ChevronLeft, Minus, Plus, Clock } from "lucide-react";
import Image from "next/image";
import { Modal, Button, Badge, StarRating } from "@/components/ui";
import { Product, useCartStore } from "@/store/useCartStore";
import { cn } from "@/lib/utils";
import * as React from "react";
import toast from "react-hot-toast";

interface ProductDetailModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
}

export function ProductDetailModal({ product, isOpen, onClose }: ProductDetailModalProps) {
    const addItem = useCartStore((state) => state.addItem);
    const [selectedImage, setSelectedImage] = React.useState(0);
    const [quantity, setQuantity] = React.useState(1);

    React.useEffect(() => {
        if (isOpen) {
            setSelectedImage(0);
            setQuantity(1);
        }
    }, [isOpen]);

    if (!product) return null;

    const allImages = product.images || [product.image];

    const handleAddToCart = () => {
        for (let i = 0; i < quantity; i++) {
            addItem(product);
        }
        toast.success(`Success! Added ${quantity} ${product.name} to cart.`, {
            icon: "🥐",
            style: {
                borderRadius: '24px',
                background: '#3D1A0F',
                color: '#fff',
                fontWeight: 'bold',
                padding: '16px 24px'
            }
        });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="4xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 p-8">
                {/* Media Gallery */}
                <div className="space-y-4">
                    <div className="relative aspect-square rounded-[40px] overflow-hidden bg-bakery-accent/30 luxury-shadow group">
                        <motion.img
                            key={selectedImage}
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            src={allImages[selectedImage]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />

                        {/* Nav Arrows */}
                        {allImages.length > 1 && (
                            <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => setSelectedImage((prev) => (prev > 0 ? prev - 1 : allImages.length - 1))}
                                    className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-bakery-primary hover:bg-white"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={() => setSelectedImage((prev) => (prev < allImages.length - 1 ? prev + 1 : 0))}
                                    className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-bakery-primary hover:bg-white"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
                        {allImages.map((img, i) => (
                            <button
                                key={i}
                                onClick={() => setSelectedImage(i)}
                                className={cn(
                                    "relative min-w-[80px] h-20 rounded-2xl overflow-hidden border-2 transition-all",
                                    selectedImage === i ? "border-bakery-cta scale-105" : "border-transparent opacity-50 hover:opacity-100"
                                )}
                            >
                                <Image src={img} alt="" fill sizes="80px" className="object-cover" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Details */}
                <div className="flex flex-col h-full space-y-6">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Badge variant="highlight">{product.category}</Badge>
                            <button className="text-bakery-primary/20 hover:text-bakery-cta transition-colors"><Share2 size={20} /></button>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-playfair font-black text-bakery-primary tracking-tighter">
                            {product.name}
                        </h1>
                        <div className="flex items-center gap-4">
                            <StarRating rating={product.rating} size="sm" />
                            <span className="text-sm font-bold text-bakery-primary/40">({product.reviewCount} Reviews)</span>
                        </div>
                    </div>

                    <div className="flex items-baseline gap-4">
                        <span className="text-4xl font-black text-bakery-cta font-playfair">£{product.price.toFixed(2)}</span>
                        {product.originalPrice && (
                            <span className="text-xl line-through text-bakery-primary/20 font-bold">£{product.originalPrice.toFixed(2)}</span>
                        )}
                    </div>

                    <p className="text-bakery-primary/60 text-lg leading-relaxed font-medium">
                        {product.description}
                    </p>

                    <div className="pt-6 mt-auto space-y-6">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-4 bg-bakery-primary/5 rounded-2xl px-6 py-4">
                                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="text-bakery-primary hover:text-bakery-cta transition-colors">
                                    <Minus size={20} />
                                </button>
                                <span className="text-xl font-black min-w-[30px] text-center">{quantity}</span>
                                <button onClick={() => setQuantity(q => q + 1)} className="text-bakery-primary hover:text-bakery-cta transition-colors">
                                    <Plus size={20} />
                                </button>
                            </div>
                            <Button fullWidth size="xl" className="shadow-2xl shadow-bakery-cta/30" onClick={handleAddToCart}>
                                Add to Cart <ShoppingCart size={20} className="ml-2" />
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-4 rounded-3xl bg-bakery-accent/30">
                                <Clock className="text-bakery-primary/40" size={18} />
                                <span className="text-xs font-bold uppercase tracking-wider">Fast Bake (2 hrs)</span>
                            </div>
                            <div className="flex items-center gap-3 p-4 rounded-3xl bg-bakery-accent/30">
                                <Info className="text-bakery-primary/40" size={18} />
                                <span className="text-xs font-bold uppercase tracking-wider">Organic Dairy</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
