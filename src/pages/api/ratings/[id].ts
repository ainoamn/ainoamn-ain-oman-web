// src/pages/api/ratings/[id].ts - API لتقييم محدد
import type { NextApiRequest, NextApiResponse } from 'next';
import {
  getRatingById,
  updateRating,
  deleteRating,
} from '@/server/ratings/store';
import { getResponses, createResponse } from '@/server/ratings/store';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Rating ID is required' });
  }

  try {
    if (req.method === 'GET') {
      const rating = await getRatingById(id);
      if (!rating) {
        return res.status(404).json({ error: 'Rating not found' });
      }

      // جلب الرد إذا كان موجوداً
      let response = null;
      if (rating.responseId) {
        const responses = await getResponses();
        response = responses.find(r => r.id === rating.responseId) || null;
      }

      return res.json({ rating, response });
    }

    if (req.method === 'PUT') {
      const updates = req.body;
      const rating = await updateRating(id, updates);
      
      if (!rating) {
        return res.status(404).json({ error: 'Rating not found' });
      }

      return res.json({ rating });
    }

    if (req.method === 'DELETE') {
      const deleted = await deleteRating(id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Rating not found' });
      }

      return res.json({ success: true });
    }

    // إضافة رد
    if (req.method === 'POST' && req.body.action === 'respond') {
      const { responderId, responseText } = req.body;
      
      if (!responderId || !responseText) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const response = await createResponse({
        ratingId: id,
        responderId,
        responseText,
      });

      return res.status(201).json({ response });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Error in rating API:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}






