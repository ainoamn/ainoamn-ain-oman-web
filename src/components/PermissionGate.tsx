// src/components/PermissionGate.tsx - بوابة فحص الصلاحيات
import { ReactNode } from 'react';
import { useRouter } from 'next/router';
import { usePermissions } from '@/hooks/usePermissions';
import { FiLock, FiAlertCircle } from 'react-icons/fi';

interface PermissionGateProps {
  children: ReactNode;
  permissionId?: string;
  quotaType?: 'properties' | 'units' | 'bookings' | 'users';
  currentUsage?: number;
  featureName: string;
  showUpgradeButton?: boolean;
  fallback?: ReactNode;
}

export default function PermissionGate({
  children,
  permissionId,
  quotaType,
  currentUsage = 0,
  featureName,
  showUpgradeButton = true,
  fallback
}: PermissionGateProps) {
  const router = useRouter();
  const { canAccess } = usePermissions();

  const accessCheck = canAccess({
    permissionId,
    quotaType,
    currentUsage,
    featureName
  });

  if (accessCheck.hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-8 text-center">
      <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <FiLock className="w-10 h-10 text-yellow-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        🔒 {featureName} مقفل
      </h3>
      <p className="text-gray-700 mb-6">
        {accessCheck.reason || 'هذه الميزة غير متاحة في باقتك الحالية'}
      </p>
      {showUpgradeButton && (
        <button
          onClick={() => router.push('/subscriptions')}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all font-bold"
        >
          ⬆️ ترقية الباقة
        </button>
      )}
    </div>
  );
}

// Simplified version for inline use
export function FeatureLock({ featureName, reason }: { featureName: string; reason?: string }) {
  const router = useRouter();
  
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <FiAlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="font-semibold text-yellow-900 mb-1">
            🔒 {featureName}
          </div>
          <div className="text-sm text-yellow-800 mb-3">
            {reason || 'هذه الميزة غير متاحة في باقتك'}
          </div>
          <button
            onClick={() => router.push('/subscriptions')}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm font-medium"
          >
            ترقية الباقة
          </button>
        </div>
      </div>
    </div>
  );
}

