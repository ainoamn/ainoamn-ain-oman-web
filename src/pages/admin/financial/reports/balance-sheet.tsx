// src/pages/admin/financial/reports/balance-sheet.tsx - الميزانية العمومية
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  FiPieChart, FiTrendingUp, FiTrendingDown, FiDownload,
  FiPrinter, FiCalendar, FiDollarSign, FiCheckCircle, FiAlertCircle
} from 'react-icons/fi';
import { BalanceSheet } from '@/types/financial';

export default function BalanceSheetPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheet | null>(null);
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchBalanceSheet();
  }, [asOfDate]);

  const fetchBalanceSheet = async () => {
    setLoading(true);
    try {
      // جلب البيانات من API
      const response = await fetch(`/api/financial/balance-sheet?date=${asOfDate}`);
      
      if (response.ok) {
        const data = await response.json();
        setBalanceSheet(data);
      } else {
        // النظام مُصفّر - بيانات فارغة
        const emptyBalanceSheet: any = {
          asOfDate: asOfDate,
          assets: {
            currentAssets: { cash: 0, accountsReceivable: 0, inventory: 0, prepaidExpenses: 0, otherCurrentAssets: 0, total: 0 },
            fixedAssets: { property: 0, equipment: 0, vehicles: 0, accumulatedDepreciation: 0, total: 0 },
            total: 0
          },
          liabilities: {
            currentLiabilities: { accountsPayable: 0, shortTermLoans: 0, accruedExpenses: 0, customerDeposits: 0, otherCurrentLiabilities: 0, total: 0 },
            longTermLiabilities: { longTermLoans: 0, deferredTaxLiabilities: 0, otherLongTermLiabilities: 0, total: 0 },
            total: 0
          },
          equity: {
            capital: 0,
            retainedEarnings: 0,
            currentYearProfit: 0,
            total: 0
          },
          totalLiabilitiesAndEquity: 0
        };
        setBalanceSheet(emptyBalanceSheet);
      }
    } catch (error) {

      // في حالة الخطأ، عرض بيانات فارغة
      const emptyBalanceSheet: any = {
        asOfDate: asOfDate,
        assets: {
          currentAssets: { cash: 0, accountsReceivable: 0, inventory: 0, prepaidExpenses: 0, otherCurrentAssets: 0, total: 0 },
          fixedAssets: { property: 0, equipment: 0, vehicles: 0, accumulatedDepreciation: 0, total: 0 },
          total: 0
        },
        liabilities: {
          currentLiabilities: { accountsPayable: 0, shortTermLoans: 0, accruedExpenses: 0, customerDeposits: 0, otherCurrentLiabilities: 0, total: 0 },
          longTermLiabilities: { longTermLoans: 0, deferredTaxLiabilities: 0, otherLongTermLiabilities: 0, total: 0 },
          total: 0
        },
        equity: {
          capital: 0,
          retainedEarnings: 0,
          currentYearProfit: 0,
          total: 0
        },
        totalLiabilitiesAndEquity: 0
      };
      setBalanceSheet(emptyBalanceSheet);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !balanceSheet) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p>جاري تحميل الميزانية...</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-OM', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>الميزانية العمومية - التقارير المالية</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FiPieChart className="text-blue-600" />
                الميزانية العمومية
              </h1>
              <p className="text-sm text-gray-500 mt-1">Balance Sheet</p>
            </div>
            
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={asOfDate}
                onChange={(e) => setAsOfDate(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              />
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                <FiDownload /> تصدير PDF
              </button>
              <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2">
                <FiPrinter /> طباعة
              </button>
            </div>
          </div>
          
          <div className="mt-4 bg-blue-50 border-r-4 border-blue-500 p-4 rounded">
            <p className="text-sm text-blue-900">
              <strong>كما في:</strong> {new Date(asOfDate).toLocaleDateString('ar-OM', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>

        {/* Assets */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FiTrendingUp />
              الأصول (Assets)
            </h2>
          </div>
          
          <div className="p-6">
            {/* Current Assets */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b">
                الأصول المتداولة (Current Assets)
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                  <span className="text-gray-700">النقدية بالصندوق والبنك</span>
                  <span className="font-semibold">{formatCurrency(balanceSheet.assets.currentAssets.cash)} ر.ع</span>
                </div>
                <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                  <span className="text-gray-700">المدينون</span>
                  <span className="font-semibold">{formatCurrency(balanceSheet.assets.currentAssets.accountsReceivable)} ر.ع</span>
                </div>
                <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                  <span className="text-gray-700">المصروفات المدفوعة مقدماً</span>
                  <span className="font-semibold">{formatCurrency(balanceSheet.assets.currentAssets.prepaidExpenses)} ر.ع</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded font-bold">
                  <span className="text-green-900">إجمالي الأصول المتداولة</span>
                  <span className="text-green-700">{formatCurrency(balanceSheet.assets.currentAssets.total)} ر.ع</span>
                </div>
              </div>
            </div>

            {/* Fixed Assets */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b">
                الأصول الثابتة (Fixed Assets)
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                  <span className="text-gray-700">العقارات الاستثمارية</span>
                  <span className="font-semibold">{formatCurrency(balanceSheet.assets.fixedAssets.property)} ر.ع</span>
                </div>
                <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                  <span className="text-gray-700">المعدات والأثاث</span>
                  <span className="font-semibold">{formatCurrency(balanceSheet.assets.fixedAssets.equipment)} ر.ع</span>
                </div>
                <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                  <span className="text-gray-700">السيارات</span>
                  <span className="font-semibold">{formatCurrency(balanceSheet.assets.fixedAssets.vehicles)} ر.ع</span>
                </div>
                <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                  <span className="text-gray-700 text-red-600">مجمع الإهلاك</span>
                  <span className="font-semibold text-red-600">({formatCurrency(Math.abs(balanceSheet.assets.fixedAssets.accumulatedDepreciation))}) ر.ع</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded font-bold">
                  <span className="text-green-900">صافي الأصول الثابتة</span>
                  <span className="text-green-700">{formatCurrency(balanceSheet.assets.fixedAssets.total)} ر.ع</span>
                </div>
              </div>
            </div>

            {/* Total Assets */}
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-600 to-emerald-700 rounded-lg text-white font-bold text-lg">
              <span>إجمالي الأصول (Total Assets)</span>
              <span>{formatCurrency(balanceSheet.assets.total)} ر.ع</span>
            </div>
          </div>
        </div>

        {/* Liabilities & Equity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-rose-600 p-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FiTrendingDown />
              الخصوم وحقوق الملكية (Liabilities & Equity)
            </h2>
          </div>
          
          <div className="p-6">
            {/* Current Liabilities */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b">
                الخصوم المتداولة (Current Liabilities)
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                  <span className="text-gray-700">الدائنون</span>
                  <span className="font-semibold">{formatCurrency(balanceSheet.liabilities.currentLiabilities.accountsPayable)} ر.ع</span>
                </div>
                <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                  <span className="text-gray-700">قروض قصيرة الأجل</span>
                  <span className="font-semibold">{formatCurrency(balanceSheet.liabilities.currentLiabilities.shortTermLoans)} ر.ع</span>
                </div>
                <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                  <span className="text-gray-700">مصروفات مستحقة</span>
                  <span className="font-semibold">{formatCurrency(balanceSheet.liabilities.currentLiabilities.accruedExpenses)} ر.ع</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded font-bold">
                  <span className="text-red-900">إجمالي الخصوم المتداولة</span>
                  <span className="text-red-700">{formatCurrency(balanceSheet.liabilities.currentLiabilities.total)} ر.ع</span>
                </div>
              </div>
            </div>

            {/* Long-term Liabilities */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b">
                الخصوم طويلة الأجل (Long-term Liabilities)
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                  <span className="text-gray-700">الرهون العقارية</span>
                  <span className="font-semibold">{formatCurrency(balanceSheet.liabilities.longTermLiabilities.mortgages)} ر.ع</span>
                </div>
                <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                  <span className="text-gray-700">قروض طويلة الأجل</span>
                  <span className="font-semibold">{formatCurrency(balanceSheet.liabilities.longTermLiabilities.longTermLoans)} ر.ع</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded font-bold">
                  <span className="text-red-900">إجمالي الخصوم طويلة الأجل</span>
                  <span className="text-red-700">{formatCurrency(balanceSheet.liabilities.longTermLiabilities.total)} ر.ع</span>
                </div>
              </div>
            </div>

            {/* Total Liabilities */}
            <div className="flex justify-between items-center p-3 bg-red-100 rounded font-bold mb-6">
              <span className="text-red-900">إجمالي الخصوم (Total Liabilities)</span>
              <span className="text-red-800">{formatCurrency(balanceSheet.liabilities.total)} ر.ع</span>
            </div>

            {/* Owner's Equity */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b">
                حقوق الملكية (Owner's Equity)
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                  <span className="text-gray-700">رأس المال</span>
                  <span className="font-semibold">{formatCurrency(balanceSheet.equity.capital)} ر.ع</span>
                </div>
                <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                  <span className="text-gray-700">الأرباح المحتجزة</span>
                  <span className="font-semibold">{formatCurrency(balanceSheet.equity.retainedEarnings)} ر.ع</span>
                </div>
                <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                  <span className="text-gray-700">صافي ربح العام الحالي</span>
                  <span className="font-semibold text-green-600">{formatCurrency(balanceSheet.equity.currentYearProfit)} ر.ع</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded font-bold">
                  <span className="text-blue-900">إجمالي حقوق الملكية</span>
                  <span className="text-blue-700">{formatCurrency(balanceSheet.equity.total)} ر.ع</span>
                </div>
              </div>
            </div>

            {/* Total Liabilities & Equity */}
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg text-white font-bold text-lg">
              <span>إجمالي الخصوم وحقوق الملكية</span>
              <span>{formatCurrency(balanceSheet.totalLiabilitiesAndEquity)} ر.ع</span>
            </div>

            {/* Balance Check */}
            {balanceSheet.assets.total === balanceSheet.totalLiabilitiesAndEquity ? (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <FiCheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-800 font-medium">
                  ✓ الميزانية متوازنة (الأصول = الخصوم + حقوق الملكية)
                </span>
              </div>
            ) : (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <FiAlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-sm text-red-800 font-medium">
                  ⚠️ تحذير: الميزانية غير متوازنة
                </span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

