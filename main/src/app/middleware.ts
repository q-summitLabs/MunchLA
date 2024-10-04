import { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { kv } from '@vercel/kv';

const ratelimit = new Ratelimit({
    redis: kv,
    limiter: Ratelimit.slidingWindow(100, '50 s'),
});

export default async function middleware(request: NextRequest) {
    const ip = request.ip ?? "127.0.0.1";

    const { success } = await ratelimit.limit(ip);    

    return success;
}