import { getContent } from "@/lib/content";
import { getSettings } from "@/lib/settings";
import { ContactPageClient } from "@/components/contact/ContactPageClient";
import { createClient } from '@/lib/supabase/server';

export const revalidate = 60; // Revalidate every 60 seconds (or 0 for always dynamic)

export default async function ContactPage() {
    const content = await getContent("contact");
    const settings = await getSettings();

    const sb = await createClient();
    const { data: rows } = await sb
      .from('site_content')
      .select('section, field, value')
      .eq('page', 'footer');

    const mergedSettings = { ...settings };
    rows?.forEach(r => {
        if (r.field === 'phone') mergedSettings.phone = r.value;
        if (r.field === 'email') mergedSettings.email = r.value;
        if (r.field === 'whatsapp') mergedSettings.whatsapp = r.value;
        if (r.field === 'instagram') mergedSettings.instagram = r.value;
    });

    return <ContactPageClient content={content} settings={mergedSettings} />;
}
