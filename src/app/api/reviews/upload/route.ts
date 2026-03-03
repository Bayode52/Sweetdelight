import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Admin client removed
export async function POST(req: Request) {
    const supabase = await createClient();

    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { path } = await req.json();

        if (!path) {
            return NextResponse.json({ error: "File path is required" }, { status: 400 });
        }

        // Enforce the path starts with the user's ID to prevent cross-user uploads
        if (!path.startsWith(`${session.user.id}/`)) {
            return NextResponse.json({ error: "Invalid path logic" }, { status: 403 });
        }

        const bucket = "reviews";

        // Or if RLS is set up, we could just use anon client, but admin is safer for signed URLs.
        const { data, error } = await supabase.storage
            .from(bucket)
            .createSignedUploadUrl(path);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);

        return NextResponse.json({
            signedUrl: data.signedUrl,
            publicUrl,
            path: data.path
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || "Upload error" }, { status: 500 });
    }
}
