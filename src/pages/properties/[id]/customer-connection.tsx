// صفحة ربط العقارات بالعملاء
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';

interface Property {
  id: string;
  title: string;
  type: string;
  purpose: string;
  priceOMR: number;
  province: string;
  state: string;
  address: string;
  beds: number;
  baths: number;
  area: number;
  status: string;
  images?: string[];
  coverImage?: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'individual' | 'company';
  address: string;
  city: string;
  country: string;
  dateOfBirth?: string;
  nationality?: string;
  idNumber?: string;
  occupation?: string;
  company?: string;
  status: string;
  createdAt: string;
}

interface Connection {
  id: string;
  propertyId: string;
  customerId: string;
  connectionType: 'owner' | 'tenant' | 'buyer' | 'investor' | 'manager';
  startDate: string;
  endDate?: string;
  status: 'active' | 'inactive' | 'pending' | 'terminated';
  notes?: string;
  documents?: string[];
  createdAt: string;
  updatedAt: string;
}

export default function PropertyCustomerConnection() {
  const router = useRouter();
  const { id } = router.query;
  const [property, setProperty] = useState<Property | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [connectionType, setConnectionType] = useState<'owner' | 'tenant' | 'buyer' | 'investor' | 'manager'>('tenant');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [propertyRes, customersRes, connectionsRes] = await Promise.all([
        fetch(`/api/properties/${id}`),
        fetch('/api/customers'),
        fetch(`/api/properties/${id}/connections`)
      ]);

      if (propertyRes.ok) {
        const propertyData = await propertyRes.json();
        setProperty(propertyData);
      }

      if (customersRes.ok) {
        const customersData = await customersRes.json();
        setCustomers(customersData.customers || []);
      }

      if (connectionsRes.ok) {
        const connectionsData = await connectionsRes.json();
        setConnections(connectionsData.connections || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/properties/${id}/connections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: selectedCustomer,
          connectionType,
          startDate,
          endDate: endDate || null,
          notes,
          status: 'active'
        }),
      });

      if (response.ok) {
        setShowAddForm(false);
        setSelectedCustomer('');
        setStartDate('');
        setEndDate('');
        setNotes('');
        fetchData(); // إعادة جلب البيانات
      } else {
        alert('حدث خطأ أثناء إضافة الاتصال');
      }
    } catch (error) {
      console.error('Error adding connection:', error);
      alert('حدث خطأ في الاتصال');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateConnectionStatus = async (connectionId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/properties/${id}/connections/${connectionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchData(); // إعادة جلب البيانات
      } else {
        alert('حدث خطأ أثناء تحديث الحالة');
      }
    } catch (error) {
      console.error('Error updating connection:', error);
      alert('حدث خطأ في الاتصال');
    }
  };

  const getConnectionTypeLabel = (type: string) => {
    switch (type) {
      case 'owner': return 'مالك';
      case 'tenant': return 'مستأجر';
      case 'buyer': return 'مشتري';
      case 'investor': return 'مستثمر';
      case 'manager': return 'مدير';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'terminated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'inactive': return 'غير نشط';
      case 'pending': return 'قيد المراجعة';
      case 'terminated': return 'منتهي';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-OM');
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">جاري التحميل...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!property) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">لم يتم العثور على العقار</p>
            <Link href="/properties" className="text-blue-600 hover:text-blue-800 mt-2 inline-block">
              العودة إلى العقارات
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>ربط العقار بالعملاء - {property.title}</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ربط العقار بالعملاء</h1>
                <p className="text-gray-600 mt-1">{property.title}</p>
                <p className="text-sm text-gray-500">{property.address}</p>
              </div>
              <div className="flex space-x-3">
                <Link
                  href={`/properties/${id}`}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  ← العودة للعقار
                </Link>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <span className="inline ml-1">➕</span>
                  ربط عميل جديد
                </button>
              </div>
            </div>
          </div>

          {/* Property Info */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">معلومات العقار</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-medium text-gray-900">المعلومات الأساسية</h3>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <p><strong>النوع:</strong> {property.type}</p>
                  <p><strong>الغرض:</strong> {property.purpose}</p>
                  <p><strong>السعر:</strong> {property.priceOMR.toLocaleString()} ر.ع</p>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">المواصفات</h3>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <p><strong>الغرف:</strong> {property.beds}</p>
                  <p><strong>الحمامات:</strong> {property.baths}</p>
                  <p><strong>المساحة:</strong> {property.area} م²</p>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">الموقع</h3>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <p><strong>المحافظة:</strong> {property.province}</p>
                  <p><strong>الولاية:</strong> {property.state}</p>
                  <p><strong>الحالة:</strong> {property.status}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Add Connection Form */}
          {showAddForm && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">ربط عميل جديد</h2>
              <form onSubmit={handleAddConnection} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      العميل *
                    </label>
                    <select
                      value={selectedCustomer}
                      onChange={(e) => setSelectedCustomer(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">اختر العميل</option>
                      {customers.map(customer => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} - {customer.phone}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نوع الاتصال *
                    </label>
                    <select
                      value={connectionType}
                      onChange={(e) => setConnectionType(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="tenant">مستأجر</option>
                      <option value="owner">مالك</option>
                      <option value="buyer">مشتري</option>
                      <option value="investor">مستثمر</option>
                      <option value="manager">مدير</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      تاريخ البداية *
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      تاريخ النهاية
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ملاحظات
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {saving ? 'جاري الحفظ...' : 'حفظ الاتصال'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Connections List */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">الاتصالات المرتبطة</h2>
            </div>

            {connections.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">لا توجد اتصالات مرتبطة بهذا العقار</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        العميل
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        نوع الاتصال
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        تاريخ البداية
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        تاريخ النهاية
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
                    {connections.map((connection) => {
                      const customer = customers.find(c => c.id === connection.customerId);
                      return (
                        <tr key={connection.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {customer?.name || 'غير محدد'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {customer?.phone || ''}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {getConnectionTypeLabel(connection.connectionType)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(connection.startDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {connection.endDate ? formatDate(connection.endDate) : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(connection.status)}`}>
                              {getStatusLabel(connection.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleUpdateConnectionStatus(connection.id, 'active')}
                                className="text-green-600 hover:text-green-900"
                              >
                                تفعيل
                              </button>
                              <button
                                onClick={() => handleUpdateConnectionStatus(connection.id, 'inactive')}
                                className="text-yellow-600 hover:text-yellow-900"
                              >
                                إيقاف
                              </button>
                              <button
                                onClick={() => handleUpdateConnectionStatus(connection.id, 'terminated')}
                                className="text-red-600 hover:text-red-900"
                              >
                                إنهاء
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
