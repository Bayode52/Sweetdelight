"use client";

import * as React from "react";
import { Tag, Wallet, CheckCircle, XCircle, Loader2, ArrowLeft } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { createBrowserClient } from "@supabase/auth-helpers-nextjs";

const DELIVERY_FEE = Number(process.env.NEXT_PUBLIC_DELIVERY_FEE ?? 5);
const FREE_DELIVERY_THRESHOLD = Number(process.env.NEXT_PUBLIC_FREE_DELIVERY_THRESHOLD ?? 50);

interface PromoResult {
    valid: boolean;
    type?: "promo" | "referral";
    discount?: number;
    description?: string;
    message?: string;
}

interface Step3Props {
    deliveryType: "Home Delivery" | "Collection";
    onNext: (discountAmount: number, storeCreditUsed: number, code: string) => void;
    onBack: () => void;
}

export default function Step3Discounts({ deliveryType, onNext, onBack }: Step3Props) {
    const { items, totalAmount } = useCartStore();
    const [code, setCode] = React.useState("");
    const [promoResult, setPromoResult] = React.useState<PromoResult | null>(null);
    const [applying, setApplying] = React.useState(false);
    const [useCredit, setUseCredit] = React.useState(false);
    const [storeCredit, setStoreCredit] = React.useState(0);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    React.useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
                supabase.from("profiles").select("store_credit").eq("id", user.id).single()
                    .then(({ data }) => { if (data?.store_credit) setStoreCredit(data.store_credit); });
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const isHomeDelivery = deliveryType === "Home Delivery";
    const qualifiesFreeDelivery = totalAmount >= FREE_DELIVERY_THRESHOLD;
    const deliveryFee = isHomeDelivery ? (qualifiesFreeDelivery ? 0 : DELIVERY_FEE) : 0;

    const discountAmount = promoResult?.valid && promoResult.discount
        ? Math.round(totalAmount * (promoResult.discount / 100) * 100) / 100
        : 0;

    const creditUsed = useCredit ? Math.min(storeCredit, totalAmount + deliveryFee - discountAmount) : 0;
    const grandTotal = Math.max(0, totalAmount + deliveryFee - discountAmount - creditUsed);

    const applyCode = async () => {
        if (!code.trim()) return;
        setApplying(true);
        try {
            const res = await fetch("/api/referrals/validate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: code.trim().toUpperCase() }),
            });
            const data: PromoResult = await res.json();
            setPromoResult(data);
        } catch {
            setPromoResult({ valid: false, message: "Could not validate code. Please try again." });
        } finally {
            setApplying(false);
        }
    };

    const row = (label: string, value: string, className?: string) => (
        <div className={cn("flex justify-between text-sm", className)}>
            <span className="text-bakery-primary/60 font-bold">{label}</span>
            <span className="font-bold">{value}</span>
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <div>
                    <h2 className="text-2xl font-playfair font-black text-bakery-primary mb-1">Discounts & Credits</h2>
                    <p className="text-bakery-primary/50 text-sm">Have a promo or referral code? Apply it here.</p>
                </div>

                {/* Promo code */}
                <div className="space-y-3">
                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-bakery-primary/60">
                        <Tag size={14} /> Promo / Referral Code
                    </label>
                    <div className="flex gap-3">
                        <input
                            value={code}
                            onChange={(e) => { setCode(e.target.value.toUpperCase()); setPromoResult(null); }}
                            onKeyDown={(e) => e.key === "Enter" && applyCode()}
                            placeholder="e.g. WELCOME10"
                            className="flex-1 px-4 py-3 rounded-2xl border border-bakery-primary/15 bg-white font-bold text-bakery-primary text-sm focus:outline-none focus:border-bakery-cta focus:ring-2 focus:ring-bakery-cta/20 uppercase tracking-widest"
                        />
                        <Button onClick={applyCode} disabled={applying || !code.trim()} size="md">
                            {applying ? <Loader2 size={16} className="animate-spin" /> : "Apply"}
                        </Button>
                    </div>

                    {promoResult && (
                        <div className={cn(
                            "flex items-start gap-3 rounded-2xl px-4 py-3 text-sm font-bold",
                            promoResult.valid ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-600"
                        )}>
                            {promoResult.valid
                                ? <CheckCircle size={16} className="shrink-0 mt-0.5" />
                                : <XCircle size={16} className="shrink-0 mt-0.5" />}
                            <span>
                                {promoResult.valid
                                    ? `✅ Code applied! You're saving £${discountAmount.toFixed(2)} — ${promoResult.description}`
                                    : "❌ This code is invalid or expired."}
                            </span>
                        </div>
                    )}
                </div>

                {/* Store credit */}
                {storeCredit > 0 && (
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-bakery-primary/60">
                            <Wallet size={14} /> Store Credit
                        </label>
                        <button
                            onClick={() => setUseCredit(!useCredit)}
                            className={cn(
                                "w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all",
                                useCredit ? "border-bakery-cta bg-bakery-cta/5" : "border-bakery-primary/10 bg-white hover:border-bakery-primary/30"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", useCredit ? "border-bakery-cta bg-bakery-cta" : "border-bakery-primary/30")}>
                                    {useCredit && <div className="w-2 h-2 rounded-full bg-white" />}
                                </div>
                                <div className="text-left">
                                    <p className="font-black text-bakery-primary text-sm">Use £{storeCredit.toFixed(2)} store credit</p>
                                    <p className="text-xs text-bakery-primary/50">Will be deducted from your total</p>
                                </div>
                            </div>
                            {useCredit && <CheckCircle size={20} className="text-bakery-cta" />}
                        </button>
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <button type="button" onClick={onBack} className="flex items-center gap-2 text-bakery-primary/50 hover:text-bakery-primary text-sm font-bold transition-colors">
                        <ArrowLeft size={16} /> Back
                    </button>
                    <div className="flex-1">
                        <Button fullWidth size="lg" onClick={() => onNext(discountAmount, creditUsed, promoResult?.valid ? code : "")}>
                            Continue to Payment →
                        </Button>
                    </div>
                </div>
            </div>

            {/* Summary sidebar */}
            <div className="lg:col-span-1">
                <div className="sticky top-28 bg-white rounded-3xl border border-bakery-primary/10 p-6 space-y-4">
                    <h3 className="font-playfair font-black text-lg text-bakery-primary">Order Summary</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                                <span className="text-bakery-primary/70 font-medium truncate pr-2">{item.name} × {item.quantity}</span>
                                <span className="font-bold text-bakery-primary shrink-0">£{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-bakery-primary/10 pt-3 space-y-2">
                        {row("Subtotal", `£${totalAmount.toFixed(2)}`)}
                        {row("Delivery", deliveryFee === 0 ? (isHomeDelivery ? "FREE 🎉" : "Free Collection") : `£${deliveryFee.toFixed(2)}`)}
                        {discountAmount > 0 && row("Code Discount", `-£${discountAmount.toFixed(2)}`, "text-green-600")}
                        {creditUsed > 0 && row("Store Credit", `-£${creditUsed.toFixed(2)}`, "text-green-600")}
                        <div className="flex justify-between font-black text-lg border-t border-bakery-primary/10 pt-2">
                            <span>TOTAL</span>
                            <span className="text-bakery-cta">£{grandTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
