import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const channel = searchParams.get('channel');

        if (!channel) {
            return NextResponse.json(
                { error: 'Channel parameter is required' },
                { status: 400 }
            );
        }

        const { data: messages, error } = await supabaseAdmin
            .from('messages')
            .select('*')
            .eq('channel', channel)
            .order('created_at', { ascending: true })
            .limit(100);

        if (error) {
            console.error('Fetch messages error:', error);
            return NextResponse.json(
                { error: 'Failed to fetch messages' },
                { status: 500 }
            );
        }

        return NextResponse.json({ messages: messages || [] });
    } catch (error) {
        console.error('Get messages API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const { channel, content, sender_id, sender_name, type = 'text', media_url } = await request.json();

        if (!channel || !content || !sender_id || !sender_name) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const { data: message, error } = await supabaseAdmin
            .from('messages')
            .insert({
                channel,
                content,
                sender_id,
                sender_name,
                type,
                media_url,
            })
            .select()
            .single();

        if (error) {
            console.error('Send message error:', error);
            return NextResponse.json(
                { error: 'Failed to send message' },
                { status: 500 }
            );
        }

        return NextResponse.json({ message });
    } catch (error) {
        console.error('Post message API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
