// src/pages/admin/buildings/index.tsx - إدارة المباني
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface Building {
  id: string;
  buildingNo: string;
  name?: string;
  address?: string;
  totalUnits: number;
  occupiedUnits: number;
}

export default function BuildingsManagementPage() {
  const [loading, setLoading] = useState(true);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadBuildings();
  }, []);

  const loadBuildings = async () => {
    try {
      const response = await fetch('/api/admin/buildings');
      if (response.ok) {
        const data = await response.json();
        setBuildings(data.buildings || []);
      }
    } catch (error) {
      console.error('Error loading buildings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBuildings = buildings.filter(building =>
    (building.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    building.buildingNo.includes(searchTerm) ||
    (building.address?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = {
    totalBuildings: buildings.length,
    totalUnits: buildings.reduce((sum, b) => sum + b.totalUnits, 0),
    occupiedUnits: buildings.reduce((sum, b) => sum + b.occupiedUnits, 0)
  };

  const deleteBuilding = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المبنى؟')) return;
    
    setBuildings(buildings.filter(b => b.id !== id));
    alert('✅ تم حذف المبنى بنجاح');
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

      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">إدارة المباني</h1>
              <p className="mt-1 text-sm text-gray-500">
                عرض وإدارة جميع المباني والعقارات
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
                href="/admin/buildings/new"
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <span className="ml-2">+</span>
                إضافة مبنى جديد
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
              <p className="text-sm font-medium text-gray-600">إجمالي المباني</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBuildings}</p>
            </div>
            <span className="text-4xl">🏗️</span>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">إجمالي الوحدات</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUnits}</p>
            </div>
            <span className="text-4xl">🏢</span>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">وحدات مشغولة</p>
              <p className="text-2xl font-bold text-gray-900">{stats.occupiedUnits}</p>
            </div>
            <span className="text-4xl">✅</span>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <input
            type="text"
            placeholder="ابحث باسم المبنى، الرقم، أو العنوان..."
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Buildings Table */}
        {filteredBuildings.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">رقم المبنى</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الاسم</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">العنوان</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الوحدات (مشغولة/إجمالي)</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">إجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBuildings.map((building) => (
                  <tr key={building.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{building.buildingNo}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{building.name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{building.address || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {building.occupiedUnits} / {building.totalUnits}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/admin/units?buildingId=${building.id}`} className="text-blue-600 hover:text-blue-900 ml-2">
                        الوحدات
                      </Link>
                      <Link href={`/admin/buildings/${building.id}`} className="text-indigo-600 hover:text-indigo-900 ml-2">
                        تعديل
                      </Link>
                      <button onClick={() => deleteBuilding(building.id)} className="text-red-600 hover:text-red-900">
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
              <div className="text-6xl mb-4">🏗️</div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد مبانٍ</h3>
              <p className="mt-1 text-sm text-gray-500">
                ابدأ بإضافة مبنى جديد.
              </p>
              <div className="mt-6">
                <Link 
                  href="/admin/buildings/new"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <span className="ml-2">+</span>
                  إضافة مبنى جديد
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

