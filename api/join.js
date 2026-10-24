import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const sessionId = req.query.sessionId;
  if (!sessionId) {
      return res.status(400).json({ error: 'Missing session ID' });
  }

  let userTicket = await kv.get(`session:${sessionId}`);

  if (!userTicket) {
    userTicket = await kv.incr('queue:latest_ticket');
    await kv.set(`session:${sessionId}`, userTicket);
  }

  let serving = await kv.get('queue:currently_serving') || 1;

  res.status(200).json({ ticket: userTicket, serving: serving });
}
