"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui";

type Profile = { id: string; full_name: string; referral_code: string };

export default function ReferralLandingPage() {
    const { code } = useParams<{ code: string }>();
    const [profile, setProfile] = React.useState<Profile | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [invalid, setInvalid] = React.useState(false);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    React.useEffect(() => {
        const validate = async () => {
            const { data } = await supabase
                .from("profiles")
                .select("id, full_name, referral_code")
                .eq("referral_code", code?.toUpperCase())
                .single();
            if (data) setProfile(data);
            else setInvalid(true);
            setLoading(false);
        };
        if (code) validate();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [code]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FDF6F0] flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-bakery-cta border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (invalid) {
        return (
            <div className="min-h-screen bg-[#FDF6F0] flex items-center justify-center px-4">
                <div className="max-w-md text-center space-y-6">
                    <div className="text-6xl">😕</div>
                    <h1 className="text-3xl font-playfair font-black text-bakery-primary">This referral link has expired</h1>
                    <p className="text-bakery-primary/60">This link is no longer valid. Head to the menu to explore our treats!</p>
                    <Link href="/menu"><Button size="lg">Browse Menu</Button></Link>
                </div>
            </div>
        );
    }

    const firstName = profile?.full_name?.split(" ")[0] ?? "a friend";

    return (
        <div className="min-h-screen bg-[#FDF6F0]">
            {/* Hero */}
            <div className="bg-bakery-primary text-white py-24 px-4 text-center space-y-6">
                <div className="text-5xl">🎂</div>
                <h1 className="text-4xl md:text-5xl font-playfair font-black leading-tight">
                    You were invited by <span className="text-bakery-cta">{firstName}!</span>
                </h1>
                <p className="text-white/60 text-lg max-w-lg mx-auto">
                    Join Sweet Delight and get <strong className="text-white">10% off your first order</strong> with code{" "}
                    <span className="bg-white/20 px-3 py-1 rounded-full font-black tracking-widest">WELCOME10</span>
                </p>
                <Link href={`/auth/signup?ref=${code}`}>
                    <Button size="xl" className="mt-4">Create Account &amp; Claim Discount →</Button>
                </Link>
                <p className="text-white/30 text-xs">Already have an account? <Link href={`/auth/login?ref=${code}`} className="underline">Sign in</Link></p>
            </div>

            {/* Why section */}
            <div className="max-w-4xl mx-auto px-4 py-16 space-y-10">
                <h2 className="text-3xl font-playfair font-black text-bakery-primary text-center">
                    Why <span className="text-bakery-cta italic">Sweet Delight?</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { emoji: "🍢", title: "Authentic Nigerian recipes", desc: "Small chops, chin chin, puff puff — made with love and traditional recipes." },
                        { emoji: "🚗", title: "UK-wide delivery", desc: "Fresh to your door anywhere in the UK. Fast, reliable and handled with care." },
                        { emoji: "🎂", title: "Custom cakes", desc: "Celebration cakes baked to order. Personalised, handcrafted, unforgettable." },
                    ].map((c) => (
                        <div key={c.title} className="bg-white rounded-3xl p-6 border border-bakery-primary/10 text-center space-y-3">
                            <div className="text-4xl">{c.emoji}</div>
                            <h3 className="font-playfair font-black text-bakery-primary">{c.title}</h3>
                            <p className="text-sm text-bakery-primary/60">{c.desc}</p>
                        </div>
                    ))}
                </div>
                <div className="text-center">
                    <Link href={`/auth/signup?ref=${code}`}>
                        <Button size="lg">Join Now &amp; Get 10% Off →</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
