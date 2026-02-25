import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    try {
        // Fetch configurations
        const { data: configs, error: configError } = await supabaseAdmin
            .from('automations_config')
            .select('*')
            .order('automation_id', { ascending: true });

        if (configError) throw configError;

        // Fetch recent logs summary (e.g., counts per automation)
        const { data: logs, error: logError } = await supabaseAdmin
            .from('automation_logs')
            .select('automation_id, status, created_at')
            .order('created_at', { ascending: false })
            .limit(100);

        if (logError) throw logError;

        return NextResponse.json({ success: true, configs, logs });
    } catch (error: any) {
        console.error('Automations API GET Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { id, is_active, config } = body;

        if (!id) {
            return NextResponse.json({ error: "Missing automation ID" }, { status: 400 });
        }

        const updateData: any = { updated_at: new Date().toISOString() };
        if (is_active !== undefined) updateData.is_active = is_active;
        if (config !== undefined) updateData.config = config;

        const { data, error } = await supabaseAdmin
            .from('automations_config')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('Automations API PUT Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
