// src/components/layout/utils.ts - Utility Functions for Ultra Layout Components
import { 
  MenuItem, 
  HeaderConfig, 
  FooterSection, 
  SocialLink, 
  PaymentMethod, 
  ContactInfo, 
  QuickActionItem, 
  AnnouncementConfig, 
  LayoutConfig 
} from './types';
import { 
  BuildingOfficeIcon,
  ScaleIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  ChartBarIcon,
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
  ArrowRightIcon,
  SparklesIcon,
  BellIcon,
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
  ArrowUpIcon
} from '@heroicons/react/24/outline';

// Generate Menu Items
export function generateMenuItems(): MenuItem[] {
  return [
    {
      id: 'properties',
      label: 'العقارات',
      href: '/properties',
      icon: BuildingOfficeIcon,
      description: 'تصفح وإدارة العقارات',
      children: [
        { id: 'all-properties', label: 'جميع العقارات', href: '/properties' },
        { id: 'new-property', label: 'إضافة عقار جديد', href: '/properties/new' },
        { id: 'property-management', label: 'إدارة العقارات', href: '/properties/unified-management' },
        { id: 'property-map', label: 'خريطة العقارات', href: '/properties/map' }
      ]
    },
    {
      id: 'services',
      label: 'الخدمات',
      href: '/services',
      icon: Cog6ToothIcon,
      description: 'خدمات إضافية',
      children: [
        { id: 'auctions', label: 'المزادات', href: '/auctions' },
        { id: 'development', label: 'المشاريع', href: '/development/projects' },
        { id: 'subscriptions', label: 'الاشتراكات', href: '/subscriptions' },
        { id: 'reports', label: 'التقارير', href: '/reports' }
      ]
    },
    {
      id: 'company',
      label: 'الشركة',
      href: '/company',
      icon: UserGroupIcon,
      description: 'معلومات الشركة',
      children: [
        { id: 'about', label: 'من نحن', href: '/about' },
        { id: 'team', label: 'فريق العمل', href: '/team' },
        { id: 'careers', label: 'الوظائف', href: '/careers' },
        { id: 'news', label: 'الأخبار', href: '/news' }
      ]
    }
  ];
}

// Generate Header Configuration
export function generateHeaderConfig(): HeaderConfig {
  return {
    showLogo: true,
    showSearch: true,
    showNotifications: true,
    showUserMenu: true,
    showThemeToggle: true,
    showLanguageSelector: true,
    showCurrencySelector: true,
    showMusicControls: true,
    showQuickActions: true,
    showLiveStats: true,
    style: 'default',
    height: 'md',
    theme: 'auto'
  };
}

// Generate Footer Sections
export function generateFooterSections(): FooterSection[] {
  return [
    {
      id: 'properties',
      title: 'العقارات',
      icon: BuildingOfficeIcon,
      links: [
        { id: 'all', label: 'جميع العقارات', href: '/properties', description: 'تصفح جميع العقارات المتاحة' },
        { id: 'apartments', label: 'شقق', href: '/properties?type=apartment', description: 'شقق سكنية راقية' },
        { id: 'villas', label: 'فيلات', href: '/properties?type=villa', description: 'فيلات فاخرة' },
        { id: 'offices', label: 'مكاتب', href: '/properties?type=office', description: 'مكاتب تجارية' },
        { id: 'shops', label: 'محلات', href: '/properties?type=shop', description: 'محلات تجارية' },
        { id: 'land', label: 'أراضي', href: '/properties?type=land', description: 'أراضي للبيع' },
        { id: 'commercial', label: 'تجاري', href: '/properties?type=commercial', description: 'عقارات تجارية' },
        { id: 'map', label: 'الخريطة', href: '/properties/map', description: 'عرض العقارات على الخريطة', isNew: true }
      ]
    },
    {
      id: 'services',
      title: 'الخدمات',
      icon: Cog6ToothIcon,
      links: [
        { id: 'auctions', label: 'المزادات', href: '/auctions', description: 'مزادات عقارية' },
        { id: 'development', label: 'المشاريع', href: '/development/projects', description: 'مشاريع التطوير' },
        { id: 'subscriptions', label: 'الاشتراكات', href: '/subscriptions', description: 'خطط الاشتراك' },
        { id: 'reviews', label: 'التقييمات', href: '/reviews', description: 'تقييمات العملاء' },
        { id: 'reports', label: 'التقارير', href: '/reports', description: 'تقارير مفصلة' },
        { id: 'support', label: 'الدعم الفني', href: '/support', description: 'مركز المساعدة' },
        { id: 'api', label: 'واجهة برمجية', href: '/api-docs', description: 'API للمطورين', isHot: true }
      ]
    },
    {
      id: 'company',
      title: 'الشركة',
      icon: UserGroupIcon,
      links: [
        { id: 'about', label: 'من نحن', href: '/about', description: 'تعرف على عين عُمان' },
        { id: 'team', label: 'فريق العمل', href: '/team', description: 'تعرف على فريقنا' },
        { id: 'careers', label: 'الوظائف', href: '/careers', description: 'انضم إلى فريقنا' },
        { id: 'news', label: 'الأخبار', href: '/news', description: 'آخر الأخبار والتحديثات' },
        { id: 'blog', label: 'المدونة', href: '/blog', description: 'مقالات ومعلومات مفيدة' },
        { id: 'partners', label: 'الشركاء', href: '/partners', description: 'شركاؤنا الاستراتيجيون' },
        { id: 'investors', label: 'المستثمرون', href: '/investors', description: 'معلومات للمستثمرين' }
      ]
    }
  ];
}

// Generate Social Links
export function generateSocialLinks(): SocialLink[] {
  return [
    { id: 'facebook', name: 'فيسبوك', href: '#', icon: '📘', color: 'bg-blue-600', followers: '12.5K' },
    { id: 'instagram', name: 'إنستغرام', href: '#', icon: '📷', color: 'bg-pink-600', followers: '8.3K' },
    { id: 'twitter', name: 'تويتر', href: '#', icon: '🐦', color: 'bg-sky-600', followers: '5.7K' },
    { id: 'linkedin', name: 'لينكد إن', href: '#', icon: '💼', color: 'bg-blue-700', followers: '3.2K' },
    { id: 'youtube', name: 'يوتيوب', href: '#', icon: '📺', color: 'bg-red-600', followers: '2.1K' },
    { id: 'tiktok', name: 'تيك توك', href: '#', icon: '🎵', color: 'bg-black', followers: '1.8K' }
  ];
}

// Generate Payment Methods
export function generatePaymentMethods(): PaymentMethod[] {
  return [
    { id: 'visa', name: 'فيزا', icon: '💳', isPopular: true },
    { id: 'mastercard', name: 'ماستركارد', icon: '💳', isPopular: true },
    { id: 'amex', name: 'أمريكان إكسبريس', icon: '💳' },
    { id: 'bank-muscat', name: 'بنك مسقط', icon: '🏦', isPopular: true },
    { id: 'nbo', name: 'البنك الوطني', icon: '🏦' },
    { id: 'hsbc', name: 'HSBC', icon: '🏦' },
    { id: 'digital-wallet', name: 'محفظة رقمية', icon: '📱', isPopular: true },
    { id: 'crypto', name: 'عملات رقمية', icon: '₿', isNew: true }
  ];
}

// Generate Contact Info
export function generateContactInfo(): ContactInfo {
  return {
    email: 'info@ainoman.com',
    phone: '+968 1234 5678',
    address: 'مسقط، سلطنة عُمان',
    workingHours: 'الأحد - الخميس: 8:00 ص - 6:00 م',
    supportHours: '24/7 دعم فني',
    website: 'https://ainoman.com',
    socialMedia: generateSocialLinks()
  };
}

// Generate Quick Actions
export function generateQuickActions(): QuickActionItem[] {
  return [
    {
      id: 'new-property',
      label: 'إضافة عقار',
      href: '/properties/new',
      icon: BuildingOfficeIcon,
      description: 'إضافة عقار جديد للمنصة',
      isNew: true
    },
    {
      id: 'new-case',
      label: 'قضية جديدة',
      href: '/legal/new',
      icon: ScaleIcon,
      description: 'إنشاء قضية قانونية جديدة',
      isNew: true
    },
    {
      id: 'new-auction',
      label: 'مزاد جديد',
      href: '/auctions/new',
      icon: CurrencyDollarIcon,
      description: 'إنشاء مزاد عقاري جديد',
      isHot: true
    },
    {
      id: 'new-report',
      label: 'تقرير جديد',
      href: '/reports/new',
      icon: ChartBarIcon,
      description: 'إنشاء تقرير جديد',
      isNew: true
    },
    {
      id: 'support',
      label: 'الدعم الفني',
      href: '/support',
      icon: ChatBubbleLeftRightIcon,
      description: 'الحصول على المساعدة',
      isHot: true
    },
    {
      id: 'settings',
      label: 'الإعدادات',
      href: '/settings',
      icon: Cog6ToothIcon,
      description: 'تخصيص إعدادات الحساب'
    }
  ];
}

// Generate Announcement Configuration
export function generateAnnouncementConfig(): AnnouncementConfig {
  return {
    id: 'welcome-announcement',
    title: 'مرحباً بك في عين عُمان',
    message: 'منصة العقارات الذكية الجديدة! اكتشف المزيد من الميزات والخدمات.',
    type: 'info',
    priority: 'medium',
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    isActive: true,
    isDismissible: true,
    action: {
      label: 'اكتشف الآن',
      href: '/features'
    },
    style: {
      backgroundColor: 'bg-gradient-to-r from-blue-600 to-purple-600',
      textColor: 'text-white',
      borderColor: 'border-blue-500'
    },
    animation: 'fade',
    targetAudience: {
      roles: ['user', 'admin', 'moderator'],
      permissions: ['read'],
      userGroups: ['all']
    }
  };
}

// Generate Layout Configuration
export function generateLayoutConfig(): LayoutConfig {
  return {
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
    timezone: 'Asia/Muscat'
  };
}
