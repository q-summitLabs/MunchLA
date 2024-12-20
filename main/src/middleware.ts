import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { Ratelimit } from '@upstash/ratelimit';
import { kv } from '@vercel/kv';

const ratelimit = new Ratelimit({
    redis: kv,
    limiter: Ratelimit.slidingWindow(500, '100 s'),
});

const secret = process.env.NEXTAUTH_SECRET;

const protectedRoutes = ['/chat'];
const publicRoutes = ['/login'];

export default async function middleware(request: NextRequest) {
    const currentVersion = process.env.APP_VERSION;
    const previousVersion = request.cookies.get('previousVersion');
    if (!previousVersion || previousVersion.value !== currentVersion) {
        request.cookies.delete('__Secure-next-auth.session-token');
        request.cookies.set('previousVersion', currentVersion || '');
    }
    const response = NextResponse.next();


    const { pathname } = request.nextUrl;

    // Rate limiting
    const ip = request.ip ?? "127.0.0.1";
    const { success } = await ratelimit.limit(ip);

    if (!success) {
        return new NextResponse('Too Many Requests', { status: 429, headers: response.headers });
    }

    // Authentication check
    try {
        const token = await getToken({ req: request, secret });
        console.log(`Middleware: Path: ${pathname}, Token:`, token ? 'exists' : 'null');

        if (token) {
            console.log('Token contents:', JSON.stringify(token, null, 2));
        } else {
            console.log('Token is null. Checking for session cookie...');
            const sessionCookie = request.cookies.get('next-auth.session-token-v2');
            if (sessionCookie) {
                console.log('Session cookie found, but token is null. This might indicate a configuration issue.');
            } else {
                console.log('No session cookie found.');
            }
        }

        // Redirect authenticated users from login page to chat
        if ((token || request.cookies.get('next-auth.session-token-v2')) && publicRoutes.includes(pathname)) {
            console.log('Middleware: Redirecting authenticated user to /chat');
            return NextResponse.redirect(new URL('/chat', request.url));
        }

        // Redirect unauthenticated users from protected routes to login
        if (!token && !request.cookies.get('next-auth.session-token-v2') && protectedRoutes.includes(pathname)) {
            console.log('Middleware: Redirecting unauthenticated user to /login');
            return NextResponse.redirect(new URL('/login', request.url));
        }
    } catch (error) {
        console.error('Error in middleware:', error);
        // In case of an error, allow the request to proceed to the application,
        // where it can be handled more gracefully
    }

    return response;
}

export const config = {
    matcher: ['/chat', '/login', '/api/:path*'],
};