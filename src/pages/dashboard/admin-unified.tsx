// src/pages/dashboard/admin-unified.tsx
// لوحة تحكم الإدارة الموحدة مع إحصائيات حقيقية وتنبؤات ذكية
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import ProfessionalDashboardLayout from '@/components/dashboard/ProfessionalDashboardLayout';
import ProfessionalStatsCards from '@/components/dashboard/ProfessionalStatsCards';
import ProfessionalAIPredictions from '@/components/dashboard/ProfessionalAIPredictions';
import { dashboardStatsService, DashboardStats } from '@/services/dashboardStats';
import { 
  FiUsers, FiHome, FiCalendar, FiDollarSign, 
  FiActivity, FiRefreshCw, FiBell, FiUser,
  FiSettings, FiTrendingUp
} from 'react-icons/fi';

export default function AdminDashboardUnified() {
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
      const data = await dashboardStatsService.getAdminStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'إجمالي المستخدمين',
      value: stats.users?.total || 0,
      change: stats.users?.growth,
      changeLabel: 'هذا الشهر',
      icon: FiUsers,
      color: 'blue' as const,
      trend: stats.users?.growth && stats.users.growth > 0 ? 'up' : 'stable',
      details: [
        { label: 'نشط', value: stats.users?.active || 0 },
        { label: 'جديد', value: `+${stats.users?.new || 0}`, color: 'text-emerald-600' }
      ],
      actionButton: {
        label: 'إدارة المستخدمين',
        onClick: () => router.push('/admin/users')
      }
    },
    {
      title: 'إجمالي العقارات',
      value: stats.properties?.total || 0,
      change: stats.properties?.growth,
      changeLabel: 'هذا الشهر',
      icon: FiHome,
      color: 'green' as const,
      trend: stats.properties?.growth && stats.properties.growth > 0 ? 'up' : 'stable',
      details: [
        { label: 'نشط', value: stats.properties?.active || 0 },
        { label: 'معلق', value: stats.properties?.pending || 0, color: 'text-yellow-600' }
      ],
      actionButton: {
        label: 'إدارة العقارات',
        onClick: () => router.push('/properties/unified-management')
      }
    },
    {
      title: 'إجمالي الحجوزات',
      value: stats.bookings?.total || 0,
      change: stats.bookings?.growth,
      changeLabel: 'هذا الشهر',
      icon: FiCalendar,
      color: 'purple' as const,
      trend: stats.bookings?.growth && stats.bookings.growth > 0 ? 'up' : 'stable',
      details: [
        { label: 'اليوم', value: stats.bookings?.today || 0 },
        { label: 'معلق', value: stats.bookings?.pending || 0, color: 'text-orange-600' }
      ],
      actionButton: {
        label: 'إدارة الحجوزات',
        onClick: () => router.push('/admin/bookings')
      }
    },
    {
      title: 'الإيرادات الشهرية',
      value: `${(stats.revenue?.monthly || 0).toLocaleString('ar-OM')} ر.ع`,
      change: stats.revenue?.growth,
      changeLabel: 'هذا الشهر',
      icon: FiDollarSign,
      color: 'yellow' as const,
      trend: stats.revenue?.growth && stats.revenue.growth > 0 ? 'up' : 'stable',
      details: [
        { label: 'إجمالي', value: `${(stats.revenue?.total || 0).toLocaleString('ar-OM')} ر.ع` },
        { label: 'معلق', value: `${(stats.revenue?.pending || 0).toLocaleString('ar-OM')} ر.ع`, color: 'text-yellow-600' }
      ],
      actionButton: {
        label: 'عرض التقارير',
        onClick: () => router.push('/admin/financial/reports')
      }
    },
    {
      title: 'المهام المتأخرة',
      value: stats.tasks?.overdue || 0,
      icon: FiActivity,
      color: 'red' as const,
      trend: (stats.tasks?.overdue || 0) > 0 ? 'down' : 'stable',
      actionButton: {
        label: 'عرض المهام',
        onClick: () => router.push('/admin/tasks')
      }
    },
    {
      title: 'المهام المعلقة',
      value: stats.tasks?.pending || 0,
      icon: FiSettings,
      color: 'indigo' as const,
      details: [
        { label: 'إجمالي', value: stats.tasks?.total || 0 },
        { label: 'مكتملة', value: stats.tasks?.completed || 0, color: 'text-emerald-600' }
      ],
      actionButton: {
        label: 'إدارة المهام',
        onClick: () => router.push('/admin/tasks')
      }
    }
  ];

  const headerActions = (
    <>
      <button
        onClick={fetchStats}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        title="تحديث"
      >
        <FiRefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
      </button>
      <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
        <FiBell className="w-5 h-5" />
        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
      </button>
      <button
        onClick={() => router.push('/profile')}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <FiUser className="w-4 h-4" />
        <span className="hidden sm:inline">البروفايل</span>
      </button>
    </>
  );

  return (
    <ProfessionalDashboardLayout
      title="لوحة تحكم الإدارة"
      description="إدارة شاملة لجميع أنظمة الموقع"
      headerActions={headerActions}
      gradient="blue"
    >
      {/* التنبؤات الذكية */}
      {userId && (
        <ProfessionalAIPredictions
          userId={userId}
          userRole="admin"
          stats={stats}
        />
      )}

      {/* بطاقات الإحصائيات */}
      <ProfessionalStatsCards stats={statsCards} columns={4} />

      {/* إحصائيات إضافية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* تفاصيل المستخدمين */}
        <div className="relative overflow-hidden rounded-xl bg-white/80 backdrop-blur-xl border border-white/20 shadow-md shadow-black/5 p-4">
          <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FiUsers className="text-blue-600 w-4 h-4" />
            تفاصيل المستخدمين
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">المستخدمون النشطون</span>
              <span className="text-sm font-semibold text-gray-900">
                {stats.users?.active || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">مستخدمون جدد</span>
              <span className="text-sm font-semibold text-green-600">
                +{stats.users?.new || 0}
              </span>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/admin/users')}
              className="w-full mt-3 py-2 px-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all text-xs font-semibold shadow-sm hover:shadow-md"
            >
              إدارة المستخدمين
            </motion.button>
          </div>
        </div>

        {/* تفاصيل المهام */}
        <div className="relative overflow-hidden rounded-xl bg-white/80 backdrop-blur-xl border border-white/20 shadow-md shadow-black/5 p-4">
          <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FiActivity className="text-indigo-600 w-4 h-4" />
            تفاصيل المهام
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">إجمالي المهام</span>
              <span className="text-sm font-semibold text-gray-900">
                {stats.tasks?.total || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">مكتملة</span>
              <span className="text-sm font-semibold text-green-600">
                {stats.tasks?.completed || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">معلقة</span>
              <span className="text-sm font-semibold text-yellow-600">
                {stats.tasks?.pending || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">متأخرة</span>
              <span className={`text-sm font-semibold ${
                (stats.tasks?.overdue || 0) > 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {stats.tasks?.overdue || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* إجراءات سريعة */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="relative overflow-hidden rounded-xl bg-white/80 backdrop-blur-xl border border-white/20 shadow-md shadow-black/5 p-4"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FiSettings className="text-indigo-600 w-5 h-5" />
          إجراءات سريعة
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/admin/users')}
            className="group relative overflow-hidden p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg hover:from-blue-100 hover:to-cyan-100 transition-all text-center border border-blue-200/50 shadow-sm hover:shadow-md"
          >
            <FiUsers className="w-5 h-5 text-blue-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-blue-800 block">المستخدمون</span>
            <span className="text-[10px] text-blue-600 mt-0.5 block">إدارة المستخدمين</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/properties/unified-management')}
            className="group relative overflow-hidden p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg hover:from-green-100 hover:to-emerald-100 transition-all text-center border border-green-200/50 shadow-sm hover:shadow-md"
          >
            <FiHome className="w-5 h-5 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-green-800 block">العقارات</span>
            <span className="text-[10px] text-green-600 mt-0.5 block">إدارة العقارات</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/admin/bookings')}
            className="group relative overflow-hidden p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg hover:from-purple-100 hover:to-pink-100 transition-all text-center border border-purple-200/50 shadow-sm hover:shadow-md"
          >
            <FiCalendar className="w-5 h-5 text-purple-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-purple-800 block">الحجوزات</span>
            <span className="text-[10px] text-purple-600 mt-0.5 block">إدارة الحجوزات</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/admin/settings')}
            className="group relative overflow-hidden p-4 bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg hover:from-gray-100 hover:to-slate-100 transition-all text-center border border-gray-200/50 shadow-sm hover:shadow-md"
          >
            <FiSettings className="w-5 h-5 text-gray-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-gray-800 block">الإعدادات</span>
            <span className="text-[10px] text-gray-600 mt-0.5 block">إعدادات النظام</span>
          </motion.button>
        </div>
      </motion.div>
    </ProfessionalDashboardLayout>
  );
}
