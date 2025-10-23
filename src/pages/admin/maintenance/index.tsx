// src/pages/admin/maintenance/index.tsx - إدارة الصيانة
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface MaintenanceRequest {
  id: string;
  requestNumber: string;
  type: 'plumbing' | 'electrical' | 'hvac' | 'cleaning' | 'security' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  tenantName: string;
  unitNumber: string;
  buildingName: string;
  title: string;
  reportedDate: string;
}

export default function MaintenanceManagementPage() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const response = await fetch('/api/admin/maintenance');
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
      }
    } catch (error) {

    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.requestNumber.includes(searchTerm) ||
                         req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.tenantName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || req.status === filterStatus;
    const matchesPriority = !filterPriority || req.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const stats = {
    totalRequests: requests.length,
    pendingRequests: requests.filter(r => r.status === 'pending').length,
    completedRequests: requests.filter(r => r.status === 'completed').length,
    urgentRequests: requests.filter(r => r.priority === 'urgent').length
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar', { calendar: 'gregory', numberingSystem: 'latn' });
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: 'معلق',
      in_progress: 'قيد التنفيذ',
      completed: 'مكتمل',
      cancelled: 'ملغى'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityText = (priority: string) => {
    const priorityMap: Record<string, string> = {
      low: 'منخفضة',
      medium: 'متوسطة',
      high: 'عالية',
      urgent: 'عاجلة'
    };
    return priorityMap[priority] || priority;
  };

  const getPriorityColor = (priority: string) => {
    const colorMap: Record<string, string> = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colorMap[priority] || 'bg-gray-100 text-gray-800';
  };

  const deleteRequest = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return;
    
    setRequests(requests.filter(r => r.id !== id));
    alert('✅ تم حذف الطلب بنجاح');
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
        <title>إدارة الصيانة - عين عُمان</title>
      </Head>

      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">إدارة الصيانة</h1>
              <p className="mt-1 text-sm text-gray-500">
                عرض وإدارة جميع طلبات الصيانة
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
                href="/admin/maintenance/new"
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <span className="ml-2">+</span>
                طلب صيانة جديد
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
              <p className="text-sm font-medium text-gray-600">إجمالي الطلبات</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRequests}</p>
            </div>
            <span className="text-4xl">🔧</span>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">طلبات معلقة</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingRequests}</p>
            </div>
            <span className="text-4xl">⏳</span>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">طلبات مكتملة</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedRequests}</p>
            </div>
            <span className="text-4xl">✅</span>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">طلبات عاجلة</p>
              <p className="text-2xl font-bold text-gray-900">{stats.urgentRequests}</p>
            </div>
            <span className="text-4xl">🔥</span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="ابحث برقم الطلب، الوحدة، أو المستأجر..."
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
            <option value="in_progress">قيد التنفيذ</option>
            <option value="completed">مكتمل</option>
            <option value="cancelled">ملغى</option>
          </select>
          <select
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="">جميع الأولويات</option>
            <option value="low">منخفضة</option>
            <option value="medium">متوسطة</option>
            <option value="high">عالية</option>
            <option value="urgent">عاجلة</option>
          </select>
        </div>

        {/* Maintenance Requests Table */}
        {filteredRequests.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الطلب</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الوحدة / المستأجر</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الأولوية</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ الطلب</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">إجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <tr key={request.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{request.title}</div>
                      <div className="text-sm text-gray-500">ID: {request.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{request.unitNumber} ({request.buildingName})</div>
                      <div>{request.tenantName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.status)}`}>
                        {getStatusText(request.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(request.priority)}`}>
                        {getPriorityText(request.priority)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(request.reportedDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/admin/maintenance/${request.id}`} className="text-blue-600 hover:text-blue-900 ml-2">
                        عرض
                      </Link>
                      <button onClick={() => alert('تعديل ' + request.title)} className="text-indigo-600 hover:text-indigo-900 ml-2">
                        تعديل
                      </button>
                      <button onClick={() => deleteRequest(request.id)} className="text-red-600 hover:text-red-900">
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
              <div className="text-6xl mb-4">🔧</div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد طلبات صيانة</h3>
              <p className="mt-1 text-sm text-gray-500">
                ابدأ بإضافة طلب صيانة جديد.
              </p>
              <div className="mt-6">
                <Link 
                  href="/admin/maintenance/new"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <span className="ml-2">+</span>
                  طلب صيانة جديد
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
