// src/pages/admin/units/index.tsx - إدارة الوحدات العقارية
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface Unit {
  id: string;
  unitNumber: string;
  buildingId: string;
  buildingName: string;
  floor: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  type: 'apartment' | 'villa' | 'office' | 'shop' | 'warehouse';
  status: 'available' | 'rented' | 'maintenance' | 'reserved';
  monthlyRent: number;
  deposit: number;
  tenantId?: string;
  tenantName?: string;
  leaseStartDate?: string;
  leaseEndDate?: string;
  amenities: string[];
  images: string[];
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface Building {
  id: string;
  name: string;
  address: string;
  totalUnits: number;
  availableUnits: number;
}

export default function UnitsManagementPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [sortBy, setSortBy] = useState('unitNumber');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // إحصائيات النظام
  const [stats, setStats] = useState({
    totalUnits: 0,
    availableUnits: 0,
    rentedUnits: 0,
    maintenanceUnits: 0,
    totalRevenue: 0,
    occupancyRate: 0
  });

  useEffect(() => {
    loadUnits();
    loadBuildings();
    loadStats();
  }, []);

  const loadUnits = async () => {
    try {
      const response = await fetch('/api/admin/units');
      if (response.ok) {
        const data = await response.json();
        setUnits(data.units || []);
      }
    } catch (error) {

    } finally {
      setLoading(false);
    }
  };

  const loadBuildings = async () => {
    try {
      const response = await fetch('/api/admin/buildings');
      if (response.ok) {
        const data = await response.json();
        setBuildings(data.buildings || []);
      }
    } catch (error) {

    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/units/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {

    }
  };

  const filteredUnits = units.filter(unit => {
    const matchesSearch = unit.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         unit.buildingName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         unit.tenantName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBuilding = !selectedBuilding || unit.buildingId === selectedBuilding;
    const matchesStatus = !selectedStatus || unit.status === selectedStatus;
    const matchesType = !selectedType || unit.type === selectedType;

    return matchesSearch && matchesBuilding && matchesStatus && matchesType;
  });

  const sortedUnits = [...filteredUnits].sort((a, b) => {
    const aValue = a[sortBy as keyof Unit];
    const bValue = b[sortBy as keyof Unit];
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'rented': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'reserved': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'متاح';
      case 'rented': return 'مؤجر';
      case 'maintenance': return 'صيانة';
      case 'reserved': return 'محجوز';
      default: return status;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'apartment': return 'شقة';
      case 'villa': return 'فيلا';
      case 'office': return 'مكتب';
      case 'shop': return 'محل';
      case 'warehouse': return 'مستودع';
      default: return type;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-OM', {
      style: 'currency',
      currency: 'OMR',
      maximumFractionDigits: 3
    }).format(amount);
  };

  const handleDeleteUnit = async (unitId: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الوحدة؟')) {
      try {
        const response = await fetch(`/api/admin/units/${unitId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setUnits(units.filter(unit => unit.id !== unitId));
          loadStats();
        }
      } catch (error) {

      }
    }
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
        <title>إدارة الوحدات العقارية - عين عُمان</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">إدارة الوحدات العقارية</h1>
                <p className="mt-1 text-sm text-gray-500">
                  إدارة شاملة لجميع الوحدات العقارية والمستأجرين
                </p>
              </div>
              <div className="flex space-x-3 rtl:space-x-reverse">
                <Link 
                  href="/properties/new"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <span className="w-4 h-4 ml-2">➕</span>
                  إضافة وحدة جديدة
                </Link>
                <button className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
                  <span className="w-4 h-4 ml-2">📥</span>
                  تصدير البيانات
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="w-6 h-6 text-blue-600">🏢</span>
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">إجمالي الوحدات</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUnits}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <span className="w-6 h-6 text-green-600">🏠</span>
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">وحدات متاحة</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.availableUnits}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="w-6 h-6 text-blue-600">👥</span>
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">وحدات مؤجرة</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.rentedUnits}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <span className="w-6 h-6 text-yellow-600">⚙️</span>
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">تحت الصيانة</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.maintenanceUnits}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <span className="w-6 h-6 text-green-600">💰</span>
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">إجمالي الإيرادات</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <span className="w-6 h-6 text-purple-600">📈</span>
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">معدل الإشغال</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.occupancyRate}%</p>
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
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4">🔍</span>
                  <input
                    type="text"
                    placeholder="رقم الوحدة، المبنى، المستأجر..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">المبنى</label>
                <select
                  value={selectedBuilding}
                  onChange={(e) => setSelectedBuilding(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">جميع المباني</option>
                  {buildings.map(building => (
                    <option key={building.id} value={building.id}>
                      {building.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">جميع الحالات</option>
                  <option value="available">متاح</option>
                  <option value="rented">مؤجر</option>
                  <option value="maintenance">صيانة</option>
                  <option value="reserved">محجوز</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">النوع</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">جميع الأنواع</option>
                  <option value="apartment">شقة</option>
                  <option value="villa">فيلا</option>
                  <option value="office">مكتب</option>
                  <option value="shop">محل</option>
                  <option value="warehouse">مستودع</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ترتيب حسب</label>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field);
                    setSortOrder(order as 'asc' | 'desc');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="unitNumber-asc">رقم الوحدة (أ-ي)</option>
                  <option value="unitNumber-desc">رقم الوحدة (ي-أ)</option>
                  <option value="monthlyRent-asc">الإيجار (أقل-أعلى)</option>
                  <option value="monthlyRent-desc">الإيجار (أعلى-أقل)</option>
                  <option value="area-asc">المساحة (أقل-أعلى)</option>
                  <option value="area-desc">المساحة (أعلى-أقل)</option>
                </select>
              </div>
            </div>
          </div>

          {/* جدول الوحدات */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                الوحدات العقارية ({sortedUnits.length})
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الوحدة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المبنى
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      النوع
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المساحة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الإيجار الشهري
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المستأجر
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
                  {sortedUnits.map((unit) => (
                    <tr key={unit.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                              <span className="w-5 h-5 text-blue-600">🏠</span>
                            </div>
                          </div>
                          <div className="mr-4">
                            <div className="text-sm font-medium text-gray-900">
                              {unit.unitNumber}
                            </div>
                            <div className="text-sm text-gray-500">
                              الطابق {unit.floor}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{unit.buildingName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{getTypeText(unit.type)}</div>
                        <div className="text-sm text-gray-500">
                          {unit.bedrooms} غرف، {unit.bathrooms} حمام
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{unit.area} م²</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(unit.monthlyRent)}
                        </div>
                        <div className="text-sm text-gray-500">
                          ضمان: {formatCurrency(unit.deposit)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {unit.tenantName ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {unit.tenantName}
                            </div>
                            {unit.leaseEndDate && (
                              <div className="text-sm text-gray-500">
                                ينتهي: {new Date(unit.leaseEndDate).toLocaleDateString('ar', { calendar: 'gregory', numberingSystem: 'latn' })}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">لا يوجد مستأجر</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(unit.status)}`}>
                          {getStatusText(unit.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <Link 
                            href={`/admin/units/${unit.id}`}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="عرض التفاصيل"
                          >
                            <span className="w-4 h-4">👁️</span>
                          </Link>
                          <Link 
                            href={`/admin/units/${unit.id}/edit`}
                            className="text-indigo-600 hover:text-indigo-900 p-1"
                            title="تعديل"
                          >
                            <span className="w-4 h-4">✏️</span>
                          </Link>
                          <button
                            onClick={() => handleDeleteUnit(unit.id)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="حذف"
                          >
                            <span className="w-4 h-4">🗑️</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {sortedUnits.length === 0 && (
                <div className="text-center py-12">
                  <span className="mx-auto h-12 w-12 text-gray-400">🏢</span>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد وحدات</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    ابدأ بإضافة وحدة جديدة لإدارة العقارات.
                  </p>
                  <div className="mt-6">
                    <Link 
                      href="/properties/new"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <span className="w-4 h-4 ml-2">➕</span>
                      إضافة وحدة جديدة
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
