// src/pages/admin/financial/sales/index.tsx - لوحة تحكم المبيعات
import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  FiShoppingCart, FiFileText, FiDollarSign, FiTrendingUp, FiCreditCard,
  FiPackage, FiSend, FiRefreshCw
} from 'react-icons/fi';

export default function SalesIndexPage() {
  const router = useRouter();

  const salesModules = [
    {
      id: 'quotations',
      name: 'عروض الأسعار',
      description: 'عروض الأسعار والفواتير المبدئية للعملاء',
      icon: FiFileText,
      color: 'blue',
      count: 15,
      path: '/admin/financial/sales/quotations'
    },
    {
      id: 'sales-invoices',
      name: 'فواتير البيع',
      description: 'فواتير البيع والخدمات المتقدمة',
      icon: FiShoppingCart,
      color: 'green',
      count: 0 /* 127 */,
      path: '/admin/financial/sales/invoices'
    },
    {
      id: 'receipts',
      name: 'سندات العملاء',
      description: 'سندات القبض من العملاء',
      icon: FiDollarSign,
      color: 'purple',
      count: 89,
      path: '/admin/financial/sales/receipts'
    },
    {
      id: 'recurring',
      name: 'فواتير مجدولة',
      description: 'فواتير متكررة تلقائياً',
      icon: FiRefreshCw,
      color: 'indigo',
      count: 23,
      path: '/admin/financial/sales/recurring'
    },
    {
      id: 'credit-notes',
      name: 'إشعارات دائنة',
      description: 'إشعارات الإرجاع والخصومات',
      icon: FiCreditCard,
      color: 'orange',
      count: 8,
      path: '/admin/financial/sales/credit-notes'
    },
    {
      id: 'cash-invoices',
      name: 'فواتير نقدية',
      description: 'فواتير البيع النقدي المباشر',
      icon: FiDollarSign,
      color: 'teal',
      count: 45,
      path: '/admin/financial/sales/cash-invoices'
    },
    {
      id: 'delivery-notes',
      name: 'إشعارات تسليم',
      description: 'إشعارات تسليم البضائع',
      icon: FiPackage,
      color: 'cyan',
      count: 34,
      path: '/admin/financial/sales/delivery-notes'
    },
    {
      id: 'api-invoices',
      name: 'فواتير API',
      description: 'فواتير من أنظمة خارجية',
      icon: FiSend,
      color: 'pink',
      count: 12,
      path: '/admin/financial/sales/api-invoices'
    }
  ];

  const stats = {
    totalInvoices: 0 /* 127 */,
    totalRevenue: 0 // تم تصفير من 345670,
    pendingAmount: 0 // تم تصفير من 45320,
    thisMonth: 0 // تم تصفير من 89540
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Head><title>المبيعات - النظام المالي</title></Head>

      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FiShoppingCart className="text-green-600" />
            نظام المبيعات
          </h1>
          <p className="text-gray-600 mt-2">إدارة شاملة لجميع عمليات البيع والفواتير</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي الفواتير</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalInvoices}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FiFileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-100">إجمالي الإيرادات</p>
                <p className="text-3xl font-bold">{stats.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-green-100">ريال عُماني</p>
              </div>
              <FiTrendingUp className="w-8 h-8" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-r-4 border-orange-500">
            <p className="text-sm text-gray-600">مبالغ معلقة</p>
            <p className="text-3xl font-bold text-orange-600">{stats.pendingAmount.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-r-4 border-purple-500">
            <p className="text-sm text-gray-600">هذا الشهر</p>
            <p className="text-3xl font-bold text-purple-600">{stats.thisMonth.toLocaleString()}</p>
          </div>
        </div>

        {/* Sales Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {salesModules.map((module) => {
            const Icon = module.icon;
            const colorClasses = {
              blue: 'from-blue-500 to-blue-600',
              green: 'from-green-500 to-green-600',
              purple: 'from-purple-500 to-purple-600',
              indigo: 'from-indigo-500 to-indigo-600',
              orange: 'from-orange-500 to-orange-600',
              teal: 'from-teal-500 to-teal-600',
              cyan: 'from-cyan-500 to-cyan-600',
              pink: 'from-pink-500 to-pink-600'
            };

            return (
              <div
                key={module.id}
                onClick={() => router.push(module.path)}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer overflow-hidden group"
              >
                <div className={`bg-gradient-to-br ${colorClasses[module.color as keyof typeof colorClasses]} p-6 text-white`}>
                  <Icon className="w-10 h-10 mb-3" />
                  <h3 className="text-xl font-bold mb-1">{module.name}</h3>
                  <p className="text-sm text-white text-opacity-90">{module.description}</p>
                </div>
                
                <div className="p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">{module.count}</span>
                    <span className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors">
                      عرض الكل →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

