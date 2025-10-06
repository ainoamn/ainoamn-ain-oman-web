"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  HeartIcon,
  ShareIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  GlobeAltIcon,
  ArrowUpIcon,
  SparklesIcon,
  BuildingOfficeIcon,
  ScaleIcon,
  ChartBarIcon,
  UserGroupIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  StarIcon,
  EyeIcon,
  BookmarkIcon,
  BellIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  ArrowRightIcon,
  PlayIcon,
  PauseIcon,
  SpeakerXMarkIcon,
  SpeakerWaveIcon,
  PlusIcon
} from "@heroicons/react/24/outline";
import { 
  HeartIcon as HeartIconSolid,
  StarIcon as StarIconSolid,
  CheckCircleIcon as CheckCircleIconSolid,
  ShieldCheckIcon as ShieldCheckIconSolid
} from "@heroicons/react/24/solid";

// Types
interface FooterSection {
  id: string;
  title: string;
  links: FooterLink[];
  icon?: React.ComponentType<any>;
}

interface FooterLink {
  id: string;
  label: string;
  href: string;
  description?: string;
  isNew?: boolean;
  isHot?: boolean;
  badge?: string;
  icon?: React.ComponentType<any>;
}

interface SocialLink {
  id: string;
  name: string;
  href: string;
  icon: string;
  color: string;
  followers?: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  isPopular?: boolean;
  isNew?: boolean;
}

interface ContactInfo {
  email: string;
  phone: string;
  address: string;
  workingHours: string;
  supportHours: string;
}

interface NewsletterData {
  email: string;
  isSubscribed: boolean;
  preferences: string[];
}

interface LiveStats {
  onlineUsers: number;
  activeProperties: number;
  completedDeals: number;
  satisfactionRate: number;
}

// Main Component
export default function UltraFooter() {
  const [isBackToTopVisible, setIsBackToTopVisible] = useState(false);
  const [isNewsletterOpen, setIsNewsletterOpen] = useState(false);
  const [newsletterData, setNewsletterData] = useState<NewsletterData>({
    email: '',
    isSubscribed: false,
    preferences: []
  });
  const [liveStats, setLiveStats] = useState<LiveStats>({
    onlineUsers: 1247,
    activeProperties: 3421,
    completedDeals: 1856,
    satisfactionRate: 98.5
  });
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');

  const newsletterRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Footer sections
  const footerSections: FooterSection[] = [
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
      id: 'legal',
      title: 'القضايا القانونية',
      icon: ScaleIcon,
      links: [
        { id: 'cases', label: 'جميع القضايا', href: '/legal', description: 'إدارة القضايا القانونية' },
        { id: 'new-case', label: 'قضية جديدة', href: '/legal/new', description: 'إنشاء قضية قانونية جديدة', isNew: true },
        { id: 'directory', label: 'دليل المحامين', href: '/legal/directory', description: 'دليل المحامين المعتمدين' },
        { id: 'documents', label: 'المستندات', href: '/legal/documents', description: 'إدارة المستندات القانونية' },
        { id: 'appointments', label: 'المواعيد', href: '/legal/appointments', description: 'إدارة المواعيد القانونية' },
        { id: 'analytics', label: 'التحليلات', href: '/legal/analytics', description: 'تحليلات القضايا' }
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

  // Social links
  const socialLinks: SocialLink[] = [
    { id: 'facebook', name: 'فيسبوك', href: '#', icon: '📘', color: 'bg-blue-600', followers: '12.5K' },
    { id: 'instagram', name: 'إنستغرام', href: '#', icon: '📷', color: 'bg-pink-600', followers: '8.3K' },
    { id: 'twitter', name: 'تويتر', href: '#', icon: '🐦', color: 'bg-sky-600', followers: '5.7K' },
    { id: 'linkedin', name: 'لينكد إن', href: '#', icon: '💼', color: 'bg-blue-700', followers: '3.2K' },
    { id: 'youtube', name: 'يوتيوب', href: '#', icon: '📺', color: 'bg-red-600', followers: '2.1K' },
    { id: 'tiktok', name: 'تيك توك', href: '#', icon: '🎵', color: 'bg-black', followers: '1.8K' }
  ];

  // Payment methods
  const paymentMethods: PaymentMethod[] = [
    { id: 'visa', name: 'فيزا', icon: '💳', isPopular: true },
    { id: 'mastercard', name: 'ماستركارد', icon: '💳', isPopular: true },
    { id: 'amex', name: 'أمريكان إكسبريس', icon: '💳' },
    { id: 'bank-muscat', name: 'بنك مسقط', icon: '🏦', isPopular: true },
    { id: 'nbo', name: 'البنك الوطني', icon: '🏦' },
    { id: 'hsbc', name: 'HSBC', icon: '🏦' },
    { id: 'digital-wallet', name: 'محفظة رقمية', icon: '📱', isPopular: true },
    { id: 'crypto', name: 'عملات رقمية', icon: '₿', isNew: true }
  ];

  // Contact info
  const contactInfo: ContactInfo = {
    email: 'info@ainoman.com',
    phone: '+968 1234 5678',
    address: 'مسقط، سلطنة عُمان',
    workingHours: 'الأحد - الخميس: 8:00 ص - 6:00 م',
    supportHours: '24/7 دعم فني'
  };

  // Effects
  useEffect(() => {
    const handleScroll = () => {
      setIsBackToTopVisible(window.scrollY > 300);
    };

    const updateTime = () => {
      setCurrentTime(new Date());
    };

    const updateStats = () => {
      setLiveStats(prev => ({
        onlineUsers: prev.onlineUsers + Math.floor(Math.random() * 10 - 5),
        activeProperties: prev.activeProperties + Math.floor(Math.random() * 5 - 2),
        completedDeals: prev.completedDeals + Math.floor(Math.random() * 3),
        satisfactionRate: Math.min(99.9, prev.satisfactionRate + (Math.random() * 0.2 - 0.1))
      }));
    };

    window.addEventListener('scroll', handleScroll);
    const timeInterval = setInterval(updateTime, 1000);
    const statsInterval = setInterval(updateStats, 5000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(timeInterval);
      clearInterval(statsInterval);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (newsletterRef.current && !newsletterRef.current.contains(event.target as Node)) {
        setIsNewsletterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handlers
  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterData.email) {
      setNewsletterData(prev => ({ ...prev, isSubscribed: true }));
      // Simulate API call
      setTimeout(() => {
        alert('تم الاشتراك في النشرة الإخبارية بنجاح!');
        setIsNewsletterOpen(false);
      }, 1000);
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'auto') => {
    setTheme(newTheme);
    if (newTheme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    } else {
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
    }
    localStorage.setItem('theme', newTheme);
  };

  const handleMusicToggle = () => {
    setIsMusicPlaying(!isMusicPlaying);
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const handleSoundToggle = () => {
    setIsSoundEnabled(!isSoundEnabled);
  };

  // Render functions
  const renderLiveStats = () => (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-2xl mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          إحصائيات مباشرة
        </h3>
        <div className="text-sm opacity-90">
          آخر تحديث: {currentTime.toLocaleTimeString('ar-SA')}
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold">{liveStats.onlineUsers.toLocaleString()}</div>
          <div className="text-sm opacity-90">مستخدم نشط</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{liveStats.activeProperties.toLocaleString()}</div>
          <div className="text-sm opacity-90">عقار متاح</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{liveStats.completedDeals.toLocaleString()}</div>
          <div className="text-sm opacity-90">صفقة مكتملة</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{liveStats.satisfactionRate}%</div>
          <div className="text-sm opacity-90">معدل الرضا</div>
        </div>
      </div>
    </div>
  );

  const renderNewsletter = () => (
    <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-6 rounded-2xl mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-2">اشترك في النشرة الإخبارية</h3>
          <p className="text-sm opacity-90">احصل على آخر الأخبار والعروض الخاصة</p>
        </div>
        <button
          onClick={() => setIsNewsletterOpen(true)}
          className="bg-white text-green-600 px-4 py-2 rounded-xl font-medium hover:bg-gray-100 transition-colors"
        >
          اشتراك
        </button>
      </div>
    </div>
  );

  const renderNewsletterModal = () => (
    isNewsletterOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div ref={newsletterRef} className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
          <h3 className="text-xl font-semibold mb-4">اشترك في النشرة الإخبارية</h3>
          <form onSubmit={handleNewsletterSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={newsletterData.email}
                onChange={(e) => setNewsletterData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="أدخل بريدك الإلكتروني"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                اهتماماتك
              </label>
              <div className="space-y-2">
                {['العقارات', 'المزادات', 'القضايا القانونية', 'التقارير'].map((pref) => (
                  <label key={pref} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newsletterData.preferences.includes(pref)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewsletterData(prev => ({
                            ...prev,
                            preferences: [...prev.preferences, pref]
                          }));
                        } else {
                          setNewsletterData(prev => ({
                            ...prev,
                            preferences: prev.preferences.filter(p => p !== pref)
                          }));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{pref}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsNewsletterOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                اشتراك
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  );

  const renderContactInfo = () => (
    <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-600" />
        تواصل معنا
      </h3>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <EnvelopeIcon className="w-5 h-5 text-gray-500" />
          <a href={`mailto:${contactInfo.email}`} className="text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors">
            {contactInfo.email}
          </a>
        </div>
        <div className="flex items-center gap-3">
          <PhoneIcon className="w-5 h-5 text-gray-500" />
          <a href={`tel:${contactInfo.phone}`} className="text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors">
            {contactInfo.phone}
          </a>
        </div>
        <div className="flex items-start gap-3">
          <MapPinIcon className="w-5 h-5 text-gray-500 mt-0.5" />
          <span className="text-gray-700 dark:text-gray-300">{contactInfo.address}</span>
        </div>
        <div className="flex items-center gap-3">
          <ClockIcon className="w-5 h-5 text-gray-500" />
          <div>
            <div className="text-sm text-gray-700 dark:text-gray-300">{contactInfo.workingHours}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{contactInfo.supportHours}</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSocialLinks = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <ShareIcon className="w-5 h-5 text-blue-600" />
        تابعنا
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {socialLinks.map((social) => (
          <a
            key={social.id}
            href={social.href}
            className={`flex items-center gap-3 p-3 rounded-xl text-white transition-all hover:scale-105 ${social.color}`}
          >
            <span className="text-xl">{social.icon}</span>
            <div>
              <div className="font-medium">{social.name}</div>
              <div className="text-xs opacity-90">{social.followers} متابع</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );

  const renderPaymentMethods = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
        طرق الدفع المقبولة
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`flex items-center gap-2 p-3 rounded-xl border transition-all hover:shadow-md ${
              method.isPopular 
                ? 'border-green-200 bg-green-50 dark:bg-green-900/20' 
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
            }`}
          >
            <span className="text-xl">{method.icon}</span>
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">{method.name}</div>
              {method.isPopular && (
                <div className="text-xs text-green-600 dark:text-green-400">شائع</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderQuickActions = () => (
    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-2xl">
      <h3 className="text-lg font-semibold mb-4">إجراءات سريعة</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link
          href="/properties/new"
          className="flex items-center gap-2 p-3 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          <span className="text-sm">إضافة عقار</span>
        </Link>
        <Link
          href="/legal/new"
          className="flex items-center gap-2 p-3 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
        >
          <ScaleIcon className="w-5 h-5" />
          <span className="text-sm">قضية جديدة</span>
        </Link>
        <Link
          href="/support"
          className="flex items-center gap-2 p-3 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
        >
          <ChatBubbleLeftRightIcon className="w-5 h-5" />
          <span className="text-sm">الدعم</span>
        </Link>
        <Link
          href="/reports"
          className="flex items-center gap-2 p-3 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
        >
          <ChartBarIcon className="w-5 h-5" />
          <span className="text-sm">التقارير</span>
        </Link>
      </div>
    </div>
  );

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      {/* Back to Top Button */}
      {isBackToTopVisible && (
        <button
          onClick={handleBackToTop}
          className="fixed bottom-6 right-6 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all z-40 flex items-center justify-center"
        >
          <ArrowUpIcon className="w-6 h-6" />
        </button>
      )}

      {/* Audio Element */}
      <audio ref={audioRef} loop>
        <source src="/audio/background.mp3" type="audio/mpeg" />
      </audio>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Live Stats */}
        {renderLiveStats()}

        {/* Newsletter */}
        {renderNewsletter()}

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <SparklesIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">عين عُمان</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">منصة العقارات الذكية</p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              منصة شاملة لإدارة العقارات والمزادات والقضايا القانونية في سلطنة عُمان. 
              نحن نقدم حلولاً ذكية ومبتكرة لجميع احتياجاتك العقارية.
            </p>
            
            {/* Trust Indicators */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <ShieldCheckIconSolid className="w-5 h-5 text-green-600" />
                <span>آمن ومحمي</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <CheckCircleIconSolid className="w-5 h-5 text-blue-600" />
                <span>معتمد من الحكومة</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <StarIconSolid className="w-5 h-5 text-yellow-500" />
                <span>تقييم 4.9/5</span>
              </div>
            </div>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section) => (
            <div key={section.id}>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                {section.icon && <section.icon className="w-5 h-5 text-blue-600" />}
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.id}>
                    <Link
                      href={link.href}
                      className="group flex items-start gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <ArrowRightIcon className="w-4 h-4 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span>{link.label}</span>
                          {link.badge && (
                            <span className={`px-2 py-0.5 text-xs rounded-full ${
                              link.isNew ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' :
                              link.isHot ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                              'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                            }`}>
                              {link.badge}
                            </span>
                          )}
                        </div>
                        {link.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{link.description}</p>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Additional Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {renderContactInfo()}
          {renderSocialLinks()}
          {renderPaymentMethods()}
          {renderQuickActions()}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
              <span>© {new Date().getFullYear()} عين عُمان. جميع الحقوق محفوظة.</span>
              <div className="flex items-center gap-4">
                <Link href="/terms" className="hover:text-blue-600 transition-colors">الشروط</Link>
                <Link href="/privacy" className="hover:text-blue-600 transition-colors">الخصوصية</Link>
                <Link href="/cookies" className="hover:text-blue-600 transition-colors">ملفات تعريف الارتباط</Link>
              </div>
            </div>
            
            {/* Theme and Controls */}
            <div className="flex items-center gap-4">
              {/* Theme Selector */}
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                {[
                  { value: 'light', icon: SunIcon, label: 'فاتح' },
                  { value: 'dark', icon: MoonIcon, label: 'داكن' },
                  { value: 'auto', icon: ComputerDesktopIcon, label: 'تلقائي' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleThemeChange(option.value as any)}
                    className={`p-2 rounded-lg transition-all ${
                      theme === option.value
                        ? 'bg-white dark:bg-gray-700 shadow-sm'
                        : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                    title={option.label}
                  >
                    <option.icon className="w-4 h-4" />
                  </button>
                ))}
              </div>

              {/* Music Controls */}
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                <button
                  onClick={handleMusicToggle}
                  className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  title={isMusicPlaying ? 'إيقاف الموسيقى' : 'تشغيل الموسيقى'}
                >
                  {isMusicPlaying ? (
                    <PauseIcon className="w-4 h-4" />
                  ) : (
                    <PlayIcon className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={handleSoundToggle}
                  className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  title={isSoundEnabled ? 'إيقاف الصوت' : 'تشغيل الصوت'}
                >
                  {isSoundEnabled ? (
                    <SpeakerWaveIcon className="w-4 h-4" />
                  ) : (
                    <SpeakerXMarkIcon className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Language Selector */}
              <select className="text-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Modal */}
      {renderNewsletterModal()}
    </footer>
  );
}
