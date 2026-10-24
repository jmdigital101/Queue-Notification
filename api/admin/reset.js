import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    await kv.set('queue:latest_ticket', 0);
    await kv.set('queue:currently_serving', 1);
    res.status(200).json({ message: 'Queue reset successfully' });
}
