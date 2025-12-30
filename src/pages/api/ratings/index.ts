// src/pages/api/ratings/index.ts - API للتقييمات المتقدمة
import type { NextApiRequest, NextApiResponse } from 'next';
import {
  getRatings,
  createRating,
  updateRating,
  deleteRating,
  getRatingById,
  getRatingsByUser,
  getRatingsByProperty,
  getRatingStats,
} from '@/server/ratings/store';
import { Rating, RatingFilters } from '@/types/ratings';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'GET') {
      const {
        userId,
        propertyId,
        type,
        minRating,
        maxRating,
        verifiedOnly,
        hasResponse,
        reviewType,
        dimension,
        dateFrom,
        dateTo,
        stats,
      } = req.query;

      // جلب الإحصائيات
      if (stats === 'true') {
        const statsData = await getRatingStats(
          userId as string,
          propertyId as string
        );
        return res.json({ stats: statsData });
      }

      // جلب التقييمات حسب المستخدم
      if (userId && type) {
        const ratings = await getRatingsByUser(
          userId as string,
          type as 'reviewer' | 'reviewee'
        );
        return res.json({ ratings });
      }

      // جلب التقييمات حسب العقار
      if (propertyId) {
        const ratings = await getRatingsByProperty(propertyId as string);
        return res.json({ ratings });
      }

      // جلب تقييم محدد
      if (req.query.id) {
        const rating = await getRatingById(req.query.id as string);
        if (!rating) {
          return res.status(404).json({ error: 'Rating not found' });
        }
        return res.json({ rating });
      }

      // جلب التقييمات مع الفلاتر
      const filters: RatingFilters = {};
      if (minRating) filters.minRating = Number(minRating);
      if (maxRating) filters.maxRating = Number(maxRating);
      if (verifiedOnly === 'true') filters.verifiedOnly = true;
      if (hasResponse === 'true') filters.hasResponse = true;
      if (hasResponse === 'false') filters.hasResponse = false;
      if (reviewType) filters.reviewType = reviewType as any;
      if (dimension) filters.dimension = dimension as any;
      if (dateFrom) filters.dateFrom = Number(dateFrom);
      if (dateTo) filters.dateTo = Number(dateTo);

      const ratings = await getRatings(filters);
      return res.json({ ratings, count: ratings.length });
    }

    if (req.method === 'POST') {
      const ratingData = req.body as Omit<Rating, 'id' | 'createdAt' | 'updatedAt'>;
      
      // التحقق من البيانات
      if (!ratingData.reviewerId || !ratingData.revieweeId || !ratingData.reviewType) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      if (!ratingData.dimensions || ratingData.dimensions.length === 0) {
        return res.status(400).json({ error: 'At least one dimension is required' });
      }

      // حساب التقييم الإجمالي
      const totalScore = ratingData.dimensions.reduce((sum, dim) => {
        const weight = dim.weight || 1;
        return sum + (dim.score * weight);
      }, 0);
      const totalWeight = ratingData.dimensions.reduce((sum, dim) => sum + (dim.weight || 1), 0);
      ratingData.overallRating = Math.round((totalScore / totalWeight) * 10) / 10;

      const rating = await createRating(ratingData);
      return res.status(201).json({ rating });
    }

    if (req.method === 'PUT') {
      const { id, ...updates } = req.body;
      if (!id) {
        return res.status(400).json({ error: 'Rating ID is required' });
      }

      const rating = await updateRating(id, updates);
      if (!rating) {
        return res.status(404).json({ error: 'Rating not found' });
      }

      return res.json({ rating });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'Rating ID is required' });
      }

      const deleted = await deleteRating(id as string);
      if (!deleted) {
        return res.status(404).json({ error: 'Rating not found' });
      }

      return res.json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Error in ratings API:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}






