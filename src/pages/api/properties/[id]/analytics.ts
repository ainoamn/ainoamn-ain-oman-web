import { NextApiRequest, NextApiResponse } from 'next';
import { getAnalyticsData } from '@/server/properties/analytics';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const { timeRange = '30d' } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Property ID is required' });
    }

    const analyticsData = await getAnalyticsData(id, timeRange as string);
    res.status(200).json(analyticsData);
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
