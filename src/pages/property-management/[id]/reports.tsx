// src/pages/property-management/[id]/reports.tsx - صفحة التقارير المالية
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion } from 'framer-motion';
import InstantLink from '@/components/InstantLink';

interface Property {
  id: string;
  titleAr: string;
  address: string;
  buildingType: 'single' | 'multi';
  units?: any[];
}

interface FinancialReport {
  period: string;
  totalExpenses: number;
  totalReimbursed: number;
  netExpenses: number;
  serviceCosts: number;
  maintenanceCosts: number;
  utilityCosts: number;
  otherCosts: number;
  currency: string;
}

interface ExpenseCategory {
  category: string;
  amount: number;
  percentage: number;
  count: number;
}

export default function PropertyReports() {
  const router = useRouter();
  const { id } = router.query;
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportPeriod, setReportPeriod] = useState('month');
  const [financialReport, setFinancialReport] = useState<FinancialReport | null>(null);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      fetchPropertyData();
    }
  }, [id, reportPeriod]);

  const fetchPropertyData = async () => {
    try {
      setLoading(true);
      
      // جلب بيانات العقار
      const propertyResponse = await fetch(`/api/properties/${id}`);
      if (propertyResponse.ok) {
        const propertyData = await propertyResponse.json();
        setProperty(propertyData.property);
      }

      // جلب المصاريف
      const expensesResponse = await fetch(`/api/property-expenses?propertyId=${id}`);
      if (expensesResponse.ok) {
        const expensesData = await expensesResponse.json();
        setExpenses(expensesData.expenses || []);
        generateFinancialReport(expensesData.expenses || []);
      }

    } catch (error) {
      console.error('Error fetching property data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateFinancialReport = (expensesData: any[]) => {
    const now = new Date();
    let startDate: Date;
    
    switch (reportPeriod) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const filteredExpenses = expensesData.filter(expense => 
      new Date(expense.date) >= startDate
    );

    const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalReimbursed = filteredExpenses.reduce((sum, exp) => sum + exp.reimbursedAmount, 0);
    const netExpenses = totalExpenses - totalReimbursed;

    // تصنيف المصاريف
    const categories: { [key: string]: { amount: number; count: number } } = {};
    filteredExpenses.forEach(expense => {
      const category = expense.expenseCategory || expense.expenseType || 'أخرى';
      if (!categories[category]) {
        categories[category] = { amount: 0, count: 0 };
      }
      categories[category].amount += expense.amount;
      categories[category].count += 1;
    });

    const expenseCategoriesData = Object.entries(categories).map(([category, data]) => ({
      category,
      amount: data.amount,
      percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0,
      count: data.count
    })).sort((a, b) => b.amount - a.amount);

    setExpenseCategories(expenseCategoriesData);

    // حساب تكاليف الخدمات والصيانة والمرافق
    const serviceCosts = categories['مرافق']?.amount || 0;
    const maintenanceCosts = categories['صيانة']?.amount || 0;
    const utilityCosts = (categories['كهرباء']?.amount || 0) + 
                       (categories['ماء']?.amount || 0) + 
                       (categories['إنترنت']?.amount || 0);
    const otherCosts = totalExpenses - serviceCosts - maintenanceCosts - utilityCosts;

    setFinancialReport({
      period: reportPeriod,
      totalExpenses,
      totalReimbursed,
      netExpenses,
      serviceCosts,
      maintenanceCosts,
      utilityCosts,
      otherCosts,
      currency: 'OMR'
    });
  };

  const formatCurrency = (amount: number, currency: string = 'OMR') => {
    return `${amount.toLocaleString()} ${currency}`;
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(1)}%`;
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'week': return 'الأسبوع الماضي';
      case 'month': return 'هذا الشهر';
      case 'quarter': return 'هذا الربع';
      case 'year': return 'هذا العام';
      default: return 'آخر 30 يوم';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل التقارير...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">العقار غير موجود</h1>
          <InstantLink href="/dashboard/property-owner" className="text-blue-600 hover:underline">
            العودة للوحة التحكم
          </InstantLink>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>التقارير المالية - {property.titleAr}</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* الشريط العلوي */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <InstantLink 
                  href={`/property-management/${id}`} 
                  className="text-gray-500 hover:text-gray-700"
                >
                  <span className="text-xl">←</span>
                </InstantLink>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">التقارير المالية</h1>
                  <p className="text-sm text-gray-500">{property.titleAr} - {property.address}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={reportPeriod}
                  onChange={(e) => setReportPeriod(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="week">الأسبوع الماضي</option>
                  <option value="month">هذا الشهر</option>
                  <option value="quarter">هذا الربع</option>
                  <option value="year">هذا العام</option>
                </select>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  <span className="ml-2">📥</span>
                  تصدير التقرير
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* المحتوى */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* ملخص مالي */}
            {financialReport && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <span className="text-2xl">💰</span>
                    </div>
                    <div className="mr-4">
                      <p className="text-sm font-medium text-gray-500">إجمالي المصاريف</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(financialReport.totalExpenses)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <span className="text-2xl">✅</span>
                    </div>
                    <div className="mr-4">
                      <p className="text-sm font-medium text-gray-500">المبالغ المستردة</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(financialReport.totalReimbursed)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <span className="text-2xl">📊</span>
                    </div>
                    <div className="mr-4">
                      <p className="text-sm font-medium text-gray-500">صافي المصاريف</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(financialReport.netExpenses)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <span className="text-2xl">📅</span>
                    </div>
                    <div className="mr-4">
                      <p className="text-sm font-medium text-gray-500">الفترة</p>
                      <p className="text-lg font-bold text-gray-900">
                        {getPeriodLabel(financialReport.period)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* توزيع المصاريف */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">توزيع المصاريف حسب النوع</h3>
                <div className="space-y-4">
                  {expenseCategories.map((category, index) => (
                    <div key={category.category} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full ml-3 ${
                          index === 0 ? 'bg-red-500' :
                          index === 1 ? 'bg-orange-500' :
                          index === 2 ? 'bg-yellow-500' :
                          index === 3 ? 'bg-green-500' :
                          'bg-blue-500'
                        }`}></div>
                        <span className="text-sm font-medium text-gray-900">{category.category}</span>
                        <span className="text-xs text-gray-500 mr-2">({category.count})</span>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(category.amount)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatPercentage(category.percentage)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">تفصيل التكاليف</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-2xl ml-3">⚡</span>
                      <span className="text-sm font-medium text-gray-900">المرافق</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(financialReport?.serviceCosts || 0)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-2xl ml-3">🔧</span>
                      <span className="text-sm font-medium text-gray-900">الصيانة</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(financialReport?.maintenanceCosts || 0)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-2xl ml-3">💧</span>
                      <span className="text-sm font-medium text-gray-900">الكهرباء والماء</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(financialReport?.utilityCosts || 0)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-2xl ml-3">📦</span>
                      <span className="text-sm font-medium text-gray-900">أخرى</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(financialReport?.otherCosts || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* المصاريف الحديثة */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-medium text-gray-900">المصاريف الحديثة</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        المصروف
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        النوع
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
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {expenses.slice(0, 10).map((expense) => (
                      <tr key={expense.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {expense.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {expense.expenseCategory || expense.expenseType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(expense.amount, expense.currency)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(expense.date).toLocaleDateString('ar')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            expense.status === 'paid' 
                              ? 'bg-green-100 text-green-800'
                              : expense.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {expense.status === 'paid' ? 'مدفوع' : expense.status === 'pending' ? 'معلق' : 'متأخر'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </>
  );
}
