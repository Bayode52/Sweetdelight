export async function GET() {
    const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY
    return Response.json({
        hasKey: !!key,
        keyLength: key?.length || 0,
        keyPrefix: key ? key.slice(0, 8) + '...' : 'NOT SET'
    })
}
