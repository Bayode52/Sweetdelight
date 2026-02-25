import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Helper to log automation execution
async function logAutomation(automationId: string, entityType: string, entityId: string, status: 'success' | 'failed' | 'skipped', errorMessage?: string) {
    await supabaseAdmin.from('automation_logs').insert({
        automation_id: automationId,
        entity_type: entityType,
        entity_id: entityId,
        status,
        error_message: errorMessage
    });
}

async function hasSentNotification(automationId: string, entityType: string, entityId: string) {
    const { data } = await supabaseAdmin
        .from('automation_notifications_sent')
        .select('id')
        .eq('automation_id', automationId)
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .single();
    return !!data;
}

async function markNotificationSent(automationId: string, entityType: string, entityId: string) {
    await supabaseAdmin.from('automation_notifications_sent').insert({
        automation_id: automationId,
        entity_type: entityType,
        entity_id: entityId
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
    // Called by pg_cron daily at 8am
    try {
        console.log(`[CRON Daily] Starting daily polling...`);
        const now = new Date();

        // ==========================================
        // AUTO-9: Low Stock / Popularity Alert
        // ==========================================
        const auto9 = await isAutomationActive('AUTO-9');
        if (auto9?.is_active) {
            const threshold = auto9.config.orderCountThreshold || 5;

            // Look for products ordered > threshold times in the last 24h
            const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

            // This requires joining order_items with orders to filter by last 24h.
            // A simplified mock query:
            const { data: popularItems, error } = await supabaseAdmin.rpc('get_popular_products_last_24h', { threshold_count: threshold });

            if (!error && popularItems && popularItems.length > 0) {
                // Determine a daily unique ID (e.g., date string) to prevent spamming
                const todayStr = now.toISOString().split('T')[0];
                const sentAlert = await hasSentNotification('AUTO-9', 'system', `popular-${todayStr}`);

                if (!sentAlert) {
                    console.log(`[AUTO-9] Popularity alert triggered for ${popularItems.length} products`);
                    try {
                        // TODO: Email admin about hot products
                        await markNotificationSent('AUTO-9', 'system', `popular-${todayStr}`);
                        await logAutomation('AUTO-9', 'system', `popular-${todayStr}`, 'success', `Items: ${popularItems.join(', ')}`);
                    } catch (e: any) {
                        await logAutomation('AUTO-9', 'system', `popular-${todayStr}`, 'failed', e.message);
                    }
                }
            }
        }

        // ==========================================
        // AUTO-10: Birthday & Occasion Reminders
        // ==========================================
        const auto10 = await isAutomationActive('AUTO-10');
        if (auto10?.is_active) {
            // Find celebration cakes ordered approx 1 year ago (-3 days)
            // Example: Today is 2026-05-10. Look for celebration cakes ordered around 2025-05-13
            console.log(`[AUTO-10] Checking for birthday reminders (1 year ago)...`);
            // Mock logic
            // await logAutomation('AUTO-10', 'customer', customerId, 'success');
        }

        // ==========================================
        // AUTO-14: Pre-order Reminder (24h before)
        // ==========================================
        const auto14 = await isAutomationActive('AUTO-14');
        if (auto14?.is_active) {
            // Check orders where estimated_time is tomorrow
            console.log(`[AUTO-14] Checking for pre-orders due tomorrow...`);
        }

        return NextResponse.json({ success: true, timestamp: now.toISOString() });
    } catch (error: any) {
        console.error('CRON Daily Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
