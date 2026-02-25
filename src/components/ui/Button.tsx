"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg" | "xl";
    loading?: boolean;
    fullWidth?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", loading, fullWidth, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
        const variants = {
            primary: "bg-bakery-cta text-white hover:brightness-95 luxury-shadow",
            secondary: "bg-bakery-primary text-white hover:brightness-110 luxury-shadow",
            outline: "border-2 border-bakery-primary text-bakery-primary hover:bg-bakery-primary hover:text-white",
            ghost: "text-bakery-primary hover:bg-bakery-primary/5",
        };

        const sizes = {
            sm: "px-3 py-1.5 text-sm",
            md: "px-6 py-3 text-base",
            lg: "px-8 py-4 text-lg",
            xl: "px-10 py-5 text-xl",
        };

        return (
            <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                ref={ref}
                disabled={disabled || loading}
                className={cn(
                    "inline-flex items-center justify-center rounded-xl font-bold transition-all disabled:opacity-50 disabled:pointer-events-none",
                    variants[variant],
                    sizes[size],
                    fullWidth && "w-full",
                    className
                )}
                {...(props as HTMLMotionProps<"button">)}
            >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}
                {children}
                {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
            </motion.button>
        );
    }
);
Button.displayName = "Button";

export { Button };
