import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';


export async function POST(req: NextRequest) {


    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { items } = await req.json();

        if (!items) {
            return NextResponse.json({ error: "Missing cart items" }, { status: 400 });
        }

        const { error } = await supabase
            .from("cart_snapshots")
            .upsert({
                user_id: session.user.id,
                items,
                updated_at: new Date().toISOString()
            });

        if (error) throw error;

        return NextResponse.json({ success: true });

    } catch (error: unknown) {
        console.error("Cart Save Error:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
