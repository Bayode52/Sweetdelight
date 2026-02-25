"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-bakery-background flex flex-col items-center justify-center p-6 text-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-xl w-full"
            >
                <div className="relative mb-12">
                    <h1 className="text-[180px] font-black text-bakery-primary/5 leading-none select-none">
                        404
                    </h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-32 h-32 bg-bakery-primary/5 rounded-[40px] flex items-center justify-center rotate-12">
                            <Search size={64} className="text-bakery-primary/20 -rotate-12" />
                        </div>
                    </div>
                </div>

                <h2 className="text-4xl font-playfair font-black text-bakery-primary mb-6">
                    Oops! This crumb is missing 🥐
                </h2>
                <p className="text-xl text-bakery-primary/60 mb-12 leading-relaxed">
                    The page you&apos;re looking for might have been eaten or moved.
                    Let&apos;s get you back to something delicious.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/"
                        className="h-16 px-10 bg-bakery-primary text-white rounded-2xl font-black luxury-shadow flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
                    >
                        Back to Home
                    </Link>
                    <Link
                        href="/menu"
                        className="h-16 px-10 bg-white text-bakery-primary border border-bakery-primary/10 rounded-2xl font-black flex items-center justify-center hover:bg-bakery-primary/5 transition-all"
                    >
                        View Menu
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
