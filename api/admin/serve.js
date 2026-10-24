import { getRedis } from '../_redis.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const redis = await getRedis();
        const nextServing = await redis.incr('queue:currently_serving');
        res.status(200).json({ serving: nextServing });
    } catch (error) {
        console.error('Error in serve handler:', error);
        res.status(500).json({ error: 'Failed to advance queue', details: error.message });
    }
}
