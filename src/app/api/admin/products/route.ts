import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from "@supabase/supabase-js"

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

export async function GET(req: Request) {
    const supabase = await getAdminSupabase()
    if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category") ?? "All"
    const status = searchParams.get("status") ?? "All"
    const search = searchParams.get("search") ?? ""

    let query = adminClient.from("products").select("*", { count: "exact" })

    if (search) query = query.ilike("name", `%${search}%`)
    if (category !== "All") query = query.eq("category", category)
    if (status === "Available") query = query.eq("is_available", true)
    if (status === "Unavailable") query = query.eq("is_available", false)
    if (status === "Featured") query = query.eq("is_featured", true)

    const { data, error, count } = await query
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ products: data, total: count })
}

export async function POST(req: Request) {
    const supabase = await getAdminSupabase()
    if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        const body = await req.json()
        const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")

        // We use adminClient to bypass RLS for inserts if needed, 
        // though is_admin() helper usually handles it.
        const { data, error } = await adminClient
            .from("products")
            .insert({
                name: body.name,
                slug: body.slug || slug,
                category: body.category,
                description: body.description,
                price: body.price,
                on_sale: body.on_sale ?? false,
                sale_price: body.on_sale ? body.sale_price : null,
                images: body.images || [], // Array of text URLs
                image_url: body.images?.[0] || body.image_url || "",
                is_available: body.is_available ?? true,
                is_featured: body.is_featured ?? false,
                meta_title: body.meta_title,
                meta_description: body.meta_description,
                sort_order: body.sort_order || 0
            })
            .select()
            .single()

        if (error) throw error
        return NextResponse.json(data, { status: 201 })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
