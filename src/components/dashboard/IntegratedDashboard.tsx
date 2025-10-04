// لوحة التحكم المتكاملة مع التقويم والمهام
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { subscriptionManager, type UserSubscription } from '@/lib/subscriptionSystem';

interface IntegratedDashboardProps {
  userType: 'admin' | 'property-owner' | 'customer';
  userId: string;
}

export default function IntegratedDashboard({ userType, userId }: IntegratedDashboardProps) {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    // جلب بيانات الاشتراك
    const stats = subscriptionManager.getSubscriptionStats(userId);
    if (stats) {
      setSubscription(stats.subscription);
    }

    // جلب البيانات حسب نوع المستخدم
    fetchDashboardData();
  }, [userId, userType]);

  const fetchDashboardData = async () => {
    try {
      // جلب التقويم
      if (subscriptionManager.hasPermission(userId, 'calendar_read')) {
        const calendarResponse = await fetch('/api/calendar/events');
        if (calendarResponse.ok) {
          const calendarData = await calendarResponse.json();
          setCalendarEvents(calendarData.events || []);
        }
      }

      // جلب المهام
      if (subscriptionManager.hasPermission(userId, 'task_read')) {
        const tasksResponse = await fetch('/api/tasks/simple');
        if (tasksResponse.ok) {
          const tasksData = await tasksResponse.json();
          setTasks(tasksData.tasks || []);
        }
      }

      // جلب العقارات
      if (subscriptionManager.hasPermission(userId, 'prop_read')) {
        const propertiesResponse = await fetch('/api/properties');
        if (propertiesResponse.ok) {
          const propertiesData = await propertiesResponse.json();
          setProperties(propertiesData.properties || []);
        }
      }

      // جلب الحجوزات
      if (subscriptionManager.hasPermission(userId, 'booking_read')) {
        const bookingsResponse = await fetch('/api/bookings');
        if (bookingsResponse.ok) {
          const bookingsData = await bookingsResponse.json();
          setBookings(bookingsData.bookings || []);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const canAddProperty = () => {
    return subscriptionManager.hasPermission(userId, 'prop_write') && 
           subscriptionManager.checkLimit(userId, 'properties');
  };

  const canManageCalendar = () => {
    return subscriptionManager.hasPermission(userId, 'calendar_write');
  };

  const canManageTasks = () => {
    return subscriptionManager.hasPermission(userId, 'task_write');
  };

  const getQuickActions = () => {
    const actions = [];

    // إضافة عقار
    if (canAddProperty()) {
      actions.push({
        id: 'add-property',
        title: 'إضافة عقار',
        titleAr: 'إضافة عقار',
        icon: '🏢',
        href: '/properties/new',
        color: 'bg-blue-500',
        description: 'إضافة عقار جديد إلى النظام'
      });
    }

    // إدارة التقويم
    if (canManageCalendar()) {
      actions.push({
        id: 'calendar',
        title: 'التقويم',
        titleAr: 'التقويم',
        icon: '📅',
        href: '/calendar',
        color: 'bg-green-500',
        description: 'إدارة الأحداث والمواعيد'
      });
    }

    // إدارة المهام
    if (canManageTasks()) {
      actions.push({
        id: 'tasks',
        title: 'المهام',
        titleAr: 'المهام',
        icon: '⚡',
        href: '/admin/tasks',
        color: 'bg-purple-500',
        description: 'إدارة المهام والمتابعة'
      });
    }

    // إدارة الحجوزات
    if (subscriptionManager.hasPermission(userId, 'booking_write')) {
      actions.push({
        id: 'bookings',
        title: 'الحجوزات',
        titleAr: 'الحجوزات',
        icon: '📋',
        href: '/admin/bookings',
        color: 'bg-orange-500',
        description: 'إدارة الحجوزات والمواعيد'
      });
    }

    return actions;
  };

  const getStats = () => {
    const stats = [];

    if (subscriptionManager.hasPermission(userId, 'prop_read')) {
      stats.push({
        id: 'properties',
        title: 'العقارات',
        value: properties.length,
        icon: '🏢',
        color: 'bg-blue-500',
        href: '/manage-properties'
      });
    }

    if (subscriptionManager.hasPermission(userId, 'booking_read')) {
      stats.push({
        id: 'bookings',
        title: 'الحجوزات',
        value: bookings.length,
        icon: '📅',
        color: 'bg-green-500',
        href: '/admin/bookings'
      });
    }

    if (subscriptionManager.hasPermission(userId, 'task_read')) {
      stats.push({
        id: 'tasks',
        title: 'المهام',
        value: tasks.length,
        icon: '⚡',
        color: 'bg-purple-500',
        href: '/admin/tasks'
      });
    }

    if (subscriptionManager.hasPermission(userId, 'calendar_read')) {
      stats.push({
        id: 'events',
        title: 'أحداث التقويم',
        value: calendarEvents.length,
        icon: '📅',
        color: 'bg-orange-500',
        href: '/calendar'
      });
    }

    return stats;
  };

  const getRecentActivity = () => {
    const activities = [];

    // إضافة أحداث التقويم الأخيرة
    if (calendarEvents.length > 0) {
      calendarEvents.slice(0, 3).forEach(event => {
        activities.push({
          id: `calendar_${event.id}`,
          type: 'calendar',
          title: event.title,
          time: event.startDate,
          icon: '📅',
          color: 'text-blue-600'
        });
      });
    }

    // إضافة المهام الأخيرة
    if (tasks.length > 0) {
      tasks.slice(0, 3).forEach(task => {
        activities.push({
          id: `task_${task.id}`,
          type: 'task',
          title: task.title,
          time: task.createdAt,
          icon: '⚡',
          color: 'text-purple-600'
        });
      });
    }

    // إضافة الحجوزات الأخيرة
    if (bookings.length > 0) {
      bookings.slice(0, 3).forEach(booking => {
        activities.push({
          id: `booking_${booking.id}`,
          type: 'booking',
          title: `حجز جديد - ${booking.propertyTitle}`,
          time: booking.createdAt,
          icon: '📋',
          color: 'text-green-600'
        });
      });
    }

    return activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 6);
  };

  return (
    <div className="space-y-6">
      {/* Subscription Status */}
      {subscription && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">حالة الاشتراك</h3>
              <p className="text-gray-600">
                {subscription.planId === 'basic' ? 'الخطة الأساسية' :
                 subscription.planId === 'standard' ? 'الخطة المعيارية' :
                 subscription.planId === 'premium' ? 'الخطة المميزة' : 'الخطة المؤسسية'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">الأيام المتبقية</p>
              <p className="text-2xl font-bold text-gray-900">{subscription.remainingDays}</p>
            </div>
            <Link 
              href="/subscriptions"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              إدارة الاشتراك
            </Link>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">الإجراءات السريعة</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {getQuickActions().map(action => (
            <Link
              key={action.id}
              href={action.href}
              className={`${action.color} hover:opacity-90 text-white p-4 rounded-lg transition-colors`}
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">{action.icon}</span>
                <div>
                  <h4 className="font-semibold">{action.titleAr}</h4>
                  <p className="text-sm opacity-90">{action.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {getStats().map(stat => (
          <Link
            key={stat.id}
            href={stat.href}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center mr-4`}>
                <span className="text-2xl text-white">{stat.icon}</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-gray-600">{stat.title}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">النشاط الأخير</h3>
        <div className="space-y-3">
          {getRecentActivity().map(activity => (
            <div key={activity.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
              <span className={`text-xl mr-3 ${activity.color}`}>{activity.icon}</span>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{activity.title}</p>
                <p className="text-sm text-gray-600">
                  {new Date(activity.time).toLocaleDateString('ar-SA')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Preview */}
      {canManageCalendar() && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">التقويم</h3>
            <Link 
              href="/calendar"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              عرض كامل
            </Link>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                {day}
              </div>
            ))}
            {Array.from({ length: 35 }, (_, i) => (
              <div key={i} className="h-8 w-8 flex items-center justify-center text-sm text-gray-600">
                {i + 1}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tasks Preview */}
      {canManageTasks() && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">المهام</h3>
            <Link 
              href="/admin/tasks"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              عرض كامل
            </Link>
          </div>
          <div className="space-y-3">
            {tasks.slice(0, 5).map(task => (
              <div key={task.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-purple-600 mr-3">⚡</span>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{task.title}</p>
                  <p className="text-sm text-gray-600">
                    الحالة: {task.status === 'pending' ? 'في الانتظار' :
                             task.status === 'in_progress' ? 'قيد التنفيذ' :
                             task.status === 'completed' ? 'مكتملة' : 'ملغاة'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
