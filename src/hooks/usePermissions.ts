// src/hooks/usePermissions.ts - نظام فحص الصلاحيات الشامل
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { subscriptionManager } from '@/lib/subscriptionSystem';

export interface PermissionCheck {
  hasAccess: boolean;
  reason?: string;
  remainingQuota?: number;
  totalQuota?: number;
}

export function usePermissions() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    try {
      const authData = localStorage.getItem('ain_auth');
      if (authData) {
        const userData = JSON.parse(authData);
        setUser(userData);
        setSubscription(userData.subscription);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * فحص صلاحية الوصول لميزة معينة
   */
  const checkPermission = (permissionId: string): PermissionCheck => {
    // إذا لم يكن هناك مستخدم
    if (!user) {
      return { hasAccess: false, reason: 'يرجى تسجيل الدخول' };
    }

    // إذا كان مدير، يملك جميع الصلاحيات
    if (user.role === 'admin') {
      return { hasAccess: true };
    }

    // إذا لم يكن هناك اشتراك
    if (!subscription) {
      return { hasAccess: false, reason: 'يرجى الاشتراك في باقة' };
    }

    // إذا كان الاشتراك منتهي
    if (subscription.status !== 'active') {
      return { hasAccess: false, reason: 'اشتراكك منتهي. يرجى التجديد' };
    }

    // فحص الصلاحية في الباقة
    const hasPermission = subscription.permissions?.includes(permissionId);
    if (!hasPermission) {
      return { hasAccess: false, reason: 'هذه الميزة غير متاحة في باقتك' };
    }

    return { hasAccess: true };
  };

  /**
   * فحص الحد الأقصى لميزة معينة
   */
  const checkQuota = (quotaType: 'properties' | 'units' | 'bookings' | 'users', currentUsage: number): PermissionCheck => {
    if (!user) {
      return { hasAccess: false, reason: 'يرجى تسجيل الدخول' };
    }

    if (user.role === 'admin') {
      return { hasAccess: true };
    }

    if (!subscription) {
      return { hasAccess: false, reason: 'يرجى الاشتراك في باقة' };
    }

    if (subscription.status !== 'active') {
      return { hasAccess: false, reason: 'اشتراكك منتهي' };
    }

    const limit = subscription.limits?.[quotaType];
    if (limit === -1) {
      return { hasAccess: true, remainingQuota: -1, totalQuota: -1 };
    }

    if (currentUsage >= limit) {
      return { 
        hasAccess: false, 
        reason: `وصلت للحد الأقصى (${limit})`,
        remainingQuota: 0,
        totalQuota: limit
      };
    }

    return { 
      hasAccess: true, 
      remainingQuota: limit - currentUsage,
      totalQuota: limit
    };
  };

  /**
   * فحص وتوجيه مع رسائل واضحة
   */
  const requirePermission = (
    permissionId: string, 
    onDenied?: () => void,
    featureName?: string
  ): boolean => {
    const check = checkPermission(permissionId);
    
    if (!check.hasAccess) {
      alert(check.reason || `لا يمكنك الوصول إلى ${featureName || 'هذه الميزة'}`);
      
      if (onDenied) {
        onDenied();
      } else if (check.reason?.includes('اشتراك')) {
        router.push('/subscriptions');
      } else if (check.reason?.includes('تسجيل')) {
        router.push('/login');
      }
      
      return false;
    }

    return true;
  };

  /**
   * فحص الحد مع التوجيه
   */
  const requireQuota = (
    quotaType: 'properties' | 'units' | 'bookings' | 'users',
    currentUsage: number,
    featureName?: string
  ): boolean => {
    const check = checkQuota(quotaType, currentUsage);
    
    if (!check.hasAccess) {
      const quotaName = quotaType === 'properties' ? 'العقارات' :
                        quotaType === 'units' ? 'الوحدات' :
                        quotaType === 'bookings' ? 'الحجوزات' : 'المستخدمين';
      
      alert(`${check.reason}\nيرجى ترقية باقتك للحصول على مزيد من ${quotaName}`);
      router.push('/subscriptions');
      return false;
    }

    return true;
  };

  /**
   * فحص متعدد - صلاحية + حد
   */
  const canAccess = (config: {
    permissionId?: string;
    quotaType?: 'properties' | 'units' | 'bookings' | 'users';
    currentUsage?: number;
    featureName: string;
  }): PermissionCheck => {
    // فحص الصلاحية أولاً
    if (config.permissionId) {
      const permCheck = checkPermission(config.permissionId);
      if (!permCheck.hasAccess) return permCheck;
    }

    // فحص الحد إذا كان مطلوب
    if (config.quotaType !== undefined && config.currentUsage !== undefined) {
      const quotaCheck = checkQuota(config.quotaType, config.currentUsage);
      if (!quotaCheck.hasAccess) return quotaCheck;
      return quotaCheck;
    }

    return { hasAccess: true };
  };

  return {
    user,
    subscription,
    loading,
    checkPermission,
    checkQuota,
    requirePermission,
    requireQuota,
    canAccess,
    isAdmin: user?.role === 'admin',
    hasActiveSubscription: subscription?.status === 'active',
  };
}

