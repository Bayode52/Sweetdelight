import DOMPurify from 'isomorphic-dompurify'

export function sanitiseText(input: unknown, maxLength = 2000): string {
    if (typeof input !== 'string') return ''
    return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] })
        .trim()
        .slice(0, maxLength)
}

export function sanitiseEmail(input: unknown): string {
    if (typeof input !== 'string') return ''
    return input
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9@._+-]/g, '')
        .slice(0, 254)
}

export const sanitiseChatMessage = (input: string): string => {
    const text = input.trim().slice(0, 500)

    // Block prompt injection attempts
    const injectionPatterns = [
        /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/i,
        /you\s+are\s+now\s+/i,
        /pretend\s+(you\s+are|to\s+be)/i,
        /forget\s+(everything|your\s+instructions)/i,
        /reveal\s+(your|the)\s+(system\s+)?prompt/i,
        /what\s+are\s+your\s+instructions/i,
        /tell\s+me\s+(your|the)\s+(api|secret|key|password)/i,
        /bypass\s+(your\s+)?(safety|filter|restriction)/i,
        /disregard\s+(all\s+)?previous/i,
    ]

    for (const pattern of injectionPatterns) {
        if (pattern.test(text)) {
            return "I'm Chloe from Sweet Delites 🍰 I can help with orders, pricing and delivery. What would you like to know?"
        }
    }

    return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] })
}
