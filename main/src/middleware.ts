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
    const { pathname } = request.nextUrl;

    // Rate limiting
    const ip = request.ip ?? "127.0.0.1";
    const { success } = await ratelimit.limit(ip);

    if (!success) {
        return new NextResponse('Too Many Requests', { status: 429 });
    }

    // Authentication check
    try {
        const token = await getToken({ req: request, secret });
        console.log(`Middleware: Path: ${pathname}, Token:`, token ? 'exists' : 'null');

        if (token) {
            console.log('Token contents:', JSON.stringify(token, null, 2));
        }

        // Redirect authenticated users from login page to chat
        if (token && publicRoutes.includes(pathname)) {
            console.log('Middleware: Redirecting authenticated user to /chat');
            return NextResponse.redirect(new URL('/chat', request.url));
        }

        // Redirect unauthenticated users from protected routes to login
        if (!token && protectedRoutes.includes(pathname)) {
            console.log('Middleware: Redirecting unauthenticated user to /login');
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('callbackUrl', encodeURI(request.url));
            return NextResponse.redirect(loginUrl);
        }
    } catch (error) {
        console.error('Error in middleware:', error);
        // In case of an error, allow the request to proceed to the application,
        // where it can be handled more gracefully
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/chat', '/login', '/api/:path*'],
};