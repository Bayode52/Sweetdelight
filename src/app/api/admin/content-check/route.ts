import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data, error } = await sb
    .from('site_content')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(20)

  return NextResponse.json({ data, error, count: data?.length })
}
