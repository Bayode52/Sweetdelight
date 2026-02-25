"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type AllergenType =
    | "Gluten" | "Dairy" | "Eggs" | "Nuts" | "Soya"
    | "Sesame" | "Celery" | "Mustard" | "Fish" | "Crustaceans" | "Sulphites";

const ALLERGEN_CONFIG: Record<AllergenType, { icon: string; priority?: boolean }> = {
    Gluten: { icon: "🌾" },
    Dairy: { icon: "🥛" },
    Eggs: { icon: "🥚" },
    Nuts: { icon: "🥜", priority: true },
    Soya: { icon: "🫘" },
    Sesame: { icon: "🌱" },
    Celery: { icon: "🌿" },
    Mustard: { icon: "💛" },
    Fish: { icon: "🐟" },
    Crustaceans: { icon: "🦐" },
    Sulphites: { icon: "🧪" },
};

interface AllergenBadgeProps {
    allergen: AllergenType;
    className?: string;
}

export function AllergenBadge({ allergen, className }: AllergenBadgeProps) {
    const config = ALLERGEN_CONFIG[allergen];
    const [showTooltip, setShowTooltip] = React.useState(false);

    return (
        <div className="relative inline-block">
            <button
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onFocus={() => setShowTooltip(true)}
                onBlur={() => setShowTooltip(false)}
                className={cn(
                    "inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border transition-all",
                    config.priority
                        ? "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200"
                        : "bg-bakery-primary/5 text-bakery-primary/60 border-bakery-primary/10 hover:bg-bakery-primary/10",
                    className
                )}
                aria-label={`Contains: ${allergen}`}
                type="button"
            >
                <span>{config.icon}</span>
                <span>{allergen}</span>
                {config.priority && <span className="text-orange-600">⚠️</span>}
            </button>

            {showTooltip && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none">
                    <div className="bg-bakery-primary text-white text-xs font-bold px-3 py-2 rounded-xl whitespace-nowrap shadow-xl">
                        Contains: {allergen}
                        {config.priority && " (Major allergen — ⚠️)"}
                    </div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-bakery-primary" />
                </div>
            )}
        </div>
    );
}

interface AllergenListProps {
    allergens: AllergenType[];
    mayContain?: AllergenType[];
    className?: string;
}

export function AllergenList({ allergens, mayContain, className }: AllergenListProps) {
    return (
        <div className={cn("space-y-3", className)}>
            <div>
                <p className="text-xs font-bold text-bakery-primary/40 uppercase tracking-widest mb-2">⚠️ Contains</p>
                <div className="flex flex-wrap gap-2">
                    {allergens.map((a) => <AllergenBadge key={a} allergen={a} />)}
                    {allergens.length === 0 && <span className="text-xs text-bakery-primary/40 font-medium">None listed</span>}
                </div>
            </div>
            {mayContain && mayContain.length > 0 && (
                <div>
                    <p className="text-xs font-bold text-bakery-primary/40 uppercase tracking-widest mb-2">May contain traces of</p>
                    <div className="flex flex-wrap gap-2">
                        {mayContain.map((a) => <AllergenBadge key={a} allergen={a} />)}
                    </div>
                </div>
            )}
            <p className="text-xs text-bakery-primary/40 italic font-medium">
                Prepared in a kitchen that handles nuts, gluten and dairy.
            </p>
        </div>
    );
}
