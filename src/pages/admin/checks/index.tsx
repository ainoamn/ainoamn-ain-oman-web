// src/pages/admin/checks/index.tsx - إدارة الشيكات
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  FiPlus, FiEdit, FiTrash2, FiEye, FiSearch, FiFilter,
  FiCreditCard, FiDollarSign, FiCalendar, FiUser, FiBuilding,
  FiDownload, FiPrinter, FiCheck, FiX, FiClock, FiAlertTriangle
} from 'react-icons/fi';
import Layout from '@/components/layout/Layout';

interface Check {
  id: string;
  checkNumber: string;
  bankName: string;
  accountNumber: string;
  amount: number;
  currency: string;
  issueDate: string;
  dueDate: string;
  status: 'pending' | 'cleared' | 'bounced' | 'cancelled';
  tenantId: string;
  tenantName: string;
  unitId: string;
  unitNumber: string;
  buildingId: string;
  buildingName: string;
  purpose: 'rent' | 'deposit' | 'maintenance' | 'penalty' | 'other';
  description: string;
  receivedDate: string;
  clearedDate?: string;
  bouncedReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface CheckStats {
  totalChecks: number;
  totalAmount: number;
  pendingAmount: number;
  clearedAmount: number;
  bouncedAmount: number;
  thisMonthChecks: number;
  thisMonthAmount: number;
  averageClearingTime: number;
}

export default function ChecksManagementPage() {
  const [checks, setChecks] = useState<Check[]>([]);
  const [stats, setStats] = useState<CheckStats>({
    totalChecks: 0,
    totalAmount: 0,
    pendingAmount: 0,
    clearedAmount: 0,
    bouncedAmount: 0,
    thisMonthChecks: 0,
    thisMonthAmount: 0,
    averageClearingTime: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    loadChecks();
    loadStats();
  }, []);

  const loadChecks = async () => {
    try {
      const response = await fetch('/api/admin/checks');
      if (response.ok) {
        const data = await response.json();
        setChecks(data.checks || []);
      }
    } catch (error) {
      console.error('Error loading checks:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/checks/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const filteredChecks = checks.filter(check => {
    const matchesSearch = check.checkNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         check.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         check.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         check.bankName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !selectedStatus || check.status === selectedStatus;
    const matchesBank = !selectedBank || check.bankName === selectedBank;
    
    const matchesDateFrom = !dateFrom || new Date(check.issueDate) >= new Date(dateFrom);
    const matchesDateTo = !dateTo || new Date(check.issueDate) <= new Date(dateTo);

    return matchesSearch && matchesStatus && matchesBank && matchesDateFrom && matchesDateTo;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cleared': return 'bg-green-100 text-green-800';
      case 'bounced': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'في الانتظار';
      case 'cleared': return 'مسحوب';
      case 'bounced': return 'مرتد';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  const getPurposeText = (purpose: string) => {
    switch (purpose) {
      case 'rent': return 'إيجار';
      case 'deposit': return 'ضمان';
      case 'maintenance': return 'صيانة';
      case 'penalty': return 'غرامة';
      case 'other': return 'أخرى';
      default: return purpose;
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
    return new Date(dateString).toLocaleDateString('ar-OM');
  };

  const isOverdue = (dueDate: string, status: string) => {
    return status === 'pending' && new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>إدارة الشيكات - عين عُمان</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">إدارة الشيكات</h1>
                <p className="mt-1 text-sm text-gray-500">
                  إدارة شاملة للشيكات والمدفوعات
                </p>
              </div>
              <div className="flex space-x-3 rtl:space-x-reverse">
                <Link
                  href="/admin/checks/new"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <FiPlus className="w-4 h-4 ml-2" />
                  إضافة شيك جديد
                </Link>
                <button className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
                  <FiDownload className="w-4 h-4 ml-2" />
                  تصدير البيانات
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FiCreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">إجمالي الشيكات</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalChecks}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FiDollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">إجمالي المبلغ</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalAmount)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <FiClock className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">في الانتظار</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.pendingAmount)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <FiAlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">مرتد</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.bouncedAmount)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* فلاتر البحث */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">البحث</label>
                <div className="relative">
                  <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="رقم الشيك، المستأجر، البنك..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">جميع الحالات</option>
                  <option value="pending">في الانتظار</option>
                  <option value="cleared">مسحوب</option>
                  <option value="bounced">مرتد</option>
                  <option value="cancelled">ملغي</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">البنك</label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">جميع البنوك</option>
                  <option value="بنك مسقط">بنك مسقط</option>
                  <option value="البنك الوطني العماني">البنك الوطني العماني</option>
                  <option value="بنك عمان العربي">بنك عمان العربي</option>
                  <option value="بنك الإمارات دبي الوطني">بنك الإمارات دبي الوطني</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">من تاريخ</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">إلى تاريخ</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* جدول الشيكات */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                الشيكات ({filteredChecks.length})
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      رقم الشيك
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      البنك
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المستأجر
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الغرض
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المبلغ
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
                  {filteredChecks.map((check) => (
                    <tr key={check.id} className={`hover:bg-gray-50 ${isOverdue(check.dueDate, check.status) ? 'bg-red-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {check.checkNumber}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(check.issueDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{check.bankName}</div>
                        <div className="text-sm text-gray-500">
                          {check.accountNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{check.tenantName}</div>
                        <div className="text-sm text-gray-500">
                          {check.unitNumber} - {check.buildingName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{getPurposeText(check.purpose)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(check.amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${isOverdue(check.dueDate, check.status) ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                          {formatDate(check.dueDate)}
                        </div>
                        {isOverdue(check.dueDate, check.status) && (
                          <div className="text-xs text-red-500">متأخر</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(check.status)}`}>
                          {getStatusText(check.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <Link
                            href={`/admin/checks/${check.id}`}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="عرض التفاصيل"
                          >
                            <FiEye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/checks/${check.id}/edit`}
                            className="text-indigo-600 hover:text-indigo-900 p-1"
                            title="تعديل"
                          >
                            <FiEdit className="w-4 h-4" />
                          </Link>
                          {check.status === 'pending' && (
                            <button
                              className="text-green-600 hover:text-green-900 p-1"
                              title="وضع علامة مسحوب"
                            >
                              <FiCheck className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            className="text-gray-600 hover:text-gray-900 p-1"
                            title="طباعة"
                          >
                            <FiPrinter className="w-4 h-4" />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900 p-1"
                            title="حذف"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredChecks.length === 0 && (
                <div className="text-center py-12">
                  <FiCreditCard className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد شيكات</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    ابدأ بإضافة شيك جديد لإدارة المدفوعات.
                  </p>
                  <div className="mt-6">
                    <Link
                      href="/admin/checks/new"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <FiPlus className="w-4 h-4 ml-2" />
                      إضافة شيك جديد
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
