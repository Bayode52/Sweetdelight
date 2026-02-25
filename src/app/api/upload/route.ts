import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { path, contentType } = await req.json();

        if (!path || !contentType) {
            return NextResponse.json({ error: "Missing path or content type" }, { status: 400 });
        }

        // Add constraints for uploads
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime'];
        if (!allowedTypes.includes(contentType)) {
            return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
        }

        const { data, error } = await supabase.storage
            .from('reviews')
            .createSignedUploadUrl(path);

        if (error) {
            console.error("Storage upload error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ signedUrl: data.signedUrl });

    } catch (error) {
        console.error("API error:", error);
        return NextResponse.json({ error: "Unknown error" }, { status: 500 });
    }
}
