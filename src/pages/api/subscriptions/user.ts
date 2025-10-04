// API لاشتراك المستخدم
import { NextApiRequest, NextApiResponse } from 'next';
import { subscriptionManager } from '@/lib/subscriptionSystem';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'User ID is required'
    });
  }

  if (req.method === 'GET') {
    // الحصول على اشتراك المستخدم
    const stats = subscriptionManager.getSubscriptionStats(userId);
    
    if (!stats) {
      return res.status(404).json({
        success: false,
        error: 'No subscription found'
      });
    }

    return res.status(200).json({
      success: true,
      stats: stats
    });
  }

  if (req.method === 'PUT') {
    // ترقية الاشتراك
    const { newPlanId } = req.body;

    if (!newPlanId) {
      return res.status(400).json({
        success: false,
        error: 'New plan ID is required'
      });
    }

    try {
      const subscription = subscriptionManager.upgradeSubscription(userId, newPlanId);
      return res.status(200).json({
        success: true,
        subscription: subscription
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  if (req.method === 'DELETE') {
    // إلغاء الاشتراك
    try {
      subscriptionManager.cancelSubscription(userId);
      return res.status(200).json({
        success: true,
        message: 'Subscription cancelled successfully'
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