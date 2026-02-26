import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: { id: string } }) {
    const supabase = await createClient();
    const customerId = params.id;

    // Admin check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response("Unauthorized", { status: 401 });
    const { data: admin } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (admin?.role !== "admin") return new Response("Forbidden", { status: 403 });

    const { amount, reason } = await req.json();
    if (typeof amount !== "number") return NextResponse.json({ error: "Amount must be a number" }, { status: 400 });

    // Use RPC if available for atomic updates, or just simple increment
    // Let's check for add_store_credit RPC found in codebase
    const { data, error } = await supabase.rpc("add_store_credit", {
        p_user_id: customerId,
        p_amount: amount
    });

    if (error) {
        // Fallback to update if RPC fails
        const { data: current } = await supabase.from("profiles").select("store_credit").eq("id", customerId).single();
        const newCredit = (current?.store_credit || 0) + amount;
        const { error: updateError } = await supabase
            .from("profiles")
            .update({ store_credit: newCredit })
            .eq("id", customerId);

        if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Log transaction
    await supabase.from("store_credit_transactions").insert({
        user_id: customerId,
        amount: amount,
        reason: reason || "Admin Adjustment",
        admin_id: user.id
    });

    return NextResponse.json({ success: true });
}
