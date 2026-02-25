export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('blog_posts')
            .select('id, title, slug, excerpt, cover_image, category, author, published_at, tags')
            .eq('is_published', true)
            .order('published_at', { ascending: false });

        if (error) throw error;
        return NextResponse.json({ posts: data ?? [] });
    } catch (err: unknown) {
        console.error('Blog API error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
