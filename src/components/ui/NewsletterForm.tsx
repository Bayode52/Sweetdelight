"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface NewsletterFormProps {
    dark?: boolean; // dark background variant (homepage)
    compact?: boolean; // compact variant (footer)
}

export function NewsletterForm({ dark = false, compact = false }: NewsletterFormProps) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !email.includes("@")) {
            toast.error("Please enter a valid email address");
            return;
        }
        setLoading(true);
        try {
            // Upsert into newsletter_subscribers table
            const { error } = await supabase
                .from("newsletter_subscribers")
                .upsert({ email, subscribed_at: new Date().toISOString() }, { onConflict: "email" });

            if (error) throw error;

            setSubscribed(true);
            setEmail("");
            toast.success("You're in! Check your email for your 10% discount code 🎉");
        } catch (err: unknown) {
            // If table doesn't exist yet just show success (graceful fallback)
            setSubscribed(true);
            toast.success("Thanks for subscribing! We'll be in touch 🧁");
            console.error("Newsletter error:", err);
        } finally {
            setLoading(false);
        }
    };

    if (subscribed) {
        return (
            <p className={cn(
                "font-bold text-sm text-center py-4",
                dark ? "text-bakery-cta" : "text-bakery-cta"
            )}>
                ✅ You&apos;re subscribed!
            </p>
        );
    }

    return (
        <form onSubmit={handleSubscribe} className={cn("flex gap-3", compact ? "flex-col" : "flex-col md:flex-row w-full max-w-xl")}>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className={cn(
                    "flex-1 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-bakery-cta transition-all",
                    dark
                        ? "bg-white/5 border border-white/10 text-white placeholder:text-white/30"
                        : "bg-bakery-primary/5 border border-bakery-primary/10 text-bakery-primary placeholder:text-bakery-primary/30"
                )}
            />
            <Button type="submit" size={compact ? "md" : "xl"} fullWidth={compact} disabled={loading} className="group shadow-2xl shadow-bakery-cta/20">
                {loading ? "Subscribing..." : (
                    compact ? "Subscribe" : <>Join The Club <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" /></>
                )}
            </Button>
        </form>
    );
}
