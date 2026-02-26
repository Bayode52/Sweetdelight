import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
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

    // Auth & Admin Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

    if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    try {
        const { path, bucket = "products" } = await req.json()
        if (!path) return NextResponse.json({ error: "Path required" }, { status: 400 })

        // Generate a 15-minute signed URL for the client to PUT the file
        // Note: We use the server client here which has the user's session
        const { data, error } = await supabase.storage
            .from(bucket)
            .createSignedUploadUrl(path)

        if (error) throw error

        // Pre-compute public URL
        const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path)

        return NextResponse.json({
            signedUrl: data.signedUrl,
            publicUrl,
            path: data.path
        })
    } catch (e: any) {
        console.error("Upload error:", e)
        return NextResponse.json({ error: e.message || "Upload error" }, { status: 500 })
    }
}
