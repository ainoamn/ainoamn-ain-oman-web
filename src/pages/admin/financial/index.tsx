// src/pages/admin/financial/index.tsx - لوحة التحكم المالية الشاملة المحدثة
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  FiDollarSign, FiTrendingUp, FiTrendingDown, FiFileText,
  FiCreditCard, FiBarChart, FiPieChart, FiActivity,
  FiArrowUp, FiArrowDown, FiRefreshCw, FiUsers, FiPackage,
  FiHome, FiTarget, FiShoppingCart, FiShoppingBag, FiBriefcase,
  FiBox, FiCalendar, FiDownload, FiUpload
} from 'react-icons/fi';
import { TooltipToggle } from '@/components/common/SmartTooltip';

interface FinancialSummary {
  revenue: { total: number; monthly: number; growth: number; bySource: Record<string, number> };
  expenses: { total: number; monthly: number; growth: number; byCategory: Record<string, number> };
  profit: { gross: number; net: number; margin: number };
  cashFlow: { operating: number; investing: number; financing: number; net: number };
  receivables: { total: number; current: number; overdue: number; doubtful: number };
  payables: { total: number; current: number; overdue: number };
}

function FinancialDashboardContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);

  useEffect(() => {
    fetchFinancialSummary();
  }, []);

  const fetchFinancialSummary = async () => {
    setLoading(true);
    try {
      // جلب البيانات الفعلية من قاعدة البيانات
      const response = await fetch('/api/financial/summary');
      
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      } else {
        // في حالة عدم وجود API، استخدم بيانات فارغة (النظام مُصفّر)
        const emptySummary: FinancialSummary = {
          revenue: { total: 0, monthly: 0, growth: 0, bySource: { rent: 0, service: 0, subscription: 0, auction: 0, other: 0 } },
          expenses: { total: 0, monthly: 0, growth: 0, byCategory: { maintenance: 0, utilities: 0, salaries: 0, marketing: 0, administrative: 0, other: 0 } },
          profit: { gross: 0, net: 0, margin: 0 },
          cashFlow: { operating: 0, investing: 0, financing: 0, net: 0 },
          receivables: { total: 0, current: 0, overdue: 0, doubtful: 0 },
          payables: { total: 0, current: 0, overdue: 0 }
        };
        setSummary(emptySummary);
      }
    } catch (error) {

      // في حالة الخطأ، عرض بيانات فارغة (النظام مُصفّر)
      const emptySummary: FinancialSummary = {
        revenue: { total: 0, monthly: 0, growth: 0, bySource: { rent: 0, service: 0, subscription: 0, auction: 0, other: 0 } },
        expenses: { total: 0, monthly: 0, growth: 0, byCategory: { maintenance: 0, utilities: 0, salaries: 0, marketing: 0, administrative: 0, other: 0 } },
        profit: { gross: 0, net: 0, margin: 0 },
        cashFlow: { operating: 0, investing: 0, financing: 0, net: 0 },
        receivables: { total: 0, current: 0, overdue: 0, doubtful: 0 },
        payables: { total: 0, current: 0, overdue: 0 }
      };
      setSummary(emptySummary);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !summary) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل البيانات المالية...</p>
        </div>
      </div>
    );
  }

  const mainModules = [
    { id: 'customers', name: 'العملاء والموردين', icon: FiUsers, color: 'blue', path: '/admin/financial/customers', desc: 'إدارة جهات الاتصال' },
    { id: 'beneficiaries', name: 'المستفيدون', icon: FiUsers, color: 'purple', path: '/admin/financial/beneficiaries', desc: 'IBAN + حسابات بنكية' },
    { id: 'bank-accounts', name: 'الحسابات البنكية', icon: FiCreditCard, color: 'indigo', path: '/admin/financial/bank-accounts', desc: 'إدارة حساباتك' },
    { id: 'assets', name: 'الأصول الثابتة', icon: FiHome, color: 'green', path: '/admin/financial/assets', desc: 'أصول + إهلاك' },
    { id: 'cost-centers', name: 'مراكز التكلفة', icon: FiTarget, color: 'orange', path: '/admin/financial/cost-centers', desc: 'فروع/أقسام/مشاريع' },
    { id: 'sales', name: 'المبيعات', icon: FiShoppingCart, color: 'green', path: '/admin/financial/sales', desc: '8 أنواع مبيعات' },
    { id: 'purchases', name: 'المشتريات', icon: FiShoppingBag, color: 'blue', path: '/admin/financial/purchases', desc: '5 أنواع مشتريات' },
    { id: 'payroll', name: 'الرواتب', icon: FiBriefcase, color: 'purple', path: '/admin/financial/payroll', desc: 'رواتب وموظفين' },
    { id: 'inventory', name: 'المخزون', icon: FiPackage, color: 'teal', path: '/admin/financial/inventory', desc: 'منتجات ومستودعات' },
    { id: 'data-migration', name: 'نقل البيانات', icon: FiUpload, color: 'indigo', path: '/admin/financial/data-migration', desc: 'استيراد من 8 أنظمة' }
  ];

  const quickActions = [
    { name: 'الفواتير', icon: FiFileText, color: 'blue', path: '/admin/financial/invoices' },
    { name: 'المدفوعات', icon: FiDollarSign, color: 'green', path: '/admin/financial/payments' },
    { name: 'الشيكات', icon: FiCreditCard, color: 'purple', path: '/admin/financial/checks' },
    { name: 'المدينون', icon: FiTrendingUp, color: 'orange', path: '/admin/financial/receivables' },
    { name: 'الدائنون', icon: FiTrendingDown, color: 'red', path: '/admin/financial/payables' },
    { name: 'دليل الحسابات', icon: FiPieChart, color: 'indigo', path: '/admin/financial/accounts' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Head><title>لوحة التحكم المالية - عين عُمان</title></Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                <FiDollarSign className="text-green-600" />
                النظام المالي الشامل
              </h1>
              <p className="text-gray-600 mt-2">نظام محاسبي عالمي المستوى • 60+ صفحة • 14 نظام</p>
            </div>
            
            <div className="flex items-center gap-3">
              <TooltipToggle />
              <button onClick={fetchFinancialSummary} className="p-2 bg-white border rounded-lg hover:bg-gray-50">
                <FiRefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <FiTrendingUp className="w-10 h-10 opacity-80" />
              <span className="flex items-center text-sm bg-white bg-opacity-20 px-2 py-1 rounded-full">
                <FiArrowUp className="w-3 h-3 mr-1" />
                {summary.revenue.growth}%
              </span>
            </div>
            <p className="text-sm opacity-90">إجمالي الإيرادات</p>
            <p className="text-3xl font-bold mt-2">{summary.revenue.total.toLocaleString()} ر.ع</p>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <FiTrendingDown className="w-10 h-10 opacity-80" />
              <span className="flex items-center text-sm bg-white bg-opacity-20 px-2 py-1 rounded-full">
                <FiArrowUp className="w-3 h-3 mr-1" />
                {summary.expenses.growth}%
              </span>
            </div>
            <p className="text-sm opacity-90">إجمالي المصروفات</p>
            <p className="text-3xl font-bold mt-2">{summary.expenses.total.toLocaleString()} ر.ع</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <FiBarChart className="w-10 h-10 opacity-80" />
              <span className="text-sm bg-white bg-opacity-20 px-2 py-1 rounded-full">
                {summary.profit.margin.toFixed(1)}%
              </span>
            </div>
            <p className="text-sm opacity-90">صافي الربح</p>
            <p className="text-3xl font-bold mt-2">{summary.profit.net.toLocaleString()} ر.ع</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <FiActivity className="w-10 h-10 opacity-80" />
              <span className="flex items-center text-sm bg-white bg-opacity-20 px-2 py-1 rounded-full">
                {summary.cashFlow.net > 0 ? <FiArrowUp className="w-3 h-3 mr-1" /> : <FiArrowDown className="w-3 h-3 mr-1" />}
              </span>
            </div>
            <p className="text-sm opacity-90">التدفق النقدي</p>
            <p className="text-3xl font-bold mt-2">{summary.cashFlow.operating.toLocaleString()} ر.ع</p>
          </div>
        </div>

        {/* Main Financial Systems */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FiBox className="text-blue-600" />
            الأنظمة المالية الرئيسية (10 أنظمة)
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {mainModules.map((module) => {
              const Icon = module.icon;
              const colorClasses: Record<string, string> = {
                blue: 'from-blue-500 to-blue-600',
                purple: 'from-purple-500 to-purple-600',
                indigo: 'from-indigo-500 to-indigo-600',
                green: 'from-green-500 to-green-600',
                orange: 'from-orange-500 to-orange-600',
                teal: 'from-teal-500 to-teal-600'
              };

              return (
                <button
                  key={module.id}
                  onClick={() => router.push(module.path)}
                  className="bg-white rounded-xl shadow-sm border-2 border-gray-200 hover:border-blue-500 hover:shadow-md transition-all p-4 text-center group"
                >
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-lg bg-gradient-to-br ${colorClasses[module.color]} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-bold text-gray-900 text-sm mb-1">{module.name}</p>
                  <p className="text-xs text-gray-500">{module.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">الإجراءات السريعة</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              const colorClasses: Record<string, string> = {
                blue: 'bg-blue-50 hover:bg-blue-100 text-blue-600',
                green: 'bg-green-50 hover:bg-green-100 text-green-600',
                purple: 'bg-purple-50 hover:bg-purple-100 text-purple-600',
                orange: 'bg-orange-50 hover:bg-orange-100 text-orange-600',
                red: 'bg-red-50 hover:bg-red-100 text-red-600',
                indigo: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600'
              };

              return (
                <button
                  key={action.name}
                  onClick={() => router.push(action.path)}
                  className={`p-4 rounded-lg transition-colors text-center ${colorClasses[action.color]}`}
                >
                  <Icon className="w-6 h-6 mx-auto mb-2" />
                  <p className="text-sm font-medium">{action.name}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Financial Reports */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FiPieChart className="text-blue-600" />
            التقارير المالية (13 تقرير)
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button onClick={() => router.push('/admin/financial/reports/balance-sheet')} className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 text-right transition-colors">
              <h3 className="font-bold text-blue-900 mb-1">الميزانية العمومية</h3>
              <p className="text-xs text-blue-600">Balance Sheet</p>
            </button>
            
            <button onClick={() => router.push('/admin/financial/reports/income-statement')} className="p-4 bg-green-50 rounded-lg hover:bg-green-100 text-right transition-colors">
              <h3 className="font-bold text-green-900 mb-1">قائمة الدخل</h3>
              <p className="text-xs text-green-600">Income Statement</p>
            </button>
            
            <button onClick={() => router.push('/admin/financial/reports/cash-flow')} className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 text-right transition-colors">
              <h3 className="font-bold text-purple-900 mb-1">التدفقات النقدية</h3>
              <p className="text-xs text-purple-600">Cash Flow</p>
            </button>
            
            <button onClick={() => router.push('/admin/financial/reports/trial-balance')} className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 text-right transition-colors">
              <h3 className="font-bold text-orange-900 mb-1">ميزان المراجعة</h3>
              <p className="text-xs text-orange-600">Trial Balance</p>
            </button>
            
            <button onClick={() => router.push('/admin/financial/reports/ledger')} className="p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 text-right transition-colors">
              <h3 className="font-bold text-indigo-900 mb-1">دفتر الأستاذ</h3>
              <p className="text-xs text-indigo-600">General Ledger</p>
            </button>
            
            <button onClick={() => router.push('/admin/financial/reports/profit-loss')} className="p-4 bg-teal-50 rounded-lg hover:bg-teal-100 text-right transition-colors">
              <h3 className="font-bold text-teal-900 mb-1">الأرباح والخسائر</h3>
              <p className="text-xs text-teal-600">P&L Statement</p>
            </button>
            
            <button onClick={() => router.push('/admin/financial/reports')} className="p-4 bg-gray-100 rounded-lg hover:bg-gray-200 text-center transition-colors md:col-span-2 lg:col-span-3">
              <h3 className="font-bold text-gray-900">عرض جميع التقارير →</h3>
              <p className="text-xs text-gray-600">13 تقرير مالي ومحاسبي</p>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function FinancialDashboard() {
  return (
    <ProtectedRoute requiredPermission="view_financial">
      <FinancialDashboardContent />
    </ProtectedRoute>
  );
}
