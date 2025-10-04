// src/pages/settings.tsx - الإعدادات
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  FiSettings, FiUser, FiBell, FiShield, FiGlobe, FiPalette,
  FiSave, FiRefreshCw, FiEye, FiEyeOff, FiKey, FiMail,
  FiPhone, FiMapPin, FiCalendar, FiClock, FiDownload,
  FiUpload, FiTrash2, FiEdit, FiPlus, FiX
} from 'react-icons/fi';
import Layout from '@/components/layout/Layout';

interface UserSettings {
  id: string;
  userId: string;
  profile: {
    name: string;
    email: string;
    phone: string;
    avatar?: string;
    bio?: string;
    location?: string;
    timezone: string;
    language: string;
  };
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    marketing: boolean;
    security: boolean;
    maintenance: boolean;
    bookings: boolean;
    payments: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    showEmail: boolean;
    showPhone: boolean;
    showLocation: boolean;
    allowMessages: boolean;
    dataSharing: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    loginAlerts: boolean;
    sessionTimeout: number;
    passwordExpiry: number;
    allowedIPs: string[];
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    primaryColor: string;
    fontSize: 'small' | 'medium' | 'large';
    language: string;
    dateFormat: string;
    timeFormat: '12h' | '24h';
  };
  preferences: {
    defaultView: 'grid' | 'list';
    itemsPerPage: number;
    autoSave: boolean;
    showTutorials: boolean;
    compactMode: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

interface NotificationSettings {
  id: string;
  userId: string;
  type: string;
  enabled: boolean;
  channels: string[];
  frequency: 'immediate' | 'daily' | 'weekly' | 'monthly';
  createdAt: string;
  updatedAt: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [notifications, setNotifications] = useState<NotificationSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // تحميل الإعدادات
      const settingsResponse = await fetch('/api/settings/user');
      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();
        setSettings(settingsData.settings);
      }

      // تحميل إعدادات الإشعارات
      const notificationsResponse = await fetch('/api/settings/notifications');
      if (notificationsResponse.ok) {
        const notificationsData = await notificationsResponse.json();
        setNotifications(notificationsData.notifications || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const response = await fetch('/api/settings/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        // إظهار رسالة نجاح
        console.log('Settings saved successfully');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (path: string, value: any) => {
    if (!settings) return;

    const keys = path.split('.');
    const newSettings = { ...settings };
    let current = newSettings;

    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i] as keyof typeof current] as any;
    }

    current[keys[keys.length - 1] as keyof typeof current] = value;
    setSettings(newSettings);
  };

  const updateNotification = (id: string, updates: Partial<NotificationSettings>) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === id ? { ...notification, ...updates } : notification
    ));
  };

  const tabs = [
    { id: 'profile', name: 'الملف الشخصي', icon: FiUser },
    { id: 'notifications', name: 'الإشعارات', icon: FiBell },
    { id: 'privacy', name: 'الخصوصية', icon: FiShield },
    { id: 'security', name: 'الأمان', icon: FiKey },
    { id: 'appearance', name: 'المظهر', icon: FiPalette },
    { id: 'preferences', name: 'التفضيلات', icon: FiSettings }
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!settings) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <FiSettings className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد إعدادات</h3>
            <p className="mt-1 text-sm text-gray-500">
              حدث خطأ في تحميل الإعدادات.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>الإعدادات - عين عُمان</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">الإعدادات</h1>
                <p className="mt-1 text-sm text-gray-500">
                  إدارة إعدادات حسابك وتفضيلاتك
                </p>
              </div>
              <div className="flex space-x-3 rtl:space-x-reverse">
                <button
                  onClick={saveSettings}
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
                >
                  {saving ? (
                    <FiRefreshCw className="w-4 h-4 ml-2 animate-spin" />
                  ) : (
                    <FiSave className="w-4 h-4 ml-2" />
                  )}
                  {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* قائمة التبويبات */}
            <div className="lg:col-span-1">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-4 h-4 ml-3" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* محتوى التبويبات */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-sm p-6">
                {/* الملف الشخصي */}
                {activeTab === 'profile' && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">الملف الشخصي</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          الاسم الكامل
                        </label>
                        <input
                          type="text"
                          value={settings.profile.name}
                          onChange={(e) => updateSetting('profile.name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          البريد الإلكتروني
                        </label>
                        <input
                          type="email"
                          value={settings.profile.email}
                          onChange={(e) => updateSetting('profile.email', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          رقم الهاتف
                        </label>
                        <input
                          type="tel"
                          value={settings.profile.phone}
                          onChange={(e) => updateSetting('profile.phone', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          الموقع
                        </label>
                        <input
                          type="text"
                          value={settings.profile.location || ''}
                          onChange={(e) => updateSetting('profile.location', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          المنطقة الزمنية
                        </label>
                        <select
                          value={settings.profile.timezone}
                          onChange={(e) => updateSetting('profile.timezone', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="Asia/Muscat">مسقط (GMT+4)</option>
                          <option value="Asia/Dubai">دبي (GMT+4)</option>
                          <option value="Asia/Riyadh">الرياض (GMT+3)</option>
                          <option value="Europe/London">لندن (GMT+0)</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          اللغة
                        </label>
                        <select
                          value={settings.profile.language}
                          onChange={(e) => updateSetting('profile.language', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="ar">العربية</option>
                          <option value="en">English</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        نبذة شخصية
                      </label>
                      <textarea
                        value={settings.profile.bio || ''}
                        onChange={(e) => updateSetting('profile.bio', e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="اكتب نبذة عن نفسك..."
                      />
                    </div>
                  </div>
                )}

                {/* الإشعارات */}
                {activeTab === 'notifications' && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">الإشعارات</h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-md font-medium text-gray-900 mb-4">إشعارات البريد الإلكتروني</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">إشعارات عامة</span>
                            <input
                              type="checkbox"
                              checked={settings.notifications.email}
                              onChange={(e) => updateSetting('notifications.email', e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">إشعارات التسويق</span>
                            <input
                              type="checkbox"
                              checked={settings.notifications.marketing}
                              onChange={(e) => updateSetting('notifications.marketing', e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">إشعارات الأمان</span>
                            <input
                              type="checkbox"
                              checked={settings.notifications.security}
                              onChange={(e) => updateSetting('notifications.security', e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-md font-medium text-gray-900 mb-4">إشعارات التطبيق</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">إشعارات الحجوزات</span>
                            <input
                              type="checkbox"
                              checked={settings.notifications.bookings}
                              onChange={(e) => updateSetting('notifications.bookings', e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">إشعارات المدفوعات</span>
                            <input
                              type="checkbox"
                              checked={settings.notifications.payments}
                              onChange={(e) => updateSetting('notifications.payments', e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">إشعارات الصيانة</span>
                            <input
                              type="checkbox"
                              checked={settings.notifications.maintenance}
                              onChange={(e) => updateSetting('notifications.maintenance', e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* الخصوصية */}
                {activeTab === 'privacy' && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">الخصوصية</h2>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          رؤية الملف الشخصي
                        </label>
                        <select
                          value={settings.privacy.profileVisibility}
                          onChange={(e) => updateSetting('privacy.profileVisibility', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="public">عام</option>
                          <option value="friends">الأصدقاء فقط</option>
                          <option value="private">خاص</option>
                        </select>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">إظهار البريد الإلكتروني</span>
                          <input
                            type="checkbox"
                            checked={settings.privacy.showEmail}
                            onChange={(e) => updateSetting('privacy.showEmail', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">إظهار رقم الهاتف</span>
                          <input
                            type="checkbox"
                            checked={settings.privacy.showPhone}
                            onChange={(e) => updateSetting('privacy.showPhone', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">إظهار الموقع</span>
                          <input
                            type="checkbox"
                            checked={settings.privacy.showLocation}
                            onChange={(e) => updateSetting('privacy.showLocation', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">السماح بالرسائل</span>
                          <input
                            type="checkbox"
                            checked={settings.privacy.allowMessages}
                            onChange={(e) => updateSetting('privacy.allowMessages', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* الأمان */}
                {activeTab === 'security' && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">الأمان</h2>
                    
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-md font-medium text-gray-900">المصادقة الثنائية</h3>
                          <p className="text-sm text-gray-500">إضافة طبقة أمان إضافية لحسابك</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.security.twoFactorAuth}
                          onChange={(e) => updateSetting('security.twoFactorAuth', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-md font-medium text-gray-900">تنبيهات تسجيل الدخول</h3>
                          <p className="text-sm text-gray-500">تلقي إشعارات عند تسجيل الدخول من أجهزة جديدة</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.security.loginAlerts}
                          onChange={(e) => updateSetting('security.loginAlerts', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          انتهاء صلاحية الجلسة (بالدقائق)
                        </label>
                        <input
                          type="number"
                          value={settings.security.sessionTimeout}
                          onChange={(e) => updateSetting('security.sessionTimeout', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          انتهاء صلاحية كلمة المرور (بالأيام)
                        </label>
                        <input
                          type="number"
                          value={settings.security.passwordExpiry}
                          onChange={(e) => updateSetting('security.passwordExpiry', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          عناوين IP المسموحة
                        </label>
                        <textarea
                          value={settings.security.allowedIPs.join('\n')}
                          onChange={(e) => updateSetting('security.allowedIPs', e.target.value.split('\n').filter(ip => ip.trim()))}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="أدخل عناوين IP مفصولة بأسطر جديدة"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* المظهر */}
                {activeTab === 'appearance' && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">المظهر</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          المظهر
                        </label>
                        <select
                          value={settings.appearance.theme}
                          onChange={(e) => updateSetting('appearance.theme', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="light">فاتح</option>
                          <option value="dark">داكن</option>
                          <option value="auto">تلقائي</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          اللون الأساسي
                        </label>
                        <select
                          value={settings.appearance.primaryColor}
                          onChange={(e) => updateSetting('appearance.primaryColor', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="blue">أزرق</option>
                          <option value="green">أخضر</option>
                          <option value="purple">بنفسجي</option>
                          <option value="red">أحمر</option>
                          <option value="orange">برتقالي</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          حجم الخط
                        </label>
                        <select
                          value={settings.appearance.fontSize}
                          onChange={(e) => updateSetting('appearance.fontSize', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="small">صغير</option>
                          <option value="medium">متوسط</option>
                          <option value="large">كبير</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          تنسيق التاريخ
                        </label>
                        <select
                          value={settings.appearance.dateFormat}
                          onChange={(e) => updateSetting('appearance.dateFormat', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="DD/MM/YYYY">يوم/شهر/سنة</option>
                          <option value="MM/DD/YYYY">شهر/يوم/سنة</option>
                          <option value="YYYY-MM-DD">سنة-شهر-يوم</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          تنسيق الوقت
                        </label>
                        <select
                          value={settings.appearance.timeFormat}
                          onChange={(e) => updateSetting('appearance.timeFormat', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="12h">12 ساعة</option>
                          <option value="24h">24 ساعة</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* التفضيلات */}
                {activeTab === 'preferences' && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">التفضيلات</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          العرض الافتراضي
                        </label>
                        <select
                          value={settings.preferences.defaultView}
                          onChange={(e) => updateSetting('preferences.defaultView', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="grid">شبكة</option>
                          <option value="list">قائمة</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          عدد العناصر في الصفحة
                        </label>
                        <select
                          value={settings.preferences.itemsPerPage}
                          onChange={(e) => updateSetting('preferences.itemsPerPage', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="10">10</option>
                          <option value="25">25</option>
                          <option value="50">50</option>
                          <option value="100">100</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="mt-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">الحفظ التلقائي</span>
                        <input
                          type="checkbox"
                          checked={settings.preferences.autoSave}
                          onChange={(e) => updateSetting('preferences.autoSave', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">إظهار الدروس التعليمية</span>
                        <input
                          type="checkbox"
                          checked={settings.preferences.showTutorials}
                          onChange={(e) => updateSetting('preferences.showTutorials', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">الوضع المدمج</span>
                        <input
                          type="checkbox"
                          checked={settings.preferences.compactMode}
                          onChange={(e) => updateSetting('preferences.compactMode', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
