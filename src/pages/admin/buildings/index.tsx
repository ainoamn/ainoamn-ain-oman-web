// src/pages/admin/buildings/index.tsx - إدارة المباني
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface Building {
  id: string;
  buildingNo: string;
  address: string;
  geo?: {
    province?: string;
    state?: string;
    city?: string;
  };
  published: boolean;
  archived: boolean;
  coverImage?: string;
}

export default function BuildingsManagementPage() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadBuildings();
  }, []);

  const loadBuildings = async () => {
    try {
      const response = await fetch('/api/admin/buildings');
      if (response.ok) {
        const data = await response.json();
        const buildingsArray = Array.isArray(data) ? data : data.items || data.buildings || [];
        setBuildings(buildingsArray);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBuildings = buildings.filter(b =>
    b.buildingNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: buildings.length,
    published: buildings.filter(b => b.published).length,
    draft: buildings.filter(b => !b.published && !b.archived).length
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
        <title>إدارة المباني - عين عُمان</title>
      </Head>

      {/* Header */}
      <div className="bg-white shadow border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">إدارة المباني</h1>
              <p className="mt-1 text-sm text-gray-500">قائمة بجميع المباني والعمارات</p>
            </div>
            <div className="flex gap-3">
              <Link href="/admin/dashboard" className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                ← لوحة التحكم
              </Link>
            </div>
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
                <p className="text-sm text-gray-600">إجمالي المباني</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="text-4xl">🏗️</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">منشور</p>
                <p className="text-3xl font-bold text-green-600">{stats.published}</p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">مسودة</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.draft}</p>
              </div>
              <div className="text-4xl">📝</div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث برقم المبنى أو العنوان..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Buildings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBuildings.map((building) => (
            <div key={building.id} className="bg-white rounded-xl shadow hover:shadow-lg transition">
              <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                <div className="text-6xl">🏗️</div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">مبنى رقم {building.buildingNo}</h3>
                    <p className="text-sm text-gray-500">{building.id}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${
                    building.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {building.published ? '✓ منشور' : '📝 مسودة'}
                  </span>
                </div>
                {building.address && (
                  <p className="text-sm text-gray-600 mb-3">📍 {building.address}</p>
                )}
                <div className="flex gap-2">
                  <Link
                    href={`/admin/buildings/edit/${building.id}`}
                    className="flex-1 px-4 py-2 text-center bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition text-sm"
                  >
                    ✏️ تعديل
                  </Link>
                  <Link
                    href={`/admin/units?building=${building.id}`}
                    className="flex-1 px-4 py-2 text-center bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition text-sm"
                  >
                    🏢 الوحدات
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredBuildings.length === 0 && (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <div className="text-6xl mb-4">🏗️</div>
            <p className="text-gray-600">لا توجد مباني</p>
          </div>
        )}
      </div>
    </div>
  );
}

