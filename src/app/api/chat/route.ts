import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: Request) {
    try {
        const { message, history = [] } = await req.json();

        if (!message?.trim()) {
            return NextResponse.json({ error: "Message required" }, { status: 400 });
        }

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

        // EMERGENCY FALLBACK if no API key
        if (!apiKey) {
            return NextResponse.json({
                message: "Hi! I'm Chloe from Sweet Delight 🧁 I'm currently whisking up some new features, so I might be a bit quiet. Please message us on WhatsApp for instant help with your order!"
            });
        }

        const systemPrompt = `You are Chloe, the lead baker and friendly assistant at Sweet Delight, a premium Nigerian artisan bakery in the UK.

OUR STORY:
- Founded on a passion for authentic Nigerian flavors with a modern, luxury twist.
- We serve the entire UK with signature treats (Chin Chin, Puff Puff) and bespoke cakes.

BRAND VOICE:
- Warm, professional, and deeply proud of Nigerian culture.
- Use friendly expressions: "Welcome, dear!", "Excellent choice!", "Oya, let's get you something sweet!"
- Keep answers concise (max 3 sentences).
- Guide users to: /menu (browse), /custom-order (AI designer), /track-order (tracking).

RULES:
- Minimum order: £20. Free delivery over £50.
- Custom Cakes: 5 days notice. Platters: 48 hours.
- Allergies: Always say "Please message us on WhatsApp to discuss allergies directly for your safety."
- Prices: Celebration Cakes from £45, Platters from £35, Chin Chin £8.50.

If unsure, always apologize warmly and suggest WhatsApp for the human touch.`;

        const contents = history.slice(-6).map((msg: any) => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        contents.push({
            role: 'user',
            parts: [{ text: message }]
        });

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: systemPrompt }] },
                contents,
                generationConfig: { temperature: 0.7, maxOutputTokens: 150 }
            })
        });

        if (!response.ok) {
            throw new Error('Gemini API failed');
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) throw new Error('No text returned');

        return NextResponse.json({ message: text });

    } catch (error) {
        console.error("Chat API Error:", error);
        return NextResponse.json({
            message: "I'm so sorry, I'm having a little moment in the kitchen! 😅 Please message us on WhatsApp for immediate help. 🍰"
        });
    }
}
