// src/pages/dashboard/hoa-unified.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ProfessionalDashboardLayout from '@/components/dashboard/ProfessionalDashboardLayout';
import ProfessionalStatsCards from '@/components/dashboard/ProfessionalStatsCards';
import ProfessionalAIPredictions from '@/components/dashboard/ProfessionalAIPredictions';
import { dashboardStatsService } from '@/services/dashboardStats';
import { aiPredictionEngine } from '@/lib/aiPredictions';
import { FiHome, FiUsers, FiRefreshCw } from 'react-icons/fi';

export default function HOADashboardUnified() {
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
          aiPredictionEngine.trackPageView(auth.id || '', '/dashboard/hoa');
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
      setStats({ units: { total: 0 }, members: { total: 0 } });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'الوحدات',
      value: stats.units?.total || 0,
      icon: FiHome,
      color: 'teal' as const,
      loading
    },
    {
      title: 'الأعضاء',
      value: stats.members?.total || 0,
      icon: FiUsers,
      color: 'indigo' as const,
      loading
    }
  ];

  return (
    <ProfessionalDashboardLayout
      title="لوحة تحكم الجمعية"
      description="إدارة جمعيتك السكنية"
      gradient="teal"
    >
      {userId && <ProfessionalAIPredictions userId={userId} userRole="hoa" stats={stats} />}
      <ProfessionalStatsCards stats={statsCards} columns={2} />
    </ProfessionalDashboardLayout>
  );
}
