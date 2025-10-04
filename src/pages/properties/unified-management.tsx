// صفحة موحدة لإدارة العقارات والوحدات - تصميم احترافي مع الذكاء الاصطناعي
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import {
  FaBuilding, FaHome, FaEye, FaEdit, FaTrash, FaPlus, FaSearch,
  FaFilter, FaSort, FaChevronDown, FaChevronUp, FaExpand,
  FaArchive, FaGlobe, FaEyeSlash, FaChartLine, FaRobot,
  FaMapMarkerAlt, FaBed, FaBath, FaRuler, FaTag, FaCalendar,
  FaUser, FaPhone, FaEnvelope, FaCog, FaDownload, FaPrint,
  FaShare, FaHeart, FaStar, FaCheck, FaTimes, FaExclamationTriangle,
  FaInfoCircle, FaQuestionCircle, FaLightbulb, FaMagic,
  FaArrowUp, FaArrowDown, FaEquals, FaClock, FaHistory
} from 'react-icons/fa';

interface Property {
  id: string;
  referenceNo?: string;
  titleAr?: string;
  titleEn?: string;
  title?: string | { ar?: string; en?: string };
  type?: string;
  usageType?: string;
  purpose?: string;
  buildingType?: 'single' | 'multi';
  priceOMR?: number;
  rentalPrice?: number;
  province?: string;
  state?: string;
  city?: string;
  address?: string;
  beds?: number | string;
  baths?: number | string;
  area?: number | string;
  floors?: number | string;
  totalUnits?: number | string;
  totalArea?: number | string;
  status?: 'vacant' | 'reserved' | 'leased' | 'hidden' | 'draft';
  published?: boolean;
  createdAt?: string;
  updatedAt?: string;
  units?: Unit[];
  images?: string[];
  coverImage?: string;
  coverIndex?: number;
  amenities?: string[];
  customAmenities?: string[];
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  notes?: string;
  surveyNumber?: string;
  landNumber?: string;
  latitude?: string;
  longitude?: string;
  mapAddress?: string;
}

interface Unit {
  id: string;
  unitNo: string;
  unitNumber?: string;
  propertyId: string;
  floor?: number;
  area: number | string;
  beds?: number | string;
  bedrooms?: number;
  baths?: number | string;
  bathrooms?: number;
  type: string;
  status: 'available' | 'rented' | 'maintenance' | 'reserved' | 'vacant' | 'leased';
  price?: number | string;
  rentalPrice?: number | string;
  monthlyRent?: number;
  deposit?: number | string;
  tenantId?: string;
  tenantName?: string;
  leaseStartDate?: string;
  leaseEndDate?: string;
  features?: string[];
  amenities?: string[];
  images: string[];
  description?: string;
  halls?: string;
  majlis?: string;
  videoUrl?: string;
  paymentMethods?: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'individual' | 'company';
}

export default function UnifiedPropertyManagement() {
  const [activeTab, setActiveTab] = useState<'properties' | 'units' | 'customers'>('properties');
  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedBuildingType, setSelectedBuildingType] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedProperties, setExpandedProperties] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProperties, setSelectedProperties] = useState<Set<string>>(new Set());

  // جلب البيانات
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [propertiesRes, unitsRes, customersRes] = await Promise.all([
        fetch('/api/properties'),
        fetch('/api/admin/units'),
        fetch('/api/customers')
      ]);

      if (propertiesRes.ok) {
        const propertiesData = await propertiesRes.json();
        setProperties(propertiesData.items || []);
      }

      if (unitsRes.ok) {
        const unitsData = await unitsRes.json();
        setUnits(unitsData.units || []);
      }

      if (customersRes.ok) {
        const customersData = await customersRes.json();
        setCustomers(customersData.customers || []);
      }

      // توليد رؤى الذكاء الاصطناعي
      generateAIInsights();
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // توليد رؤى الذكاء الاصطناعي
  const generateAIInsights = () => {
    const insights = {
      totalProperties: properties.length,
      totalUnits: units.length,
      totalCustomers: customers.length,
      publishedProperties: properties.filter(p => p.published).length,
      draftProperties: properties.filter(p => !p.published).length,
      vacantProperties: properties.filter(p => p.status === 'vacant').length,
      leasedProperties: properties.filter(p => p.status === 'leased').length,
      multiUnitBuildings: properties.filter(p => p.buildingType === 'multi').length,
      singleUnitProperties: properties.filter(p => p.buildingType === 'single').length,
      averagePrice: properties.reduce((sum, p) => sum + (p.priceOMR || 0), 0) / properties.length || 0,
      topLocation: getTopLocation(),
      recommendations: generateRecommendations()
    };
    setAiInsights(insights);
  };

  const getTopLocation = () => {
    const locations = properties.reduce((acc, p) => {
      const location = `${p.province} - ${p.state}`;
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(locations).sort(([,a], [,b]) => b - a)[0]?.[0] || 'غير محدد';
  };

  const generateRecommendations = () => {
    const recommendations = [];
    
    if (properties.filter(p => !p.published).length > 0) {
      recommendations.push({
        type: 'warning',
        message: `لديك ${properties.filter(p => !p.published).length} عقار غير منشور. يُنصح بنشرها لزيادة الوضوح.`,
        action: 'نشر العقارات'
      });
    }
    
    if (properties.filter(p => p.status === 'vacant').length > 5) {
      recommendations.push({
        type: 'info',
        message: `لديك ${properties.filter(p => p.status === 'vacant').length} عقار شاغر. يُنصح بتحديث الأسعار أو تحسين التسويق.`,
        action: 'تحسين التسويق'
      });
    }
    
    if (units.length === 0 && properties.filter(p => p.buildingType === 'multi').length > 0) {
      recommendations.push({
        type: 'error',
        message: 'لديك مباني متعددة الوحدات بدون وحدات محددة. يُنصح بإضافة تفاصيل الوحدات.',
        action: 'إضافة الوحدات'
      });
    }
    
    return recommendations;
  };

  // وظائف التعامل مع العقارات
  const togglePropertyExpansion = (propertyId: string) => {
    const newExpanded = new Set(expandedProperties);
    if (newExpanded.has(propertyId)) {
      newExpanded.delete(propertyId);
    } else {
      newExpanded.add(propertyId);
    }
    setExpandedProperties(newExpanded);
  };

  const togglePropertySelection = (propertyId: string) => {
    const newSelected = new Set(selectedProperties);
    if (newSelected.has(propertyId)) {
      newSelected.delete(propertyId);
    } else {
      newSelected.add(propertyId);
    }
    setSelectedProperties(newSelected);
  };

  const togglePropertyPublish = async (propertyId: string, published: boolean) => {
    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !published })
      });
      
      if (response.ok) {
        setProperties(prev => prev.map(p => 
          p.id === propertyId ? { ...p, published: !published } : p
        ));
        generateAIInsights();
      }
    } catch (error) {
      console.error('Error updating property:', error);
    }
  };

  const archiveProperty = async (propertyId: string) => {
    if (confirm('هل أنت متأكد من أرشفة هذا العقار؟')) {
      try {
        const response = await fetch(`/api/properties/${propertyId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'hidden' })
        });
        
        if (response.ok) {
          setProperties(prev => prev.map(p => 
            p.id === propertyId ? { ...p, status: 'hidden' } : p
          ));
          generateAIInsights();
        }
      } catch (error) {
        console.error('Error archiving property:', error);
      }
    }
  };

  // فلترة وترتيب البيانات
  const getFilteredData = () => {
    let data: any[] = [];
    
    switch (activeTab) {
      case 'properties':
        data = properties;
        break;
      case 'units':
        data = units;
        break;
      case 'customers':
        data = customers;
        break;
    }

    // فلترة حسب البحث
    if (searchTerm) {
      data = data.filter(item => {
        if (activeTab === 'properties') {
          const title = getTitleFromProperty(item);
          return title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 item.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 item.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 item.referenceNo?.toLowerCase().includes(searchTerm.toLowerCase());
        } else if (activeTab === 'units') {
          return item.unitNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 item.unitNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 item.propertyId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 item.tenantName?.toLowerCase().includes(searchTerm.toLowerCase());
        } else if (activeTab === 'customers') {
          return item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 item.phone?.toLowerCase().includes(searchTerm.toLowerCase());
        }
        return false;
      });
    }

    // فلترة حسب الحالة
    if (selectedStatus) {
      data = data.filter(item => item.status === selectedStatus);
    }

    // فلترة حسب النوع
    if (selectedType) {
      data = data.filter(item => item.type === selectedType);
    }

    // فلترة حسب نوع المبنى
    if (selectedBuildingType) {
      data = data.filter(item => item.buildingType === selectedBuildingType);
    }

    // ترتيب البيانات
    data.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return data;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'vacant':
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800';
      case 'leased':
      case 'rented':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-orange-100 text-orange-800';
      case 'hidden':
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'vacant':
        return 'شاغر';
      case 'reserved':
        return 'محجوز';
      case 'leased':
        return 'مؤجر';
      case 'hidden':
        return 'مخفي';
      case 'draft':
        return 'مسودة';
      case 'available':
        return 'متاح';
      case 'rented':
        return 'مؤجر';
      case 'maintenance':
        return 'صيانة';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-OM');
  };

  const getTitle = (title: Property['title']) => {
    if (typeof title === 'string') return title;
    if (typeof title === 'object' && title) {
      return title.ar || title.en || '';
    }
    return '';
  };

  const getTitleFromProperty = (property: Property) => {
    // أولوية لـ titleAr/titleEn
    if (property.titleAr) return property.titleAr;
    if (property.titleEn) return property.titleEn;
    // ثم title object
    if (property.title) {
      if (typeof property.title === 'string') return property.title;
      if (typeof property.title === 'object' && property.title) {
        return property.title.ar || property.title.en || '';
      }
    }
    return `العقار ${property.id}`;
  };

  const getPropertyUnits = (propertyId: string) => {
    return units.filter(unit => unit.propertyId === propertyId);
  };

  const getUnitStatusColor = (status: string) => {
    switch (status) {
      case 'available':
      case 'vacant':
        return 'bg-green-100 text-green-800';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800';
      case 'rented':
      case 'leased':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUnitStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'متاح';
      case 'vacant':
        return 'شاغر';
      case 'reserved':
        return 'محجوز';
      case 'rented':
        return 'مؤجر';
      case 'leased':
        return 'مؤجر';
      case 'maintenance':
        return 'صيانة';
      default:
        return status;
    }
  };

  const getCoverImage = (property: Property) => {
    if (property.coverImage) return property.coverImage;
    if (property.images && property.images.length > 0) {
      const index = property.coverIndex || 0;
      return property.images[index] || property.images[0];
    }
    return '';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-OM', {
      style: 'currency',
      currency: 'OMR'
    }).format(price);
  };

  return (
    <Layout>
      <Head>
        <title>إدارة العقارات والوحدات - عين عُمان</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <FaBuilding className="ml-3 text-blue-600" />
                  إدارة العقارات والوحدات
                </h1>
                <p className="text-gray-600 mt-2 flex items-center">
                  <FaRobot className="ml-2 text-purple-500" />
                  نظام إدارة ذكي ومتطور للعقارات والوحدات
                </p>
              </div>
              <div className="flex space-x-3">
                <Link
                  href="/properties/new"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center"
                >
                  <FaPlus className="ml-2" />
                  إضافة عقار
                </Link>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center"
                >
                  <FaFilter className="ml-2" />
                  {showFilters ? 'إخفاء الفلاتر' : 'عرض الفلاتر'}
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 mt-6">
              {[
                { id: 'properties', label: 'العقارات', icon: '🏢', count: properties.length },
                { id: 'units', label: 'الوحدات', icon: '🏠', count: units.length },
                { id: 'customers', label: 'العملاء', icon: '👥', count: customers.length }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg mr-2">{tab.icon}</span>
                  {tab.label}
                  <span className={`text-xs px-3 py-1 rounded-full ml-2 ${
                    activeTab === tab.id 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* AI Insights Dashboard */}
          {aiInsights && (
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-xl shadow-xl p-6 mb-6 text-white border border-blue-500/20">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold flex items-center mb-2">
                    <div className="bg-white/20 p-2 rounded-lg ml-3">
                      <FaRobot className="text-2xl" />
                    </div>
                    مركز الذكاء الاصطناعي
                  </h2>
                  <p className="text-blue-100 text-sm">تحليل ذكي وإحصائيات متقدمة لعقاراتك</p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={generateAIInsights}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg transition-all duration-300 flex items-center border border-white/20 hover:border-white/40"
                    title="تحديث جميع الإحصائيات والتحليلات"
                  >
                    <FaMagic className="ml-2" />
                    تحديث الرؤى
                  </button>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg transition-all duration-300 flex items-center border border-white/20 hover:border-white/40"
                    title="عرض/إخفاء الفلاتر المتقدمة"
                  >
                    <FaFilter className="ml-2" />
                    {showFilters ? 'إخفاء الفلاتر' : 'عرض الفلاتر'}
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 hover:bg-white/30 transition-all duration-300 group cursor-pointer" title="إجمالي عدد العقارات في النظام">
                  <div className="bg-blue-500/30 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                    <FaBuilding className="text-xl" />
                  </div>
                  <div className="text-3xl font-bold mb-1">{aiInsights.totalProperties}</div>
                  <div className="text-sm text-blue-100">إجمالي العقارات</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 hover:bg-white/30 transition-all duration-300 group cursor-pointer" title="العقارات المنشورة والمتاحة للجمهور">
                  <div className="bg-green-500/30 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                    <FaGlobe className="text-xl" />
                  </div>
                  <div className="text-3xl font-bold mb-1">{aiInsights.publishedProperties}</div>
                  <div className="text-sm text-blue-100">منشور</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 hover:bg-white/30 transition-all duration-300 group cursor-pointer" title="العقارات المحفوظة كمسودات">
                  <div className="bg-yellow-500/30 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                    <FaEyeSlash className="text-xl" />
                  </div>
                  <div className="text-3xl font-bold mb-1">{aiInsights.draftProperties}</div>
                  <div className="text-sm text-blue-100">مسودة</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 hover:bg-white/30 transition-all duration-300 group cursor-pointer" title="المباني التي تحتوي على وحدات متعددة">
                  <div className="bg-purple-500/30 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                    <FaHome className="text-xl" />
                  </div>
                  <div className="text-3xl font-bold mb-1">{aiInsights.multiUnitBuildings}</div>
                  <div className="text-sm text-blue-100">مباني متعددة</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 hover:bg-white/30 transition-all duration-300 group cursor-pointer" title="العقارات المتاحة للإيجار أو البيع">
                  <div className="bg-orange-500/30 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                    <FaTag className="text-xl" />
                  </div>
                  <div className="text-3xl font-bold mb-1">{aiInsights.vacantProperties}</div>
                  <div className="text-sm text-blue-100">شاغر</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 hover:bg-white/30 transition-all duration-300 group cursor-pointer" title="العقارات المؤجرة حالياً">
                  <div className="bg-indigo-500/30 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                    <FaCheck className="text-xl" />
                  </div>
                  <div className="text-3xl font-bold mb-1">{aiInsights.leasedProperties}</div>
                  <div className="text-sm text-blue-100">مؤجر</div>
                </div>
              </div>

              {/* Smart Recommendations */}
              {aiInsights.recommendations && aiInsights.recommendations.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <div className="bg-yellow-500/30 p-2 rounded-lg ml-3">
                      <FaLightbulb className="text-xl" />
                    </div>
                    التوصيات الذكية
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {aiInsights.recommendations.map((rec: any, index: number) => (
                      <div key={index} className={`bg-white/20 backdrop-blur-sm rounded-xl p-4 border transition-all duration-300 hover:bg-white/30 ${
                        rec.type === 'error' ? 'border-red-400/50' :
                        rec.type === 'warning' ? 'border-yellow-400/50' :
                        'border-blue-400/50'
                      }`}>
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${
                            rec.type === 'error' ? 'bg-red-500/30' :
                            rec.type === 'warning' ? 'bg-yellow-500/30' :
                            'bg-blue-500/30'
                          }`}>
                            {rec.type === 'error' && <FaExclamationTriangle className="text-red-300" />}
                            {rec.type === 'warning' && <FaExclamationTriangle className="text-yellow-300" />}
                            {rec.type === 'info' && <FaInfoCircle className="text-blue-300" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-white/90 mb-3">{rec.message}</p>
                            <button className="bg-white/30 hover:bg-white/40 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-white/20 hover:border-white/40">
                              {rec.action}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <div className="bg-green-500/30 p-2 rounded-lg ml-3">
                    <FaMagic className="text-xl" />
                  </div>
                  إجراءات سريعة
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button 
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-lg transition-all duration-300 border border-white/20 hover:border-white/40 flex items-center justify-center space-x-2"
                    title="إضافة عقار جديد"
                  >
                    <FaPlus className="text-lg" />
                    <span className="text-sm font-medium">عقار جديد</span>
                  </button>
                  <button 
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-lg transition-all duration-300 border border-white/20 hover:border-white/40 flex items-center justify-center space-x-2"
                    title="نشر جميع المسودات"
                  >
                    <FaGlobe className="text-lg" />
                    <span className="text-sm font-medium">نشر المسودات</span>
                  </button>
                  <button 
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-lg transition-all duration-300 border border-white/20 hover:border-white/40 flex items-center justify-center space-x-2"
                    title="تصدير تقرير شامل"
                  >
                    <FaDownload className="text-lg" />
                    <span className="text-sm font-medium">تصدير تقرير</span>
                  </button>
                  <button 
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-lg transition-all duration-300 border border-white/20 hover:border-white/40 flex items-center justify-center space-x-2"
                    title="طباعة قائمة العقارات"
                  >
                    <FaPrint className="text-lg" />
                    <span className="text-sm font-medium">طباعة</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          {showFilters && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FaFilter className="ml-2 text-blue-600" />
                  فلاتر البحث المتقدمة
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors flex items-center"
                  >
                    {viewMode === 'grid' ? <FaExpand className="ml-1" /> : <FaSort className="ml-1" />}
                    {viewMode === 'grid' ? 'عرض شبكي' : 'عرض قائمة'}
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <FaSearch className="ml-1" />
                    البحث
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="ابحث في العقارات..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <FaTag className="ml-1" />
                    الحالة
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">جميع الحالات</option>
                    {activeTab === 'properties' && (
                      <>
                        <option value="vacant">شاغر</option>
                        <option value="reserved">محجوز</option>
                        <option value="leased">مؤجر</option>
                        <option value="hidden">مخفي</option>
                        <option value="draft">مسودة</option>
                      </>
                    )}
                    {activeTab === 'units' && (
                      <>
                        <option value="available">متاح</option>
                        <option value="rented">مؤجر</option>
                        <option value="maintenance">صيانة</option>
                        <option value="reserved">محجوز</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <FaBuilding className="ml-1" />
                    النوع
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">جميع الأنواع</option>
                    {activeTab === 'properties' && (
                      <>
                        <option value="apartment">شقة</option>
                        <option value="villa">فيلا</option>
                        <option value="office">مكتب</option>
                        <option value="shop">محل</option>
                        <option value="land">أرض</option>
                      </>
                    )}
                    {activeTab === 'units' && (
                      <>
                        <option value="apartment">شقة</option>
                        <option value="villa">فيلا</option>
                        <option value="office">مكتب</option>
                        <option value="shop">محل</option>
                        <option value="warehouse">مستودع</option>
                      </>
                    )}
                    {activeTab === 'customers' && (
                      <>
                        <option value="individual">فرد</option>
                        <option value="company">شركة</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <FaSort className="ml-1" />
                    ترتيب حسب
                  </label>
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split('-');
                      setSortBy(field);
                      setSortOrder(order as 'asc' | 'desc');
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="createdAt-desc">الأحدث أولاً</option>
                    <option value="createdAt-asc">الأقدم أولاً</option>
                    <option value="updatedAt-desc">آخر تحديث</option>
                    <option value="title-asc">الاسم (أ-ي)</option>
                    <option value="title-desc">الاسم (ي-أ)</option>
                    {activeTab !== 'customers' && (
                      <>
                        <option value="priceOMR-desc">السعر (الأعلى)</option>
                        <option value="priceOMR-asc">السعر (الأقل)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Building Type Filter for Properties */}
              {activeTab === 'properties' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <FaHome className="ml-1" />
                    نوع المبنى
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="buildingType"
                        value=""
                        checked={selectedBuildingType === ''}
                        onChange={(e) => setSelectedBuildingType(e.target.value)}
                        className="ml-2"
                      />
                      جميع الأنواع
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="buildingType"
                        value="single"
                        checked={selectedBuildingType === 'single'}
                        onChange={(e) => setSelectedBuildingType(e.target.value)}
                        className="ml-2"
                      />
                      وحيد الوحدة
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="buildingType"
                        value="multi"
                        checked={selectedBuildingType === 'multi'}
                        onChange={(e) => setSelectedBuildingType(e.target.value)}
                        className="ml-2"
                      />
                      متعدد الوحدات
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Properties Display */}
          {activeTab === 'properties' && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">جاري التحميل...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  {/* Table Header */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <FaBuilding className="ml-2 text-blue-600" />
                        قائمة العقارات
                      </h3>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-600">
                          {getFilteredData().length} من {properties.length} عقار
                        </span>
                        <button
                          onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center text-sm"
                          title={viewMode === 'grid' ? 'التبديل إلى العرض الشبكي' : 'التبديل إلى عرض القائمة'}
                        >
                          {viewMode === 'grid' ? <FaExpand className="ml-1" /> : <FaSort className="ml-1" />}
                          {viewMode === 'grid' ? 'عرض شبكي' : 'عرض قائمة'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Table View */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            العقار
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            النوع
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            الموقع
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            السعر
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            الحالة
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            النشر
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            الإجراءات
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {getFilteredData().map((property: Property) => (
                          <tr key={property.id} className="hover:bg-gray-50 transition-colors duration-200">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 ml-3">
                                  {getCoverImage(property) ? (
                                    <img
                                      className="w-full h-full object-cover"
                                      src={getCoverImage(property)}
                                      alt={getTitleFromProperty(property)}
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                      <FaBuilding className="text-lg" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-gray-900">
                                    <Link 
                                      href={`/properties/${property.id}`}
                                      className="hover:text-blue-600 transition-colors"
                                      title="عرض تفاصيل العقار"
                                    >
                                      {getTitleFromProperty(property)}
                                    </Link>
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {property.referenceNo || property.id}
                                  </div>
                                  {property.buildingType === 'multi' && (
                                    <div className="flex items-center text-xs text-blue-600 mt-1">
                                      <FaBuilding className="ml-1" />
                                      متعدد الوحدات
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{property.type}</div>
                              {property.usageType && (
                                <div className="text-xs text-gray-500">{property.usageType}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center text-sm text-gray-900">
                                <FaMapMarkerAlt className="ml-1 text-gray-400" />
                                {property.province && property.state && `${property.province} - ${property.state}`}
                              </div>
                              {property.city && (
                                <div className="text-xs text-gray-500">{property.city}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {property.priceOMR ? (
                                <div className="text-sm font-medium text-blue-600">
                                  {formatPrice(property.priceOMR)}
                                </div>
                              ) : (
                                <div className="text-sm text-gray-400">غير محدد</div>
                              )}
                              {property.rentalPrice && (
                                <div className="text-xs text-gray-500">
                                  إيجار: {formatPrice(property.rentalPrice)}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(property.status || '')}`}>
                                {getStatusLabel(property.status || '')}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {property.published ? (
                                <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                  <FaGlobe className="ml-1" />
                                  منشور
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                  <FaEyeSlash className="ml-1" />
                                  مسودة
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <Link
                                  href={`/properties/${property.id}`}
                                  className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                                  title="عرض تفاصيل العقار"
                                >
                                  <FaEye />
                                </Link>
                                <Link
                                  href={`/properties/${property.id}/edit`}
                                  className="text-green-600 hover:text-green-900 p-1 rounded transition-colors"
                                  title="تعديل العقار"
                                >
                                  <FaEdit />
                                </Link>
                                <Link
                                  href={`/property/${property.id}/admin`}
                                  className="text-purple-600 hover:text-purple-900 p-1 rounded transition-colors"
                                  title="إدارة العقار"
                                >
                                  <FaCog />
                                </Link>
                                <button
                                  onClick={() => togglePropertyPublish(property.id, property.published || false)}
                                  className={`p-1 rounded transition-colors ${
                                    property.published 
                                      ? 'text-orange-600 hover:text-orange-900' 
                                      : 'text-green-600 hover:text-green-900'
                                  }`}
                                  title={property.published ? 'إلغاء نشر العقار' : 'نشر العقار'}
                                >
                                  {property.published ? <FaEyeSlash /> : <FaGlobe />}
                                </button>
                                <button
                                  onClick={() => archiveProperty(property.id)}
                                  className="text-gray-600 hover:text-gray-900 p-1 rounded transition-colors"
                                  title="أرشفة العقار"
                                >
                                  <FaArchive />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {getFilteredData().length === 0 && (
                    <div className="text-center py-12">
                      <FaBuilding className="text-6xl text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد عقارات</h3>
                      <p className="text-gray-500 mb-6">ابدأ بإضافة عقار جديد</p>
                      <Link
                        href="/properties/new"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
                        title="إضافة عقار جديد"
                      >
                        <FaPlus className="ml-2" />
                        إضافة عقار جديد
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Grid View (Alternative) */}
          {activeTab === 'properties' && viewMode === 'grid' && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getFilteredData().map((property: Property) => (
                    <div key={property.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden">
                      {/* Property Image */}
                      <div className="relative h-48 bg-gray-200">
                        {getCoverImage(property) ? (
                          <img
                            src={getCoverImage(property)}
                            alt={getTitleFromProperty(property)}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <FaBuilding className="text-4xl" />
                          </div>
                        )}
                        
                        {/* Status Badge */}
                        <div className="absolute top-3 right-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(property.status || '')}`}>
                            {getStatusLabel(property.status || '')}
                          </span>
                        </div>

                        {/* Building Type Badge */}
                        {property.buildingType === 'multi' && (
                          <div className="absolute top-3 left-3">
                            <span className="bg-blue-600 text-white px-2 py-1 text-xs font-semibold rounded-full flex items-center">
                              <FaBuilding className="ml-1" />
                              متعدد الوحدات
                            </span>
                          </div>
                        )}

                        {/* Published Status */}
                        <div className="absolute bottom-3 right-3">
                          {property.published ? (
                            <span className="bg-green-600 text-white px-2 py-1 text-xs font-semibold rounded-full flex items-center">
                              <FaGlobe className="ml-1" />
                              منشور
                            </span>
                          ) : (
                            <span className="bg-gray-600 text-white px-2 py-1 text-xs font-semibold rounded-full flex items-center">
                              <FaEyeSlash className="ml-1" />
                              مسودة
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Property Details */}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              <Link 
                                href={`/properties/${property.id}`}
                                className="hover:text-blue-600 transition-colors"
                                title="عرض تفاصيل العقار"
                              >
                                {getTitleFromProperty(property)}
                              </Link>
                            </h3>
                            <p className="text-sm text-gray-500 mb-2">
                              {property.referenceNo || property.id}
                            </p>
                            <div className="flex items-center text-sm text-gray-600 mb-2">
                              <FaMapMarkerAlt className="ml-1" />
                              {property.province && property.state && `${property.province} - ${property.state}`}
                            </div>
                          </div>
                        </div>

                        {/* Property Info */}
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          {property.type && (
                            <div className="flex items-center text-sm text-gray-600">
                              <FaBuilding className="ml-1" />
                              {property.type}
                            </div>
                          )}
                          {property.area && (
                            <div className="flex items-center text-sm text-gray-600">
                              <FaRuler className="ml-1" />
                              {property.area} م²
                            </div>
                          )}
                          {property.beds && (
                            <div className="flex items-center text-sm text-gray-600">
                              <FaBed className="ml-1" />
                              {property.beds} غرف
                            </div>
                          )}
                          {property.baths && (
                            <div className="flex items-center text-sm text-gray-600">
                              <FaBath className="ml-1" />
                              {property.baths} حمامات
                            </div>
                          )}
                        </div>

                        {/* Price */}
                        {property.priceOMR && (
                          <div className="text-lg font-bold text-blue-600 mb-4">
                            {formatPrice(property.priceOMR)}
                          </div>
                        )}

                        {/* Multi-unit indicator */}
                        {property.buildingType === 'multi' && (
                          <div className="mb-4">
                            <button
                              onClick={() => togglePropertyExpansion(property.id)}
                              className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
                              title="عرض/إخفاء وحدات المبنى"
                            >
                              <span className="ml-2">
                                {expandedProperties.has(property.id) ? 'إخفاء الوحدات' : 'عرض الوحدات'}
                              </span>
                              {expandedProperties.has(property.id) ? <FaChevronUp /> : <FaChevronDown />}
                            </button>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex space-x-2">
                          <Link
                            href={`/properties/${property.id}`}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                            title="عرض تفاصيل العقار"
                          >
                            <FaEye className="ml-1" />
                            عرض
                          </Link>
                          <Link
                            href={`/properties/${property.id}/edit`}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                            title="تعديل العقار"
                          >
                            <FaEdit className="ml-1" />
                            تعديل
                          </Link>
                          <Link
                            href={`/property/${property.id}/admin`}
                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                            title="إدارة العقار"
                          >
                            <FaCog className="ml-1" />
                            إدارة
                          </Link>
                        </div>
                      </div>

                      {/* Units List (if expanded) */}
                      {property.buildingType === 'multi' && expandedProperties.has(property.id) && (
                        <div className="border-t border-gray-200 p-4 bg-gray-50">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">وحدات المبنى</h4>
                          <div className="space-y-2">
                            {getPropertyUnits(property.id).map((unit) => (
                              <div key={unit.id} className="bg-white rounded-lg p-3 border border-gray-200">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="font-medium text-sm">{unit.unitNo || unit.unitNumber}</div>
                                    <div className="text-xs text-gray-500">
                                      {unit.area} م² • {unit.beds} غرف • {unit.baths} حمامات
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUnitStatusColor(unit.status)}`}>
                                      {getUnitStatusLabel(unit.status)}
                                    </span>
                                    {unit.rentalPrice && (
                                      <span className="text-sm font-medium text-blue-600">
                                        {formatPrice(Number(unit.rentalPrice))}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                            {getPropertyUnits(property.id).length === 0 && (
                              <div className="text-center text-gray-500 text-sm py-4">
                                لا توجد وحدات محددة لهذا المبنى
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Smart Suggestions */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <div className="bg-green-500/20 p-2 rounded-lg ml-3">
                  <FaLightbulb className="text-green-600" />
                </div>
                اقتراحات ذكية
              </h3>
              <button
                onClick={() => generateSmartSuggestions()}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center text-sm"
                title="تحديث الاقتراحات الذكية"
              >
                <FaMagic className="ml-2" />
                تحديث
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border border-green-200 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-2">
                  <FaChartLine className="text-blue-600 ml-2" />
                  <h4 className="font-medium text-gray-900">تحليل الأداء</h4>
                </div>
                <p className="text-sm text-gray-600 mb-3">تحليل أداء عقاراتك ومقارنتها بالسوق</p>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  عرض التحليل →
                </button>
              </div>
              <div className="bg-white rounded-lg p-4 border border-green-200 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-2">
                  <FaTag className="text-green-600 ml-2" />
                  <h4 className="font-medium text-gray-900">تحسين الأسعار</h4>
                </div>
                <p className="text-sm text-gray-600 mb-3">اقتراحات لتحسين أسعار العقارات</p>
                <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                  عرض الاقتراحات →
                </button>
              </div>
              <div className="bg-white rounded-lg p-4 border border-green-200 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-2">
                  <FaGlobe className="text-purple-600 ml-2" />
                  <h4 className="font-medium text-gray-900">تحسين التسويق</h4>
                </div>
                <p className="text-sm text-gray-600 mb-3">نصائح لتحسين عرض العقارات</p>
                <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">
                  عرض النصائح →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <FaBuilding className="text-4xl" />
                              </div>
                            )}
                            
                            {/* Status Badge */}
                            <div className="absolute top-3 right-3">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(property.status || '')}`}>
                                {getStatusLabel(property.status || '')}
                              </span>
                            </div>

                            {/* Building Type Badge */}
                            {property.buildingType === 'multi' && (
                              <div className="absolute top-3 left-3">
                                <span className="bg-blue-600 text-white px-2 py-1 text-xs font-semibold rounded-full flex items-center">
                                  <FaBuilding className="ml-1" />
                                  متعدد الوحدات
                                </span>
                              </div>
                            )}

                            {/* Published Status */}
                            <div className="absolute bottom-3 right-3">
                              {property.published ? (
                                <span className="bg-green-600 text-white px-2 py-1 text-xs font-semibold rounded-full flex items-center">
                                  <FaGlobe className="ml-1" />
                                  منشور
                                </span>
                              ) : (
                                <span className="bg-gray-600 text-white px-2 py-1 text-xs font-semibold rounded-full flex items-center">
                                  <FaEyeSlash className="ml-1" />
                                  مسودة
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Property Details */}
                          <div className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                  <Link 
                                    href={`/properties/${property.id}`}
                                    className="hover:text-blue-600 transition-colors"
                                  >
                                    {getTitleFromProperty(property)}
                                  </Link>
                                </h3>
                                <p className="text-sm text-gray-500 mb-2">
                                  {property.referenceNo || property.id}
                                </p>
                                <div className="flex items-center text-sm text-gray-600 mb-2">
                                  <FaMapMarkerAlt className="ml-1" />
                                  {property.province && property.state && `${property.province} - ${property.state}`}
                                </div>
                              </div>
                            </div>

                            {/* Property Info */}
                            <div className="grid grid-cols-2 gap-2 mb-4">
                              {property.type && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <FaBuilding className="ml-1" />
                                  {property.type}
                                </div>
                              )}
                              {property.area && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <FaRuler className="ml-1" />
                                  {property.area} م²
                                </div>
                              )}
                              {property.beds && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <FaBed className="ml-1" />
                                  {property.beds} غرف
                                </div>
                              )}
                              {property.baths && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <FaBath className="ml-1" />
                                  {property.baths} حمامات
                                </div>
                              )}
                            </div>

                            {/* Price */}
                            {property.priceOMR && (
                              <div className="text-lg font-bold text-blue-600 mb-4">
                                {formatPrice(property.priceOMR)}
                              </div>
                            )}

                            {/* Multi-unit indicator */}
                            {property.buildingType === 'multi' && (
                              <div className="mb-4">
                                <button
                                  onClick={() => togglePropertyExpansion(property.id)}
                                  className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
                                >
                                  <span className="ml-2">
                                    {expandedProperties.has(property.id) ? 'إخفاء الوحدات' : 'عرض الوحدات'}
                                  </span>
                                  {expandedProperties.has(property.id) ? <FaChevronUp /> : <FaChevronDown />}
                                </button>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex space-x-2">
                              <Link
                                href={`/properties/${property.id}`}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                              >
                                <FaEye className="ml-1" />
                                عرض
                              </Link>
                              <Link
                                href={`/properties/${property.id}/edit`}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                              >
                                <FaEdit className="ml-1" />
                                تعديل
                              </Link>
                              <button
                                onClick={() => togglePropertyPublish(property.id, property.published || false)}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center ${
                                  property.published 
                                    ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                                    : 'bg-green-600 hover:bg-green-700 text-white'
                                }`}
                              >
                                {property.published ? <FaEyeSlash className="ml-1" /> : <FaGlobe className="ml-1" />}
                                {property.published ? 'إلغاء النشر' : 'نشر'}
                              </button>
                              <button
                                onClick={() => archiveProperty(property.id)}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                              >
                                <FaArchive className="ml-1" />
                                أرشفة
                              </button>
                            </div>
                          </div>

                          {/* Units List (if expanded) */}
                          {property.buildingType === 'multi' && expandedProperties.has(property.id) && (
                            <div className="border-t border-gray-200 p-4 bg-gray-50">
                              <h4 className="text-sm font-semibold text-gray-700 mb-3">وحدات المبنى</h4>
                              <div className="space-y-2">
                                {getPropertyUnits(property.id).map((unit) => (
                                  <div key={unit.id} className="bg-white rounded-lg p-3 border border-gray-200">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <div className="font-medium text-sm">{unit.unitNo || unit.unitNumber}</div>
                                        <div className="text-xs text-gray-500">
                                          {unit.area} م² • {unit.beds} غرف • {unit.baths} حمامات
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUnitStatusColor(unit.status)}`}>
                                          {getUnitStatusLabel(unit.status)}
                                        </span>
                                        {unit.rentalPrice && (
                                          <span className="text-sm font-medium text-blue-600">
                                            {formatPrice(Number(unit.rentalPrice))}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                {getPropertyUnits(property.id).length === 0 && (
                                  <div className="text-center text-gray-500 text-sm py-4">
                                    لا توجد وحدات محددة لهذا المبنى
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    // List View
                    <div className="space-y-4">
                      {getFilteredData().map((property: Property) => (
                        <div key={property.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center space-x-4">
                            {/* Image */}
                            <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                              {getCoverImage(property) ? (
                                <img
                                  src={getCoverImage(property)}
                                  alt={getTitleFromProperty(property)}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <FaBuilding className="text-xl" />
                                </div>
                              )}
                            </div>

                            {/* Details */}
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900">
                                    <Link 
                                      href={`/properties/${property.id}`}
                                      className="hover:text-blue-600 transition-colors"
                                    >
                                      {getTitleFromProperty(property)}
                                    </Link>
                                  </h3>
                                  <p className="text-sm text-gray-500">{property.referenceNo || property.id}</p>
                                  <div className="flex items-center text-sm text-gray-600 mt-1">
                                    <FaMapMarkerAlt className="ml-1" />
                                    {property.province && property.state && `${property.province} - ${property.state}`}
                                  </div>
                                </div>
                                <div className="text-right">
                                  {property.priceOMR && (
                                    <div className="text-lg font-bold text-blue-600">
                                      {formatPrice(property.priceOMR)}
                                    </div>
                                  )}
                                  <div className="flex items-center space-x-2 mt-2">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(property.status || '')}`}>
                                      {getStatusLabel(property.status || '')}
                                    </span>
                                    {property.published ? (
                                      <span className="bg-green-100 text-green-800 px-2 py-1 text-xs font-semibold rounded-full">
                                        منشور
                                      </span>
                                    ) : (
                                      <span className="bg-gray-100 text-gray-800 px-2 py-1 text-xs font-semibold rounded-full">
                                        مسودة
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex space-x-2">
                              <Link
                                href={`/properties/${property.id}`}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
                              >
                                <FaEye className="ml-1" />
                                عرض
                              </Link>
                              <Link
                                href={`/properties/${property.id}/edit`}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
                              >
                                <FaEdit className="ml-1" />
                                تعديل
                              </Link>
                              <button
                                onClick={() => togglePropertyPublish(property.id, property.published || false)}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                                  property.published 
                                    ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                                    : 'bg-green-600 hover:bg-green-700 text-white'
                                }`}
                              >
                                {property.published ? <FaEyeSlash className="ml-1" /> : <FaGlobe className="ml-1" />}
                              </button>
                              <button
                                onClick={() => archiveProperty(property.id)}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
                              >
                                <FaArchive className="ml-1" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {getFilteredData().length === 0 && (
                    <div className="text-center py-12">
                      <FaBuilding className="text-6xl text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد عقارات</h3>
                      <p className="text-gray-500 mb-6">ابدأ بإضافة عقار جديد</p>
                      <Link
                        href="/properties/new"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
                      >
                        <FaPlus className="ml-2" />
                        إضافة عقار جديد
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
