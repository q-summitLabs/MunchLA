import { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { kv } from '@vercel/kv';

const ratelimit = new Ratelimit({
    redis: kv,
    limiter: Ratelimit.slidingWindow(1000, '30 s'),
});

export default async function middleware(request: NextRequest) {
    const ip = request.ip ?? "127.0.0.1";
    const { success, pending, limit, reset, remaining } = await ratelimit.limit(
        ip
    );
    console.log(pending, limit, reset, remaining);
    return success;
}