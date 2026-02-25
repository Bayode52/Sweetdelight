"use client";

import { motion } from "framer-motion";
import { WifiOff, RefreshCcw } from "lucide-react";

export default function OfflinePage() {
    return (
        <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-center">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-24 h-24 bg-bakery-primary/5 text-bakery-primary rounded-full flex items-center justify-center mb-8"
            >
                <WifiOff size={48} />
            </motion.div>

            <h1 className="text-4xl font-playfair font-black text-bakery-primary mb-4">
                You're Offline
            </h1>

            <p className="text-lg text-bakery-primary/60 max-w-md mb-8">
                It seems you've lost your internet connection. We can't load the fresh pastries right now.
            </p>

            <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 bg-bakery-cta text-white px-8 py-4 rounded-full font-bold hover:bg-opacity-90 transition-all"
            >
                <RefreshCcw size={20} />
                Try Again
            </button>
        </div>
    );
}
