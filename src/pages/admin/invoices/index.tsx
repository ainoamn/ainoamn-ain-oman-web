// src/pages/admin/invoices/index.tsx - إدارة الفواتير والمحاسبة
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function InvoicesManagementPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>إدارة الفواتير والمحاسبة - عين عُمان</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">إدارة الفواتير والمحاسبة</h1>
                <p className="mt-1 text-sm text-gray-500">
                  إدارة شاملة للفواتير والمحاسبة المالية
                </p>
              </div>
              <div className="flex gap-3">
                <Link 
                  href="/admin/dashboard"
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  ← لوحة التحكم
                </Link>
                <Link 
                  href="/admin/invoices/new"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <span className="ml-2">+</span>
                  إضافة فاتورة جديدة
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">إجمالي الفواتير</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
                <div className="text-4xl">📄</div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">إجمالي المبلغ</p>
                  <p className="text-2xl font-bold text-gray-900">0 ر.ع</p>
                </div>
                <div className="text-4xl">💰</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">الفواتير</h2>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد فواتير</h3>
              <p className="mt-1 text-sm text-gray-500">
                ابدأ بإضافة فاتورة جديدة لإدارة المحاسبة.
              </p>
              <div className="mt-6">
                <Link 
                  href="/admin/invoices/new"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <span className="ml-2">+</span>
                  إضافة فاتورة جديدة
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}