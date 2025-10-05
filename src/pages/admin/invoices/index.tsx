// src/pages/admin/invoices/index.tsx - إدارة الفواتير والمحاسبة
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { FiPlus, FiFileText, FiDollarSign } from 'react-icons/fi';
import Layout from '@/components/layout/Layout';

export default function InvoicesManagementPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
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
              <div className="flex space-x-3 rtl:space-x-reverse">
                <Link
                  href="/admin/invoices/new"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <FiPlus className="w-4 h-4 ml-2" />
                  إضافة فاتورة جديدة
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FiFileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">إجمالي الفواتير</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FiDollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">إجمالي المبلغ</p>
                  <p className="text-2xl font-bold text-gray-900">0 ر.ع</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">الفواتير</h2>
            <div className="text-center py-12">
              <FiFileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد فواتير</h3>
              <p className="mt-1 text-sm text-gray-500">
                ابدأ بإضافة فاتورة جديدة لإدارة المحاسبة.
              </p>
              <div className="mt-6">
                <Link
                  href="/admin/invoices/new"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <FiPlus className="w-4 h-4 ml-2" />
                  إضافة فاتورة جديدة
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}