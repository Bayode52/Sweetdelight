"use client";
export const dynamic = 'force-dynamic';

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginInput) => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            });
            if (error) throw error;
            toast.success("Welcome back! 👋");
            const redirect = searchParams.get("redirect") ?? "/";
            router.push(redirect);
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Login failed");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: `${window.location.origin}/auth/callback` },
        });
    };

    return (
        <div className="min-h-screen bg-bakery-background flex items-center justify-center px-6 py-16">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md space-y-6"
            >
                {/* Logo */}
                <div className="text-center space-y-3">
                    <Link href="/" className="inline-block text-3xl font-playfair font-black text-bakery-primary tracking-tighter">
                        Crave<span className="text-bakery-cta">.</span>Bakery
                    </Link>
                    <h1 className="text-3xl font-playfair font-black text-bakery-primary">Welcome back</h1>
                    <p className="text-bakery-primary/50 font-medium">Sign in to your account</p>
                </div>

                <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-bakery-primary/5 border border-bakery-primary/5 space-y-5">
                    {/* Google OAuth */}
                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        className="w-full flex items-center justify-center gap-3 border-2 border-bakery-primary/10 rounded-2xl py-3.5 text-sm font-bold text-bakery-primary hover:bg-bakery-background hover:border-bakery-primary/20 transition-all"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-bakery-primary/10" />
                        <span className="text-xs font-bold text-bakery-primary/30 uppercase tracking-widest">or</span>
                        <div className="flex-1 h-px bg-bakery-primary/10" />
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <input
                                {...register("email")}
                                type="email"
                                placeholder="Email address"
                                className={cn("w-full px-4 py-3.5 rounded-2xl border text-sm font-medium bg-bakery-background text-bakery-primary placeholder:text-bakery-primary/30 focus:outline-none focus:ring-2 focus:ring-bakery-cta transition-all",
                                    errors.email ? "border-bakery-error" : "border-bakery-primary/10"
                                )}
                            />
                            {errors.email && <p className="mt-1 text-xs text-bakery-error font-medium">{errors.email.message}</p>}
                        </div>

                        <div>
                            <div className="relative">
                                <input
                                    {...register("password")}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    className={cn("w-full px-4 py-3.5 pr-12 rounded-2xl border text-sm font-medium bg-bakery-background text-bakery-primary placeholder:text-bakery-primary/30 focus:outline-none focus:ring-2 focus:ring-bakery-cta transition-all",
                                        errors.password ? "border-bakery-error" : "border-bakery-primary/10"
                                    )}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-bakery-primary/30 hover:text-bakery-primary/60">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.password && <p className="mt-1 text-xs text-bakery-error font-medium">{errors.password.message}</p>}
                        </div>

                        <div className="flex justify-end">
                            <Link href="/auth/forgot-password" className="text-xs text-bakery-cta font-bold hover:underline">
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-bakery-cta hover:bg-bakery-hover text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 group disabled:opacity-60"
                        >
                            {loading ? "Signing in..." : (
                                <>Sign In <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm text-bakery-primary/40 font-medium">
                        Don&apos;t have an account?{" "}
                        <Link href="/auth/signup" className="text-bakery-cta font-bold hover:underline">Sign up free</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
