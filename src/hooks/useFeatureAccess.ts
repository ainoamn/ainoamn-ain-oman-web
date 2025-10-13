import { useState, useEffect } from 'react';
import { FEATURE_PERMISSIONS, getMinimumPlanForFeature, PLAN_FEATURES } from '@/lib/featurePermissions';
import { SUBSCRIPTION_PLANS } from '@/lib/subscriptionSystem';

interface FeatureAccessResult {
  hasAccess: boolean;
  isLoading: boolean;
  userPlan: string;
  requiredPlan: string;
  upgradeUrl: string;
  featureName: string;
  featureNameAr: string;
}

/**
 * دالة للحصول على صلاحيات الباقة (من localStorage أو الافتراضي)
 */
function getPlanFeatures(planId: string): string[] {
  try {
    // 1. محاولة القراءة من localStorage (الأسرع)
    const customFeatures = localStorage.getItem('custom_plan_features');
    if (customFeatures) {
      const parsedFeatures = JSON.parse(customFeatures);
      if (parsedFeatures[planId]) {
        console.log(`✅ قراءة صلاحيات ${planId} من localStorage:`, parsedFeatures[planId]);
        return parsedFeatures[planId];
      }
    }
  } catch (error) {
    console.error('Error reading custom features:', error);
  }

  // 2. استخدام الصلاحيات الافتراضية
  console.log(`ℹ️ استخدام صلاحيات ${planId} الافتراضية:`, PLAN_FEATURES[planId]);
  return PLAN_FEATURES[planId] || [];
}

/**
 * دالة لتحميل البيانات من API وتحديث localStorage
 */
async function syncDataFromAPI() {
  try {
    const response = await fetch('/api/admin/subscriptions/plans');
    if (response.ok) {
      const data = await response.json();
      
      if (data.features) {
        localStorage.setItem('custom_plan_features', JSON.stringify(data.features));
        console.log('🔄 تم تحديث الصلاحيات من API');
      }
      
      if (data.plans) {
        localStorage.setItem('custom_plans', JSON.stringify(data.plans));
        console.log('🔄 تم تحديث الباقات من API');
      }
      
      return data;
    }
  } catch (error) {
    console.error('Error syncing from API:', error);
  }
  return null;
}

/**
 * Hook للتحقق من إمكانية الوصول لميزة معينة
 * @param featureId معرف الميزة من FEATURE_PERMISSIONS
 */
export function useFeatureAccess(featureId: string): FeatureAccessResult {
  const [isLoading, setIsLoading] = useState(true);
  const [userPlan, setUserPlan] = useState<string>('basic');
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const loadAndCheck = async () => {
      try {
        // محاولة المزامنة من API أولاً (في الخلفية)
        syncDataFromAPI();

        // قراءة باقة المستخدم من localStorage
        const authData = localStorage.getItem('ain_auth');
        if (authData) {
          const user = JSON.parse(authData);
          const subscription = user.subscription;
          
          if (subscription && subscription.planId) {
            setUserPlan(subscription.planId);
            
            // التحقق من الصلاحية (من localStorage أو الافتراضي)
            const planFeatures = getPlanFeatures(subscription.planId);
            const access = planFeatures.includes(featureId);
            setHasAccess(access);
            
            console.log(`🔍 التحقق من ${featureId} للمستخدم (${subscription.planId}):`, access);
          }
        }
      } catch (error) {
        console.error('Error loading user plan:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAndCheck();
  }, [featureId]);

  // الاستماع للتغييرات
  useEffect(() => {
    const handleAuthChange = () => {
      const authData = localStorage.getItem('ain_auth');
      if (authData) {
        const user = JSON.parse(authData);
        if (user.subscription?.planId) {
          const planFeatures = getPlanFeatures(user.subscription.planId);
          setHasAccess(planFeatures.includes(featureId));
          console.log(`🔄 تحديث الصلاحيات بعد التغيير`);
        }
      }
    };

    window.addEventListener('ain_auth:change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('ain_auth:change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, [featureId]);

  const feature = FEATURE_PERMISSIONS[featureId];
  const requiredPlan = getMinimumPlanForFeature(featureId);

  return {
    hasAccess,
    isLoading,
    userPlan,
    requiredPlan,
    upgradeUrl: '/subscriptions',
    featureName: feature?.name || '',
    featureNameAr: feature?.nameAr || ''
  };
}

/**
 * Hook للتحقق من عدة صلاحيات
 */
export function useFeatureAccessMultiple(featureIds: string[]) {
  const [isLoading, setIsLoading] = useState(true);
  const [userPlan, setUserPlan] = useState<string>('basic');
  const [accessMap, setAccessMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const authData = localStorage.getItem('ain_auth');
      if (authData) {
        const user = JSON.parse(authData);
        const subscription = user.subscription;
        
        if (subscription && subscription.planId) {
          setUserPlan(subscription.planId);
          
          // بناء خريطة الوصول (من localStorage أو الافتراضي)
          const planFeatures = getPlanFeatures(subscription.planId);
          const map: Record<string, boolean> = {};
          featureIds.forEach(id => {
            map[id] = planFeatures.includes(id);
          });
          setAccessMap(map);
          
          console.log(`🔍 تحميل صلاحيات متعددة لـ ${subscription.planId}:`, map);
        }
      }
    } catch (error) {
      console.error('Error loading user features:', error);
    } finally {
      setIsLoading(false);
    }
  }, [featureIds.join(',')]);

  // الاستماع للتغييرات
  useEffect(() => {
    const handleChange = () => {
      const authData = localStorage.getItem('ain_auth');
      if (authData) {
        const user = JSON.parse(authData);
        if (user.subscription?.planId) {
          const planFeatures = getPlanFeatures(user.subscription.planId);
          const map: Record<string, boolean> = {};
          featureIds.forEach(id => {
            map[id] = planFeatures.includes(id);
          });
          setAccessMap(map);
          console.log(`🔄 تحديث الصلاحيات بعد التغيير`);
        }
      }
    };

    window.addEventListener('ain_auth:change', handleChange);
    window.addEventListener('storage', handleChange);

    return () => {
      window.removeEventListener('ain_auth:change', handleChange);
      window.removeEventListener('storage', handleChange);
    };
  }, [featureIds.join(',')]);

  return {
    accessMap,
    isLoading,
    userPlan,
    hasAccess: (featureId: string) => accessMap[featureId] || false
  };
}

/**
 * دالة مساعدة للحصول على باقة المستخدم
 */
export function getUserPlan(): string {
  try {
    const authData = localStorage.getItem('ain_auth');
    if (authData) {
      const user = JSON.parse(authData);
      return user.subscription?.planId || 'basic';
    }
  } catch (error) {
    console.error('Error getting user plan:', error);
  }
  return 'basic';
}

/**
 * دالة للحصول على اسم الباقة
 */
export function getPlanName(planId: string, lang: 'ar' | 'en' = 'ar'): string {
  const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
  return lang === 'ar' ? (plan?.nameAr || 'الباقة الأساسية') : (plan?.name || 'Basic Plan');
}

