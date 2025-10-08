import { NextApiRequest, NextApiResponse } from 'next';
import { getAIInsights } from '@/server/ai/propertyInsights';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Property ID is required' });
    }

    const insights = await getAIInsights(id);
    res.status(200).json(insights);
  } catch (error) {
    console.error('Error fetching AI insights:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
