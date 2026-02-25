const testApi = async () => {
    const uniqueToken = 'test-token-' + Date.now();
    try {
        const response = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            body: JSON.stringify({
                message: 'Hi Crave! What is the minimum order for delivery?',
                sessionToken: uniqueToken
            }),
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        console.log('--- FRESH API RESPONSE START ---');
        console.log(JSON.stringify(data, null, 2));
        console.log('--- FRESH API RESPONSE END ---');
    } catch (error) {
        console.error('Test failed:', error);
    }
};

testApi();
