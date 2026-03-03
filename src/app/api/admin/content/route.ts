import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/requireAdmin'

export async function GET(request: Request) {
    const auth = await requireAdmin()
    if ('error' in auth) return auth.error

    try {
        const { searchParams } = new URL(request.url)
        const page = searchParams.get('page')

        const supabase = await createClient()
        let query = supabase.from('site_content').select('*')

        if (page) {
            query = query.eq('page', page)
        }

        const { data, error } = await query
        if (error) throw error

        return NextResponse.json(data)
    } catch (error) {
        console.error('Content GET error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function PATCH(request: Request) {
    const auth = await requireAdmin()
    if ('error' in auth) return auth.error
    const { supabase } = auth

    try {

        const { page, section, field, value } = await request.json()

        const { error } = await supabase
            .from('site_content')
            .upsert({
                page,
                section,
                field,
                value: String(value),
                updated_at: new Date().toISOString()
            }, { onConflict: 'page,section,field' })

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Content PATCH error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
