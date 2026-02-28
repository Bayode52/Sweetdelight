import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(null, { status: 401 })
        }

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, full_name, role, email, phone')
            .eq('id', user.id)
            .single()

        if (profileError) {
            console.error('Profile fetch error:', profileError)
            // Return basic info from auth if profile fails
            return NextResponse.json({
                id: user.id,
                full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Account',
                role: 'customer',
                email: user.email
            })
        }

        return NextResponse.json(profile)
    } catch (err) {
        console.error('Profile route error:', err)
        return NextResponse.json(null, { status: 500 })
    }
}
