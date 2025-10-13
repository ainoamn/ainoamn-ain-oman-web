// src/pages/admin/financial/purchases/index.tsx - لوحة تحكم المشتريات
import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FiShoppingBag, FiFileText, FiDollarSign, FiCreditCard, FiClipboard } from 'react-icons/fi';

export default function PurchasesIndexPage() {
  const router = useRouter();

  const purchaseModules = [
    {
      id: 'purchase-invoices',
      name: 'فواتير المشتريات',
      description: 'فواتير الشراء المتقدمة من الموردين',
      icon: FiShoppingBag,
      color: 'blue',
      count: 78,
      path: '/admin/financial/purchases/invoices'
    },
    {
      id: 'vouchers',
      name: 'سندات الموردين',
      description: 'سندات الصرف للموردين',
      icon: FiDollarSign,
      color: 'green',
      count: 56,
      path: '/admin/financial/purchases/vouchers'
    },
    {
      id: 'cash-expenses',
      name: 'مصروفات نقدية',
      description: 'المصروفات النقدية المباشرة',
      icon: FiDollarSign,
      color: 'orange',
      count: 34,
      path: '/admin/financial/purchases/cash-expenses'
    },
    {
      id: 'debit-notes',
      name: 'إشعارات مدينة',
      description: 'إشعارات الإرجاع والخصومات',
      icon: FiCreditCard,
      color: 'purple',
      count: 12,
      path: '/admin/financial/purchases/debit-notes'
    },
    {
      id: 'purchase-orders',
      name: 'أوامر الشراء',
      description: 'أوامر الشراء للموردين',
      icon: FiClipboard,
      color: 'indigo',
      count: 23,
      path: '/admin/financial/purchases/purchase-orders'
    }
  ];

  const stats = {
    totalPurchases: 78,
    totalExpenses: 0 // تم تصفير من 234560,
    pendingPayments: 0 // تم تصفير من 45320,
    thisMonth: 0 // تم تصفير من 67890
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Head><title>المشتريات - النظام المالي</title></Head>

      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FiShoppingBag className="text-blue-600" />
            نظام المشتريات
          </h1>
          <p className="text-gray-600 mt-2">إدارة شاملة لجميع عمليات الشراء والمصروفات</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600">إجمالي الفواتير</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalPurchases}</p>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-sm p-6 text-white">
            <p className="text-sm text-red-100">إجمالي المصروفات</p>
            <p className="text-3xl font-bold">{stats.totalExpenses.toLocaleString()}</p>
            <p className="text-xs text-red-100">ريال عُماني</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border-r-4 border-orange-500">
            <p className="text-sm text-gray-600">مدفوعات معلقة</p>
            <p className="text-3xl font-bold text-orange-600">{stats.pendingPayments.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border-r-4 border-purple-500">
            <p className="text-sm text-gray-600">هذا الشهر</p>
            <p className="text-3xl font-bold text-purple-600">{stats.thisMonth.toLocaleString()}</p>
          </div>
        </div>

        {/* Purchase Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {purchaseModules.map((module) => {
            const Icon = module.icon;
            const colorClasses = {
              blue: 'from-blue-500 to-blue-600',
              green: 'from-green-500 to-green-600',
              orange: 'from-orange-500 to-orange-600',
              purple: 'from-purple-500 to-purple-600',
              indigo: 'from-indigo-500 to-indigo-600'
            };

            return (
              <div
                key={module.id}
                onClick={() => router.push(module.path)}
                className="bg-white rounded-xl shadow-sm border hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
              >
                <div className={`bg-gradient-to-br ${colorClasses[module.color as keyof typeof colorClasses]} p-6 text-white`}>
                  <Icon className="w-10 h-10 mb-3" />
                  <h3 className="text-xl font-bold mb-1">{module.name}</h3>
                  <p className="text-sm text-white text-opacity-90">{module.description}</p>
                </div>
                
                <div className="p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">{module.count}</span>
                    <span className="text-sm text-gray-600">عرض الكل →</span>
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

