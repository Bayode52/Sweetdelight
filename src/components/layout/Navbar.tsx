"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useUIStore } from "@/store/useUIStore";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import NavbarAuth from "./NavbarAuth";

const NAV_LINKS = [
    { name: "Home", href: "/" },
    { name: "Menu", href: "/menu" },
    { name: "Custom Order", href: "/custom-order" },
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Blog", href: "/blog" },
    { name: "Reviews", href: "/reviews" },
];

export function Navbar() {
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = React.useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    const itemCount = useCartStore((state) => state.itemCount);
    const openCart = useUIStore((state) => state.openCart);

    React.useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 md:px-12 py-4",
                isScrolled ? "bg-bakery-background/80 backdrop-blur-md luxury-shadow" : "bg-transparent"
            )}
        >
            <nav className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="text-2xl md:text-3xl font-playfair font-black text-bakery-primary tracking-tighter">
                    Crave<span className="text-bakery-cta">.</span>Bakery
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8">
                    {NAV_LINKS.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={cn(
                                    "relative text-sm font-bold uppercase tracking-widest transition-colors hover:text-bakery-cta",
                                    isActive ? "text-bakery-cta" : "text-bakery-primary"
                                )}
                            >
                                {link.name}
                                {isActive && (
                                    <motion.span
                                        layoutId="activeNav"
                                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-bakery-cta rounded-full"
                                    />
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={openCart}
                        className="p-3 rounded-2xl bg-bakery-primary/5 hover:bg-bakery-primary/10 transition-all relative group"
                    >
                        <ShoppingCart size={22} className="text-bakery-primary group-hover:scale-110 transition-transform" />
                        {itemCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-bakery-cta text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-bakery-background">
                                {itemCount}
                            </span>
                        )}
                    </button>

                    <div className="hidden md:block">
                        <NavbarAuth />
                    </div>

                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-3 rounded-2xl bg-bakery-primary/5 text-bakery-primary"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-full left-0 right-0 bg-bakery-primary text-white p-8 md:hidden shadow-2xl rounded-b-[40px] space-y-6 flex flex-col items-center"
                    >
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="text-xl font-bold uppercase tracking-[0.2em]"
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div className="h-px w-full bg-white/10 my-4" />

                        <NavbarAuth />
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
