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
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function run() {
    try {
        const result = await model.generateContent("Say 'Gemini is active!'");
        const response = await result.response;
        const text = response.text();
        console.log('RESULT:', text);
    } catch (e) {
        console.error('DIRECT_API_ERROR:', e.message);
    }
}

run();
