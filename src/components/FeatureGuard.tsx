import { ReactNode } from 'react';
import { useRouter } from 'next/router';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { FiLock, FiArrowRight } from 'react-icons/fi';

interface FeatureGuardProps {
  featureId: string;
  children: ReactNode;
  mode?: 'hide' | 'lock' | 'disable';
  fallback?: ReactNode;
  showUpgrade?: boolean;
}

/**
 * مكون لحماية الميزات بناءً على الباقة
 * @param featureId - معرف الميزة
 * @param children - المحتوى المحمي
 * @param mode - طريقة العرض (hide, lock, disable)
 * @param fallback - محتوى بديل
 * @param showUpgrade - عرض زر الترقية
 */
export default function FeatureGuard({
  featureId,
  children,
  mode = 'lock',
  fallback,
  showUpgrade = true
}: FeatureGuardProps) {
  const router = useRouter();
  const { hasAccess, isLoading, requiredPlan, featureNameAr, upgradeUrl } = useFeatureAccess(featureId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // إذا كان لديه صلاحية، عرض المحتوى
  if (hasAccess) {
    return <>{children}</>;
  }

  // إخفاء كامل
  if (mode === 'hide') {
    return fallback ? <>{fallback}</> : null;
  }

  // قفل مع رسالة
  if (mode === 'lock') {
    return (
      <div className="relative">
        {/* محتوى مطموس */}
        <div className="filter blur-sm opacity-50 pointer-events-none select-none">
          {children}
        </div>

        {/* رسالة القفل */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center border-2 border-gray-100">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiLock className="w-8 h-8 text-white" />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              ميزة مقفلة 🔒
            </h3>
            
            <p className="text-gray-600 mb-4">
              {featureNameAr} متاحة في باقة <span className="font-bold text-green-600">{getPlanNameAr(requiredPlan)}</span> وأعلى
            </p>

            {showUpgrade && (
              <button
                onClick={() => router.push(upgradeUrl)}
                className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:from-green-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2 mx-auto"
              >
                ترقية الباقة الآن
                <FiArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // تعطيل (Disabled)
  if (mode === 'disable') {
    return (
      <div className="relative opacity-50 cursor-not-allowed">
        <div className="pointer-events-none">{children}</div>
        {showUpgrade && (
          <div className="absolute top-2 right-2">
            <button
              onClick={() => router.push(upgradeUrl)}
              className="bg-yellow-500 text-white px-3 py-1 rounded-lg text-sm font-bold hover:bg-yellow-600 transition-colors flex items-center gap-1"
            >
              <FiLock className="w-3 h-3" />
              ترقية
            </button>
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * مكون بسيط لعرض شارة "مميز"
 */
export function PremiumBadge({ plan }: { plan: string }) {
  return (
    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
      <FiLock className="w-3 h-3" />
      {getPlanNameAr(plan)}
    </span>
  );
}

/**
 * مكون لعرض رسالة ترقية بسيطة
 */
export function UpgradePrompt({ featureId }: { featureId: string }) {
  const router = useRouter();
  const { requiredPlan, featureNameAr } = useFeatureAccess(featureId);

  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-4 mb-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <FiLock className="w-6 h-6 text-orange-600" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-gray-900 mb-1">
            {featureNameAr} - ميزة مميزة
          </h4>
          <p className="text-sm text-gray-600 mb-3">
            هذه الميزة متاحة في باقة {getPlanNameAr(requiredPlan)} وأعلى
          </p>
          <button
            onClick={() => router.push('/subscriptions')}
            className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:from-green-700 hover:to-blue-700 transition-all inline-flex items-center gap-2"
          >
            اكتشف الباقات
            <FiArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// دالة مساعدة للحصول على اسم الباقة بالعربية
function getPlanNameAr(planId: string): string {
  const names: Record<string, string> = {
    basic: 'الأساسية',
    standard: 'المعيارية',
    premium: 'المميزة',
    enterprise: 'المؤسسية'
  };
  return names[planId] || 'المميزة';
}

