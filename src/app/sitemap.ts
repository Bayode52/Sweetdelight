import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bakery.example.com';

    // 1. Static Routes
    const staticRoutes = [
        '',
        '/menu',
        '/reviews',
        '/about',
        '/contact',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // 2. Dynamic Product Routes
    try {
        const { data: products } = await supabase
            .from('products')
            .select('id, updated_at')
            .eq('is_available', true);

        const dynamicRoutes = (products || []).map((product) => ({
            url: `${baseUrl}/menu/${product.id}`,
            lastModified: product.updated_at || new Date().toISOString(),
            changeFrequency: 'weekly' as const,
            priority: 0.6,
        }));

        return [...staticRoutes, ...dynamicRoutes];
    } catch (error) {
        console.error('Sitemap generation error:', error);
        return staticRoutes;
    }
}
