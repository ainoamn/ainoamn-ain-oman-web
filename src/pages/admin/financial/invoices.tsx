// src/pages/admin/financial/invoices.tsx - نظام إدارة الفواتير الشامل
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  FiFileText, FiPlus, FiSearch, FiFilter, FiEye, FiEdit, FiTrash2,
  FiDownload, FiPrinter, FiSend, FiCheckCircle, FiXCircle, FiClock,
  FiDollarSign, FiCalendar, FiUser, FiHome, FiAlertTriangle,
  FiTrendingUp, FiTrendingDown, FiRefreshCw, FiMail, FiPhone
} from 'react-icons/fi';
import { Invoice, InvoiceStatus, InvoiceType } from '@/types/financial';

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<InvoiceStatus | ''>('');
  const [filterType, setFilterType] = useState<InvoiceType | ''>('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      // بيانات تجريبية للفواتير
      const mockInvoices: any[] = []; // تم إزالة البيانات الوهمية // تم إزالة البيانات الوهمية // تم إزالة البيانات الوهمية - يتم الجلب من API

      setInvoices([]); // تم استبدال mockInvoices ببيانات فارغة
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  // حساب الإحصائيات
  const stats = {
    total: invoices.length,
    paid: invoices.filter(inv => inv.status === 'paid').length,
    overdue: invoices.filter(inv => inv.status === 'overdue').length,
    pending: invoices.filter(inv => ['sent', 'viewed'].includes(inv.status)).length,
    totalAmount: invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
    paidAmount: invoices.reduce((sum, inv) => sum + inv.paidAmount, 0),
    overdueAmount: invoices
      .filter(inv => inv.status === 'overdue')
      .reduce((sum, inv) => sum + inv.remainingAmount, 0)
  };

  // فلترة الفواتير
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = 
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filterStatus || inv.status === filterStatus;
    const matchesType = !filterType || inv.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: InvoiceStatus): string => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'partially_paid': return 'bg-yellow-100 text-yellow-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: InvoiceStatus): string => {
    switch (status) {
      case 'paid': return 'مدفوعة';
      case 'overdue': return 'متأخرة';
      case 'partially_paid': return 'مدفوعة جزئياً';
      case 'sent': return 'مرسلة';
      case 'viewed': return 'تم عرضها';
      case 'draft': return 'مسودة';
      case 'cancelled': return 'ملغاة';
      case 'refunded': return 'مستردة';
      default: return status;
    }
  };

  const getTypeText = (type: InvoiceType): string => {
    switch (type) {
      case 'rent': return 'إيجار';
      case 'service': return 'خدمة';
      case 'utility': return 'مرافق';
      case 'maintenance': return 'صيانة';
      case 'subscription': return 'اشتراك';
      case 'sale': return 'بيع';
      default: return 'أخرى';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل الفواتير...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>إدارة الفواتير - النظام المالي</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FiFileText className="text-blue-600" />
                إدارة الفواتير
              </h1>
              <p className="text-gray-600 mt-2">
                نظام شامل لإدارة الفواتير والمدفوعات
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <FiPlus />
                فاتورة جديدة
              </button>
              <button
                onClick={fetchInvoices}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <FiRefreshCw />
                تحديث
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي الفواتير</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FiFileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">فواتير مدفوعة</p>
                <p className="text-3xl font-bold text-green-600">{stats.paid}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.paidAmount.toLocaleString()} ر.ع
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FiCheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">فواتير متأخرة</p>
                <p className="text-3xl font-bold text-red-600">{stats.overdue}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.overdueAmount.toLocaleString()} ر.ع
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <FiAlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">المبلغ الإجمالي</p>
                <p className="text-3xl font-bold text-purple-600">
                  {stats.totalAmount.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">ريال عُماني</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <FiDollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="البحث برقم الفاتورة أو اسم العميل..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as InvoiceStatus | '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">جميع الحالات</option>
              <option value="draft">مسودة</option>
              <option value="sent">مرسلة</option>
              <option value="viewed">تم عرضها</option>
              <option value="paid">مدفوعة</option>
              <option value="partially_paid">مدفوعة جزئياً</option>
              <option value="overdue">متأخرة</option>
              <option value="cancelled">ملغاة</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as InvoiceType | '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">جميع الأنواع</option>
              <option value="rent">إيجار</option>
              <option value="service">خدمة</option>
              <option value="utility">مرافق</option>
              <option value="maintenance">صيانة</option>
              <option value="subscription">اشتراك</option>
              <option value="sale">بيع</option>
              <option value="other">أخرى</option>
            </select>

            <button
              onClick={() => alert('ميزة التصدير قيد التطوير')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 justify-center"
            >
              <FiDownload />
              تصدير Excel
            </button>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    رقم الفاتورة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    العميل
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    النوع
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    المبلغ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    تاريخ الاستحقاق
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{invoice.invoiceNumber}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(invoice.issueDate).toLocaleDateString('ar-OM')}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{invoice.customerName}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <FiMail className="w-3 h-3" />
                        {invoice.customerEmail}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <FiPhone className="w-3 h-3" />
                        {invoice.customerPhone}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700">
                        {getTypeText(invoice.type)}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        {invoice.totalAmount.toLocaleString()} ر.ع
                      </div>
                      {invoice.paidAmount > 0 && invoice.paidAmount < invoice.totalAmount && (
                        <div className="text-xs text-green-600">
                          مدفوع: {invoice.paidAmount.toLocaleString()} ر.ع
                        </div>
                      )}
                      {invoice.remainingAmount > 0 && (
                        <div className="text-xs text-red-600">
                          متبقي: {invoice.remainingAmount.toLocaleString()} ر.ع
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                        {invoice.status === 'paid' && <FiCheckCircle className="w-3 h-3 ml-1" />}
                        {invoice.status === 'overdue' && <FiAlertTriangle className="w-3 h-3 ml-1" />}
                        {invoice.status === 'partially_paid' && <FiClock className="w-3 h-3 ml-1" />}
                        {getStatusText(invoice.status)}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center gap-1">
                        <FiCalendar className="w-4 h-4 text-gray-400" />
                        {new Date(invoice.dueDate).toLocaleDateString('ar-OM')}
                      </div>
                      {invoice.status === 'overdue' && (
                        <div className="text-xs text-red-600 mt-1">
                          متأخر {Math.ceil((Date.now() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24))} يوم
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/admin/financial/invoices/${invoice.id}`)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="عرض"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => alert('طباعة الفاتورة')}
                          className="text-gray-600 hover:text-gray-900 p-1"
                          title="طباعة"
                        >
                          <FiPrinter className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => alert('تحميل PDF')}
                          className="text-green-600 hover:text-green-900 p-1"
                          title="تحميل"
                        >
                          <FiDownload className="w-4 h-4" />
                        </button>
                        {invoice.status !== 'paid' && (
                          <button
                            onClick={() => alert('إرسال تذكير')}
                            className="text-orange-600 hover:text-orange-900 p-1"
                            title="إرسال"
                          >
                            <FiSend className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredInvoices.length === 0 && (
            <div className="text-center py-12">
              <FiFileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد فواتير</h3>
              <p className="mt-1 text-sm text-gray-500">
                ابدأ بإنشاء فاتورة جديدة
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                إنشاء فاتورة
              </button>
            </div>
          )}
        </div>

        {/* Create Invoice Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-blue-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <FiPlus />
                    إنشاء فاتورة جديدة
                  </h2>
                  <button onClick={() => setShowCreateModal(false)} className="text-white hover:text-gray-200">
                    <FiXCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">نوع الفاتورة *</label>
                    <select className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="rent">إيجار</option>
                      <option value="service">خدمة</option>
                      <option value="maintenance">صيانة</option>
                      <option value="subscription">اشتراك</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">اسم العميل *</label>
                    <input type="text" className="w-full px-4 py-2 border rounded-lg" placeholder="أحمد محمد" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني *</label>
                    <input type="email" className="w-full px-4 py-2 border rounded-lg" placeholder="email@example.com" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
                    <input type="tel" className="w-full px-4 py-2 border rounded-lg" placeholder="+968 9123 4567" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ الإصدار *</label>
                    <input type="date" className="w-full px-4 py-2 border rounded-lg" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ الاستحقاق *</label>
                    <input type="date" className="w-full px-4 py-2 border rounded-lg" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">الوصف</label>
                    <input type="text" className="w-full px-4 py-2 border rounded-lg" placeholder="وصف الفاتورة" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">المبلغ *</label>
                    <input type="number" className="w-full px-4 py-2 border rounded-lg" placeholder="0.00" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">نسبة الضريبة (%)</label>
                    <input type="number" className="w-full px-4 py-2 border rounded-lg" defaultValue="5" />
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-gray-50 p-6 flex justify-end gap-3 border-t">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-100"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => {
                    alert('تم إنشاء الفاتورة!');
                    setShowCreateModal(false);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <FiCheckCircle />
                  إنشاء الفاتورة
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

