import { getContent } from "@/lib/content";
import { HomePageClient } from "@/components/home/HomePageClient";

export const revalidate = 60; // Revalidate every 60 seconds (or 0 for always dynamic)

export default async function HomePage() {
  const content = await getContent("homepage");

  return <HomePageClient content={content} />;
}
