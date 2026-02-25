import * as React from "react";
import { cn } from "@/lib/utils";

export type ProductBadgeVariant = "BEST SELLER" | "PREMIUM" | "SIGNATURE" | "NEW" | "MUST TRY" | "SALE";
export type OrderStatus = "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled";

interface BadgeProps {
    children: React.ReactNode;
    className?: string;
    // Product badge
    product?: ProductBadgeVariant;
    // Order status
    status?: OrderStatus | "shipped" | "success" | "error" | "warning";
    // Generic
    variant?: "category" | "highlight" | "sale" | "outline";
}

const PRODUCT_BADGE_STYLES: Record<ProductBadgeVariant, string> = {
    "BEST SELLER": "bg-[#D4421A] text-white",
    "PREMIUM": "bg-[#D4AF37] text-[#3D1A0F]",
    "SIGNATURE": "bg-purple-600 text-white",
    "NEW": "bg-green-600 text-white",
    "MUST TRY": "bg-red-600 text-white",
    "SALE": "bg-[#D4421A] text-white",
};

const ORDER_STATUS_STYLES: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800 border border-amber-200",
    confirmed: "bg-blue-100 text-blue-800 border border-blue-200",
    preparing: "bg-purple-100 text-purple-800 border border-purple-200",
    ready: "bg-teal-100 text-teal-800 border border-teal-200",
    delivered: "bg-green-100 text-green-800 border border-green-200",
    shipped: "bg-purple-100 text-purple-800 border border-purple-200",
    cancelled: "bg-red-100 text-red-800 border border-red-200",
    success: "bg-green-100 text-green-800 border border-green-200",
    error: "bg-red-100 text-red-800 border border-red-200",
    warning: "bg-orange-100 text-orange-800 border border-orange-200",
};

export function Badge({ children, product, status, variant, className }: BadgeProps) {
    const base = "inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all";

    if (product) {
        return (
            <span className={cn(base, PRODUCT_BADGE_STYLES[product], "shadow-sm", className)}>
                {children}
            </span>
        );
    }

    if (status) {
        return (
            <span className={cn(base, ORDER_STATUS_STYLES[status] ?? ORDER_STATUS_STYLES.pending, className)}>
                {children}
            </span>
        );
    }

    const variantStyles: Record<string, string> = {
        category: "bg-bakery-primary/5 text-bakery-primary/60 border border-bakery-primary/10",
        highlight: "bg-bakery-cta/10 text-bakery-cta border border-bakery-cta/20",
        sale: "bg-bakery-cta text-white shadow-sm",
        outline: "border-2 border-bakery-primary/20 text-bakery-primary/60",
    };

    return (
        <span className={cn(base, variantStyles[variant ?? "highlight"], className)}>
            {children}
        </span>
    );
}
