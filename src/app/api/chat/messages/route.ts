import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const sessionToken = searchParams.get('sessionToken');

        if (!sessionToken) {
            return NextResponse.json({ error: "Missing session token" }, { status: 400 });
        }

        // 1. Get the session
        let { data: session, error: sessionError } = await supabaseAdmin
            .from('chat_sessions')
            .select('*')
            .eq('session_token', sessionToken)
            .single();

        // FALLBACK: If table doesn't exist or API key is invalid, use Demo Mode
        const isInfrastructureMissing = sessionError && (sessionError.code === 'PGRST205' || sessionError.message?.includes('Invalid API key'));

        if (isInfrastructureMissing) {
            console.warn("⚠️ Chat API in Demo Mode (Database or Keys missing)");
            return NextResponse.json({
                messages: [
                    { role: 'bot', content: "👋 Welcome to Sweet Delight! (Demo Mode: Database not connected)", created_at: new Number(Date.now()).toLocaleString() }
                ],
                status: 'bot',
                demo: true
            });
        }

        if (sessionError && sessionError.code !== 'PGRST116') {
            console.error("Error fetching session:", sessionError);
            return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 });
        }

        if (!session) {
            // No session yet means no messages
            return NextResponse.json({ messages: [], status: 'bot' });
        }

        // 2. Fetch the messages
        const { data: messages, error: messagesError } = await supabaseAdmin
            .from('chat_messages')
            .select('*')
            .eq('session_id', session.id)
            .order('created_at', { ascending: true });

        if (messagesError) {
            console.error("Error fetching messages:", messagesError);
            return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
        }

        return NextResponse.json({ messages, status: session.status });

    } catch (error: any) {
        console.error("Chat messages API error:", error);
        return NextResponse.json({ error: error.message || "Failed to load messages" }, { status: 500 });
    }
}
