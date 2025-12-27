import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Sign in with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error('Login error:', error);
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        if (!data.user || !data.session) {
            return NextResponse.json(
                { error: 'Authentication failed' },
                { status: 401 }
            );
        }

        // Get user profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

        if (profileError) {
            console.error('Profile fetch error:', profileError);
            return NextResponse.json(
                { error: 'Failed to fetch user profile' },
                { status: 500 }
            );
        }

        // Update online status
        await supabase
            .from('profiles')
            .update({ is_online: true, last_seen: new Date().toISOString() })
            .eq('id', data.user.id);

        // Create response with session cookie
        const response = NextResponse.json({
            success: true,
            user: {
                id: data.user.id,
                email: data.user.email,
                display_name: profile.display_name,
                role: profile.role,
            },
            session: data.session,
        });

        // Set session cookie
        response.cookies.set('supabase-auth-token', data.session.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        // Set passkey unlocked cookie (24 hours)
        response.cookies.set('passkey-unlocked', 'true', {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24, // 24 hours
            path: '/',
        });

        // Set device ID cookie (permanent) to track this device
        const deviceId = request.headers.get('user-agent') || 'unknown';
        response.cookies.set('blinders-device-id', Buffer.from(deviceId).toString('base64').slice(0, 32), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 365 * 10, // 10 years
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Login API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
