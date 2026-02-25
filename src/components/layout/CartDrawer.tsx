"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { X, ShoppingBag, Plus, Minus, Trash2, AlertCircle, Gift } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useUIStore } from "@/store/useUIStore";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

const MINIMUM_ORDER = Number(process.env.NEXT_PUBLIC_MINIMUM_ORDER ?? 20);
const FREE_DELIVERY_THRESHOLD = Number(process.env.NEXT_PUBLIC_FREE_DELIVERY_THRESHOLD ?? 50);
const DELIVERY_FEE = Number(process.env.NEXT_PUBLIC_DELIVERY_FEE ?? 5);

export function CartDrawer() {
    const { isCartOpen, closeCart } = useUIStore();
    const { items, totalAmount, itemCount, updateQuantity, removeItem } = useCartStore();

    const meetsMinimum = totalAmount >= MINIMUM_ORDER;
    const qualifiesFreeDelivery = totalAmount >= FREE_DELIVERY_THRESHOLD;
    const remaining = Math.max(0, MINIMUM_ORDER - totalAmount);

    React.useEffect(() => {
        if (isCartOpen) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "unset";
        return () => { document.body.style.overflow = "unset"; };
    }, [isCartOpen]);

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={closeCart}
                        className="fixed inset-0 z-[60] bg-bakery-primary/40 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full max-w-md z-[70] bg-[#FDF6F0] luxury-shadow flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-bakery-primary/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <ShoppingBag className="text-bakery-cta" size={22} />
                                <h2 className="text-xl font-playfair font-black text-bakery-primary">Your Cart</h2>
                                {itemCount > 0 && (
                                    <span className="bg-bakery-cta text-white text-xs font-black px-2.5 py-1 rounded-full">
                                        {itemCount}
                                    </span>
                                )}
                            </div>
                            <button onClick={closeCart} className="p-2 hover:bg-bakery-primary/5 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Item list */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-5">
                            {items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-5 py-16">
                                    <div className="w-24 h-24 bg-bakery-cta/10 rounded-full flex items-center justify-center text-5xl">
                                        🧁
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-playfair font-black text-bakery-primary">Your cart is empty</h3>
                                        <p className="text-bakery-primary/50 text-sm max-w-xs">Treat yourself to something delicious from our menu!</p>
                                    </div>
                                    <Link href="/menu" onClick={closeCart}>
                                        <Button>Browse Menu</Button>
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    {/* Free delivery progress bar */}
                                    {!qualifiesFreeDelivery && (
                                        <div className="bg-bakery-cta/5 border border-bakery-cta/10 rounded-2xl p-4 space-y-2">
                                            <div className="flex justify-between text-xs font-bold">
                                                <span className="text-bakery-primary/60">Add £{(FREE_DELIVERY_THRESHOLD - totalAmount).toFixed(2)} for free delivery</span>
                                                <span className="text-bakery-cta">{Math.min(100, Math.round((totalAmount / FREE_DELIVERY_THRESHOLD) * 100))}%</span>
                                            </div>
                                            <div className="h-1.5 bg-bakery-primary/10 rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-bakery-cta rounded-full"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.min(100, (totalAmount / FREE_DELIVERY_THRESHOLD) * 100)}%` }}
                                                    transition={{ duration: 0.5 }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Items */}
                                    {items.map((item) => (
                                        <div key={item.id} className="flex gap-4 bg-white p-3 rounded-2xl border border-bakery-primary/5">
                                            <div className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-bakery-accent">
                                                <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0 space-y-1">
                                                <div className="flex justify-between gap-2">
                                                    <h4 className="font-bold text-sm text-bakery-primary leading-tight line-clamp-2">{item.name}</h4>
                                                    <button
                                                        onClick={() => removeItem(item.id)}
                                                        className="text-bakery-primary/20 hover:text-red-500 transition-colors shrink-0"
                                                        aria-label="Remove item"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 border border-bakery-primary/10 rounded-xl px-2 py-1">
                                                        <button onClick={() => updateQuantity(item.id, -1)} className="text-bakery-primary/40 hover:text-bakery-primary transition-colors"><Minus size={12} /></button>
                                                        <span className="text-xs font-black min-w-[18px] text-center">{item.quantity}</span>
                                                        <button onClick={() => updateQuantity(item.id, 1)} className="text-bakery-primary/40 hover:text-bakery-primary transition-colors"><Plus size={12} /></button>
                                                    </div>
                                                    <span className="text-sm font-black text-bakery-cta">£{(item.price * item.quantity).toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="p-5 border-t border-bakery-primary/10 space-y-3">
                                {/* Minimum order warning */}
                                <AnimatePresence>
                                    {!meetsMinimum && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                                            className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3"
                                        >
                                            <AlertCircle size={16} className="text-orange-500 shrink-0" />
                                            <p className="text-xs font-bold text-orange-700">
                                                Minimum order is £{MINIMUM_ORDER.toFixed(2)}. Add £{remaining.toFixed(2)} more.
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Free delivery banner */}
                                <AnimatePresence>
                                    {qualifiesFreeDelivery && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                                            className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-4 py-3"
                                        >
                                            <Gift size={16} className="text-green-600 shrink-0" />
                                            <p className="text-xs font-bold text-green-700">🎉 You&apos;ve qualified for free delivery!</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Subtotal row */}
                                <div className="flex justify-between items-center px-1">
                                    <div>
                                        <span className="text-sm text-bakery-primary/50 font-bold">Subtotal</span>
                                        {!qualifiesFreeDelivery && (
                                            <p className="text-xs text-bakery-primary/30">+ £{DELIVERY_FEE.toFixed(2)} delivery</p>
                                        )}
                                    </div>
                                    <span className="font-playfair font-black text-2xl text-bakery-primary">£{totalAmount.toFixed(2)}</span>
                                </div>

                                {/* Checkout button */}
                                <Link href="/checkout" onClick={meetsMinimum ? closeCart : undefined} className={cn(!meetsMinimum && "pointer-events-none")}>
                                    <Button
                                        fullWidth
                                        size="lg"
                                        disabled={!meetsMinimum}
                                        className={cn(!meetsMinimum && "opacity-50 cursor-not-allowed")}
                                    >
                                        Proceed to Checkout →
                                    </Button>
                                </Link>
                                <Button fullWidth variant="ghost" onClick={closeCart} size="sm">
                                    Continue Shopping
                                </Button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
