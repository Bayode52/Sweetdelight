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

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    const supabase = await getAdminSupabase()
    if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        const body = await req.json()
        const updates = {
            name: body.name,
            slug: body.slug,
            category: body.category,
            description: body.description,
            price: body.price,
            sale_price: body.on_sale ? body.sale_price : null,
            images: body.images || [],
            image_url: body.images?.[0]?.url || body.image_url || null,
            is_available: body.is_available ?? true,
            is_featured: body.is_featured ?? false,
            meta_title: body.meta_title,
            meta_description: body.meta_description,
            sort_order: body.sort_order || 0,
            updated_at: new Date().toISOString()
        }

        const { data, error } = await adminClient
            .from("products")
            .update(updates)
            .eq("id", params.id)
            .select()
            .single()

        if (error) throw error
        return NextResponse.json(data)
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const supabase = await getAdminSupabase()
    if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const productId = params.id

    // Check if product has orders
    const { count: orderCount } = await adminClient
        .from("order_items")
        .select("id", { count: "exact" })
        .eq("product_id", productId)

    if ((orderCount || 0) > 0) {
        // Soft delete to preserve history
        await adminClient
            .from("products")
            .update({ is_available: false, is_featured: false })
            .eq("id", productId)
        return NextResponse.json({ success: true, message: "Product hidden due to order history" })
    }

    // Hard delete + storage cleanup
    const { data: product } = await adminClient
        .from("products")
        .select("images")
        .eq("id", productId)
        .single()

    if (product?.images?.length) {
        const paths = product.images.map((img: any) => {
            const url = typeof img === 'string' ? img : img.url
            return url.split("/storage/v1/object/public/products/")[1]
        }).filter(Boolean)

        if (paths.length) {
            await adminClient.storage.from("products").remove(paths)
        }
    }

    const { error } = await adminClient.from("products").delete().eq("id", productId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
}
