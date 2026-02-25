"use client";

import Link from "next/link";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui";

export default function CheckoutCancelPage() {
    return (
        <div className="min-h-screen bg-[#FDF6F0] flex items-center justify-center px-4 py-20">
            <div className="max-w-md w-full text-center space-y-8">
                <div className="flex justify-center">
                    <div className="w-24 h-24 bg-bakery-accent rounded-full flex items-center justify-center text-5xl">
                        🛒
                    </div>
                </div>
                <div className="space-y-3">
                    <h1 className="text-4xl font-playfair font-black text-bakery-primary">No worries!</h1>
                    <p className="text-bakery-primary/60 text-lg leading-relaxed">
                        Your checkout was cancelled — but don&apos;t worry, your basket is saved and ready when you are.
                    </p>
                </div>
                <div className="bg-white rounded-3xl border border-bakery-primary/10 p-6 space-y-2">
                    <ShoppingBag className="text-bakery-cta mx-auto" size={28} />
                    <p className="font-bold text-bakery-primary text-sm">
                        Your items are still in your basket. You can return to checkout anytime.
                    </p>
                </div>
                <div className="space-y-3">
                    <Link href="/checkout">
                        <Button fullWidth size="lg">Return to Checkout →</Button>
                    </Link>
                    <Link href="/menu" className="flex items-center justify-center gap-2 text-sm font-bold text-bakery-primary/50 hover:text-bakery-primary transition-colors">
                        <ArrowLeft size={14} /> Browse Menu
                    </Link>
                </div>
            </div>
        </div>
    );
}
