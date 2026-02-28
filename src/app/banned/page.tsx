"use client";

import { motion } from "framer-motion";
import { Ban, Mail, Home } from "lucide-react";
import Link from "next/link";

export default function BannedPage() {
    return (
        <div className="min-h-screen bg-bakery-background flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white rounded-[40px] luxury-shadow p-12 text-center space-y-8 border border-bakery-primary/5"
            >
                <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center text-red-600 mx-auto">
                    <Ban size={40} />
                </div>

                <div className="space-y-4">
                    <h1 className="text-4xl font-playfair font-black text-bakery-primary italic">Account Restricted</h1>
                    <p className="text-bakery-primary/60 font-medium leading-relaxed">
                        Your account has been restricted from accessing certain features of Crave Bakery.
                        If you believe this is a mistake, please contact our support team.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 pt-4">
                    <a
                        href="mailto:support@cravebakery.co.uk"
                        className="flex items-center justify-center gap-3 w-full py-4 bg-bakery-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-bakery-primary/20 hover:bg-bakery-primary/90 transition-all"
                    >
                        <Mail size={16} /> Contact Support
                    </a>
                    <Link
                        href="/"
                        className="flex items-center justify-center gap-3 w-full py-4 bg-bakery-primary/5 text-bakery-primary/40 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-bakery-primary/10 transition-all"
                    >
                        <Home size={16} /> Return Home
                    </Link>
                </div>

                <p className="text-[10px] font-black text-bakery-primary/20 uppercase tracking-widest pt-4">
                    Security ID: {Math.random().toString(36).substring(7).toUpperCase()}
                </p>
            </motion.div>
        </div>
    );
}
