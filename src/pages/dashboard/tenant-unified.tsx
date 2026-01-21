// src/pages/dashboard/tenant-unified.tsx
// لوحة تحكم المستأجر الموحدة مع إحصائيات حقيقية وتنبؤات ذكية
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import ProfessionalDashboardLayout from '@/components/dashboard/ProfessionalDashboardLayout';
import ProfessionalStatsCards from '@/components/dashboard/ProfessionalStatsCards';
import ProfessionalAIPredictions from '@/components/dashboard/ProfessionalAIPredictions';
import { dashboardStatsService, DashboardStats } from '@/services/dashboardStats';
import { aiPredictionEngine } from '@/lib/aiPredictions';
import { 
  FiFileText, FiCalendar, FiDollarSign, 
  FiRefreshCw, FiHome, FiClock
} from 'react-icons/fi';

export default function TenantDashboardUnified() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({});
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    // الحصول على userId
    if (typeof window !== 'undefined') {
      try {
        const authStr = localStorage.getItem('ain_auth');
        if (authStr) {
          const auth = JSON.parse(authStr);
          setUserId(auth.id || '');
          
          // تتبع عرض الصفحة
          aiPredictionEngine.trackPageView(auth.id || '', '/dashboard/tenant');
        }
      } catch (e) {
        console.error('Error loading user:', e);
      }
    }

    fetchStats();
    
    // تحديث الإحصائيات كل 30 ثانية
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await dashboardStatsService.getTenantStats(userId);
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'عقودي النشطة',
      value: stats.rentals?.active || 0,
      icon: FiFileText,
      color: 'blue' as const,
      loading
    },
    {
      title: 'إجمالي العقود',
      value: stats.rentals?.total || 0,
      icon: FiFileText,
      color: 'purple' as const,
      loading
    },
    {
      title: 'عقود تنتهي قريباً',
      value: stats.rentals?.expiringSoon || 0,
      icon: FiClock,
      color: 'yellow' as const,
      loading
    }
  ];

  const headerActions = (
    <button
      onClick={fetchStats}
      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
      title="تحديث"
    >
      <FiRefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
    </button>
  );

  return (
    <ProfessionalDashboardLayout
      title="لوحة تحكم المستأجر"
      description="إدارة عقودك وحجوزاتك"
      headerActions={headerActions}
      gradient="purple"
    >
      {/* التنبؤات الذكية */}
      {userId && (
        <ProfessionalAIPredictions
          userId={userId}
          userRole="tenant"
          stats={stats}
        />
      )}

      {/* بطاقات الإحصائيات */}
      <ProfessionalStatsCards stats={statsCards} columns={3} />

      {/* التبويبات */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative overflow-hidden rounded-xl bg-white/80 backdrop-blur-xl border border-white/20 shadow-md shadow-black/5 p-4 mb-6"
      >
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'contracts', name: 'عقودي', icon: FiFileText, href: '/dashboard/tenant?tab=contracts' },
            { id: 'payments', name: 'المدفوعات', icon: FiDollarSign, href: '/dashboard/tenant?tab=payments' },
            { id: 'properties', name: 'تصفح العقارات', icon: FiHome, href: '/properties' }
          ].map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push(tab.href)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-purple-50 hover:to-pink-50 rounded-lg border border-gray-200 hover:border-purple-300 transition-all text-xs font-medium text-gray-700 hover:text-purple-700 shadow-sm hover:shadow"
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* تفاصيل العقد */}
      {stats.rentals && stats.rentals.total > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative overflow-hidden rounded-xl bg-white/80 backdrop-blur-xl border border-white/20 shadow-md shadow-black/5 p-4 mb-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FiFileText className="text-blue-600" />
            تفاصيل العقد
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">العقود النشطة</span>
              <span className="text-lg font-semibold text-green-600">
                {stats.rentals.active || 0}
              </span>
            </div>
            {stats.rentals.expiringSoon && stats.rentals.expiringSoon > 0 && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">عقود تنتهي قريباً</span>
                  <span className="text-lg font-semibold text-yellow-600">
                    {stats.rentals.expiringSoon}
                  </span>
                </div>
                {stats.rentals.daysUntilExpiry && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">أيام حتى انتهاء العقد</span>
                    <span className="text-lg font-semibold text-red-600">
                      {stats.rentals.daysUntilExpiry} يوم
                    </span>
                  </div>
                )}
              </>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/dashboard/tenant?tab=contracts')}
              className="w-full mt-3 py-2 px-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all text-xs font-semibold shadow-sm hover:shadow-md"
            >
              عرض جميع العقود
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* إجراءات سريعة */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="relative overflow-hidden rounded-xl bg-white/80 backdrop-blur-xl border border-white/20 shadow-md shadow-black/5 p-4"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FiFileText className="text-purple-600 w-5 h-5" />
          إجراءات سريعة
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/dashboard/tenant?tab=contracts')}
            className="group relative overflow-hidden p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg hover:from-blue-100 hover:to-cyan-100 transition-all text-center border border-blue-200/50 shadow-sm hover:shadow-md"
          >
            <FiFileText className="w-5 h-5 text-blue-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-blue-800 block">عقودي</span>
            <span className="text-[10px] text-blue-600 mt-0.5 block">جميع العقود</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/properties')}
            className="group relative overflow-hidden p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg hover:from-green-100 hover:to-emerald-100 transition-all text-center border border-green-200/50 shadow-sm hover:shadow-md"
          >
            <FiHome className="w-5 h-5 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-green-800 block">تصفح العقارات</span>
            <span className="text-[10px] text-green-600 mt-0.5 block">عقارات متاحة</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/dashboard/tenant?tab=payments')}
            className="group relative overflow-hidden p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg hover:from-purple-100 hover:to-pink-100 transition-all text-center border border-purple-200/50 shadow-sm hover:shadow-md"
          >
            <FiDollarSign className="w-5 h-5 text-purple-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-purple-800 block">المدفوعات</span>
            <span className="text-[10px] text-purple-600 mt-0.5 block">سجل المدفوعات</span>
          </motion.button>
        </div>
      </motion.div>
    </ProfessionalDashboardLayout>
  );
}
