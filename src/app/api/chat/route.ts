import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const { message, history = [] } = await request.json()

        if (!message?.trim()) {
            return NextResponse.json(
                { error: 'Message required' },
                { status: 400 }
            )
        }

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY

        // If no API key, return helpful fallback
        if (!apiKey) {
            return NextResponse.json({
                message: "Hi! I'm the Sweet Delight assistant 🍰 I'm not fully set up yet. Please WhatsApp us for immediate help with your order!"
            })
        }

        const systemPrompt = `You are Chloe, the lead baker and friendly assistant at Sweet Delight, a premium Nigerian artisan bakery in the UK.

OUR STORY:
- Founded on a passion for authentic Nigerian flavors with a modern, luxury twist.
- We serve the entire UK with our signature treats and bespoke celebration cakes.

PRODUCTS & PRICING:
- Celebration Cakes: Starting from £45. Fully customizable.
- Small Chops Platters: Starting from £35. Includes puff puff, samosas, spring rolls, and gizzard.
- Chin Chin: Our legendary crunchy snack. Standard bag £8.50.
- Puff Puff: Box of 12 for £6. Warm and fluffy.
- Party Boxes: All-in-one catering from £85.

ORDERING RULES:
- Minimum order: £20.
- Free delivery: On orders over £50.
- Custom Cakes: Minimum 5 days notice required.
- Party Platters: Minimum 48 hours notice required.

YOUR PERSONALITY:
- Warm, professional, and deeply passionate about Nigerian culture and baking.
- Use friendly Nigerian expressions like "Welcome, dear!" or "Ehh, excellent choice!"
- Keep responses concise (2-3 sentences max).
- Always guide the user toward their next step (e.g., "Would you like to see our cake gallery or start a custom order?").
- For dietary/allergy questions, always say: "To ensure your safety, please message us on WhatsApp so we can discuss your specific needs directly."

GOAL: Provide a luxury concierge experience. If someone wants a custom design, point them to our AI Custom Order page (/custom-order).`

        // Call Gemini API directly via REST (no SDK needed)
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`

        // Build conversation for Gemini
        const contents = []

        // Add history
        for (const msg of history.slice(-6)) { // last 6 messages only
            contents.push({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            })
        }

        // Add current message
        contents.push({
            role: 'user',
            parts: [{ text: message }]
        })

        const geminiResponse = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: {
                    parts: [{ text: systemPrompt }]
                },
                contents,
                generationConfig: {
                    temperature: 0.8,
                    maxOutputTokens: 200,
                }
            })
        })

        if (!geminiResponse.ok) {
            const errText = await geminiResponse.text()
            console.error('Gemini API error:', geminiResponse.status, errText)

            // Return helpful fallback on API error
            return NextResponse.json({
                message: "So sorry, I'm having a little moment! 😅 Please WhatsApp us directly and we'll sort you out straight away. 🍰"
            })
        }

        const geminiData = await geminiResponse.json()
        const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text

        if (!text) {
            return NextResponse.json({
                message: "Hmm, I didn't catch that! Could you try again? Or WhatsApp us for instant help. 🍰"
            })
        }

        return NextResponse.json({ message: text })

    } catch (error) {
        console.error('Chat route error:', error)
        return NextResponse.json({
            message: "Oops, something went wrong on my end! Please WhatsApp us and we'll help you immediately. 🍰"
        })
    }
}
