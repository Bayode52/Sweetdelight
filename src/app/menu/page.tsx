import { getContent } from "@/lib/content";
import { MenuPageClient } from "@/components/menu/MenuPageClient";

export const revalidate = 60; // Revalidate every 60 seconds (or 0 for always dynamic)

export default async function MenuPage() {
    const content = await getContent("menu");

    return <MenuPageClient content={content} />;
}
