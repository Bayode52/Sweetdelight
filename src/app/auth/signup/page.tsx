"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupInput } from "@/lib/validations";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

function PasswordStrength({ password }: { password: string }) {
    const checks = [
        { label: "8+ characters", pass: password.length >= 8 },
        { label: "One number", pass: /[0-9]/.test(password) },
        { label: "One uppercase", pass: /[A-Z]/.test(password) },
    ];
    const score = checks.filter((c) => c.pass).length;
    const colors = ["bg-bakery-error", "bg-orange-400", "bg-bakery-cta", "bg-bakery-success"];
    return (
        <div className="mt-2 space-y-2">
            <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                    <div key={i} className={cn("h-1 flex-1 rounded-full transition-all duration-300",
                        i < score ? colors[score] : "bg-gray-200"
                    )} />
                ))}
            </div>
            <div className="flex gap-3 flex-wrap">
                {checks.map((c) => (
                    <span key={c.label} className={cn("text-xs font-medium flex items-center gap-1",
                        c.pass ? "text-bakery-success" : "text-gray-400"
                    )}>
                        <CheckCircle2 size={11} />
                        {c.label}
                    </span>
                ))}
            </div>
        </div>
    );
}

export default function SignupPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<SignupInput>({
        resolver: zodResolver(signupSchema),
        defaultValues: { agreeToTerms: false, newsletterOptIn: false },
    });

    const password = watch("password") ?? "";

    // Auto-fill referral code from cookie
    useEffect(() => {
        const match = document.cookie.match(/referral_code=([^;]+)/);
        if (match) setValue("referralCode", decodeURIComponent(match[1]));
    }, [setValue]);

    const onSubmit = async (data: SignupInput) => {
        setLoading(true);
        try {
            // 1. Create Supabase auth user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        full_name: data.fullName,
                        phone: data.phone,
                    },
                },
            });
            if (authError) throw authError;
            const userId = authData.user?.id;
            if (!userId) throw new Error("Failed to create user");

            // 2. Generate referral code: FirstName + 4 random digits
            const firstName = data.fullName.split(" ")[0].toUpperCase().replace(/[^A-Z]/g, "");
            const referralCode = `${firstName}${Math.floor(1000 + Math.random() * 9000)}`;

            // 3. Create profile
            await supabase.from("profiles").upsert({
                id: userId,
                full_name: data.fullName,
                email: data.email,
                phone: data.phone,
                referral_code: referralCode,
                newsletter_subscribed: data.newsletterOptIn ?? false,
            });

            // 4. If newsletter opted in, add to subscribers
            if (data.newsletterOptIn) {
                await supabase.from("newsletter_subscribers")
                    .upsert({ email: data.email }, { onConflict: "email" });
            }

            toast.success("Account created! Check your email to confirm. 🎉");
            router.push("/auth/login");
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Sign up failed. Please try again.");
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
        <div className="min-h-screen flex">
            {/* LEFT PANEL — Brand */}
            <div className="hidden lg:flex lg:w-1/2 bg-bakery-primary flex-col justify-between p-12 relative overflow-hidden">
                {/* Abstract circles */}
                <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full border border-white/5 -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full border border-white/5 translate-x-1/2 translate-y-1/2" />
                <div className="absolute top-1/3 right-0 w-48 h-48 rounded-full border border-bakery-cta/10" />

                {/* Logo */}
                <Link href="/" className="text-3xl font-playfair font-black text-white tracking-tighter">
                    Sweet Delight<span className="text-bakery-cta">.</span>
                </Link>

                {/* Quote */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="space-y-6"
                >
                    <p className="text-5xl font-playfair font-black text-white leading-tight">
                        Join the<br />
                        <span className="text-bakery-cta italic">Sweet Delight</span><br />
                        family.
                    </p>
                    <p className="text-white/50 text-lg font-medium max-w-sm">
                        Handcrafted pastries, celebration cakes, and Nigerian party favourites — delivered across the UK with love.
                    </p>
                    <div className="flex items-center gap-3 pt-4">
                        {["🎂", "🥐", "🧆", "🍩"].map((emoji, i) => (
                            <span key={i} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl">{emoji}</span>
                        ))}
                    </div>
                </motion.div>

                {/* Footer */}
                <p className="text-white/20 text-xs font-bold uppercase tracking-widest">
                    Made with love in the UK 🇬🇧 with Nigerian Soul
                </p>
            </div>

            {/* RIGHT PANEL — Form */}
            <div className="w-full lg:w-1/2 overflow-y-auto bg-bakery-background flex items-start justify-center p-6 lg:p-12">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md space-y-6 py-8"
                >
                    {/* Header — mobile only */}
                    <div className="lg:hidden text-center mb-8">
                        <Link href="/" className="text-3xl font-playfair font-black text-bakery-primary tracking-tighter">
                            Crave<span className="text-bakery-cta">.</span>Bakery
                        </Link>
                    </div>

                    <div>
                        <h1 className="text-3xl font-playfair font-black text-bakery-primary">Create your account</h1>
                        <p className="text-bakery-primary/50 mt-1 font-medium">Start ordering in minutes</p>
                    </div>

                    {/* Google OAuth */}
                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        className="w-full flex items-center justify-center gap-3 border-2 border-bakery-primary/10 rounded-2xl py-3.5 text-sm font-bold text-bakery-primary hover:bg-white hover:border-bakery-primary/20 transition-all"
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
                        {/* Full Name */}
                        <div>
                            <input
                                {...register("fullName")}
                                type="text"
                                placeholder="Full name"
                                className={cn("w-full px-4 py-3.5 rounded-2xl border text-sm font-medium bg-white text-bakery-primary placeholder:text-bakery-primary/30 focus:outline-none focus:ring-2 focus:ring-bakery-cta transition-all",
                                    errors.fullName ? "border-bakery-error" : "border-bakery-primary/10"
                                )}
                            />
                            {errors.fullName && <p className="mt-1 text-xs text-bakery-error font-medium">{errors.fullName.message}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <input
                                {...register("email")}
                                type="email"
                                placeholder="Email address"
                                className={cn("w-full px-4 py-3.5 rounded-2xl border text-sm font-medium bg-white text-bakery-primary placeholder:text-bakery-primary/30 focus:outline-none focus:ring-2 focus:ring-bakery-cta transition-all",
                                    errors.email ? "border-bakery-error" : "border-bakery-primary/10"
                                )}
                            />
                            {errors.email && <p className="mt-1 text-xs text-bakery-error font-medium">{errors.email.message}</p>}
                        </div>

                        {/* UK Phone */}
                        <div>
                            <div className="flex">
                                <span className="flex items-center px-4 bg-white border border-r-0 border-bakery-primary/10 rounded-l-2xl text-sm font-bold text-bakery-primary/50">🇬🇧 +44</span>
                                <input
                                    {...register("phone")}
                                    type="tel"
                                    placeholder="07700 900000"
                                    className={cn("flex-1 px-4 py-3.5 rounded-r-2xl border text-sm font-medium bg-white text-bakery-primary placeholder:text-bakery-primary/30 focus:outline-none focus:ring-2 focus:ring-bakery-cta transition-all",
                                        errors.phone ? "border-bakery-error" : "border-bakery-primary/10"
                                    )}
                                />
                            </div>
                            {errors.phone && <p className="mt-1 text-xs text-bakery-error font-medium">{errors.phone.message}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <div className="relative">
                                <input
                                    {...register("password")}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    className={cn("w-full px-4 py-3.5 pr-12 rounded-2xl border text-sm font-medium bg-white text-bakery-primary placeholder:text-bakery-primary/30 focus:outline-none focus:ring-2 focus:ring-bakery-cta transition-all",
                                        errors.password ? "border-bakery-error" : "border-bakery-primary/10"
                                    )}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-bakery-primary/30 hover:text-bakery-primary/60">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {password && <PasswordStrength password={password} />}
                            {errors.password && <p className="mt-1 text-xs text-bakery-error font-medium">{errors.password.message}</p>}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <div className="relative">
                                <input
                                    {...register("confirmPassword")}
                                    type={showConfirm ? "text" : "password"}
                                    placeholder="Confirm password"
                                    className={cn("w-full px-4 py-3.5 pr-12 rounded-2xl border text-sm font-medium bg-white text-bakery-primary placeholder:text-bakery-primary/30 focus:outline-none focus:ring-2 focus:ring-bakery-cta transition-all",
                                        errors.confirmPassword ? "border-bakery-error" : "border-bakery-primary/10"
                                    )}
                                />
                                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-bakery-primary/30 hover:text-bakery-primary/60">
                                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.confirmPassword && <p className="mt-1 text-xs text-bakery-error font-medium">{errors.confirmPassword.message}</p>}
                        </div>

                        {/* Referral Code */}
                        <div>
                            <input
                                {...register("referralCode")}
                                type="text"
                                placeholder="Referral code (optional)"
                                className="w-full px-4 py-3.5 rounded-2xl border border-bakery-primary/10 text-sm font-medium bg-white text-bakery-primary placeholder:text-bakery-primary/30 focus:outline-none focus:ring-2 focus:ring-bakery-cta transition-all"
                            />
                        </div>

                        {/* Checkboxes */}
                        <div className="space-y-3 pt-1">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input {...register("agreeToTerms")} type="checkbox"
                                    className="mt-0.5 w-4 h-4 accent-bakery-cta rounded" />
                                <span className="text-sm text-bakery-primary/60 font-medium leading-snug">
                                    I agree to the{" "}
                                    <Link href="/terms" className="text-bakery-cta hover:underline font-bold">Terms & Conditions</Link>
                                    {" "}and{" "}
                                    <Link href="/privacy" className="text-bakery-cta hover:underline font-bold">Privacy Policy</Link>
                                </span>
                            </label>
                            {errors.agreeToTerms && <p className="text-xs text-bakery-error font-medium">{errors.agreeToTerms.message}</p>}

                            <label className="flex items-start gap-3 cursor-pointer">
                                <input {...register("newsletterOptIn")} type="checkbox"
                                    className="mt-0.5 w-4 h-4 accent-bakery-cta rounded" />
                                <span className="text-sm text-bakery-primary/60 font-medium leading-snug">
                                    Sign me up for exclusive offers and news 🎁
                                </span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-bakery-cta hover:bg-bakery-hover text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 group disabled:opacity-60"
                        >
                            {loading ? "Creating account..." : (
                                <>Create Account <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm text-bakery-primary/40 font-medium">
                        Already have an account?{" "}
                        <Link href="/auth/login" className="text-bakery-cta font-bold hover:underline">Sign in</Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
