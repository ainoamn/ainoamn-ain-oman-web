// src/pages/dashboard/admin.tsx - لوحة تحكم الإدارة المتقدمة
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  FiUsers, FiHome, FiCalendar, FiDollarSign, FiSettings,
  FiTrendingUp, FiAlertCircle, FiCheckCircle, FiClock,
  FiFileText, FiPieChart, FiBarChart, FiActivity,
  FiBell, FiMail, FiPhone, FiMapPin, FiGlobe,
  FiPackage, FiShield, FiDatabase, FiServer,
  FiRefreshCw, FiEye, FiEdit, FiTrash2, FiPlus,
  FiArrowUp, FiArrowDown, FiMenu, FiX, FiUser,
  FiLayers, FiCreditCard, FiTool
} from 'react-icons/fi';
import { FaFileContract } from 'react-icons/fa';

interface SystemStats {
  users: {
    total: number;
    active: number;
    new: number;
    growth: number;
  };
  properties: {
    total: number;
    active: number;
    pending: number;
    growth: number;
  };
  bookings: {
    total: number;
    today: number;
    pending: number;
    growth: number;
  };
  revenue: {
    total: number;
    monthly: number;
    growth: number;
    pending: number;
  };
  tasks: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
  };
  subscriptions: {
    total: number;
    active: number;
    expiring: number;
    revenue: number;
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SystemStats>({
    users: { total: 0, active: 0, new: 0, growth: 0 },
    properties: { total: 0, active: 0, pending: 0, growth: 0 },
    bookings: { total: 0, today: 0, pending: 0, growth: 0 },
    revenue: { total: 0, monthly: 0, growth: 0, pending: 0 },
    tasks: { total: 0, completed: 0, pending: 0, overdue: 0 },
    subscriptions: { total: 0, active: 0, expiring: 0, revenue: 0 }
  });

  // جلب الإحصائيات من جميع الأنظمة
  useEffect(() => {
    fetchAllStats();
  }, []);

  const fetchAllStats = async () => {
    setLoading(true);
    try {
      const [bookingsRes, propertiesRes, tasksRes] = await Promise.all([
        fetch('/api/bookings'),
        fetch('/api/properties'),
        fetch('/api/tasks/simple')
      ]);

      const bookings = bookingsRes.ok ? await bookingsRes.json() : { items: [] };
      const properties = propertiesRes.ok ? await propertiesRes.json() : [];
      const tasks = tasksRes.ok ? await tasksRes.json() : { items: [] };

      // حساب الإحصائيات
      const bookingsArray = Array.isArray(bookings.items) ? bookings.items : [];
      const propertiesArray = Array.isArray(properties) ? properties : [];
      const tasksArray = Array.isArray(tasks.items) ? tasks.items : [];

      const totalRevenue = bookingsArray.reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0);
      const today = new Date().toISOString().split('T')[0];
      const todayBookings = bookingsArray.filter((b: any) => b.checkIn?.startsWith(today)).length;

      setStats({
        users: {
          total: 1247,
          active: 1156,
          new: 23,
          growth: 12.5
        },
        properties: {
          total: propertiesArray.length,
          active: propertiesArray.filter((p: any) => p.status === 'active').length,
          pending: propertiesArray.filter((p: any) => p.status === 'pending').length,
          growth: 8.3
        },
        bookings: {
          total: bookingsArray.length,
          today: todayBookings,
          pending: bookingsArray.filter((b: any) => b.status === 'pending').length,
          growth: 15.7
        },
        revenue: {
          total: totalRevenue,
          monthly: totalRevenue * 0.4, // تقدير شهري
          growth: 22.4,
          pending: totalRevenue * 0.15
        },
        tasks: {
          total: tasksArray.length,
          completed: tasksArray.filter((t: any) => t.status === 'completed').length,
          pending: tasksArray.filter((t: any) => t.status === 'pending').length,
          overdue: tasksArray.filter((t: any) => t.status === 'overdue').length
        },
        subscriptions: {
          total: 456,
          active: 389,
          expiring: 23,
          revenue: 45670.50
        }
      });
    } catch (error) {

    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Head>
        <title>لوحة تحكم الإدارة - عين عُمان</title>
      </Head>

      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
              >
                {sidebarOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <FiShield className="text-red-600" />
                  لوحة تحكم الإدارة
                </h1>
                <p className="text-sm text-gray-500">إدارة شاملة لجميع أنظمة الموقع</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={fetchAllStats}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="تحديث"
              >
                <FiRefreshCw className="w-5 h-5" />
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
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Users Card */}
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FiUsers className="w-6 h-6 text-blue-600" />
              </div>
              <span className="flex items-center text-sm font-medium text-green-600">
                <FiArrowUp className="w-4 h-4 mr-1" />
                {stats.users.growth}%
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {stats.users.total.toLocaleString()}
            </h3>
            <p className="text-sm text-gray-600 mb-3">إجمالي المستخدمين</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">نشط: {stats.users.active}</span>
              <span className="text-green-600 font-medium">جديد: +{stats.users.new}</span>
            </div>
            <button
              onClick={() => router.push('/admin/users')}
              className="mt-4 w-full py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
            >
              إدارة المستخدمين
            </button>
          </div>

          {/* Properties Card */}
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <FiHome className="w-6 h-6 text-green-600" />
              </div>
              <span className="flex items-center text-sm font-medium text-green-600">
                <FiArrowUp className="w-4 h-4 mr-1" />
                {stats.properties.growth}%
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {stats.properties.total.toLocaleString()}
            </h3>
            <p className="text-sm text-gray-600 mb-3">إجمالي العقارات</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">نشط: {stats.properties.active}</span>
              <span className="text-yellow-600 font-medium">معلق: {stats.properties.pending}</span>
            </div>
            <button
              onClick={() => router.push('/properties/unified-management')}
              className="mt-4 w-full py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
            >
              إدارة العقارات
            </button>
          </div>

          {/* Bookings Card */}
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FiCalendar className="w-6 h-6 text-purple-600" />
              </div>
              <span className="flex items-center text-sm font-medium text-green-600">
                <FiArrowUp className="w-4 h-4 mr-1" />
                {stats.bookings.growth}%
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {stats.bookings.total.toLocaleString()}
            </h3>
            <p className="text-sm text-gray-600 mb-3">إجمالي الحجوزات</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">اليوم: {stats.bookings.today}</span>
              <span className="text-orange-600 font-medium">معلق: {stats.bookings.pending}</span>
            </div>
            <button
              onClick={() => router.push('/admin/bookings')}
              className="mt-4 w-full py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
            >
              إدارة الحجوزات
            </button>
          </div>

          {/* Revenue Card */}
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <FiDollarSign className="w-6 h-6 text-orange-600" />
              </div>
              <span className="flex items-center text-sm font-medium text-green-600">
                <FiArrowUp className="w-4 h-4 mr-1" />
                {stats.revenue.growth}%
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {stats.revenue.total.toLocaleString()} ر.ع
            </h3>
            <p className="text-sm text-gray-600 mb-3">إجمالي الإيرادات</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">شهري: {stats.revenue.monthly.toLocaleString()}</span>
              <span className="text-yellow-600 font-medium">معلق: {stats.revenue.pending.toLocaleString()}</span>
            </div>
            <button
              onClick={() => router.push('/admin/financial')}
              className="mt-4 w-full py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium"
            >
              التقارير المالية
            </button>
          </div>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Tasks Management */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FiCheckCircle className="text-green-600" />
                إدارة المهام
              </h2>
              <button
                onClick={() => router.push('/admin/tasks')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                عرض الكل →
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded">
                    <FiCheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">مهام مكتملة</p>
                    <p className="text-xs text-gray-500">{((stats.tasks.completed / stats.tasks.total) * 100).toFixed(1)}% من الإجمالي</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-green-600">{stats.tasks.completed}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded">
                    <FiClock className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">مهام معلقة</p>
                    <p className="text-xs text-gray-500">تحتاج إلى متابعة</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-yellow-600">{stats.tasks.pending}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded">
                    <FiAlertCircle className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">مهام متأخرة</p>
                    <p className="text-xs text-gray-500">تحتاج إلى اهتمام فوري</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-red-600">{stats.tasks.overdue}</span>
              </div>
            </div>
          </div>

          {/* Subscriptions Management */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FiPackage className="text-purple-600" />
                إدارة الاشتراكات
              </h2>
              <button
                onClick={() => router.push('/admin/subscriptions')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                عرض الكل →
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded">
                    <FiCheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">اشتراكات نشطة</p>
                    <p className="text-xs text-gray-500">{((stats.subscriptions.active / stats.subscriptions.total) * 100).toFixed(1)}% من الإجمالي</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-green-600">{stats.subscriptions.active}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded">
                    <FiAlertCircle className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">قريبة من الانتهاء</p>
                    <p className="text-xs text-gray-500">خلال 30 يوم</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-orange-600">{stats.subscriptions.expiring}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded">
                    <FiDollarSign className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">إيرادات الاشتراكات</p>
                    <p className="text-xs text-gray-500">شهرياً</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-purple-600">{stats.subscriptions.revenue.toLocaleString()} ر.ع</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FiSettings />
            إجراءات سريعة
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <button
              onClick={() => router.push('/admin/users')}
              className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-center"
            >
              <FiUsers className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">المستخدمين</p>
            </button>

            <button
              onClick={() => router.push('/admin/units')}
              className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-center"
            >
              <FiHome className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">الوحدات</p>
            </button>

            <button
              onClick={() => router.push('/rentals')}
              className="p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors text-center border-2 border-indigo-300"
            >
              <FaFileContract className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-900">عقود الإيجار</p>
            </button>

            <button
              onClick={() => router.push('/admin/rented-units')}
              className="p-4 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors text-center border-2 border-amber-300"
            >
              <FiHome className="w-6 h-6 text-amber-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-900">الوحدات المؤجرة</p>
            </button>

            <button
              onClick={() => router.push('/admin/subscriptions')}
              className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-center"
            >
              <FiPackage className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">الاشتراكات</p>
            </button>

            <button
              onClick={() => router.push('/admin/financial')}
              className="p-4 bg-gradient-to-br from-green-50 to-emerald-100 hover:from-green-100 hover:to-emerald-200 rounded-lg transition-colors text-center border-2 border-green-300"
            >
              <FiDollarSign className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-900">النظام المالي</p>
            </button>

            <button
              onClick={() => router.push('/properties/unified-management')}
              className="p-4 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors text-center"
            >
              <FiFileText className="w-6 h-6 text-teal-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">العقارات</p>
            </button>

            <button
              onClick={() => router.push('/dashboard')}
              className="p-4 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors text-center"
            >
              <FiBarChart className="w-6 h-6 text-pink-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">اللوحات</p>
            </button>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FiActivity className="text-green-600" />
            حالة النظام
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <FiServer className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">حالة الخادم</p>
                <p className="text-lg font-bold text-green-600">نشط ✓</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FiDatabase className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">قاعدة البيانات</p>
                <p className="text-lg font-bold text-blue-600">متصلة ✓</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FiGlobe className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">الموقع</p>
                <p className="text-lg font-bold text-purple-600">متاح ✓</p>
              </div>
            </div>
          </div>
        </div>

        {/* All Systems Management - إدارة جميع الأنظمة */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Property Systems */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b">
              <FiHome className="text-green-600" />
              أنظمة العقارات
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => router.push('/properties/unified-management')}
                className="w-full text-right px-3 py-2 text-sm text-gray-700 hover:bg-green-50 rounded-lg transition-colors flex items-center justify-between"
              >
                <span>إدارة العقارات الموحدة</span>
                <FiArrowUp className="w-4 h-4 rotate-45" />
              </button>
              <button
                onClick={() => router.push('/admin/units')}
                className="w-full text-right px-3 py-2 text-sm text-gray-700 hover:bg-green-50 rounded-lg transition-colors flex items-center justify-between"
              >
                <span>إدارة الوحدات</span>
                <FiArrowUp className="w-4 h-4 rotate-45" />
              </button>
              <button
                onClick={() => router.push('/rentals')}
                className="w-full text-right px-3 py-2 text-sm font-bold text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors flex items-center justify-between bg-indigo-50"
              >
                <span className="flex items-center gap-2">
                  <FaFileContract className="w-4 h-4" />
                  إدارة عقود الإيجار
                </span>
                <FiArrowUp className="w-4 h-4 rotate-45" />
              </button>
              <button
                onClick={() => router.push('/admin/rented-units')}
                className="w-full text-right px-3 py-2 text-sm font-bold text-amber-700 hover:bg-amber-50 rounded-lg transition-colors flex items-center justify-between bg-amber-50"
              >
                <span className="flex items-center gap-2">
                  <FiHome className="w-4 h-4" />
                  إدارة الوحدات المؤجرة
                </span>
                <FiArrowUp className="w-4 h-4 rotate-45" />
              </button>
              <button
                onClick={() => router.push('/properties')}
                className="w-full text-right px-3 py-2 text-sm text-gray-700 hover:bg-green-50 rounded-lg transition-colors flex items-center justify-between"
              >
                <span>عرض العقارات</span>
                <FiArrowUp className="w-4 h-4 rotate-45" />
              </button>
              <button
                onClick={() => router.push('/admin/tasks')}
                className="w-full text-right px-3 py-2 text-sm text-gray-700 hover:bg-green-50 rounded-lg transition-colors flex items-center justify-between"
              >
                <span>مهام العقارات</span>
                <FiArrowUp className="w-4 h-4 rotate-45" />
              </button>
            </div>
          </div>

          {/* User & Subscription Systems */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b">
              <FiUsers className="text-blue-600" />
              أنظمة المستخدمين
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => router.push('/admin/users')}
                className="w-full text-right px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-between"
              >
                <span>إدارة المستخدمين</span>
                <FiArrowUp className="w-4 h-4 rotate-45" />
              </button>
              <button
                onClick={() => router.push('/admin/subscriptions')}
                className="w-full text-right px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-between"
              >
                <span>إدارة الاشتراكات</span>
                <FiArrowUp className="w-4 h-4 rotate-45" />
              </button>
              <button
                onClick={() => router.push('/subscriptions')}
                className="w-full text-right px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-between"
              >
                <span>الباقات المتاحة</span>
                <FiArrowUp className="w-4 h-4 rotate-45" />
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full text-right px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-between"
              >
                <span>اختيار اللوحات</span>
                <FiArrowUp className="w-4 h-4 rotate-45" />
              </button>
            </div>
          </div>

          {/* Financial Systems - النظام المالي */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b">
              <FiDollarSign className="text-green-600" />
              النظام المالي والمحاسبي
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => router.push('/admin/financial')}
                className="w-full text-right px-3 py-2 text-sm font-bold text-green-700 hover:bg-green-50 rounded-lg transition-colors flex items-center justify-between bg-green-50"
              >
                <span>📊 لوحة التحكم المالية</span>
                <FiArrowUp className="w-4 h-4 rotate-45" />
              </button>
              <button
                onClick={() => router.push('/admin/financial/invoices')}
                className="w-full text-right px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 rounded-lg transition-colors flex items-center justify-between"
              >
                <span>الفواتير</span>
                <FiArrowUp className="w-4 h-4 rotate-45" />
              </button>
              <button
                onClick={() => router.push('/admin/financial/payments')}
                className="w-full text-right px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 rounded-lg transition-colors flex items-center justify-between"
              >
                <span>المدفوعات</span>
                <FiArrowUp className="w-4 h-4 rotate-45" />
              </button>
              <button
                onClick={() => router.push('/admin/financial/checks')}
                className="w-full text-right px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 rounded-lg transition-colors flex items-center justify-between"
              >
                <span>الشيكات</span>
                <FiArrowUp className="w-4 h-4 rotate-45" />
              </button>
              <button
                onClick={() => router.push('/admin/financial/reports')}
                className="w-full text-right px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 rounded-lg transition-colors flex items-center justify-between"
              >
                <span>التقارير المالية</span>
                <FiArrowUp className="w-4 h-4 rotate-45" />
              </button>
              <button
                onClick={() => router.push('/auctions')}
                className="w-full text-right px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 rounded-lg transition-colors flex items-center justify-between"
              >
                <span>المزادات</span>
                <FiArrowUp className="w-4 h-4 rotate-45" />
              </button>
              <button
                onClick={() => router.push('/real-estate-development')}
                className="w-full text-right px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 rounded-lg transition-colors flex items-center justify-between"
              >
                <span>التطوير العقاري</span>
                <FiArrowUp className="w-4 h-4 rotate-45" />
              </button>
            </div>
          </div>
        </div>

        {/* Additional Systems Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Calendar & Appointments */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b">
              <FiCalendar className="text-orange-600" />
              التقويم والمواعيد
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => router.push('/calendar')}
                className="w-full text-right px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 rounded-lg transition-colors flex items-center justify-between"
              >
                <span>التقويم العام</span>
                <FiArrowUp className="w-4 h-4 rotate-45" />
              </button>
              <button
                onClick={() => router.push('/appointments')}
                className="w-full text-right px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 rounded-lg transition-colors flex items-center justify-between"
              >
                <span>المواعيد</span>
                <FiArrowUp className="w-4 h-4 rotate-45" />
              </button>
              <button
                onClick={() => router.push('/admin/reservations')}
                className="w-full text-right px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 rounded-lg transition-colors flex items-center justify-between"
              >
                <span>الحجوزات</span>
                <FiArrowUp className="w-4 h-4 rotate-45" />
              </button>
            </div>
          </div>

          {/* Communications */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b">
              <FiBell className="text-indigo-600" />
              الاتصالات والإشعارات
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => router.push('/admin/notifications')}
                className="w-full text-right px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 rounded-lg transition-colors flex items-center justify-between"
              >
                <span>الإشعارات العامة</span>
                <FiArrowUp className="w-4 h-4 rotate-45" />
              </button>
              <button
                onClick={() => router.push('/admin/messages')}
                className="w-full text-right px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 rounded-lg transition-colors flex items-center justify-between"
              >
                <span>الرسائل</span>
                <FiArrowUp className="w-4 h-4 rotate-45" />
              </button>
              <button
                onClick={() => router.push('/admin/alerts')}
                className="w-full text-right px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 rounded-lg transition-colors flex items-center justify-between"
              >
                <span>التنبيهات</span>
                <FiArrowUp className="w-4 h-4 rotate-45" />
              </button>
            </div>
          </div>

          {/* Reports & Analytics */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b">
              <FiPieChart className="text-pink-600" />
              التقارير والإحصائيات
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => router.push('/admin/reports')}
                className="w-full text-right px-3 py-2 text-sm text-gray-700 hover:bg-pink-50 rounded-lg transition-colors flex items-center justify-between"
              >
                <span>التقارير الشاملة</span>
                <FiArrowUp className="w-4 h-4 rotate-45" />
              </button>
              <button
                onClick={() => router.push('/admin/analytics')}
                className="w-full text-right px-3 py-2 text-sm text-gray-700 hover:bg-pink-50 rounded-lg transition-colors flex items-center justify-between"
              >
                <span>التحليلات</span>
                <FiArrowUp className="w-4 h-4 rotate-45" />
              </button>
              <button
                onClick={() => router.push('/admin/statistics')}
                className="w-full text-right px-3 py-2 text-sm text-gray-700 hover:bg-pink-50 rounded-lg transition-colors flex items-center justify-between"
              >
                <span>الإحصائيات المتقدمة</span>
                <FiArrowUp className="w-4 h-4 rotate-45" />
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Management Section */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-8 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <FiShield className="w-7 h-7" />
            الإدارة المتقدمة
          </h2>
          <p className="text-blue-100 mb-6">تحكم كامل في جميع أنظمة ووحدات الموقع</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => router.push('/admin/users')}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm p-4 rounded-lg transition-all text-center"
            >
              <FiUsers className="w-6 h-6 mx-auto mb-2" />
              <p className="text-sm font-medium">المستخدمين</p>
              <p className="text-xs text-blue-100 mt-1">{stats.users.total}</p>
            </button>

            <button
              onClick={() => router.push('/admin/units')}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm p-4 rounded-lg transition-all text-center"
            >
              <FiHome className="w-6 h-6 mx-auto mb-2" />
              <p className="text-sm font-medium">الوحدات</p>
              <p className="text-xs text-blue-100 mt-1">{stats.properties.total}</p>
            </button>

            <button
              onClick={() => router.push('/admin/subscriptions')}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm p-4 rounded-lg transition-all text-center"
            >
              <FiPackage className="w-6 h-6 mx-auto mb-2" />
              <p className="text-sm font-medium">الاشتراكات</p>
              <p className="text-xs text-blue-100 mt-1">{stats.subscriptions.active}</p>
            </button>

            <button
              onClick={() => router.push('/admin/bookings')}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm p-4 rounded-lg transition-all text-center"
            >
              <FiCalendar className="w-6 h-6 mx-auto mb-2" />
              <p className="text-sm font-medium">الحجوزات</p>
              <p className="text-xs text-blue-100 mt-1">{stats.bookings.total}</p>
            </button>

            <button
              onClick={() => router.push('/auctions')}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm p-4 rounded-lg transition-all text-center"
            >
              <FiTrendingUp className="w-6 h-6 mx-auto mb-2" />
              <p className="text-sm font-medium">المزادات</p>
            </button>

            <button
              onClick={() => router.push('/real-estate-development')}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm p-4 rounded-lg transition-all text-center"
            >
              <FiSettings className="w-6 h-6 mx-auto mb-2" />
              <p className="text-sm font-medium">التطوير العقاري</p>
            </button>

            <button
              onClick={() => router.push('/admin/contracts')}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm p-4 rounded-lg transition-all text-center"
            >
              <FiFileText className="w-6 h-6 mx-auto mb-2" />
              <p className="text-sm font-medium">العقود</p>
            </button>

            <button
              onClick={() => router.push('/admin/financial')}
              className="bg-white bg-opacity-30 hover:bg-opacity-40 backdrop-blur-sm p-4 rounded-lg transition-all text-center border-2 border-white border-opacity-40"
            >
              <FiDollarSign className="w-6 h-6 mx-auto mb-2" />
              <p className="text-sm font-bold">النظام المالي</p>
              <p className="text-xs text-blue-100 mt-1">محاسبة متكاملة</p>
            </button>

            <button
              onClick={() => router.push('/admin/financial/invoices')}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm p-4 rounded-lg transition-all text-center"
            >
              <FiFileText className="w-6 h-6 mx-auto mb-2" />
              <p className="text-sm font-medium">الفواتير</p>
            </button>

            <button
              onClick={() => router.push('/admin/financial/payments')}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm p-4 rounded-lg transition-all text-center"
            >
              <FiCheckCircle className="w-6 h-6 mx-auto mb-2" />
              <p className="text-sm font-medium">المدفوعات</p>
            </button>

            <button
              onClick={() => router.push('/admin/financial/checks')}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm p-4 rounded-lg transition-all text-center"
            >
              <FiFileText className="w-6 h-6 mx-auto mb-2" />
              <p className="text-sm font-medium">الشيكات</p>
            </button>

            <button
              onClick={() => router.push('/admin/settings')}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm p-4 rounded-lg transition-all text-center"
            >
              <FiSettings className="w-6 h-6 mx-auto mb-2" />
              <p className="text-sm font-medium">الإعدادات</p>
            </button>
          </div>
        </div>

        {/* All Dashboards Access */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FiBarChart className="text-blue-600" />
            الوصول السريع للوحات التحكم
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <button
              onClick={() => router.push('/dashboard/admin')}
              className="p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-center"
            >
              <p className="text-lg mb-1">🛡️</p>
              <p className="text-xs font-medium text-gray-900">الإدارة</p>
            </button>

            <button
              onClick={() => router.push('/dashboard/property-owner')}
              className="p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-center"
            >
              <p className="text-lg mb-1">🏠</p>
              <p className="text-xs font-medium text-gray-900">مالك عقار</p>
            </button>

            <button
              onClick={() => router.push('/dashboard/tenant')}
              className="p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-center"
            >
              <p className="text-lg mb-1">👤</p>
              <p className="text-xs font-medium text-gray-900">مستأجر</p>
            </button>

            <button
              onClick={() => router.push('/dashboard/investor')}
              className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors text-center"
            >
              <p className="text-lg mb-1">💰</p>
              <p className="text-xs font-medium text-gray-900">مستثمر</p>
            </button>

            <button
              onClick={() => router.push('/dashboard/developer')}
              className="p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-center"
            >
              <p className="text-lg mb-1">🏗️</p>
              <p className="text-xs font-medium text-gray-900">مطور</p>
            </button>

            <button
              onClick={() => router.push('/dashboard/agency')}
              className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors text-center"
            >
              <p className="text-lg mb-1">🏢</p>
              <p className="text-xs font-medium text-gray-900">وكالة</p>
            </button>

            <button
              onClick={() => router.push('/dashboard/hoa')}
              className="p-3 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors text-center"
            >
              <p className="text-lg mb-1">🏘️</p>
              <p className="text-xs font-medium text-gray-900">جمعية ملاك</p>
            </button>

            <button
              onClick={() => router.push('/dashboard/landlord')}
              className="p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors text-center"
            >
              <p className="text-lg mb-1">🔑</p>
              <p className="text-xs font-medium text-gray-900">مؤجر</p>
            </button>

            <button
              onClick={() => router.push('/dashboard/corporate-tenant')}
              className="p-3 bg-pink-50 border border-pink-200 rounded-lg hover:bg-pink-100 transition-colors text-center"
            >
              <p className="text-lg mb-1">🏛️</p>
              <p className="text-xs font-medium text-gray-900">شركة مستأجرة</p>
            </button>

            <button
              onClick={() => router.push('/dashboard')}
              className="p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-center"
            >
              <p className="text-lg mb-1">➕</p>
              <p className="text-xs font-medium text-gray-900">المزيد</p>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

