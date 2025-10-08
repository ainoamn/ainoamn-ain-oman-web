// src/pages/api/reviews.ts
// API endpoint للتقييمات (العقار، الإدارة، الخدمات)

import type { NextApiRequest, NextApiResponse } from 'next';

// Mock data store
let reviewsStore: any[] = [
  {
    id: 'REV-1',
    propertyId: 'P-20251005183036',
    userId: 'user_1',
    userName: 'أحمد محمد',
    userAvatar: '/demo/user1.jpg',
    type: 'property', // 'property', 'company', 'service'
    rating: 5,
    title: 'عقار ممتاز',
    comment: 'موقع رائع وخدمات ممتازة',
    aspects: {
      location: 5,
      cleanliness: 5,
      valueForMoney: 4,
      amenities: 5,
    },
    timestamp: new Date().toISOString(),
    verified: true,
  },
  {
    id: 'REV-2',
    propertyId: 'P-20251005183036',
    userId: 'user_2',
    userName: 'فاطمة علي',
    userAvatar: '/demo/user1.jpg',
    type: 'company',
    rating: 4,
    title: 'إدارة محترفة',
    comment: 'تعامل راقي وسرعة في الاستجابة',
    aspects: {
      professionalism: 5,
      communication: 4,
      responsiveness: 4,
      transparency: 5,
    },
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    verified: true,
  },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    if (method === 'GET') {
      const { propertyId, type } = req.query;
      
      let reviews = reviewsStore.filter(r => {
        if (propertyId && r.propertyId !== propertyId) return false;
        if (type && r.type !== type) return false;
        return true;
      });

      // حساب الإحصائيات
      const stats = {
        total: reviews.length,
        average: reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : 0,
        distribution: {
          5: reviews.filter(r => r.rating === 5).length,
          4: reviews.filter(r => r.rating === 4).length,
          3: reviews.filter(r => r.rating === 3).length,
          2: reviews.filter(r => r.rating === 2).length,
          1: reviews.filter(r => r.rating === 1).length,
        },
      };

      return res.status(200).json({ reviews, stats });
    }

    if (method === 'POST') {
      const { propertyId, type, rating, title, comment, aspects } = req.body;

      const newReview = {
        id: `REV-${Date.now()}`,
        propertyId,
        userId: 'user_123', // من الجلسة
        userName: 'مستخدم',
        userAvatar: '/demo/user1.jpg',
        type,
        rating,
        title,
        comment,
        aspects,
        timestamp: new Date().toISOString(),
        verified: false,
      };

      reviewsStore.push(newReview);

      return res.status(200).json({ success: true, review: newReview });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${method} Not Allowed`);
  } catch (error) {
    console.error('Reviews API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
