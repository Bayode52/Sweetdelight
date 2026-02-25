import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET all chat sessions for admin dashboard
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status'); // optional filter

        let query = supabaseAdmin
            .from('chat_sessions')
            .select(`*`)
            .order('updated_at', { ascending: false });

        if (status) {
            query = query.eq('status', status);
        }

        const { data: sessions, error } = await query;

        if (error) throw error;
        return NextResponse.json({ sessions });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST admin human response
export async function POST(req: Request) {
    try {
        const { sessionId, content, action } = await req.json();

        if (action === 'update_status') {
            const { status } = await req.json();
            await supabaseAdmin.from('chat_sessions').update({ status }).eq('id', sessionId);
            return NextResponse.json({ success: true });
        }

        if (!sessionId || !content) {
            return NextResponse.json({ error: "Missing sessionId or content" }, { status: 400 });
        }

        // Save admin message
        const { data: insertedMessage, error } = await supabaseAdmin
            .from('chat_messages')
            .insert([{
                session_id: sessionId,
                role: 'human_agent',
                content: content
            }])
            .select()
            .single();

        if (error) throw error;

        // Auto-update status to human if admin replied
        await supabaseAdmin
            .from('chat_sessions')
            .update({ status: 'human', updated_at: new Date().toISOString() })
            .eq('id', sessionId);

        return NextResponse.json({ success: true, message: insertedMessage });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
