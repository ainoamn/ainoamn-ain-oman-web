// src/pages/admin/tenants/index.tsx - إدارة المستأجرين
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface Tenant {
  id: string;
  name: string;
  email?: string;
  phone: string;
  nationalId: string;
  nationality: string;
  activeLeases: number;
  totalPaid: number;
  pendingPayments: number;
  status: 'active' | 'inactive' | 'blacklisted';
  joinedDate: string;
  properties: string[];
}

export default function TenantsManagementPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      const bookingsRes = await fetch('/api/bookings');
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        const bookingsArray = Array.isArray(bookingsData) ? bookingsData : bookingsData.items || [];
        
        const tenantsMap = new Map<string, Tenant>();
        
        bookingsArray.forEach((booking: any) => {
          if (booking.customerInfo) {
            const customerId = booking.customerId || booking.customerInfo.phone;
            
            if (!tenantsMap.has(customerId)) {
              tenantsMap.set(customerId, {
                id: customerId,
                name: booking.customerInfo.name || booking.customerInfo.fullName || 'غير محدد',
                email: booking.customerInfo.email,
                phone: booking.customerInfo.phone || '',
                nationalId: booking.customerInfo.nationalId || booking.customerInfo.civilId || '',
                nationality: booking.customerInfo.nationality || 'عماني',
                activeLeases: 0,
                totalPaid: 0,
                pendingPayments: 0,
                status: 'active',
                joinedDate: booking.createdAt || new Date().toISOString(),
                properties: []
              });
            }
            
            const tenant = tenantsMap.get(customerId)!;
            if (booking.status === 'leased' || booking.status === 'reserved') {
              tenant.activeLeases++;
            }
            tenant.totalPaid += booking.paidAmount || 0;
            tenant.pendingPayments += (booking.totalAmount || 0) - (booking.paidAmount || 0);
            if (booking.propertyId && !tenant.properties.includes(booking.propertyId)) {
              tenant.properties.push(booking.propertyId);
            }
          }
        });
        
        setTenants(Array.from(tenantsMap.values()));
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTenants = tenants.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.phone.includes(searchTerm) ||
    t.nationalId.includes(searchTerm)
  );

  const stats = {
    total: tenants.length,
    active: tenants.filter(t => t.status === 'active').length,
    totalRevenue: tenants.reduce((sum, t) => sum + t.totalPaid, 0)
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-OM', {
      style: 'currency',
      currency: 'OMR',
      maximumFractionDigits: 3
    }).format(amount);
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

      {/* Header */}
      <div className="bg-white shadow border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">إدارة المستأجرين</h1>
              <p className="mt-1 text-sm text-gray-500">قائمة بجميع المستأجرين</p>
            </div>
            <Link href="/admin/dashboard" className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
              ← لوحة التحكم
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي المستأجرين</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">نشط</p>
                <p className="text-3xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">الإيرادات</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث بالاسم، الهاتف، أو رقم الهوية..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Tenants Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {filteredTenants.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المستأجر</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الاتصال</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">العقود</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المدفوعات</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTenants.map((tenant) => (
                    <tr key={tenant.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{tenant.name}</div>
                        <div className="text-sm text-gray-500">رقم الهوية: {tenant.nationalId || 'غير محدد'}</div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div>📞 {tenant.phone}</div>
                        {tenant.email && <div className="text-gray-600">📧 {tenant.email}</div>}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div>{tenant.activeLeases} عقد نشط</div>
                        <div className="text-gray-500">{tenant.properties.length} عقار</div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="text-green-600">{formatCurrency(tenant.totalPaid)}</div>
                        {tenant.pendingPayments > 0 && (
                          <div className="text-orange-600">معلق: {formatCurrency(tenant.pendingPayments)}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/customers/${encodeURIComponent(tenant.name)}`}
                          className="px-3 py-1 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 rounded transition"
                        >
                          عرض
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <p className="text-gray-600">لا يوجد مستأجرين</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

