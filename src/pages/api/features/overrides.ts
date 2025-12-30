// src/pages/api/features/overrides.ts - API لإدارة Overrides
import type { NextApiRequest, NextApiResponse } from 'next';
import {
  getOverrides,
  createOverride,
  deleteOverride,
} from '@/server/features/store';
import { FeatureOverride } from '@/types/features';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // التحقق من الصلاحيات (يجب أن يكون admin)
    // TODO: إضافة التحقق من الصلاحيات

    if (req.method === 'GET') {
      const { featureId, scope, targetId } = req.query;
      
      let overrides = await getOverrides();
      
      if (featureId) {
        overrides = overrides.filter(o => o.featureId === featureId);
      }
      if (scope) {
        overrides = overrides.filter(o => o.scope === scope);
      }
      if (targetId) {
        overrides = overrides.filter(o => o.targetId === targetId);
      }

      return res.json({ overrides, count: overrides.length });
    }

    if (req.method === 'POST') {
      const overrideData = req.body as Omit<FeatureOverride, 'id' | 'createdAt'>;
      
      if (!overrideData.featureId || !overrideData.scope || !overrideData.targetId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const override = await createOverride(overrideData);
      return res.status(201).json({ override });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ error: 'Override ID is required' });
      }

      const deleted = await deleteOverride(id as string);
      if (!deleted) {
        return res.status(404).json({ error: 'Override not found' });
      }

      return res.json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Error in overrides API:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}






