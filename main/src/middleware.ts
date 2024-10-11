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
    const token = await getToken({ req: request, secret });

    console.log(`Middleware: Path: ${pathname}, Token:`, token ? 'exists' : 'null');

    // Redirect authenticated users from login page to chat
    if (token && publicRoutes.includes(pathname)) {
        console.log('Middleware: Redirecting authenticated user to /chat');
        return NextResponse.redirect(new URL('/chat', request.url));
    }

    // Redirect unauthenticated users from protected routes to login
    if (!token && protectedRoutes.includes(pathname)) {
        console.log('Middleware: Redirecting unauthenticated user to /login');
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/chat', '/login', '/api/:path*'],
};