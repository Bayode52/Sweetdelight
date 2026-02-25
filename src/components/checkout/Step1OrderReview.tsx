"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus, Minus, Trash2, AlertCircle, ArrowLeft } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui";

const MINIMUM_ORDER = Number(process.env.NEXT_PUBLIC_MINIMUM_ORDER ?? 20);

interface Step1Props {
    onNext: () => void;
}

export default function Step1OrderReview({ onNext }: Step1Props) {
    const { items, totalAmount, updateQuantity, removeItem } = useCartStore();
    const meetsMinimum = totalAmount >= MINIMUM_ORDER;
    const remaining = Math.max(0, MINIMUM_ORDER - totalAmount);

    if (items.length === 0) {
        return (
            <div className="text-center py-20 space-y-6">
                <div className="text-6xl">🧁</div>
                <h2 className="text-2xl font-playfair font-black text-bakery-primary">Your basket is empty</h2>
                <p className="text-bakery-primary/60">Head to the menu to add some delicious items!</p>
                <Link href="/menu">
                    <Button size="lg">Browse Menu</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-playfair font-black text-bakery-primary mb-1">Review Your Basket</h2>
                <p className="text-bakery-primary/50 text-sm">{items.length} item{items.length !== 1 ? "s" : ""} in your order</p>
            </div>

            {/* Items */}
            <div className="space-y-4">
                {items.map((item) => (
                    <div key={item.id} className="flex gap-4 bg-white rounded-3xl p-4 border border-bakery-primary/5 shadow-sm">
                        <div className="relative w-20 h-20 shrink-0 rounded-2xl overflow-hidden bg-bakery-accent/40">
                            <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="flex justify-between gap-2">
                                <div>
                                    <h3 className="font-bold text-bakery-primary">{item.name}</h3>
                                    <p className="text-xs text-bakery-primary/40 uppercase tracking-widest">{item.category}</p>
                                </div>
                                <button
                                    onClick={() => removeItem(item.id)}
                                    className="text-bakery-primary/20 hover:text-red-400 transition-colors p-1"
                                    aria-label={`Remove ${item.name}`}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 border border-bakery-primary/10 rounded-xl px-3 py-1.5">
                                    <button
                                        onClick={() => updateQuantity(item.id, -1)}
                                        className="text-bakery-primary/40 hover:text-bakery-cta transition-colors"
                                        aria-label="Decrease quantity"
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <span className="text-sm font-black min-w-[24px] text-center">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.id, 1)}
                                        className="text-bakery-primary/40 hover:text-bakery-cta transition-colors"
                                        aria-label="Increase quantity"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                                <div className="text-right">
                                    <span className="font-black text-bakery-cta text-lg">£{(item.price * item.quantity).toFixed(2)}</span>
                                    {item.quantity > 1 && (
                                        <p className="text-xs text-bakery-primary/30">£{item.price.toFixed(2)} each</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Subtotal */}
            <div className="bg-bakery-primary/[0.03] rounded-3xl p-6 space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-bakery-primary/10">
                    <span className="text-bakery-primary/60 font-bold">Subtotal</span>
                    <span className="font-playfair font-black text-2xl text-bakery-primary">£{totalAmount.toFixed(2)}</span>
                </div>
                <p className="text-xs text-bakery-primary/40 text-center">Delivery & discounts calculated in next steps</p>
            </div>

            {/* Minimum order warning */}
            {!meetsMinimum && (
                <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-2xl px-5 py-4">
                    <AlertCircle size={18} className="text-orange-500 shrink-0" />
                    <p className="text-sm font-bold text-orange-700">
                        Minimum order is £{MINIMUM_ORDER.toFixed(2)}. Please add £{remaining.toFixed(2)} more to continue.
                    </p>
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4">
                <Link href="/menu" className="flex items-center gap-2 text-bakery-primary/50 hover:text-bakery-primary text-sm font-bold transition-colors">
                    <ArrowLeft size={16} /> Back to Menu
                </Link>
                <div className="flex-1">
                    <Button fullWidth size="lg" disabled={!meetsMinimum} onClick={onNext}>
                        Continue to Your Details →
                    </Button>
                </div>
            </div>
        </div>
    );
}
