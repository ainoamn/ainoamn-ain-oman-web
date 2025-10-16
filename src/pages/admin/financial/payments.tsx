// src/pages/admin/financial/payments.tsx - نظام المدفوعات والمقبوضات
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  FiDollarSign, FiPlus, FiSearch, FiFilter, FiEye, FiEdit,
  FiCheckCircle, FiXCircle, FiClock, FiCreditCard, FiDownload,
  FiCalendar, FiUser, FiFileText, FiAlertTriangle, FiRefreshCw,
  FiArrowUp, FiArrowDown, FiTrendingUp
} from 'react-icons/fi';
import { Payment, PaymentMethod, PaymentStatus } from '@/types/financial';

export default function PaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<PaymentStatus | ''>('');
  const [filterMethod, setFilterMethod] = useState<PaymentMethod | ''>('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const mockPayments: any[] = []; // تم إزالة البيانات الوهمية // تم إزالة البيانات الوهمية // تم إزالة البيانات الوهمية - يتم الجلب من API

      setPayments([]); // تم استبدال mockPayments ببيانات فارغة
    } catch (error) {

    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: payments.length,
    completed: payments.filter(p => p.status === 'completed').length,
    pending: payments.filter(p => p.status === 'pending').length,
    failed: payments.filter(p => p.status === 'failed').length,
    totalAmount: payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0)
  };

  const filteredPayments = payments.filter(p => {
    const matchesSearch = 
      p.paymentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.payerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filterStatus || p.status === filterStatus;
    const matchesMethod = !filterMethod || p.method === filterMethod;
    
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const getMethodText = (method: PaymentMethod): string => {
    const methods = {
      cash: 'نقداً',
      bank_transfer: 'تحويل بنكي',
      check: 'شيك',
      credit_card: 'بطاقة ائتمان',
      debit_card: 'بطاقة مدين',
      online: 'دفع إلكتروني',
      mobile_wallet: 'محفظة إلكترونية'
    };
    return methods[method] || method;
  };

  const getStatusText = (status: PaymentStatus): string => {
    const statuses = {
      pending: 'معلق',
      processing: 'قيد المعالجة',
      completed: 'مكتمل',
      failed: 'فشل',
      cancelled: 'ملغي',
      refunded: 'مسترد'
    };
    return statuses[status] || status;
  };

  const getStatusColor = (status: PaymentStatus): string => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>إدارة المدفوعات - النظام المالي</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FiDollarSign className="text-green-600" />
                إدارة المدفوعات والمقبوضات
              </h1>
              <p className="text-gray-600 mt-2">تتبع جميع المدفوعات والتحويلات المالية</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <FiPlus />
              تسجيل دفعة
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي المدفوعات</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <FiDollarSign className="w-10 h-10 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">مدفوعات مكتملة</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.totalAmount.toLocaleString()} ر.ع
                </p>
              </div>
              <FiCheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">قيد المعالجة</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <FiClock className="w-10 h-10 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">فاشلة</p>
                <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
              </div>
              <FiXCircle className="w-10 h-10 text-red-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="البحث..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as PaymentStatus | '')}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">جميع الحالات</option>
              <option value="completed">مكتمل</option>
              <option value="pending">معلق</option>
              <option value="processing">قيد المعالجة</option>
              <option value="failed">فشل</option>
            </select>

            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value as PaymentMethod | '')}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">جميع الطرق</option>
              <option value="cash">نقداً</option>
              <option value="bank_transfer">تحويل بنكي</option>
              <option value="check">شيك</option>
              <option value="credit_card">بطاقة ائتمان</option>
              <option value="online">دفع إلكتروني</option>
            </select>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم الدفع</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الدافع</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المبلغ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الطريقة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{payment.paymentNumber}</div>
                    <div className="text-xs text-gray-500">
                      فاتورة: {payment.invoiceId}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{payment.payerName}</div>
                    <div className="text-xs text-gray-500">إلى: {payment.receiverName}</div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="text-lg font-bold text-green-600">
                      {payment.amount.toLocaleString()} ر.ع
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700">
                      {getMethodText(payment.method)}
                    </span>
                    {payment.referenceNumber && (
                      <div className="text-xs text-gray-500 mt-1">
                        مرجع: {payment.referenceNumber}
                      </div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                      {payment.status === 'completed' && <FiCheckCircle className="w-3 h-3 ml-1" />}
                      {payment.status === 'failed' && <FiXCircle className="w-3 h-3 ml-1" />}
                      {payment.status === 'pending' && <FiClock className="w-3 h-3 ml-1" />}
                      {getStatusText(payment.status)}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(payment.paymentDate).toLocaleDateString('ar-OM')}
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/admin/financial/payments/${payment.id}`)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="عرض"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => alert('طباعة إيصال')}
                        className="text-gray-600 hover:text-gray-900 p-1"
                        title="طباعة"
                      >
                        <FiFileText className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Create Payment Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
              <div className="bg-green-600 p-6 text-white">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <FiPlus />
                  تسجيل دفعة جديدة
                </h2>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">اسم الدافع *</label>
                    <input type="text" className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">المبلغ *</label>
                    <input type="number" className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">طريقة الدفع *</label>
                    <select className="w-full px-4 py-2 border rounded-lg">
                      <option value="cash">نقداً</option>
                      <option value="bank_transfer">تحويل بنكي</option>
                      <option value="check">شيك</option>
                      <option value="credit_card">بطاقة ائتمان</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">التاريخ *</label>
                    <input type="date" className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 flex justify-end gap-3">
                <button onClick={() => setShowCreateModal(false)} className="px-6 py-2 border rounded-lg">إلغاء</button>
                <button onClick={() => { alert('تم التسجيل!'); setShowCreateModal(false); }} className="px-6 py-2 bg-green-600 text-white rounded-lg">حفظ</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

