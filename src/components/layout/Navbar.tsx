'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AuthButton from '@/components/AuthButton'
import { ShoppingCart } from "lucide-react"
import { useCartStore } from "@/store/useCartStore"
import { useUIStore } from "@/store/useUIStore"

const NAV_LINKS = [
    { href: '/', label: 'Home' },
    { href: '/menu', label: 'Menu' },
    { href: '/custom-order', label: 'Custom Order' },
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact' },
    { href: '/blog', label: 'Blog' },
    { href: '/reviews', label: 'Reviews' },
]

export function Navbar({ settings }: { settings?: Record<string, string> }) {
    const [mobileOpen, setMobileOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const pathname = usePathname()

    const itemCount = useCartStore((state) => state.itemCount);
    const openCart = useUIStore((state) => state.openCart);

    // Close menu on route change
    useEffect(() => { setMobileOpen(false) }, [pathname])

    // Shadow on scroll
    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 8)
        window.addEventListener('scroll', handler)
        return () => window.removeEventListener('scroll', handler)
    }, [])

    // Prevent body scroll when menu open
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [mobileOpen])

    return (
        <>
            {/* ── MAIN NAVBAR ── */}
            <header
                className="fixed top-0 left-0 right-0 z-[100]"
                style={{
                    background: 'rgba(251,248,243,0.97)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    borderBottom: '1px solid rgba(184,134,11,0.15)',
                    boxShadow: scrolled ? '0 2px 20px rgba(26,8,0,0.08)' : 'none',
                    transition: 'box-shadow 0.3s ease',
                    height: '68px',
                }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-4">

                    {/* LOGO */}
                    <Link href="/" className="flex items-baseline gap-1 flex-shrink-0">
                        <span style={{
                            fontFamily: "'Playfair Display', Georgia, serif",
                            fontSize: 'clamp(1.2rem, 4vw, 1.5rem)',
                            fontWeight: 700,
                            fontStyle: 'italic',
                            background: 'linear-gradient(135deg, #1A0800 30%, #C8401A 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}>Sweet</span>
                        <span style={{
                            fontFamily: "'Playfair Display', Georgia, serif",
                            fontSize: 'clamp(1.2rem, 4vw, 1.5rem)',
                            fontWeight: 700,
                            fontStyle: 'italic',
                            color: '#C8401A',
                            position: 'relative',
                        }}>
                            Delight
                            <span style={{
                                position: 'absolute', bottom: '-2px', left: 0, right: 0,
                                height: '1.5px',
                                background: 'linear-gradient(90deg, #C8401A, #D4A843)',
                                borderRadius: '2px',
                            }} />
                        </span>
                        <span style={{ color: '#D4A843', fontSize: '10px', marginLeft: '2px' }}>✦</span>
                    </Link>

                    {/* DESKTOP NAV LINKS */}
                    <nav className="hidden lg:flex items-center gap-7 flex-1 justify-center">
                        {NAV_LINKS.map(link => {
                            const active = pathname === link.href ||
                                (link.href !== '/' && pathname.startsWith(link.href))
                            return (
                                <Link key={link.href} href={link.href}
                                    className="text-[11.5px] font-semibold uppercase tracking-[0.08em] transition-colors duration-200 relative py-1"
                                    style={{ color: active ? '#C8401A' : '#7A6555' }}
                                >
                                    {link.label}
                                    {active && (
                                        <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                                            style={{ background: '#C8401A' }} />
                                    )}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* RIGHT SIDE — cart + auth + hamburger */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        {/* Cart */}
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

                        {/* Auth button */}
                        <AuthButton />

                        {/* HAMBURGER — mobile only */}
                        <button
                            onClick={() => setMobileOpen(prev => !prev)}
                            className="lg:hidden flex flex-col justify-center items-center w-10 h-10 rounded-xl transition-colors active:scale-95"
                            style={{ background: mobileOpen ? '#fff5f2' : 'transparent' }}
                            aria-label="Toggle menu"
                            aria-expanded={mobileOpen}
                        >
                            <span className="block w-5 h-0.5 bg-gray-700 transition-all duration-300"
                                style={{
                                    transform: mobileOpen ? 'rotate(45deg) translate(3px, 3px)' : 'none',
                                    marginBottom: mobileOpen ? 0 : '4px'
                                }} />
                            <span className="block w-5 h-0.5 bg-gray-700 transition-all duration-300"
                                style={{ opacity: mobileOpen ? 0 : 1, marginBottom: '4px' }} />
                            <span className="block w-5 h-0.5 bg-gray-700 transition-all duration-300"
                                style={{
                                    transform: mobileOpen ? 'rotate(-45deg) translate(3px, -4px)' : 'none',
                                }} />
                        </button>
                    </div>
                </div>
            </header>

            {/* ── MOBILE MENU OVERLAY ── */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-[99] lg:hidden"
                    style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* ── MOBILE MENU DRAWER ── */}
            <div
                className="fixed top-[68px] left-0 right-0 z-[99] lg:hidden overflow-y-auto"
                style={{
                    background: '#FFFDF9',
                    borderBottom: '1px solid rgba(184,134,11,0.2)',
                    maxHeight: 'calc(100vh - 68px)',
                    transform: mobileOpen ? 'translateY(0)' : 'translateY(-110%)',
                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 8px 32px rgba(26,8,0,0.12)',
                }}
            >
                <nav className="px-4 py-4">
                    {NAV_LINKS.map((link, i) => {
                        const active = pathname === link.href ||
                            (link.href !== '/' && pathname.startsWith(link.href))
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center justify-between py-4 border-b transition-colors"
                                style={{
                                    borderColor: 'rgba(184,134,11,0.1)',
                                    color: active ? '#C8401A' : '#1A0800',
                                    animationDelay: `${i * 0.04}s`,
                                }}
                            >
                                <span className="font-semibold text-base">{link.label}</span>
                                {active
                                    ? <span style={{ color: '#C8401A' }}>●</span>
                                    : <span className="text-gray-300">›</span>
                                }
                            </Link>
                        )
                    })}

                    {/* Quick actions */}
                    <div className="pt-4 pb-2 flex flex-col gap-3">
                        <Link
                            href="/custom-order"
                            onClick={() => setMobileOpen(false)}
                            className="w-full py-3.5 rounded-2xl text-center font-bold text-white text-sm"
                            style={{ background: '#C8401A' }}
                        >
                            🎂 Build Custom Cake
                        </Link>
                        <a
                            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP || '447000000000'}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-3.5 rounded-2xl text-center font-bold text-sm border-2 flex items-center justify-center gap-2"
                            style={{ borderColor: '#25D366', color: '#25D366' }}
                        >
                            💬 WhatsApp Us
                        </a>
                    </div>
                </nav>
            </div>
        </>
    )
}
