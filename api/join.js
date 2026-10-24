import { getRedis } from './_redis.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const sessionId = req.query.sessionId;
  if (!sessionId) {
      return res.status(400).json({ error: 'Missing session ID' });
  }

  const kv = await getRedis();

  let userTicket = await kv.get(`session:${sessionId}`);

  if (!userTicket) {
    userTicket = await kv.incr('queue:latest_ticket');
    await kv.set(`session:${sessionId}`, userTicket.toString());
  } else {
    userTicket = parseInt(userTicket, 10);
  }

  let serving = await kv.get('queue:currently_serving') || 1;
  serving = parseInt(serving, 10);

  res.status(200).json({ ticket: userTicket, serving: serving });
}
