import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

// Use standard client for operations

export async function POST(req: Request) {
    const cookieStore = cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get: (n) => cookieStore.get(n)?.value, set: () => { }, remove: () => { } } }
    );

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();

        const { data, error } = await supabase
            .from("reviews")
            .insert({
                user_id: session.user.id,
                order_id: body.orderId,
                product_id: body.productId,
                rating: body.rating,
                title: body.title,
                text: body.text,
                media_urls: body.mediaUrls,
                status: body.status || 'pending',
                helpful_count: 0
            })
            .select()
            .single();

        if (error) {
            console.error("Review insert error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch {
        return NextResponse.json({ error: "Unknown error" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const productId = searchParams.get("productId") || searchParams.get("product_id");
        const rating = searchParams.get("rating");
        const sort = searchParams.get("sort") || "newest";

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        let query = supabase
            .from("reviews")
            .select("*, profiles!reviews_user_id_fkey(full_name, avatar_url)")
            .in("status", ["approved", "featured"]);

        if (productId && productId !== "all") {
            query = query.eq("product_id", productId);
        }
        if (rating && rating !== "all") {
            query = query.eq("rating", parseInt(rating));
        }

        query = query.order("is_pinned", { ascending: false });

        if (sort === "highest") {
            query = query.order("rating", { ascending: false });
        } else if (sort === "lowest") {
            query = query.order("rating", { ascending: true });
        } else if (sort === "oldest") {
            query = query.order("created_at", { ascending: true });
        } else {
            query = query.order("created_at", { ascending: false });
        }

        const { data, error } = await query;

        if (error) throw error;

        return NextResponse.json(data);
    } catch {
        return NextResponse.json({ error: "Unknown error" }, { status: 500 });
    }
}
