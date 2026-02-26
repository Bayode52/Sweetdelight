import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
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

        // Auth Check
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        // Role Check
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single()

        if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

        const body = await req.json()
        const { id, action, payload } = body

        if (!id || !action) {
            return NextResponse.json({ error: "Missing id or action" }, { status: 400 })
        }

        let result

        switch (action) {
            case "delete":
                result = await supabase.from("reviews").delete().eq("id", id)
                break
            case "status_update":
                result = await supabase
                    .from("reviews")
                    .update({ status: payload.status })
                    .eq("id", id)
                break
            case "edit_content":
                result = await supabase
                    .from("reviews")
                    .update({
                        title: payload.title,
                        text: payload.text,
                        rating: payload.rating,
                        admin_edited: true,
                        original_text: payload.original_text
                    })
                    .eq("id", id)
                break
            case "toggle_pin":
                result = await supabase
                    .from("reviews")
                    .update({ is_pinned: payload.is_pinned })
                    .eq("id", id)
                break
            default:
                return NextResponse.json({ error: "Invalid action" }, { status: 400 })
        }

        if (result.error) throw result.error

        // Log the action (if security_events table exists)
        try {
            await supabase.from("security_events").insert({
                event_type: "review_moderation",
                severity: "info",
                description: `Admin ${user.email} performed ${action} on review ${id}`,
                user_id: user.id,
                metadata: { action, review_id: id, payload }
            })
        } catch (e) {
            // Ignore if table doesn't exist
        }

        return NextResponse.json({ success: true })
    } catch (err: any) {
        console.error("Review action error:", err)
        return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 })
    }
}
