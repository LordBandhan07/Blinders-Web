import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        // Get the auth token from cookies
        const cookieStore = await cookies();
        const token = cookieStore.get('supabase-auth-token');

        if (!token) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        // Get user from token
        const { data: { user }, error: userError } = await supabase.auth.getUser(token.value);

        if (userError || !user) {
            return NextResponse.json(
                { error: 'Invalid session' },
                { status: 401 }
            );
        }

        // Get user profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.error('Profile fetch error:', profileError);
            return NextResponse.json(
                { error: 'Failed to fetch profile' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                display_name: profile.display_name,
                role: profile.role,
                avatar_url: profile.avatar_url,
                is_online: profile.is_online,
                profile_photo_url: profile.profile_photo_url,
            },
        });
    } catch (error) {
        console.error('Get user API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
