"use client";

import { MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export function WhatsAppButton() {
    const [isVisible, setIsVisible] = useState(false);
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP || '447000000000';

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 2000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.a
                    href={`https://wa.me/${whatsappNumber}?text=Hi%20Sweet%20Delight!%20I'd%20like%20to%20enquire%20about...`}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: 20 }}
                    whileHover={{ scale: 1.1, y: -5 }}
                    whileTap={{ scale: 0.9 }}
                    className="fixed bottom-6 left-6 z-[9999] group flex items-center gap-3 bg-[#25D366] text-white p-4 rounded-full shadow-[0_10px_25px_rgba(37,211,102,0.3)] hover:shadow-[0_15px_30px_rgba(37,211,102,0.4)] transition-all"
                >
                    <div className="relative">
                        <MessageSquare size={24} fill="white" />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-[#25D366] rounded-full"></span>
                    </div>
                    <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-[200px] transition-all duration-500 font-bold text-sm pr-2">
                        Chat with the Baker
                    </span>
                </motion.a>
            )}
        </AnimatePresence>
    );
}
