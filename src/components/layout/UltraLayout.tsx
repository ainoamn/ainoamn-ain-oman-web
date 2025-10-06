"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import { 
  Cog6ToothIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  SparklesIcon,
  BellIcon,
  HeartIcon,
  UserIcon,
  ArrowRightIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
  StarIcon,
  FireIcon,
  GiftIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  ScaleIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ShareIcon,
  BookmarkIcon,
  EyeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon as XMarkIconOutline
} from "@heroicons/react/24/outline";
import { 
  SparklesIcon as SparklesIconSolid,
  StarIcon as StarIconSolid,
  FireIcon as FireIconSolid,
  ShieldCheckIcon as ShieldCheckIconSolid,
  CheckCircleIcon as CheckCircleIconSolid
} from "@heroicons/react/24/solid";

import UltraHeader from "./UltraHeader";
import UltraFooter from "./UltraFooter";
import UltraAnnouncementBar from "./UltraAnnouncementBar";

// Types
interface LayoutConfig {
  showHeader: boolean;
  showFooter: boolean;
  showAnnouncementBar: boolean;
  headerHeight: string;
  footerHeight: string;
  announcementBarHeight: string;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  currency: string;
  enableAnimations: boolean;
  enableSounds: boolean;
  enableNotifications: boolean;
  enableLiveStats: boolean;
  enableQuickActions: boolean;
  enableSocialSharing: boolean;
  enableThemeSwitcher: boolean;
  enableLanguageSwitcher: boolean;
  enableCurrencySwitcher: boolean;
  customCSS?: string;
  customJS?: string;
}

interface QuickAction {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  description: string;
  isNew?: boolean;
  isHot?: boolean;
  badge?: string;
  color?: string;
}

interface LiveStat {
  id: string;
  label: string;
  value: number;
  unit: string;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ComponentType<any>;
  color: string;
}

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
  icon: React.ComponentType<any>;
}

// Main Component
export default function UltraLayout({
  children,
  config: customConfig,
  className = "",
  ...props
}: {
  children: React.ReactNode;
  config?: Partial<LayoutConfig>;
  className?: string;
  [key: string]: any;
}) {
  const router = useRouter();
  const [config, setConfig] = useState<LayoutConfig>({
    showHeader: true,
    showFooter: true,
    showAnnouncementBar: true,
    headerHeight: '64px',
    footerHeight: 'auto',
    announcementBarHeight: '60px',
    theme: 'auto',
    language: 'ar',
    currency: 'OMR',
    enableAnimations: true,
    enableSounds: true,
    enableNotifications: true,
    enableLiveStats: true,
    enableQuickActions: true,
    enableSocialSharing: true,
    enableThemeSwitcher: true,
    enableLanguageSwitcher: true,
    enableCurrencySwitcher: true,
    ...customConfig
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [isLiveStatsOpen, setIsLiveStatsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [liveStats, setLiveStats] = useState<LiveStat[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const settingsRef = useRef<HTMLDivElement>(null);
  const quickActionsRef = useRef<HTMLDivElement>(null);
  const liveStatsRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Quick Actions
  const quickActions: QuickAction[] = [
    {
      id: 'add-property',
      label: 'إضافة عقار',
      href: '/properties/new',
      icon: BuildingOfficeIcon,
      description: 'إضافة عقار جديد للمنصة',
      isNew: true,
      color: 'bg-blue-600'
    },
    {
      id: 'new-legal-case',
      label: 'قضية قانونية',
      href: '/legal/new',
      icon: ScaleIcon,
      description: 'إنشاء قضية قانونية جديدة',
      isHot: true,
      color: 'bg-purple-600'
    },
    {
      id: 'analytics',
      label: 'التحليلات',
      href: '/analytics',
      icon: ChartBarIcon,
      description: 'عرض التقارير والإحصائيات',
      color: 'bg-green-600'
    },
    {
      id: 'users',
      label: 'المستخدمين',
      href: '/users',
      icon: UserGroupIcon,
      description: 'إدارة المستخدمين',
      color: 'bg-orange-600'
    },
    {
      id: 'documents',
      label: 'المستندات',
      href: '/documents',
      icon: DocumentTextIcon,
      description: 'إدارة المستندات',
      color: 'bg-teal-600'
    },
    {
      id: 'support',
      label: 'الدعم',
      href: '/support',
      icon: ChatBubbleLeftRightIcon,
      description: 'مركز المساعدة',
      color: 'bg-pink-600'
    }
  ];

  // Mock Live Stats
  const mockLiveStats: LiveStat[] = [
    {
      id: 'online-users',
      label: 'مستخدم نشط',
      value: 1247,
      unit: '',
      change: 5.2,
      changeType: 'increase',
      icon: UserIcon,
      color: 'text-green-600'
    },
    {
      id: 'active-properties',
      label: 'عقار متاح',
      value: 3421,
      unit: '',
      change: 2.1,
      changeType: 'increase',
      icon: BuildingOfficeIcon,
      color: 'text-blue-600'
    },
    {
      id: 'completed-deals',
      label: 'صفقة مكتملة',
      value: 1856,
      unit: '',
      change: 8.7,
      changeType: 'increase',
      icon: CheckCircleIcon,
      color: 'text-purple-600'
    },
    {
      id: 'satisfaction-rate',
      label: 'معدل الرضا',
      value: 98.5,
      unit: '%',
      change: 0.3,
      changeType: 'increase',
      icon: StarIcon,
      color: 'text-yellow-600'
    }
  ];

  // Mock Notifications
  const mockNotifications: Notification[] = [
    {
      id: '1',
      type: 'success',
      title: 'تم بنجاح!',
      message: 'تم إضافة العقار الجديد بنجاح',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      isRead: false,
      actionUrl: '/properties/new',
      icon: CheckCircleIcon
    },
    {
      id: '2',
      type: 'info',
      title: 'تحديث النظام',
      message: 'تم تحديث النظام بنجاح',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      isRead: false,
      actionUrl: '/updates',
      icon: InformationCircleIcon
    },
    {
      id: '3',
      type: 'warning',
      title: 'تنبيه مهم',
      message: 'سيتم إجراء صيانة للنظام غداً',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      isRead: true,
      actionUrl: '/maintenance',
      icon: ExclamationTriangleIcon
    }
  ];

  // Effects
  useEffect(() => {
    // Load saved config
    const savedConfig = localStorage.getItem('ultra-layout-config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading layout config:', error);
      }
    }

    // Initialize mock data
    setLiveStats(mockLiveStats);
    setNotifications(mockNotifications);

    // Update time
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Update live stats
    const statsInterval = setInterval(() => {
      setLiveStats(prev => prev.map(stat => ({
        ...stat,
        value: stat.value + Math.floor(Math.random() * 10 - 5),
        change: Math.max(0, stat.change + (Math.random() * 0.5 - 0.25))
      })));
    }, 10000);

    // Online status
    const handleOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    return () => {
      clearInterval(timeInterval);
      clearInterval(statsInterval);
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  useEffect(() => {
    // Save config changes
    localStorage.setItem('ultra-layout-config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    // Handle click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
      if (quickActionsRef.current && !quickActionsRef.current.contains(event.target as Node)) {
        setIsQuickActionsOpen(false);
      }
      if (liveStatsRef.current && !liveStatsRef.current.contains(event.target as Node)) {
        setIsLiveStatsOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handlers
  const handleConfigChange = (key: keyof LayoutConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'auto') => {
    handleConfigChange('theme', theme);
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    } else {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  };

  const handleLanguageChange = (language: string) => {
    handleConfigChange('language', language);
    // Handle language change logic
  };

  const handleCurrencyChange = (currency: string) => {
    handleConfigChange('currency', currency);
    // Handle currency change logic
  };

  const handleNotificationClick = (notification: Notification) => {
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
    );
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  // Render functions
  const renderFloatingControls = () => (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col gap-3">
      {/* Quick Actions */}
      {config.enableQuickActions && (
        <div className="relative" ref={quickActionsRef}>
          <button
            onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
            className="w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center"
            title="الإجراءات السريعة"
          >
            <PlusIcon className="w-6 h-6" />
          </button>
          
          {isQuickActionsOpen && (
            <div className="absolute bottom-16 right-0 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">الإجراءات السريعة</h3>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <a
                    key={action.id}
                    href={action.href}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                    onClick={() => setIsQuickActionsOpen(false)}
                  >
                    <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                      <action.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">{action.label}</span>
                        {action.isNew && (
                          <span className="px-2 py-0.5 text-xs bg-green-100 text-green-600 rounded-full">جديد</span>
                        )}
                        {action.isHot && (
                          <span className="px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full">شائع</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{action.description}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Live Stats */}
      {config.enableLiveStats && (
        <div className="relative" ref={liveStatsRef}>
          <button
            onClick={() => setIsLiveStatsOpen(!isLiveStatsOpen)}
            className="w-14 h-14 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center"
            title="الإحصائيات المباشرة"
          >
            <ChartBarIcon className="w-6 h-6" />
          </button>
          
          {isLiveStatsOpen && (
            <div className="absolute bottom-16 right-0 w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">إحصائيات مباشرة</h3>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-500">مباشر</span>
                </div>
              </div>
              <div className="space-y-3">
                {liveStats.map((stat) => (
                  <div key={stat.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <div className="flex items-center gap-3">
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{stat.label}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {stat.changeType === 'increase' ? '+' : ''}{stat.change.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {stat.value.toLocaleString()}{stat.unit}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Notifications */}
      {config.enableNotifications && (
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="w-14 h-14 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center relative"
            title="الإشعارات"
          >
            <BellIcon className="w-6 h-6" />
            {notifications.filter(n => !n.isRead).length > 0 && (
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {notifications.filter(n => !n.isRead).length}
              </span>
            )}
          </button>
          
          {isNotificationsOpen && (
            <div className="absolute bottom-16 right-0 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">الإشعارات</h3>
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    تعيين الكل كمقروء
                  </button>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                        !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          notification.type === 'success' ? 'bg-green-100 text-green-600' :
                          notification.type === 'info' ? 'bg-blue-100 text-blue-600' :
                          notification.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          <notification.icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">{notification.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            {notification.timestamp.toLocaleTimeString('ar-SA')}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <BellIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>لا توجد إشعارات جديدة</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Settings */}
      <div className="relative" ref={settingsRef}>
        <button
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          className="w-14 h-14 bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center"
          title="الإعدادات"
        >
          <Cog6ToothIcon className="w-6 h-6" />
        </button>
        
        {isSettingsOpen && (
          <div className="absolute bottom-16 right-0 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">إعدادات التخطيط</h3>
            
            {/* Theme */}
            {config.enableThemeSwitcher && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">السمة</label>
                <div className="flex gap-2">
                  {[
                    { value: 'light', icon: SunIcon, label: 'فاتح' },
                    { value: 'dark', icon: MoonIcon, label: 'داكن' },
                    { value: 'auto', icon: ComputerDesktopIcon, label: 'تلقائي' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleThemeChange(option.value as any)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                        config.theme === option.value
                          ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <option.icon className="w-4 h-4" />
                      <span className="text-sm">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Language */}
            {config.enableLanguageSwitcher && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">اللغة</label>
                <select
                  value={config.language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ar">العربية</option>
                  <option value="en">English</option>
                </select>
              </div>
            )}

            {/* Currency */}
            {config.enableCurrencySwitcher && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">العملة</label>
                <select
                  value={config.currency}
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="OMR">ريال عماني</option>
                  <option value="AED">درهم إماراتي</option>
                  <option value="SAR">ريال سعودي</option>
                  <option value="USD">دولار أمريكي</option>
                </select>
              </div>
            )}

            {/* Toggles */}
            <div className="space-y-3">
              {[
                { key: 'enableAnimations', label: 'الرسوم المتحركة' },
                { key: 'enableSounds', label: 'الأصوات' },
                { key: 'enableNotifications', label: 'الإشعارات' },
                { key: 'enableLiveStats', label: 'الإحصائيات المباشرة' },
                { key: 'enableQuickActions', label: 'الإجراءات السريعة' },
                { key: 'enableSocialSharing', label: 'المشاركة الاجتماعية' }
              ].map((toggle) => (
                <div key={toggle.key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{toggle.label}</span>
                  <button
                    onClick={() => handleConfigChange(toggle.key as keyof LayoutConfig, !config[toggle.key as keyof LayoutConfig])}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      config[toggle.key as keyof LayoutConfig]
                        ? 'bg-blue-600'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      config[toggle.key as keyof LayoutConfig] ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderOnlineStatus = () => (
    !isOnline && (
      <div className="fixed top-0 left-0 right-0 z-50 bg-red-500 text-white text-center py-2 text-sm">
        <div className="flex items-center justify-center gap-2">
          <ExclamationTriangleIcon className="w-4 h-4" />
          <span>لا يوجد اتصال بالإنترنت</span>
        </div>
      </div>
    )
  );

  const renderLoadingOverlay = () => (
    isLoading && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 dark:text-gray-300">جاري التحميل...</p>
        </div>
      </div>
    )
  );

  return (
    <div className={`ultra-layout ${className}`} {...props}>
      {/* Online Status */}
      {renderOnlineStatus()}

      {/* Loading Overlay */}
      {renderLoadingOverlay()}

      {/* Announcement Bar */}
      {config.showAnnouncementBar && (
        <UltraAnnouncementBar
          position="top"
          autoPlay={true}
          autoPlayInterval={5000}
          showControls={true}
          showProgress={true}
        />
      )}

      {/* Header */}
      {config.showHeader && <UltraHeader />}

      {/* Main Content */}
      <main 
        className="flex-1 transition-all duration-300"
        style={{
          paddingTop: config.showHeader ? config.headerHeight : '0',
          paddingBottom: config.showFooter ? config.footerHeight : '0'
        }}
      >
        {children}
      </main>

      {/* Footer */}
      {config.showFooter && <UltraFooter />}

      {/* Floating Controls */}
      {renderFloatingControls()}

      {/* Custom CSS */}
      {config.customCSS && (
        <style dangerouslySetInnerHTML={{ __html: config.customCSS }} />
      )}

      {/* Custom JS */}
      {config.customJS && (
        <script dangerouslySetInnerHTML={{ __html: config.customJS }} />
      )}
    </div>
  );
}
