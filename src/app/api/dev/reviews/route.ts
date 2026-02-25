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
        const { id, action, payload, admin_id } = body;

        console.log("Admin Review Action via internal API", { id, action });

        if (!id || !action) {
            return NextResponse.json({ error: "Missing id or action" }, { status: 400 });
        }

        if (action === "delete") {
            const { error } = await supabase.from("reviews").delete().eq("id", id);
            if (error) throw error;
            return NextResponse.json({ success: true });
        }

        const { error: updateError } = await supabase
            .from("reviews")
            .update(payload)
            .eq("id", id);

        if (updateError) throw updateError;

        if (admin_id) {
            await supabase.from("review_audit_log").insert({
                action: action,
                admin_id: admin_id,
                review_id: id
            });
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error("Internal API error handling review:", err);
        return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
    }
}
