import { getContent } from "@/lib/content";
import { AboutPageClient } from "@/components/about/AboutPageClient";

export const revalidate = 60; // Revalidate every 60 seconds (or 0 for always dynamic)

export default async function AboutPage() {
    const content = await getContent("about");

    return <AboutPageClient content={content} />;
}
