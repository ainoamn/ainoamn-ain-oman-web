// src/pages/api/badges.ts
// API endpoint للشارات والميداليات

import type { NextApiRequest, NextApiResponse } from 'next';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  type: 'property' | 'owner' | 'tenant' | 'service';
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  criteria: string;
  earnedDate?: string;
}

// Mock badges
const availableBadges: Badge[] = [
  {
    id: 'verified-property',
    name: 'عقار موثق',
    description: 'عقار تم التحقق من معلوماته',
    icon: 'FaCheckCircle',
    color: 'blue',
    type: 'property',
    level: 'gold',
    criteria: 'تم التحقق من جميع المستندات',
  },
  {
    id: 'top-rated',
    name: 'تقييم ممتاز',
    description: 'عقار بتقييم 4.5 نجوم وأعلى',
    icon: 'FaStar',
    color: 'yellow',
    type: 'property',
    level: 'gold',
    criteria: 'متوسط تقييم 4.5+',
  },
  {
    id: 'premium-location',
    name: 'موقع مميز',
    description: 'في منطقة سكنية راقية',
    icon: 'FaMapMarkerAlt',
    color: 'purple',
    type: 'property',
    level: 'platinum',
    criteria: 'موقع في منطقة مميزة',
  },
  {
    id: 'eco-friendly',
    name: 'صديق للبيئة',
    description: 'عقار بمعايير بيئية عالية',
    icon: 'FaLeaf',
    color: 'green',
    type: 'property',
    level: 'silver',
    criteria: 'معايير الاستدامة',
  },
  {
    id: 'responsive-owner',
    name: 'مالك متجاوب',
    description: 'استجابة سريعة للاستفسارات',
    icon: 'FaBolt',
    color: 'orange',
    type: 'owner',
    level: 'gold',
    criteria: 'رد خلال 24 ساعة',
  },
  {
    id: 'excellent-service',
    name: 'خدمة ممتازة',
    description: 'خدمات صيانة متميزة',
    icon: 'FaTools',
    color: 'indigo',
    type: 'service',
    level: 'gold',
    criteria: 'تقييم خدمات 4.5+',
  },
  {
    id: 'pet-friendly',
    name: 'يسمح بالحيوانات',
    description: 'عقار يسمح بالحيوانات الأليفة',
    icon: 'FaPaw',
    color: 'pink',
    type: 'property',
    level: 'bronze',
    criteria: 'سياسة الحيوانات الأليفة',
  },
  {
    id: 'family-friendly',
    name: 'مناسب للعائلات',
    description: 'عقار مثالي للعائلات',
    icon: 'FaHome',
    color: 'teal',
    type: 'property',
    level: 'silver',
    criteria: 'مرافق عائلية',
  },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    if (method === 'GET') {
      const { propertyId, type } = req.query;
      
      // في نظام حقيقي، سنحدد أي شارات حصل عليها العقار بناءً على معايير
      const earnedBadges = availableBadges.filter(b => {
        // محاكاة: عقار P-20251005183036 حصل على بعض الشارات
        if (propertyId === 'P-20251005183036') {
          return ['verified-property', 'top-rated', 'premium-location', 'responsive-owner'].includes(b.id);
        }
        return false;
      }).map(b => ({
        ...b,
        earnedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      }));

      // الشارات المتاحة للكسب
      const availableToEarn = availableBadges.filter(b => 
        !earnedBadges.find(e => e.id === b.id)
      );

      return res.status(200).json({
        earned: earnedBadges,
        available: availableToEarn,
        total: availableBadges.length,
        earnedCount: earnedBadges.length,
      });
    }

    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${method} Not Allowed`);
  } catch (error) {
    console.error('Badges API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

