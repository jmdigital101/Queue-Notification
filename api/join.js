import { getRedis } from './_redis.js';
import crypto from 'crypto';

function getCookie(cookieHeader, name) {
    if (!cookieHeader) return null;
    const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
}

export default async function handler(req, res) {
    try {
        const redis = await getRedis();

        // 1. Check for existing session
        let sessionId = getCookie(req.headers.cookie, 'session_id');

        if (!sessionId) {
            sessionId = crypto.randomUUID();
            // Drop a session cookie in the user's browser (valid for 24 hours)
            res.setHeader('Set-Cookie', `session_id=${sessionId}; Path=/; HttpOnly; Max-Age=${60 * 60 * 24}; SameSite=Lax`);
        }

        // 2. Check if this session already has a ticket
        let userTicket = await redis.get(`session:${sessionId}`);

        // 3. If no ticket, generate a new one
        if (!userTicket) {
            userTicket = await redis.incr('queue:latest_ticket');
            await redis.set(`session:${sessionId}`, userTicket.toString());
        } else {
            userTicket = parseInt(userTicket, 10);
        }

        // 4. Get current queue status to show them immediately
        let serving = await redis.get('queue:currently_serving');
        serving = serving ? parseInt(serving, 10) : 1;

        // Initialize 'currently_serving' on the very first run if not set
        if (userTicket === 1 && (await redis.get('queue:currently_serving')) === null) {
            await redis.set('queue:currently_serving', '1');
            serving = 1;
        }

        res.status(200).json({ ticket: userTicket, serving });
    } catch (error) {
        console.error('Error in join handler:', error);
        res.status(500).json({ error: 'Failed to join queue', details: error.message });
    }
}
