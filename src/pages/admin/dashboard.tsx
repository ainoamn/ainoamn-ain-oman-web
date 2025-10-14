// src/pages/admin/dashboard.tsx
import { useState, useEffect } from 'react';
import Head from 'next/head';
import InstantLink from '@/components/InstantLink';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('✅ AdminDashboard mounted');
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>لوحة التحكم - عين عُمان</title>
      </Head>

      {/* Header */}
      <div className="bg-white shadow border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم الرئيسية</h1>
          <p className="mt-1 text-sm text-gray-500">نظرة شاملة على إدارة العقارات</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-sm text-gray-600">إجمالي العقارات</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">0</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-sm text-gray-600">إجمالي المستأجرين</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">0</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-sm text-gray-600">إجمالي الإيرادات</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">0 ر.ع</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-sm text-gray-600">إجمالي الفواتير</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">0</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* إدارة العقارات */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">إدارة العقارات</h3>
            <div className="grid grid-cols-2 gap-4">
              <InstantLink 
                href="/admin/units"
                className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition text-center"
              >
                <div className="text-2xl mb-2">🏢</div>
                <span className="text-sm font-medium text-blue-800">إدارة الوحدات</span>
              </InstantLink>
              <InstantLink 
                href="/admin/buildings"
                className="block p-4 bg-green-50 rounded-lg hover:bg-green-100 transition text-center"
              >
                <div className="text-2xl mb-2">🏗️</div>
                <span className="text-sm font-medium text-green-800">إدارة المباني</span>
              </InstantLink>
              <InstantLink 
                href="/admin/tenants"
                className="block p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition text-center"
              >
                <div className="text-2xl mb-2">👥</div>
                <span className="text-sm font-medium text-purple-800">إدارة المستأجرين</span>
              </InstantLink>
              <InstantLink 
                href="/admin/bookings"
                className="block p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition text-center"
              >
                <div className="text-2xl mb-2">📅</div>
                <span className="text-sm font-medium text-yellow-800">إدارة الحجوزات</span>
              </InstantLink>
            </div>
          </div>

          {/* المالية والمحاسبة */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">المالية والمحاسبة</h3>
            <div className="grid grid-cols-2 gap-4">
              <InstantLink 
                href="/admin/invoices"
                className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition text-center"
              >
                <div className="text-2xl mb-2">📄</div>
                <span className="text-sm font-medium text-blue-800">إدارة الفواتير</span>
              </InstantLink>
              <InstantLink 
                href="/admin/checks"
                className="block p-4 bg-green-50 rounded-lg hover:bg-green-100 transition text-center"
              >
                <div className="text-2xl mb-2">💳</div>
                <span className="text-sm font-medium text-green-800">إدارة الشيكات</span>
              </InstantLink>
              <InstantLink 
                href="/admin/maintenance"
                className="block p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition text-center"
              >
                <div className="text-2xl mb-2">🔧</div>
                <span className="text-sm font-medium text-purple-800">إدارة الصيانة</span>
              </InstantLink>
              <InstantLink 
                href="/admin/tasks"
                className="block p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition text-center"
              >
                <div className="text-2xl mb-2">✅</div>
                <span className="text-sm font-medium text-yellow-800">إدارة المهام</span>
              </InstantLink>
            </div>
          </div>

          {/* الإدارة والصلاحيات */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">الإدارة والصلاحيات</h3>
            <div className="grid grid-cols-2 gap-4">
              <InstantLink 
                href="/admin/users"
                className="block p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition text-center"
              >
                <div className="text-2xl mb-2">👥</div>
                <span className="text-sm font-medium text-indigo-800">إدارة المستخدمين</span>
              </InstantLink>
              <InstantLink 
                href="/admin/roles-permissions"
                className="block p-4 bg-red-50 rounded-lg hover:bg-red-100 transition text-center"
              >
                <div className="text-2xl mb-2">🛡️</div>
                <span className="text-sm font-medium text-red-800">إدارة الأدوار</span>
              </InstantLink>
              <InstantLink 
                href="/admin/permissions"
                className="block p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition text-center"
              >
                <div className="text-2xl mb-2">🔐</div>
                <span className="text-sm font-medium text-orange-800">الصلاحيات</span>
              </InstantLink>
              <InstantLink 
                href="/admin/subscriptions"
                className="block p-4 bg-teal-50 rounded-lg hover:bg-teal-100 transition text-center"
              >
                <div className="text-2xl mb-2">💎</div>
                <span className="text-sm font-medium text-teal-800">الاشتراكات</span>
              </InstantLink>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
