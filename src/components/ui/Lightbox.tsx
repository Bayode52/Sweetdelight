"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import NextImage from "next/image";

export interface MediaItem {
    url: string;
    type: 'image' | 'video';
}

interface LightboxProps {
    media: MediaItem[];
    currentIndex: number;
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (index: number) => void;
}

export function Lightbox({ media, currentIndex, isOpen, onClose, onNavigate }: LightboxProps) {
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen || !media.length) return;
            if (e.key === "ArrowLeft") onNavigate((currentIndex - 1 + media.length) % media.length);
            if (e.key === "ArrowRight") onNavigate((currentIndex + 1) % media.length);
            if (e.key === "Escape") onClose();
        };
        if (isOpen) window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, currentIndex, media.length, onNavigate, onClose]);

    if (!media || media.length === 0) return null;

    const currentMedia = media[currentIndex];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-4 md:p-12"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all z-10"
                    >
                        <X size={24} />
                    </button>

                    <div className="relative w-full h-full flex items-center justify-center">
                        {media.length > 1 && (
                            <button
                                onClick={() => onNavigate((currentIndex - 1 + media.length) % media.length)}
                                className="absolute left-0 p-4 text-white/50 hover:text-white transition-all z-10 hidden md:block"
                            >
                                <ChevronLeft size={48} strokeWidth={1} />
                            </button>
                        )}

                        <motion.div
                            key={currentIndex}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full h-full flex items-center justify-center"
                        >
                            {currentMedia?.type === 'video' ? (
                                <video
                                    src={currentMedia.url}
                                    controls
                                    autoPlay
                                    className="max-w-full max-h-full object-contain luxury-shadow rounded-2xl outline-none"
                                />
                            ) : (
                                <NextImage
                                    src={currentMedia?.url}
                                    fill
                                    className="object-contain luxury-shadow rounded-2xl"
                                    alt={`Gallery media ${currentIndex + 1}`}
                                />
                            )}
                        </motion.div>

                        {media.length > 1 && (
                            <button
                                onClick={() => onNavigate((currentIndex + 1) % media.length)}
                                className="absolute right-0 p-4 text-white/50 hover:text-white transition-all z-10 hidden md:block"
                            >
                                <ChevronRight size={48} strokeWidth={1} />
                            </button>
                        )}
                    </div>

                    {media.length > 1 && (
                        <div className="mt-8 flex gap-2">
                            {media.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => onNavigate(i)}
                                    className={cn(
                                        "w-2 h-2 rounded-full transition-all",
                                        i === currentIndex ? "bg-bakery-cta w-8" : "bg-white/20"
                                    )}
                                />
                            ))}
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
