// src/pages/admin/dashboard.tsx - لوحة التحكم الرئيسية للإدارة
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  FiBuilding, FiUsers, FiFileText, FiCreditCard, FiTool, FiDollarSign,
  FiTrendingUp, FiCalendar, FiAlertTriangle, FiCheckCircle
} from 'react-icons/fi';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>لوحة التحكم الرئيسية - عين عُمان</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم الرئيسية</h1>
                <p className="mt-1 text-sm text-gray-500">
                  نظرة شاملة على إدارة العقارات والمستأجرين
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* إحصائيات رئيسية */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FiBuilding className="w-6 h-6 text-blue-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">إجمالي العقارات</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FiUsers className="w-6 h-6 text-green-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">إجمالي المستأجرين</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <FiDollarSign className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">إجمالي الإيرادات</p>
                  <p className="text-2xl font-bold text-gray-900">0 ر.ع</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FiFileText className="w-6 h-6 text-purple-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">إجمالي الفواتير</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </div>
          </div>

          {/* الوحدات السريعة */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">إدارة العقارات</h3>
              <div className="grid grid-cols-2 gap-4">
                <Link 
                  href="/admin/units"
                  className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center"
                >
                  <FiBuilding className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <span className="text-sm font-medium text-blue-800">إدارة الوحدات</span>
                </Link>
                <Link 
                  href="/admin/buildings"
                  className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-center"
                >
                  <FiBuilding className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <span className="text-sm font-medium text-green-800">إدارة المباني</span>
                </Link>
                <Link 
                  href="/admin/tenants"
                  className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-center"
                >
                  <FiUsers className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <span className="text-sm font-medium text-purple-800">إدارة المستأجرين</span>
                </Link>
                <Link 
                  href="/admin/bookings"
                  className="p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors text-center"
                >
                  <FiCalendar className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <span className="text-sm font-medium text-yellow-800">إدارة الحجوزات</span>
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">المالية والمحاسبة</h3>
              <div className="grid grid-cols-2 gap-4">
                <Link 
                  href="/admin/invoices"
                  className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center"
                >
                  <FiFileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <span className="text-sm font-medium text-blue-800">إدارة الفواتير</span>
                </Link>
                <Link 
                  href="/admin/checks"
                  className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-center"
                >
                  <FiCreditCard className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <span className="text-sm font-medium text-green-800">إدارة الشيكات</span>
                </Link>
                <Link 
                  href="/admin/maintenance"
                  className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-center"
                >
                  <FiTool className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <span className="text-sm font-medium text-purple-800">إدارة الصيانة</span>
                </Link>
                <Link 
                  href="/admin/tasks"
                  className="p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors text-center"
                >
                  <FiCheckCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <span className="text-sm font-medium text-yellow-800">إدارة المهام</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
