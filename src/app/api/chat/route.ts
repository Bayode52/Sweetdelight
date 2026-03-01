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

        const systemPrompt = `You are Chloe, the friendly Sweet Delight bakery assistant in the UK.

ABOUT SWEET DELIGHT:
- Premium Nigerian pastry bakery serving the whole UK
- Products: celebration cakes (from £45), small chops platters (from £35), 
  chin chin bags (£8.50), puff puff (£6/dozen), party boxes (from £85)
- Free delivery on orders over £50, minimum order £20
- Custom cakes: 5 days notice needed
- Party platters: 48 hours notice needed  
- Hours: Mon-Fri 9am-7pm, Sat 9am-5pm, Sun custom orders only
- Order via WhatsApp or the website

YOUR PERSONALITY:
- Warm, friendly, like talking to the baker herself
- Use occasional Nigerian warmth (e.g. "Ehh, great choice!")
- Short answers — max 2-3 sentences
- Always end with a helpful next step
- If asked about allergies or specific dietary needs, 
  always direct to WhatsApp for safety

DO NOT make up prices or products not listed above.`

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
