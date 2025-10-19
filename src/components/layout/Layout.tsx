// src/components/layout/Layout.tsx - Ultra Layout Component
"use client";

import React, { useState, useEffect, useRef, createContext, useContext } from "react";
import { useRouter } from "next/router";
import InstantLink from '@/components/InstantLink';
import { 
  SparklesIcon,
  BellIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  PlayIcon,
  PauseIcon,
  HeartIcon,
  BookmarkIcon,
  ShareIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  GlobeAltIcon,
  ArrowUpIcon,
  BuildingOfficeIcon,
  ScaleIcon,
  ChartBarIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  StarIcon,
  EyeIcon,
  PlusIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline";
import { 
  HeartIcon as HeartIconSolid,
  StarIcon as StarIconSolid,
  CheckCircleIcon as CheckCircleIconSolid,
  ShieldCheckIcon as ShieldCheckIconSolid
} from "@heroicons/react/24/solid";

// Types
interface LayoutConfig {
  showHeader: boolean;
  showFooter: boolean;
  showSidebar: boolean;
  showBreadcrumbs: boolean;
  showBackButton: boolean;
  showSearchBar: boolean;
  showNotifications: boolean;
  showUserMenu: boolean;
  showThemeToggle: boolean;
  showMusicControls: boolean;
  showQuickActions: boolean;
  showLiveStats: boolean;
  showAnnouncementBar: boolean;
  headerStyle: 'default' | 'transparent' | 'fixed' | 'sticky';
  footerStyle: 'default' | 'minimal' | 'extended';
  sidebarStyle: 'default' | 'collapsible' | 'floating';
  theme: 'light' | 'dark' | 'auto';
  layout: 'default' | 'wide' | 'narrow' | 'fullscreen';
  animations: boolean;
  sounds: boolean;
  music: boolean;
  notifications: boolean;
  autoSave: boolean;
  realTimeUpdates: boolean;
  aiAssistance: boolean;
  accessibility: boolean;
  rtl: boolean;
  language: string;
  currency: string;
  timezone: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  permissions: string[];
  preferences: any;
  isOnline: boolean;
  lastSeen: Date;
  subscription: {
    plan: string;
    status: string;
    expiresAt: Date;
  };
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    href: string;
  };
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
}

interface LiveStat {
  id: string;
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ComponentType<any>;
  color: string;
}

// Context
const LayoutContext = createContext<{
  config: LayoutConfig;
  updateConfig: (updates: Partial<LayoutConfig>) => void;
  user: User | null;
  notifications: Notification[];
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  quickActions: QuickAction[];
  liveStats: LiveStat[];
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  isSearchOpen: boolean;
  toggleSearch: () => void;
  isUserMenuOpen: boolean;
  toggleUserMenu: () => void;
  isNotificationsOpen: boolean;
  toggleNotifications: () => void;
  isQuickActionsOpen: boolean;
  toggleQuickActions: () => void;
  isLiveStatsOpen: boolean;
  toggleLiveStats: () => void;
  isAnnouncementBarOpen: boolean;
  toggleAnnouncementBar: () => void;
  isMusicPlaying: boolean;
  toggleMusic: () => void;
  isSoundEnabled: boolean;
  toggleSound: () => void;
  currentTime: Date;
  theme: 'light' | 'dark' | 'auto';
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  language: string;
  setLanguage: (language: string) => void;
  currency: string;
  setCurrency: (currency: string) => void;
  timezone: string;
  setTimezone: (timezone: string) => void;
  isBackToTopVisible: boolean;
  scrollToTop: () => void;
  isOnline: boolean;
  connectionStatus: 'online' | 'offline' | 'slow';
  pageLoadTime: number;
  memoryUsage: number;
  cpuUsage: number;
  networkSpeed: number;
  batteryLevel: number;
  isCharging: boolean;
  deviceInfo: {
    type: 'mobile' | 'tablet' | 'desktop';
    os: string;
    browser: string;
    version: string;
  };
} | null>(null);

// Hook
export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};

// Main Component
interface LayoutProps {
  children: React.ReactNode;
  config?: Partial<LayoutConfig>;
  user?: User;
  notifications?: Notification[];
  quickActions?: QuickAction[];
  liveStats?: LiveStat[];
  className?: string;
}

export default function Layout({
  children,
  config: propConfig,
  user: propUser,
  notifications: propNotifications,
  quickActions: propQuickActions,
  liveStats: propLiveStats,
  className = ''
}: LayoutProps) {
  // State
  const [config, setConfig] = useState<LayoutConfig>({
    showHeader: true,
    showFooter: true,
    showSidebar: false,
    showBreadcrumbs: true,
    showBackButton: false,
    showSearchBar: true,
    showNotifications: true,
    showUserMenu: true,
    showThemeToggle: true,
    showMusicControls: true,
    showQuickActions: true,
    showLiveStats: true,
    showAnnouncementBar: true,
    headerStyle: 'default',
    footerStyle: 'default',
    sidebarStyle: 'default',
    theme: 'auto',
    layout: 'default',
    animations: true,
    sounds: true,
    music: false,
    notifications: true,
    autoSave: true,
    realTimeUpdates: true,
    aiAssistance: true,
    accessibility: true,
    rtl: true,
    language: 'ar',
    currency: 'OMR',
    timezone: 'Asia/Muscat',
    ...propConfig
  });

  const [user, setUser] = useState<User | null>(propUser || null);
  const [notifications, setNotifications] = useState<Notification[]>(propNotifications || []);
  const [quickActions, setQuickActions] = useState<QuickAction[]>(propQuickActions || []);
  const [liveStats, setLiveStats] = useState<LiveStat[]>(propLiveStats || []);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [isLiveStatsOpen, setIsLiveStatsOpen] = useState(false);
  const [isAnnouncementBarOpen, setIsAnnouncementBarOpen] = useState(true);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [isBackToTopVisible, setIsBackToTopVisible] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'slow'>('online');
  const [pageLoadTime, setPageLoadTime] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState(0);
  const [cpuUsage, setCpuUsage] = useState(0);
  const [networkSpeed, setNetworkSpeed] = useState(0);
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [isCharging, setIsCharging] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<{
    type: 'mobile' | 'tablet' | 'desktop';
    os: string;
    browser: string;
    version: string;
  }>({
    type: 'desktop',
    os: 'Unknown',
    browser: 'Unknown',
    version: 'Unknown'
  });

  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement>(null);
  const startTime = useRef(Date.now());

  // Effects
  useEffect(() => {
    const handleScroll = () => {
      setIsBackToTopVisible(window.scrollY > 300);
    };

    const updateTime = () => {
      setCurrentTime(new Date());
    };

    const updateStats = () => {
      setPageLoadTime(Date.now() - startTime.current);
      setMemoryUsage((performance as any).memory ? (performance as any).memory.usedJSHeapSize / 1024 / 1024 : 0);
      setCpuUsage(Math.random() * 100);
      setNetworkSpeed(Math.random() * 100);
    };

    const handleOnline = () => {
      setIsOnline(true);
      setConnectionStatus('online');
    };

    const handleOffline = () => {
      setIsOnline(false);
      setConnectionStatus('offline');
    };

    const handleConnectionChange = () => {
      if ((navigator as any).connection) {
        const connection = (navigator as any).connection;
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
          setConnectionStatus('slow');
        } else {
          setConnectionStatus('online');
        }
        setNetworkSpeed(connection.downlink || 0);
      }
    };

    const handleBatteryChange = () => {
      if ('getBattery' in navigator) {
        (navigator as any).getBattery().then((battery: any) => {
          setBatteryLevel(battery.level * 100);
          setIsCharging(battery.charging);
        });
      }
    };

    const detectDevice = () => {
      const userAgent = navigator.userAgent;
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const isTablet = /iPad|Android/i.test(userAgent) && !isMobile;
      
      let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
      if (isMobile) deviceType = 'mobile';
      else if (isTablet) deviceType = 'tablet';

      let os = 'Unknown';
      if (userAgent.includes('Windows')) os = 'Windows';
      else if (userAgent.includes('Mac')) os = 'macOS';
      else if (userAgent.includes('Linux')) os = 'Linux';
      else if (userAgent.includes('Android')) os = 'Android';
      else if (userAgent.includes('iOS')) os = 'iOS';

      let browser = 'Unknown';
      if (userAgent.includes('Chrome')) browser = 'Chrome';
      else if (userAgent.includes('Firefox')) browser = 'Firefox';
      else if (userAgent.includes('Safari')) browser = 'Safari';
      else if (userAgent.includes('Edge')) browser = 'Edge';

      setDeviceInfo({ type: deviceType, os, browser, version: 'Unknown' });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    if ((navigator as any).connection) {
      (navigator as any).connection.addEventListener('change', handleConnectionChange);
    }

    const timeInterval = setInterval(updateTime, 1000);
    const statsInterval = setInterval(updateStats, 5000);

    updateStats();
    handleBatteryChange();
    detectDevice();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if ((navigator as any).connection) {
        (navigator as any).connection.removeEventListener('change', handleConnectionChange);
      }
      
      clearInterval(timeInterval);
      clearInterval(statsInterval);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.user-menu') && !target.closest('.notifications-menu') && !target.closest('.quick-actions-menu') && !target.closest('.live-stats-menu')) {
        setIsUserMenuOpen(false);
        setIsNotificationsOpen(false);
        setIsQuickActionsOpen(false);
        setIsLiveStatsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (config.theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    } else {
      document.documentElement.classList.toggle('dark', config.theme === 'dark');
    }
  }, [config.theme]);

  useEffect(() => {
    if (config.rtl) {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  }, [config.rtl]);

  // Handlers
  const updateConfig = (updates: Partial<LayoutConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  const toggleQuickActions = () => {
    setIsQuickActionsOpen(!isQuickActionsOpen);
  };

  const toggleLiveStats = () => {
    setIsLiveStatsOpen(!isLiveStatsOpen);
  };

  const toggleAnnouncementBar = () => {
    setIsAnnouncementBarOpen(!isAnnouncementBarOpen);
  };

  const toggleMusic = () => {
    setIsMusicPlaying(!isMusicPlaying);
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const toggleSound = () => {
    setIsSoundEnabled(!isSoundEnabled);
  };

  const setTheme = (theme: 'light' | 'dark' | 'auto') => {
    updateConfig({ theme });
  };

  const setLanguage = (language: string) => {
    updateConfig({ language });
  };

  const setCurrency = (currency: string) => {
    updateConfig({ currency });
  };

  const setTimezone = (timezone: string) => {
    updateConfig({ timezone });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Context value
  const contextValue = {
    config,
    updateConfig,
    user,
    notifications,
    markNotificationAsRead,
    clearAllNotifications,
    quickActions,
    liveStats,
    isSidebarOpen,
    toggleSidebar,
    isSearchOpen,
    toggleSearch,
    isUserMenuOpen,
    toggleUserMenu,
    isNotificationsOpen,
    toggleNotifications,
    isQuickActionsOpen,
    toggleQuickActions,
    isLiveStatsOpen,
    toggleLiveStats,
    isAnnouncementBarOpen,
    toggleAnnouncementBar,
    isMusicPlaying,
    toggleMusic,
    isSoundEnabled,
    toggleSound,
    currentTime,
    theme: config.theme,
    setTheme,
    language: config.language,
    setLanguage,
    currency: config.currency,
    setCurrency,
    timezone: config.timezone,
    setTimezone,
    isBackToTopVisible,
    scrollToTop,
    isOnline,
    connectionStatus,
    pageLoadTime,
    memoryUsage,
    cpuUsage,
    networkSpeed,
    batteryLevel,
    isCharging,
    deviceInfo
  };

  // Render functions
  const renderAnnouncementBar = () => {
    if (!config.showAnnouncementBar || !isAnnouncementBarOpen) return null;

    return (
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 relative">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <SparklesIcon className="w-4 h-4" />
            <span>مرحباً بك في عين عُمان - منصة العقارات الذكية الجديدة!</span>
          </div>
          <button
            onClick={toggleAnnouncementBar}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  const renderHeader = () => {
    if (!config.showHeader) return null;

  return (
      <header className={`bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 ${
        config.headerStyle === 'fixed' ? 'fixed top-0 left-0 right-0 z-50' :
        config.headerStyle === 'sticky' ? 'sticky top-0 z-40' :
        ''
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors lg:hidden"
              >
                <Bars3Icon className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <SparklesIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">عين عُمان</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">منصة العقارات الذكية</p>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            {config.showSearchBar && (
              <div className="flex-1 max-w-lg mx-8 hidden md:block">
                <div className="relative">
                  <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="ابحث عن العقارات، القضايا، المزادات..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>
            )}

            {/* Right Side */}
            <div className="flex items-center gap-2">
              {/* Quick Actions */}
              {config.showQuickActions && (
                <button
                  onClick={toggleQuickActions}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
                >
                  <PlusIcon className="w-5 h-5" />
                  {quickActions.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></span>
                  )}
                </button>
              )}

              {/* Notifications */}
              {config.showNotifications && (
                <button
                  onClick={toggleNotifications}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
                >
                  <BellIcon className="w-5 h-5" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                  )}
                </button>
              )}

              {/* Live Stats */}
              {config.showLiveStats && (
                <button
                  onClick={toggleLiveStats}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
                >
                  <ChartBarIcon className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                </button>
              )}

              {/* Theme Toggle */}
              {config.showThemeToggle && (
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                  {[
                    { value: 'light', icon: SunIcon, label: 'فاتح' },
                    { value: 'dark', icon: MoonIcon, label: 'داكن' },
                    { value: 'auto', icon: ComputerDesktopIcon, label: 'تلقائي' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setTheme(option.value as any)}
                      className={`p-1.5 rounded-lg transition-all ${
                        config.theme === option.value
                          ? 'bg-white dark:bg-gray-700 shadow-sm'
                          : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                      title={option.label}
                    >
                      <option.icon className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              )}

              {/* Music Controls */}
              {config.showMusicControls && (
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                  <button
                    onClick={toggleMusic}
                    className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    title={isMusicPlaying ? 'إيقاف الموسيقى' : 'تشغيل الموسيقى'}
                  >
                    {isMusicPlaying ? (
                      <PauseIcon className="w-4 h-4" />
                    ) : (
                      <PlayIcon className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={toggleSound}
                    className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    title={isSoundEnabled ? 'إيقاف الصوت' : 'تشغيل الصوت'}
                  >
                    {isSoundEnabled ? (
                      <SpeakerWaveIcon className="w-4 h-4" />
                    ) : (
                      <SpeakerXMarkIcon className="w-4 h-4" />
                    )}
                  </button>
                </div>
              )}

              {/* User Menu */}
              {config.showUserMenu && (
                <button
                  onClick={toggleUserMenu}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <UserCircleIcon className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
    );
  };

  const renderSidebar = () => {
    if (!config.showSidebar) return null;

  return (
      <aside className={`bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 ${
        config.sidebarStyle === 'collapsible' ? 'fixed top-0 left-0 h-full z-40' :
        config.sidebarStyle === 'floating' ? 'absolute top-0 left-0 h-full z-40' :
        ''
      } ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
        <div className="w-64 h-full overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">القائمة</h2>
            <nav className="space-y-2">
              {quickActions.map((action) => (
                <InstantLink 
                  key={action.id}
                  href={action.href}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <action.icon className="w-5 h-5" />
                  <span>{action.label}</span>
                  {action.badge && (
                    <span className="ml-auto px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                      {action.badge}
                    </span>
                  )}
                </InstantLink>
              ))}
          </nav>
        </div>
        </div>
      </aside>
    );
  };

  const renderBreadcrumbs = () => {
    if (!config.showBreadcrumbs) return null;

    const pathSegments = router.asPath.split('/').filter(Boolean);
    
    return (
      <nav className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-sm">
            <InstantLink href="/" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              الرئيسية
            </InstantLink>
            {pathSegments.map((segment, index) => (
              <React.Fragment key={index}>
                <span className="text-gray-400">/</span>
                <InstantLink 
                  href={`/${pathSegments.slice(0, index + 1).join('/')}`}
                  className={`${
                    index === pathSegments.length - 1
                      ? 'text-gray-900 dark:text-white font-medium'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  {segment}
                </InstantLink>
              </React.Fragment>
            ))}
          </div>
        </div>
      </nav>
    );
  };

  const renderBackButton = () => {
    if (!config.showBackButton) return null;

    return (
      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <ArrowRightIcon className="w-4 h-4" />
            العودة
          </button>
        </div>
    </div>
    );
  };

  const renderFooter = () => {
    if (!config.showFooter) return null;

    return (
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p>© {new Date().getFullYear()} عين عُمان. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    );
  };

  const renderBackToTop = () => {
    if (!isBackToTopVisible) return null;

    return (
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all z-40 flex items-center justify-center"
      >
        <ArrowUpIcon className="w-6 h-6" />
      </button>
    );
  };

  const renderModals = () => (
    <>
      {/* User Menu Modal */}
      {isUserMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">قائمة المستخدم</h3>
            <div className="space-y-3">
              <InstantLink 
                href="/profile"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <UserCircleIcon className="w-5 h-5" />
                <span>الملف الشخصي</span>
              </InstantLink>
              <InstantLink 
                href="/settings"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Cog6ToothIcon className="w-5 h-5" />
                <span>الإعدادات</span>
              </InstantLink>
              <InstantLink 
                href="/help"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ChatBubbleLeftRightIcon className="w-5 h-5" />
                <span>المساعدة</span>
              </InstantLink>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {isNotificationsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">الإشعارات</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-gray-500 text-center py-4">لا توجد إشعارات</p>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border ${
                      notification.read
                        ? 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                        : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                          {notification.timestamp.toLocaleString('ar', { calendar: 'gregory', numberingSystem: 'latn' })}
                        </p>
                      </div>
                      {!notification.read && (
                        <button
                          onClick={() => markNotificationAsRead(notification.id)}
                          className="ml-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="w-full mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                مسح جميع الإشعارات
              </button>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions Modal */}
      {isQuickActionsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">إجراءات سريعة</h3>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <InstantLink 
                  key={action.id}
                  href={action.href}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <action.icon className="w-5 h-5" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{action.label}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{action.description}</div>
                  </div>
                </InstantLink>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Live Stats Modal */}
      {isLiveStatsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">الإحصائيات المباشرة</h3>
            <div className="space-y-4">
              {liveStats.map((stat) => (
                <div key={stat.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    <span className="font-medium text-gray-900 dark:text-white">{stat.label}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900 dark:text-white">{stat.value.toLocaleString()}</div>
                    <div className={`text-xs ${
                      stat.trend === 'up' ? 'text-green-600' :
                      stat.trend === 'down' ? 'text-red-600' :
                      'text-gray-500'
                    }`}>
                      {stat.change > 0 ? '+' : ''}{stat.change}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <LayoutContext.Provider value={contextValue}>
      <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${className}`}>
        {/* Audio Element - Disabled */}
        {/* <audio ref={audioRef} loop>
          <source src="/audio/background.mp3" type="audio/mpeg" />
        </audio> */}

        {/* Announcement Bar */}
        {renderAnnouncementBar()}

        {/* Header */}
        {renderHeader()}

        {/* Breadcrumbs */}
        {renderBreadcrumbs()}

        {/* Back Button */}
        {renderBackButton()}

        {/* Main Content */}
        <main className={`${
          config.headerStyle === 'fixed' ? 'pt-16' : ''
        }`}>
          {children}
        </main>

        {/* Footer */}
        {renderFooter()}

        {/* Back to Top */}
        {renderBackToTop()}

        {/* Modals */}
        {renderModals()}
    </div>
    </LayoutContext.Provider>
  );
}
