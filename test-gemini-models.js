const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const keyMatch = env.match(/GOOGLE_GENERATIVE_AI_API_KEY=(AIzaSy[A-Za-z0-9_-]+)/);
const apiKey = keyMatch ? keyMatch[1] : null;

if (!apiKey) {
    console.error('Key not found in .env.local');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function run() {
    try {
        console.log('Fetching models...');
        // Note: listModels is usually available on the genAI object in newer SDKs
        // If not, we'll try a different approach.
        const result = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }).generateContent("Test");
        console.log('Success with gemini-1.5-flash');
    } catch (e) {
        console.error('Error with gemini-1.5-flash:', e.message);
        try {
            const result = await genAI.getGenerativeModel({ model: "gemini-pro" }).generateContent("Test");
            console.log('Success with gemini-pro');
        } catch (e2) {
            console.error('Error with gemini-pro:', e2.message);
        }
    }
}

run();
