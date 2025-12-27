import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const publicRoutes = ['/login', '/', '/passkey-lock'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if the route is public
    if (publicRoutes.includes(pathname)) {
        return NextResponse.next();
    }

    // Check for authentication token
    const token = request.cookies.get('supabase-auth-token');

    // If no token and trying to access protected route, redirect to login
    if (!token && pathname.startsWith('/home')) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // If has token but trying to access /home routes, check passkey session
    if (token && pathname.startsWith('/home')) {
        // Get passkey session from cookie (we'll set this client-side)
        const passkeySession = request.cookies.get('passkey-unlocked');

        // If no passkey session or expired, redirect to lock screen
        if (!passkeySession) {
            return NextResponse.redirect(new URL('/passkey-lock', request.url));
        }
    }

    // If has token and trying to access login, redirect to home
    if (token && pathname === '/login') {
        return NextResponse.redirect(new URL('/home', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (public folder)
         * - api routes
         */
        '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
