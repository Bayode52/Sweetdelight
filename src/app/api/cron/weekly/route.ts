import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

async function logAutomation(automationId: string, entityType: string, entityId: string, status: 'success' | 'failed' | 'skipped', errorMessage?: string) {
    await supabaseAdmin.from('automation_logs').insert({
        automation_id: automationId,
        entity_type: entityType,
        entity_id: entityId,
        status,
        error_message: errorMessage
    });
}

async function isAutomationActive(automationId: string) {
    const { data } = await supabaseAdmin
        .from('automations_config')
        .select('is_active, config')
        .eq('automation_id', automationId)
        .single();
    return data;
}

export async function POST(req: Request) {
    // Called by pg_cron weekly
    try {
        console.log(`[CRON Weekly] Starting weekly polling...`);
        const now = new Date();
        const weekStr = `${now.getFullYear()}-W${getWeekNumber(now)}`;

        // ==========================================
        // AUTO-8: Weekly Business Summary
        // ==========================================
        const auto8 = await isAutomationActive('AUTO-8');
        if (auto8?.is_active) {
            console.log(`[AUTO-8] Generating Weekly Business Summary for Admin (Week: ${weekStr})`);

            try {
                // Retrieve metrics from Supabase (mocked for now)
                const reportData = {
                    revenue: 0,
                    ordersCount: 0,
                    topProducts: [],
                    newReferrals: 0,
                };

                // TODO: Generate and send report email
                await logAutomation('AUTO-8', 'system', `weekly-summary-${weekStr}`, 'success', JSON.stringify(reportData));
            } catch (e: any) {
                await logAutomation('AUTO-8', 'system', `weekly-summary-${weekStr}`, 'failed', e.message);
            }
        }

        return NextResponse.json({ success: true, timestamp: now.toISOString() });
    } catch (error: any) {
        console.error('CRON Weekly Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

function getWeekNumber(d: Date) {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
