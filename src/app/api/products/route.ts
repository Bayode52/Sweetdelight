export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');
        const featured = searchParams.get('featured');
        const limit = parseInt(searchParams.get('limit') ?? '100');

        let query = supabase
            .from('products')
            .select('*')
            .eq('is_available', true)
            .order('sort_order', { ascending: true })
            .limit(limit);

        if (category) query = query.eq('category', category);
        if (featured === 'true') query = query.eq('is_featured', true);

        const { data, error } = await query;
        if (error) throw error;

        return NextResponse.json({ products: data ?? [] });
    } catch (err: unknown) {
        console.error('Products API error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
