import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

// Helper to determine base price rough estimates with more granularity
const getBasePrice = (type: string, answers: any) => {
    let base = 25;
    if (type === "Celebration Cake") {
        base = 45;
        const serves = answers.serves || "";
        if (serves.includes("25-30")) base += 20;
        if (serves.includes("40-50")) base += 40;
        if (serves.includes("50+")) base += 60;

        const tiers = answers.tiers || "";
        if (tiers.includes("2 tiers")) base += 25;
        if (tiers.includes("3 tiers")) base += 50;
    } else if (type === "Small Chops Platter") {
        base = 35;
        const serves = answers.serves || "";
        if (serves.includes("20-30")) base += 20;
        if (serves.includes("40-50")) base += 45;
        if (serves.includes("50-100")) base += 85;
    } else if (type === "Puff Puff") {
        base = 6;
        const pieces = answers.pieces || "";
        if (pieces === "24") base = 12;
        if (pieces === "36") base = 18;
        if (pieces === "48") base = 24;
        if (pieces === "72") base = 35;
    }
    return `£${base}`;
};

export async function POST(req: Request) {
    try {
        const { productType, answers } = await req.json();

        if (!productType || !answers) {
            return NextResponse.json({ error: "Missing product type or answers" }, { status: 400 });
        }

        if (!apiKey) {
            // Fallback for when the API key is missing
            console.warn("GOOGLE_GENERATIVE_AI_API_KEY is missing. Using local logic.");
            return NextResponse.json({
                visualDescription: `A stunning and bespoke ${productType}, handcrafted exactly to your preferences. Our expert bakers will bring this vision to life using the finest ingredients and traditional Nigerian techniques.`,
                specifications: Object.entries(answers)
                    .filter(([k]) => !k.endsWith('_custom'))
                    .map(([k, v]) => ({ label: k.replace(/_/g, ' '), value: String(v || '') })),
                priceEstimate: `${getBasePrice(productType, answers)} - Estimated`,
                imageQuery: productType.toLowerCase() + " professional food photography"
            });
        }

        const prompt = `
        You are a Master Artisan Baker at "Sweet Delight". 
        A customer wants a custom order for a "${productType}".
        Requirements: ${JSON.stringify(answers)}

        Create an exquisite, luxury preview of their request.
        
        Respond ONLY in JSON:
        {
          "visualDescription": "A 3-sentence mouth-watering, luxury description of the final product.",
          "specifications": [{"label": "string", "value": "string"}],
          "priceEstimate": "A realistic GBP price range (e.g. £75 - £90). Note: Cakes start at £45, Platters £35. Add premium for size/tiers/gold leaf.",
          "imageQuery": "A 4-5 word highly descriptive prompt for a food image (e.g. 'luxury 3 tier gold white wedding cake') - DO NOT include 'cake' if it's not a cake."
        }
        `;

        let responseText = "";
        try {
            const model = genAI.getGenerativeModel({
                model: 'gemini-2.0-flash',
                systemInstruction: "You are an expert AI baker assistant. You output strictly valid, parseable JSON and nothing else.",
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1000,
                    responseMimeType: "application/json",
                }
            });
            const result = await model.generateContent(prompt);
            responseText = result.response.text();
        } catch (apiError) {
            console.error("Gemini API failed, using fallback:", apiError);
            return NextResponse.json({
                visualDescription: `A stunning and bespoke ${productType}, handcrafted exactly to your preferences. Our expert bakers will bring this vision to life using the finest ingredients.`,
                specifications: Object.entries(answers)
                    .filter(([k]) => !k.endsWith('_custom'))
                    .map(([k, v]) => {
                        const customVal = answers[`${k}_custom`];
                        const displayVal = typeof v === 'object' && v !== null
                            ? (Array.isArray(v) ? v.map(item => item.startsWith?.('Custom') && customVal ? `Custom: ${customVal}` : item).join(', ') : Object.values(v).join(' - '))
                            : (typeof v === 'string' && v.startsWith('Custom') && customVal ? `Custom: ${customVal}` : String(v || ''));
                        return { label: k, value: displayVal };
                    }),
                priceEstimate: `${getBasePrice(productType, answers)} - Estimated`,
                imageQuery: productType.split(" ")[0].toLowerCase() + ", food"
            });
        }

        // Parse the JSON response
        try {
            const cleanText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            const parsedData = JSON.parse(cleanText);

            if (Array.isArray(parsedData.specifications)) {
                parsedData.specifications = parsedData.specifications.map((spec: any) => ({
                    label: spec.label,
                    value: typeof spec.value === 'object' && spec.value !== null
                        ? (Array.isArray(spec.value) ? spec.value.join(', ') : Object.values(spec.value).join(' - '))
                        : String(spec.value || '')
                }));
            }
            return NextResponse.json(parsedData);
        } catch (parseError) {
            console.error("Failed to parse Gemini response as JSON:", responseText);
            // Fallback if parsing fails
            return NextResponse.json({
                visualDescription: "A stunning and bespoke creation, handcrafted exactly to your preferences.",
                specifications: Object.entries(answers)
                    .filter(([k]) => !k.endsWith('_custom'))
                    .map(([k, v]) => ({
                        label: k,
                        value: typeof v === 'object' && v !== null ? (Array.isArray(v) ? v.join(", ") : Object.values(v).join(" - ")) : String(v || '')
                    })),
                priceEstimate: "Price calculated at checkout",
                imageQuery: "bakery"
            });
        }

    } catch (error: any) {
        console.error("Error in custom order preview API:", error);
        return NextResponse.json({ error: error.message || "Failed to generate preview" }, { status: 500 });
    }
}
