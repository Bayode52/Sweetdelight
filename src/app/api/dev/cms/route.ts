import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(req: Request) {
    try {
        const cookieStore = cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { cookies: { get: (n) => cookieStore.get(n)?.value, set: () => { }, remove: () => { } } }
        );

        const body = await req.json();
        const { page, section, field, value } = body;

        console.log("Upserting CMS content via internal API", { page, section, field });

        // Upsert content using authenticated client
        const { error } = await supabase
            .from('site_content')
            .upsert({
                page,
                section,
                field,
                value,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'page,section,field'
            });

        if (error) {
            console.error("Internal Upsert Error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error("Internal API error:", err);
        return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
    }
}
