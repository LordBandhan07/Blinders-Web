import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('supabase-auth-token');

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { messageId, emoji, action } = body;

        if (!messageId || !emoji || !action) {
            return NextResponse.json(
                { error: 'messageId, emoji, and action are required' },
                { status: 400 }
            );
        }

        // Get user from token
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token.value);

        if (authError || !user) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        if (action === 'add') {
            // Add reaction
            const { data, error } = await supabaseAdmin
                .from('message_reactions')
                .insert({
                    message_id: messageId,
                    user_id: user.id,
                    emoji,
                })
                .select()
                .single();

            if (error) {
                // If duplicate, ignore (user already reacted with this emoji)
                if (error.code === '23505') {
                    return NextResponse.json({ message: 'Already reacted' });
                }
                throw error;
            }

            return NextResponse.json({ reaction: data, success: true });
        } else if (action === 'remove') {
            // Remove reaction
            const { error } = await supabaseAdmin
                .from('message_reactions')
                .delete()
                .eq('message_id', messageId)
                .eq('user_id', user.id)
                .eq('emoji', emoji);

            if (error) throw error;

            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error('Reaction error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// GET: Fetch reactions for a message
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const messageId = searchParams.get('messageId');

        if (!messageId) {
            return NextResponse.json(
                { error: 'messageId is required' },
                { status: 400 }
            );
        }

        const { data: reactions, error } = await supabaseAdmin
            .from('message_reactions')
            .select(`
                *,
                profiles:user_id (
                    display_name,
                    profile_photo_url
                )
            `)
            .eq('message_id', messageId);

        if (error) throw error;

        return NextResponse.json({ reactions: reactions || [] });
    } catch (error) {
        console.error('Get reactions error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
