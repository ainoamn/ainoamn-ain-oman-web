import { NextApiRequest, NextApiResponse } from 'next';
import { getPropertyStats } from '@/server/properties/stats';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Property ID is required' });
    }

    const stats = await getPropertyStats(id);
    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching property stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
