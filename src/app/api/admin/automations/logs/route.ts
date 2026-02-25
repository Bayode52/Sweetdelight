import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const automation_id = searchParams.get('automation_id');
        const status = searchParams.get('status');

        let query = supabaseAdmin
            .from('automation_logs')
            .select(`
                *,
                automations_config:automation_id (name)
            `)
            .order('created_at', { ascending: false })
            .limit(500);

        if (automation_id && automation_id !== 'all') {
            query = query.eq('automation_id', automation_id);
        }
        if (status && status !== 'all') {
            query = query.eq('status', status);
        }

        const { data: logs, error } = await query;

        if (error) throw error;

        return NextResponse.json({ success: true, logs });
    } catch (error: any) {
        console.error('Automation Logs API GET Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
