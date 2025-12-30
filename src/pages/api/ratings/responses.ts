// src/pages/api/ratings/responses.ts - API للردود على التقييمات
import type { NextApiRequest, NextApiResponse } from 'next';
import { getResponses, createResponse } from '@/server/ratings/store';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'GET') {
      const { ratingId } = req.query;
      const responses = await getResponses();
      
      if (ratingId) {
        const filtered = responses.filter(r => r.ratingId === ratingId);
        return res.json({ responses: filtered });
      }

      return res.json({ responses });
    }

    if (req.method === 'POST') {
      const { ratingId, responderId, responseText } = req.body;

      if (!ratingId || !responderId || !responseText) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const response = await createResponse({
        ratingId,
        responderId,
        responseText,
      });

      return res.status(201).json({ response });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Error in responses API:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}






