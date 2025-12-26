import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

// GET: Get list of all conversations for a user (admin)
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'userId is required' },
                { status: 400 }
            );
        }

        // Get all unique users who have DM conversations with this user
        const { data: messages, error } = await supabaseAdmin
            .from('direct_messages')
            .select('sender_id, receiver_id, created_at')
            .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching conversations:', error);
            return NextResponse.json(
                { error: 'Failed to fetch conversations' },
                { status: 500 }
            );
        }

        // Extract unique user IDs
        const userIds = new Set<string>();
        messages?.forEach((msg) => {
            if (msg.sender_id !== userId) userIds.add(msg.sender_id);
            if (msg.receiver_id !== userId) userIds.add(msg.receiver_id);
        });

        // Fetch user profiles
        const { data: profiles, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .in('id', Array.from(userIds));

        if (profileError) {
            console.error('Error fetching profiles:', error);
            return NextResponse.json(
                { error: 'Failed to fetch user profiles' },
                { status: 500 }
            );
        }

        return NextResponse.json({ conversations: profiles || [] });
    } catch (error) {
        console.error('Conversations GET error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
