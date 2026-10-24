import { getRedis } from '../_redis.js';

export default async function handler(req, res) {
    try {
        const redis = await getRedis();
        await redis.set('queue:latest_ticket', '0');
        await redis.set('queue:currently_serving', '1');
        res.status(200).json({ message: 'Queue reset successfully' });
    } catch (error) {
        console.error('Error in reset handler:', error);
        res.status(500).json({ error: 'Failed to reset queue', details: error.message });
    }
}
