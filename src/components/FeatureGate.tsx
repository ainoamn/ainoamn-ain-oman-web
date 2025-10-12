// src/components/FeatureGate.tsx
// مكون للتحكم في عرض المحتوى بناءً على الصلاحيات والاشتراك

import React, { ReactNode } from 'react';
import { useSubscription, useFeature } from '@/context/SubscriptionContext';
import { FiLock, FiAlertCircle, FiZap } from 'react-icons/fi';
import InstantLink from '@/components/InstantLink';

interface FeatureGateProps {
  feature: string; // e.g., 'tasks', 'calendar', 'bookings'
  children: ReactNode;
  fallback?: ReactNode; // محتوى بديل إذا لم تكن الميزة متاحة
  showUpgrade?: boolean; // عرض رسالة الترقية
  mode?: 'hide' | 'disable' | 'lock'; // hide: إخفاء, disable: تعطيل, lock: قفل مع رسالة
}

export default function FeatureGate({ 
  feature, 
  children, 
  fallback, 
  showUpgrade = true,
  mode = 'hide'
}: FeatureGateProps) {
  const { allowed, details, loading } = useFeature(feature);

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-100 rounded-lg p-4">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  // إذا كانت الميزة متاحة، عرض المحتوى
  if (allowed) {
    return <>{children}</>;
  }

  // إذا كان هناك محتوى بديل، عرضه
  if (fallback) {
    return <>{fallback}</>;
  }

  // حسب وضع العرض
  if (mode === 'hide') {
    // إخفاء المحتوى تماماً
    return null;
  }

  if (mode === 'disable') {
    // عرض المحتوى لكن معطل
    return (
      <div className="relative">
        <div className="pointer-events-none opacity-40 filter grayscale">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg">
          <div className="text-center p-4">
            <FiLock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">ميزة غير متاحة في باقتك</p>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'lock') {
    // عرض رسالة القفل بدلاً من المحتوى
    if (showUpgrade) {
      return (
        <LockedFeatureCard 
          feature={feature} 
          reason={details.reason || 'هذه الميزة غير متاحة في باقتك الحالية'} 
        />
      );
    }

    return (
      <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 text-center">
        <FiLock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 font-medium">{details.reason || 'ميزة غير متاحة'}</p>
      </div>
    );
  }

  return null;
}

// مكون بطاقة الميزة المقفلة مع دعوة للترقية
function LockedFeatureCard({ feature, reason }: { feature: string; reason: string }) {
  const { plan } = useSubscription();

  const featureNames: { [key: string]: { ar: string; icon: string } } = {
    tasks: { ar: 'المهام', icon: '✅' },
    calendar: { ar: 'التقويم', icon: '📅' },
    bookings: { ar: 'الحجوزات', icon: '🏠' },
    properties: { ar: 'العقارات', icon: '🏢' },
    analytics: { ar: 'التحليلات', icon: '📊' },
    legal: { ar: 'الشؤون القانونية', icon: '⚖️' },
    reports: { ar: 'التقارير', icon: '📈' },
    auctions: { ar: 'المزادات', icon: '🔨' },
    ai: { ar: 'الذكاء الاصطناعي', icon: '🤖' }
  };

  const featureName = featureNames[feature] || { ar: 'هذه الميزة', icon: '🔒' };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-2 border-blue-200 rounded-2xl p-8 text-center shadow-lg">
      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
        <FiLock className="w-10 h-10 text-white" />
      </div>
      
      <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
        <span>{featureName.icon}</span>
        <span>{featureName.ar}</span>
        <span>مقفلة</span>
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {reason}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <InstantLink
          href="/subscriptions"
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-2xl font-bold transform hover:scale-105 transition-all inline-flex items-center justify-center gap-2"
        >
          <FiZap className="w-5 h-5" />
          <span>الترقية الآن</span>
        </InstantLink>
        
        <InstantLink
          href="/subscriptions#compare"
          className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-bold transition-all inline-flex items-center justify-center gap-2"
        >
          <span>مقارنة الباقات</span>
        </InstantLink>
      </div>

      {plan && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            باقتك الحالية: <span className="font-bold text-gray-900">{plan.nameAr}</span>
          </p>
        </div>
      )}
    </div>
  );
}

// مكون للتحقق من الصلاحيات (بدلاً من الميزات)
interface PermissionGateProps {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
  mode?: 'hide' | 'show-locked';
}

export function PermissionGate({ 
  permission, 
  children, 
  fallback, 
  mode = 'hide' 
}: PermissionGateProps) {
  const { hasPermission, loading } = useSubscription();

  if (loading) {
    return null;
  }

  const allowed = hasPermission(permission);

  if (allowed) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (mode === 'show-locked') {
    return (
      <div className="relative">
        <div className="pointer-events-none opacity-30">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <FiLock className="w-6 h-6 text-gray-400" />
        </div>
      </div>
    );
  }

  return null;
}

// Hook مخصص لإظهار/إخفاء عناصر في القوائم
export function useFeatureVisibility(feature: string) {
  const { allowed } = useFeature(feature);
  return allowed;
}

// مكون Badge للميزات المتاحة فقط في الباقات المدفوعة
export function PremiumBadge({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full ${className}`}>
      <FiZap className="w-3 h-3" />
      <span>مميز</span>
    </span>
  );
}

// مكون رسالة الترقية المدمجة
export function UpgradePrompt({ feature }: { feature?: string }) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6 shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xl font-bold mb-1 flex items-center gap-2">
            <FiZap className="w-5 h-5" />
            <span>افتح المزيد من الإمكانيات!</span>
          </h4>
          <p className="text-blue-100 text-sm">
            {feature 
              ? `قم بالترقية للوصول إلى ميزة ${feature} والمزيد`
              : 'قم بالترقية للوصول إلى جميع الميزات المتقدمة'}
          </p>
        </div>
        <InstantLink
          href="/subscriptions"
          className="px-6 py-3 bg-white text-blue-600 rounded-xl hover:shadow-2xl font-bold transform hover:scale-105 transition-all whitespace-nowrap"
        >
          الترقية الآن
        </InstantLink>
      </div>
    </div>
  );
}

