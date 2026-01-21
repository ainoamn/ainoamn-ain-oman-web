// src/pages/dashboard/investor-unified.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ProfessionalDashboardLayout from '@/components/dashboard/ProfessionalDashboardLayout';
import ProfessionalStatsCards from '@/components/dashboard/ProfessionalStatsCards';
import ProfessionalAIPredictions from '@/components/dashboard/ProfessionalAIPredictions';
import { dashboardStatsService } from '@/services/dashboardStats';
import { aiPredictionEngine } from '@/lib/aiPredictions';
import { FiTrendingUp, FiDollarSign, FiRefreshCw } from 'react-icons/fi';

export default function InvestorDashboardUnified() {
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
          aiPredictionEngine.trackPageView(auth.id || '', '/dashboard/investor');
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
      setStats({ investments: { total: 0 }, returns: { total: 0 } });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'الاستثمارات',
      value: stats.investments?.total || 0,
      icon: FiTrendingUp,
      color: 'green' as const,
      loading
    },
    {
      title: 'العوائد',
      value: `${(stats.returns?.total || 0).toLocaleString('ar-OM')} ر.ع`,
      icon: FiDollarSign,
      color: 'teal' as const,
      loading
    }
  ];

  return (
    <ProfessionalDashboardLayout
      title="لوحة تحكم المستثمر"
      description="إدارة استثماراتك وعوائدك"
      gradient="green"
    >
      {userId && <ProfessionalAIPredictions userId={userId} userRole="investor" stats={stats} />}
      <ProfessionalStatsCards stats={statsCards} columns={2} />
    </ProfessionalDashboardLayout>
  );
}
