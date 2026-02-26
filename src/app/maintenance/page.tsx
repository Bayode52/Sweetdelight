"use client";

import { motion } from "framer-motion";
import { Cookie, Store, Clock, Instagram } from "lucide-react";
import { Button } from "@/components/ui";
import Link from "next/link";

export default function MaintenancePage() {
    return (
        <div className="min-h-screen bg-bakery-background flex items-center justify-center p-6 text-center overflow-hidden relative">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <motion.div
                    animate={{
                        y: [0, -20, 0],
                        rotate: [0, 5, 0]
                    }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[10%] left-[10%] opacity-10"
                >
                    <Cookie size={120} className="text-bakery-primary" />
                </motion.div>
                <motion.div
                    animate={{
                        y: [0, 20, 0],
                        rotate: [0, -5, 0]
                    }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-[10%] right-[10%] opacity-10"
                >
                    <Store size={150} className="text-bakery-primary" />
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl w-full bg-white rounded-[60px] p-12 md:p-20 luxury-shadow border border-bakery-primary/5 relative z-10"
            >
                <div className="w-20 h-20 bg-bakery-primary/5 rounded-3xl mx-auto flex items-center justify-center text-bakery-primary mb-8 animate-pulse">
                    <Clock size={40} />
                </div>

                <h1 className="text-5xl md:text-6xl font-playfair font-black text-bakery-primary mb-6 leading-tight">
                    Baking Something <br />
                    <span className="text-bakery-cta">Incredible.</span>
                </h1>

                <p className="text-lg text-bakery-primary/60 font-medium leading-relaxed mb-12">
                    We're currently fine-tuning our ovens and perfecting our recipes.
                    Our online store is undergoing brief maintenance to serve you even better.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="https://instagram.com" target="_blank">
                        <Button size="xl" className="rounded-2xl group">
                            <Instagram size={20} className="mr-2 group-hover:rotate-12 transition-transform" />
                            Follow for Updates
                        </Button>
                    </Link>
                    <Link href="/auth/login">
                        <Button variant="outline" size="xl" className="rounded-2xl">
                            Admin Login
                        </Button>
                    </Link>
                </div>

                <div className="mt-16 pt-8 border-t border-bakery-primary/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-bakery-primary/30">
                        © 2024 Crave Bakery Ltd. · London & Lagos
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
