import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
    try {
        // Get the auth token from cookies
        const cookieStore = await cookies();
        const token = cookieStore.get('supabase-auth-token');

        if (!token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // Get user from token
        const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token.value);

        if (userError || !user) {
            return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
        }

        // Check if user is admin
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!profile || profile.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
        }

        // Get all users with their latest passwords (exclude admin)
        const { data: users, error } = await supabaseAdmin
            .from('profiles')
            .select('id, display_name, email, role, latest_password')
            .neq('role', 'admin')
            .order('display_name');

        if (error) {
            console.error('Error fetching user passwords:', error);
            return NextResponse.json(
                { error: 'Failed to fetch user passwords' },
                { status: 500 }
            );
        }

        return NextResponse.json({ users });
    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
