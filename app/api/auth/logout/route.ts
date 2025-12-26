import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        // Get the auth token from cookies
        const cookieStore = await cookies();
        const token = cookieStore.get('supabase-auth-token');

        if (token) {
            // Get current session
            const { data: { user } } = await supabase.auth.getUser(token.value);

            if (user) {
                // Update online status to false
                await supabase
                    .from('profiles')
                    .update({ is_online: false, last_seen: new Date().toISOString() })
                    .eq('id', user.id);
            }

            // Sign out from Supabase
            await supabase.auth.signOut();
        }

        // Create response and clear cookie
        const response = NextResponse.json({ success: true });

        response.cookies.delete('supabase-auth-token');

        return response;
    } catch (error) {
        console.error('Logout API error:', error);

        // Still clear the cookie even if there's an error
        const response = NextResponse.json(
            { error: 'Logout failed' },
            { status: 500 }
        );

        response.cookies.delete('supabase-auth-token');

        return response;
    }
}
