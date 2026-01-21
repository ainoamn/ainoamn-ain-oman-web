// src/pages/dashboard/customer-unified.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ProfessionalDashboardLayout from '@/components/dashboard/ProfessionalDashboardLayout';
import ProfessionalStatsCards from '@/components/dashboard/ProfessionalStatsCards';
import ProfessionalAIPredictions from '@/components/dashboard/ProfessionalAIPredictions';
import { dashboardStatsService } from '@/services/dashboardStats';
import { aiPredictionEngine } from '@/lib/aiPredictions';
import { FiCalendar, FiHeart, FiRefreshCw, FiSearch } from 'react-icons/fi';

export default function CustomerDashboardUnified() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({});
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const authStr = localStorage.getItem('ain_auth');
        if (authStr) {
          const auth = JSON.parse(authStr);
          setUserId(auth.id || '');
          aiPredictionEngine.trackPageView(auth.id || '', '/dashboard/customer');
        }
      } catch (e) {
        console.error('Error loading user:', e);
      }
    }
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // Customer stats logic here
      setStats({ bookings: { total: 0 }, favorites: { total: 0 } });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'حجوزاتي',
      value: stats.bookings?.total || 0,
      icon: FiCalendar,
      color: 'blue' as const,
      loading
    },
    {
      title: 'المفضلة',
      value: stats.favorites?.total || 0,
      icon: FiHeart,
      color: 'pink' as const,
      loading
    }
  ];

  return (
    <ProfessionalDashboardLayout
      title="لوحة تحكم العميل"
      description="إدارة حجوزاتك وعقاراتك المفضلة"
      gradient="orange"
    >
      {userId && <ProfessionalAIPredictions userId={userId} userRole="customer" stats={stats} />}
      <ProfessionalStatsCards stats={statsCards} columns={2} />
    </ProfessionalDashboardLayout>
  );
}
