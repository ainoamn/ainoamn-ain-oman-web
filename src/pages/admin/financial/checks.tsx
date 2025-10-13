// src/pages/admin/financial/checks.tsx - نظام إدارة الشيكات
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  FiFileText, FiPlus, FiSearch, FiFilter, FiEye, FiEdit,
  FiCheckCircle, FiXCircle, FiClock, FiAlertCircle,
  FiCalendar, FiDollarSign, FiTrendingUp, FiRefreshCw,
  FiDownload, FiUpload
} from 'react-icons/fi';
import { Check, CheckType, CheckStatus } from '@/types/financial';

export default function ChecksPage() {
  const router = useRouter();
  const [checks, setChecks] = useState<Check[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<CheckStatus | ''>('');
  const [filterType, setFilterType] = useState<CheckType | ''>('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchChecks();
  }, []);

  const fetchChecks = async () => {
    setLoading(true);
    try {
      const mockChecks: any[] = []; // تم إزالة البيانات الوهمية - يتم الجلب من API

      setChecks([]); // تم استبدال mockChecks ببيانات فارغة
    } catch (error) {
      console.error('Error fetching checks:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: checks.length,
    received: checks.filter(c => c.type === 'received').length,
    issued: checks.filter(c => c.type === 'issued').length,
    cleared: checks.filter(c => c.status === 'cleared').length,
    bounced: checks.filter(c => c.status === 'bounced').length,
    pending: checks.filter(c => c.status === 'pending').length,
    totalAmount: checks.reduce((sum, c) => sum + c.amount, 0),
    bouncedAmount: checks
      .filter(c => c.status === 'bounced')
      .reduce((sum, c) => sum + c.amount, 0)
  };

  const filteredChecks = checks.filter(c => {
    const matchesSearch = 
      c.checkNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.issuerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.beneficiaryName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filterStatus || c.status === filterStatus;
    const matchesType = !filterType || c.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: CheckStatus): string => {
    switch (status) {
      case 'cleared': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'deposited': return 'bg-blue-100 text-blue-800';
      case 'bounced': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: CheckStatus): string => {
    const statuses = {
      pending: 'معلق',
      deposited: 'مودع',
      cleared: 'تم صرفه',
      bounced: 'مرتد',
      cancelled: 'ملغي',
      replaced: 'تم استبداله'
    };
    return statuses[status] || status;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>إدارة الشيكات - النظام المالي</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FiFileText className="text-purple-600" />
                إدارة الشيكات
              </h1>
              <p className="text-gray-600 mt-2">تتبع الشيكات المستلمة والصادرة</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              <FiPlus />
              تسجيل شيك
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-600">الإجمالي</p>
          </div>
          <div className="bg-green-50 rounded-lg shadow-sm p-4 text-center border border-green-200">
            <p className="text-2xl font-bold text-green-600">{stats.cleared}</p>
            <p className="text-xs text-green-700">تم صرفها</p>
          </div>
          <div className="bg-red-50 rounded-lg shadow-sm p-4 text-center border border-red-200">
            <p className="text-2xl font-bold text-red-600">{stats.bounced}</p>
            <p className="text-xs text-red-700">مرتدة</p>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow-sm p-4 text-center border border-yellow-200">
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-xs text-yellow-700">معلقة</p>
          </div>
          <div className="bg-blue-50 rounded-lg shadow-sm p-4 text-center border border-blue-200">
            <p className="text-2xl font-bold text-blue-600">{stats.received}</p>
            <p className="text-xs text-blue-700">مستلمة</p>
          </div>
          <div className="bg-purple-50 rounded-lg shadow-sm p-4 text-center border border-purple-200">
            <p className="text-2xl font-bold text-purple-600">{stats.issued}</p>
            <p className="text-xs text-purple-700">صادرة</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="البحث برقم الشيك أو اسم المُصدر..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            />

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as CheckStatus | '')}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="">جميع الحالات</option>
              <option value="pending">معلق</option>
              <option value="deposited">مودع</option>
              <option value="cleared">تم صرفه</option>
              <option value="bounced">مرتد</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as CheckType | '')}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="">جميع الأنواع</option>
              <option value="received">مستلم</option>
              <option value="issued">صادر</option>
            </select>
          </div>
        </div>

        {/* Checks Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم الشيك</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">النوع</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المُصدر/المستفيد</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">البنك</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المبلغ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredChecks.map((check) => (
                <tr key={check.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{check.checkNumber}</div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      check.type === 'received' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'
                    }`}>
                      {check.type === 'received' ? '⬇️ مستلم' : '⬆️ صادر'}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        من: {check.issuerName}
                      </div>
                      <div className="text-gray-600">
                        إلى: {check.beneficiaryName}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{check.bankName}</div>
                    {check.branchName && (
                      <div className="text-xs text-gray-500">{check.branchName}</div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="text-lg font-bold text-gray-900">
                      {check.amount.toLocaleString()} ر.ع
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(check.status)}`}>
                      {check.status === 'cleared' && <FiCheckCircle className="w-3 h-3 ml-1" />}
                      {check.status === 'bounced' && <FiXCircle className="w-3 h-3 ml-1" />}
                      {check.status === 'pending' && <FiClock className="w-3 h-3 ml-1" />}
                      {getStatusText(check.status)}
                    </span>
                    {check.status === 'bounced' && check.bouncedReason && (
                      <div className="text-xs text-red-600 mt-1">
                        {check.bouncedReason}
                      </div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div>الاستحقاق: {new Date(check.dueDate).toLocaleDateString('ar-OM')}</div>
                    {check.clearanceDate && (
                      <div className="text-xs text-green-600">
                        تم الصرف: {new Date(check.clearanceDate).toLocaleDateString('ar-OM')}
                      </div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/admin/financial/checks/${check.id}`)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="عرض"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      {check.status === 'bounced' && (
                        <button
                          onClick={() => alert('استبدال الشيك المرتد')}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="استبدال"
                        >
                          <FiRefreshCw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bounced Checks Alert */}
        {stats.bounced > 0 && (
          <div className="bg-red-50 border-r-4 border-red-500 p-4 rounded-lg mt-6">
            <div className="flex items-start gap-3">
              <FiAlertCircle className="w-6 h-6 text-red-600 mt-0.5" />
              <div>
                <p className="font-bold text-red-900">تحذير: شيكات مرتدة</p>
                <p className="text-sm text-red-700 mt-1">
                  لديك {stats.bounced} شيك مرتد بقيمة {stats.bouncedAmount.toLocaleString()} ر.ع
                </p>
                <p className="text-xs text-red-600 mt-2">
                  يرجى متابعة العملاء واتخاذ الإجراءات اللازمة
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Create Check Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
              <div className="bg-purple-600 p-6 text-white">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <FiPlus />
                  تسجيل شيك جديد
                </h2>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">نوع الشيك *</label>
                    <select className="w-full px-4 py-2 border rounded-lg">
                      <option value="received">شيك مستلم</option>
                      <option value="issued">شيك صادر</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">رقم الشيك *</label>
                    <input type="text" className="w-full px-4 py-2 border rounded-lg" placeholder="CHK-001" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">اسم البنك *</label>
                    <input type="text" className="w-full px-4 py-2 border rounded-lg" placeholder="بنك مسقط" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">المبلغ *</label>
                    <input type="number" className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">تاريخ الإصدار *</label>
                    <input type="date" className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">تاريخ الاستحقاق *</label>
                    <input type="date" className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 flex justify-end gap-3">
                <button onClick={() => setShowCreateModal(false)} className="px-6 py-2 border rounded-lg">إلغاء</button>
                <button onClick={() => { alert('تم التسجيل!'); setShowCreateModal(false); }} className="px-6 py-2 bg-purple-600 text-white rounded-lg">حفظ</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

