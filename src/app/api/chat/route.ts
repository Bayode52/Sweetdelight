export const runtime = 'edge'

// ── Intelligent conversation engine ──────────────
// This handles conversations naturally even without AI
const PRODUCTS = [
    { name: 'Gold Tier Celebration Cake', price: '£65', desc: 'A stunning 3-tier custom cake with premium decoration, perfect for birthdays, weddings and special occasions. Made fresh to order with your choice of flavours.' },
    { name: 'Small Chops Platter (30pcs)', price: '£35', desc: 'A beautiful mixed platter of Nigerian small chops — puff puff, spring rolls, samosa, and fish rolls. Perfect for parties and gatherings.' },
    { name: 'Classic Chin Chin 500g', price: '£8.50', desc: 'Traditional crunchy Nigerian chin chin, freshly made. Available in sweet, coconut, and spiced flavours. Great for snacking or gifting.' },
    { name: 'Premium Party Box', price: '£85', desc: 'Our most popular party package — a luxury assortment of pastries and small chops beautifully presented, serving 20+ guests.' },
    { name: 'Puff Puff Dozen', price: '£6', desc: 'Soft, golden, perfectly spiced Nigerian puff puff, made fresh daily. Our customers call them addictive! Order a dozen or more.' },
    { name: 'Meat Pie (per piece)', price: '£3.50', desc: 'Classic Nigerian meat pie with flaky golden pastry and a hearty minced meat filling. Baked fresh, best enjoyed warm.' },
]

function buildSmartReply(message: string): string {
    const m = message.toLowerCase().trim()

    // Greetings
    if (/^(hi|hello|hey|good morning|good afternoon|good evening|howdy|hiya)/.test(m))
        return `Hello! 👋 Welcome to Sweet Delight! I'm Chloe, your bakery assistant. We make premium Nigerian pastries — from celebration cakes to party platters, all freshly baked and delivered across the UK. What can I help you with today? 🍰`

    // Products / menu inquiry
    if (/product|menu|what do you (sell|have|make|offer)|tell me more|what can i order|what.*available/.test(m))
        return `We have some gorgeous things on our menu! 🍰\n\n🎂 **Celebration Cakes** from £45 — custom 1, 2, 3 or 4-tier cakes\n🍢 **Small Chops Platters** from £35 — puff puff, spring rolls, samosa\n🫘 **Chin Chin** £8.50/500g — sweet, crunchy, traditional\n🎁 **Party Boxes** from £85 — full spread for 20+ guests\n🟡 **Puff Puff** £6/dozen — soft and golden\n🥧 **Meat Pies** £3.50 each\n\nWhich of these interests you most? I can tell you more! 😊`

    // Cakes specifically
    if (/cake|tier|wedding cake|birthday cake|celebration/.test(m))
        return `Our cakes are absolutely stunning! 🎂 We make custom 1, 2, 3 and 4-tier celebration cakes from £45. Every cake is handmade to your exact specifications — your choice of flavour, colour, filling and decoration. We need at least 5 days notice for custom cakes. Want to use our AI Cake Builder to visualise yours? Or shall I tell you about flavours? 😊`

    // Puff puff
    if (/puff/.test(m))
        return `Ah, the puff puff! 😍 Our customers say it's life-changing! Soft, golden, perfectly spiced Nigerian dough balls made fresh daily. A dozen is just £6 — honestly incredible value. We can do larger quantities for parties too. Want to add some to an order? 🟡`

    // Small chops
    if (/small chop|platter|samosa|spring roll|fish roll/.test(m))
        return `Our small chops platters are the star of every party! 🎉 We do mixed platters from £35 (30 pieces) up to full event catering. Each platter has puff puff, spring rolls, samosa, and fish rolls beautifully arranged. How many guests are you catering for? I can suggest the right size! 🍢`

    // Chin chin
    if (/chin chin|chin-chin/.test(m))
        return `Classic Nigerian chin chin — crunchy, sweet and totally addictive! 😋 We do 500g bags for £8.50 in sweet, coconut, and spiced versions. They make amazing gifts too! Would you like to order some, or mix flavours?`

    // Party / event
    if (/party|event|wedding|engagement|naming|birthday|celebration|reception/.test(m))
        return `How exciting! 🎉 We love catering events! Depending on your guest count, we can put together:\n\n🎂 A custom celebration cake\n🍢 Small chops platters\n🎁 Full party boxes\n\nFor events, we recommend contacting us via WhatsApp so we can plan the perfect package and confirm pricing. How many guests are you expecting? 😊`

    // Price / cost
    if (/price|cost|how much|expensive|cheap|afford|budget/.test(m))
        return `Great question! Here's a quick price guide 💰\n\n🎂 Cakes: from £45 (1-tier) to £150+ (4-tier custom)\n🍢 Small chops: from £35 (30pcs)\n🟡 Puff puff: £6/dozen\n🫘 Chin chin: £8.50/500g\n🎁 Party boxes: from £85\n🥧 Meat pies: £3.50 each\n\n**Free delivery on orders over £50!** What would you like to order? 😊`

    // Delivery
    if (/deliver|shipping|post|send|uk|london|nationwide|where/.test(m))
        return `We deliver across the whole of the UK! 🚚 Here's how it works:\n\n✅ Free delivery on orders over £50\n📦 Minimum order is £20\n⏱️ Standard delivery 1-3 days\n🏙️ Same-day sometimes possible in London — WhatsApp us!\n\nWhere are you based? I can check if same-day is available for you. 😊`

    // Custom order
    if (/custom|bespoke|design|personalise|special|unique/.test(m))
        return `We absolutely love custom orders! ✨ You can use our **AI Custom Order Builder** on the website to visualise exactly what you want — choose your cake type, tiers, flavours, colours and decorations, and see an AI preview instantly!\n\nFor custom cakes we need **5 days notice**, platters need **48 hours**. Once you've designed it, confirm your order via WhatsApp and we'll take it from there! 🎂`

    // Hours / availability
    if (/open|hour|time|when|available|close|weekend|sunday/.test(m))
        return `Our hours are:\n\n📅 Monday – Friday: 9am – 7pm\n📅 Saturday: 9am – 5pm\n📅 Sunday: Custom order consultations only\n\nFor urgent orders or questions outside hours, WhatsApp us and we'll do our best! 🕐`

    // WhatsApp / contact
    if (/whatsapp|contact|call|phone|reach|get in touch|speak/.test(m))
        return `The quickest way to reach us is WhatsApp! 💬 Just click the green WhatsApp button on the website and we'll respond as soon as possible (usually within minutes during business hours). You can also browse our full menu and order directly on the site! 😊`

    // Allergens / dietary
    if (/allerg|gluten|dairy|nut|vegan|halal|kosher|lactose|egg|wheat/.test(m))
        return `Your safety is our absolute priority! 🙏 For detailed allergen and dietary information, please **WhatsApp us directly** before ordering — we can give you accurate, up-to-date details about specific products and cross-contamination risks. We'd rather be safe than sorry! 💛`

    // Flavours
    if (/flavour|flavor|taste|ingredient|filling/.test(m))
        return `Oh, the flavours! 😋 For cakes we offer vanilla, chocolate, red velvet, lemon, carrot, and marble (and more by request!). For fillings: buttercream, whipped cream, cream cheese frosting, or ganache. Chin chin comes in sweet, coconut, and spiced. What are you thinking of ordering? I'll make sure you get exactly what you want! 🎂`

    // Order placement
    if (/order|buy|purchase|want|get|book|reserve/.test(m))
        return `Wonderful! Ready to order? 🎉 You can:\n\n🛒 **Add directly to cart** on our Menu page\n💬 **WhatsApp us** for custom or bulk orders\n🎨 **Use the AI Builder** for custom cakes\n\nFor orders over £50, delivery is FREE! What would you like? 😊`

    // Complaints / issues
    if (/complaint|wrong|issue|problem|disappointed|bad|awful|unhappy/.test(m))
        return `Oh no, I'm so sorry to hear that! 😢 Your satisfaction means everything to us. Please WhatsApp us directly with the details and we'll make it right as quickly as possible. We take every concern seriously and want you to be happy! 💛`

    // Thanks
    if (/thank|thanks|cheers|appreciate|brilliant|perfect|great|wonderful|amazing|love/.test(m))
        return `You're so welcome! 🥰 It's our pleasure! Is there anything else I can help you with today? We'd love to see you order something delicious! 🍰`

    // Goodbye
    if (/bye|goodbye|see you|ttyl|take care|later/.test(m))
        return `Goodbye! 👋 It was lovely chatting with you! Don't forget to browse our menu — something sweet is always waiting! Come back anytime. 🍰✨`

    // Default — much more helpful than before
    return `Thanks for reaching out! 😊 I'm Chloe from Sweet Delight. I can help you with:\n\n🎂 Cake orders and custom designs\n🍢 Party platters and small chops\n🚚 Delivery information\n💰 Pricing\n⏰ Business hours\n\nWhat would you like to know? Or WhatsApp us directly for the quickest response! 🍰`
}

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}))
        const message = String(body?.message || '').trim()
        const history = Array.isArray(body?.history) ? body.history : []

        if (!message) {
            return Response.json({
                message: "Hello! Welcome to Sweet Delight 🍰 I'm Chloe. What can I help you with today?"
            })
        }

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY

        // Try Gemini first for natural conversation
        if (apiKey) {
            try {
                const geminiRes = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            system_instruction: {
                                parts: [{
                                    text: `You are Chloe, the Sweet Delight bakery assistant in the UK.
You are warm, enthusiastic, and knowledgeable about Nigerian pastries.
Always be conversational and helpful. Use emojis naturally but not excessively.
Keep replies to 3-4 sentences maximum unless listing products.

PRODUCTS & PRICES:
- Celebration Cakes: from £45 (1-tier) to £150+ (4-tier custom), made to order
- Small Chops Platters: from £35 (30pcs) — puff puff, spring rolls, samosa, fish rolls
- Classic Chin Chin: £8.50/500g — sweet, coconut, or spiced
- Premium Party Box: from £85 — serves 20+ guests
- Puff Puff: £6/dozen — soft golden Nigerian dough balls
- Meat Pies: £3.50 each

ORDERING INFO:
- Free delivery on orders over £50
- Minimum order £20
- UK-wide delivery
- Custom cakes need 5 days notice
- Party platters need 48 hours notice
- Hours: Mon-Fri 9am-7pm, Sat 9am-5pm

RULES:
- Never invent prices or products not listed above
- For allergens always direct to WhatsApp for safety
- For custom orders mention the AI Custom Order Builder on the website
- Be encouraging and warm — make customers feel excited to order!`
                                }]
                            },
                            contents: [
                                ...history.slice(-8).map((h: { role: string; content: string }) => ({
                                    role: h.role === 'assistant' ? 'model' : 'user',
                                    parts: [{ text: String(h.content).slice(0, 500) }]
                                })),
                                { role: 'user', parts: [{ text: message }] }
                            ],
                            generationConfig: {
                                temperature: 0.8,
                                maxOutputTokens: 200,
                                topP: 0.95
                            }
                        })
                    }
                )

                if (geminiRes.ok) {
                    const data = await geminiRes.json()
                    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
                    if (text && text.length > 10) {
                        return Response.json({ message: text })
                    }
                }
            } catch (geminiErr) {
                console.error('Gemini error, using smart fallback:', geminiErr)
            }
        }

        // Smart fallback — always gives a relevant, helpful response
        return Response.json({ message: buildSmartReply(message) })

    } catch (err) {
        console.error('Chat route error:', err)
        return Response.json({
            message: "Quick hiccup on my end! 😊 I'm Chloe from Sweet Delight. Can you try again? Or WhatsApp us directly for immediate help! 🍰"
        })
    }
}
