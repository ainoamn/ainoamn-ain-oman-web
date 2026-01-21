// src/pages/dashboard/agency-unified.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ProfessionalDashboardLayout from '@/components/dashboard/ProfessionalDashboardLayout';
import ProfessionalStatsCards from '@/components/dashboard/ProfessionalStatsCards';
import ProfessionalAIPredictions from '@/components/dashboard/ProfessionalAIPredictions';
import { dashboardStatsService } from '@/services/dashboardStats';
import { aiPredictionEngine } from '@/lib/aiPredictions';
import { FiUsers, FiHome, FiRefreshCw } from 'react-icons/fi';

export default function AgencyDashboardUnified() {
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
          aiPredictionEngine.trackPageView(auth.id || '', '/dashboard/agency');
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
      title: 'العقارات',
      value: stats.properties?.total || 0,
      icon: FiHome,
      color: 'blue' as const,
      loading
    },
    {
      title: 'العملاء',
      value: stats.users?.total || 0,
      icon: FiUsers,
      color: 'purple' as const,
      loading
    }
  ];

  return (
    <ProfessionalDashboardLayout
      title="لوحة تحكم الوكالة"
      description="إدارة وكالتك العقارية"
      gradient="blue"
    >
      {userId && <ProfessionalAIPredictions userId={userId} userRole="agent" stats={stats} />}
      <ProfessionalStatsCards stats={statsCards} columns={2} />
    </ProfessionalDashboardLayout>
  );
}
