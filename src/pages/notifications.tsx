import React, { useState } from 'react';
import Head from 'next/head';
import { useNotifications } from '@/context/NotificationsContext';
import InstantLink from '@/components/InstantLink';
import { motion } from 'framer-motion';
import {
  FaBell,
  FaCalendarCheck,
  FaDollarSign,
  FaTools,
  FaFileContract,
  FaUserPlus,
  FaChartLine,
  FaTimes,
  FaCheck,
  FaCheckDouble,
  FaFilter,
  FaExclamationTriangle,
  FaClock,
  FaTrash
} from 'react-icons/fa';

const iconMap: Record<string, any> = {
  FaCalendarCheck,
  FaDollarSign,
  FaTools,
  FaFileContract,
  FaBell,
  FaUserPlus,
  FaChartLine
};

const colorMap: Record<string, string> = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  orange: 'bg-orange-500',
  yellow: 'bg-yellow-500',
  purple: 'bg-purple-500',
  indigo: 'bg-indigo-500',
  emerald: 'bg-emerald-500',
  red: 'bg-red-500'
};

const priorityLabels: Record<string, string> = {
  urgent: 'عاجل جداً',
  high: 'مهم',
  medium: 'متوسط',
  low: 'منخفض'
};

const priorityColors: Record<string, string> = {
  urgent: 'text-red-600 bg-red-50',
  high: 'text-orange-600 bg-orange-50',
  medium: 'text-yellow-600 bg-yellow-50',
  low: 'text-gray-600 bg-gray-50'
};

const typeLabels: Record<string, string> = {
  booking: 'حجز',
  payment: 'دفعة',
  maintenance: 'صيانة',
  contract: 'عقد',
  system: 'نظام',
  user: 'مستخدم',
  report: 'تقرير'
};

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();

  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // فلترة الإشعارات
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread' && notification.read) return false;
    if (filter === 'read' && !notification.read) return false;
    if (typeFilter !== 'all' && notification.type !== typeFilter) return false;
    if (priorityFilter !== 'all' && notification.priority !== priorityFilter) return false;
    return true;
  });

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays === 1) return 'أمس';
    return date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <Head>
        <title>الإشعارات | Ain Oman</title>
      </Head>

      <div className="max-w-6xl mx-auto px-4">
        {/* الرأس */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl shadow-2xl p-8 mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">📬 الإشعارات</h1>
              <p className="text-blue-100">
                {unreadCount > 0 
                  ? `لديك ${unreadCount} إشعار جديد`
                  : 'لا توجد إشعارات جديدة'}
              </p>
            </div>

            <div className="flex gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold transition"
                >
                  <FaCheckDouble />
                  تحديد الكل كمقروء
                </button>
              )}
              
              <InstantLink
                href="/profile"
                className="flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-xl font-semibold transition"
              >
                الرجوع للملف الشخصي
              </InstantLink>
            </div>
          </div>
        </motion.div>

        {/* الفلاتر */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <FaFilter className="text-gray-600" />
            <h3 className="font-bold text-gray-900">التصفية</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* فلتر الحالة */}
            <div>
              <label className="text-sm text-gray-600 mb-2 block">الحالة</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">الكل ({notifications.length})</option>
                <option value="unread">غير مقروء ({unreadCount})</option>
                <option value="read">مقروء ({notifications.length - unreadCount})</option>
              </select>
            </div>

            {/* فلتر النوع */}
            <div>
              <label className="text-sm text-gray-600 mb-2 block">النوع</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">جميع الأنواع</option>
                {Object.entries(typeLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            {/* فلتر الأولوية */}
            <div>
              <label className="text-sm text-gray-600 mb-2 block">الأولوية</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">جميع الأولويات</option>
                {Object.entries(priorityLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* قائمة الإشعارات */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">جاري تحميل الإشعارات...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <FaBell className="w-24 h-24 mx-auto mb-6 text-gray-300" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">لا توجد إشعارات</h3>
              <p className="text-gray-600">
                {filter !== 'all' || typeFilter !== 'all' || priorityFilter !== 'all' 
                  ? 'لا توجد إشعارات تطابق الفلاتر المحددة'
                  : 'سيتم عرض الإشعارات هنا عند وصولها'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification, index) => {
              const Icon = iconMap[notification.icon] || FaBell;

              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6 ${
                    !notification.read ? 'border-l-4 border-blue-600' : ''
                  }`}
                >
                  <div className="flex gap-4">
                    {/* الأيقونة */}
                    <div className={`flex-shrink-0 w-14 h-14 ${colorMap[notification.color]} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                      <Icon className="w-7 h-7" />
                    </div>

                    {/* المحتوى */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <h3 className={`text-xl font-bold ${!notification.read ? 'text-blue-900' : 'text-gray-900'}`}>
                            {notification.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">{typeLabels[notification.type]}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[notification.priority]}`}>
                              {priorityLabels[notification.priority]}
                            </span>
                          </div>
                        </div>

                        {!notification.read && (
                          <div className="w-3 h-3 bg-blue-600 rounded-full flex-shrink-0 mt-1"></div>
                        )}
                      </div>

                      <p className="text-gray-700 mb-3">{notification.message}</p>

                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                          <FaClock className="inline ml-1" />
                          {formatTime(notification.createdAt)}
                        </p>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg transition"
                            >
                              <FaCheck />
                              تحديد كمقروء
                            </button>
                          )}

                          <InstantLink
                            href={notification.link}
                            className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-lg transition"
                          >
                            عرض التفاصيل
                          </InstantLink>

                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-lg transition"
                          >
                            <FaTrash />
                            حذف
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

