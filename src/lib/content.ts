import { createClient } from "@/lib/supabase/client";

export type ContentMap = Record<string, string>;

export interface ContentField {
    page: string;
    section: string;
    field: string;
    value: string;
}

const DEFAULT_CONTENT: Record<string, string> = {
    // Homepage Hero
    "home.hero.badge": "🇬🇧 Premium Bakery",
    "home.hero.headline": "Baking Joy, One Bite At A Time.",
    "home.hero.subheadline": "Experience the perfect blend of tradition and craftsmanship. Handcrafted pastries delivered warm to your doorstep.",
    "home.hero.cta_text": "Order Fresh Now",
    "home.hero.hero_image": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=900",

    // Homepage Stats
    "home.hero.stats_customers": "1000+",
    "home.hero.stats_rating": "4.9/5",

    // Delivery Banner
    "home.delivery_banner.text": "🚚 Free delivery on orders over £50 · Minimum order £20 · 📍 Delivering across London",

    // Categories
    "home.categories.badge": "Shop by Category",
    "home.categories.heading": "Explore Our Bakery",
    "home.categories.button_text": "View Full Menu",

    // Footer
    "footer.about.text": "Premium cakes and pastries crafted with the finest ingredients and a touch of magic. Celebrating life's most beautiful moments.",

    // About
    "about.header.title": "Our Story",
    "about.header.subtitle": "A journey of passion, flour, and a whole lot of heart.",

    // Contact
    "contact.header.title": "Get in Touch",
    "contact.header.subtitle": "Have a question or a special request? We'd love to hear from you."
};

/**
 * Fetches and manages site content from Supabase
 */
export async function getContent(page: string): Promise<ContentMap> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("site_content")
        .select("*")
        .eq("page", page);

    if (error) {
        console.error("Content fetch error:", error);
        return {};
    }

    const contentMap: ContentMap = {};
    data?.forEach(item => {
        contentMap[`${item.section}.${item.field}`] = item.value;
    });

    return contentMap;
}

/**
 * Simple helper to resolve content with static fallback
 */
export function content(key: string, contentMap: ContentMap, page?: string) {
    const fullKey = page ? `${page}.${key}` : key;
    return contentMap[key] || DEFAULT_CONTENT[fullKey] || "";
}
