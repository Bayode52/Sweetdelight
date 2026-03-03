import { requireAdmin } from '@/lib/requireAdmin'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    const auth = await requireAdmin()
    if ('error' in auth) return auth.error
    const { supabase } = auth

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
