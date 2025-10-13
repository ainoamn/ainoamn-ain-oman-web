// src/pages/admin/financial/payables.tsx - إدارة الدائنون (الذمم الدائنة)
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  FiTrendingUp, FiUser, FiDollarSign, FiCalendar, FiAlertTriangle,
  FiCheckCircle, FiClock, FiPhone, FiMail, FiFileText,
  FiEye, FiDownload, FiSearch, FiRefreshCw
} from 'react-icons/fi';

interface VendorPayable {
  vendorId: string;
  vendorName: string;
  vendorEmail: string;
  vendorPhone: string;
  totalOwed: number;
  current: number;
  overdue30: number;
  overdue60: number;
  overdue90: number;
  nextDueDate: string;
  nextDueAmount: number;
  billCount: number;
}

export default function PayablesPage() {
  const router = useRouter();
  const [payables, setPayables] = useState<VendorPayable[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayables();
  }, []);

  const fetchPayables = async () => {
    setLoading(true);
    try {
      const mockPayables: any[] = []; // تم إزالة البيانات الوهمية - يتم الجلب من API

      setPayables([]); // تم استبدال mockPayables ببيانات فارغة
    } catch (error) {
      console.error('Error fetching payables:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalOwed: payables.reduce((sum, p) => sum + p.totalOwed, 0),
    current: payables.reduce((sum, p) => sum + p.current, 0),
    overdue: payables.reduce((sum, p) => sum + p.overdue30 + p.overdue60 + p.overdue90, 0),
    vendorsCount: payables.length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>الدائنون (الذمم الدائنة) - النظام المالي</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FiTrendingUp className="text-red-600" />
            الدائنون (الذمم الدائنة)
          </h1>
          <p className="text-gray-600 mt-2">إدارة ومتابعة المدفوعات للموردين</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600">إجمالي المستحق</p>
            <p className="text-3xl font-bold text-red-600">{stats.totalOwed.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">ريال عُماني</p>
          </div>

          <div className="bg-blue-50 rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600">جاري</p>
            <p className="text-3xl font-bold text-blue-600">{stats.current.toLocaleString()}</p>
          </div>

          <div className="bg-orange-50 rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600">متأخر</p>
            <p className="text-3xl font-bold text-orange-600">{stats.overdue.toLocaleString()}</p>
          </div>

          <div className="bg-gray-50 rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600">الموردين</p>
            <p className="text-3xl font-bold text-gray-900">{stats.vendorsCount}</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المورد</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المبلغ الكلي</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">جاري</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">متأخر</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">القادم</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payables.map((pay) => (
                <tr key={pay.vendorId} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{pay.vendorName}</div>
                    <div className="text-xs text-gray-500">{pay.vendorEmail}</div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="text-lg font-bold text-red-600">
                      {pay.totalOwed.toLocaleString()} ر.ع
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 text-sm text-blue-600 font-medium">
                    {pay.current.toLocaleString()}
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="text-sm text-orange-600 font-medium">
                      {(pay.overdue30 + pay.overdue60 + pay.overdue90).toLocaleString()}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {pay.nextDueAmount.toLocaleString()} ر.ع
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(pay.nextDueDate).toLocaleDateString('ar-OM')}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <button
                      onClick={() => router.push(`/admin/financial/vendors/${pay.vendorId}`)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <FiEye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

