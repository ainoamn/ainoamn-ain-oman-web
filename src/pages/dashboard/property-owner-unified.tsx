// src/pages/dashboard/property-owner-unified.tsx
// لوحة تحكم المالك الموحدة مع إحصائيات حقيقية وتنبؤات ذكية
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import ProfessionalDashboardLayout from '@/components/dashboard/ProfessionalDashboardLayout';
import ProfessionalStatsCards from '@/components/dashboard/ProfessionalStatsCards';
import ProfessionalAIPredictions from '@/components/dashboard/ProfessionalAIPredictions';
import { dashboardStatsService, DashboardStats } from '@/services/dashboardStats';
import { aiPredictionEngine } from '@/lib/aiPredictions';
import { 
  FiHome, FiFileText, FiCalendar, FiDollarSign, 
  FiUsers, FiRefreshCw, FiPlus, FiTrendingUp
} from 'react-icons/fi';

export default function PropertyOwnerDashboardUnified() {
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
          aiPredictionEngine.trackPageView(auth.id || '', '/dashboard/property-owner');
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
      title: 'إجمالي العقارات',
      value: stats.properties?.total || 0,
      icon: FiHome,
      color: 'blue' as const,
      loading,
      details: [
        { label: 'نشط', value: stats.properties?.active || 0 },
        { label: 'معلق', value: stats.properties?.pending || 0, color: 'text-yellow-600' }
      ],
      actionButton: {
        label: 'إدارة العقارات',
        onClick: () => router.push('/dashboard/property-owner?tab=properties')
      }
    },
    {
      title: 'العقود النشطة',
      value: stats.rentals?.active || 0,
      icon: FiFileText,
      color: 'purple' as const,
      loading,
      details: [
        { label: 'إجمالي', value: stats.rentals?.total || 0 },
        { label: 'تنتهي قريباً', value: stats.rentals?.expiringSoon || 0, color: 'text-yellow-600' }
      ],
      actionButton: {
        label: 'إدارة العقود',
        onClick: () => router.push('/dashboard/property-owner?tab=contracts')
      }
    },
    {
      title: 'الإيرادات الشهرية',
      value: `${(stats.revenue?.monthly || 0).toLocaleString('ar-OM')} ر.ع`,
      icon: FiDollarSign,
      color: 'green' as const,
      loading,
      details: [
        { label: 'إجمالي', value: `${(stats.revenue?.total || 0).toLocaleString('ar-OM')} ر.ع` },
        { label: 'معلق', value: `${(stats.revenue?.pending || 0).toLocaleString('ar-OM')} ر.ع`, color: 'text-yellow-600' }
      ],
      actionButton: {
        label: 'عرض التقارير',
        onClick: () => router.push('/dashboard/property-owner?tab=financial')
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
      <button
        onClick={() => router.push('/properties/new')}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <FiPlus className="w-4 h-4" />
        <span className="hidden sm:inline">إضافة عقار</span>
      </button>
    </>
  );

  return (
    <ProfessionalDashboardLayout
      title="لوحة تحكم المالك"
      description="إدارة عقاراتك وعقودك وحجوزاتك"
      headerActions={headerActions}
      gradient="green"
    >
      {/* التنبؤات الذكية */}
      {userId && (
        <ProfessionalAIPredictions
          userId={userId}
          userRole="property_owner"
          stats={stats}
        />
      )}

      {/* بطاقات الإحصائيات */}
      <ProfessionalStatsCards stats={statsCards} columns={3} />

      {/* التبويبات الرئيسية */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative overflow-hidden rounded-xl bg-white/80 backdrop-blur-xl border border-white/20 shadow-md shadow-black/5 p-4 mb-6"
      >
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'properties', name: 'العقارات', icon: FiHome, href: '/dashboard/property-owner?tab=properties' },
            { id: 'contracts', name: 'عقود الإيجار', icon: FiFileText, href: '/dashboard/property-owner?tab=contracts' },
            { id: 'tenants', name: 'المستأجرين', icon: FiUsers, href: '/dashboard/property-owner?tab=tenants' },
            { id: 'financial', name: 'المالية', icon: FiDollarSign, href: '/dashboard/property-owner?tab=financial' }
          ].map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push(tab.href)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-blue-50 hover:to-cyan-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-all text-xs font-medium text-gray-700 hover:text-blue-700 shadow-sm hover:shadow"
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* تفاصيل إضافية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* تفاصيل العقود */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="relative overflow-hidden rounded-xl bg-white/80 backdrop-blur-xl border border-white/20 shadow-md shadow-black/5 p-4"
        >
          <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FiFileText className="text-purple-600 w-4 h-4" />
            تفاصيل العقود
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">إجمالي العقود</span>
              <span className="text-sm font-semibold text-gray-900">
                {stats.rentals?.total || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">عقود نشطة</span>
              <span className="text-sm font-semibold text-green-600">
                {stats.rentals?.active || 0}
              </span>
            </div>
            {stats.rentals?.expiringSoon && stats.rentals.expiringSoon > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">تنتهي قريباً</span>
                <span className="text-sm font-semibold text-yellow-600">
                  {stats.rentals.expiringSoon}
                </span>
              </div>
            )}
            {stats.rentals?.daysUntilExpiry && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">أيام حتى انتهاء العقد القادم</span>
                <span className="text-sm font-semibold text-red-600">
                  {stats.rentals.daysUntilExpiry} يوم
                </span>
              </div>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/dashboard/property-owner?tab=contracts')}
              className="w-full mt-3 py-2 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all text-xs font-semibold shadow-sm hover:shadow-md"
            >
              عرض جميع العقود
            </motion.button>
          </div>
        </motion.div>

        {/* تفاصيل الإيرادات */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="relative overflow-hidden rounded-xl bg-white/80 backdrop-blur-xl border border-white/20 shadow-md shadow-black/5 p-4"
        >
          <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FiDollarSign className="text-green-600 w-4 h-4" />
            تفاصيل الإيرادات
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">إجمالي الإيرادات</span>
              <span className="text-lg font-semibold text-gray-900">
                {(stats.revenue?.total || 0).toLocaleString('ar-OM')} ر.ع
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">الإيرادات الشهرية</span>
              <span className="text-lg font-semibold text-green-600">
                {(stats.revenue?.monthly || 0).toLocaleString('ar-OM')} ر.ع
              </span>
            </div>
            {stats.revenue?.pending && stats.revenue.pending > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">معلقة</span>
                <span className="text-lg font-semibold text-yellow-600">
                  {(stats.revenue.pending).toLocaleString('ar-OM')} ر.ع
                </span>
              </div>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/dashboard/property-owner?tab=financial')}
              className="w-full mt-3 py-2 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all text-xs font-semibold shadow-sm hover:shadow-md"
            >
              عرض التقارير المالية
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* إجراءات سريعة */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="relative overflow-hidden rounded-xl bg-white/80 backdrop-blur-xl border border-white/20 shadow-md shadow-black/5 p-4"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FiPlus className="text-green-600 w-5 h-5" />
          إجراءات سريعة
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/properties/new')}
            className="group relative overflow-hidden p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg hover:from-blue-100 hover:to-cyan-100 transition-all text-center border border-blue-200/50 shadow-sm hover:shadow-md"
          >
            <FiPlus className="w-5 h-5 text-blue-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-blue-800 block">إضافة عقار</span>
            <span className="text-[10px] text-blue-600 mt-0.5 block">عقار جديد</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/rentals/new')}
            className="group relative overflow-hidden p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg hover:from-purple-100 hover:to-pink-100 transition-all text-center border border-purple-200/50 shadow-sm hover:shadow-md"
          >
            <FiFileText className="w-5 h-5 text-purple-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-purple-800 block">عقد جديد</span>
            <span className="text-[10px] text-purple-600 mt-0.5 block">إنشاء عقد</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/dashboard/property-owner?tab=properties')}
            className="group relative overflow-hidden p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg hover:from-green-100 hover:to-emerald-100 transition-all text-center border border-green-200/50 shadow-sm hover:shadow-md"
          >
            <FiHome className="w-5 h-5 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-green-800 block">عقاراتي</span>
            <span className="text-[10px] text-green-600 mt-0.5 block">جميع العقارات</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/dashboard/property-owner?tab=tenants')}
            className="group relative overflow-hidden p-4 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg hover:from-indigo-100 hover:to-blue-100 transition-all text-center border border-indigo-200/50 shadow-sm hover:shadow-md"
          >
            <FiUsers className="w-5 h-5 text-indigo-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-indigo-800 block">المستأجرون</span>
            <span className="text-[10px] text-indigo-600 mt-0.5 block">إدارة المستأجرين</span>
          </motion.button>
        </div>
      </motion.div>
    </ProfessionalDashboardLayout>
  );
}
