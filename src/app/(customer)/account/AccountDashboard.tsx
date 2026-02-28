"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Package,
    TrendingUp,
    Gift,
    Star,
    Copy,
    Check,
    Share2,
    ChevronRight,
    Settings as SettingsIcon,
    Home,
    ShoppingBag,
    Palette,
    Truck,
    Phone,
    MessageSquareQuote as ReviewsIcon,
    ArrowRight,
    ChevronDown,
    LogOut,
    ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'
import { useCartStore } from '@/store/useCartStore'
import { Badge } from '@/components/ui/Badge'
import { ReviewModal } from './ReviewModal'
import { supabase } from '@/lib/supabase'

interface AccountDashboardProps {
    profile: any
    orders: any[]
    referralStats: { count: number, totalEarned: number }
    lifetimeSpent: number
    loyaltyPoints: number
    latestPost?: any
    activePromo?: any
}

export function AccountDashboard({
    profile,
    orders,
    referralStats,
    lifetimeSpent,
    loyaltyPoints,
    latestPost,
    activePromo
}: AccountDashboardProps) {
    const [settingsOpen, setSettingsOpen] = useState(false)
    const [copied, setCopied] = useState(false)
    const [reviewOrder, setReviewOrder] = useState<any>(null)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({
        full_name: profile?.full_name || '',
        phone: profile?.phone || '',
        newsletter_subscribed: profile?.newsletter_subscribed || false
    })

    const router = useRouter()
    const addItem = useCartStore((state) => state.addItem)

    const firstName = profile?.full_name?.split(' ')[0] || 'there'

    const handleCopyCode = () => {
        navigator.clipboard.writeText(profile?.referral_code || '')
        setCopied(true)
        toast.success('Referral code copied!')
        setTimeout(() => setCopied(false), 2000)
    }

    const handleReorder = (order: any) => {
        order.order_items.forEach((item: any) => {
            addItem({
                id: item.product_id,
                name: item.product_name,
                price: Number(item.unit_price),
                image: item.product_image || '/placeholder.jpg',
                isAvailable: true,
                isFeatured: false,
                rating: 5,
                reviewCount: 0,
                category: 'Reordered',
                description: item.product_name
            })
        })
        toast.success('Items added to cart! 🛍️')
        router.push('/cart')
    }

    const handleSaveProfile = async () => {
        setSaving(true)
        try {
            const { error } = await supabase
                .from('profiles')
                .update(formData)
                .eq('id', profile.id)

            if (error) throw error
            toast.success('Profile updated! ✅')
            router.refresh()
        } catch (err) {
            toast.error('Failed to update profile')
        } finally {
            setSaving(false)
        }
    }

    const statusColors: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-700',
        confirmed: 'bg-blue-100 text-blue-700',
        preparing: 'bg-orange-100 text-orange-700 animate-pulse',
        ready: 'bg-purple-100 text-purple-700',
        delivered: 'bg-green-100 text-green-700',
        cancelled: 'bg-red-100 text-red-700'
    }

    return (
        <div className="min-h-screen bg-[#FAF7F4] pt-24 pb-12 px-4 md:px-8">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* SECTION 1: Welcome Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden bg-white rounded-3xl p-8 md:p-12 luxury-shadow border border-orange-100"
                >
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-orange-50/50 to-transparent pointer-events-none" />
                    <div className="relative z-10 max-w-lg">
                        <h1 className="text-4xl md:text-5xl font-playfair font-black text-[#2C1810] mb-3">
                            Welcome back, {firstName}! 👋
                        </h1>
                        <p className="text-gray-500 font-medium text-lg">
                            Here's what's happening with your account today.
                        </p>
                    </div>
                    <div className="absolute right-8 bottom-8 text-6xl opacity-20 pointer-events-none transform rotate-12 hidden md:block">
                        🍰
                    </div>
                </motion.div>

                {/* SECTION 2: Quick Stats Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Orders', value: orders.length, icon: Package, color: 'text-blue-500', bg: 'bg-blue-50', link: '/account/orders' },
                        { label: 'Total Spent', value: `£${lifetimeSpent.toFixed(2)}`, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50', sub: 'Thank you for your loyalty!' },
                        { label: 'Store Credit', value: `£${(profile?.store_credit || 0).toFixed(2)}`, icon: Gift, color: 'text-purple-500', bg: 'bg-purple-50', sub: 'Use at checkout', link: '#' },
                        { label: 'Loyalty Points', value: loyaltyPoints, icon: Star, color: 'text-orange-500', bg: 'bg-orange-50', sub: '1 point = £1 off', link: '#' }
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white p-6 rounded-2xl luxury-shadow border border-gray-50 flex flex-col items-start"
                        >
                            <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                                <stat.icon size={20} />
                            </div>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                            <p className="text-2xl font-black text-[#2C1810] mb-1">{stat.value}</p>
                            {stat.sub && <p className="text-[11px] text-gray-400 font-medium">{stat.sub}</p>}
                            {stat.link && (
                                <Link href={stat.link} className="text-[#D4421A] text-[11px] font-bold mt-2 flex items-center gap-1 hover:underline">
                                    {stat.label === 'Store Credit' ? 'How to use' : stat.label === 'Loyalty Points' ? 'Learn more' : 'My Orders'} <ChevronRight size={12} />
                                </Link>
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* SECTION 3: Recent Orders */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-playfair font-black text-[#2C1810]">Your Recent Orders</h2>
                            <Link href="/account/orders" className="text-[#D4421A] text-sm font-bold flex items-center gap-1 hover:underline">
                                View All <ArrowRight size={14} />
                            </Link>
                        </div>

                        {orders.length === 0 ? (
                            <div className="bg-white p-12 rounded-[40px] text-center luxury-shadow border border-orange-50">
                                <span className="text-6xl block mb-4">🎂</span>
                                <h3 className="text-xl font-black text-[#2C1810] mb-2">No orders yet!</h3>
                                <p className="text-gray-500 font-medium mb-6">Ready to treat yourself?</p>
                                <Link
                                    href="/menu"
                                    className="bg-[#D4421A] text-white px-8 py-3 rounded-full font-bold hover:brightness-110 transition-all inline-block"
                                >
                                    Browse Our Menu
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {orders.map((order) => (
                                    <motion.div
                                        key={order.id}
                                        layout
                                        className="bg-white p-6 rounded-3xl border border-gray-100 luxury-shadow flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-orange-200 transition-all"
                                    >
                                        <div className="space-y-1 text-center md:text-left">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">#{order.order_reference}</p>
                                            <p className="font-black text-[#2C1810]">{format(new Date(order.created_at), 'MMMM d, yyyy')}</p>
                                            <p className="text-sm text-gray-500 italic">
                                                {order.order_items?.[0]?.product_name}
                                                {order.order_items?.length > 1 && ` and ${order.order_items.length - 1} more`}
                                            </p>
                                        </div>

                                        <div className="flex flex-col items-center md:items-end gap-2">
                                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                                                {order.status.replace('_', ' ')}
                                            </div>
                                            <p className="text-xl font-black text-[#D4421A]">£{Number(order.total).toFixed(2)}</p>
                                        </div>

                                        <div className="flex gap-2 w-full md:w-auto">
                                            <button
                                                onClick={() => handleReorder(order)}
                                                className="flex-1 md:flex-none h-12 px-6 bg-[#2C1810] text-white rounded-2xl font-bold text-sm hover:bg-[#3d2418] transition-all"
                                            >
                                                Reorder
                                            </button>
                                            {order.status === 'delivered' && (
                                                <button
                                                    onClick={() => setReviewOrder(order)}
                                                    className="flex-1 md:flex-none h-12 px-6 bg-white border border-gray-200 text-[#2C1810] rounded-2xl font-bold text-sm hover:bg-orange-50 hover:border-orange-200 transition-all"
                                                >
                                                    Leave Review
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {/* SECTION 4: Referral Programme */}
                        <div className="bg-gradient-to-br from-orange-500 to-[#D4421A] rounded-[40px] p-8 md:p-12 text-white luxury-shadow relative overflow-hidden">
                            <div className="relative z-10 space-y-8">
                                <div className="max-w-md">
                                    <h2 className="text-3xl font-playfair font-black mb-3">🎁 Share the Sweetness</h2>
                                    <p className="text-orange-50 font-medium">
                                        Earn £5 credit for every friend you refer. Your friend gets 10% off their first order too!
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-xs font-bold uppercase tracking-widest text-orange-200">Your referral code</p>
                                    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 max-w-sm">
                                        <code className="flex-1 text-2xl font-black tracking-widest">{profile?.referral_code || 'SD-UNAVAIL'}</code>
                                        <button
                                            onClick={handleCopyCode}
                                            className="w-10 h-10 bg-white text-[#D4421A] rounded-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg"
                                        >
                                            {copied ? <Check size={18} /> : <Copy size={18} />}
                                        </button>
                                    </div>
                                    <div className="flex gap-6 mt-4">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase text-orange-200">Friends referred</p>
                                            <p className="text-xl font-black">{referralStats.count}</p>
                                        </div>
                                        <div className="w-px h-8 bg-white/20 shrink-0 self-center" />
                                        <div>
                                            <p className="text-[10px] font-bold uppercase text-orange-200">Earned</p>
                                            <p className="text-xl font-black">£{referralStats.totalEarned.toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-3 pt-4">
                                    <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-bold transition-all">
                                        📱 WhatsApp
                                    </button>
                                    <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-bold transition-all">
                                        📸 Instagram
                                    </button>
                                    <button onClick={handleCopyCode} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-bold transition-all">
                                        🔗 Copy Link
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-white/10">
                                    <div className="space-y-2">
                                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-black text-xs text-white">1</div>
                                        <p className="text-sm font-bold">Share code</p>
                                        <p className="text-xs text-orange-50 opacity-80">Send your code to your friends.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-black text-xs text-white">2</div>
                                        <p className="text-sm font-bold">They order</p>
                                        <p className="text-xs text-orange-50 opacity-80">They use it on their first purchase.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-black text-xs text-white">3</div>
                                        <p className="text-sm font-bold">Get rewarded</p>
                                        <p className="text-xs text-orange-50 opacity-80">You both get a sweet bonus!</p>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                        </div>
                    </div>

                    {/* Sidebar Area */}
                    <div className="space-y-8">

                        {/* SECTION 5: Become an Affiliate */}
                        {profile?.role !== 'affiliate' && profile?.role !== 'admin' && (
                            <div className="bg-[#2C1810] rounded-3xl p-8 text-white luxury-shadow relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 blur-2xl rounded-full translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-700" />
                                <div className="space-y-6 relative z-10">
                                    <div className="w-12 h-12 bg-yellow-400/20 text-yellow-400 rounded-2xl flex items-center justify-center">
                                        <TrendingUp size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-playfair font-black text-yellow-400">💼 Want to Earn More?</h3>
                                        <p className="text-gray-400 font-medium text-sm mt-2">
                                            Join our affiliate programme and earn 8% commission on every order you bring in.
                                        </p>
                                    </div>
                                    <ul className="space-y-3">
                                        {[
                                            '8% commission per order',
                                            'Real-time dashboard',
                                            'Dedicated support',
                                            'Monthly payouts'
                                        ].map(benefit => (
                                            <li key={benefit} className="flex items-center gap-2 text-xs font-medium">
                                                <div className="w-4 h-4 rounded-full bg-yellow-400/20 flex items-center justify-center text-yellow-400">✓</div>
                                                {benefit}
                                            </li>
                                        ))}
                                    </ul>
                                    <Link
                                        href="/affiliates/apply"
                                        className="inline-flex items-center justify-between w-full bg-yellow-400 text-[#2C1810] px-6 py-4 rounded-2xl font-black text-sm hover:brightness-110 transition-all hover:gap-8 gap-4"
                                    >
                                        Apply Now <ArrowRight size={18} />
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* SECTION 6: Latest from the Bakery */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-playfair font-black text-[#2C1810]">🍰 What's New</h3>

                            {/* Blog Promo */}
                            {latestPost && (
                                <Link
                                    href={`/blog/${latestPost.slug}`}
                                    className="block bg-white rounded-3xl overflow-hidden luxury-shadow border border-gray-50 group"
                                >
                                    <div className="aspect-video relative overflow-hidden">
                                        <Image
                                            src={latestPost.cover_image || '/placeholder.jpg'}
                                            alt={latestPost.title}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute top-4 left-4 bg-orange-100 text-[#D4421A] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                            {latestPost.category || 'Bakery Life'}
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <h4 className="font-black text-[#2C1810] mb-2 group-hover:text-[#D4421A] transition-colors">{latestPost.title}</h4>
                                        <p className="text-xs text-[#D4421A] font-bold flex items-center gap-1">Read More <ArrowRight size={12} /></p>
                                    </div>
                                </Link>
                            )}

                            {/* Active Promo or Custom Order */}
                            {activePromo ? (
                                <div className="bg-orange-50 border-2 border-dashed border-orange-200 rounded-3xl p-6 text-center">
                                    <p className="text-xs font-bold text-[#D4421A] uppercase tracking-widest mb-3">Limited time offer</p>
                                    <h4 className="text-2xl font-black text-[#2C1810] mb-4">
                                        {activePromo.discount_type === 'percent' ? `${activePromo.discount_value}% OFF` : `£${activePromo.discount_value} OFF`}
                                    </h4>
                                    <div className="bg-white border border-orange-100 rounded-2xl p-4 mb-4">
                                        <p className="text-xs text-gray-400 mb-1">Use code at checkout</p>
                                        <code className="text-xl font-black text-[#D4421A] tracking-wider">{activePromo.code}</code>
                                    </div>
                                    <p className="text-[10px] text-gray-400">Expires {format(new Date(activePromo.expires_at), 'MMM d, yyyy')}</p>
                                </div>
                            ) : (
                                <Link
                                    href="/custom-cakes"
                                    className="block bg-[#FAF0E6] rounded-3xl p-8 border border-orange-100 text-center space-y-4 hover:border-orange-200 transition-all group"
                                >
                                    <div className="w-16 h-16 bg-white rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform">🎨</div>
                                    <div>
                                        <h4 className="text-xl font-playfair font-black text-[#2C1810] mb-1">Planning a celebration?</h4>
                                        <p className="text-sm text-gray-500">Let our AI design your perfect cake in seconds.</p>
                                    </div>
                                    <span className="inline-block bg-[#2C1810] text-white px-6 py-3 rounded-full font-bold text-sm tracking-wide">
                                        Start Custom Order
                                    </span>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* SECTION 7: Quick Links Bar */}
                <div className="bg-white rounded-2xl luxury-shadow border border-gray-50 p-4 overflow-x-auto">
                    <div className="flex justify-between md:justify-center items-center gap-8 md:gap-16 min-w-max px-4">
                        {[
                            { label: 'Home', icon: Home, link: '/' },
                            { label: 'Menu', icon: ShoppingBag, link: '/menu' },
                            { label: 'Custom', icon: Palette, link: '/custom-cakes' },
                            { label: 'Track', icon: Truck, link: '/track-order' },
                            { label: 'Reviews', icon: ReviewsIcon, link: '/reviews' },
                            { label: 'Contact', icon: Phone, link: '/contact' }
                        ].map(item => (
                            <Link
                                key={item.label}
                                href={item.link}
                                className="flex items-center gap-2 text-gray-400 hover:text-[#D4421A] font-bold text-sm transition-colors group"
                            >
                                <item.icon size={18} className="group-hover:scale-110 transition-transform" />
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* SECTION 8: Account Settings (Collapsed) */}
                <div className="bg-white rounded-[40px] luxury-shadow border border-gray-50 overflow-hidden">
                    <button
                        onClick={() => setSettingsOpen(!settingsOpen)}
                        className="w-full flex items-center justify-between p-8 hover:bg-orange-50/30 transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-500">
                                <SettingsIcon size={24} />
                            </div>
                            <div className="text-left">
                                <h3 className="text-xl font-playfair font-black text-[#2C1810]">Account Settings</h3>
                                <p className="text-sm text-gray-400 font-medium">Manage your personal details and preferences</p>
                            </div>
                        </div>
                        <ChevronDown
                            className={`text-gray-300 transition-transform duration-300 ${settingsOpen ? 'rotate-180' : ''}`}
                            size={24}
                        />
                    </button>

                    <AnimatePresence>
                        {settingsOpen && (
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: 'auto' }}
                                exit={{ height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="p-8 border-t border-gray-50 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-gray-400">Full Name</label>
                                            <input
                                                value={formData.full_name}
                                                onChange={e => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                                                className="w-full h-14 bg-[#FAF7F4] border-none rounded-2xl px-6 font-bold text-[#2C1810] focus:ring-2 focus:ring-[#D4421A]/20 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-gray-400">Phone Number</label>
                                            <input
                                                value={formData.phone}
                                                onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                                className="w-full h-14 bg-[#FAF7F4] border-none rounded-2xl px-6 font-bold text-[#2C1810]"
                                            />
                                        </div>
                                        <div className="space-y-2 relative">
                                            <label className="text-xs font-black uppercase tracking-widest text-gray-400">Email Address (Read Only)</label>
                                            <input
                                                value={profile?.email}
                                                readOnly
                                                className="w-full h-14 bg-[#FAF7F4] border-none rounded-2xl px-6 font-bold text-gray-400 opacity-60 cursor-not-allowed"
                                            />
                                            <p className="text-[10px] text-orange-400 font-bold mt-1 uppercase italic">Contact support to change email</p>
                                        </div>
                                        <div className="flex flex-col justify-center gap-4">
                                            <Link href="/auth/reset-password" title="Change Password" className="text-sm font-bold text-[#D4421A] flex items-center gap-2 hover:underline">
                                                Change Password <ExternalLink size={14} />
                                            </Link>

                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    id="newsletter"
                                                    checked={formData.newsletter_subscribed}
                                                    onChange={e => setFormData(prev => ({ ...prev, newsletter_subscribed: e.target.checked }))}
                                                    className="w-5 h-5 rounded border-gray-300 text-[#D4421A] focus:ring-[#D4421A]"
                                                />
                                                <label htmlFor="newsletter" className="text-sm font-bold text-[#2C1810] cursor-pointer">
                                                    I want to receive the latest treats and offers in my inbox! 🥐
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-4 pt-8">
                                        <button
                                            onClick={handleSaveProfile}
                                            disabled={saving}
                                            className="flex-[2] h-16 bg-[#D4421A] text-white rounded-2xl font-black luxury-shadow-sm hover:brightness-110 transition-all flex items-center justify-center gap-2"
                                        >
                                            {saving ? 'Saving...' : 'Save Changes'}
                                        </button>
                                        <button
                                            onClick={async () => {
                                                await supabase.auth.signOut()
                                                router.push('/')
                                                router.refresh()
                                            }}
                                            className="flex-1 h-16 bg-red-50 text-red-600 rounded-2xl font-black hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                                        >
                                            <LogOut size={20} /> Sign Out
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

            </div>

            {/* Review Modal */}
            <AnimatePresence>
                {reviewOrder && (
                    <ReviewModal
                        orderId={reviewOrder.id}
                        items={reviewOrder.order_items || []}
                        onClose={() => setReviewOrder(null)}
                        onSuccess={() => {
                            setReviewOrder(null)
                            router.refresh()
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}
