import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rateLimit";
import { sanitiseText } from "@/lib/sanitise";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    const limit = await rateLimit(req, 5, 60);
    if (!limit.success) return limit.response!;

    const supabase = await createClient();

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();

        // Sanitize inputs
        const cleanTitle = sanitiseText(body.title || '');
        const cleanText = sanitiseText(body.text || '');

        // 🛡️ Anti-Spam Guard
        const { data: profile } = await supabase
            .from("profiles")
            .select("created_at, banned")
            .eq("id", session.user.id)
            .single();

        if (profile?.banned) return NextResponse.json({ error: "Terminated" }, { status: 403 });

        const accountAgeHours = (Date.now() - new Date(profile?.created_at || 0).getTime()) / (1000 * 60 * 60);
        if (accountAgeHours < 24) {
            return NextResponse.json({ error: "Security check: Account must be 24h old to post reviews" }, { status: 403 });
        }

        if (cleanText.toLowerCase().includes("http") || cleanText.toLowerCase().includes("www") || cleanText.toLowerCase().includes(".com")) {
            return NextResponse.json({ error: "No external links allowed in reviews" }, { status: 400 });
        }

        // Check for exact duplicates from same user
        const { data: existing } = await supabase
            .from("reviews")
            .select("id")
            .eq("user_id", session.user.id)
            .eq("text", cleanText)
            .maybeSingle();

        if (existing) return NextResponse.json({ error: "Duplicate review detected" }, { status: 400 });

        const { data, error } = await supabase
            .from("reviews")
            .insert({
                user_id: session.user.id,
                order_id: body.orderId,
                product_id: body.productId,
                rating: body.rating,
                title: cleanTitle,
                text: cleanText,
                original_text: cleanText, // Save original
                media_urls: body.mediaUrls,
                status: 'pending', // Always start pending
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

        const supabase = await createClient();

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
