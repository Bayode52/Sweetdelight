import { getContent } from "@/lib/content";
import { HomePageClient } from "@/components/home/HomePageClient";

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const content = await getContent("homepage");

  return <HomePageClient content={content} />;
}
