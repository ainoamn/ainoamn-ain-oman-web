// src/pages/admin/index.tsx - لوحة التحكم الإدارية الرئيسية
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import InstantLink from '@/components/InstantLink';
import FeatureGate from '@/components/common/FeatureGate';
import {
  FaCog, FaUsers, FaBuilding, FaFileContract, FaChartLine,
  FaBell, FaShieldAlt, FaCreditCard, FaRobot, FaGift,
  FaGlobe, FaDollarSign, FaSearch, FaCalendar, FaEnvelope,
  FaDatabase, FaServer, FaLock, FaUnlock, FaEye,
  FaArrowRight, FaSpinner, FaCheckCircle, FaExclamationTriangle,
  FaInfoCircle
} from 'react-icons/fa';

interface DashboardStats {
  totalUsers: number;
  totalProperties: number;
  totalContracts: number;
  totalRevenue: number;
  activeFeatures: number;
  totalOverrides: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      // TODO: جلب الإحصائيات من API
      setStats({
        totalUsers: 0,
        totalProperties: 0,
        totalContracts: 0,
        totalRevenue: 0,
        activeFeatures: 0,
        totalOverrides: 0,
        systemHealth: 'healthy',
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    {
      id: 'features',
      title: 'إدارة الميزات',
      description: 'التحكم في جميع ميزات المنصة',
      icon: FaCog,
      href: '/admin/features',
      color: 'blue',
      badge: stats?.activeFeatures || 0,
    },
    {
      id: 'users',
      title: 'إدارة المستخدمين',
      description: 'إدارة المستخدمين والصلاحيات',
      icon: FaUsers,
      href: '/admin/users',
      color: 'green',
    },
    {
      id: 'properties',
      title: 'إدارة العقارات',
      description: 'إدارة جميع العقارات',
      icon: FaBuilding,
      href: '/admin/properties',
      color: 'purple',
    },
    {
      id: 'contracts',
      title: 'إدارة العقود',
      description: 'إدارة العقود والإيجارات',
      icon: FaFileContract,
      href: '/admin/contracts',
      color: 'orange',
    },
    {
      id: 'analytics',
      title: 'التحليلات والإحصائيات',
      description: 'تقارير وإحصائيات شاملة',
      icon: FaChartLine,
      href: '/admin/analytics',
      color: 'indigo',
    },
    {
      id: 'notifications',
      title: 'الإشعارات',
      description: 'إدارة الإشعارات والتنبيهات',
      icon: FaBell,
      href: '/admin/notifications',
      color: 'yellow',
    },
    {
      id: 'security',
      title: 'الأمان والصلاحيات',
      description: 'إعدادات الأمان والتحكم في الصلاحيات',
      icon: FaShieldAlt,
      href: '/admin/security',
      color: 'red',
    },
    {
      id: 'payments',
      title: 'المدفوعات',
      description: 'إدارة المدفوعات والاشتراكات',
      icon: FaCreditCard,
      href: '/admin/payments',
      color: 'pink',
    },
    {
      id: 'ai',
      title: 'الذكاء الاصطناعي',
      description: 'إعدادات وتكوين الذكاء الاصطناعي',
      icon: FaRobot,
      href: '/admin/ai',
      color: 'teal',
    },
    {
      id: 'rewards',
      title: 'نظام المكافآت',
      description: 'إدارة نقاط المسوقين والمكافآت',
      icon: FaGift,
      href: '/admin/rewards',
      color: 'amber',
    },
    {
      id: 'i18n',
      title: 'اللغات والعملات',
      description: 'إدارة اللغات والعملات',
      icon: FaGlobe,
      href: '/admin/i18n',
      color: 'cyan',
    },
    {
      id: 'settings',
      title: 'الإعدادات العامة',
      description: 'إعدادات النظام العامة',
      icon: FaCog,
      href: '/admin/settings',
      color: 'gray',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Head>
        <title>لوحة التحكم الإدارية - عين عُمان</title>
      </Head>

      <div className="container mx-auto px-4 py-8">
        {/* العنوان */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">لوحة التحكم الإدارية</h1>
          <p className="text-gray-600">إدارة شاملة لجميع جوانب المنصة</p>
        </div>

        {/* الإحصائيات السريعة */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">إجمالي المستخدمين</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.totalUsers}</p>
                </div>
                <FaUsers className="text-3xl text-blue-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">إجمالي العقارات</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.totalProperties}</p>
                </div>
                <FaBuilding className="text-3xl text-purple-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">إجمالي العقود</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.totalContracts}</p>
                </div>
                <FaFileContract className="text-3xl text-orange-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">صحة النظام</p>
                  <div className="flex items-center gap-2">
                    {stats.systemHealth === 'healthy' && (
                      <>
                        <FaCheckCircle className="text-green-600" />
                        <span className="text-green-600 font-medium">سليم</span>
                      </>
                    )}
                    {stats.systemHealth === 'warning' && (
                      <>
                        <FaExclamationTriangle className="text-yellow-600" />
                        <span className="text-yellow-600 font-medium">تحذير</span>
                      </>
                    )}
                    {stats.systemHealth === 'critical' && (
                      <>
                        <FaExclamationTriangle className="text-red-600" />
                        <span className="text-red-600 font-medium">حرج</span>
                      </>
                    )}
                  </div>
                </div>
                <FaServer className="text-3xl text-gray-600" />
              </div>
            </div>
          </div>
        )}

        {/* قائمة الوحدات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const colorClasses = {
              blue: 'bg-blue-100 text-blue-600',
              green: 'bg-green-100 text-green-600',
              purple: 'bg-purple-100 text-purple-600',
              orange: 'bg-orange-100 text-orange-600',
              indigo: 'bg-indigo-100 text-indigo-600',
              yellow: 'bg-yellow-100 text-yellow-600',
              red: 'bg-red-100 text-red-600',
              pink: 'bg-pink-100 text-pink-600',
              teal: 'bg-teal-100 text-teal-600',
              amber: 'bg-amber-100 text-amber-600',
              cyan: 'bg-cyan-100 text-cyan-600',
              gray: 'bg-gray-100 text-gray-600',
            };

            return (
              <InstantLink
                key={item.id}
                href={item.href}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${colorClasses[item.color as keyof typeof colorClasses]}`}>
                    <Icon className="text-2xl" />
                  </div>
                  {item.badge !== undefined && (
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                <div className="flex items-center text-blue-600 text-sm font-medium">
                  <span>فتح</span>
                  <FaArrowRight className="mr-2 group-hover:translate-x-[-4px] transition-transform" />
                </div>
              </InstantLink>
            );
          })}
        </div>

        {/* التنبيهات السريعة */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">تنبيهات سريعة</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <FaInfoCircle className="text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">نظام الميزات جاهز للاستخدام</p>
                <p className="text-xs text-gray-600">يمكنك الآن التحكم في جميع ميزات المنصة</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <FaCheckCircle className="text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">النظام يعمل بشكل طبيعي</p>
                <p className="text-xs text-gray-600">جميع الخدمات متاحة وتعمل بشكل صحيح</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
