import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from "@supabase/supabase-js"

// Admin client with service role to bypass RLS for write operations
const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getAdminSupabase() {
    const cookieStore = cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) { return cookieStore.get(name)?.value },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

    if (profile?.role !== "admin") return null
    return supabase
}

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const supabase = await getAdminSupabase()
    if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: profile, error } = await adminClient
        .from("profiles")
        .select(`
      *,
      orders:orders(*)
    `)
        .eq("id", params.id)
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(profile)
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    const supabase = await getAdminSupabase()
    if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { role, banned, is_bot, full_name, phone } = body

    const { data, error } = await adminClient
        .from("profiles")
        .update({
            role,
            banned,
            is_bot,
            full_name,
            phone,
            updated_at: new Date().toISOString()
        })
        .eq("id", params.id)
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    const supabase = await getAdminSupabase()
    if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const customerId = params.id

    // Check for existing orders
    const { data: orders } = await adminClient
        .from("orders")
        .select("id")
        .eq("customer_id", customerId)
        .limit(1)

    if (orders && orders.length > 0) {
        // Anonymize instead of deleting if they have orders
        const { error } = await adminClient
            .from("profiles")
            .update({
                full_name: "Deleted User",
                email: `deleted_${customerId}@sweetdelight.co.uk`,
                phone: null,
                banned: true,
                ban_reason: "Account deleted/anonymized by admin."
            })
            .eq("id", customerId)

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json({ success: true, message: "User anonymized due to order history" })
    } else {
        // Hard delete if no orders
        const { error } = await adminClient
            .from("profiles")
            .delete()
            .eq("id", customerId)

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json({ success: true, message: "User deleted successfully" })
    }
}
