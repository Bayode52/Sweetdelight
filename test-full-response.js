const testApi = async () => {
    const uniqueToken = 'final-verify-' + Date.now();
    try {
        const response = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            body: JSON.stringify({
                message: 'Hello!',
                sessionToken: uniqueToken
            }),
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        console.log('--- FULL RESPONSE CONTENT ---');
        console.log(data.message.content);
        console.log('--- END ---');
    } catch (error) {
        console.error('Test failed:', error);
    }
};

testApi();
