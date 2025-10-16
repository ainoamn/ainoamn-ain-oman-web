// src/context/SubscriptionContext.tsx
// Context API لإدارة الاشتراكات والصلاحيات

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { subscriptionManager, SUBSCRIPTION_PLANS, type SubscriptionPlan, type UserSubscription } from '@/lib/subscriptionSystem';

interface SubscriptionContextType {
  subscription: UserSubscription | null;
  plan: SubscriptionPlan | null;
  loading: boolean;
  hasPermission: (permissionId: string) => boolean;
  hasFeature: (featureKey: string) => boolean;
  canUseFeature: (featureKey: string) => { allowed: boolean; reason?: string };
  refreshSubscription: () => Promise<void>;
  isWithinLimit: (limitType: 'properties' | 'units' | 'bookings' | 'users' | 'storage', current: number) => boolean;
  getLimitStatus: (limitType: string) => { current: number; max: number; percentage: number; exceeded: boolean };
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

interface SubscriptionProviderProps {
  children: ReactNode;
}

export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);

  // تحميل بيانات الاشتراك من localStorage أو API
  const loadSubscription = async () => {
    try {
      setLoading(true);
      
      // محاولة الحصول على بيانات المستخدم من localStorage
      const authData = localStorage.getItem('ain_auth');
      if (!authData) {

        setSubscription(null);
        setPlan(null);
        return;
      }

      const userData = JSON.parse(authData);


      // التحقق من وجود اشتراك
      if (userData.subscription) {

        setSubscription(userData.subscription);
        
        // جلب تفاصيل الباقة
        const userPlan = SUBSCRIPTION_PLANS.find(p => p.id === userData.subscription.planId);
        if (userPlan) {

          setPlan(userPlan);
        } else {

        }
      } else {

        // لا يوجد اشتراك - استخدام الباقة المجانية الافتراضية
        const freePlan = SUBSCRIPTION_PLANS.find(p => p.id === 'free');
        if (freePlan) {
          setPlan(freePlan);
        }
        setSubscription(null);
      }
    } catch (error) {

      setSubscription(null);
      setPlan(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscription();

    // الاستماع لتغييرات المصادقة
    const handleAuthChange = () => {

      loadSubscription();
    };

    window.addEventListener('ain_auth:change', handleAuthChange);
    return () => window.removeEventListener('ain_auth:change', handleAuthChange);
  }, []);

  // التحقق من صلاحية معينة
  const hasPermission = (permissionId: string): boolean => {
    if (!plan || !plan.permissions) {

      return false;
    }

    const hasPerm = plan.permissions.some(p => p.id === permissionId);

    return hasPerm;
  };

  // التحقق من ميزة معينة (بناءً على category)
  const hasFeature = (featureKey: string): boolean => {
    if (!plan) {

      return false;
    }

    // التحقق حسب الفئة
    const featureCategoryMap: { [key: string]: string } = {
      'tasks': 'tasks',
      'calendar': 'calendar',
      'bookings': 'booking',
      'properties': 'property',
      'analytics': 'analytics',
      'legal': 'system',
      'reports': 'analytics',
      'auctions': 'system'
    };

    const category = featureCategoryMap[featureKey];
    if (!category) {

      return true; // افتراضياً السماح بالميزات غير المعروفة
    }

    const hasPerm = plan.permissions.some(p => p.category === category || p.category === 'system');
    console.log(`🎯 Feature Check: ${featureKey} (${category}) = ${hasPerm}`);
    return hasPerm;
  };

  // التحقق من إمكانية استخدام ميزة مع رسالة توضيحية
  const canUseFeature = (featureKey: string): { allowed: boolean; reason?: string } => {
    if (!plan) {
      return { 
        allowed: false, 
        reason: 'لا يوجد اشتراك نشط. يرجى الاشتراك في باقة للوصول لهذه الميزة.' 
      };
    }

    if (!subscription || subscription.status !== 'active') {
      return { 
        allowed: false, 
        reason: 'اشتراكك غير نشط. يرجى تجديد الاشتراك للمتابعة.' 
      };
    }

    const hasFeatureAccess = hasFeature(featureKey);
    if (!hasFeatureAccess) {
      return { 
        allowed: false, 
        reason: `هذه الميزة غير متاحة في باقتك الحالية (${plan.nameAr}). قم بالترقية للوصول إليها.` 
      };
    }

    return { allowed: true };
  };

  // التحقق من الحد (Limit) لنوع معين
  const isWithinLimit = (
    limitType: 'properties' | 'units' | 'bookings' | 'users' | 'storage', 
    current: number
  ): boolean => {
    if (!subscription || !subscription.limits) {

      return false;
    }

    const max = subscription.limits[limitType];
    const isWithin = max === -1 || current < max; // -1 = unlimited


    return isWithin;
  };

  // الحصول على حالة الحد مع التفاصيل
  const getLimitStatus = (limitType: string) => {
    if (!subscription || !subscription.limits || !subscription.usage) {
      return { current: 0, max: 0, percentage: 0, exceeded: true };
    }

    const current = subscription.usage[limitType as keyof typeof subscription.usage] || 0;
    const max = subscription.limits[limitType as keyof typeof subscription.limits] || 0;
    const percentage = max === -1 ? 0 : (current / max) * 100;
    const exceeded = max !== -1 && current >= max;

    return { current, max, percentage, exceeded };
  };

  // تحديث الاشتراك يدوياً
  const refreshSubscription = async () => {

    await loadSubscription();
  };

  const value: SubscriptionContextType = {
    subscription,
    plan,
    loading,
    hasPermission,
    hasFeature,
    canUseFeature,
    refreshSubscription,
    isWithinLimit,
    getLimitStatus
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

// Hook للوصول للـ Context
export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
}

// Hook مبسط للتحقق من الصلاحيات
export function usePermission(permissionId: string) {
  const { hasPermission, loading } = useSubscription();
  return { allowed: hasPermission(permissionId), loading };
}

// Hook للتحقق من الميزات
export function useFeature(featureKey: string) {
  const { hasFeature, canUseFeature, loading } = useSubscription();
  return { 
    allowed: hasFeature(featureKey), 
    details: canUseFeature(featureKey),
    loading 
  };
}

