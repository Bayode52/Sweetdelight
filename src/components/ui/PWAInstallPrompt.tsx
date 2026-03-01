"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        // Register service worker if supported
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("/sw.js")
                .catch((err) => console.log("Service Worker registration failed:", err));
        }

        const handleBeforeInstallPrompt = (e: Event) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            // Display the install banner
            setShowBanner(true);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        // Check if already installed
        window.addEventListener("appinstalled", () => {
            setDeferredPrompt(null);
            setShowBanner(false);
        });

        return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
            console.log("User accepted the install prompt");
        }

        // Clear the saved prompt since it can't be used again
        setDeferredPrompt(null);
        setShowBanner(false);
    };

    return (
        <AnimatePresence>
            {showBanner && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-0 left-0 right-0 z-50 p-4 md:hidden"
                >
                    <div className="bg-bakery-primary text-white p-4 rounded-2xl shadow-xl flex items-center justify-between gap-4">
                        <div className="flex-1">
                            <h4 className="font-playfair font-black text-lg">Install Sweet Delight</h4>
                            <p className="text-xs text-white/70">Add us to your home screen for quick access to fresh pastries.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleInstallClick}
                                className="bg-bakery-cta text-white px-4 py-2 text-sm font-bold rounded-xl"
                            >
                                Install
                            </button>
                            <button
                                onClick={() => setShowBanner(false)}
                                className="p-2 text-white/50 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
