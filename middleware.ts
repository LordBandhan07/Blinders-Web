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

    // Protect /home routes - require both auth and passkey
    if (pathname.startsWith('/home')) {
        // No auth token - redirect to passkey lock
        if (!token) {
            return NextResponse.redirect(new URL('/passkey-lock', request.url));
        }

        // Has auth but no passkey unlock - redirect to passkey lock
        const passkeySession = request.cookies.get('passkey-unlocked');
        if (!passkeySession) {
            return NextResponse.redirect(new URL('/passkey-lock', request.url));
        }
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
