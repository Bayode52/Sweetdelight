import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AccountDashboard } from './AccountDashboard'

export default async function AccountPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    // Fetch comprehensive data for the professional dashboard
    const [
        { data: profile },
        { data: orders },
        { data: referrals },
        { data: latestPost },
        { data: activePromos }
    ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('orders').select('*, order_items(*)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('referrals').select('id, amount').eq('referrer_id', user.id),
        supabase.from('blog_posts').select('*').order('created_at', { ascending: false }).limit(1).single(),
        supabase.from('promos').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(1)
    ])

    const totalSpent = orders?.reduce((sum, order) => sum + (Number(order.total) || 0), 0) || 0;
    const referralCount = referrals?.length || 0;
    const totalReferralEarned = referrals?.reduce((sum, ref) => sum + (Number(ref.amount) || 0), 0) || 0;

    return (
        <AccountDashboard
            profile={profile}
            orders={orders || []}
            referralStats={{
                count: referralCount,
                totalEarned: totalReferralEarned
            }}
            lifetimeSpent={totalSpent}
            loyaltyPoints={profile?.loyalty_points || 0}
            latestPost={latestPost}
            activePromo={activePromos?.[0]}
        />
    )
}
