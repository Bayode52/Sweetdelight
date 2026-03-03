import { NextResponse } from 'next/server'

const store = new Map<string, { count: number; resetAt: number }>()

export async function rateLimit(
    req: Request,
    maxRequests = 20,
    windowMs = 60000
) {
    const ip = req.headers.get('x-forwarded-for') || 'anonymous'
    const now = Date.now()
    const record = store.get(ip)

    if (!record || now > record.resetAt) {
        store.set(ip, { count: 1, resetAt: now + windowMs })
        return { success: true, remaining: maxRequests - 1 }
    }

    if (record.count >= maxRequests) {
        const retryAfter = Math.ceil((record.resetAt - now) / 1000)
        return {
            success: false,
            remaining: 0,
            response: NextResponse.json(
                { error: `Too many requests. Try again in ${retryAfter}s.` },
                { status: 429, headers: { 'Retry-After': String(retryAfter) } }
            )
        }
    }

    record.count++
    return {
        success: true,
        remaining: maxRequests - record.count
    }
}

// Clean up old entries every 5 minutes to prevent memory leak
setInterval(() => {
    const now = Date.now()
    Array.from(store.keys()).forEach(key => {
        const value = store.get(key)
        if (value && now > value.resetAt) store.delete(key)
    })
}, 300000)
