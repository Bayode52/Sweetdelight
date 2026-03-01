import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

// Helper to determine base price rough estimates
const getBasePrice = (type: string) => {
    switch (type) {
        case "Celebration Cake": return "£60";
        case "Small Chops Platter": return "£45";
        case "Puff Puff": return "£15";
        default: return "£30";
    }
};

export async function POST(req: Request) {
    try {
        const { productType, answers } = await req.json();

        if (!productType || !answers) {
            return NextResponse.json({ error: "Missing product type or answers" }, { status: 400 });
        }

        if (!apiKey) {
            // Fallback for when the API key is missing (so the user can still test the flow)
            console.warn("GOOGLE_GENERATIVE_AI_API_KEY is missing. Using mock response.");
            return NextResponse.json({
                visualDescription: `A stunning and bespoke ${productType}, handcrafted exactly to your preferences. Our expert bakers will bring this vision to life using the finest ingredients.`,
                specifications: Object.entries(answers)
                    .filter(([k]) => !k.endsWith('_custom'))
                    .map(([k, v]) => ({ label: k, value: typeof v === 'object' && v !== null ? (Array.isArray(v) ? v.join(", ") : Object.values(v).join(' - ')) : String(v || '') })),
                priceEstimate: `${getBasePrice(productType)} - Estimated`,
                imageQuery: productType.split(" ")[0].toLowerCase() + ", food"
            });
        }

        const prompt = `
        You are an expert, highly creative master baker at "Sweet Delight" in the UK. 
        A customer wants to place a custom order for a "${productType}".
        
        Here are their specific requirements:
        ${JSON.stringify(answers, null, 2)}

        Based on these requirements, generate a compelling, appetizing preview of what their order will look and feel like.
        
        You MUST respond strictly in valid JSON format with the following keys exactly:
        - "visualDescription": A 2-3 sentence, beautifully written, warm and mouth-watering description of the final product. Make them excited to eat it.
        - "specifications": An array of objects, each with a "label" (string) and "value" (string), summarizing the key technical specs of their order (e.g., Serves, Flavour, Tiers, Theme).
        - "priceEstimate": A string representing a rough price estimate in GBP (£). Be realistic but give a range if needed (e.g., "£65 - £80"). Basecakes start around £60, platters around £45.
        - "imageQuery": A highly optimized, max 3-word search query to fetch a beautiful reference image from Unsplash (e.g. "chocolate tier cake", "nigerian puff puff").

        CRITICAL: Output ONLY the JSON object. Do not include markdown formatting like \`\`\`json. Just the raw JSON.
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
                priceEstimate: `${getBasePrice(productType)} - Estimated`,
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
