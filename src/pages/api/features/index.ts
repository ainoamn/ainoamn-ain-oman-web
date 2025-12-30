// src/pages/api/features/index.ts - API إدارة الميزات
import type { NextApiRequest, NextApiResponse } from 'next';
import {
  getAllFeatures,
  getFeature,
  saveFeature,
  deleteFeature,
  getFeatureStats,
} from '@/server/features/store';
import { FeatureConfig, FeatureId } from '@/types/features';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // التحقق من الصلاحيات (يجب أن يكون admin)
    // TODO: إضافة التحقق من الصلاحيات

    if (req.method === 'GET') {
      const { id, stats } = req.query;

      if (id) {
        const feature = await getFeature(id as FeatureId);
        if (!feature) {
          return res.status(404).json({ error: 'Feature not found' });
        }

        if (stats === 'true') {
          const statsData = await getFeatureStats(id as FeatureId);
          return res.json({ feature, stats: statsData });
        }

        return res.json({ feature });
      }

      const features = await getAllFeatures();
      return res.json({ features, count: features.length });
    }

    if (req.method === 'POST') {
      const featureData = req.body as FeatureConfig;
      
      if (!featureData.id) {
        return res.status(400).json({ error: 'Feature ID is required' });
      }

      const feature = await saveFeature(featureData);
      return res.status(201).json({ feature });
    }

    if (req.method === 'PUT') {
      const { id, ...updates } = req.body;
      
      if (!id) {
        return res.status(400).json({ error: 'Feature ID is required' });
      }

      const existing = await getFeature(id as FeatureId);
      if (!existing) {
        return res.status(404).json({ error: 'Feature not found' });
      }

      const updated = await saveFeature({
        ...existing,
        ...updates,
        updatedBy: req.body.updatedBy || 'system',
      });

      return res.json({ feature: updated });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ error: 'Feature ID is required' });
      }

      const deleted = await deleteFeature(id as FeatureId);
      if (!deleted) {
        return res.status(404).json({ error: 'Feature not found' });
      }

      return res.json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Error in features API:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
