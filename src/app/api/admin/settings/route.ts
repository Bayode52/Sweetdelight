import { requireAdmin } from '@/lib/requireAdmin'
import { NextResponse } from 'next/server'

export async function GET() {
    const auth = await requireAdmin()
    if ('error' in auth) return auth.error
    const { supabase } = auth

    try {

        const { data } = await supabase
            .from('site_settings')
            .select('key, value')

        const settings: Record<string, string> = {}
        data?.forEach(row => {
            settings[row.key] = row.value || ''
        })

        return NextResponse.json(settings)
    } catch (error) {
        console.error('Settings GET error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function PATCH(request: Request) {
    const auth = await requireAdmin()
    if ('error' in auth) return auth.error
    const { supabase } = auth

    try {

        const body = await request.json()
        const updates = Object.entries(body).map(([key, value]) => ({
            key,
            value: String(value),
            updated_at: new Date().toISOString()
        }))

        const { error } = await supabase
            .from('site_settings')
            .upsert(updates, { onConflict: 'key' })

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Settings PATCH error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
