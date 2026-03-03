import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function requireAdmin() {
    try {
        const supabase = await createClient()
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
            return {
                error: NextResponse.json(
                    { error: 'Unauthorized - please log in' },
                    { status: 401 }
                )
            }
        }

        // Use service role to check role - bypasses RLS
        const serviceClient = createServiceClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const { data: profile, error: profileError } = await serviceClient
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profileError || !profile) {
            return {
                error: NextResponse.json(
                    { error: 'Profile not found' },
                    { status: 403 }
                )
            }
        }

        if (profile.role !== 'admin') {
            return {
                error: NextResponse.json(
                    { error: 'Forbidden - admin access required' },
                    { status: 403 }
                )
            }
        }

        return { user, supabase, serviceClient }

    } catch (err) {
        console.error('requireAdmin error:', err)
        return {
            error: NextResponse.json(
                { error: 'Authentication error' },
                { status: 500 }
            )
        }
    }
}
