import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Service client bypasses ALL RLS — required for writes
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET — fetch all content or specific field
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = searchParams.get('page')
    const sb = getServiceClient()

    let query = sb.from('site_content').select('*')
    if (page) query = query.eq('page', page)

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST — save a single field
export async function POST(req: Request) {
  try {
    // Verify caller is logged in
    const authClient = await createServerClient()
    const { data: { user } } = await authClient.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Not logged in' }, { status: 401 })
    }

    const body = await req.json()
    const { page, section, field, value } = body

    if (!page || !section || !field) {
      return NextResponse.json(
        { error: 'page, section and field are required' },
        { status: 400 }
      )
    }

    const sb = getServiceClient()

    // Delete existing row first to avoid constraint conflicts
    await sb.from('site_content')
      .delete()
      .eq('page', page)
      .eq('section', section)
      .eq('field', field)

    // Insert fresh
    const { data, error } = await sb.from('site_content').insert({
      page,
      section,
      field,
      value: value || '',
      updated_at: new Date().toISOString(),
    }).select().single()

    if (error) {
      console.error('Content save error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Revalidate all pages that show this content
    revalidatePath('/')
    revalidatePath('/contact')
    revalidatePath('/about')
    revalidatePath('/menu')
    revalidatePath('/(.*)', 'layout')

    return NextResponse.json({ success: true, data })

  } catch (err: any) {
    console.error('Content API error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// PATCH — alias for POST (some code uses PATCH)
export async function PATCH(req: Request) {
  return POST(req)
}
