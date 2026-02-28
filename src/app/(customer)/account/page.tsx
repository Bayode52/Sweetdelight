import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AccountDashboard } from './AccountDashboard'

export default async function AccountPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login?redirect=/account')
    }

    // Parallel data fetching
    const [
        { data: profile },
        { data: orders },
        { data: referrals },
        { data: latestPost },
        { data: activePromo }
    ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('orders')
            .select('*, order_items(*)')
            .eq('customer_id', user.id)
            .order('created_at', { ascending: false })
            .limit(3),
        supabase.from('referrals').select('*').eq('referrer_id', user.id),
        supabase.from('blog_posts')
            .select('*')
            .eq('is_published', true)
            .order('published_at', { ascending: false })
            .limit(1)
            .single(),
        supabase.from('promos')
            .select('*')
            .eq('is_active', true)
            .gte('expires_at', new Date().toISOString())
            .order('expires_at', { ascending: true })
            .limit(1)
            .single()
    ])

    // Calculate lifetime spend and loyalty points (1 point per £1)
    const allOrders = await supabase.from('orders').select('total').eq('customer_id', user.id)
    const lifetimeSpent = allOrders.data?.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0) || 0
    const loyaltyPoints = Math.floor(lifetimeSpent)

    const referralStats = {
        count: referrals?.length || 0,
        totalEarned: referrals?.reduce((acc, curr) => acc + (Number(curr.commission_earned) || 0), 0) || 0
    }

    return (
        <AccountDashboard
            profile={profile || {}}
            orders={orders || []}
            referralStats={referralStats}
            lifetimeSpent={lifetimeSpent}
            loyaltyPoints={loyaltyPoints}
            latestPost={latestPost}
            activePromo={activePromo}
        />
    )
}
