// @ts-nocheck
// src/pages/profile/index.tsx - نسخة محسّنة مع تحديث فوري
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import InstantLink from '@/components/InstantLink';
import { 
  FiUser, FiMail, FiPhone, FiShield, FiEdit, FiSettings,
  FiHome, FiDollarSign, FiFileText, FiCheckCircle,
  FiZap, FiStar, FiLock, FiUnlock,
  FiGrid, FiList, FiEye, FiEyeOff, FiRefreshCw
} from 'react-icons/fi';
import { FiTrendingUp } from 'react-icons/fi';
import { ALL_PERMISSIONS } from '@/lib/permissions';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  permissions: string[];
  subscription?: {
    plan: string;
    expiresAt?: string;
  };
  picture?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [refreshKey, setRefreshKey] = useState(0); // لإجبار re-render

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    loadUserData();

    // BroadcastChannel للتبويبات الأخرى
    let channel: BroadcastChannel | null = null;
    
    try {
      channel = new BroadcastChannel('permissions_channel');
      channel.onmessage = (event) => {
        console.log('📡 Profile: Broadcast received:', event.data);
        if (event.data.type === 'PERMISSIONS_UPDATED' || event.data.type === 'PERMISSIONS_INITIALIZED') {
          console.log('🔄 Profile: Reloading in 200ms...');
          setTimeout(() => {
            setLoading(true); // إظهار loading
            loadUserData();
            setRefreshKey(prev => prev + 1); // force re-render
          }, 200);
        }
      };
      console.log('👂 Profile: BroadcastChannel connected');
    } catch (error) {
      console.error('❌ BroadcastChannel not supported:', error);
    }

    // CustomEvents للتبويب الحالي
    const handleUpdate = () => {
      console.log('🔔 Profile: Update event received');
      setLoading(true);
      setTimeout(() => {
        loadUserData();
        setRefreshKey(prev => prev + 1);
      }, 200);
    };

    window.addEventListener('permissions:updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      if (channel) channel.close();
      window.removeEventListener('permissions:updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [mounted]);

  const loadUserData = () => {
    console.log('🔄 Profile: Loading user data...');
    
    try {
      const authData = localStorage.getItem('ain_auth');
      if (!authData) {
        console.log('❌ Profile: No auth data, redirecting to login');
        router.push('/login');
        return;
      }

      const userData = JSON.parse(authData);
      console.log('👤 Profile: User data from localStorage:', userData.name, 'Role:', userData.role);
      
      let permissions = userData.permissions || [];
      console.log('📋 Profile: Default permissions:', permissions.length);
      
      const rolesConfig = localStorage.getItem('roles_permissions_config');
      if (rolesConfig) {
        const roles = JSON.parse(rolesConfig);
        const userRole = roles.find((r: any) => r.id === userData.role);
        
        if (userRole) {
          permissions = userRole.permissions;
          console.log('✅ Profile: Loaded from roles config:', permissions.length, 'permissions');
          console.log('📝 Profile: Permissions array:', permissions);
        } else {
          console.log('⚠️ Profile: Role not found in config');
        }
      } else {
        console.log('⚠️ Profile: No roles config found');
      }

      setUser({
        ...userData,
        permissions
      });
      setLoading(false);
      console.log('🎯 Profile: Final permissions count:', permissions.length);
      console.log('---');
    } catch (error) {
      console.error('❌ Profile: Error:', error);
      router.push('/login');
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.permissions.includes('*')) return true;
    return user.permissions.includes(permission);
  };

  const groupedPermissions = ALL_PERMISSIONS.reduce((acc, perm) => {
    if (!acc[perm.category]) acc[perm.category] = [];
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, typeof ALL_PERMISSIONS>);

  const categoryNames: Record<string, string> = {
    properties: 'العقارات',
    financial: 'المالية',
    legal: 'القانونية',
    maintenance: 'الصيانة',
    admin: 'الإدارة',
    reports: 'التقارير',
    other: 'أخرى'
  };

  const categoryIcons: Record<string, any> = {
    properties: FiHome,
    financial: FiDollarSign,
    legal: FiFileText,
    maintenance: FiSettings,
    admin: FiShield,
    reports: FiTrendingUp,
    other: FiGrid
  };

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const isAdmin = user.permissions.includes('*');
  const permissionsCount = isAdmin ? 'جميع الصلاحيات' : `${user.permissions.length} صلاحية`;

  return (
    <>
      <Head>
        <title>الملف الشخصي | Ain Oman</title>
      </Head>

      <div key={refreshKey} className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                  {user.picture ? (
                    <img src={user.picture} alt={user.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                {isAdmin && (
                  <div className="absolute -bottom-2 -right-2 bg-yellow-500 rounded-full p-2 shadow-lg">
                    <FiStar className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1 text-center md:text-right">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                  {isAdmin && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full">
                      مدير
                    </span>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <FiMail className="w-4 h-4" />
                    <span>{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-2">
                      <FiPhone className="w-4 h-4" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
                    <FiShield className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      {getRoleName(user.role)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full">
                    <FiCheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      {permissionsCount}
                    </span>
                  </div>

                  {user.subscription && (
                    <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-full">
                      <FiZap className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-800">
                        {getPlanName(user.subscription.plan)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setLoading(true);
                    loadUserData();
                    setRefreshKey(prev => prev + 1);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <FiRefreshCw className="w-4 h-4" />
                  تحديث
                </button>
                
                <InstantLink
                  href="/settings"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FiEdit className="w-4 h-4" />
                  تعديل
                </InstantLink>
              </div>
            </div>
          </div>

          {/* Permissions Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FiShield className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">صلاحياتك</h2>
                  <p className="text-gray-600 text-sm">
                    {isAdmin ? 'لديك صلاحيات كاملة' : `${user.permissions.length} صلاحية نشطة`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow' : 'text-gray-600'}`}
                >
                  <FiGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-white text-blue-600 shadow' : 'text-gray-600'}`}
                >
                  <FiList className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Admin Message */}
            {isAdmin && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-4">
                  <FiStar className="w-8 h-8 text-yellow-600" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      🎉 لديك صلاحيات المدير الكاملة!
                    </h3>
                    <p className="text-gray-700">
                      يمكنك الوصول إلى جميع الميزات والصفحات في النظام.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* No Permissions */}
            {!isAdmin && user.permissions.length === 0 && (
              <div className="text-center py-12">
                <FiEyeOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  لا توجد صلاحيات مفعّلة
                </h3>
                <p className="text-gray-600 mb-4">
                  يرجى التواصل مع المدير لمنحك الصلاحيات المناسبة
                </p>
                <InstantLink
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  التواصل مع الإدارة
                </InstantLink>
              </div>
            )}

            {/* Permissions by Category */}
            {!isAdmin && user.permissions.length > 0 && (
              <div className="space-y-6">
                {Object.entries(groupedPermissions).map(([category, permissions]) => {
                  const Icon = categoryIcons[category];
                  const userPerms = permissions.filter(p => hasPermission(p.id));
                  
                  if (userPerms.length === 0) return null;

                  return (
                    <div key={`${category}-${refreshKey}`} className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                          <Icon className="w-6 h-6 text-blue-600" />
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{categoryNames[category]}</h3>
                            <p className="text-sm text-gray-600">{userPerms.length} من {permissions.length} صلاحية</p>
                          </div>
                        </div>
                      </div>

                      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4 p-6' : 'space-y-3 p-6'}>
                        {userPerms.map(permission => (
                          <div key={permission.id} className="flex items-start gap-3 p-4 rounded-lg border-2 border-blue-200 bg-blue-50">
                            <FiUnlock className="w-5 h-5 text-blue-600 mt-1" />
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{permission.name.ar}</h4>
                              <p className="text-sm text-gray-600">{permission.description.ar}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Admin View */}
            {isAdmin && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ALL_PERMISSIONS.map(perm => (
                  <div key={perm.id} className="flex items-start gap-3 p-4 rounded-lg border-2 border-green-200 bg-green-50">
                    <FiCheckCircle className="w-5 h-5 text-green-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">{perm.name.ar}</h4>
                      <p className="text-xs text-gray-600">{perm.description.ar}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <InstantLink href="/dashboard" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition group">
              <div className="flex items-center gap-4">
                <FiHome className="w-8 h-8 text-blue-600" />
                <div>
                  <h3 className="font-bold text-gray-900">لوحة التحكم</h3>
                  <p className="text-sm text-gray-600">نظرة شاملة</p>
                </div>
              </div>
            </InstantLink>

            <InstantLink href="/admin/permissions" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition group">
              <div className="flex items-center gap-4">
                <FiEye className="w-8 h-8 text-purple-600" />
                <div>
                  <h3 className="font-bold text-gray-900">عرض الصلاحيات</h3>
                  <p className="text-sm text-gray-600">جميع الصلاحيات</p>
                </div>
              </div>
            </InstantLink>

            <InstantLink href="/settings" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition group">
              <div className="flex items-center gap-4">
                <FiSettings className="w-8 h-8 text-gray-600" />
                <div>
                  <h3 className="font-bold text-gray-900">الإعدادات</h3>
                  <p className="text-sm text-gray-600">إدارة الحساب</p>
                </div>
              </div>
            </InstantLink>
          </div>

        </div>
      </div>
    </>
  );
}

function getRoleName(role: string): string {
  const roles: Record<string, string> = {
    company_admin: 'مدير الشركة',
    property_owner: 'مالك عقار',
    property_manager: 'مدير عقار',
    accountant: 'محاسب',
    legal_advisor: 'مستشار قانوني',
    sales_agent: 'مندوب مبيعات',
    maintenance_staff: 'فني صيانة',
    tenant: 'مستأجر',
    investor: 'مستثمر',
    customer_viewer: 'عميل متصفح'
  };
  return roles[role] || role;
}

function getPlanName(plan: string): string {
  const plans: Record<string, string> = {
    free: 'مجانية',
    basic: 'أساسية',
    professional: 'احترافية',
    premium: 'مميزة',
    enterprise: 'شركات'
  };
  return plans[plan] || plan;
}

