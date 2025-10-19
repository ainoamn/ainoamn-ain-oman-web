import React, { useState, useEffect } from 'react';
import { FaMoneyBillWave, FaChartLine, FaReceipt, FaCreditCard, FaExclamationTriangle, FaCheckCircle, FaClock, FaCalendar, FaDownload, FaPrint, FaPlus, FaFilter, FaSearch, FaArrowUp, FaArrowDown, FaDollarSign, FaPercent, FaCalculator, FaFileInvoice } from 'react-icons/fa';

// Aliases for trending icons
const FaTrendingUp = FaArrowUp;
const FaTrendingDown = FaArrowDown;

interface Invoice {
  id: string;
  serial: string;
  propertyId: string;
  currency: string;
  subtotal: number;
  discount: number;
  serviceFee: number;
  amount: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  items: Array<{
    title: string;
    qty: number;
    price: number;
    total: number;
  }>;
  issuedAt: string;
  dueAt: string;
  paidAt?: string;
  serviceFeePercent: number;
}

interface FinancialStats {
  totalRevenue: number;
  monthlyRevenue: number;
  pendingAmount: number;
  overdueAmount: number;
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  averageInvoiceValue: number;
  collectionRate: number;
  monthlyGrowth: number;
}

interface FinancialTabProps {
  propertyId: string;
  stats: any;
}

export default function FinancialTab({ propertyId, stats }: FinancialTabProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [financialStats, setFinancialStats] = useState<FinancialStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchFinancialData();
  }, [propertyId]);

  const fetchFinancialData = async () => {
    setLoading(true);
    try {
      // جلب الفواتير
      const invoicesResponse = await fetch(`/api/invoices?propertyId=${propertyId}`);
      const invoicesData = await invoicesResponse.json();
      setInvoices(invoicesData);

      // جلب الإحصائيات المالية
      const statsResponse = await fetch(`/api/properties/${propertyId}/financial-stats`);
      const statsData = await statsResponse.json();
      setFinancialStats(statsData);
    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'مدفوعة';
      case 'pending': return 'معلقة';
      case 'overdue': return 'متأخرة';
      case 'cancelled': return 'ملغية';
      default: return status;
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.serial.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.items.some(item => item.title.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const invoiceDate = new Date(invoice.issuedAt);
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      
      switch (dateFilter) {
        case '30d':
          matchesDate = invoiceDate >= thirtyDaysAgo;
          break;
        case '90d':
          matchesDate = invoiceDate >= ninetyDaysAgo;
          break;
        case '1y':
          const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          matchesDate = invoiceDate >= oneYearAgo;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const formatCurrency = (amount: number, currency: string = 'OMR') => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar', { calendar: 'gregory', numberingSystem: 'latn' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="mr-3 text-gray-600">جارٍ تحميل البيانات المالية...</span>
      </div>
    );
  }

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
            <FaDownload className="h-4 w-4 ml-2" />
            تصدير
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
            <FaPrint className="h-4 w-4 ml-2" />
            طباعة
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
          >
            <FaPlus className="h-4 w-4 ml-2" />
            فاتورة جديدة
          </button>
        </div>
      </div>

      {/* Financial Stats Cards */}
      {financialStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي الإيرادات</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(financialStats.totalRevenue)}
                </p>
                <div className="flex items-center mt-1">
                  {financialStats.monthlyGrowth >= 0 ? (
                    <FaTrendingUp className="h-4 w-4 text-green-500 ml-1" />
                  ) : (
                    <FaTrendingDown className="h-4 w-4 text-red-500 ml-1" />
                  )}
                  <span className={`text-sm ${financialStats.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(financialStats.monthlyGrowth).toFixed(1)}% هذا الشهر
                  </span>
                </div>
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
                  {formatCurrency(financialStats.monthlyRevenue)}
                </p>
                <p className="text-sm text-gray-500 mt-1">هذا الشهر</p>
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
                  {formatCurrency(financialStats.pendingAmount)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {financialStats.pendingInvoices} فاتورة
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
                  {formatCurrency(financialStats.overdueAmount)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {financialStats.overdueInvoices} فاتورة
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <FaExclamationTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Additional Stats */}
      {financialStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">متوسط قيمة الفاتورة</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(financialStats.averageInvoiceValue)}
                </p>
              </div>
              <FaCalculator className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">معدل التحصيل</p>
                <p className="text-xl font-bold text-green-600">
                  {financialStats.collectionRate.toFixed(1)}%
                </p>
              </div>
              <FaPercent className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي الفواتير</p>
                <p className="text-xl font-bold text-gray-900">
                  {financialStats.totalInvoices}
                </p>
                <p className="text-sm text-green-600">
                  {financialStats.paidInvoices} مدفوعة
                </p>
              </div>
              <FaReceipt className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="البحث في الفواتير..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">جميع الحالات</option>
            <option value="paid">مدفوعة</option>
            <option value="pending">معلقة</option>
            <option value="overdue">متأخرة</option>
            <option value="cancelled">ملغية</option>
          </select>
          
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">جميع التواريخ</option>
            <option value="30d">آخر 30 يوم</option>
            <option value="90d">آخر 90 يوم</option>
            <option value="1y">آخر سنة</option>
          </select>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white rounded-lg border">
        {filteredInvoices.length === 0 ? (
          <div className="text-center py-12">
            <FaFileInvoice className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد فواتير</h3>
            <p className="text-gray-500 mb-4">لم يتم العثور على فواتير تطابق المعايير المحددة</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
            >
              <FaPlus className="h-4 w-4 ml-2" />
              إنشاء فاتورة جديدة
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    رقم الفاتورة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المبلغ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تاريخ الإصدار
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تاريخ الاستحقاق
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invoice.serial}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(invoice.amount, invoice.currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                        {getStatusText(invoice.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(invoice.issuedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(invoice.dueAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <button className="text-blue-600 hover:text-blue-900">
                          عرض
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          طباعة
                        </button>
                        {invoice.status === 'pending' && (
                          <button className="text-yellow-600 hover:text-yellow-900">
                            دفع
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
