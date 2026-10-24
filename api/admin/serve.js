import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const nextServing = await kv.incr('queue:currently_serving');
    res.status(200).json({ serving: nextServing });
}
