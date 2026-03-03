export const runtime = 'edge'

// Smart fallback replies when AI unavailable
const smart = (m: string): string => {
    const t = m.toLowerCase()
    if (/hi|hello|hey|morning|afternoon/.test(t))
        return "Hello! Welcome to Sweet Delight 🍰 I'm Chloe, your bakery assistant. What can I help you with today?"
    if (/price|cost|how much|charge/.test(t))
        return "Our prices: Celebration cakes from £45 🎂, Small chops from £35, Puff puff £6/dozen, Chin chin £8.50, Party boxes from £85. Free delivery over £50!"
    if (/order|buy|want|purchase/.test(t))
        return "Great! Browse our Menu page to order, or WhatsApp us for custom and bulk orders. What would you like? 🍰"
    if (/deliver|shipping|uk|location/.test(t))
        return "We deliver across the whole UK! 🚚 Free delivery on orders over £50. Minimum order £20."
    if (/custom|wedding|birthday|cake/.test(t))
        return "We love custom cakes! 🎂 We need 5 days notice. Try our Custom Order builder, then confirm via WhatsApp!"
    if (/puff/.test(t))
        return "Our puff puff is legendary! 😍 Soft, golden, perfectly spiced. A dozen for just £6!"
    if (/chin/.test(t))
        return "Classic Nigerian chin chin — crunchy and irresistible! 500g for £8.50. 😋"
    if (/small chop|platter/.test(t))
        return "Small chops platters from £35 for 30 pieces — puff puff, spring rolls, samosa & more! 🎉"
    if (/hour|open|time/.test(t))
        return "We're open Mon–Fri 9am–7pm, Saturday 9am–5pm. Need help outside hours? WhatsApp us! 🕐"
    if (/allerg|gluten|nut|vegan|halal/.test(t))
        return "For allergen info please WhatsApp us directly — your safety is our priority! 🙏"
    if (/thank/.test(t))
        return "You're welcome! 🥰 Anything else I can help with?"
    return "Thanks for your message! 🍰 For fastest help, WhatsApp us Mon–Fri 9am–7pm or Saturday 9am–5pm."
}

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({ message: '' }))
        const message = String(body?.message || '').trim()
        const history = Array.isArray(body?.history) ? body.history : []

        if (!message) {
            return Response.json({ message: "Hello! I'm Chloe from Sweet Delight 🍰 How can I help you today?" })
        }

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
        if (!apiKey) {
            return Response.json({ message: smart(message) })
        }

        const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    system_instruction: {
                        parts: [{ text: `You are Chloe, Sweet Delight bakery assistant (UK Nigerian pastry shop). Be warm, friendly, max 2-3 short sentences. Products: cakes from £45, small chops £35+, puff puff £6/dozen, chin chin £8.50, party boxes £85+. Free delivery over £50. Min £20. Custom cakes 5 days notice. Mon-Fri 9am-7pm, Sat 9am-5pm. WhatsApp for orders. Never make up info.` }]
                    },
                    contents: [
                        ...history.slice(-6).map((h: { role: string; content: string }) => ({
                            role: h.role === 'assistant' ? 'model' : 'user',
                            parts: [{ text: String(h.content) }]
                        })),
                        { role: 'user', parts: [{ text: message }] }
                    ],
                    generationConfig: { temperature: 0.7, maxOutputTokens: 150 }
                })
            }
        )

        if (!geminiRes.ok) {
            return Response.json({ message: smart(message) })
        }

        const data = await geminiRes.json()
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
        return Response.json({ message: text || smart(message) })

    } catch (err) {
        console.error('Chat error:', err)
        return Response.json({
            message: "Quick hiccup! 😊 Please WhatsApp us for immediate help. 🍰"
        })
    }
}
