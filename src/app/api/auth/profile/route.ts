import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        // Step 1: Get the current user from their session cookie
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            )
        }

        // Step 2: Use service role to read profile (bypasses RLS)
        let profile;
        let profileError;

        if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
            const serviceSupabase = await createServiceClient();
            const result = await serviceSupabase
                .from('profiles')
                .select('id, full_name, role, email, phone')
                .eq('id', user.id)
                .single();
            profile = result.data;
            profileError = result.error;
        }

        // Fallback to regular client if service role failed or key missing
        if (!profile) {
            const { data: regularProfile, error: regularError } = await supabase
                .from('profiles')
                .select('id, full_name, role, email, phone')
                .eq('id', user.id)
                .single();
            profile = regularProfile;
            profileError = regularError;
        }

        if (profileError || !profile) {
            // Return fallback with data from auth metadata
            return NextResponse.json({
                id: user.id,
                full_name: user.user_metadata?.full_name
                    || user.user_metadata?.name
                    || user.email?.split('@')[0]
                    || 'Account',
                role: 'customer',
                email: user.email,
            })
        }

        return NextResponse.json(profile)

    } catch (err) {
        console.error('Profile route error:', err)
        return NextResponse.json(
            { error: 'Server error' },
            { status: 500 }
        )
    }
}
