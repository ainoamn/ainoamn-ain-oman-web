// src/pages/admin/checks/index.tsx - إدارة الشيكات
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface Check {
  id: string;
  checkNumber: string;
  bankName: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'cleared' | 'bounced' | 'cancelled';
  tenantName: string;
  unitNumber: string;
  buildingName: string;
}

export default function ChecksManagementPage() {
  const [loading, setLoading] = useState(true);
  const [checks, setChecks] = useState<Check[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    loadChecks();
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

  const filteredChecks = checks.filter(check => {
    const matchesSearch = check.checkNumber.includes(searchTerm) ||
                         check.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         check.buildingName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || check.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalChecks: checks.length,
    totalAmount: checks.reduce((sum, c) => sum + c.amount, 0),
    pendingAmount: checks.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.amount, 0),
    bouncedAmount: checks.filter(c => c.status === 'bounced').reduce((sum, c) => sum + c.amount, 0)
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

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: 'معلق',
      cleared: 'صُرف',
      bounced: 'مرتجع',
      cancelled: 'ملغى'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      cleared: 'bg-green-100 text-green-800',
      bounced: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  const deleteCheck = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الشيك؟')) return;
    
    setChecks(checks.filter(c => c.id !== id));
    alert('✅ تم حذف الشيك بنجاح');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>إدارة الشيكات - عين عُمان</title>
      </Head>

      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">إدارة الشيكات</h1>
              <p className="mt-1 text-sm text-gray-500">
                عرض وإدارة جميع الشيكات المستلمة والمدفوعة
              </p>
            </div>
            <div className="flex gap-3">
              <Link 
                href="/admin/dashboard"
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                ← لوحة التحكم
              </Link>
              <Link 
                href="/admin/checks/new"
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <span className="ml-2">+</span>
                إضافة شيك جديد
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">إجمالي الشيكات</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalChecks}</p>
            </div>
            <span className="text-4xl">💳</span>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">المبلغ الإجمالي</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalAmount)}</p>
            </div>
            <span className="text-4xl">💰</span>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">شيكات معلقة</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.pendingAmount)}</p>
            </div>
            <span className="text-4xl">⏳</span>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">شيكات مرتجعة</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.bouncedAmount)}</p>
            </div>
            <span className="text-4xl">❌</span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="ابحث برقم الشيك، المستأجر، أو المبنى..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">جميع الحالات</option>
            <option value="pending">معلق</option>
            <option value="cleared">صُرف</option>
            <option value="bounced">مرتجع</option>
            <option value="cancelled">ملغى</option>
          </select>
        </div>

        {/* Checks Table */}
        {filteredChecks.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">رقم الشيك</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المبلغ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ الاستحقاق</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المستأجر / الوحدة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">إجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredChecks.map((check) => (
                  <tr key={check.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{check.checkNumber}</div>
                      <div className="text-sm text-gray-500">{check.bankName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(check.amount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(check.dueDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(check.status)}`}>
                        {getStatusText(check.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{check.tenantName}</div>
                      <div>({check.unitNumber} - {check.buildingName})</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/admin/checks/${check.id}`} className="text-blue-600 hover:text-blue-900 ml-2">
                        عرض
                      </Link>
                      <button onClick={() => alert('تعديل ' + check.checkNumber)} className="text-indigo-600 hover:text-indigo-900 ml-2">
                        تعديل
                      </button>
                      <button onClick={() => deleteCheck(check.id)} className="text-red-600 hover:text-red-900">
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💳</div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد شيكات</h3>
              <p className="mt-1 text-sm text-gray-500">
                ابدأ بإضافة شيك جديد لإدارة الشيكات.
              </p>
              <div className="mt-6">
                <Link 
                  href="/admin/checks/new"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <span className="ml-2">+</span>
                  إضافة شيك جديد
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
