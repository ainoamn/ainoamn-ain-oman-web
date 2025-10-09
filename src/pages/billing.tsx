// src/pages/billing.tsx - الفواتير والفوترة
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import InstantLink from '@/components/InstantLink';
import { 
  FiFileText, FiDownload, FiPrinter, FiShare2, FiEye, FiEdit,
  FiCalendar, FiDollarSign, FiUser, FiCreditCard, FiCheckCircle,
  FiAlertTriangle, FiClock, FiFilter, FiSearch, FiPlus
} from 'react-icons/fi';
// Layout handled by _app.tsx

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  propertyId: string;
  propertyName: string;
  amount: number;
  tax: number;
  totalAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  issueDate: string;
  paidDate?: string;
  description: string;
  items: InvoiceItem[];
  paymentMethod?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  category: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
}

interface Property {
  id: string;
  title: string;
  priceMonthly?: number;
  priceOMR?: number;
  status?: string;
}

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // تحميل الفواتير
      const invoicesResponse = await fetch('/api/billing/invoices');
      if (invoicesResponse.ok) {
        const invoicesData = await invoicesResponse.json();
        setInvoices(invoicesData.invoices || []);
      }

      // تحميل العملاء
      const customersResponse = await fetch('/api/customers');
      if (customersResponse.ok) {
        const customersData = await customersResponse.json();
        setCustomers(customersData.customers || []);
      }

      // تحميل العقارات
      const propertiesResponse = await fetch('/api/properties');
      if (propertiesResponse.ok) {
        const propertiesData = await propertiesResponse.json();
        setProperties(propertiesData.properties || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'مسودة';
      case 'sent': return 'مرسل';
      case 'paid': return 'مدفوع';
      case 'overdue': return 'متأخر';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <FiEdit className="w-4 h-4" />;
      case 'sent': return <FiClock className="w-4 h-4" />;
      case 'paid': return <FiCheckCircle className="w-4 h-4" />;
      case 'overdue': return <FiAlertTriangle className="w-4 h-4" />;
      case 'cancelled': return <FiAlertTriangle className="w-4 h-4" />;
      default: return <FiFileText className="w-4 h-4" />;
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.propertyName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    const matchesDate = (() => {
      if (dateFilter === 'all') return true;
      
      const invoiceDate = new Date(invoice.issueDate);
      const now = new Date();
      
      switch (dateFilter) {
        case 'today':
          return invoiceDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return invoiceDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
          return invoiceDate >= monthAgo;
        case 'year':
          const yearAgo = new Date(now.getFullYear(), 0, 1);
          return invoiceDate >= yearAgo;
        default:
          return true;
      }
    })();

    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleSelectInvoice = (invoiceId: string) => {
    setSelectedInvoices(prev => 
      prev.includes(invoiceId) 
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  const handleSelectAll = () => {
    if (selectedInvoices.length === filteredInvoices.length) {
      setSelectedInvoices([]);
    } else {
      setSelectedInvoices(filteredInvoices.map(invoice => invoice.id));
    }
  };

  const exportSelectedInvoices = async () => {
    if (selectedInvoices.length === 0) return;

    try {
      const response = await fetch('/api/billing/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceIds: selectedInvoices,
          format: 'pdf'
        }),
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoices-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting invoices:', error);
    }
  };

  const sendInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/billing/invoices/${invoiceId}/send`, {
        method: 'POST',
      });
      
      if (response.ok) {
        // تحديث حالة الفاتورة
        setInvoices(prev => prev.map(invoice => 
          invoice.id === invoiceId 
            ? { ...invoice, status: 'sent' as const }
            : invoice
        ));
      }
    } catch (error) {
      console.error('Error sending invoice:', error);
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
        <title>الفواتير والفوترة - عين عُمان</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">الفواتير والفوترة</h1>
                <p className="mt-1 text-sm text-gray-500">
                  إدارة الفواتير والمدفوعات
                </p>
              </div>
              <div className="flex space-x-3 rtl:space-x-reverse">
                <InstantLink 
                  href="/billing/new"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <FiPlus className="w-4 h-4 ml-2" />
                  فاتورة جديدة
                </InstantLink>
                {selectedInvoices.length > 0 && (
                  <button
                    onClick={exportSelectedInvoices}
                    className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    <FiDownload className="w-4 h-4 ml-2" />
                    تصدير ({selectedInvoices.length})
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* فلاتر البحث */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">البحث</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="رقم الفاتورة، العميل، العقار..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="draft">مسودة</option>
                  <option value="sent">مرسل</option>
                  <option value="paid">مدفوع</option>
                  <option value="overdue">متأخر</option>
                  <option value="cancelled">ملغي</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">التاريخ</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">جميع التواريخ</option>
                  <option value="today">اليوم</option>
                  <option value="week">هذا الأسبوع</option>
                  <option value="month">هذا الشهر</option>
                  <option value="year">هذا العام</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
                  <FiFilter className="w-4 h-4 ml-2 inline" />
                  تطبيق الفلاتر
                </button>
              </div>
            </div>
          </div>

          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FiFileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">إجمالي الفواتير</p>
                  <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FiCheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">مدفوع</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {invoices.filter(i => i.status === 'paid').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <FiClock className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">معلق</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {invoices.filter(i => i.status === 'sent').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <FiAlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">متأخر</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {invoices.filter(i => i.status === 'overdue').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* جدول الفواتير */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">الفواتير</h2>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <input
                    type="checkbox"
                    checked={selectedInvoices.length === filteredInvoices.length && filteredInvoices.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-500">تحديد الكل</span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      رقم الفاتورة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      العميل
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      العقار
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المبلغ
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      تاريخ الإصدار
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      تاريخ الاستحقاق
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
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedInvoices.includes(invoice.id)}
                          onChange={() => handleSelectInvoice(invoice.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{invoice.customerName}</div>
                        <div className="text-sm text-gray-500">{invoice.customerEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{invoice.propertyName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{formatCurrency(invoice.totalAmount)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(invoice.issueDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(invoice.dueDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                          {getStatusIcon(invoice.status)}
                          <span className="mr-1">{getStatusText(invoice.status)}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <InstantLink 
                            href={`/billing/${invoice.id}`}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="عرض"
                          >
                            <FiEye className="w-4 h-4" />
                          </InstantLink>
                          <InstantLink 
                            href={`/billing/${invoice.id}/edit`}
                            className="text-gray-600 hover:text-gray-900 p-1"
                            title="تعديل"
                          >
                            <FiEdit className="w-4 h-4" />
                          </InstantLink>
                          <button
                            onClick={() => sendInvoice(invoice.id)}
                            className="text-green-600 hover:text-green-900 p-1"
                            title="إرسال"
                            disabled={invoice.status === 'sent' || invoice.status === 'paid'}
                          >
                            <FiShare2 className="w-4 h-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-900 p-1" title="طباعة">
                            <FiPrinter className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredInvoices.length === 0 && (
                <div className="text-center py-12">
                  <FiFileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد فواتير</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    ابدأ بإنشاء فاتورة جديدة.
                  </p>
                  <div className="mt-6">
                    <InstantLink 
                      href="/billing/new"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <FiPlus className="w-4 h-4 ml-2" />
                      فاتورة جديدة
                    </InstantLink>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
