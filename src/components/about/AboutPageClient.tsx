"use client";

import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ContentMap } from "@/lib/content";



function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
    return (
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay }} className={className}>
            {children}
        </motion.div>
    );
}

export function AboutPageClient({ content }: { content: ContentMap }) {
    const STATS = [
        { value: content['hero.stats_years'] || "Fresh To Order", label: content['hero.stats_years_label'] || "Every single time" },
        { value: content['hero.stats_recipes'] || "No Preservatives", label: content['hero.stats_recipes_label'] || "Real ingredients only" },
        { value: content['hero.stats_events'] || "Community First", label: content['hero.stats_events_label'] || "Rooted in Nigerian culture" },
        { value: "Traditional Recipes", label: "Passed down through generations" },
    ];

    const VALUES = [
        { icon: "🏠", title: content['values.item1_title'] || "Handmade Always", desc: content['values.item1_desc'] || "Every product is made fresh to order in our UK kitchen. No mass production, no freezing." },
        { icon: "🌍", title: content['values.item2_title'] || "Authentic Recipes", desc: content['values.item2_desc'] || "Traditional Nigerian recipes passed down through family generations. We never cut corners on authenticity." },
        { icon: "❤️", title: content['values.item3_title'] || "Community Roots", desc: content['values.item3_desc'] || "We grew from the Nigerian and African community in the UK, and everything we do serves that community first." },
    ];
    return (
        <div className="min-h-screen bg-[#FDF6F0]">
            {/* ── HERO ── */}
            <section className="bg-bakery-primary text-white py-32 px-6 md:px-12 text-center">
                <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-4xl mx-auto space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm font-bold uppercase tracking-widest mb-4">
                        {content['hero.badge'] || '🇬🇧 Our Story'}
                    </div>
                    <h1 className="text-5xl md:text-7xl font-playfair font-black leading-tight">
                        {content['hero.heading'] || 'Made With Love,'}<br />
                        <span className="text-bakery-cta italic">{content['hero.heading_italic'] || 'Baked With Pride'}</span>
                    </h1>
                    <p className="text-xl text-white/60 max-w-2xl mx-auto leading-relaxed font-medium">
                        {content['hero.subheading'] || 'Where Nigerian tradition meets London sophistication.'}
                    </p>
                </motion.div>
            </section>

            {/* ── OUR STORY ── */}
            <section className="py-24 px-6 md:px-12">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <FadeIn>
                        <div className="relative aspect-[4/5] rounded-[60px] overflow-hidden luxury-shadow">
                            <Image
                                src="https://images.unsplash.com/photo-1607631568010-a87245c0daf8?auto=format&fit=crop&q=80&w=800"
                                alt="Our founder and head baker in her kitchen"
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-cover object-top"
                                priority
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = "https://images.unsplash.com/photo-1607631568010-a87245c0daf8?auto=format&fit=crop&q=80&w=800";
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-bakery-primary/40 to-transparent" />
                        </div>
                    </FadeIn>

                    <FadeIn delay={0.2} className="space-y-8">
                        <div className="space-y-2">
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bakery-cta/10 text-bakery-cta text-xs font-black uppercase tracking-widest">
                                {content['hero.badge'] || 'Our Story'}
                            </span>
                            <h2 className="text-4xl md:text-5xl font-playfair font-black text-bakery-primary">
                                {content['story.heading'] || 'From Lagos to London'}
                            </h2>
                        </div>

                        <div className="space-y-6 text-bakery-primary/70 leading-relaxed text-lg">
                            <p>
                                {content['story.paragraph_1'] || 'Crave Bakery was born from a simple longing — the taste of home. When our founder moved to the UK from Nigeria, she quickly discovered that while London offered almost everything, one thing was missing: the authentic flavour of her mother\'s baking.'}
                            </p>
                            <p>
                                {content['story.paragraph_2'] || 'What began as weekend baking for friends and fellow Nigerians at community gatherings quickly grew into something much bigger. Word spread — first through WhatsApp groups, then through social media — about these incredible authentic pastries. Small chops at naming ceremonies, custom cakes for birthdays, chin chin for Christmas hampers.'}
                            </p>
                            <p>
                                {content['story.paragraph_3'] || 'Today, Crave Bakery proudly serves the Nigerian and African community across the UK, while introducing British food lovers to the rich, warm flavours of West African baking. Every product is handmade fresh, using traditional recipes — no shortcuts, no preservatives, just honest, delicious food.'}
                            </p>
                        </div>
                    </FadeIn>
                </div>
            </section>

            {/* ── WHY WE'RE DIFFERENT ── */}
            <section className="py-24 px-6 md:px-12 bg-bakery-primary/[0.02]">
                <div className="max-w-7xl mx-auto space-y-16">
                    <FadeIn className="text-center space-y-4">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bakery-cta/10 text-bakery-cta text-xs font-black uppercase tracking-widest">
                            {content['why_different.badge'] || 'Why Crave?'}
                        </span>
                        <h2 className="text-4xl md:text-5xl font-playfair font-black text-bakery-primary">{content['why_different.heading'] || 'Why We\'re Different'}</h2>
                    </FadeIn>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {VALUES.map((v, i) => (
                            <FadeIn key={v.title} delay={i * 0.15}>
                                <div className="bg-white rounded-[40px] p-10 text-center space-y-5 border border-bakery-primary/5 hover:shadow-xl transition-all duration-300">
                                    <div className="text-5xl">{v.icon}</div>
                                    <h3 className="text-xl font-playfair font-black text-bakery-primary">{v.title}</h3>
                                    <p className="text-bakery-primary/60 leading-relaxed">{v.desc}</p>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FOOD STANDARDS ── */}
            <section className="py-24 px-6 md:px-12">
                <div className="max-w-4xl mx-auto">
                    <FadeIn>
                        <div className="bg-bakery-primary rounded-[60px] p-12 md:p-16 text-white space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-green-500 rounded-3xl flex items-center justify-center text-2xl shrink-0">✅</div>
                                <div>
                                    <span className="text-white/50 text-xs font-black uppercase tracking-widest">{content['food_safety.badge'] || 'UK Compliance'}</span>
                                    <h3 className="text-2xl font-playfair font-black">{content['food_safety.heading'] || 'Food Safety & Standards'}</h3>
                                </div>
                            </div>

                            <p className="text-white/70 leading-relaxed text-lg">
                                {content['food_safety.description'] || 'Our kitchen is registered with the local authority and maintains a Food Hygiene Rating. All our products are made fresh to order with no artificial preservatives. Full allergen information is available for every product in compliance with UK Natasha\'s Law.'}
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {["Registered Kitchen", "No Preservatives", "Full Allergen Info", "Fresh Daily"].map((item) => (
                                    <div key={item} className="bg-white/10 rounded-2xl p-4 text-center">
                                        <CheckCircle className="mx-auto mb-2 text-green-400" size={20} />
                                        <p className="text-xs font-bold text-white/70">{item}</p>
                                    </div>
                                ))}
                            </div>

                            <p className="text-white/40 text-sm italic">
                                🏅 Food Hygiene Rating Certificate available on request. Our kitchen operates under HACCP food safety procedures.
                            </p>
                        </div>
                    </FadeIn>
                </div>
            </section>

            {/* ── STATS ── */}
            <section className="py-16 px-6 md:px-12 bg-bakery-primary/[0.02]">
                <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
                    {STATS.map((s, i) => (
                        <FadeIn key={s.value} delay={i * 0.1}>
                            <div className="text-center space-y-2 bg-white rounded-[32px] p-8 border border-bakery-primary/5 hover:shadow-lg transition-all">
                                <p className="text-2xl font-playfair font-black text-bakery-cta">{s.value}</p>
                                <p className="text-xs font-bold text-bakery-primary/40 uppercase tracking-widest">{s.label}</p>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="py-24 px-6 md:px-12">
                <div className="max-w-4xl mx-auto text-center space-y-8">
                    <FadeIn>
                        <div className="bg-bakery-cta rounded-[60px] p-16 space-y-6 text-white relative overflow-hidden">
                            <div className="absolute -top-8 -left-8 w-40 h-40 border border-white/10 rounded-full" />
                            <div className="absolute -bottom-8 -right-8 w-60 h-60 border border-white/10 rounded-full" />
                            <h2 className="text-4xl md:text-5xl font-playfair font-black">{content['cta_banner.heading'] || 'Ready to taste the difference?'}</h2>
                            <p className="text-white/70 text-lg">Order freshly made Nigerian pastries delivered to your door across the UK.</p>
                            <Link href="/menu" className="inline-flex items-center gap-2 bg-white text-bakery-cta font-black px-8 py-4 rounded-2xl hover:scale-105 transition-transform text-sm uppercase tracking-widest">
                                {content['cta_banner.button_text'] || 'Browse Our Menu →'}
                            </Link>
                        </div>
                    </FadeIn>
                </div>
            </section>
        </div>
    );
}
