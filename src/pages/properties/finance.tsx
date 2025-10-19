// src/pages/properties/finance.tsx - المالية العقارية
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import InstantLink from '@/components/InstantLink';
import { 
  FiDollarSign, FiTrendingUp, FiTrendingDown, FiCalendar, FiFileText,
  FiCreditCard, FiDownload, FiPrinter, FiShare2, FiEye, FiEdit,
  FiPieChart, FiBarChart, FiActivity, FiAlertTriangle, FiCheckCircle
} from 'react-icons/fi';


interface FinancialData {
  totalRevenue: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  totalExpenses: number;
  netProfit: number;
  occupancyRate: number;
  averageRent: number;
  pendingPayments: number;
  overduePayments: number;
}

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  date: string;
  propertyId: string;
  propertyName: string;
  status: 'completed' | 'pending' | 'overdue';
  reference?: string;
}

interface PropertyFinancial {
  id: string;
  name: string;
  monthlyRent: number;
  occupancyRate: number;
  totalRevenue: number;
  expenses: number;
  netProfit: number;
  lastPayment: string;
  nextPayment: string;
}

export default function PropertiesFinancePage() {
  const [financialData, setFinancialData] = useState<FinancialData>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    yearlyRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    occupancyRate: 0,
    averageRent: 0,
    pendingPayments: 0,
    overduePayments: 0
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [properties, setProperties] = useState<PropertyFinancial[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedProperty, setSelectedProperty] = useState('all');

  useEffect(() => {
    loadFinancialData();
  }, [selectedPeriod, selectedProperty]);

  const loadFinancialData = async () => {
    try {
      // تحميل البيانات المالية
      const financialResponse = await fetch(`/api/properties/finance?period=${selectedPeriod}&property=${selectedProperty}`);
      if (financialResponse.ok) {
        const financialData = await financialResponse.json();
        setFinancialData(financialData);
      }

      // تحميل المعاملات
      const transactionsResponse = await fetch(`/api/properties/transactions?period=${selectedPeriod}&property=${selectedProperty}`);
      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        setTransactions(transactionsData.transactions || []);
      }

      // تحميل العقارات
      const propertiesResponse = await fetch('/api/properties/financial-summary');
      if (propertiesResponse.ok) {
        const propertiesData = await propertiesResponse.json();
        setProperties(propertiesData.properties || []);
      }
    } catch (error) {
      console.error('Error loading financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-OM', {
      style: 'currency',
      currency: 'OMR',
      maximumFractionDigits: 3
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar', { calendar: 'gregory', numberingSystem: 'latn' });
  };

  const getTransactionIcon = (type: string) => {
    return type === 'income' ? <FiTrendingUp className="w-4 h-4 text-green-600" /> : <FiTrendingDown className="w-4 h-4 text-red-600" />;
  };

  const getTransactionColor = (type: string) => {
    return type === 'income' ? 'text-green-600' : 'text-red-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'مكتمل';
      case 'pending': return 'معلق';
      case 'overdue': return 'متأخر';
      default: return status;
    }
  };

  const exportToPDF = async () => {
    try {
      const response = await fetch('/api/properties/finance/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          period: selectedPeriod,
          property: selectedProperty,
          format: 'pdf'
        }),
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `financial-report-${selectedPeriod}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

  if (loading) {
    return (
      <>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>المالية العقارية - عين عُمان</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">المالية العقارية</h1>
                <p className="mt-1 text-sm text-gray-500">
                  إدارة الإيرادات والمصروفات والعقارات
                </p>
              </div>
              <div className="flex space-x-3 rtl:space-x-reverse">
                <button
                  onClick={exportToPDF}
                  className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  <FiDownload className="w-4 h-4 ml-2" />
                  تصدير PDF
                </button>
                <button className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                  <FiShare2 className="w-4 h-4 ml-2" />
                  مشاركة
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* فلاتر الفترة */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الفترة</label>
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="week">هذا الأسبوع</option>
                    <option value="month">هذا الشهر</option>
                    <option value="quarter">هذا الربع</option>
                    <option value="year">هذا العام</option>
                    <option value="all">جميع الفترات</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">العقار</label>
                  <select
                    value={selectedProperty}
                    onChange={(e) => setSelectedProperty(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">جميع العقارات</option>
                    {properties.map(property => (
                      <option key={property.id} value={property.id}>
                        {property.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  <FiPieChart className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  <FiBarChart3 className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* الإحصائيات الرئيسية */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FiDollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">إجمالي الإيرادات</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(financialData.totalRevenue)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <FiTrendingDown className="w-6 h-6 text-red-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">إجمالي المصروفات</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(financialData.totalExpenses)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FiTrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">صافي الربح</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(financialData.netProfit)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <FiActivity className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">معدل الإشغال</p>
                  <p className="text-2xl font-bold text-gray-900">{financialData.occupancyRate}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* تفاصيل العقارات */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* ملخص العقارات */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">ملخص العقارات</h3>
              <div className="space-y-4">
                {properties.map((property) => (
                  <div key={property.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{property.name}</h4>
                      <span className="text-sm text-gray-500">{property.occupancyRate}% إشغال</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">الإيجار الشهري</p>
                        <p className="font-medium">{formatCurrency(property.monthlyRent)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">إجمالي الإيرادات</p>
                        <p className="font-medium">{formatCurrency(property.totalRevenue)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">صافي الربح</p>
                        <p className="font-medium">{formatCurrency(property.netProfit)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* المعاملات الأخيرة */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">المعاملات الأخيرة</h3>
                <InstantLink 
                  href="/properties/transactions"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  عرض الكل
                </InstantLink>
              </div>
              <div className="space-y-3">
                {transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-xs text-gray-500">{transaction.propertyName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${getTransactionColor(transaction.type)}`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(transaction.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* جدول المعاملات التفصيلي */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">المعاملات المالية</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      النوع
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الوصف
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      العقار
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المبلغ
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      التاريخ
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الحالة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getTransactionIcon(transaction.type)}
                          <span className="mr-2 text-sm text-gray-900">
                            {transaction.type === 'income' ? 'إيراد' : 'مصروف'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{transaction.description}</div>
                        <div className="text-sm text-gray-500">{transaction.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{transaction.propertyName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${getTransactionColor(transaction.type)}`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(transaction.date)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          {getStatusText(transaction.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <button className="text-blue-600 hover:text-blue-900 p-1" title="عرض">
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-900 p-1" title="طباعة">
                            <FiPrinter className="w-4 h-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-900 p-1" title="مشاركة">
                            <FiShare2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {transactions.length === 0 && (
                <div className="text-center py-12">
                  <FiFileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد معاملات</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    سيتم عرض المعاملات المالية هنا.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
