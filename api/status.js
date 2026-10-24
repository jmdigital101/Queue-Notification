import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    const serving = await kv.get('queue:currently_serving') || 1;
    res.status(200).json({ serving });
}
