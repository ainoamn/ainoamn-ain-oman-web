// src/pages/dashboard/developer-unified.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ProfessionalDashboardLayout from '@/components/dashboard/ProfessionalDashboardLayout';
import ProfessionalStatsCards from '@/components/dashboard/ProfessionalStatsCards';
import ProfessionalAIPredictions from '@/components/dashboard/ProfessionalAIPredictions';
import { dashboardStatsService } from '@/services/dashboardStats';
import { aiPredictionEngine } from '@/lib/aiPredictions';
import { FiHome, FiTrendingUp, FiRefreshCw } from 'react-icons/fi';

export default function DeveloperDashboardUnified() {
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
          aiPredictionEngine.trackPageView(auth.id || '', '/dashboard/developer');
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
      const data = await dashboardStatsService.getOwnerStats(userId);
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'المشاريع',
      value: stats.properties?.total || 0,
      icon: FiHome,
      color: 'indigo' as const,
      loading
    },
    {
      title: 'المبيعات',
      value: stats.revenue?.total || 0,
      icon: FiTrendingUp,
      color: 'purple' as const,
      loading
    }
  ];

  return (
    <ProfessionalDashboardLayout
      title="لوحة تحكم المطور"
      description="إدارة مشاريعك ومبيعاتك"
      gradient="purple"
    >
      {userId && <ProfessionalAIPredictions userId={userId} userRole="developer" stats={stats} />}
      <ProfessionalStatsCards stats={statsCards} columns={2} />
    </ProfessionalDashboardLayout>
  );
}
