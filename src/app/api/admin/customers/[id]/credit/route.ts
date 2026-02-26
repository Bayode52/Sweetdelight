import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/auth-helpers-nextjs";

export const dynamic = "force-dynamic";

const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifyAdmin() {
    const cookieStore = cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get: (name) => cookieStore.get(name)?.value,
                set: () => { },
                remove: () => { },
            },
        }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: profile } = await adminClient.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") return null;
    return user;
}

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    const user = await verifyAdmin();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const customerId = params.id;
    const body = await request.json();
    const { amount, reason } = body;

    if (!amount || isNaN(amount)) {
        return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // This assumes a 'store_credit' or similar table exists, or we update profiles.
    // For now, I'll update a 'credit_balance' column in 'profiles' (needs to be added to schema)

    const { data: profile, error: fetchError } = await adminClient
        .from("profiles")
        .select("credit_balance")
        .eq("id", customerId)
        .single();

    if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });

    const newBalance = (profile?.credit_balance || 0) + amount;

    const { data, error } = await adminClient
        .from("profiles")
        .update({
            credit_balance: newBalance
        })
        .eq("id", customerId)
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Optionally log this in a credit_transactions table
    await adminClient.from("automation_logs").insert({
        event: "store_credit_added",
        details: { user_id: customerId, amount, reason, admin_id: user.id }
    });

    return NextResponse.json(data);
}
