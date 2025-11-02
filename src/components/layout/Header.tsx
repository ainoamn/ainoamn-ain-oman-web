import React, { useState, useEffect, useRef, useCallback } from "react";
import InstantImage from '@/components/InstantImage';
import InstantLink from '@/components/InstantLink';
import NotificationsDropdown from '@/components/NotificationsDropdown';
import AuthModal from '@/components/auth/AuthModal';
import { useRouter } from "next/router";
import { 
  MagnifyingGlassIcon, 
  BellIcon, 
  HeartIcon, 
  UserIcon, 
  Bars3Icon, 
  XMarkIcon,
  SunIcon,
  MoonIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  MapPinIcon,
  Cog6ToothIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  HomeIcon,
  BuildingOfficeIcon,
  ScaleIcon,
  ChartBarIcon,
  UserGroupIcon,
  DocumentTextIcon,
  PhoneIcon,
  EnvelopeIcon,
  ShareIcon,
  BookmarkIcon,
  EyeIcon,
  PlusIcon
} from "@heroicons/react/24/outline";
import { 
  MagnifyingGlassIcon as MagnifyingGlassIconSolid,
  BellIcon as BellIconSolid,
  HeartIcon as HeartIconSolid,
  UserIcon as UserIconSolid,
  HomeIcon as HomeIconSolid,
  BuildingOfficeIcon as BuildingOfficeIconSolid,
  ScaleIcon as ScaleIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  DocumentTextIcon as DocumentTextIconSolid,
  PhoneIcon as PhoneIconSolid,
  EnvelopeIcon as EnvelopeIconSolid,
  ShareIcon as ShareIconSolid,
  BookmarkIcon as BookmarkIconSolid,
  EyeIcon as EyeIconSolid,
  PlusIcon as PlusIconSolid
} from "@heroicons/react/24/solid";

// Types
interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ComponentType<any>;
  iconSolid?: React.ComponentType<any>;
  description?: string;
  badge?: string;
  children?: MenuItem[];
  isNew?: boolean;
  isHot?: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  notifications: number;
  favorites: number;
  isVerified: boolean;
}

interface SearchSuggestion {
  id: string;
  type: 'property' | 'location' | 'service' | 'user';
  title: string;
  subtitle?: string;
  image?: string;
  price?: string;
  location?: string;
  rating?: number;
  actionUrl?: string;
}

interface NotificationItem {
  id: string;
  type: 'message' | 'property' | 'auction' | 'system';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  actionUrl?: string;
  icon?: React.ComponentType<any>;
}

// Main Component
export default function Header() {
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');
  const [language, setLanguage] = useState('ar');
  const [currency, setCurrency] = useState('OMR');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup'>('login');
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Refs
  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  // Menu Items
  const menuItems: MenuItem[] = [
    {
      id: 'home',
      label: 'الرئيسية',
      href: '/',
      icon: HomeIcon,
      iconSolid: HomeIconSolid,
      description: 'الصفحة الرئيسية'
    },
    {
      id: 'properties',
      label: 'العقارات',
      href: '/properties',
      icon: BuildingOfficeIcon,
      iconSolid: BuildingOfficeIconSolid,
      description: 'تصفح العقارات',
      badge: 'جديد',
      isNew: true,
      children: [
        { id: 'all-properties', label: 'جميع العقارات', href: '/properties' },
        { id: 'apartments', label: 'شقق', href: '/properties?type=apartment' },
        { id: 'villas', label: 'فيلات', href: '/properties?type=villa' },
        { id: 'offices', label: 'مكاتب', href: '/properties?type=office' },
        { id: 'shops', label: 'محلات', href: '/properties?type=shop' },
        { id: 'land', label: 'أراضي', href: '/properties?type=land' },
        { id: 'commercial', label: 'تجاري', href: '/properties?type=commercial' }
      ]
    },
    {
      id: 'auctions',
      label: 'المزادات',
      href: '/auctions',
      icon: ScaleIcon,
      iconSolid: ScaleIconSolid,
      description: 'المزادات العقارية',
      badge: 'مميز',
      isHot: true,
      children: [
        { id: 'active-auctions', label: 'المزادات الحالية', href: '/auctions' },
        { id: 'upcoming-auctions', label: 'مزادات قادمة', href: '/auctions?status=upcoming' },
        { id: 'my-auctions', label: 'مزاداتي', href: '/auctions/my-auctions' },
        { id: 'new-auction', label: 'إنشاء مزاد', href: '/auctions/new' }
      ]
    },
    {
      id: 'development',
      label: 'التطوير العقاري',
      href: '/development',
      icon: ChartBarIcon,
      iconSolid: ChartBarIconSolid,
      description: 'المشاريع العقارية',
      children: [
        { id: 'projects', label: 'المشاريع', href: '/development/projects' },
        { id: 'opportunities', label: 'الفرص الاستثمارية', href: '/development/opportunities' },
        { id: 'financing', label: 'التمويل', href: '/development/financing' },
        { id: 'partners', label: 'الشركاء', href: '/partners' }
      ]
    },
  ];

  // Mock data
  const mockUser: User = {
    id: '1',
    name: 'أحمد محمد',
    email: 'ahmed@example.com',
    avatar: 'https://ui-avatars.com/api/?name=Ahmed&background=0D8ABC&color=fff&size=200',
    role: 'مدير',
    notifications: 5,
    favorites: 12,
    isVerified: true
  };

  const mockNotifications: NotificationItem[] = [
    {
      id: '1',
      type: 'property',
      title: 'عقار جديد',
      message: 'تم إضافة عقار جديد في مسقط',
      time: 'منذ 5 دقائق',
      isRead: false,
      actionUrl: '/properties/new',
      icon: BuildingOfficeIcon
    },
    {
      id: '2',
      type: 'message',
      title: 'رسالة جديدة',
      message: 'لديك رسالة من العميل محمد',
      time: 'منذ 15 دقيقة',
      isRead: false,
      actionUrl: '/messages',
      icon: ChatBubbleLeftRightIcon
    },
    {
      id: '3',
      type: 'system',
      title: 'تحديث النظام',
      message: 'تم تحديث النظام بنجاح',
      time: 'منذ ساعة',
      isRead: true,
      icon: Cog6ToothIcon
    }
  ];

  const mockSearchSuggestions: SearchSuggestion[] = [
    {
      id: '1',
      type: 'property',
      title: 'شقة في القرم',
      subtitle: '3 غرف نوم، 2 حمام',
      price: '450 ريال',
      location: 'القرم، مسقط',
      rating: 4.8,
      image: '/demo/apartment1.jpg'
    },
    {
      id: '2',
      type: 'location',
      title: 'القرم',
      subtitle: 'منطقة سكنية راقية',
      location: 'مسقط، سلطنة عمان'
    },
    {
      id: '3',
      type: 'service',
      title: 'خدمة التقييم العقاري',
      subtitle: 'تقييم احترافي للعقارات'
    }
  ];

  // Effects
  useEffect(() => {
    setHasMounted(true);
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    const handleOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    // تحميل بيانات المستخدم من localStorage
    const loadUser = () => {
      try {
        const authData = localStorage.getItem("ain_auth");
        if (authData) {
          const userData = JSON.parse(authData);
          setUser({
            id: userData.id,
            name: userData.name || 'مستخدم',
            email: userData.email || userData.phone || '',
            avatar: userData.picture || userData.avatar || 'https://ui-avatars.com/api/?name=User&background=6B7280&color=fff&size=200',
            role: userData.role || 'user',
            notifications: 0,
            favorites: 0,
            isVerified: userData.isVerified || false
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error loading user:", error);
        setUser(null);
      }
    };

    loadUser();
    setNotifications(mockNotifications);

    // الاستماع لتغييرات الـ auth
    const handleAuthChange = () => {
      loadUser();
    };
    
    // الاستماع لتغييرات localStorage من تبويبات أخرى
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ain_auth' || e.key === 'auth_token') {
        loadUser();
      }
    };
    
    window.addEventListener('ain_auth:change', handleAuthChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
      window.removeEventListener('ain_auth:change', handleAuthChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  // Theme handling
  const handleThemeChange = (newTheme: 'light' | 'dark' | 'auto') => {
    setTheme(newTheme);
    setIsThemeMenuOpen(false);
    
    if (newTheme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    } else {
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
    }
    
    localStorage.setItem('theme', newTheme);
  };

  // Notification handling
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  // Render functions
  const renderSearchSuggestions = () => (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto z-50">
      {isSearching ? (
        <div className="p-4 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">جاري البحث...</p>
        </div>
      ) : searchSuggestions.length > 0 ? (
        <div className="p-2">
          {searchSuggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              onClick={() => {
                router.push(suggestion.actionUrl || '/');
                setIsSearching(false);
                setSearchQuery('');
              }}
            >
              {suggestion.image && (
                <InstantImage src={suggestion.image}
                  alt={suggestion.title}
                  className="w-12 h-12 rounded-lg object-cover"
                 loading="lazy" width={48} height={48}/>
              )}
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white">{suggestion.title}</h4>
                {suggestion.subtitle && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">{suggestion.subtitle}</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  {suggestion.price && (
                    <span className="text-sm font-medium text-green-600">{suggestion.price}</span>
                  )}
                  {suggestion.location && (
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <MapPinIcon className="w-3 h-3" />
                      {suggestion.location}
                    </span>
                  )}
                </div>
              </div>
              {suggestion.rating && (
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">★</span>
                  <span className="text-sm text-gray-500">{suggestion.rating}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : searchQuery.length >= 2 ? (
        <div className="p-4 text-center text-gray-500">
          <p>لا توجد نتائج لـ "{searchQuery}"</p>
        </div>
      ) : null}
    </div>
  );

  const renderNotifications = () => (
    <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">الإشعارات</h3>
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
              onClick={() => {
                markNotificationAsRead(notification.id);
                if (notification.actionUrl) {
                  router.push(notification.actionUrl);
                }
                setIsNotificationsOpen(false);
              }}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  notification.type === 'property' ? 'bg-green-100 text-green-600' :
                  notification.type === 'message' ? 'bg-blue-100 text-blue-600' :
                  notification.type === 'system' ? 'bg-purple-100 text-purple-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {notification.icon && <notification.icon className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">{notification.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-2">{notification.time}</p>
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
  );

  const renderUserMenu = () => (
    <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="relative">
            <InstantImage 
              src={user?.avatar || 'https://ui-avatars.com/api/?name=User&background=6B7280&color=fff&size=200'}
              alt={user?.name || 'User'}
              width={48}
              height={48}
              className="w-12 h-12 rounded-full object-cover"
              loading="lazy"
            />
            {user?.isVerified && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white" suppressHydrationWarning>{user?.name || 'مستخدم'}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400" suppressHydrationWarning>{user?.role || 'زائر'}</p>
          </div>
        </div>
      </div>
      <div className="p-2">
        <InstantLink
          href="/profile"
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          onClick={() => setIsUserMenuOpen(false)}
        >
          <UserIcon className="w-5 h-5 text-gray-500" />
          <span>الملف الشخصي</span>
        </InstantLink>
        <InstantLink
          href="/settings"
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          onClick={() => setIsUserMenuOpen(false)}
        >
          <Cog6ToothIcon className="w-5 h-5 text-gray-500" />
          <span>الإعدادات</span>
        </InstantLink>
        <InstantLink
          href="/favorites"
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          onClick={() => setIsUserMenuOpen(false)}
        >
          <HeartIcon className="w-5 h-5 text-gray-500" />
          <span suppressHydrationWarning>المفضلة ({user?.favorites || 0})</span>
        </InstantLink>
        <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
        <button
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-full text-left"
          onClick={() => {
            // Handle logout
            localStorage.removeItem('ain_auth');
            localStorage.removeItem('auth_token');
            setUser(null);
            setIsUserMenuOpen(false);
            window.dispatchEvent(new CustomEvent('ain_auth:change'));
            // فتح modal تسجيل الدخول بدلاً من الانتقال للصفحة
            setAuthModalTab('login');
            setIsAuthModalOpen(true);
          }}
        >
          <ArrowRightIcon className="w-5 h-5 text-red-500" />
          <span className="text-red-600">تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );

  const renderThemeMenu = () => (
    <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50">
      <div className="p-2">
        {[
          { value: 'light', label: 'فاتح', icon: SunIcon },
          { value: 'dark', label: 'داكن', icon: MoonIcon },
          { value: 'auto', label: 'تلقائي', icon: Cog6ToothIcon }
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => handleThemeChange(option.value as any)}
            className={`flex items-center gap-3 p-3 rounded-xl w-full text-left transition-colors ${
              theme === option.value
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <option.icon className="w-5 h-5" />
            <span>{option.label}</span>
            {theme === option.value && (
              <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-200 dark:border-gray-700'
          : 'bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700'
      }`}
    >
      {/* Online Status Indicator */}
      {!isOnline && (
        <div className="bg-red-500 text-white text-center py-1 text-sm">
          <span>⚠️ لا يوجد اتصال بالإنترنت</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <InstantLink href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">عين عُمان</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">منصة العقارات الذكية</p>
            </div>
          </InstantLink>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {menuItems.map((item) => (
              <div key={item.id} className="relative group">
                <InstantLink
                  href={item.href}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
                >
                  {item.icon && <item.icon className="w-5 h-5" />}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      item.isNew ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {item.children && <ChevronDownIcon className="w-4 h-4" />}
                </InstantLink>

                {/* Dropdown Menu */}
                {item.children && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-2">
                      {item.children.map((child) => (
                        <InstantLink
                          key={child.id}
                          href={child.href}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          <span className="text-gray-700 dark:text-gray-300">{child.label}</span>
                        </InstantLink>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Search Button - Redirects to properties page */}
            <button
              onClick={() => router.push('/properties')}
              className="p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
              title="البحث"
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
            </button>

            {/* Quick Actions */}
            <div className="hidden lg:flex items-center gap-1">
              <InstantLink
                href="/properties/new"
                className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                title="إضافة عقار"
              >
                <PlusIcon className="w-5 h-5" />
              </InstantLink>
              <InstantLink
                href="/favorites"
                className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all relative"
                title="المفضلة"
              >
                <HeartIcon className="w-5 h-5" />
                {hasMounted && user?.favorites && user.favorites > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center" suppressHydrationWarning>
                    {user.favorites}
                  </span>
                )}
              </InstantLink>
            </div>

            {/* Notifications */}
            <NotificationsDropdown />

            {/* Theme Selector */}
            <div className="relative" ref={themeMenuRef}>
              <button
                onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                title="السمة"
              >
                {theme === 'light' ? (
                  <SunIcon className="w-5 h-5" />
                ) : theme === 'dark' ? (
                  <MoonIcon className="w-5 h-5" />
                ) : (
                  <Cog6ToothIcon className="w-5 h-5" />
                )}
              </button>
              {isThemeMenuOpen && renderThemeMenu()}
            </div>

            {/* Language & Currency */}
            <div className="hidden lg:flex items-center gap-2">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="text-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="text-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="OMR">OMR</option>
                <option value="AED">AED</option>
                <option value="SAR">SAR</option>
                <option value="USD">USD</option>
              </select>
            </div>

            {/* User Menu */}
            {!hasMounted ? (
              <div className="w-32 h-10 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-xl"></div>
            ) : user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  <InstantImage 
                    src={user.avatar || 'https://ui-avatars.com/api/?name=User&background=6B7280&color=fff&size=200'}
                    alt={user.name || 'User'}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full object-cover"
                    loading="lazy"
                  />
                  <span className="hidden lg:block text-sm font-medium text-gray-700 dark:text-gray-300" suppressHydrationWarning>
                    {user.name}
                  </span>
                </button>
                {isUserMenuOpen && renderUserMenu()}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setAuthModalTab('login');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                >
                  تسجيل الدخول
                </button>
                <button
                  onClick={() => {
                    setAuthModalTab('signup');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 transition-all shadow-md font-bold"
                >
                  إنشاء حساب
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="px-4 py-4 space-y-2">
            {menuItems.map((item) => (
              <InstantLink
                key={item.id}
                href={item.href}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.icon && <item.icon className="w-5 h-5 text-gray-500" />}
                <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                {item.badge && (
                  <span className={`ml-auto px-2 py-0.5 text-xs rounded-full ${
                    item.isNew ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </InstantLink>
            ))}
          </div>
        </div>
      )}
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultTab={authModalTab}
      />
    </header>
  );
}

