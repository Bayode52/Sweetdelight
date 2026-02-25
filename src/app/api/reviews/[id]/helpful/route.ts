import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;

        // Fetch current count to increment (using service role or anon key with proper RLS)
        const { data: rev, error: fetchErr } = await supabase
            .from('reviews')
            .select('helpful_count')
            .eq('id', id)
            .single();

        if (fetchErr || !rev) {
            return NextResponse.json({ error: "Review not found" }, { status: 404 });
        }

        const { error: updateErr } = await supabase
            .from('reviews')
            .update({ helpful_count: rev.helpful_count + 1 })
            .eq('id', id);

        if (updateErr) {
            return NextResponse.json({ error: updateErr.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Unknown error" }, { status: 500 });
    }
}
