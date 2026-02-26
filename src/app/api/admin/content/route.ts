import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const page = searchParams.get("page")
    const all = searchParams.get("all") === "true"

    const supabase = await createClient()

    if (all) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return new Response("Unauthorized", { status: 401 })
        const { data: p } = await supabase.from("profiles").select("role").eq("id", user.id).single()
        if (p?.role !== 'admin') return new Response("Forbidden", { status: 403 })
    }

    let query = supabase.from("site_content").select("*")
    if (page && !all) {
        query = query.eq("page", page)
    }

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
}

export async function PATCH(req: Request) {
    const supabase = await createClient()

    // Auth Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new Response("Unauthorized", { status: 401 })
    const { data: p } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if (p?.role !== 'admin') return new Response("Forbidden", { status: 403 })

    const body = await req.json()
    const { fields } = body // Expects an array of { page, section, field, value }

    if (!fields || !Array.isArray(fields)) {
        return NextResponse.json({ error: "Invalid fields array" }, { status: 400 })
    }

    // Update multiple records
    const results = []
    for (const f of fields) {
        const { data, error } = await supabase
            .from("site_content")
            .upsert(
                {
                    page: f.page,
                    section: f.section,
                    field: f.field,
                    value: f.value,
                    updated_at: new Date().toISOString()
                },
                { onConflict: 'page,section,field' }
            )
            .select()
            .single()

        if (error) {
            console.error(`Error updating ${f.page}.${f.section}.${f.field}:`, error)
        } else {
            results.push(data)
        }
    }

    return NextResponse.json({ success: true, updated: results.length })
}
