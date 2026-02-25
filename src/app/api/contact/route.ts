export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { fullName, email, phone, subject, message } = body;

        if (!fullName || !email || !subject || !message) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { error } = await supabase
            .from('contact_messages')
            .insert({ full_name: fullName, email, phone, subject, message });

        if (error) throw error;

        // Optional: send email notification via Resend (add when RESEND_API_KEY is set)
        // const { resend } = await import('@/lib/resend');
        // await resend.emails.send({ ... });

        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        console.error('Contact API error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
