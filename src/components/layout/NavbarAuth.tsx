'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { User as UserIcon, ShoppingBag, Gift, Truck, LogOut, ChevronDown, ShieldCheck } from 'lucide-react'

export default function NavbarAuth() {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<{
        full_name: string | null
        role: string | null
    } | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        // Get initial session
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setUser(session?.user ?? null)
            if (session?.user) {
                fetchProfile(session.user.id)
            }
            setLoading(false)
        }
        getSession()

        // Listen for auth changes in real time
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setUser(session?.user ?? null)
                if (session?.user) {
                    fetchProfile(session.user.id)
                } else {
                    setProfile(null)
                }
                // Force router refresh so server components update too
                router.refresh()
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    const fetchProfile = async (userId: string) => {
        const { data } = await supabase
            .from('profiles')
            .select('full_name, role')
            .eq('id', userId)
            .single()
        setProfile(data)
    }

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    // Show nothing while loading to avoid flash
    if (loading) {
        return <div className="w-24 h-10 bg-bakery-primary/5 animate-pulse rounded-full" />
    }

    // NOT logged in → show Sign Up button
    if (!user) {
        return (
            <Link
                href="/auth/signup"
                className="hidden md:flex bg-bakery-primary text-white px-6 py-2 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-bakery-cta transition-all luxury-shadow-sm"
            >
                Sign Up
            </Link>
        )
    }

    // LOGGED IN → show My Account dropdown
    const firstName = profile?.full_name?.split(' ')[0] || 'Account'
    const isAdmin = profile?.role === 'admin'

    return (
        <div className="relative group">
            {/* Account button */}
            <button className="flex items-center gap-2 bg-bakery-cta text-white px-4 py-2 rounded-2xl font-bold luxury-shadow-sm hover:scale-105 transition-all text-sm">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-[10px] font-black">
                    {firstName.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline">{firstName}</span>
                <ChevronDown size={14} className="group-hover:rotate-180 transition-transform" />
            </button>

            {/* Dropdown menu */}
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-3xl shadow-2xl border border-bakery-primary/5 py-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 transform origin-top-right scale-95 group-hover:scale-100">

                <Link
                    href="/account"
                    className="flex items-center gap-3 px-6 py-3 text-bakery-primary/70 hover:bg-bakery-cta/5 hover:text-bakery-cta transition-colors font-bold text-sm"
                >
                    <UserIcon size={18} />
                    My Profile
                </Link>

                <Link
                    href="/account/orders"
                    className="flex items-center gap-3 px-6 py-3 text-bakery-primary/70 hover:bg-bakery-cta/5 hover:text-bakery-cta transition-colors font-bold text-sm"
                >
                    <ShoppingBag size={18} />
                    My Orders
                </Link>

                <Link
                    href="/account/referrals"
                    className="flex items-center gap-3 px-6 py-3 text-bakery-primary/70 hover:bg-bakery-cta/5 hover:text-bakery-cta transition-colors font-bold text-sm"
                >
                    <Gift size={18} />
                    Earn Credit
                </Link>

                <Link
                    href="/track-order"
                    className="flex items-center gap-3 px-6 py-3 text-bakery-primary/70 hover:bg-bakery-cta/5 hover:text-bakery-cta transition-colors font-bold text-sm"
                >
                    <Truck size={18} />
                    Track Order
                </Link>

                {/* Admin link - only shows for admin role */}
                {isAdmin && (
                    <>
                        <div className="mx-4 my-2 border-t border-bakery-primary/5" />
                        <Link
                            href="/admin"
                            className="flex items-center gap-3 px-6 py-3 text-bakery-cta font-black hover:bg-bakery-cta/10 transition-colors text-sm"
                        >
                            <ShieldCheck size={18} />
                            Admin Control
                        </Link>
                    </>
                )}

                <div className="mx-4 my-2 border-t border-bakery-primary/5" />

                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-6 py-3 text-bakery-error/60 hover:bg-bakery-error/5 hover:text-bakery-error transition-colors w-full text-left font-bold text-sm"
                >
                    <LogOut size={18} />
                    Sign Out
                </button>
            </div>
        </div>
    )
}
