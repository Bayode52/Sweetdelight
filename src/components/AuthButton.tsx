'use client'
import { useState, useEffect, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const sb = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AuthButton() {
    const [user, setUser] = useState<any>(null)
    const [role, setRole] = useState<string>('customer')
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

    useEffect(() => {
        // Get initial session
        sb.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            if (session?.user) fetchRole(session.user.id)
            else setLoading(false)
        })

        // Listen for auth changes
        const { data: { subscription } } = sb.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null)
                if (session?.user) fetchRole(session.user.id)
                else { setRole('customer'); setLoading(false) }
            }
        )
        return () => subscription.unsubscribe()
    }, [])

    async function fetchRole(userId: string) {
        const { data } = await sb
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single()
        setRole(data?.role || 'customer')
        setLoading(false)
    }

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent | TouchEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('touchstart', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('touchstart', handleClickOutside)
        }
    }, [])

    async function signOut() {
        await sb.auth.signOut()
        setOpen(false)
        setUser(null)
        router.push('/')
        router.refresh()
    }

    async function signInWithGoogle() {
        await sb.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`
            }
        })
    }

    if (loading) {
        return (
            <div className="w-9 h-9 rounded-full bg-gray-100 animate-pulse" />
        )
    }

    // NOT LOGGED IN
    if (!user) {
        return (
            <div className="flex items-center gap-2">
                <button
                    onClick={signInWithGoogle}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
                    style={{ background: '#C8401A' }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                        <path d="M12 11h8.533c.044.385.067.78.067 1.184 0 5.152-3.448 8.816-8.6 8.816C5.97 21 2 17.03 2 12S5.97 3 12 3c2.7 0 4.96.99 6.69 2.61l-2.71 2.61C14.85 7.13 13.53 6.5 12 6.5c-3.04 0-5.5 2.46-5.5 5.5s2.46 5.5 5.5 5.5c2.45 0 4.13-1.25 4.76-3H12v-3.5z" />
                    </svg>
                    <span className="hidden sm:inline">Sign In</span>
                </button>
            </div>
        )
    }

    // LOGGED IN
    const initials = user.user_metadata?.full_name
        ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
        : user.email?.[0]?.toUpperCase() || '?'

    const avatar = user.user_metadata?.avatar_url

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Avatar button */}
            <button
                onClick={() => setOpen(prev => !prev)}
                className="flex items-center gap-2 rounded-full transition-all active:scale-95"
                aria-label="Account menu"
                aria-expanded={open}
            >
                <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center font-bold text-sm text-white flex-shrink-0 border-2"
                    style={{
                        background: avatar ? 'transparent' : '#C8401A',
                        borderColor: open ? '#C8401A' : 'transparent'
                    }}>
                    {avatar
                        ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        : initials
                    }
                </div>
                {/* Chevron — desktop only */}
                <span className="hidden md:block text-gray-500 text-xs transition-transform"
                    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    ▾
                </span>
            </button>

            {/* DROPDOWN MENU */}
            {open && (
                <div
                    className="absolute right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[200]"
                    style={{
                        minWidth: '220px',
                        top: '100%',
                        animation: 'dropIn 0.15s ease-out'
                    }}
                >
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-gray-100 bg-orange-50">
                        <p className="font-bold text-sm text-gray-900 truncate">
                            {user.user_metadata?.full_name || 'Welcome back!'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        {role === 'admin' && (
                            <span className="inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                                ⭐ Admin
                            </span>
                        )}
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                        {role === 'admin' && (
                            <>
                                <Link href="/admin"
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-orange-700 hover:bg-orange-50 transition-colors">
                                    <span>⚙️</span> Admin Dashboard
                                </Link>
                                <Link href="/admin/products"
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                    <span>🍰</span> Manage Products
                                </Link>
                                <Link href="/admin/orders"
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                    <span>📦</span> View Orders
                                </Link>
                                <Link href="/admin/blog"
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                    <span>📝</span> Blog Posts
                                </Link>
                                <div className="border-t border-gray-100 my-1" />
                            </>
                        )}

                        <Link href="/account"
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <span>👤</span> My Account
                        </Link>
                        <Link href="/account/orders"
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <span>🛍️</span> My Orders
                        </Link>

                        <div className="border-t border-gray-100 my-1" />

                        <button
                            onClick={signOut}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors font-semibold">
                            <span>🚪</span> Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
