import { getContent } from "@/lib/content";
import { getSettings } from "@/lib/settings";
import { HomePageClient } from "@/components/home/HomePageClient";

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const content = await getContent("home");
  const settings = await getSettings();

  return <HomePageClient content={content} settings={settings} />;
}
