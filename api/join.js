import { kv } from '@vercel/kv';
import { serialize, parse } from 'cookie';
import crypto from 'crypto';

export default async function handler(req, res) {
    // 1. Check for existing session
    const cookies = parse(req.headers.cookie || '');
    let sessionId = cookies.session_id;

    if (!sessionId) {
        sessionId = crypto.randomUUID();
        // Drop a cookie in the user's browser
        res.setHeader('Set-Cookie', serialize('session_id', sessionId, { path: '/', httpOnly: true, maxAge: 60 * 60 * 24 }));
    }

    // 2. Check if this session already has a ticket
    let userTicket = await kv.get(`session:${sessionId}`);

    // 3. If no ticket, generate a new one
    if (!userTicket) {
        userTicket = await kv.incr('queue:latest_ticket');
        await kv.set(`session:${sessionId}`, userTicket);
    }

    // 4. Get current queue status to show them immediately
    let serving = await kv.get('queue:currently_serving') || 1;

    // Initialize 'currently_serving' on the very first run
    if (userTicket === 1 && serving === null) {
        await kv.set('queue:currently_serving', 1);
        serving = 1;
    }

    res.status(200).json({ ticket: userTicket, serving: serving });
}
