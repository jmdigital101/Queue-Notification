import { getRedis } from './_redis.js';

export default async function handler(req, res) {
    try {
        const redis = await getRedis();
        let serving = await redis.get('queue:currently_serving');
        serving = serving ? parseInt(serving, 10) : 1;
        res.status(200).json({ serving });
    } catch (error) {
        console.error('Error in status handler:', error);
        res.status(500).json({ error: 'Failed to fetch status', details: error.message });
    }
}
