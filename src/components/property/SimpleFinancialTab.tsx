import React from 'react';
import { FaMoneyBillWave, FaDollarSign, FaChartLine, FaExclamationTriangle, FaClock } from 'react-icons/fa';

interface SimpleFinancialTabProps {
  propertyId: string;
  stats?: any;
}

export default function SimpleFinancialTab({ propertyId, stats }: SimpleFinancialTabProps) {
  const financialData = {
    totalRevenue: 125000,
    monthlyRevenue: 15000,
    pendingAmount: 5000,
    overdueAmount: 2000,
    totalInvoices: 45,
    paidInvoices: 40,
    pendingInvoices: 3,
    overdueInvoices: 2
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'OMR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <FaMoneyBillWave className="h-6 w-6 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-900">المعلومات المالية</h2>
        </div>
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
            تصدير
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors">
            فاتورة جديدة
          </button>
        </div>
      </div>

      {/* Financial Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">إجمالي الإيرادات</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(financialData.totalRevenue)}
              </p>
              <p className="text-sm text-green-600">
                +12% من الشهر الماضي
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <FaDollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">الإيرادات الشهرية</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(financialData.monthlyRevenue)}
              </p>
              <p className="text-sm text-blue-600">
                هذا الشهر
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FaChartLine className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">المبالغ المعلقة</p>
              <p className="text-2xl font-bold text-yellow-600">
                {formatCurrency(financialData.pendingAmount)}
              </p>
              <p className="text-sm text-gray-500">
                {financialData.pendingInvoices} فاتورة
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <FaClock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">المبالغ المتأخرة</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(financialData.overdueAmount)}
              </p>
              <p className="text-sm text-gray-500">
                {financialData.overdueInvoices} فاتورة
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <FaExclamationTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">الفواتير الأخيرة</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">فاتورة #INV-001</p>
              <p className="text-sm text-gray-500">إيجار شهر يناير</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-green-600">{formatCurrency(5000)}</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                مدفوعة
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">فاتورة #INV-002</p>
              <p className="text-sm text-gray-500">رسوم صيانة</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-yellow-600">{formatCurrency(1500)}</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                معلقة
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">فاتورة #INV-003</p>
              <p className="text-sm text-gray-500">رسوم إدارية</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-red-600">{formatCurrency(800)}</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                متأخرة
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
