import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");
const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
});

const ESCALATION_PHRASE = "I'm connecting you with our team now!";

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
        const systemPrompt = `
You are the friendly AI assistant for Crave Bakery, a premium Nigerian and African pastry business based in the UK. Your name is "Crave". You speak in a warm, helpful, professional tone — friendly but not overly casual. You represent a business that serves the Nigerian and African diaspora community as well as British customers.

WHAT YOU KNOW:
- Products:
${productListString}

- Knowledge Base / FAQs:
${kbString}

- Delivery: £5 for orders under £50, free over £50. Minimum order £20. UK-wide delivery.
- Lead times: Custom cakes 5 days notice, party platters 48 hours.
- Payment: Card (Stripe) or WhatsApp/Instagram DM.
- Contact: WhatsApp 07123456789, Instagram @cravebakery_uk, email hello@cravebakery.co.uk
- Business hours: Mon–Fri 9am–7pm, Sat 9am–5pm

BEHAVIOURAL RULES:
1. Always be helpful and positive — never say "I don't know" without offering an alternative.
2. For product questions: provide accurate pricing and descriptions from the product list.
3. For order tracking: ask for their order reference number, then say you'll check it (simulate checking for now).
4. For custom orders: direct them to the "Custom Order" section/page with enthusiasm.
5. For complaints: be empathetic first, then escalate to human ("Let me get a team member to help you with this personally").
6. If asked something you genuinely cannot answer: say "Great question! Let me connect you with our team." and trigger human escalation.
7. Always end responses with a question or next step to keep conversation flowing.
8. For order placement: guide them to the menu or custom order page — do not take orders directly in chat.
9. Mention WhatsApp as a contact option for urgent queries.

ESCALATION TRIGGERS (switch to human mode):
- Customer says "speak to a person", "talk to someone", "human", "agent"
- Customer complaint about a specific order (food quality, wrong item, delivery issue)
- Custom cake discussion that's complex (wedding cake, large event)
- Any mention of refund or cancellation

CRITICAL ESCALATION PROTOCOL:
If you need to escalate based on the triggers above, your response MUST contain EXACTLY this phrase somewhere in the text:
"${ESCALATION_PHRASE}"
(e.g. "I'm sorry you are having issues. ${ESCALATION_PHRASE} In the meantime, you can also WhatsApp us directly at 07123456789 for a faster response.")
`;

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
            } catch (err) {
                console.error("Gemini API Error:", err);
                botMessage = `I am currently offline. ${ESCALATION_PHRASE}`;
                isEscalated = true;
            }
        } else {
            // Mock response mode if no API key is provided
            botMessage = `[Mock Response] I'm Crave, the bakery assistant! Please add a GOOGLE_GENERATIVE_AI_API_KEY to your .env to chat properly. Should I answer a question, or would you like to speak to a human?`;
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
