"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
    rating: number;
    reviewCount?: number;
    interactive?: boolean;
    size?: "sm" | "md" | "lg";
    onChange?: (rating: number) => void;
    className?: string;
}

export function StarRating({ rating, reviewCount, interactive = false, size = "md", onChange, className }: StarRatingProps) {
    const [hovered, setHovered] = React.useState<number | null>(null);
    const [selected, setSelected] = React.useState(rating);

    const starSizes = { sm: 12, md: 16, lg: 22 };
    const st = starSizes[size];
    const displayRating = interactive ? (hovered ?? selected) : rating;

    const handleClick = (star: number) => {
        if (!interactive) return;
        setSelected(star);
        onChange?.(star);
    };

    return (
        <div className={cn("inline-flex items-center gap-1.5", className)}>
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => handleClick(star)}
                        onMouseEnter={() => interactive && setHovered(star)}
                        onMouseLeave={() => interactive && setHovered(null)}
                        className={cn(
                            "transition-transform",
                            interactive && "hover:scale-125 cursor-pointer",
                            !interactive && "cursor-default pointer-events-none"
                        )}
                        aria-label={interactive ? `Rate ${star} stars` : undefined}
                    >
                        <Star
                            size={st}
                            className={cn(
                                "transition-colors",
                                star <= displayRating ? "text-bakery-cta fill-bakery-cta" : "text-bakery-primary/20 fill-transparent"
                            )}
                        />
                    </button>
                ))}
            </div>

            {reviewCount !== undefined && (
                <span className={cn(
                    "font-bold text-bakery-primary/50",
                    size === "sm" && "text-[10px]",
                    size === "md" && "text-xs",
                    size === "lg" && "text-sm",
                )}>
                    {rating.toFixed(1)} ({reviewCount.toLocaleString()} reviews)
                </span>
            )}
        </div>
    );
}
