import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

// GET: Fetch DMs between two users
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const otherUserId = searchParams.get('otherUserId');

        if (!userId || !otherUserId) {
            return NextResponse.json(
                { error: 'userId and otherUserId are required' },
                { status: 400 }
            );
        }

        // Fetch messages between these two users
        const { data: messages, error } = await supabaseAdmin
            .from('direct_messages')
            .select('*')
            .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching DMs:', error);
            return NextResponse.json(
                { error: 'Failed to fetch messages' },
                { status: 500 }
            );
        }

        return NextResponse.json({ messages: messages || [] });
    } catch (error) {
        console.error('DM GET error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST: Send a new DM
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { sender_id, receiver_id, content, type, media_url } = body;

        if (!sender_id || !receiver_id || !content) {
            return NextResponse.json(
                { error: 'sender_id, receiver_id, and content are required' },
                { status: 400 }
            );
        }

        // Insert new message
        const { data, error } = await supabaseAdmin
            .from('direct_messages')
            .insert({
                sender_id,
                receiver_id,
                content,
                type: type || 'text',
                media_url,
            })
            .select()
            .single();

        if (error) {
            console.error('Error sending DM:', error);
            return NextResponse.json(
                { error: 'Failed to send message' },
                { status: 500 }
            );
        }

        return NextResponse.json({ message: data });
    } catch (error) {
        console.error('DM POST error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
