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
    // This is called by pg_cron every 15 minutes.
    // Auth validation could be placed here if requested securely by Supabase.
    try {
        console.log(`[CRON Frequent] Starting 15m polling...`);

        // Check active automations
        const auto2 = await isAutomationActive('AUTO-2'); // DM Ack
        const auto3 = await isAutomationActive('AUTO-3'); // DM Payment Reminders

        const now = new Date();

        // ==========================================
        // Fetch pending DM orders
        // ==========================================
        if ((auto2?.is_active) || (auto3?.is_active)) {
            const { data: dmOrders } = await supabaseAdmin
                .from('orders')
                .select('*')
                .in('payment_method', ['dm_whatsapp', 'dm_instagram'])
                .eq('payment_status', 'pending')
                .eq('status', 'pending');

            if (dmOrders && dmOrders.length > 0) {
                for (const order of dmOrders) {
                    const orderAgeMins = Math.floor((now.getTime() - new Date(order.created_at).getTime()) / 60000);

                    // AUTO-2: Order Acknowledgement
                    if (auto2?.is_active && orderAgeMins >= (auto2.config.delayMins || 0)) {
                        const sentAck = await hasSentNotification('AUTO-2', 'order', order.id);
                        if (!sentAck) {
                            console.log(`[AUTO-2] Acknowledging DM Order ${order.id}`);
                            // Send Chatbot message
                            try {
                                if (order.customer_id) {
                                    await injectSystemMessageToChat(
                                        order.customer_id,
                                        `Thanks for placing order #${order.order_reference}! Since you chose to pay via DM, please send us your proof of payment here or on Instagram/WhatsApp so we can confirm it right away. 🙏`
                                    );
                                }
                                await markNotificationSent('AUTO-2', 'order', order.id);
                                await logAutomation('AUTO-2', 'order', order.id, 'success');
                            } catch (e: any) {
                                await logAutomation('AUTO-2', 'order', order.id, 'failed', e.message);
                            }
                        }
                    }

                    // AUTO-3: Payment Reminders / Auto Cancellation
                    if (auto3?.is_active) {
                        const autoCancelMins = auto3.config.autoCancelMins || 120;
                        const reminders = auto3.config.reminders || [{ delayMins: 30 }, { delayMins: 90 }];

                        // 1. Auto Cancel Check
                        if (orderAgeMins >= autoCancelMins) {
                            console.log(`[AUTO-3] Auto-cancelling expired DM order ${order.id}`);
                            try {
                                await supabaseAdmin.from('orders').update({ status: 'cancelled' }).eq('id', order.id);
                                await logAutomation('AUTO-3', 'order', order.id, 'success', 'Auto-cancelled');
                            } catch (e: any) {
                                await logAutomation('AUTO-3', 'order', order.id, 'failed', e.message);
                            }
                            continue; // Skip reminders if cancelled
                        }

                        // 2. Reminder Checks (iterate backwards to catch latest reminder first)
                        for (let i = reminders.length - 1; i >= 0; i--) {
                            const delay = reminders[i].delayMins;
                            const reminderId = `AUTO-3-REMINDER-${i + 1}`;

                            if (orderAgeMins >= delay) {
                                const sentReminder = await hasSentNotification(reminderId, 'order', order.id);
                                if (!sentReminder) {
                                    console.log(`[AUTO-3] Sending Reminder ${i + 1} for DM order ${order.id}`);
                                    try {
                                        // Send reminder to Chat
                                        if (order.customer_id) {
                                            await injectSystemMessageToChat(
                                                order.customer_id,
                                                `Friendly reminder ⏰: We are still waiting on payment for order #${order.order_reference}. It will be automatically cancelled if unpaid. Let us know if you need help! \nAmount: £${order.total}`
                                            );
                                        }
                                        await markNotificationSent(reminderId, 'order', order.id);
                                        await logAutomation('AUTO-3', 'order', order.id, 'success', `Reminder ${i + 1} Sent`);
                                    } catch (e: any) {
                                        await logAutomation('AUTO-3', 'order', order.id, 'failed', e.message);
                                    }
                                }
                                break; // Only send the highest applicable reminder per tick
                            }
                        }
                    }
                }
            }
        }

        // ==========================================
        // AUTO-11: Abandoned Basket Recovery
        // ==========================================
        const auto11 = await isAutomationActive('AUTO-11');
        if (auto11?.is_active) {
            const delayHours = auto11.config.chatbotDelayHours || 24;
            const cutoff = new Date(now.getTime() - (delayHours * 60 * 60 * 1000));

            // In a real implementation we would iterate through incomplete cart sessions.
            // Usually this requires a `carts` or `sessions` table tracking last activity.
            // For the scaffold, we log it's running.
        }

        return NextResponse.json({ success: true, timestamp: now.toISOString() });
    } catch (error: any) {
        console.error('CRON Frequent Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
