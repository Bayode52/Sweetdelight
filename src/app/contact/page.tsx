import { getContent } from "@/lib/content";
import { getSettings } from "@/lib/settings";
import { ContactPageClient } from "@/components/contact/ContactPageClient";

export const revalidate = 60; // Revalidate every 60 seconds (or 0 for always dynamic)

export default async function ContactPage() {
    const content = await getContent("contact");
    const settings = await getSettings();

    return <ContactPageClient content={content} settings={settings} />;
}
