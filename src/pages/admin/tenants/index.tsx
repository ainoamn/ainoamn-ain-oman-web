// src/pages/admin/tenants/index.tsx - إدارة المستأجرين
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  nationalId: string;
  status: 'active' | 'inactive';
  currentUnit?: {
    unitNumber: string;
    buildingName: string;
  };
}

export default function TenantsManagementPage() {
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      const response = await fetch('/api/admin/tenants');
      if (response.ok) {
        const data = await response.json();
        setTenants(data.tenants || []);
      }
    } catch (error) {
      console.error('Error loading tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.phone.includes(searchTerm);
    const matchesStatus = !filterStatus || tenant.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: tenants.length,
    active: tenants.filter(t => t.status === 'active').length,
    inactive: tenants.filter(t => t.status === 'inactive').length
  };

  const deleteTenant = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستأجر؟')) return;
    
    setTenants(tenants.filter(t => t.id !== id));
    alert('✅ تم حذف المستأجر بنجاح');
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
        <title>إدارة المستأجرين - عين عُمان</title>
      </Head>

      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">إدارة المستأجرين</h1>
              <p className="mt-1 text-sm text-gray-500">
                عرض وإدارة جميع المستأجرين في النظام
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
                href="/admin/tenants/new"
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <span className="ml-2">+</span>
                إضافة مستأجر جديد
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">إجمالي المستأجرين</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <span className="text-4xl">👥</span>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">مستأجرون نشطون</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
            <span className="text-4xl">🟢</span>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">غير نشطين</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
            </div>
            <span className="text-4xl">⚪</span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="ابحث بالاسم، البريد، أو الهاتف..."
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
            <option value="active">نشط</option>
            <option value="inactive">غير نشط</option>
          </select>
        </div>

        {/* Tenants Table */}
        {filteredTenants.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الاسم</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التواصل</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الوحدة الحالية</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">إجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTenants.map((tenant) => (
                  <tr key={tenant.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                      <div className="text-sm text-gray-500">ID: {tenant.nationalId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{tenant.phone}</div>
                      <div className="text-sm text-gray-500">{tenant.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        tenant.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {tenant.status === 'active' ? 'نشط' : 'غير نشط'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tenant.currentUnit ? (
                        <div>{tenant.currentUnit.unitNumber} - {tenant.currentUnit.buildingName}</div>
                      ) : (
                        <span className="text-gray-400">لا توجد</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/admin/tenants/${tenant.id}`} className="text-blue-600 hover:text-blue-900 ml-2">
                        عرض
                      </Link>
                      <button onClick={() => alert('تعديل ' + tenant.name)} className="text-indigo-600 hover:text-indigo-900 ml-2">
                        تعديل
                      </button>
                      <button onClick={() => deleteTenant(tenant.id)} className="text-red-600 hover:text-red-900">
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
              <div className="text-6xl mb-4">👥</div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">لا يوجد مستأجرين</h3>
              <p className="mt-1 text-sm text-gray-500">
                ابدأ بإضافة مستأجر جديد.
              </p>
              <div className="mt-6">
                <Link 
                  href="/admin/tenants/new"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <span className="ml-2">+</span>
                  إضافة مستأجر جديد
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

