import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { injectSystemMessageToChat } from '@/lib/chat';

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

// Helper to check and prevent duplicates
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

// Check if automation is active
async function isAutomationActive(automationId: string) {
    const { data } = await supabaseAdmin
        .from('automations_config')
        .select('is_active, config')
        .eq('automation_id', automationId)
        .single();
    return data;
}

export async function POST(req: Request) {
    try {
        const payload = await req.json();

        // Supabase webhook format: { type: 'INSERT' | 'UPDATE', table: 'orders', record: {...}, old_record: {...} }
        const { type, table, record, old_record } = payload;

        // Ensure this is the orders table
        if (table !== 'orders') {
            return NextResponse.json({ message: 'Ignored: not orders table' });
        }

        console.log(`[Order Webhook] ${type} for Order ${record.id} (Status: ${record.status})`);

        // ==========================================
        // AUTO-1: WhatsApp Brief (On New Order)
        // ==========================================
        if (type === 'INSERT') {
            const auto1 = await isAutomationActive('AUTO-1');
            if (auto1?.is_active) {
                const alreadySent = await hasSentNotification('AUTO-1', 'order', record.id);
                if (!alreadySent) {
                    try {
                        // TODO: Implement actual email/whatsapp sending here
                        console.log(`[AUTO-1] Sending Order Brief for ${record.order_reference} to Admin`);

                        await markNotificationSent('AUTO-1', 'order', record.id);
                        await logAutomation('AUTO-1', 'order', record.id, 'success');
                    } catch (err: any) {
                        await logAutomation('AUTO-1', 'order', record.id, 'failed', err.message);
                    }
                } else {
                    await logAutomation('AUTO-1', 'order', record.id, 'skipped', 'Already sent');
                }
            } else {
                await logAutomation('AUTO-1', 'order', record.id, 'skipped', 'Automation disabled');
            }
        }

        // ==========================================
        // Status Change Automations
        // ==========================================
        if (type === 'UPDATE' && old_record && old_record.status !== record.status) {

            // AUTO-4: Preparation Start Alert
            if (record.status === 'preparing') {
                const auto4 = await isAutomationActive('AUTO-4');
                if (auto4?.is_active) {
                    const alreadySent = await hasSentNotification('AUTO-4', 'order', record.id);
                    if (!alreadySent) {
                        try {
                            console.log(`[AUTO-4] Notifying customer prepping started for ${record.order_reference}`);
                            // Send Chatbot notification
                            if (record.customer_id) {
                                await injectSystemMessageToChat(
                                    record.customer_id,
                                    `🧁 Good news! We've started preparing your order #${record.order_reference}. We'll let you know as soon as it's ready!`
                                );
                            }

                            await markNotificationSent('AUTO-4', 'order', record.id);
                            await logAutomation('AUTO-4', 'order', record.id, 'success');
                        } catch (err: any) {
                            await logAutomation('AUTO-4', 'order', record.id, 'failed', err.message);
                        }
                    }
                }
            }

            // AUTO-5: Ready for Collection/Delivery
            if (record.status === 'ready' || record.status === 'out_for_delivery') {
                const auto5 = await isAutomationActive('AUTO-5');
                if (auto5?.is_active) {
                    const alreadySent = await hasSentNotification('AUTO-5', 'order', record.id);
                    if (!alreadySent) {
                        try {
                            console.log(`[AUTO-5] Notifying customer order is ready/out for ${record.order_reference}`);
                            // Send Chatbot notification
                            if (record.customer_id) {
                                await injectSystemMessageToChat(
                                    record.customer_id,
                                    `🎉 Your order #${record.order_reference} is ${record.status === 'ready' ? 'ready for collection' : 'out for delivery'}!`
                                );
                            }

                            await markNotificationSent('AUTO-5', 'order', record.id);
                            await logAutomation('AUTO-5', 'order', record.id, 'success');
                        } catch (err: any) {
                            await logAutomation('AUTO-5', 'order', record.id, 'failed', err.message);
                        }
                    }
                }
            }

            // AUTO-6: Delivery Confirmation (Triggers review pipeline)
            if (record.status === 'delivered') {
                const auto6 = await isAutomationActive('AUTO-6');
                if (auto6?.is_active) {
                    const alreadySent = await hasSentNotification('AUTO-6', 'order', record.id);
                    if (!alreadySent) {
                        try {
                            console.log(`[AUTO-6] Sending Delivery Confirmation for ${record.order_reference}`);
                            // NOTE: The review nudges will be handled by a CRON job later, looking at 'delivered' orders.
                            await markNotificationSent('AUTO-6', 'order', record.id);
                            await logAutomation('AUTO-6', 'order', record.id, 'success');
                        } catch (err: any) {
                            await logAutomation('AUTO-6', 'order', record.id, 'failed', err.message);
                        }
                    }
                }
            }

            // AUTO-13: Custom Quote Price Confirmed
            if (record.order_type === 'custom' && record.status === 'confirmed' && record.payment_status === 'pending') {
                const auto13 = await isAutomationActive('AUTO-13');
                if (auto13?.is_active) {
                    const alreadySent = await hasSentNotification('AUTO-13', 'order', record.id);
                    if (!alreadySent) {
                        try {
                            console.log(`[AUTO-13] Sending Custom Quote Payment Link for ${record.order_reference}`);
                            // TODO: Send Email with Quote Confirmation & Payment Link
                            await markNotificationSent('AUTO-13', 'order', record.id);
                            await logAutomation('AUTO-13', 'order', record.id, 'success');
                        } catch (err: any) {
                            await logAutomation('AUTO-13', 'order', record.id, 'failed', err.message);
                        }
                    }
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Order Webhook Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
