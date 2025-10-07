// src/pages/profile/index.tsx - صفحة المستخدم الاحترافية
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  FiUser, FiSettings, FiBell, FiHeart, FiCalendar, FiDollarSign,
  FiTrendingUp, FiTrendingDown, FiEye, FiEdit, FiShare2, FiDownload,
  FiStar, FiAward, FiShield, FiCheckCircle, FiClock, FiMessageSquare,
  FiHome, FiBuilding, FiCreditCard, FiFileText, FiTool, FiMapPin, FiActivity
} from 'react-icons/fi';

interface UserStats {
  totalProperties: number;
  activeBookings: number;
  totalSpent: number;
  pendingPayments: number;
  rating: number;
  reviews: number;
  level: number;
  points: number;
  badges: string[];
}

interface RecentActivity {
  id: string;
  type: 'booking' | 'payment' | 'review' | 'property_view';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'pending' | 'warning';
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: string;
}

export default function UserProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<UserStats>({
    totalProperties: 0,
    activeBookings: 0,
    totalSpent: 0,
    pendingPayments: 0,
    rating: 0,
    reviews: 0,
    level: 1,
    points: 0,
    badges: []
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // تحميل بيانات المستخدم
      const userResponse = await fetch('/api/auth/me');
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData);
      }

      // تحميل الإحصائيات
      const statsResponse = await fetch('/api/user/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // تحميل الأنشطة الأخيرة
      const activitiesResponse = await fetch('/api/user/activities');
      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json();
        setRecentActivities(activitiesData);
      }

      // تحميل الإشعارات
      const notificationsResponse = await fetch('/api/user/notifications');
      if (notificationsResponse.ok) {
        const notificationsData = await notificationsResponse.json();
        setNotifications(notificationsData);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-OM', {
      style: 'currency',
      currency: 'OMR',
      maximumFractionDigits: 3
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-OM', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'booking': return <FiCalendar className="w-4 h-4" />;
      case 'payment': return <FiDollarSign className="w-4 h-4" />;
      case 'review': return <FiStar className="w-4 h-4" />;
      case 'property_view': return <FiEye className="w-4 h-4" />;
      default: return <FiUser className="w-4 h-4" />;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'warning': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>ملفي الشخصي - عين عُمان</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">ملفي الشخصي</h1>
                <p className="mt-1 text-sm text-gray-500">
                  إدارة حسابك وأنشطتك في عين عُمان
                </p>
              </div>
              <div className="flex space-x-3 rtl:space-x-reverse">
                <Link
                  href="/profile/settings"
                  className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  <FiSettings className="w-4 h-4 ml-2" />
                  الإعدادات
                </Link>
                <Link
                  href="/profile/edit"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <FiEdit className="w-4 h-4 ml-2" />
                  تعديل الملف
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* الشريط الجانبي */}
            <div className="lg:col-span-1">
              {/* معلومات المستخدم */}
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div className="text-center">
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiUser className="w-12 h-12 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {user?.name || 'المستخدم'}
                  </h2>
                  <p className="text-sm text-gray-500 mb-4">
                    {user?.email || 'user@example.com'}
                  </p>
                  
                  {/* مستوى المستخدم */}
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">المستوى</span>
                      <span className="text-lg font-bold">{stats.level}</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-white h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(stats.points % 1000) / 10}%` }}
                      ></div>
                    </div>
                    <p className="text-xs mt-1">{stats.points} نقطة</p>
                  </div>

                  {/* الشارات */}
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">الشارات</h3>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {stats.badges.slice(0, 6).map((badge, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs"
                        >
                          🏆 {badge}
                        </span>
                      ))}
                      {stats.badges.length > 6 && (
                        <span className="text-xs text-gray-500">
                          +{stats.badges.length - 6} أخرى
                        </span>
                      )}
                    </div>
                  </div>

                  {/* التقييم */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <FiStar
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(stats.rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {stats.rating.toFixed(1)} ({stats.reviews} تقييم)
                    </span>
                  </div>
                </div>
              </div>

              {/* الإشعارات السريعة */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">الإشعارات</h3>
                  <Link
                    href="/profile/notifications"
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    عرض الكل
                  </Link>
                </div>
                <div className="space-y-3">
                  {notifications.slice(0, 3).map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border-l-4 ${
                        notification.read ? 'bg-gray-50' : 'bg-blue-50'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-lg">
                          {getNotificationIcon(notification.type)}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDate(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* المحتوى الرئيسي */}
            <div className="lg:col-span-2">
              {/* الإحصائيات السريعة */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FiHome className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="mr-4">
                      <p className="text-sm font-medium text-gray-600">العقارات</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalProperties}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FiCalendar className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="mr-4">
                      <p className="text-sm font-medium text-gray-600">الحجوزات النشطة</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.activeBookings}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <FiDollarSign className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="mr-4">
                      <p className="text-sm font-medium text-gray-600">إجمالي الإنفاق</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalSpent)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <FiClock className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="mr-4">
                      <p className="text-sm font-medium text-gray-600">مدفوعات معلقة</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.pendingPayments)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* الوحدات السريعة */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">إدارة العقارات</h3>
                  <div className="space-y-3">
                    <Link
                      href="/profile/properties"
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FiBuilding className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium">عقاراتي</span>
                      </div>
                      <span className="text-xs text-gray-500">{stats.totalProperties}</span>
                    </Link>
                    <Link
                      href="/profile/bookings"
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FiCalendar className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium">حجوزاتي</span>
                      </div>
                      <span className="text-xs text-gray-500">{stats.activeBookings}</span>
                    </Link>
                    <Link
                      href="/profile/favorites"
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FiHeart className="w-5 h-5 text-red-600" />
                        <span className="text-sm font-medium">المفضلة</span>
                      </div>
                      <span className="text-xs text-gray-500">12</span>
                    </Link>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">المالية</h3>
                  <div className="space-y-3">
                    <Link
                      href="/profile/payments"
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FiCreditCard className="w-5 h-5 text-purple-600" />
                        <span className="text-sm font-medium">المدفوعات</span>
                      </div>
                      <span className="text-xs text-gray-500">{formatCurrency(stats.totalSpent)}</span>
                    </Link>
                    <Link
                      href="/profile/invoices"
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FiFileText className="w-5 h-5 text-orange-600" />
                        <span className="text-sm font-medium">الفواتير</span>
                      </div>
                      <span className="text-xs text-gray-500">5</span>
                    </Link>
                    <Link
                      href="/profile/reports"
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FiTrendingUp className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium">التقارير</span>
                      </div>
                      <span className="text-xs text-gray-500">عرض</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* الأنشطة الأخيرة */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">الأنشطة الأخيرة</h3>
                  <Link
                    href="/profile/activities"
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    عرض الكل
                  </Link>
                </div>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className={`p-2 rounded-lg ${getActivityColor(activity.status)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-xs text-gray-500">{activity.description}</p>
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatDate(activity.timestamp)}
                      </div>
                    </div>
                  ))}
                  {recentActivities.length === 0 && (
                    <div className="text-center py-8">
                      <FiActivity className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد أنشطة</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        سيتم عرض أنشطتك الأخيرة هنا.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
