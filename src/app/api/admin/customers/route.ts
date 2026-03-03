import { requireAdmin } from '@/lib/requireAdmin'
import { NextResponse } from 'next/server'

export async function GET() {
    const auth = await requireAdmin()
    if ('error' in auth) return auth.error
    const { supabase } = auth

    // Fetch Customers with Order Counts
    const { data: customers, error } = await supabase
        .from("profiles")
        .select(`
      *,
      orders:orders(id)
    `)
        .order("created_at", { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json(customers)
}
