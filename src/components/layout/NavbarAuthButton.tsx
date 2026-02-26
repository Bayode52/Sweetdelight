'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

interface Profile {
    full_name: string | null
    role: string | null
}

export default function NavbarAuthButton() {
    const [mounted, setMounted] = useState(false)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    useEffect(() => {
        setMounted(true)

        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session?.user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('full_name, role')
                    .eq('id', session.user.id)
                    .single()
                setProfile(data)
            }
            setLoading(false)
        }

        init()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                if (session?.user) {
                    const { data } = await supabase
                        .from('profiles')
                        .select('full_name, role')
                        .eq('id', session.user.id)
                        .single()
                    setProfile(data)
                } else {
                    setProfile(null)
                }
                setLoading(false)
                router.refresh()
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    // Prevent hydration mismatch
    if (!mounted || loading) {
        return (
            <div className="w-24 h-10 rounded-full bg-gray-100 animate-pulse" />
        )
    }

    // NOT logged in
    if (!profile) {
        return (
            <Link
                href="/auth/signup"
                className="bg-[#2C1810] text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-[#3d2418] transition-colors"
            >
                Sign Up
            </Link>
        )
    }

    // LOGGED IN
    const firstName = profile.full_name?.split(' ')[0] || 'Account'
    const isAdmin = profile.role === 'admin'

    return (
        <div className="relative group">
            <button className="flex items-center gap-2 bg-[#D4421A] text-white px-4 py-2.5 rounded-full font-semibold text-sm hover:bg-[#b8381a] transition-colors">
                <span className="w-6 h-6 bg-white/25 rounded-full flex items-center justify-center text-xs font-bold">
                    {firstName.charAt(0).toUpperCase()}
                </span>
                <span>{firstName}</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown */}
            <div className="absolute right-0 top-full pt-2 w-52 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-[100]">
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 overflow-hidden">

                    {/* Header */}
                    <div className="px-4 py-2 border-b border-gray-50">
                        <p className="font-semibold text-gray-800 text-sm">{profile.full_name || firstName}</p>
                        <p className="text-xs text-gray-400">{isAdmin ? '⚡ Admin' : 'Customer'}</p>
                    </div>

                    <Link href="/account" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-[#D4421A] transition-colors">
                        <span>👤</span> My Account
                    </Link>

                    <Link href="/account/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-[#D4421A] transition-colors">
                        <span>📦</span> My Orders
                    </Link>

                    <Link href="/account/referrals" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-[#D4421A] transition-colors">
                        <span>🎁</span> Referrals & Credits
                    </Link>

                    <Link href="/track-order" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-[#D4421A] transition-colors">
                        <span>🚚</span> Track Order
                    </Link>

                    {isAdmin && (
                        <>
                            <div className="border-t border-gray-100 my-1" />
                            <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-[#D4421A] hover:bg-orange-50 transition-colors">
                                <span>⚡</span> Admin Panel
                            </Link>
                            <Link href="/admin/products" className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#D4421A] hover:bg-orange-50 transition-colors">
                                <span>🛍️</span> Manage Products
                            </Link>
                            <Link href="/admin/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#D4421A] hover:bg-orange-50 transition-colors">
                                <span>📋</span> Manage Orders
                            </Link>
                        </>
                    )}

                    <div className="border-t border-gray-100 my-1" />

                    <button
                        onClick={async () => {
                            await supabase.auth.signOut()
                            router.push('/')
                            router.refresh()
                        }}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors w-full text-left"
                    >
                        <span>🚪</span> Sign Out
                    </button>
                </div>
            </div>
        </div>
    )
}
