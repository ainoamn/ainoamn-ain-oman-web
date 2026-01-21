// src/pages/dashboard/index.tsx - نظام التوجيه التلقائي للوحات التحكم
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function DashboardRouter() {
  const router = useRouter();
  // إلغاء صفحة /dashboard نهائياً وتحويلها إلى /profile
  useEffect(() => {
    router.replace('/profile');
  }, [router]);

  return null;
}
