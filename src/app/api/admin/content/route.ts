import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
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
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

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
