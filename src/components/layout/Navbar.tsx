"use client";

import * as React from "react";
import { useEffect, useState, useRef } from 'react';
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useUIStore } from "@/store/useUIStore";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { createBrowserClient } from '@supabase/ssr';

const NAV_LINKS = [
    { name: "Home", href: "/" },
    { name: "Menu", href: "/menu" },
    { name: "Custom Order", href: "/custom-order" },
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Blog", href: "/blog" },
    { name: "Reviews", href: "/reviews" },
];

function AuthButton() {
    const [open, setOpen] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)
    const [name, setName] = useState('')
    const [loaded, setLoaded] = useState(false)
    const router = useRouter()
    const ref = useRef<HTMLDivElement>(null)

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                // Use the service role via API route instead of 
                // direct client query to bypass RLS issues
                fetch('/api/auth/profile')
                    .then(res => res.json())
                    .then(data => {
                        if (data?.full_name) {
                            setName(data.full_name.split(' ')[0])
                        } else {
                            setName('Account')
                        }
                        setIsAdmin(data?.role === 'admin')
                        setLoaded(true)
                    })
                    .catch(() => {
                        setName('Account')
                        setLoaded(true)
                    })
            } else {
                setLoaded(true)
            }
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                if (session?.user) {
                    fetch('/api/auth/profile')
                        .then(res => res.json())
                        .then(data => {
                            setName(data?.full_name?.split(' ')[0] || 'Account')
                            setIsAdmin(data?.role === 'admin')
                        })
                } else {
                    setName('')
                    setIsAdmin(false)
                    setOpen(false)
                }
                router.refresh()
            }
        )

        // Close dropdown when clicking outside
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)

        return () => {
            subscription.unsubscribe()
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [router, supabase])

    if (!loaded) {
        return <div className="w-24 h-9 bg-gray-100 rounded-full animate-pulse" />
    }

    if (!name) {
        return (
            <Link
                href="/auth/signup"
                className="bg-[#2C1810] text-white px-6 py-2 rounded-full font-semibold text-sm hover:bg-[#3d2418] transition-colors"
            >
                Sign Up
            </Link>
        )
    }

    return (
        <div ref={ref} className="relative">
            {/* This button TOGGLES dropdown - does NOT navigate */}
            <button
                onClick={() => setOpen(!open)}
                className="bg-[#D4421A] text-white px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-2 hover:bg-[#b8381a] transition-colors"
            >
                <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
                    {name.charAt(0).toUpperCase()}
                </span>
                {name}
                <svg
                    className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown - only shows when open=true */}
            {open && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-[999]">

                    <div className="px-4 py-2 border-b border-gray-50 mb-1">
                        <p className="font-semibold text-gray-800 text-sm">{name}</p>
                        <p className="text-xs text-[#D4421A]">{isAdmin ? '⚡ Admin' : 'Customer'}</p>
                    </div>

                    <Link
                        href="/account"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-[#D4421A] transition-colors"
                    >
                        👤 My Account
                    </Link>

                    <Link
                        href="/account/orders"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-[#D4421A] transition-colors"
                    >
                        📦 My Orders
                    </Link>

                    <Link
                        href="/track-order"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-[#D4421A] transition-colors"
                    >
                        🚚 Track Order
                    </Link>

                    {isAdmin && (
                        <>
                            <div className="border-t border-gray-100 my-1" />
                            <p className="px-4 py-1 text-xs text-gray-400 uppercase tracking-wide">
                                Admin
                            </p>
                            <Link href="/admin" onClick={() => setOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-[#D4421A] hover:bg-orange-50 transition-colors">
                                ⚡ Admin Dashboard
                            </Link>
                            <Link href="/admin/products" onClick={() => setOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#D4421A] hover:bg-orange-50 transition-colors">
                                🛍️ Products
                            </Link>
                            <Link href="/admin/orders" onClick={() => setOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#D4421A] hover:bg-orange-50 transition-colors">
                                📦 Orders
                            </Link>
                            <Link href="/admin/content" onClick={() => setOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#D4421A] hover:bg-orange-50 transition-colors">
                                ✏️ Edit Website
                            </Link>
                            <Link href="/admin/settings" onClick={() => setOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#D4421A] hover:bg-orange-50 transition-colors">
                                ⚙️ Settings
                            </Link>
                        </>
                    )}

                    <div className="border-t border-gray-100 my-1" />

                    <button
                        onClick={async () => {
                            setOpen(false)
                            await supabase.auth.signOut()
                            router.push('/')
                            router.refresh()
                        }}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors w-full text-left"
                    >
                        🚪 Sign Out
                    </button>
                </div>
            )}
        </div>
    )
}

export function Navbar({ settings }: { settings?: Record<string, string> }) {
    const businessName = settings?.business_name || "Crave Bakery";
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
                    {businessName}
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
                        <AuthButton />
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

                        <AuthButton />
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
