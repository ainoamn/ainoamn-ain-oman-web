import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '@/context/NotificationsContext';
import InstantLink from './InstantLink';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBell, FaCalendarCheck, FaDollarSign, FaTools, FaFileContract, FaUserPlus, FaChartLine, FaTimes, FaCheck, FaClock, FaExclamationTriangle } from 'react-icons/fa';

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

const priorityIcons: Record<string, any> = {
  urgent: FaExclamationTriangle,
  high: FaExclamationTriangle,
  medium: FaClock,
  low: FaCheck
};

const priorityColors: Record<string, string> = {
  urgent: 'text-red-600',
  high: 'text-orange-600',
  medium: 'text-yellow-600',
  low: 'text-gray-600'
};

export default function NotificationsDropdown() {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // إغلاق عند النقر خارج القائمة
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    setIsOpen(false);
  };

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
    return `منذ ${diffDays} يوم`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* زر الإشعارات */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
      >
        <FaBell className="w-6 h-6" />
        
        {/* Badge للإشعارات غير المقروءة */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* القائمة المنسدلة */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50"
            style={{ maxHeight: '80vh' }}
          >
            {/* الرأس */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg">الإشعارات</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/20 rounded-lg transition"
                >
                  <FaTimes />
                </button>
              </div>
              
              {unreadCount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-90">
                    {unreadCount} إشعار جديد
                  </span>
                  <button
                    onClick={async () => {
                      await markAllAsRead();
                    }}
                    className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition"
                  >
                    تحديد الكل كمقروء
                  </button>
                </div>
              )}
            </div>

            {/* قائمة الإشعارات */}
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 120px)' }}>
              {loading ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  جاري التحميل...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <FaBell className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-semibold">لا توجد إشعارات</p>
                  <p className="text-sm mt-1">سيتم عرض الإشعارات هنا</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => {
                    const Icon = iconMap[notification.icon] || FaBell;
                    const PriorityIcon = priorityIcons[notification.priority];

                    return (
                      <div
                        key={notification.id}
                        className={`group relative p-4 hover:bg-gray-50 transition cursor-pointer ${
                          !notification.read ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        {/* مؤشر غير مقروء */}
                        {!notification.read && (
                          <div className="absolute top-4 right-4 w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}

                        <div className="flex gap-3">
                          {/* الأيقونة */}
                          <div className={`flex-shrink-0 w-12 h-12 ${colorMap[notification.color]} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                            <Icon className="w-6 h-6" />
                          </div>

                          {/* المحتوى */}
                          <div className="flex-1 min-w-0">
                            <InstantLink
                              href={notification.link}
                              onClick={() => handleNotificationClick(notification)}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <h4 className={`font-bold text-gray-900 ${!notification.read ? 'text-blue-900' : ''}`}>
                                  {notification.title}
                                </h4>
                                <PriorityIcon className={`w-4 h-4 flex-shrink-0 ${priorityColors[notification.priority]}`} />
                              </div>
                              
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              
                              <p className="text-xs text-gray-400 mt-2">
                                {formatTime(notification.createdAt)}
                              </p>
                            </InstantLink>
                          </div>

                          {/* زر الحذف */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* التذييل */}
            {notifications.length > 0 && (
              <div className="border-t border-gray-200 p-3 bg-gray-50">
                <InstantLink
                  href="/notifications"
                  onClick={() => setIsOpen(false)}
                  className="block text-center text-sm font-semibold text-blue-600 hover:text-blue-700 py-2"
                >
                  عرض جميع الإشعارات
                </InstantLink>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

