// API للاشتراكات والمدفوعات
import { NextApiRequest, NextApiResponse } from 'next';
import { subscriptionManager, SUBSCRIPTION_PLANS } from '@/lib/subscriptionSystem';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // الحصول على جميع الخطط
    const plans = subscriptionManager.getAllPlans();
    return res.status(200).json({
      success: true,
      plans: plans
    });
  }

  if (req.method === 'POST') {
    // إنشاء اشتراك جديد
    const { userId, planId, paymentMethod } = req.body;

    if (!userId || !planId || !paymentMethod) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, planId, paymentMethod'
      });
    }

    try {
      const subscription = subscriptionManager.createSubscription(userId, planId, paymentMethod);
      return res.status(201).json({
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

  return res.status(405).json({
    success: false,
    error: 'Method not allowed'
  });
}