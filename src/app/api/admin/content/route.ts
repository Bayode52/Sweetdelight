import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(req: Request) {
    try {
        const cookieStore = cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { cookies: { get: (n) => cookieStore.get(n)?.value, set: () => { }, remove: () => { } } }
        );

        const { searchParams } = new URL(req.url);
        const page = searchParams.get("page");

        let query = supabase.from("site_content").select("*");
        if (page) query = query.eq("page", page);

        const { data, error } = await query;
        if (error) throw error;

        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const cookieStore = cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { cookies: { get: (n) => cookieStore.get(n)?.value, set: () => { }, remove: () => { } } }
        );

        // Check admin role
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();
        const { updates } = body; // Array of { page, section, field, value }

        if (!Array.isArray(updates)) {
            return NextResponse.json({ error: "Expected array of updates" }, { status: 400 });
        }

        for (const update of updates) {
            const { page, section, field, value } = update;
            const { error } = await supabase
                .from("site_content")
                .upsert(
                    { page, section, field, value, updated_at: new Date().toISOString() },
                    { onConflict: 'page,section,field' }
                );
            if (error) throw error;
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
