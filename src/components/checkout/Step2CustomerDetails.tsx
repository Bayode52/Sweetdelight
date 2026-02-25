"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Truck, Store, ArrowLeft } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

const DELIVERY_FEE = Number(process.env.NEXT_PUBLIC_DELIVERY_FEE ?? 5);
const FREE_DELIVERY_THRESHOLD = Number(process.env.NEXT_PUBLIC_FREE_DELIVERY_THRESHOLD ?? 50);
const UK_POSTCODE_RE = /^[A-Z]{1,2}[0-9][A-Z0-9]? [0-9][ABD-HJLNP-UW-Z]{2}$/i;
const UK_PHONE_RE = /^(\+44|0)[0-9]{9,10}$/;

const schema = z.object({
    fullName: z.string().min(2, "Please enter your full name"),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().regex(UK_PHONE_RE, "Please enter a valid UK phone number (+44 or 07xxx)"),
    deliveryType: z.enum(["Home Delivery", "Collection"]),
    addressLine1: z.string().optional(),
    addressLine2: z.string().optional(),
    city: z.string().optional(),
    postcode: z.string().optional(),
    deliveryNote: z.string().optional(),
    specialInstructions: z.string().max(500).optional(),
}).superRefine((data, ctx) => {
    if (data.deliveryType === "Home Delivery") {
        if (!data.addressLine1 || data.addressLine1.length < 3) {
            ctx.addIssue({ code: "custom", path: ["addressLine1"], message: "Please enter your street address" });
        }
        if (!data.city || data.city.length < 2) {
            ctx.addIssue({ code: "custom", path: ["city"], message: "Please enter your city or town" });
        }
        if (!data.postcode || !UK_POSTCODE_RE.test(data.postcode)) {
            ctx.addIssue({ code: "custom", path: ["postcode"], message: "Please enter a valid UK postcode (e.g. SW1A 1AA)" });
        }
    }
});

export type CustomerDetailsForm = z.infer<typeof schema>;

interface Step2Props {
    defaultValues?: Partial<CustomerDetailsForm>;
    onNext: (data: CustomerDetailsForm) => void;
    onBack: () => void;
}

export default function Step2CustomerDetails({ defaultValues, onNext, onBack }: Step2Props) {
    const { items, totalAmount } = useCartStore();
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<CustomerDetailsForm>({
        resolver: zodResolver(schema),
        defaultValues: { deliveryType: "Home Delivery", ...defaultValues },
    });

    const deliveryType = watch("deliveryType");
    const isHomeDelivery = deliveryType === "Home Delivery";
    const qualifiesFreeDelivery = totalAmount >= FREE_DELIVERY_THRESHOLD;
    const deliveryFee = isHomeDelivery ? (qualifiesFreeDelivery ? 0 : DELIVERY_FEE) : 0;
    const total = totalAmount + deliveryFee;

    const fieldClass = (hasError: boolean) =>
        cn(
            "w-full px-4 py-3 rounded-2xl border font-medium text-bakery-primary text-sm bg-white transition-all outline-none",
            hasError
                ? "border-red-400 focus:ring-2 focus:ring-red-200"
                : "border-bakery-primary/15 focus:border-bakery-cta focus:ring-2 focus:ring-bakery-cta/20"
        );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <form onSubmit={handleSubmit(onNext)} className="lg:col-span-2 space-y-6">
                <div>
                    <h2 className="text-2xl font-playfair font-black text-bakery-primary mb-1">Your Details</h2>
                    <p className="text-bakery-primary/50 text-sm">We&apos;ll use these to deliver your order and send your receipt.</p>
                </div>

                {/* Personal info */}
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase tracking-widest text-bakery-primary/60">Full Name *</label>
                            <input {...register("fullName")} placeholder="Jane Smith" className={fieldClass(!!errors.fullName)} />
                            {errors.fullName && <p className="text-xs text-red-500 font-bold">{errors.fullName.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase tracking-widest text-bakery-primary/60">Email *</label>
                            <input {...register("email")} type="email" placeholder="jane@example.com" className={fieldClass(!!errors.email)} />
                            {errors.email && <p className="text-xs text-red-500 font-bold">{errors.email.message}</p>}
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-widest text-bakery-primary/60">UK Phone *</label>
                        <input {...register("phone")} placeholder="+44 7700 900000" className={fieldClass(!!errors.phone)} />
                        {errors.phone && <p className="text-xs text-red-500 font-bold">{errors.phone.message}</p>}
                    </div>
                </div>

                {/* Delivery type */}
                <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-bakery-primary/60">Delivery Type *</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                            {
                                value: "Home Delivery" as const,
                                icon: <Truck size={20} />,
                                label: "Home Delivery",
                                sub: qualifiesFreeDelivery ? "FREE 🎉" : `£${DELIVERY_FEE.toFixed(2)} flat rate`,
                            },
                            {
                                value: "Collection" as const,
                                icon: <Store size={20} />,
                                label: "Collection",
                                sub: "Free — pick up from us",
                            },
                        ].map((opt) => (
                            <label
                                key={opt.value}
                                className={cn(
                                    "flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all",
                                    deliveryType === opt.value
                                        ? "border-bakery-cta bg-bakery-cta/5"
                                        : "border-bakery-primary/10 bg-white hover:border-bakery-primary/30"
                                )}
                            >
                                <input type="radio" {...register("deliveryType")} value={opt.value} className="sr-only" />
                                <div className={cn("p-2 rounded-xl", deliveryType === opt.value ? "bg-bakery-cta text-white" : "bg-bakery-primary/5 text-bakery-primary/60")}>
                                    {opt.icon}
                                </div>
                                <div>
                                    <p className="font-black text-bakery-primary text-sm">{opt.label}</p>
                                    <p className={cn("text-xs font-bold", deliveryType === opt.value ? "text-bakery-cta" : "text-bakery-primary/40")}>{opt.sub}</p>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Home delivery address fields */}
                {isHomeDelivery && (
                    <div className="space-y-4 p-5 bg-bakery-primary/[0.03] rounded-3xl border border-bakery-primary/5">
                        <h3 className="font-black text-bakery-primary text-sm uppercase tracking-widest">Delivery Address</h3>
                        <div className="space-y-3">
                            <div className="space-y-1.5">
                                <label className="text-xs font-black uppercase tracking-widest text-bakery-primary/60">Address Line 1 *</label>
                                <input {...register("addressLine1")} placeholder="15 Baker Street" className={fieldClass(!!errors.addressLine1)} />
                                {errors.addressLine1 && <p className="text-xs text-red-500 font-bold">{errors.addressLine1.message}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-black uppercase tracking-widest text-bakery-primary/60">Address Line 2 <span className="text-bakery-primary/30">(optional)</span></label>
                                <input {...register("addressLine2")} placeholder="Flat 2B" className={fieldClass(false)} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black uppercase tracking-widest text-bakery-primary/60">City / Town *</label>
                                    <input {...register("city")} placeholder="London" className={fieldClass(!!errors.city)} />
                                    {errors.city && <p className="text-xs text-red-500 font-bold">{errors.city.message}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black uppercase tracking-widest text-bakery-primary/60">Postcode *</label>
                                    <input {...register("postcode")} placeholder="W1A 1AA" className={fieldClass(!!errors.postcode)} />
                                    {errors.postcode && <p className="text-xs text-red-500 font-bold">{errors.postcode.message}</p>}
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-black uppercase tracking-widest text-bakery-primary/60">Delivery Note <span className="text-bakery-primary/30">(optional)</span></label>
                                <input {...register("deliveryNote")} placeholder="Leave at door, ring bell, etc." className={fieldClass(false)} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Special instructions */}
                <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-widest text-bakery-primary/60">Special Requests <span className="text-bakery-primary/30">(optional)</span></label>
                    <textarea
                        {...register("specialInstructions")}
                        rows={3}
                        placeholder="Any special requests? e.g. nut-free, write on cake, call on arrival."
                        className={cn(fieldClass(false), "resize-none")}
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <button type="button" onClick={onBack} className="flex items-center gap-2 text-bakery-primary/50 hover:text-bakery-primary text-sm font-bold transition-colors">
                        <ArrowLeft size={16} /> Back
                    </button>
                    <div className="flex-1">
                        <Button type="submit" fullWidth size="lg">Continue to Discounts →</Button>
                    </div>
                </div>
            </form>

            {/* Order summary sidebar */}
            <div className="lg:col-span-1">
                <div className="sticky top-28 bg-white rounded-3xl border border-bakery-primary/10 p-6 space-y-4">
                    <h3 className="font-playfair font-black text-lg text-bakery-primary">Order Summary</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                                <span className="text-bakery-primary/70 font-medium">{item.name} × {item.quantity}</span>
                                <span className="font-bold text-bakery-primary">£{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-bakery-primary/10 pt-3 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-bakery-primary/60 font-bold">Subtotal</span>
                            <span className="font-bold">£{totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-bakery-primary/60 font-bold">Delivery</span>
                            <span className={cn("font-bold", deliveryFee === 0 ? "text-green-600" : "")}>
                                {deliveryFee === 0 ? (isHomeDelivery ? "FREE 🎉" : "Free Collection") : `£${deliveryFee.toFixed(2)}`}
                            </span>
                        </div>
                        <div className="flex justify-between font-black text-lg border-t border-bakery-primary/10 pt-2">
                            <span>Total</span>
                            <span className="text-bakery-cta">£{total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
