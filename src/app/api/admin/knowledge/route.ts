import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET all knowledge base entries
export async function GET() {
    try {
        const { data: entries, error } = await supabaseAdmin
            .from('chat_knowledge_base')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return NextResponse.json({ entries });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST new knowledge base entry
export async function POST(req: Request) {
    try {
        const { question, answer, category } = await req.json();

        if (!question || !answer) {
            return NextResponse.json({ error: "Missing question or answer" }, { status: 400 });
        }

        const { data: entry, error } = await supabaseAdmin
            .from('chat_knowledge_base')
            .insert([{
                question,
                answer,
                category: category || 'General'
            }])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, entry });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE a knowledge base entry
export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ error: "Missing id" }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from('chat_knowledge_base')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
