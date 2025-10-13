// src/pages/admin/financial/receivables.tsx - إدارة المدينون (الذمم المدينة)
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  FiTrendingDown, FiUser, FiDollarSign, FiCalendar, FiAlertTriangle,
  FiCheckCircle, FiClock, FiPhone, FiMail, FiFileText, FiSend,
  FiEye, FiDownload, FiFilter, FiSearch, FiRefreshCw
} from 'react-icons/fi';
import { analyzeCustomerBehavior, CustomerBehavior } from '@/lib/financial-ai';

interface CustomerReceivable {
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalOutstanding: number;        // المبلغ الإجمالي المستحق
  current: number;                 // جاري (< 30 يوم)
  overdue30: number;               // متأخر 30 يوم
  overdue60: number;               // متأخر 60 يوم
  overdue90: number;               // متأخر 90+ يوم
  oldestInvoiceDate: string;
  invoiceCount: number;
  behavior: CustomerBehavior | null;
}

export default function ReceivablesPage() {
  const router = useRouter();
  const [receivables, setReceivables] = useState<CustomerReceivable[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchReceivables();
  }, []);

  const fetchReceivables = async () => {
    setLoading(true);
    try {
      // بيانات تجريبية
      const mockReceivables: any[] = []; // تم إزالة البيانات الوهمية - يتم الجلب من API

      setReceivables(mockReceivables);
    } catch (error) {
      console.error('Error fetching receivables:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalOutstanding: receivables.reduce((sum, r) => sum + r.totalOutstanding, 0),
    current: receivables.reduce((sum, r) => sum + r.current, 0),
    overdue: receivables.reduce((sum, r) => sum + r.overdue30 + r.overdue60 + r.overdue90, 0),
    customersCount: receivables.length,
    highRisk: receivables.filter(r => r.behavior?.riskLevel === 'high').length
  };

  const filteredReceivables = receivables.filter(r =>
    r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>المدينون (الذمم المدينة) - النظام المالي</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FiTrendingDown className="text-green-600" />
            المدينون (الذمم المدينة)
          </h1>
          <p className="text-gray-600 mt-2">إدارة ومتابعة المستحقات من العملاء</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600">إجمالي المستحقات</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalOutstanding.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">ريال عُماني</p>
          </div>

          <div className="bg-green-50 rounded-xl shadow-sm p-6 border border-green-200">
            <p className="text-sm text-gray-600">جارية</p>
            <p className="text-3xl font-bold text-green-600">{stats.current.toLocaleString()}</p>
            <p className="text-xs text-green-700">{"<"} 30 يوم</p>
          </div>

          <div className="bg-red-50 rounded-xl shadow-sm p-6 border border-red-200">
            <p className="text-sm text-gray-600">متأخرة</p>
            <p className="text-3xl font-bold text-red-600">{stats.overdue.toLocaleString()}</p>
            <p className="text-xs text-red-700">{">"}  30 يوم</p>
          </div>

          <div className="bg-blue-50 rounded-xl shadow-sm p-6 border border-blue-200">
            <p className="text-sm text-gray-600">عدد العملاء</p>
            <p className="text-3xl font-bold text-blue-600">{stats.customersCount}</p>
          </div>

          <div className="bg-orange-50 rounded-xl shadow-sm p-6 border border-orange-200">
            <p className="text-sm text-gray-600">عالي المخاطر</p>
            <p className="text-3xl font-bold text-orange-600">{stats.highRisk}</p>
            <p className="text-xs text-orange-700">يحتاج متابعة</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="البحث عن عميل..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">العميل</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المبلغ الكلي</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">جاري</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">30 يوم</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">60 يوم</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">90+ يوم</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التقييم</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredReceivables.map((rec) => (
                <tr key={rec.customerId} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{rec.customerName}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <FiMail className="w-3 h-3" />
                      {rec.customerEmail}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <FiPhone className="w-3 h-3" />
                      {rec.customerPhone}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="text-lg font-bold text-gray-900">
                      {rec.totalOutstanding.toLocaleString()} ر.ع
                    </div>
                    <div className="text-xs text-gray-500">{rec.invoiceCount} فاتورة</div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <span className="text-sm text-green-600 font-medium">
                      {rec.current.toLocaleString()}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium ${rec.overdue30 > 0 ? 'text-yellow-600' : 'text-gray-400'}`}>
                      {rec.overdue30.toLocaleString()}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium ${rec.overdue60 > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
                      {rec.overdue60.toLocaleString()}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium ${rec.overdue90 > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                      {rec.overdue90.toLocaleString()}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4">
                    {rec.behavior && (
                      <div>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                          rec.behavior.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
                          rec.behavior.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {rec.behavior.paymentScore}/100
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          تأخير: {rec.behavior.averageDelayDays} يوم
                        </div>
                      </div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => alert('إرسال تذكير')}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="إرسال تذكير"
                      >
                        <FiSend className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => router.push(`/admin/financial/customers/${rec.customerId}`)}
                        className="text-green-600 hover:text-green-900 p-1"
                        title="عرض التفاصيل"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                    </div>
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

