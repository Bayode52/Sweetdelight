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
                className="bg-[#2C1810] text-white px-6 py-2 rounded-full font-semibold text-sm hover:bg-[#3d2418] transition-colors whitespace-nowrap"
            >
                Sign Up
            </Link>
        )
    }

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="bg-[#D4421A] text-white px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-2 hover:bg-[#b8381a] transition-colors whitespace-nowrap"
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

            {open && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-[999]">
                    <div className="px-4 py-2 border-b border-gray-50 mb-1">
                        <p className="font-semibold text-gray-800 text-sm">{name}</p>
                        <p className="text-xs text-[#D4421A]">{isAdmin ? '⚡ Admin' : 'Customer'}</p>
                    </div>
                    <Link href="/account" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-[#D4421A] transition-colors">👤 My Account</Link>
                    <Link href="/account/orders" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-[#D4421A] transition-colors">📦 My Orders</Link>
                    <Link href="/track-order" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-[#D4421A] transition-colors">🚚 Track Order</Link>
                    {isAdmin && (
                        <>
                            <div className="border-t border-gray-100 my-1" />
                            <p className="px-4 py-1 text-xs text-gray-400 uppercase tracking-wide">Admin</p>
                            <Link href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-[#D4421A] hover:bg-orange-50 transition-colors">⚡ Admin Dashboard</Link>
                            <Link href="/admin/products" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#D4421A] hover:bg-orange-50 transition-colors">🛍️ Products</Link>
                            <Link href="/admin/orders" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#D4421A] hover:bg-orange-50 transition-colors">📦 Orders</Link>
                            <Link href="/admin/content" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#D4421A] hover:bg-orange-50 transition-colors">✏️ Edit Website</Link>
                        </>
                    )}
                    <div className="border-t border-gray-100 my-1" />
                    <button onClick={async () => { setOpen(false); await supabase.auth.signOut(); router.push('/'); router.refresh(); }} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors w-full text-left">🚪 Sign Out</button>
                </div>
            )}
        </div>
    )
}

export function Navbar({ settings }: { settings?: Record<string, string> }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const itemCount = useCartStore((state) => state.itemCount);
    const openCart = useUIStore((state) => state.openCart);

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/menu', label: 'Menu' },
        { href: '/custom-order', label: 'Custom Order' },
        { href: '/about', label: 'About Us' },
        { href: '/contact', label: 'Contact' },
        { href: '/blog', label: 'Blog' },
        { href: '/reviews', label: 'Reviews' },
    ];

    return (
        <header
            className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
            style={{
                background: '#FFFDF9',
                boxShadow: '0 2px 20px rgba(28,10,0,0.08)',
                borderBottom: '1px solid rgba(201,168,76,0.3)'
            }}
        >
            <div className="max-w-7xl mx-auto px-8 h-[72px] flex items-center">

                {/* Logo */}
                <Link href="/" className="flex items-baseline gap-1 shrink-0 mr-16 group">
                    <span style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                        fontSize: '1.55rem', fontWeight: 700, fontStyle: 'italic',
                        background: 'linear-gradient(135deg, #1C0A00 30%, #D4421A 100%)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text', letterSpacing: '-0.01em'
                    }}>Sweet</span>
                    <span style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                        fontSize: '1.55rem', fontWeight: 700, fontStyle: 'italic',
                        color: '#D4421A', letterSpacing: '-0.01em', position: 'relative'
                    }}>
                        Delight
                        <span style={{
                            position: 'absolute', bottom: '-1px', left: 0, right: 0,
                            height: '1.5px',
                            background: 'linear-gradient(90deg, #D4421A, #C9A84C)',
                            borderRadius: '2px'
                        }} />
                    </span>
                    <span style={{ color: '#C9A84C', fontSize: '11px', marginLeft: '2px' }}>✦</span>
                </Link>

                {/* Nav links — desktop */}
                <nav className="hidden lg:flex items-center gap-9 flex-1">
                    {navLinks.map(link => (
                        <Link key={link.href} href={link.href}
                            className="text-[12px] font-semibold uppercase tracking-[0.08em] transition-colors duration-200"
                            style={{ color: '#7C6B5E' }}
                            onMouseEnter={e => (e.target as HTMLElement).style.color = '#D4421A'}
                            onMouseLeave={e => (e.target as HTMLElement).style.color = '#7C6B5E'}>
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Right: cart + auth */}
                <div className="flex items-center gap-3 ml-auto">
                    {/* Cart icon */}
                    <button
                        onClick={openCart}
                        className="p-2.5 rounded-xl hover:bg-orange-50 text-gray-700 hover:text-[#D4421A] transition-all relative group"
                    >
                        <ShoppingCart size={22} className="group-hover:scale-110 transition-transform" />
                        {itemCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-[#D4421A] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                                {itemCount}
                            </span>
                        )}
                    </button>

                    <div className="hidden lg:block">
                        <AuthButton />
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="lg:hidden p-2.5 rounded-xl hover:bg-orange-50 text-gray-700 hover:text-[#D4421A] transition-all"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-xl lg:hidden overflow-hidden"
                    >
                        <div className="flex flex-col p-6 gap-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-lg font-semibold text-gray-800 hover:text-[#D4421A] transition-colors py-2 border-b border-gray-50 last:border-0"
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <div className="pt-4 flex justify-between items-center">
                                <AuthButton />
                                <button
                                    onClick={() => { setIsMobileMenuOpen(false); openCart(); }}
                                    className="flex items-center gap-2 bg-orange-50 text-[#D4421A] px-5 py-2.5 rounded-full font-bold text-sm"
                                >
                                    <ShoppingCart size={18} />
                                    Cart ({itemCount})
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}

