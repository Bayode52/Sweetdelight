"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowRight, MailCheck } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) { toast.error("Please enter your email"); return; }
        setLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/update-password`,
            });
            if (error) throw error;
            setSent(true);
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Failed to send reset email");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-bakery-background flex items-center justify-center px-6 py-16">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md space-y-6"
            >
                <div className="text-center space-y-3">
                    <Link href="/" className="inline-block text-3xl font-playfair font-black text-bakery-primary tracking-tighter">
                        Crave<span className="text-bakery-cta">.</span>Bakery
                    </Link>
                    <h1 className="text-3xl font-playfair font-black text-bakery-primary">Reset your password</h1>
                    <p className="text-bakery-primary/50 font-medium">Enter your email and we&apos;ll send a reset link</p>
                </div>

                <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-bakery-primary/5 border border-bakery-primary/5">
                    {sent ? (
                        <div className="text-center space-y-4 py-4">
                            <div className="w-16 h-16 bg-bakery-success/10 rounded-full flex items-center justify-center mx-auto">
                                <MailCheck size={28} className="text-bakery-success" />
                            </div>
                            <h2 className="text-xl font-playfair font-bold text-bakery-primary">Check your inbox</h2>
                            <p className="text-bakery-primary/50 text-sm font-medium">
                                We&apos;ve sent a password reset link to <strong>{email}</strong>. Check your spam folder if you don&apos;t see it.
                            </p>
                            <Link href="/auth/login" className="inline-block text-bakery-cta font-bold hover:underline text-sm">
                                Back to sign in
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleReset} className="space-y-4">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email address"
                                className="w-full px-4 py-3.5 rounded-2xl border border-bakery-primary/10 text-sm font-medium bg-bakery-background text-bakery-primary placeholder:text-bakery-primary/30 focus:outline-none focus:ring-2 focus:ring-bakery-cta transition-all"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-bakery-cta hover:bg-bakery-hover text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 group disabled:opacity-60"
                            >
                                {loading ? "Sending..." : (
                                    <>Send reset link <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                                )}
                            </button>
                            <p className="text-center text-sm text-bakery-primary/40 font-medium">
                                <Link href="/auth/login" className="text-bakery-cta font-bold hover:underline">Back to sign in</Link>
                            </p>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
