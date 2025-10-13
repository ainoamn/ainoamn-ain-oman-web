// src/pages/admin/financial/reports/index.tsx - مركز التقارير المالية المتقدم
import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  FiPieChart, FiBarChart, FiActivity, FiTrendingUp, FiTrendingDown,
  FiUsers, FiClock, FiPercent, FiPackage, FiFileText, FiDollarSign
} from 'react-icons/fi';
import { AccountingTerm, TooltipToggle } from '@/components/common/SmartTooltip';

export default function ReportsIndexPage() {
  const router = useRouter();

  const reportCategories = [
    {
      category: 'القوائم المالية',
      color: 'blue',
      reports: [
        {
          id: 'balance-sheet',
          name: 'الميزانية العمومية',
          nameEn: 'Balance Sheet',
          description: 'الأصول والخصوم وحقوق الملكية',
          icon: FiPieChart,
          path: '/admin/financial/reports/balance-sheet',
          termKey: 'balance_sheet'
        },
        {
          id: 'income-statement',
          name: 'قائمة الدخل',
          nameEn: 'Income Statement',
          description: 'الإيرادات والمصروفات والأرباح',
          icon: FiBarChart,
          path: '/admin/financial/reports/income-statement',
          termKey: 'income_statement'
        },
        {
          id: 'cash-flow',
          name: 'قائمة التدفقات النقدية',
          nameEn: 'Cash Flow Statement',
          description: 'التدفقات النقدية التشغيلية والاستثمارية',
          icon: FiActivity,
          path: '/admin/financial/reports/cash-flow',
          termKey: 'cash_flow'
        },
        {
          id: 'trial-balance',
          name: 'ميزان المراجعة',
          nameEn: 'Trial Balance',
          description: 'أرصدة جميع الحسابات',
          icon: FiFileText,
          path: '/admin/financial/reports/trial-balance',
          termKey: 'trial_balance'
        },
        {
          id: 'ledger',
          name: 'دفتر الأستاذ العام',
          nameEn: 'General Ledger',
          description: 'جميع القيود المحاسبية',
          icon: FiFileText,
          path: '/admin/financial/reports/ledger',
          termKey: 'journal_entry'
        },
        {
          id: 'profit-loss',
          name: 'الأرباح والخسائر',
          nameEn: 'Profit & Loss',
          description: 'تقرير الأرباح والخسائر التفصيلي',
          icon: FiDollarSign,
          path: '/admin/financial/reports/profit-loss',
          termKey: 'income_statement'
        }
      ]
    },
    {
      category: 'تقارير المبيعات',
      color: 'green',
      reports: [
        {
          id: 'customer-statement',
          name: 'كشف حساب عميل',
          nameEn: 'Customer Statement',
          description: 'كشف حساب تفصيلي لعميل معين',
          icon: FiUsers,
          path: '/admin/financial/reports/customer-statement',
          termKey: 'accounts_receivable'
        },
        {
          id: 'receivables-aging',
          name: 'تقادم الحسابات المدينة',
          nameEn: 'Receivables Aging',
          description: 'تحليل أعمار الديون المستحقة',
          icon: FiClock,
          path: '/admin/financial/reports/receivables-aging',
          termKey: 'accounts_receivable'
        },
        {
          id: 'sales-by-customer',
          name: 'المبيعات بحسب العميل',
          nameEn: 'Sales by Customer',
          description: 'تقرير المبيعات موزعة حسب العملاء',
          icon: FiTrendingUp,
          path: '/admin/financial/reports/sales-by-customer',
          termKey: 'income_statement'
        }
      ]
    },
    {
      category: 'تقارير المشتريات',
      color: 'purple',
      reports: [
        {
          id: 'vendor-statement',
          name: 'كشف حساب مورد',
          nameEn: 'Vendor Statement',
          description: 'كشف حساب تفصيلي لمورد معين',
          icon: FiUsers,
          path: '/admin/financial/reports/vendor-statement',
          termKey: 'accounts_payable'
        },
        {
          id: 'payables-aging',
          name: 'تقادم الحسابات الدائنة',
          nameEn: 'Payables Aging',
          description: 'تحليل أعمار الديون المستحقة للموردين',
          icon: FiClock,
          path: '/admin/financial/reports/payables-aging',
          termKey: 'accounts_payable'
        }
      ]
    },
    {
      category: 'تقارير أخرى',
      color: 'orange',
      reports: [
        {
          id: 'tax-report',
          name: 'تقرير الضرائب',
          nameEn: 'Tax Report',
          description: 'تقرير شامل للضرائب',
          icon: FiPercent,
          path: '/admin/financial/reports/tax-report',
          termKey: 'vat'
        },
        {
          id: 'inventory-movement',
          name: 'حركة المخزون',
          nameEn: 'Inventory Movement',
          description: 'تقرير تفصيلي لحركة المخزون',
          icon: FiPackage,
          path: '/admin/financial/reports/inventory-movement',
          termKey: 'current_assets'
        }
      ]
    }
  ];

  const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
    green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Head><title>التقارير المالية - النظام المالي</title></Head>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              <FiPieChart className="text-blue-600" />
              مركز التقارير المالية
            </h1>
            <p className="text-gray-600 mt-2">13 تقرير مالي ومحاسبي شامل</p>
          </div>
          <TooltipToggle />
        </div>

        {/* Info Banner */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white mb-8 shadow-lg">
          <h3 className="text-xl font-bold mb-2">🌟 تقارير عالمية المستوى</h3>
          <p className="text-blue-100">
            جميع التقارير متوافقة مع المعايير الدولية IFRS ومبنية بأعلى المعايير المحاسبية
          </p>
        </div>

        {/* Report Categories */}
        <div className="space-y-8">
          {reportCategories.map((category) => {
            const colors = colorClasses[category.color];
            
            return (
              <div key={category.category}>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className={`w-2 h-8 rounded ${colors.bg} ${colors.border} border-r-4`}></div>
                  {category.category}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.reports.map((report) => {
                    const Icon = report.icon;
                    
                    return (
                      <div
                        key={report.id}
                        onClick={() => router.push(report.path)}
                        className={`${colors.bg} border ${colors.border} rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all group`}
                      >
                        {report.termKey ? (
                          <AccountingTerm termKey={report.termKey}>
                            <div className="flex items-start justify-between mb-3">
                              <Icon className={`w-10 h-10 ${colors.text}`} />
                              <span className="text-xs bg-white px-2 py-1 rounded text-gray-600">
                                {report.nameEn}
                              </span>
                            </div>
                          </AccountingTerm>
                        ) : (
                          <div className="flex items-start justify-between mb-3">
                            <Icon className={`w-10 h-10 ${colors.text}`} />
                            <span className="text-xs bg-white px-2 py-1 rounded text-gray-600">
                              {report.nameEn}
                            </span>
                          </div>
                        )}
                        
                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {report.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          {report.description}
                        </p>
                        
                        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                          <span className={`text-xs font-medium ${colors.text}`}>
                            عرض التقرير →
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
