// src/components/ProtectedRoute.tsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { FiLock, FiAlertCircle, FiArrowRight, FiShield } from 'react-icons/fi';
import InstantLink from './InstantLink';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string | string[];
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({ 
  children, 
  requiredPermission,
  fallback 
}: ProtectedRouteProps) {
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [userName, setUserName] = useState('');
  const [userPlan, setUserPlan] = useState<string | null>(null);

  useEffect(() => {
    checkPermissions();
  }, [requiredPermission, router.pathname]);

  const checkPermissions = () => {
    try {
      const authData = localStorage.getItem('ain_auth');
      
      if (!authData) {
        setHasAccess(false);
        return;
      }

      const userData = JSON.parse(authData);
      setUserName(userData.name || 'مستخدم');
      setUserPlan(userData.subscription?.plan || null);
      
      // جلب صلاحيات المستخدم
      const permissions = userData.permissions || [];
      setUserPermissions(permissions);

      // إذا لم يتم تحديد صلاحيات مطلوبة، السماح بالوصول
      if (!requiredPermission) {
        setHasAccess(true);
        return;
      }

      // إذا كان لدى المستخدم صلاحية '*' (الكل)
      if (permissions.includes('*') || permissions.includes('all')) {
        setHasAccess(true);
        return;
      }

      // التحقق من الصلاحيات المطلوبة
      if (Array.isArray(requiredPermission)) {
        // يحتاج أي صلاحية من القائمة
        const hasAny = requiredPermission.some(perm => permissions.includes(perm));
        setHasAccess(hasAny);
      } else {
        // يحتاج صلاحية واحدة محددة
        setHasAccess(permissions.includes(requiredPermission));
      }

    } catch (error) {
      console.error('Error checking permissions:', error);
      setHasAccess(false);
    }
  };

  // جاري التحميل
  if (hasAccess === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  // لديه صلاحية الوصول
  if (hasAccess) {
    return <>{children}</>;
  }

  // ليس لديه صلاحية - عرض رسالة
  if (fallback) {
    return <>{fallback}</>;
  }

  // رسالة الرفض الافتراضية
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-red-200">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <FiLock className="w-10 h-10 text-red-600" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-4">
            ⛔ غير مصرّح بالدخول
          </h1>

          {/* Message */}
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-3">
              <FiAlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <p className="text-gray-800 font-medium mb-2">
                  عزيزي/عزيزتي <span className="font-bold text-blue-600">{userName}</span>
                </p>
                <p className="text-gray-700 mb-3">
                  للأسف، ليس لديك صلاحية الوصول إلى هذه الصفحة.
                </p>
                <p className="text-gray-600 text-sm">
                  الصلاحية المطلوبة: <span className="font-mono bg-red-100 px-2 py-1 rounded">
                    {Array.isArray(requiredPermission) ? requiredPermission.join(' أو ') : requiredPermission}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Subscription Info */}
          {userPlan && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <FiShield className="w-5 h-5 text-blue-600" />
                <p className="font-medium text-gray-800">باقتك الحالية:</p>
              </div>
              <p className="text-blue-600 font-bold text-lg">
                {userPlan === 'basic' && 'الباقة الأساسية'}
                {userPlan === 'professional' && 'الباقة الاحترافية'}
                {userPlan === 'premium' && 'الباقة المميزة'}
                {userPlan === 'enterprise' && 'باقة الشركات'}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ترقية الباقة */}
            {userPlan !== 'enterprise' && (
              <InstantLink
                href="/subscriptions"
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all shadow-lg"
              >
                <FiShield className="w-5 h-5" />
                ترقية الباقة
              </InstantLink>
            )}

            {/* التواصل مع الإدارة */}
            <InstantLink
              href="/contact"
              className="flex items-center justify-center gap-2 bg-white border-2 border-gray-300 text-gray-700 px-6 py-4 rounded-xl font-bold hover:bg-gray-50 transform hover:scale-105 transition-all"
            >
              <FiAlertCircle className="w-5 h-5" />
              التواصل مع الإدارة
            </InstantLink>
          </div>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <InstantLink
              href="/"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <FiArrowRight className="w-4 h-4" />
              العودة للرئيسية
            </InstantLink>
          </div>

          {/* Debug Info (Development Only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <details className="text-xs text-gray-500">
                <summary className="cursor-pointer hover:text-gray-700 font-medium mb-2">
                  🔧 معلومات التطوير
                </summary>
                <div className="bg-gray-50 p-3 rounded-lg mt-2 space-y-2">
                  <p><strong>الصلاحيات الحالية:</strong></p>
                  <pre className="bg-white p-2 rounded border text-[10px] overflow-x-auto">
                    {JSON.stringify(userPermissions, null, 2)}
                  </pre>
                  <p><strong>الصلاحيات المطلوبة:</strong></p>
                  <pre className="bg-white p-2 rounded border text-[10px]">
                    {JSON.stringify(requiredPermission, null, 2)}
                  </pre>
                </div>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

