// API للصلاحيات
import { NextApiRequest, NextApiResponse } from 'next';
import { subscriptionManager, PERMISSION_CATEGORIES, PERMISSION_LEVELS } from '@/lib/subscriptionSystem';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'User ID is required'
    });
  }

  if (req.method === 'GET') {
    const { permissionId, resource } = req.query;

    if (permissionId) {
      // التحقق من صلاحية محددة
      const hasPermission = subscriptionManager.hasPermission(userId, permissionId as string);
      return res.status(200).json({
        success: true,
        hasPermission: hasPermission
      });
    }

    if (resource) {
      // التحقق من حد معين
      const canUse = subscriptionManager.checkLimit(userId, resource as any);
      return res.status(200).json({
        success: true,
        canUse: canUse
      });
    }

    // الحصول على جميع الصلاحيات والحدود
    const stats = subscriptionManager.getSubscriptionStats(userId);
    
    if (!stats) {
      return res.status(404).json({
        success: false,
        error: 'No subscription found'
      });
    }

    return res.status(200).json({
      success: true,
      permissions: stats.plan.permissions,
      limits: stats.limits,
      usage: stats.usage,
      categories: PERMISSION_CATEGORIES,
      levels: PERMISSION_LEVELS
    });
  }

  if (req.method === 'POST') {
    // تحديث الاستخدام
    const { resource, increment } = req.body;

    if (!resource) {
      return res.status(400).json({
        success: false,
        error: 'Resource is required'
      });
    }

    try {
      subscriptionManager.updateUsage(userId, resource, increment || 1);
      return res.status(200).json({
        success: true,
        message: 'Usage updated successfully'
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return res.status(405).json({
    success: false,
    error: 'Method not allowed'
  });
}
