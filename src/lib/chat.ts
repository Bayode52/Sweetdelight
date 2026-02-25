import { supabaseAdmin } from '@/lib/supabase';

/**
 * Injects a message from the system (as 'bot') into a customer's active chat session.
 * This is used by automations to send proactive alerts (e.g. order ready, payment reminders).
 * 
 * @param customerId The UUID of the authenticated customer
 * @param content The text content of the message
 */
export async function injectSystemMessageToChat(customerId: string, content: string) {
    if (!customerId) return false;

    try {
        // 1. Find the customer's most recent active chat session
        const { data: session, error: sessionError } = await supabaseAdmin
            .from('chat_sessions')
            .select('id')
            .eq('customer_id', customerId)
            .order('updated_at', { ascending: false })
            .limit(1)
            .single();

        if (sessionError || !session) {
            console.log(`[Chat Inject] No active session found for customer ${customerId}`);
            return false;
        }

        // 2. Insert the message
        const { error: insertError } = await supabaseAdmin
            .from('chat_messages')
            .insert({
                session_id: session.id,
                role: 'bot',
                content: content,
                metadata: { isSystem: true, source: 'automation' }
            });

        if (insertError) {
            console.error(`[Chat Inject] Failed to insert message: ${insertError.message}`);
            return false;
        }

        // 3. Update session updated_at immediately so polling picks it up
        await supabaseAdmin
            .from('chat_sessions')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', session.id);

        console.log(`[Chat Inject] Successfully injected message into session ${session.id}`);
        return true;
    } catch (error) {
        console.error(`[Chat Inject] Error:`, error);
        return false;
    }
}
