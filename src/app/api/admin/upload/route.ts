import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/auth-helpers-nextjs";

export const dynamic = "force-dynamic";

// Remove global supabaseAdmin to use request-scoped client

async function verifyAdmin() {
    const cookieStore = cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get: (n) => cookieStore.get(n)?.value, set: () => { }, remove: () => { } } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { user: null, supabase };
    const { data: p } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    return { user: p?.role === "admin" ? user : null, supabase };
}

export async function POST(req: Request) {
    const { user, supabase } = await verifyAdmin();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { path, bucket = "products" } = await req.json();
        if (!path) return NextResponse.json({ error: "Path required" }, { status: 400 });

        // Generate a 15-minute signed URL for the client to PUT the file
        const { data, error } = await supabase.storage
            .from(bucket)
            .createSignedUploadUrl(path);

        if (error) throw error;

        // Also pre-compute what the public URL will be once uploaded
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
