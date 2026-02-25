const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const keyMatch = env.match(/GOOGLE_GENERATIVE_AI_API_KEY=(AIzaSy[A-Za-z0-9_-]+)/);
const apiKey = keyMatch ? keyMatch[1] : null;

if (!apiKey) {
    console.error('Key not found in .env.local');
    process.exit(1);
}

const run = async () => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const body = {
        contents: [{ parts: [{ text: "Hi" }] }]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        console.log('--- RAW FETCH RESULT ---');
        console.log(JSON.stringify(data, null, 2));
        console.log('--- END ---');
    } catch (e) {
        console.error('Fetch error:', e.message);
    }
};

run();
