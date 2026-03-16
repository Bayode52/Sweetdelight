import { getContent } from "@/lib/content";
import { getSettings } from "@/lib/settings";
import { HomePageClient } from "@/components/home/HomePageClient";
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const content = await getContent("home");
  const settings = await getSettings();

  const sb = await createClient()
  const { data: imgRows } = await sb
    .from('site_content')
    .select('section, field, value')
    .eq('page', 'homepage')

  const imgs: Record<string, string> = {}
  imgRows?.forEach(r => { imgs[`${r.section}__${r.field}`] = r.value })

  const heroImage    = imgs['hero__image']         || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=85&w=900'
  const cakesImage   = imgs['category__cakes_image']      || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=600'
  const smallchopsImage = imgs['category__smallchops_image'] || 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&q=80&w=600'
  const chinChinImage = imgs['category__chinchin_image']  || 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&q=80&w=600'
  const partyBoxImage = imgs['category__partybox_image']  || 'https://images.unsplash.com/photo-1548940740-204726a19be3?auto=format&fit=crop&q=80&w=600'

  return <HomePageClient content={content} settings={settings} images={{ heroImage, cakesImage, smallchopsImage, chinChinImage, partyBoxImage }} />;
}
