import { getContent } from "@/lib/content";
import { ContactPageClient } from "@/components/contact/ContactPageClient";

export const revalidate = 60; // Revalidate every 60 seconds (or 0 for always dynamic)

export default async function ContactPage() {
    const content = await getContent("contact");

    return <ContactPageClient content={content} />;
}
