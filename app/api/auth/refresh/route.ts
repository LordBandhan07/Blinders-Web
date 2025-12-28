import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { session } = await request.json();

        if (!session || !session.access_token) {
            return NextResponse.json(
                { error: 'Invalid session data' },
                { status: 400 }
            );
        }

        // Create response
        const response = NextResponse.json({ success: true });

        // Update session cookie
        response.cookies.set('supabase-auth-token', session.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days (match login route)
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Session refresh error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
