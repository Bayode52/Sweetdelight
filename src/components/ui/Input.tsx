import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
    label?: string;
    error?: string;
    helperText?: string;
    variant?: "text" | "email" | "phone" | "password" | "textarea";
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement & HTMLTextAreaElement, InputProps>(
    ({ className, label, error, helperText, variant = "text", leftIcon, rightIcon, ...props }, ref) => {
        const [showPassword, setShowPassword] = React.useState(false);
        const isTextarea = variant === "textarea";
        const type = variant === "password" ? (showPassword ? "text" : "password") : variant;

        const inputClasses = cn(
            "flex w-full rounded-xl border border-bakery-primary/20 bg-white px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-bakery-cta focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
            leftIcon && "pl-12",
            rightIcon && "pr-12",
            error && "border-bakery-error focus:ring-bakery-error",
            className
        );

        return (
            <div className="w-full space-y-2">
                {label && (
                    <label className="text-sm font-bold text-bakery-primary ml-1 uppercase tracking-wider">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {leftIcon && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-bakery-primary/40">
                            {leftIcon}
                        </div>
                    )}
                    {isTextarea ? (
                        <textarea
                            className={cn(inputClasses, "min-h-[100px] resize-none")}
                            ref={ref as React.Ref<HTMLTextAreaElement>}
                            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
                        />
                    ) : (
                        <input
                            type={type}
                            className={inputClasses}
                            ref={ref as React.Ref<HTMLInputElement>}
                            {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
                        />
                    )}

                    {variant === "password" && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-bakery-primary/40 hover:text-bakery-primary transition-colors"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    )}
                </div>
                {error ? (
                    <p className="text-xs font-medium text-bakery-error ml-1">{error}</p>
                ) : helperText ? (
                    <p className="text-xs text-bakery-primary/60 ml-1">{helperText}</p>
                ) : null}
            </div>
        );
    }
);
Input.displayName = "Input";

export { Input };
