"use client";

import { useEffect, useState } from "react";
import { X, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: "accepted" | "dismissed";
        platform: string;
    }>;
    prompt(): Promise<void>;
}

export function PWAProvider({ children }: { children: React.ReactNode }) {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showBanner, setShowBanner] = useState(false);
    const [isIos, setIsIos] = useState(false);

    useEffect(() => {
        // 1. Register Service Worker
        if ("serviceWorker" in navigator) {
            window.addEventListener("load", () => {
                navigator.serviceWorker.register("/sw.js").then(
                    (registration) => console.log("SW registered:", registration.scope),
                    (err) => console.log("SW registration failed:", err)
                );
            });
        }

        // 2. Handle PWA Install Prompt
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);

            // Show banner after 30 seconds if not dismissed
            const dismissed = localStorage.getItem("pwa-banner-dismissed");
            if (!dismissed) {
                setTimeout(() => setShowBanner(true), 30000);
            }
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        // 3. Detect iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIos(isIosDevice);

        if (isIosDevice && !window.matchMedia('(display-mode: standalone)').matches) {
            const dismissed = localStorage.getItem("pwa-banner-dismissed");
            if (!dismissed) {
                setTimeout(() => setShowBanner(true), 30000);
            }
        }

        return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    }, []);

    const handleInstall = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === "accepted") {
                setDeferredPrompt(null);
                setShowBanner(false);
            }
        }
    };

    const dismissBanner = () => {
        setShowBanner(false);
        localStorage.setItem("pwa-banner-dismissed", "true");
    };

    return (
        <>
            {children}
            <AnimatePresence>
                {showBanner && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-6 left-6 right-6 z-[100] md:left-auto md:w-96"
                    >
                        <div className="bg-bakery-primary text-white p-6 rounded-[32px] luxury-shadow border border-white/10 relative overflow-hidden group">
                            <button
                                onClick={dismissBanner}
                                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                                    <Smartphone size={24} />
                                </div>
                                <div className="pr-6">
                                    <h3 className="font-playfair font-black text-xl mb-1">Add to Home Screen</h3>
                                    <p className="text-sm text-white/60 mb-4">
                                        {isIos
                                            ? "Tap the share icon and select 'Add to Home Screen' for the full experience!"
                                            : "Install our app to order treats faster and stay updated while offline."}
                                    </p>
                                    {!isIos && (
                                        <button
                                            onClick={handleInstall}
                                            className="bg-bakery-cta text-white px-6 py-2 rounded-xl font-black text-sm hover:scale-105 transition-transform"
                                        >
                                            Install Now
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
