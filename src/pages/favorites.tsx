// src/pages/favorites.tsx - المفضلة
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import InstantLink from '@/components/InstantLink';
import InstantImage from '@/components/InstantImage';
import { 
  FiHeart, FiMapPin, FiDollarSign, FiCalendar, FiEye, FiShare2,
  FiFilter, FiSearch, FiSortAsc, FiTrash2, FiDownload, FiPrinter,
  FiHome, FiUsers, FiStar, FiTrendingUp, FiTrendingDown
} from 'react-icons/fi';
// Layout handled by _app.tsx

interface Favorite {
  id: string;
  userId: string;
  type: 'property' | 'auction' | 'customer' | 'report';
  itemId: string;
  itemName: string;
  itemDescription: string;
  itemImage?: string;
  itemPrice?: number;
  itemLocation?: string;
  itemStatus?: string;
  itemType?: string;
  addedAt: string;
  notes?: string;
  tags?: string[];
}

interface Property {
  id: string;
  title: string;
  description: string;
  priceMonthly?: number;
  priceOMR?: number;
  location?: string;
  type?: string;
  status?: string;
  images?: string[];
  features?: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface Auction {
  id: string;
  title: string;
  description: string;
  currentBid: number;
  startingPrice: number;
  location: string;
  status: 'upcoming' | 'live' | 'ended' | 'cancelled';
  startDate: string;
  endDate: string;
  images: string[];
  biddersCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  location?: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('addedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFavorites, setSelectedFavorites] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // تحميل المفضلة
      const favoritesResponse = await fetch('/api/favorites');
      if (favoritesResponse.ok) {
        const favoritesData = await favoritesResponse.json();
        setFavorites(favoritesData.favorites || []);
      }

      // تحميل العقارات
      const propertiesResponse = await fetch('/api/properties');
      if (propertiesResponse.ok) {
        const propertiesData = await propertiesResponse.json();
        setProperties(propertiesData.properties || []);
      }

      // تحميل المزادات
      const auctionsResponse = await fetch('/api/auctions');
      if (auctionsResponse.ok) {
        const auctionsData = await auctionsResponse.json();
        setAuctions(auctionsData.auctions || []);
      }

      // تحميل العملاء
      const customersResponse = await fetch('/api/customers');
      if (customersResponse.ok) {
        const customersData = await customersResponse.json();
        setCustomers(customersData.customers || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-OM', {
      style: 'currency',
      currency: 'OMR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar', { calendar: 'gregory', numberingSystem: 'latn', 
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'property': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'auction': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'customer': return 'bg-green-100 text-green-800 border-green-200';
      case 'report': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'property': return <FiHome className="w-4 h-4" />;
      case 'auction': return <FiTrendingUp className="w-4 h-4" />;
      case 'customer': return <FiUsers className="w-4 h-4" />;
      case 'report': return <FiDownload className="w-4 h-4" />;
      default: return <FiHeart className="w-4 h-4" />;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'property': return 'عقار';
      case 'auction': return 'مزاد';
      case 'customer': return 'عميل';
      case 'report': return 'تقرير';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'rented': return 'bg-blue-100 text-blue-800';
      case 'reserved': return 'bg-yellow-100 text-yellow-800';
      case 'live': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'ended': return 'bg-gray-100 text-gray-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'متاح';
      case 'rented': return 'مؤجر';
      case 'reserved': return 'محجوز';
      case 'live': return 'مباشر';
      case 'upcoming': return 'قريباً';
      case 'ended': return 'انتهى';
      case 'active': return 'نشط';
      case 'inactive': return 'غير نشط';
      default: return status;
    }
  };

  const filteredFavorites = favorites.filter(favorite => {
    const matchesSearch = 
      favorite.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      favorite.itemDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      favorite.itemLocation?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || favorite.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const sortedFavorites = [...filteredFavorites].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'addedAt':
        aValue = new Date(a.addedAt);
        bValue = new Date(b.addedAt);
        break;
      case 'itemName':
        aValue = a.itemName;
        bValue = b.itemName;
        break;
      case 'itemPrice':
        aValue = a.itemPrice || 0;
        bValue = b.itemPrice || 0;
        break;
      default:
        aValue = new Date(a.addedAt);
        bValue = new Date(b.addedAt);
    }

    if (sortOrder === 'desc') {
      return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
    } else {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    }
  });

  const handleSelectFavorite = (favoriteId: string) => {
    setSelectedFavorites(prev => 
      prev.includes(favoriteId) 
        ? prev.filter(id => id !== favoriteId)
        : [...prev, favoriteId]
    );
  };

  const handleSelectAll = () => {
    if (selectedFavorites.length === sortedFavorites.length) {
      setSelectedFavorites([]);
    } else {
      setSelectedFavorites(sortedFavorites.map(favorite => favorite.id));
    }
  };

  const removeFavorite = async (favoriteId: string) => {
    try {
      const response = await fetch(`/api/favorites/${favoriteId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setFavorites(prev => prev.filter(f => f.id !== favoriteId));
        setSelectedFavorites(prev => prev.filter(id => id !== favoriteId));
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const removeSelectedFavorites = async () => {
    try {
      const response = await fetch('/api/favorites/batch', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: selectedFavorites }),
      });
      
      if (response.ok) {
        setFavorites(prev => prev.filter(f => !selectedFavorites.includes(f.id)));
        setSelectedFavorites([]);
      }
    } catch (error) {
      console.error('Error removing selected favorites:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>المفضلة - عين عُمان</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">المفضلة</h1>
                <p className="mt-1 text-sm text-gray-500">
                  العناصر المفضلة لديك
                </p>
              </div>
              <div className="flex space-x-3 rtl:space-x-reverse">
                {selectedFavorites.length > 0 && (
                  <button
                    onClick={removeSelectedFavorites}
                    className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    <FiTrash2 className="w-4 h-4 ml-2" />
                    حذف المحدد ({selectedFavorites.length})
                  </button>
                )}
                <button className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
                  <FiDownload className="w-4 h-4 ml-2" />
                  تصدير
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* فلاتر البحث */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">البحث</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="اسم العنصر، الوصف، الموقع..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">النوع</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">جميع الأنواع</option>
                  <option value="property">عقارات</option>
                  <option value="auction">مزادات</option>
                  <option value="customer">عملاء</option>
                  <option value="report">تقارير</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ترتيب حسب</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="addedAt">تاريخ الإضافة</option>
                  <option value="itemName">اسم العنصر</option>
                  <option value="itemPrice">السعر</option>
                </select>
              </div>
              
              <div className="flex items-end space-x-2 rtl:space-x-reverse">
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  <FiSortAsc className={`w-4 h-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                </button>
                <button
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  {viewMode === 'grid' ? '📋' : '⊞'}
                </button>
              </div>
            </div>
          </div>

          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <FiHeart className="w-6 h-6 text-red-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">إجمالي المفضلة</p>
                  <p className="text-2xl font-bold text-gray-900">{favorites.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FiHome className="w-6 h-6 text-blue-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">عقارات</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {favorites.filter(f => f.type === 'property').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FiTrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">مزادات</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {favorites.filter(f => f.type === 'auction').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FiUsers className="w-6 h-6 text-green-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">عملاء</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {favorites.filter(f => f.type === 'customer').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* قائمة المفضلة */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedFavorites.map((favorite) => (
                <div key={favorite.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  {/* صورة العنصر */}
                  <div className="relative h-48 bg-gray-200">
                    {favorite.itemImage ? (
                      <img
                        src={favorite.itemImage}
                        alt={favorite.itemName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        {getTypeIcon(favorite.type)}
                      </div>
                    )}
                    
                    {/* نوع العنصر */}
                    <div className="absolute top-3 right-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(favorite.type)}`}>
                        {getTypeIcon(favorite.type)}
                        <span className="mr-1">{getTypeText(favorite.type)}</span>
                      </span>
                    </div>

                    {/* زر الحذف */}
                    <button
                      onClick={() => removeFavorite(favorite.id)}
                      className="absolute top-3 left-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* محتوى البطاقة */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{favorite.itemName}</h3>
                    <p className="text-sm text-gray-600 mb-2">{favorite.itemDescription}</p>
                    
                    {favorite.itemLocation && (
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <FiMapPin className="w-4 h-4 ml-1" />
                        {favorite.itemLocation}
                      </div>
                    )}

                    {favorite.itemPrice && (
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <FiDollarSign className="w-4 h-4 ml-1" />
                        {formatCurrency(favorite.itemPrice)}
                      </div>
                    )}

                    {favorite.itemStatus && (
                      <div className="mb-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(favorite.itemStatus)}`}>
                          {getStatusText(favorite.itemStatus)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <FiCalendar className="w-4 h-4 ml-1" />
                        {formatDate(favorite.addedAt)}
                      </div>
                    </div>

                    {/* أزرار الإجراءات */}
                    <div className="flex items-center justify-between">
                      <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-center transition-colors">
                        <FiEye className="w-4 h-4 ml-1 inline" />
                        عرض التفاصيل
                      </button>
                      <div className="flex space-x-2 rtl:space-x-reverse mr-3">
                        <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                          <FiShare2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">المفضلة</h2>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <input
                      type="checkbox"
                      checked={selectedFavorites.length === sortedFavorites.length && sortedFavorites.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-500">تحديد الكل</span>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        العنصر
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        النوع
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        السعر
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الحالة
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        تاريخ الإضافة
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedFavorites.map((favorite) => (
                      <tr key={favorite.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedFavorites.includes(favorite.id)}
                            onChange={() => handleSelectFavorite(favorite.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center ml-4">
                              {favorite.itemImage ? (
                                <img
                                  src={favorite.itemImage}
                                  alt={favorite.itemName}
                                  className="h-12 w-12 object-cover rounded-lg"
                                />
                              ) : (
                                getTypeIcon(favorite.type)
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{favorite.itemName}</div>
                              <div className="text-sm text-gray-500">{favorite.itemDescription}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(favorite.type)}`}>
                            {getTypeIcon(favorite.type)}
                            <span className="mr-1">{getTypeText(favorite.type)}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {favorite.itemPrice ? formatCurrency(favorite.itemPrice) : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {favorite.itemStatus && (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(favorite.itemStatus)}`}>
                              {getStatusText(favorite.itemStatus)}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(favorite.addedAt)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <button className="text-blue-600 hover:text-blue-900 p-1" title="عرض">
                              <FiEye className="w-4 h-4" />
                            </button>
                            <button className="text-gray-400 hover:text-blue-500 p-1" title="مشاركة">
                              <FiShare2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => removeFavorite(favorite.id)}
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
              </div>
            </div>
          )}

          {sortedFavorites.length === 0 && (
            <div className="text-center py-12">
              <FiHeart className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد عناصر مفضلة</h3>
              <p className="mt-1 text-sm text-gray-500">
                ابدأ بإضافة عناصر إلى المفضلة لسهولة الوصول إليها لاحقاً.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
