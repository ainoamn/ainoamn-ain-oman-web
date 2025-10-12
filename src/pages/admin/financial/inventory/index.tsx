// src/pages/admin/financial/inventory/index.tsx - نظام المخزون
import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FiPackage, FiTrendingUp, FiTrendingDown, FiHome } from 'react-icons/fi';

export default function InventoryIndexPage() {
  const router = useRouter();

  const modules = [
    {
      id: 'products',
      name: 'المنتجات والخدمات',
      description: 'إدارة المنتجات والخدمات',
      icon: FiPackage,
      color: 'blue',
      count: 145,
      path: '/admin/financial/inventory/products'
    },
    {
      id: 'adjustments',
      name: 'تعديلات المخزون',
      description: 'تعديلات الجرد والكميات',
      icon: FiTrendingUp,
      color: 'orange',
      count: 23,
      path: '/admin/financial/inventory/adjustments'
    },
    {
      id: 'warehouses',
      name: 'المستودعات',
      description: 'إدارة المستودعات والمخازن',
      icon: FiHome,
      color: 'purple',
      count: 3,
      path: '/admin/financial/inventory/warehouses'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Head><title>المخزون - النظام المالي</title></Head>

      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FiPackage className="text-blue-600" />
            نظام المنتجات والمخزون
          </h1>
          <p className="text-gray-600 mt-2">إدارة شاملة للمنتجات والخدمات والمخزون</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600">إجمالي المنتجات</p>
            <p className="text-3xl font-bold text-gray-900">145</p>
          </div>
          <div className="bg-green-50 rounded-xl shadow-sm p-6 border border-green-200">
            <p className="text-sm text-gray-600">قيمة المخزون</p>
            <p className="text-2xl font-bold text-green-600">234,560</p>
            <p className="text-xs text-gray-500">ريال عُماني</p>
          </div>
          <div className="bg-orange-50 rounded-xl shadow-sm p-6 border border-orange-200">
            <p className="text-sm text-gray-600">منتجات منخفضة</p>
            <p className="text-3xl font-bold text-orange-600">12</p>
          </div>
          <div className="bg-red-50 rounded-xl shadow-sm p-6 border border-red-200">
            <p className="text-sm text-gray-600">نفدت الكمية</p>
            <p className="text-3xl font-bold text-red-600">3</p>
          </div>
        </div>

        {/* Modules */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {modules.map((module) => {
            const Icon = module.icon;
            const colorClasses = {
              blue: 'from-blue-500 to-blue-600',
              orange: 'from-orange-500 to-orange-600',
              purple: 'from-purple-500 to-purple-600'
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

