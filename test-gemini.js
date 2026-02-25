const testApi = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            body: JSON.stringify({
                message: 'Hello! What is the minimum order for delivery?',
                sessionToken: 'test-session-final-check'
            }),
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        console.log('--- API RESPONSE START ---');
        console.log(JSON.stringify(data, null, 2));
        console.log('--- API RESPONSE END ---');
    } catch (error) {
        console.error('Test failed:', error);
    }
};

testApi();
