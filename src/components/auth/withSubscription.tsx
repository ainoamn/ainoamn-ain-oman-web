// @ts-nocheck
// src/components/auth/withSubscription.tsx
import React from "react";
import { useAuth, hasPermission, type CurrentUser, type Permission } from "@/lib/auth";
import InstantLink from '@/components/InstantLink';

export default function withSubscription<P extends object>(
  Component: React.ComponentType<P>,
  required: (Permission | string)[] = []
) {
  return function Guarded(props: P) {
    const { user } = useAuth();
  const allowed = required.every((p) => hasPermission(user, p as unknown as Permission));

    if (!allowed) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="max-w-lg w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">الاشتراك مطلوب</h2>
            <p className="text-slate-600 mb-6">
              تحتاج إلى ترقية اشتراكك أو تفعيل صلاحية عرض المزادات للوصول إلى هذه الصفحة.
            </p>
            <InstantLink href="/subscriptions" className="inline-flex items-center justify-center rounded-xl bg-teal-600 px-5 py-3 font-semibold text-white hover:bg-teal-700">
              عرض الباقات والاشتراك
            </InstantLink>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}
