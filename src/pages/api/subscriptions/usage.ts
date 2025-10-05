// src/pages/api/subscriptions/usage.ts - إحصائيات استخدام الاشتراكات
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  status: 'active' | 'inactive' | 'cancelled' | 'expired' | 'suspended' | 'trial';
  startDate: string;
  endDate: string;
  nextBillingDate: string;
  billingCycle: 'monthly' | 'quarterly' | 'yearly' | 'lifetime';
  price: number;
  currency: string;
  paymentMethod: 'credit_card' | 'bank_transfer' | 'paypal' | 'cash' | 'other';
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded' | 'cancelled';
  lastPaymentDate?: string;
  nextPaymentAmount: number;
  totalPaid: number;
  remainingPayments?: number;
  autoRenew: boolean;
  trialEndDate?: string;
  cancellationDate?: string;
  cancellationReason?: string;
  notes?: string;
  features: {
    id: string;
    name: string;
    description: string;
    included: boolean;
    limit?: number;
    used?: number;
    unlimited?: boolean;
  }[];
  limits: {
    properties: number;
    auctions: number;
    customers: number;
    storage: number;
    apiCalls: number;
    users: number;
    reports: number;
    support: 'email' | 'phone' | 'priority' | 'dedicated';
  };
  usage: {
    properties: number;
    auctions: number;
    customers: number;
    storage: number;
    apiCalls: number;
    users: number;
    reports: number;
  };
  restrictions: {
    canCreateProperties: boolean;
    canCreateAuctions: boolean;
    canManageCustomers: boolean;
    canAccessAnalytics: boolean;
    canExportData: boolean;
    canUseAPI: boolean;
    canCustomizeBranding: boolean;
    canWhiteLabel: boolean;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

const DATA_DIR = path.join(process.cwd(), '.data');
const USER_SUBSCRIPTIONS_FILE = path.join(DATA_DIR, 'user-subscriptions.json');

// قراءة اشتراكات المستخدمين
const readUserSubscriptions = (): UserSubscription[] => {
  try {
    if (fs.existsSync(USER_SUBSCRIPTIONS_FILE)) {
      const data = fs.readFileSync(USER_SUBSCRIPTIONS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading user subscriptions:', error);
  }
  return [];
};

// حساب إحصائيات الاستخدام
const calculateUsageStats = (subscriptions: UserSubscription[]) => {
  const now = new Date();
  const total = subscriptions.length;
  
  // إحصائيات حسب الحالة
  const byStatus = subscriptions.reduce((acc, sub) => {
    acc[sub.status] = (acc[sub.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // إحصائيات حسب الخطة
  const byPlan = subscriptions.reduce((acc, sub) => {
    acc[sub.planName] = (acc[sub.planName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // إحصائيات حسب دورة الفوترة
  const byBillingCycle = subscriptions.reduce((acc, sub) => {
    acc[sub.billingCycle] = (acc[sub.billingCycle] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // إحصائيات حسب طريقة الدفع
  const byPaymentMethod = subscriptions.reduce((acc, sub) => {
    acc[sub.paymentMethod] = (acc[sub.paymentMethod] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // إحصائيات حسب حالة الدفع
  const byPaymentStatus = subscriptions.reduce((acc, sub) => {
    acc[sub.paymentStatus] = (acc[sub.paymentStatus] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // إحصائيات الإيرادات
  const totalRevenue = subscriptions.reduce((sum, sub) => sum + sub.totalPaid, 0);
  const averageRevenue = total > 0 ? totalRevenue / total : 0;
  const monthlyRevenue = subscriptions
    .filter(sub => sub.status === 'active' && sub.billingCycle === 'monthly')
    .reduce((sum, sub) => sum + sub.price, 0);
  const yearlyRevenue = subscriptions
    .filter(sub => sub.status === 'active' && sub.billingCycle === 'yearly')
    .reduce((sum, sub) => sum + sub.price, 0);

  // إحصائيات الاستخدام
  const totalUsage = subscriptions.reduce((acc, sub) => {
    acc.properties += sub.usage.properties;
    acc.auctions += sub.usage.auctions;
    acc.customers += sub.usage.customers;
    acc.storage += sub.usage.storage;
    acc.apiCalls += sub.usage.apiCalls;
    acc.users += sub.usage.users;
    acc.reports += sub.usage.reports;
    return acc;
  }, {
    properties: 0,
    auctions: 0,
    customers: 0,
    storage: 0,
    apiCalls: 0,
    users: 0,
    reports: 0
  });

  // إحصائيات الحدود
  const totalLimits = subscriptions.reduce((acc, sub) => {
    acc.properties += sub.limits.properties === -1 ? 0 : sub.limits.properties;
    acc.auctions += sub.limits.auctions === -1 ? 0 : sub.limits.auctions;
    acc.customers += sub.limits.customers === -1 ? 0 : sub.limits.customers;
    acc.storage += sub.limits.storage === -1 ? 0 : sub.limits.storage;
    acc.apiCalls += sub.limits.apiCalls === -1 ? 0 : sub.limits.apiCalls;
    acc.users += sub.limits.users === -1 ? 0 : sub.limits.users;
    acc.reports += sub.limits.reports === -1 ? 0 : sub.limits.reports;
    return acc;
  }, {
    properties: 0,
    auctions: 0,
    customers: 0,
    storage: 0,
    apiCalls: 0,
    users: 0,
    reports: 0
  });

  // معدلات الاستخدام
  const usageRates = {
    properties: totalLimits.properties > 0 ? (totalUsage.properties / totalLimits.properties) * 100 : 0,
    auctions: totalLimits.auctions > 0 ? (totalUsage.auctions / totalLimits.auctions) * 100 : 0,
    customers: totalLimits.customers > 0 ? (totalUsage.customers / totalLimits.customers) * 100 : 0,
    storage: totalLimits.storage > 0 ? (totalUsage.storage / totalLimits.storage) * 100 : 0,
    apiCalls: totalLimits.apiCalls > 0 ? (totalUsage.apiCalls / totalLimits.apiCalls) * 100 : 0,
    users: totalLimits.users > 0 ? (totalUsage.users / totalLimits.users) * 100 : 0,
    reports: totalLimits.reports > 0 ? (totalUsage.reports / totalLimits.reports) * 100 : 0
  };

  // إحصائيات الوقت
  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
  const trialSubscriptions = subscriptions.filter(sub => sub.status === 'trial');
  const cancelledSubscriptions = subscriptions.filter(sub => sub.status === 'cancelled');
  
  const timeStats = {
    activeSubscriptions: activeSubscriptions.length,
    trialSubscriptions: trialSubscriptions.length,
    cancelledSubscriptions: cancelledSubscriptions.length,
    expiredSubscriptions: subscriptions.filter(sub => sub.status === 'expired').length,
    suspendedSubscriptions: subscriptions.filter(sub => sub.status === 'suspended').length
  };

  // إحصائيات التجديد
  const autoRenewSubscriptions = subscriptions.filter(sub => sub.autoRenew);
  const manualRenewSubscriptions = subscriptions.filter(sub => !sub.autoRenew);
  
  const renewalStats = {
    autoRenew: autoRenewSubscriptions.length,
    manualRenew: manualRenewSubscriptions.length,
    autoRenewRate: total > 0 ? (autoRenewSubscriptions.length / total) * 100 : 0
  };

  // إحصائيات التجربة المجانية
  const trialStats = {
    totalTrials: trialSubscriptions.length,
    trialConversionRate: total > 0 ? (activeSubscriptions.length / total) * 100 : 0,
    averageTrialDuration: trialSubscriptions.length > 0 ? 
      trialSubscriptions.reduce((sum, sub) => {
        const start = new Date(sub.startDate);
        const end = new Date(sub.trialEndDate || sub.endDate);
        return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      }, 0) / trialSubscriptions.length : 0
  };

  // إحصائيات الإلغاء
  const cancellationStats = {
    totalCancellations: cancelledSubscriptions.length,
    cancellationRate: total > 0 ? (cancelledSubscriptions.length / total) * 100 : 0,
    averageSubscriptionDuration: total > 0 ? 
      subscriptions.reduce((sum, sub) => {
        const start = new Date(sub.startDate);
        const end = new Date(sub.cancellationDate || sub.endDate);
        return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      }, 0) / total : 0
  };

  // إحصائيات الدعم
  const supportStats = subscriptions.reduce((acc, sub) => {
    acc[sub.limits.support] = (acc[sub.limits.support] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // إحصائيات الميزات
  const featureStats = subscriptions.reduce((acc, sub) => {
    sub.features.forEach(feature => {
      if (feature.included) {
        acc[feature.name] = (acc[feature.name] || 0) + 1;
      }
    });
    return acc;
  }, {} as Record<string, number>);

  // إحصائيات القيود
  const restrictionStats = subscriptions.reduce((acc, sub) => {
    Object.entries(sub.restrictions).forEach(([key, value]) => {
      if (value) {
        acc[key] = (acc[key] || 0) + 1;
      }
    });
    return acc;
  }, {} as Record<string, number>);

  return {
    total,
    byStatus,
    byPlan,
    byBillingCycle,
    byPaymentMethod,
    byPaymentStatus,
    revenue: {
      total: totalRevenue,
      average: averageRevenue,
      monthly: monthlyRevenue,
      yearly: yearlyRevenue
    },
    usage: {
      total: totalUsage,
      limits: totalLimits,
      rates: usageRates
    },
    time: timeStats,
    renewal: renewalStats,
    trial: trialStats,
    cancellation: cancellationStats,
    support: supportStats,
    features: featureStats,
    restrictions: restrictionStats
  };
};

// حساب إحصائيات المستخدم
const calculateUserStats = (userId: string, subscriptions: UserSubscription[]) => {
  const userSubscriptions = subscriptions.filter(sub => sub.userId === userId);
  
  if (userSubscriptions.length === 0) {
    return {
      totalSubscriptions: 0,
      currentSubscription: null,
      totalPaid: 0,
      usage: {
        properties: 0,
        auctions: 0,
        customers: 0,
        storage: 0,
        apiCalls: 0,
        users: 0,
        reports: 0
      },
      limits: {
        properties: 0,
        auctions: 0,
        customers: 0,
        storage: 0,
        apiCalls: 0,
        users: 0,
        reports: 0
      },
      usageRates: {
        properties: 0,
        auctions: 0,
        customers: 0,
        storage: 0,
        apiCalls: 0,
        users: 0,
        reports: 0
      }
    };
  }

  const currentSubscription = userSubscriptions.find(sub => sub.status === 'active') || 
                             userSubscriptions.find(sub => sub.status === 'trial') ||
                             userSubscriptions[userSubscriptions.length - 1];

  const totalPaid = userSubscriptions.reduce((sum, sub) => sum + sub.totalPaid, 0);

  const usage = userSubscriptions.reduce((acc, sub) => {
    acc.properties += sub.usage.properties;
    acc.auctions += sub.usage.auctions;
    acc.customers += sub.usage.customers;
    acc.storage += sub.usage.storage;
    acc.apiCalls += sub.usage.apiCalls;
    acc.users += sub.usage.users;
    acc.reports += sub.usage.reports;
    return acc;
  }, {
    properties: 0,
    auctions: 0,
    customers: 0,
    storage: 0,
    apiCalls: 0,
    users: 0,
    reports: 0
  });

  const limits = currentSubscription ? currentSubscription.limits : {
    properties: 0,
    auctions: 0,
    customers: 0,
    storage: 0,
    apiCalls: 0,
    users: 0,
    reports: 0
  };

  const usageRates = {
    properties: limits.properties > 0 ? (usage.properties / limits.properties) * 100 : 0,
    auctions: limits.auctions > 0 ? (usage.auctions / limits.auctions) * 100 : 0,
    customers: limits.customers > 0 ? (usage.customers / limits.customers) * 100 : 0,
    storage: limits.storage > 0 ? (usage.storage / limits.storage) * 100 : 0,
    apiCalls: limits.apiCalls > 0 ? (usage.apiCalls / limits.apiCalls) * 100 : 0,
    users: limits.users > 0 ? (usage.users / limits.users) * 100 : 0,
    reports: limits.reports > 0 ? (usage.reports / limits.reports) * 100 : 0
  };

  return {
    totalSubscriptions: userSubscriptions.length,
    currentSubscription,
    totalPaid,
    usage,
    limits,
    usageRates
  };
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${method} not allowed` });
  }

  try {
    const { userId, type = 'all' } = req.query;
    const subscriptions = readUserSubscriptions();

    if (type === 'user' && userId) {
      const userStats = calculateUserStats(userId as string, subscriptions);
      res.status(200).json({
        stats: userStats,
        generatedAt: new Date().toISOString()
      });
    } else {
      const usageStats = calculateUsageStats(subscriptions);
      res.status(200).json({
        stats: usageStats,
        generatedAt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error in subscription usage API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}