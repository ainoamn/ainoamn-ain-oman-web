// src/pages/api/reviews/index.ts - نظام التقييمات والتعليقات
import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const reviewsPath = path.join(process.cwd(), '.data', 'reviews.json');

// التأكد من وجود المجلد والملف
function ensureReviewsFile() {
  const dataDir = path.join(process.cwd(), '.data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(reviewsPath)) {
    fs.writeFileSync(reviewsPath, JSON.stringify({ reviews: [] }, null, 2));
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  ensureReviewsFile();

  if (req.method === 'GET') {
    try {
      const { propertyId, userId, status } = req.query;
      const data = JSON.parse(fs.readFileSync(reviewsPath, 'utf-8'));
      let reviews = data.reviews || [];

      // فلترة حسب العقار
      if (propertyId) {
        reviews = reviews.filter((r: any) => r.propertyId === propertyId);
      }

      // فلترة حسب المستخدم
      if (userId) {
        reviews = reviews.filter((r: any) => r.userId === userId);
      }

      // فلترة حسب الحالة
      if (status) {
        reviews = reviews.filter((r: any) => r.status === status);
      }

      // حساب الإحصائيات
      const stats = {
        total: reviews.length,
        averageRating: reviews.length > 0 
          ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length 
          : 0,
        ratings: {
          5: reviews.filter((r: any) => r.rating === 5).length,
          4: reviews.filter((r: any) => r.rating === 4).length,
          3: reviews.filter((r: any) => r.rating === 3).length,
          2: reviews.filter((r: any) => r.rating === 2).length,
          1: reviews.filter((r: any) => r.rating === 1).length,
        }
      };

      res.status(200).json({ reviews, stats });
    } catch (error) {
      console.error('Error loading reviews:', error);
      res.status(500).json({ error: 'Failed to load reviews' });
    }
  } else if (req.method === 'POST') {
    try {
      const { propertyId, userId, userName, userAvatar, rating, comment, aspects } = req.body;

      if (!propertyId || !userId || !rating) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
      }

      const data = JSON.parse(fs.readFileSync(reviewsPath, 'utf-8'));
      const reviews = data.reviews || [];

      // التحقق من وجود تقييم سابق
      const existingReview = reviews.find(
        (r: any) => r.propertyId === propertyId && r.userId === userId
      );

      if (existingReview) {
        return res.status(400).json({ error: 'You have already reviewed this property' });
      }

      const newReview = {
        id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        propertyId,
        userId,
        userName,
        userAvatar,
        rating,
        comment,
        aspects: aspects || {
          cleanliness: rating,
          location: rating,
          value: rating,
          communication: rating,
        },
        status: 'pending', // pending, approved, rejected
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        helpful: 0,
        reported: 0,
      };

      reviews.push(newReview);
      fs.writeFileSync(reviewsPath, JSON.stringify({ reviews }, null, 2));

      res.status(201).json({ review: newReview });
    } catch (error) {
      console.error('Error creating review:', error);
      res.status(500).json({ error: 'Failed to create review' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

