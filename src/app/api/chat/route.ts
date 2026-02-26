import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
});

const ESCALATION_PHRASE = "Let me connect you with our team! Someone will be with you shortly. You can also WhatsApp us directly for a faster response 💬";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { message, sessionToken, customerName, customerEmail } = body;

        if (!message || !sessionToken) {
            return NextResponse.json({ error: "Missing message or sessionToken" }, { status: 400 });
        }

        // 1. Load or create chat session
        let { data: session, error: sessionError } = await supabaseAdmin
            .from('chat_sessions')
            .select('*')
            .eq('session_token', sessionToken)
            .single();

        // FALLBACK: If table doesn't exist or API key is invalid, use Demo Mode
        const isInfrastructureMissing = sessionError && (sessionError.code === 'PGRST205' || sessionError.message?.includes('Invalid API key'));

        if (isInfrastructureMissing) {
            console.warn("⚠️ Chat API POST in Demo Mode");
            // Simulate bot response
            const mockBotResponse = `[Demo Response] I received your message: "${message}". Please note that the system is currently disconnected from the database. To fix this, please run the SQL schema in Supabase.`;
            return NextResponse.json({
                success: true,
                message: { role: 'bot', content: mockBotResponse, created_at: new Date().toISOString() },
                status: 'bot'
            });
        }

        if (sessionError && sessionError.code !== 'PGRST116') {
            console.error("Session fetch error:", sessionError);
            return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 });
        }

        if (!session) {
            // Create a new session
            const { data: newSession, error: createError } = await supabaseAdmin
                .from('chat_sessions')
                .insert([{
                    session_token: sessionToken,
                    customer_name: customerName || null,
                    customer_email: customerEmail || null,
                    status: 'bot'
                }])
                .select()
                .single();

            if (createError) {
                console.error("Session create error:", createError);
                return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
            }
            session = newSession;
        }

        // 2. Save the customer's message
        await supabaseAdmin
            .from('chat_messages')
            .insert([{
                session_id: session.id,
                role: 'customer',
                content: message
            }]);

        // If a human has taken over or user is waiting, the bot stays silent.
        if (session.status === 'human' || session.status === 'waiting') {
            return NextResponse.json({ success: true, status: session.status });
        }

        // 3. Load active products for context
        const { data: products } = await supabaseAdmin
            .from('products')
            .select('name, price, category')
            .eq('is_available', true);

        const productListString = products
            ? products.map(p => `- ${p.name} (£${p.price}) [${p.category}]`).join('\n')
            : 'Product list temporarily unavailable.';

        // 4. Load Knowledge Base
        const { data: kb_entries } = await supabaseAdmin
            .from('chat_knowledge_base')
            .select('question, answer');

        const kbString = kb_entries && kb_entries.length > 0
            ? kb_entries.map(kb => `Q: ${kb.question}\nA: ${kb.answer}`).join('\n\n')
            : '';

        // 5. Load last 20 messages for history
        const { data: history } = await supabaseAdmin
            .from('chat_messages')
            .select('role, content')
            .eq('session_id', session.id)
            .order('created_at', { ascending: false })
            .limit(20);

        // Reverse history to chronological order (excluding the message we just saved)
        // Gemini's history starts BEFORE the current message.
        const conversationHistory = history ? history.slice(1).reverse().map(msg => ({
            role: msg.role === 'customer' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        })) : [];

        // 6. Build the System Prompt
        const systemPrompt = `You are Crave, the friendly AI assistant for Crave Bakery 
— a premium Nigerian and African pastry business based in 
the UK. You speak in a warm, helpful, professional tone.

KEY FACTS YOU KNOW:
- Products: celebration cakes from £45, small chops 
  platters from £35, chin chin from £8.50, puff puff 
  from £6, Nigerian beef pie £3.50, party boxes from £45
- Delivery: £5 flat rate, FREE over £50. Min order £20
- Lead times: Custom cakes = 5 days. Platters = 48 hours
- Payment: Card (Stripe) or WhatsApp/Instagram DM
- WhatsApp: +44 7000 000000
- Instagram: @cravebakery  
- Hours: Mon-Fri 9am-7pm, Sat 9am-5pm, Sun custom only
- All meat products are halal certified
- Full allergen info on every product page
- Custom order builder available at /custom-order

RULES:
1. Always warm, positive and helpful
2. Keep responses to 2-3 sentences max
3. For custom orders: direct to /custom-order page
4. For complaints: sympathise, then offer human handoff
5. If asked something unknown: offer to connect to team
6. Never take actual orders in chat
7. After 3 unresolved messages: proactively offer human
8. Use occasional relevant emojis — not excessive

ESCALATION (offer human handoff when):
- Customer says 'human', 'person', 'agent', 'someone'
- Specific order complaint
- Refund request
- Complex wedding/event catering discussion

Escalation response: '${ESCALATION_PHRASE}'`;

        let botMessage = "I'm sorry, I'm having a little trouble connecting to my brain right now. Can you try again?";
        let isEscalated = false;

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        const isKeyPlaceholder = !apiKey || apiKey === 'your_google_generative_ai_api_key_here';

        if (apiKey && !isKeyPlaceholder) {
            try {
                const chat = model.startChat({
                    history: conversationHistory,
                    systemInstruction: systemPrompt,
                });

                const result = await chat.sendMessage(message);
                botMessage = result.response.text();

                if (botMessage.includes(ESCALATION_PHRASE)) {
                    isEscalated = true;
                }
            } catch (err: any) {
                console.error("❌ Gemini API Error:", err);
                botMessage = `I am currently offline. ${ESCALATION_PHRASE}`;
                isEscalated = true;
                // Add internal details to console but keep user response safe
                if (err.message?.includes("ACL")) console.warn("Credential issue detected.");
            }
        } else {
            // Mock response mode if no API key is provided
            botMessage = `Hi! 👋 I'm Crave, your bakery assistant! I'm having a little technical moment. Please WhatsApp us directly at +44 7000 000000 for instant help, or try again shortly!`;
            if (message.toLowerCase().includes('human') || message.toLowerCase().includes('agent')) {
                botMessage += `\n\n${ESCALATION_PHRASE}`;
                isEscalated = true;
            }
        }

        // 7. Save Bot Response
        const { data: insertedMessage } = await supabaseAdmin
            .from('chat_messages')
            .insert([{
                session_id: session.id,
                role: 'bot',
                content: botMessage
            }])
            .select()
            .single();

        let newStatus = session.status;
        if (isEscalated) {
            newStatus = 'waiting';
            await supabaseAdmin
                .from('chat_sessions')
                .update({ status: 'waiting', whatsapp_notified: false })
                .eq('id', session.id);

            console.log(`[CHAT WIDGET] Session ${session.id} escalated to HUMAN WAITING queue.`);
        }

        return NextResponse.json({
            success: true,
            message: insertedMessage,
            status: newStatus
        });

    } catch (error: any) {
        console.error("Chat API error:", error);
        return NextResponse.json({ error: error.message || "Failed to process chat" }, { status: 500 });
    }
}
