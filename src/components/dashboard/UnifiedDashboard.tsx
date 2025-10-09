// لوحة التحكم الموحدة المحسنة
import React, { useState, useEffect } from 'react';
import InstantLink from '@/components/InstantLink';
import { subscriptionManager } from '@/lib/subscriptionSystem';

interface UnifiedDashboardProps {
  userType: 'admin' | 'property-owner' | 'customer';
  userId: string;
}

export default function UnifiedDashboard({ userType, userId }: UnifiedDashboardProps) {
  const [userAuth, setUserAuth] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    properties: 0,
    bookings: 0,
    tasks: 0,
    revenue: 0
  });

  useEffect(() => {
    loadUserData();
    loadStats();
  }, [userId]);

  const loadUserData = async () => {
    try {
      // جلب معلومات المستخدم من localStorage
      const authData = localStorage.getItem('ain_auth');
      if (authData) {
        const user = JSON.parse(authData);
        setUserAuth(user);
        setSubscription(user.subscription);
      }

      // جلب معلومات الاشتراك من API
      const subRes = await fetch(`/api/subscriptions/user?userId=${userId}`);
      if (subRes.ok) {
        const subData = await subRes.json();
        setSubscription(subData.stats);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const [propertiesRes, bookingsRes, tasksRes] = await Promise.all([
        fetch('/api/properties'),
        fetch('/api/bookings'),
        fetch('/api/tasks/simple')
      ]);

      const properties = propertiesRes.ok ? await propertiesRes.json() : { properties: [] };
      const bookings = bookingsRes.ok ? await bookingsRes.json() : { bookings: [] };
      const tasks = tasksRes.ok ? await tasksRes.json() : { tasks: [] };

      setStats({
        properties: properties.properties?.length || 0,
        bookings: bookings.bookings?.length || 0,
        tasks: tasks.tasks?.length || 0,
        revenue: 0 // سيتم حسابه لاحقاً
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const canAddProperty = () => {
    if (!subscription) return false;
    return subscriptionManager.hasPermission(userId, 'prop_write') && 
           subscriptionManager.checkLimit(userId, 'properties');
  };

  const canManageCalendar = () => {
    if (!subscription) return false;
    return subscriptionManager.hasPermission(userId, 'calendar_write');
  };

  const canManageTasks = () => {
    if (!subscription) return false;
    return subscriptionManager.hasPermission(userId, 'task_write');
  };

  const getQuickActions = () => {
    const actions = [];

    // إضافة عقار
    if (canAddProperty()) {
      actions.push({
        id: 'add-property',
        title: 'إضافة عقار',
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
        icon: '📋',
        href: '/admin/bookings',
        color: 'bg-orange-500',
        description: 'إدارة الحجوزات والمواعيد'
      });
    }

    return actions;
  };

  const getStatsCards = () => {
    const cards = [];

    if (subscriptionManager.hasPermission(userId, 'prop_read')) {
      cards.push({
        id: 'properties',
        title: 'العقارات',
        value: stats.properties,
        icon: '🏢',
        color: 'bg-blue-500',
        href: '/manage-properties',
        limit: subscription?.limits?.properties || 0
      });
    }

    if (subscriptionManager.hasPermission(userId, 'booking_read')) {
      cards.push({
        id: 'bookings',
        title: 'الحجوزات',
        value: stats.bookings,
        icon: '📅',
        color: 'bg-green-500',
        href: '/admin/bookings',
        limit: subscription?.limits?.bookings || 0
      });
    }

    if (subscriptionManager.hasPermission(userId, 'task_read')) {
      cards.push({
        id: 'tasks',
        title: 'المهام',
        value: stats.tasks,
        icon: '⚡',
        color: 'bg-purple-500',
        href: '/admin/tasks',
        limit: -1
      });
    }

    return cards;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              مرحباً {userAuth?.name || 'مستخدم'}
            </h2>
            <p className="opacity-90">
              {userType === 'admin' && 'لوحة إدارة النظام الكاملة'}
              {userType === 'property-owner' && 'لوحة إدارة العقارات والملاك'}
              {userType === 'customer' && 'لوحة العميل'}
            </p>
          </div>
          {subscription && (
            <div className="text-right">
              <p className="text-sm opacity-90">الخطة الحالية</p>
              <p className="text-lg font-semibold">{subscription.planName}</p>
              <p className="text-sm opacity-90">{subscription.remainingDays} يوم متبقي</p>
            </div>
          )}
        </div>
      </div>

      {/* Subscription Status */}
      {subscription && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">حالة الاشتراك</h3>
            <InstantLink 
              href="/subscriptions"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              إدارة الاشتراك
            </InstantLink>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">العقارات</h4>
              <p className="text-2xl font-bold text-blue-600">
                {subscription.usage.properties}/{subscription.limits.properties === -1 ? '∞' : subscription.limits.properties}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">الوحدات</h4>
              <p className="text-2xl font-bold text-green-600">
                {subscription.usage.units}/{subscription.limits.units === -1 ? '∞' : subscription.limits.units}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">الحجوزات</h4>
              <p className="text-2xl font-bold text-purple-600">
                {subscription.usage.bookings}/{subscription.limits.bookings === -1 ? '∞' : subscription.limits.bookings}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">المستخدمون</h4>
              <p className="text-2xl font-bold text-orange-600">
                {subscription.usage.users}/{subscription.limits.users === -1 ? '∞' : subscription.limits.users}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">الإجراءات السريعة</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {getQuickActions().map(action => (
            <InstantLink 
              key={action.id}
              href={action.href}
              className={`${action.color} hover:opacity-90 text-white p-4 rounded-lg transition-colors`}
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">{action.icon}</span>
                <div>
                  <h4 className="font-semibold">{action.title}</h4>
                  <p className="text-sm opacity-90">{action.description}</p>
                </div>
              </div>
            </InstantLink>
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {getStatsCards().map(stat => (
          <InstantLink 
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
                {stat.limit !== -1 && (
                  <p className="text-xs text-gray-500">
                    من أصل {stat.limit}
                  </p>
                )}
              </div>
            </div>
          </InstantLink>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">النشاط الأخير</h3>
        <div className="space-y-3">
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-blue-600 mr-3">🏢</span>
            <div className="flex-1">
              <p className="font-medium text-gray-900">تم إضافة عقار جديد</p>
              <p className="text-sm text-gray-600">منذ ساعتين</p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-green-600 mr-3">📅</span>
            <div className="flex-1">
              <p className="font-medium text-gray-900">حجز جديد تم تأكيده</p>
              <p className="text-sm text-gray-600">منذ 4 ساعات</p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-purple-600 mr-3">⚡</span>
            <div className="flex-1">
              <p className="font-medium text-gray-900">مهمة جديدة تم إنشاؤها</p>
              <p className="text-sm text-gray-600">منذ 6 ساعات</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
