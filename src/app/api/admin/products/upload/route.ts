import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { path, contentType } = await req.json();

        if (!path || !contentType) {
            return NextResponse.json({ error: "Missing path or content type" }, { status: 400 });
        }

        // Ensure we are uploading to the products bucket
        const { data, error } = await supabase.storage
            .from('products')
            .createSignedUploadUrl(path);

        if (error) {
            console.error("Storage upload error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            signedUrl: data.signedUrl,
            publicUrl: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/${path}`
        });

    } catch (error) {
        console.error("API error:", error);
        return NextResponse.json({ error: "Unknown error" }, { status: 500 });
    }
}
