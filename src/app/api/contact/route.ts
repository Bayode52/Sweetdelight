import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { rateLimit } from '@/lib/rateLimit';
import { sanitiseText, sanitiseEmail } from '@/lib/sanitise';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    const limit = await rateLimit(req, 3, 60); // Strict limit for contact form
    if (!limit.success) return limit.response;

    try {
        const body = await req.json();
        const { fullName, email, phone, subject, message } = body;

        if (!fullName || !email || !subject || !message) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Sanitize inputs
        const cleanName = sanitiseText(fullName);
        const cleanEmail = sanitiseEmail(email);
        const cleanPhone = sanitiseText(phone || '');
        const cleanSubject = sanitiseText(subject);
        const cleanMessage = sanitiseText(message);

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { error } = await supabase
            .from('contact_messages')
            .insert({
                full_name: cleanName,
                email: cleanEmail,
                phone: cleanPhone,
                subject: cleanSubject,
                message: cleanMessage
            });

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        console.error('Contact API error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
