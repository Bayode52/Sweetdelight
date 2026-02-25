const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const keyMatch = env.match(/GOOGLE_GENERATIVE_AI_API_KEY=(AIzaSy[A-Za-z0-9_-]+)/);
const apiKey = keyMatch ? keyMatch[1] : null;

if (!apiKey) {
    console.error('Key not found in .env.local');
    process.exit(1);
}

const run = async () => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        fs.writeFileSync('available_models.json', JSON.stringify(data, null, 2));
        console.log('Saved models to available_models.json');
    } catch (e) {
        console.error('Fetch error:', e.message);
    }
};

run();
