// src/pages/api/features/check.ts - API للتحقق من الميزات
import type { NextApiRequest, NextApiResponse } from 'next';
import { isFeatureEnabled, logFeatureUsage } from '@/server/features/store';
import { FeatureId, UserRole } from '@/types/features';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { featureId, context } = req.body;

    if (!featureId) {
      return res.status(400).json({ error: 'Feature ID is required' });
    }

    const enabled = await isFeatureEnabled(featureId as FeatureId, context);

    // تسجيل الاستخدام
    try {
      await logFeatureUsage({
        featureId: featureId as FeatureId,
        userId: context?.userId,
        propertyId: context?.propertyId,
      });
    } catch (error) {
      // لا نوقف العملية إذا فشل التسجيل
      console.warn('Failed to log feature usage:', error);
    }

    return res.json({ enabled });
  } catch (error: any) {
    console.error('Error checking feature:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}






