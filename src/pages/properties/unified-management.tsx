// @ts-nocheck
// صفحة موحدة لإدارة العقارات والوحدات - تصميم احترافي مع الذكاء الاصطناعي
import React, { useState, useEffect, useMemo } from 'react';
import InstantImage from '@/components/InstantImage';
import Head from 'next/head';
import InstantLink from '@/components/InstantLink';
import BuildingUnitsManager from '@/components/property/BuildingUnitsManager';

import { FaBuilding, FaHome, FaEye, FaEdit, FaTrash, FaPlus, FaSearch, FaFilter, FaSort, FaChevronDown, FaChevronUp, FaExpand, FaArchive, FaGlobe, FaEyeSlash, FaChartLine, FaRobot, FaMapMarkerAlt, FaBed, FaBath, FaRuler, FaTag, FaCalendar, FaUser, FaPhone, FaEnvelope, FaCog, FaDownload, FaPrint, FaShare, FaHeart, FaStar, FaCheck, FaTimes, FaExclamationTriangle, FaInfoCircle, FaQuestionCircle, FaLightbulb, FaArrowUp, FaArrowDown, FaEquals, FaClock, FaHistory, FaDatabase, FaFileContract, FaReceipt, FaUsers, FaToolbox, FaFileAlt, FaDollarSign, FaExclamationCircle } from 'react-icons/fa';
import StatsOverview from '@/components/dashboard/StatsOverview';
import RentalStatusChart from '@/components/dashboard/RentalStatusChart';
import { useSession } from 'next-auth/react';
import { useBookings } from '@/context/BookingsContext';

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
  const { data: session } = useSession();
  const { bookings: allBookings, loading: bookingsLoading } = useBookings();
  const [activeTab, setActiveTab] = useState<'properties' | 'units' | 'customers' | 'rentals' | 'bookings' | 'tenants' | 'services' | 'documents' | 'expenses' | 'overdue' | 'analytics'>('properties');
  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [rentals, setRentals] = useState<any[]>([]); // العقود المرتبطة بالعقارات
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedBuildingType, setSelectedBuildingType] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedProperties, setExpandedProperties] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid'); // افتراضي دائماً grid
  const [hasMounted, setHasMounted] = useState(false);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProperties, setSelectedProperties] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [showAIModal, setShowAIModal] = useState(false);
  const [isStatsCollapsed, setIsStatsCollapsed] = useState(false);
  
  // بيانات إضافية للإدارة
  const [services, setServices] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [overdueServices, setOverdueServices] = useState<any[]>([]);
  const [expiringDocuments, setExpiringDocuments] = useState<any[]>([]);
  const [tenantsCount, setTenantsCount] = useState(0);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  // استرجاع viewMode من localStorage بعد التحميل وحفظه عند التغيير
  useEffect(() => {
    setHasMounted(true);
    const savedViewMode = localStorage.getItem('properties-view-mode') as 'grid' | 'list';
    if (savedViewMode) {
      setViewMode(savedViewMode);
    }
  }, []);

  useEffect(() => {
    if (hasMounted) {
      localStorage.setItem('properties-view-mode', viewMode);
    }
  }, [viewMode, hasMounted]);

  // Bulk Actions Handler
  const handleBulkAction = async (action: string) => {
    if (selectedProperties.size === 0) {
      alert('لم يتم تحديد أي عقار');
      return;
    }

    const selectedIds = Array.from(selectedProperties);
    
    switch (action) {
      case 'delete':
        if (confirm(`هل أنت متأكد من حذف ${selectedIds.length} عقار؟`)) {
          selectedIds.forEach(id => deleteProperty(id));
          setSelectedProperties(new Set());
        }
        break;
      case 'publish':
        selectedIds.forEach(id => {
          const property = properties.find(p => p.id === id);
          if (property && !property.published) {
            togglePropertyPublish(id, false);
          }
        });
        setSelectedProperties(new Set());
        break;
      case 'unpublish':
        selectedIds.forEach(id => {
          const property = properties.find(p => p.id === id);
          if (property && property.published) {
            togglePropertyPublish(id, false);
          }
        });
        setSelectedProperties(new Set());
        break;
      case 'archive':
        selectedIds.forEach(id => togglePropertyPublish(id, false));
        setSelectedProperties(new Set());
        break;
      case 'export':
        const exportData = properties.filter(p => selectedIds.includes(p.id));
        const { exportToCSV, exportToExcel } = await import('@/lib/export');
        exportToCSV(exportData, 'properties');
        break;
      default:
        break;
    }
    setShowBulkActions(false);
  };

  // Toggle Select All
  const toggleSelectAll = () => {
    if (selectedProperties.size === filteredProperties.length) {
      setSelectedProperties(new Set());
    } else {
      setSelectedProperties(new Set(filteredProperties.map(p => p.id)));
    }
  };

  // Toggle Select Property
  const toggleSelectProperty = (id: string) => {
    const newSelected = new Set(selectedProperties);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedProperties(newSelected);
  };

  // جلب البيانات
  useEffect(() => {
    if (session?.user?.id) {
    fetchData();
    }
  }, [session?.user?.id]);

  // تحديث بيانات الإدارة عند فتح تبويباتها (للتحديث فقط)
  useEffect(() => {
    if (!session?.user?.id) return;
    const userId = session.user.id as string;

    const loadServices = async () => {
      try {
        const res = await fetch(`/api/property-services?ownerId=${encodeURIComponent(userId)}`);
        if (res.ok) {
          const data = await res.json();
          setServices(Array.isArray(data.services) ? data.services : []);
        }
      } catch {}
    };

    const loadDocuments = async () => {
      try {
        const res = await fetch(`/api/property-documents?ownerId=${encodeURIComponent(userId)}`);
        if (res.ok) {
          const data = await res.json();
          setDocuments(Array.isArray(data.documents) ? data.documents : []);
        }
      } catch {}
    };

    const loadExpenses = async () => {
      try {
        const res = await fetch(`/api/property-expenses?ownerId=${encodeURIComponent(userId)}`);
        if (res.ok) {
          const data = await res.json();
          setExpenses(Array.isArray(data.expenses) ? data.expenses : []);
        }
      } catch {}
    };

    const loadOverdue = async () => {
      try {
        const sRes = await fetch(`/api/property-services?ownerId=${encodeURIComponent(userId)}&overdue=true`);
        if (sRes.ok) {
          const sData = await sRes.json();
          setOverdueServices(Array.isArray(sData.services) ? sData.services : []);
        }
        const dRes = await fetch(`/api/property-documents?ownerId=${encodeURIComponent(userId)}&expiring=true`);
        if (dRes.ok) {
          const dData = await dRes.json();
          setExpiringDocuments(Array.isArray(dData.documents) ? dData.documents : []);
        }
      } catch {}
    };

    // تحديث البيانات عند فتح التبويب (للتحديث الفوري)
    if (activeTab === 'services') loadServices();
    if (activeTab === 'documents') loadDocuments();
    if (activeTab === 'expenses') loadExpenses();
    if (activeTab === 'overdue') loadOverdue();
  }, [activeTab, session]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const userId = session?.user?.id;
      
      // جلب جميع البيانات الأساسية
      const [propertiesRes, customersRes, rentalsRes, tenantsRes, usersRes] = await Promise.all([
        fetch('/api/properties'),
        fetch('/api/customers'),
        fetch('/api/rentals'),
        fetch('/api/admin/tenants'),
        fetch('/api/users')
      ]);

      if (propertiesRes.ok) {
        const propertiesData = await propertiesRes.json();
        const allProperties = propertiesData.items || [];
        setProperties(allProperties);
        
        // استخراج جميع الوحدات من العقارات
        const allUnits: Unit[] = [];
        allProperties.forEach((property: Property) => {
          if (property.units && Array.isArray(property.units)) {
            property.units.forEach((unit: Unit) => {
              allUnits.push({
                ...unit,
                propertyId: property.id
              });
            });
          }
        });
        setUnits(allUnits);
      }

      if (customersRes.ok) {
        const customersData = await customersRes.json();
        setCustomers(customersData.customers || []);
      }

      if (rentalsRes.ok) {
        const rentalsData = await rentalsRes.json();
        const allRentals = rentalsData.items || [];
        
        // إزالة التكرارات بناءً على id
        const uniqueRentals = allRentals.reduce((acc: any[], rental: any) => {
          const exists = acc.find(r => r.id === rental.id);
          if (!exists) {
            acc.push(rental);
          }
          return acc;
        }, []);
        
        setRentals(uniqueRentals);
        if (allRentals.length !== uniqueRentals.length) {
          console.log(`⚠️ تمت إزالة ${allRentals.length - uniqueRentals.length} عقد مكرر`);
        }
        
        // حساب عدد المستأجرين من العقود فقط (المصدر الحقيقي)
        // نستخدم Set لإزالة التكرار
        const uniqueTenants = new Set(
          allRentals
            .map((r: any) => r.tenantId || r.tenantName)
            .filter(Boolean)
        );
        setTenantsCount(uniqueTenants.size);
        console.log('✅ Tenants count from rentals:', uniqueTenants.size, 'unique tenants');
      }

      // جلب بيانات المستخدمين (للعرض الكامل للمستأجرين)
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        const users = Array.isArray(usersData.users) ? usersData.users : (Array.isArray(usersData) ? usersData : []);
        setAllUsers(users);
        console.log('✅ Users loaded for tenant display:', users.length);
      }

      // جلب بيانات الإدارة (services, documents, expenses) تلقائياً
      if (userId) {
        // جلب الخدمات
        try {
          const servicesRes = await fetch(`/api/property-services?ownerId=${encodeURIComponent(userId)}`);
          if (servicesRes.ok) {
            const servicesData = await servicesRes.json();
            setServices(Array.isArray(servicesData.services) ? servicesData.services : []);
          }
        } catch (e) {
          console.error('Error loading services:', e);
        }

        // جلب المستندات
        try {
          const documentsRes = await fetch(`/api/property-documents?ownerId=${encodeURIComponent(userId)}`);
          if (documentsRes.ok) {
            const documentsData = await documentsRes.json();
            setDocuments(Array.isArray(documentsData.documents) ? documentsData.documents : []);
          }
        } catch (e) {
          console.error('Error loading documents:', e);
        }

        // جلب المصاريف
        try {
          const expensesRes = await fetch(`/api/property-expenses?ownerId=${encodeURIComponent(userId)}`);
          if (expensesRes.ok) {
            const expensesData = await expensesRes.json();
            setExpenses(Array.isArray(expensesData.expenses) ? expensesData.expenses : []);
          }
        } catch (e) {
          console.error('Error loading expenses:', e);
        }

        // جلب المتأخرات
        try {
          const overdueServicesRes = await fetch(`/api/property-services?ownerId=${encodeURIComponent(userId)}&overdue=true`);
          if (overdueServicesRes.ok) {
            const overdueServicesData = await overdueServicesRes.json();
            setOverdueServices(Array.isArray(overdueServicesData.services) ? overdueServicesData.services : []);
          }
          
          const expiringDocumentsRes = await fetch(`/api/property-documents?ownerId=${encodeURIComponent(userId)}&expiring=true`);
          if (expiringDocumentsRes.ok) {
            const expiringDocumentsData = await expiringDocumentsRes.json();
            setExpiringDocuments(Array.isArray(expiringDocumentsData.documents) ? expiringDocumentsData.documents : []);
          }
        } catch (e) {
          console.error('Error loading overdue items:', e);
        }
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

  // وظيفة توليد الاقتراحات الذكية
  const generateSmartSuggestions = () => {
    // تحليل ذكي للعقارات
    const vacantProperties = properties.filter(p => p.status === 'vacant');
    const publishedProperties = properties.filter(p => p.published);
    const draftProperties = properties.filter(p => !p.published);
    
    // اقتراحات ذكية
    const suggestions = [];
    
    if (draftProperties.length > 0) {
      suggestions.push({
        type: 'publish',
        title: 'نشر المسودات',
        description: `لديك ${draftProperties.length} عقار محفوظ كمسودة. نشرها سيزيد من وضوحك في السوق.`,
        action: () => {
          // نشر جميع المسودات
          draftProperties.forEach(property => {
            togglePropertyPublish(property.id, false);
          });
        }
      });
    }
    
    if (vacantProperties.length > 3) {
      suggestions.push({
        type: 'pricing',
        title: 'مراجعة الأسعار',
        description: `لديك ${vacantProperties.length} عقار شاغر. قد تحتاج لمراجعة الأسعار أو تحسين العرض.`,
        action: () => {
          // فتح صفحة مراجعة الأسعار
          window.open('/admin/pricing-analysis', '_blank');
        }
      });
    }
    
    if (properties.filter(p => !p.images || p.images.length === 0).length > 0) {
      suggestions.push({
        type: 'media',
        title: 'تحسين الصور',
        description: 'بعض العقارات لا تحتوي على صور. إضافة صور عالية الجودة ستحسن من جاذبية العقارات.',
        action: () => {
          // فتح صفحة إدارة الصور
          window.open('/admin/media-management', '_blank');
        }
      });
    }
    
    return suggestions;
  };

  // وظيفة نشر جميع المسودات
  const publishAllDrafts = async () => {
    const draftProperties = properties.filter(p => !p.published);
    
    if (draftProperties.length === 0) {
      alert('لا توجد مسودات للنشر');
      return;
    }

    if (confirm(`هل تريد نشر ${draftProperties.length} عقار محفوظ كمسودة؟`)) {
      try {
        const promises = draftProperties.map(property => 
          fetch(`/api/properties/${property.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ published: true })
          })
        );

        await Promise.all(promises);
        
        // تحديث الحالة المحلية
        setProperties(prev => prev.map(p => 
          !p.published ? { ...p, published: true } : p
        ));
        
        generateAIInsights();
        alert(`تم نشر ${draftProperties.length} عقار بنجاح!`);
      } catch (error) {
        console.error('Error publishing drafts:', error);
        alert('حدث خطأ أثناء نشر المسودات');
      }
    }
  };

  // وظيفة تصدير التقرير
  const exportReport = () => {
    const reportData = {
      generatedAt: new Date().toLocaleString('ar', { calendar: 'gregory', numberingSystem: 'latn' }),
      summary: {
        totalProperties: properties.length,
        publishedProperties: properties.filter(p => p.published).length,
        draftProperties: properties.filter(p => !p.published).length,
        vacantProperties: properties.filter(p => p.status === 'vacant').length,
        leasedProperties: properties.filter(p => p.status === 'leased').length,
        multiUnitBuildings: properties.filter(p => p.buildingType === 'multi').length
      },
      properties: properties.map(property => ({
        id: property.id,
        title: getTitleFromProperty(property),
        type: property.type,
        status: property.status,
        published: property.published,
        price: property.priceOMR,
        location: `${property.province} - ${property.state}`,
        createdAt: property.createdAt
      }))
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `properties-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // وظيفة طباعة قائمة العقارات
  const printPropertiesList = () => {
    const printWindow = window.open('', '_blank');
    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>قائمة العقارات - عين عُمان</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3B82F6; padding-bottom: 20px; }
          .header h1 { color: #1E40AF; margin: 0; }
          .header p { color: #6B7280; margin: 5px 0; }
          .summary { background: #F3F4F6; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
          .summary h2 { color: #374151; margin-top: 0; }
          .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
          .summary-item { background: white; padding: 15px; border-radius: 6px; text-align: center; }
          .summary-item .number { font-size: 24px; font-weight: bold; color: #3B82F6; }
          .summary-item .label { color: #6B7280; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { padding: 12px; text-align: right; border-bottom: 1px solid #E5E7EB; }
          th { background: #F9FAFB; font-weight: bold; color: #374151; }
          .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
          .status.published { background: #D1FAE5; color: #065F46; }
          .status.draft { background: #F3F4F6; color: #374151; }
          .status.vacant { background: #FEF3C7; color: #92400E; }
          .status.leased { background: #DBEAFE; color: #1E40AF; }
          .footer { margin-top: 30px; text-align: center; color: #6B7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>قائمة العقارات - عين عُمان</h1>
          <p>تقرير شامل لجميع العقارات</p>
          <p>تاريخ التقرير: ${new Date().toLocaleString('ar', { calendar: 'gregory', numberingSystem: 'latn' })}</p>
        </div>
        
        <div class="summary">
          <h2>ملخص الإحصائيات</h2>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="number">${properties.length}</div>
              <div class="label">إجمالي العقارات</div>
            </div>
            <div class="summary-item">
              <div class="number">${properties.filter(p => p.published).length}</div>
              <div class="label">منشور</div>
            </div>
            <div class="summary-item">
              <div class="number">${properties.filter(p => !p.published).length}</div>
              <div class="label">مسودة</div>
            </div>
            <div class="summary-item">
              <div class="number">${properties.filter(p => p.status === 'vacant').length}</div>
              <div class="label">شاغر</div>
            </div>
            <div class="summary-item">
              <div class="number">${properties.filter(p => p.status === 'leased').length}</div>
              <div class="label">مؤجر</div>
            </div>
            <div class="summary-item">
              <div class="number">${properties.filter(p => p.buildingType === 'multi').length}</div>
              <div class="label">مباني متعددة</div>
            </div>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>العقار</th>
              <th>النوع</th>
              <th>الموقع</th>
              <th>السعر</th>
              <th>الحالة</th>
              <th>النشر</th>
            </tr>
          </thead>
          <tbody>
            ${properties.map(property => `
              <tr>
                <td>${getTitleFromProperty(property)}</td>
                <td>${property.type || '-'}</td>
                <td>${property.province && property.state ? `${property.province} - ${property.state}` : '-'}</td>
                <td>${property.priceOMR ? formatPrice(property.priceOMR) : '-'}</td>
                <td><span class="status ${property.status || 'vacant'}">${getStatusLabel(property.status || '')}</span></td>
                <td><span class="status ${property.published ? 'published' : 'draft'}">${property.published ? 'منشور' : 'مسودة'}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>تم إنشاء هذا التقرير بواسطة نظام إدارة العقارات - عين عُمان</p>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
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

  // وظيفة تنسيق السعر
  const formatPrice = (price: number | string) => {
    if (!price) return '-';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('ar-OM', {
      style: 'currency',
      currency: 'OMR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numPrice);
  };

  // وظيفة للحصول على تفاصيل العقد المرتبط بالعقار
  const getRentalForProperty = (propertyId: string) => {
    return rentals.find(r => r.propertyId === propertyId && (r.state === 'active' || r.signatureWorkflow === 'active'));
  };

  // وظيفة لحساب عدد الأيام المتبقية على انتهاء العقد
  const getDaysRemaining = (rental: any) => {
    if (!rental || !rental.endDate) return null;
    
    const endDate = new Date(rental.endDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  // وظيفة الحصول على تسمية الحالة
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'vacant':
        return 'شاغر';
      case 'available':
        return 'متاح';
      case 'reserved':
        return 'محجوز';
      case 'leased':
        return 'مؤجر';
      case 'rented':
        return 'مؤجر';
      case 'maintenance':
        return 'صيانة';
      case 'hidden':
        return 'مخفي';
      case 'draft':
        return 'مسودة';
      case 'sold':
        return 'مباع';
      default:
        return status || 'غير محدد';
    }
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

  const deleteProperty = async (propertyId: string) => {
    if (confirm('⚠️ هل أنت متأكد من حذف هذا العقار نهائياً؟\nهذا الإجراء لا يمكن التراجع عنه!')) {
      try {
        const response = await fetch(`/api/properties/${propertyId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setProperties(prev => prev.filter(p => p.id !== propertyId));
          alert('✅ تم حذف العقار بنجاح');
          fetchData();
        } else {
          alert('❌ حدث خطأ أثناء حذف العقار');
        }
      } catch (error) {
        console.error('Error deleting property:', error);
        alert('❌ حدث خطأ أثناء حذف العقار');
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


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar', { calendar: 'gregory', numberingSystem: 'latn', timeZone: 'UTC' });
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

  // حساب الإحصائيات
  const stats = {
    totalProperties: properties.length,
    activeRentals: rentals.filter(r => {
      const state = (r as any).signatureWorkflow || r.state;
      return ["paid", "docs_submitted", "docs_verified", "active", "owner_signed", "tenant_signed"].includes(state);
    }).length,
    completedRentals: rentals.filter(r => {
      const state = (r as any).signatureWorkflow || r.state;
      return state === "handover_completed" || state === "active";
    }).length,
    pendingActions: rentals.filter(r => {
      const state = (r as any).signatureWorkflow || r.state;
      return ["reserved", "paid", "pending_owner_signature", "pending_tenant_signature", "pending_admin_approval"].includes(state);
    }).length
  };

  // دالة للحصول على تسمية حالة العقد
  const getStateLabel = (state: string): string => {
    const states: Record<string, string> = {
      "reserved": "محجوز",
      "paid": "مدفوع",
      "docs_submitted": "تم رفع المستندات",
      "docs_verified": "تم التحقق",
      "contract_generated": "تم إنشاء العقد",
      "tenant_signed": "تم توقيع المستأجر",
      "owner_signed": "تم توقيع المالك",
      "admin_approved": "اعتمد المشرف العام",
      "active": "مفعّل",
      "handover_completed": "تم التسليم",
      "pending_tenant_signature": "في انتظار توقيع المستأجر",
      "pending_owner_signature": "في انتظار توقيع المالك",
      "pending_admin_approval": "في انتظار موافقة الإدارة",
      "sent_for_signatures": "تم الإرسال للتوقيع",
      "rejected": "مرفوض",
      "draft": "مسودة"
    };
    return states[state] || state;
  };

  // دالة للحصول على userId
  const getUserId = (): string | null => {
    if (session?.user?.id) return session.user.id;
    if (typeof window !== "undefined") {
      const uid = localStorage.getItem("ao_uid") || localStorage.getItem("uid");
      if (uid) return uid;
    }
    return null;
  };

  // تصفية الحجوزات
  const ownerBookings = useMemo(() => {
    const userId = getUserId();
    if (!userId) return [];
    const filtered = allBookings.filter(b => 
      properties.some(p => p.id === b.propertyId)
    );
    return filtered.length === 0 ? allBookings : filtered;
  }, [allBookings, properties]);

  // حساب عدد المستأجرين من العقود (تم تحديثه في fetchData، هذا للتحقق فقط)
  useEffect(() => {
    const uniqueTenants = new Set(rentals.map(r => r.tenantId || r.tenantName).filter(Boolean));
    if (uniqueTenants.size !== tenantsCount) {
      setTenantsCount(uniqueTenants.size);
    }
  }, [rentals, tenantsCount]);


  return (
    <>
      <Head>
        <title>إدارة العقارات والوحدات - عين عُمان</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-4 mb-4 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsStatsCollapsed(!isStatsCollapsed)}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {isStatsCollapsed ? <FaChevronDown /> : <FaChevronUp />}
                </button>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 mb-1">لوحة تحكم إدارة العقار</h1>
                  <p className="text-sm text-gray-600">نظام شامل لإدارة العقارات والعقود والحجوزات</p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowAIModal(true);
                }}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <FaRobot className="text-sm" />
                <span className="text-sm">مركز الذكاء الاصطناعي</span>
              </button>
            </div>
            
            {/* الإحصائيات الرئيسية - مصغرة - قابلة للطي */}
            {!isStatsCollapsed && (
              <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-blue-50 rounded-lg p-3 border-r-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-xl font-bold">{stats.totalProperties}</span>
                </div>
                <div className="mt-1 text-xs text-gray-700">إجمالي العقارات</div>
              </div>
              <div className="bg-emerald-50 rounded-lg p-3 border-r-4 border-emerald-500">
                <div className="flex items-center justify-between">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xl font-bold">{stats.activeRentals}</span>
                </div>
                <div className="mt-1 text-xs text-gray-700">حجوزات نشطة</div>
              </div>
              <div className="bg-indigo-50 rounded-lg p-3 border-r-4 border-indigo-500">
                <div className="flex items-center justify-between">
                  <span className="inline-block w-2 h-2 rounded-full bg-indigo-500" />
                  <span className="text-xl font-bold">{stats.completedRentals}</span>
                </div>
                <div className="mt-1 text-xs text-gray-700">عقود مكتملة</div>
              </div>
              <div className="bg-amber-50 rounded-lg p-3 border-r-4 border-amber-500">
                <div className="flex items-center justify-between">
                  <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-xl font-bold">{stats.pendingActions}</span>
                </div>
                <div className="mt-1 text-xs text-gray-700">إجراءات معلّقة</div>
              </div>
            </div>
            
            {/* مخطط حالة العقود - مصغر */}
            <div className="mt-4 bg-white rounded-lg p-3 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold">حالة الطلبات</h3>
                <span className="text-xs text-gray-500">الإجمالي: {rentals.length}</span>
              </div>
              {rentals.length === 0 ? (
                <div className="text-center text-gray-400 text-xs py-2">لا توجد بيانات بعد</div>
              ) : (
                <div className="w-full h-2 rounded-full overflow-hidden bg-gray-100">
                  {(() => {
                    const buckets: Record<string, number> = {};
                    rentals.forEach(r => {
                      const state = (r as any).signatureWorkflow || r.state || 'pending';
                      buckets[state] = (buckets[state] || 0) + 1;
                    });
                    const total = rentals.length;
                    const entries = Object.entries(buckets).sort((a, b) => b[1] - a[1]);
                    return (
                      <div className="flex h-full">
                        {entries.map(([k]) => {
                          const colors: Record<string, string> = {
                            reserved: 'bg-blue-500',
                            paid: 'bg-indigo-500',
                            active: 'bg-green-600',
                            pending_owner_signature: 'bg-orange-500',
                            pending_tenant_signature: 'bg-yellow-500',
                          };
                          return (
                            <div
                              key={k}
                              className={colors[k] || 'bg-gray-400'}
                              style={{ width: `${(buckets[k] / total) * 100}%` }}
                            />
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
            </>
            )}
          </div>

          {/* Modal مركز الذكاء الاصطناعي */}
          {showAIModal && (
            <div className="fixed inset-0 z-50 overflow-y-auto" onClick={() => setShowAIModal(false)}>
              <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* خلفية معتمة */}
                <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
                
                {/* النافذة المنبثقة */}
                <div 
                  className="inline-block align-bottom bg-white rounded-lg text-right overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 px-6 py-4 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-white/20 p-2 rounded-lg ml-3">
                          <FaRobot className="text-xl" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold">مركز الذكاء الاصطناعي</h2>
                          <p className="text-sm text-blue-100">تحليلات وإحصائيات ذكية</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowAIModal(false);
                        }}
                        className="bg-white/20 hover:bg-white/30 rounded-lg p-2 transition-colors"
                      >
                        <FaTimes className="text-xl" />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="bg-white p-6 max-h-[70vh] overflow-y-auto">
                    {aiInsights ? (
                      <>
                        {/* الإحصائيات */}
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
                          <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
                            <div className="bg-blue-500/30 w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2">
                              <FaBuilding className="text-blue-600" />
                            </div>
                            <div className="text-xl font-bold text-gray-900">{aiInsights.totalProperties}</div>
                            <div className="text-xs text-gray-600">إجمالي</div>
                          </div>
                          <div className="bg-green-50 rounded-lg p-3 text-center border border-green-200">
                            <div className="bg-green-500/30 w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2">
                              <FaGlobe className="text-green-600" />
                            </div>
                            <div className="text-xl font-bold text-gray-900">{aiInsights.publishedProperties}</div>
                            <div className="text-xs text-gray-600">منشور</div>
                          </div>
                          <div className="bg-yellow-50 rounded-lg p-3 text-center border border-yellow-200">
                            <div className="bg-yellow-500/30 w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2">
                              <FaEyeSlash className="text-yellow-600" />
                            </div>
                            <div className="text-xl font-bold text-gray-900">{aiInsights.draftProperties}</div>
                            <div className="text-xs text-gray-600">مسودة</div>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-3 text-center border border-purple-200">
                            <div className="bg-purple-500/30 w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2">
                              <FaHome className="text-purple-600" />
                            </div>
                            <div className="text-xl font-bold text-gray-900">{aiInsights.multiUnitBuildings}</div>
                            <div className="text-xs text-gray-600">متعدد</div>
                          </div>
                          <div className="bg-orange-50 rounded-lg p-3 text-center border border-orange-200">
                            <div className="bg-orange-500/30 w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2">
                              <FaTag className="text-orange-600" />
                            </div>
                            <div className="text-xl font-bold text-gray-900">{aiInsights.vacantProperties}</div>
                            <div className="text-xs text-gray-600">شاغر</div>
                          </div>
                          <div className="bg-indigo-50 rounded-lg p-3 text-center border border-indigo-200">
                            <div className="bg-indigo-500/30 w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2">
                              <FaCheck className="text-indigo-600" />
                            </div>
                            <div className="text-xl font-bold text-gray-900">{aiInsights.leasedProperties}</div>
                            <div className="text-xs text-gray-600">مؤجر</div>
                          </div>
                        </div>

                        {/* التوصيات الذكية */}
                        {aiInsights.recommendations && aiInsights.recommendations.length > 0 && (
                          <div className="mb-4">
                            <h3 className="text-md font-semibold mb-3 flex items-center text-gray-900">
                              <FaLightbulb className="ml-2 text-yellow-500" />
                              التوصيات الذكية
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {aiInsights.recommendations.map((rec: any, index: number) => (
                                <div key={index} className={`rounded-lg p-3 border-2 ${
                                  rec.type === 'error' ? 'bg-red-50 border-red-200' :
                                  rec.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                                  'bg-blue-50 border-blue-200'
                                }`}>
                                  <div className="flex items-start">
                                    <div className={`p-1.5 rounded-lg ml-2 ${
                                      rec.type === 'error' ? 'bg-red-100' :
                                      rec.type === 'warning' ? 'bg-yellow-100' :
                                      'bg-blue-100'
                                    }`}>
                                      {rec.type === 'error' && <FaExclamationTriangle className="text-red-600 text-sm" />}
                                      {rec.type === 'warning' && <FaExclamationTriangle className="text-yellow-600 text-sm" />}
                                      {rec.type === 'info' && <FaInfoCircle className="text-blue-600 text-sm" />}
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-sm text-gray-800 mb-2">{rec.message}</p>
                                      <button className="bg-white hover:bg-gray-50 px-3 py-1 rounded text-xs font-medium border border-gray-300">
                                        {rec.action}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* الإجراءات السريعة */}
                        <div>
                          <h3 className="text-md font-semibold mb-3 flex items-center text-gray-900">
                            <FaStar className="ml-2 text-green-500" />
                            إجراءات سريعة
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <InstantLink 
                              href="/properties/new"
                              className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-3 transition-colors flex items-center justify-center gap-2"
                            >
                              <FaPlus className="text-blue-600" />
                              <span className="text-sm font-medium text-blue-900">عقار جديد</span>
                            </InstantLink>
                            <button 
                              onClick={publishAllDrafts}
                              className="bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg p-3 transition-colors flex items-center justify-center gap-2"
                            >
                              <FaGlobe className="text-green-600" />
                              <span className="text-sm font-medium text-green-900">نشر المسودات</span>
                            </button>
                            <button 
                              onClick={exportReport}
                              className="bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg p-3 transition-colors flex items-center justify-center gap-2"
                            >
                              <FaDownload className="text-purple-600" />
                              <span className="text-sm font-medium text-purple-900">تصدير تقرير</span>
                            </button>
                            <button 
                              onClick={printPropertiesList}
                              className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-3 transition-colors flex items-center justify-center gap-2"
                            >
                              <FaPrint className="text-gray-600" />
                              <span className="text-sm font-medium text-gray-900">طباعة</span>
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <FaRobot className="text-6xl text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">جاري تحميل البيانات...</p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="bg-gray-50 px-6 py-3 flex justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAIModal(false);
                      }}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      إغلاق
                    </button>
                    {aiInsights && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          generateAIInsights();
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors mr-2"
                      >
                        تحديث البيانات
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Header الرئيسي */}
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
                <InstantLink 
                  href="/properties/new"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center"
                >
                  <FaPlus className="ml-2" />
                  إضافة عقار
                </InstantLink>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center"
                >
                  <FaFilter className="ml-2" />
                  {showFilters ? 'إخفاء الفلاتر' : 'عرض الفلاتر'}
                </button>
              </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedProperties.size > 0 && (
              <div className="mt-4 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FaCheck className="text-blue-600 text-xl" />
                    <span className="font-bold text-gray-900">
                      تم تحديد {selectedProperties.size} عقار
                    </span>
                    <button
                      onClick={() => setSelectedProperties(new Set())}
                      className="text-sm text-red-600 hover:text-red-700 underline"
                    >
                      إلغاء التحديد
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBulkAction('publish')}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition flex items-center gap-2"
                    >
                      <FaGlobe />
                      نشر
                    </button>
                    <button
                      onClick={() => handleBulkAction('unpublish')}
                      className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition flex items-center gap-2"
                    >
                      <FaEyeSlash />
                      إخفاء
                    </button>
                    <button
                      onClick={() => handleBulkAction('export')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition flex items-center gap-2"
                    >
                      <FaDownload />
                      تصدير
                    </button>
                    <button
                      onClick={() => handleBulkAction('delete')}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition flex items-center gap-2"
                    >
                      <FaTrash />
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* قسم إشعارات العقود التي تحتاج للتوقيع */}
            {(() => {
              // فلترة العقود التي تحتاج للتوقيع وإزالة التكرارات
              const pendingContracts = rentals
                .filter((r: any) => {
                  const state = r.signatureWorkflow || r.state;
                  return state && state !== 'active' && state !== 'cancelled' && state !== 'expired' && 
                         ['sent_for_signatures', 'pending_tenant_signature', 'pending_owner_signature', 'pending_admin_approval', 'draft', 'reserved'].includes(state);
                })
                .reduce((acc: any[], contract: any) => {
                  // إزالة التكرارات بناءً على id
                  const exists = acc.find(c => c.id === contract.id);
                  if (!exists) {
                    acc.push(contract);
                  }
                  return acc;
                }, []);

              if (pendingContracts.length === 0) return null;

              return (
                <div className="mt-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-5 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                        <FaFileContract className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">عقود تحتاج للتوقيع</h2>
                        <p className="text-sm text-gray-600">
                          {pendingContracts.length} {pendingContracts.length === 1 ? 'عقد' : 'عقود'} في انتظار التوقيع
                        </p>
                      </div>
                    </div>
                    <InstantLink
                      href="/contracts/sign"
                      className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors text-sm flex items-center gap-2"
                    >
                      <FaFileContract className="w-4 h-4" />
                      عرض الكل
                    </InstantLink>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {pendingContracts.slice(0, 3).map((contract: any) => {
                      const signatures = contract.signatures || [];
                      const hasTenantSign = signatures.some((s: any) => s.type === 'tenant');
                      const hasOwnerSign = signatures.some((s: any) => s.type === 'owner');
                      const hasAdminSign = signatures.some((s: any) => s.type === 'admin');
                      const state = contract.signatureWorkflow || contract.state;
                      
                      return (
                        <InstantLink
                          key={contract.id}
                          href={`/contracts/sign?contractId=${contract.id}`}
                          className="block bg-white border border-yellow-200 hover:border-yellow-400 rounded-xl p-4 transition-all shadow-sm hover:shadow-md"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-900 text-sm mb-1">
                                العقد #{contract.id?.split('-')[1]?.substring(0, 8) || contract.id?.slice(-8)}
                              </h3>
                              <p className="text-xs text-gray-600">
                                {contract.tenantName || 'مستأجر غير محدد'}
                              </p>
                            </div>
                            <span className="text-sm font-bold text-gray-900">
                              {contract.monthlyRent || 0} {contract.currency || 'OMR'}
                            </span>
                          </div>
                          
                          <div className="mt-3 space-y-1">
                            <div className="flex items-center gap-2 text-xs">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center ${hasTenantSign ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                {hasTenantSign ? '✓' : '○'}
                              </span>
                              <span className={hasTenantSign ? 'text-green-700 font-medium' : 'text-gray-500'}>
                                المستأجر
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center ${hasOwnerSign ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                {hasOwnerSign ? '✓' : '○'}
                              </span>
                              <span className={hasOwnerSign ? 'text-green-700 font-medium' : 'text-gray-500'}>
                                المالك
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center ${hasAdminSign ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                {hasAdminSign ? '✓' : '○'}
                              </span>
                              <span className={hasAdminSign ? 'text-green-700 font-medium' : 'text-gray-500'}>
                                الإدارة
                              </span>
                            </div>
                          </div>
                          
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              state === 'pending_tenant_signature' ? 'bg-yellow-100 text-yellow-800' :
                              state === 'pending_owner_signature' ? 'bg-orange-100 text-orange-800' :
                              state === 'pending_admin_approval' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {getStateLabel(state)}
                            </span>
                          </div>
                        </InstantLink>
                      );
                    })}
                  </div>
                  {pendingContracts.length > 3 && (
                    <div className="mt-3 text-center">
                      <InstantLink
                        href="/contracts/sign"
                        className="text-sm text-yellow-700 hover:text-yellow-800 font-medium"
                      >
                        + {pendingContracts.length - 3} عقود أخرى
                      </InstantLink>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Tabs */}
            <div className="border-b border-gray-200 mt-6">
              <nav className="-mb-px flex space-x-8 overflow-x-auto">
                {[
                  { id: 'properties', label: 'العقارات', icon: FaBuilding, count: properties.length },
                  { id: 'units', label: 'الوحدات', icon: FaHome, count: units.length },
                  { id: 'rentals', label: 'عقود الإيجار', icon: FaFileContract, count: rentals.length },
                  { id: 'bookings', label: 'الحجوزات', icon: FaCalendar, count: ownerBookings.length },
                  { id: 'tenants', label: 'المستأجرين', icon: FaUsers, count: tenantsCount },
                  { id: 'customers', label: 'العملاء', icon: FaUser, count: customers.length },
                  { id: 'services', label: 'الخدمات', icon: FaToolbox, count: services.length },
                  { id: 'documents', label: 'المستندات', icon: FaFileAlt, count: documents.length },
                  { id: 'expenses', label: 'المصاريف', icon: FaDollarSign, count: expenses.length },
                  { id: 'overdue', label: 'المتأخرات', icon: FaExclamationCircle, count: (overdueServices.length + expiringDocuments.length) },
                  { id: 'analytics', label: 'التحليلات', icon: FaChartLine, count: 0 }
                ].map(tab => {
                  const IconComponent = tab.icon;
                  return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                      className={`py-4 px-1 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
                    activeTab === tab.id
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                      <IconComponent className="w-4 h-4" />
                  {tab.label}
                      {tab.count > 0 && (
                        <span className="py-0.5 px-2 text-xs bg-gray-100 rounded-full">
                    {tab.count}
                  </span>
                      )}
                  </button>
                  );
                })}
              </nav>
                </div>
              </div>

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
                    suppressHydrationWarning
                  >
                    {viewMode === 'list' ? <FaExpand className="ml-1" /> : <FaSort className="ml-1" />}
                    <span suppressHydrationWarning>
                      {viewMode === 'list' ? 'عرض شبكي' : 'عرض قائمة'}
                    </span>
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

          {/* Properties Display - List View */}
          {activeTab === 'properties' && viewMode === 'list' && (
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
                          title={viewMode === 'list' ? 'التبديل إلى العرض الشبكي' : 'التبديل إلى عرض القائمة'}
                          suppressHydrationWarning
                        >
                          {viewMode === 'list' ? <FaExpand className="ml-1" /> : <FaSort className="ml-1" />}
                          <span suppressHydrationWarning>
                            {viewMode === 'list' ? 'عرض شبكي' : 'عرض قائمة'}
                          </span>
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
                          <React.Fragment key={property.id}>
                          <tr className="hover:bg-gray-50 transition-colors duration-200">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 ml-3">
                                  {getCoverImage(property) ? (
                                    <img className="w-full h-full object-cover"
                                      src={getCoverImage(property)}
                                      alt={getTitleFromProperty(property)}
                                     loading="lazy" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                      <FaBuilding className="text-lg" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-gray-900">
                                    <InstantLink 
                                      href={`/properties/${property.id}`}
                                      className="hover:text-blue-600 transition-colors"
                                      title="عرض تفاصيل العقار"
                                    >
                                      {getTitleFromProperty(property)}
                                    </InstantLink>
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
                                <InstantLink 
                                  href={`/properties/${property.id}`}
                                  className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                                  title="عرض تفاصيل العقار"
                                >
                                  <FaEye />
                                </InstantLink>
                                <InstantLink 
                                  href={`/properties/${property.id}/edit`}
                                  className="text-green-600 hover:text-green-900 p-1 rounded transition-colors"
                                  title="تعديل العقار"
                                >
                                  <FaEdit />
                                </InstantLink>
                                <InstantLink 
                                  href={`/property/${property.id}/admin`}
                                  className="text-purple-600 hover:text-purple-900 p-1 rounded transition-colors"
                                  title="إدارة العقار"
                                >
                                  <FaCog />
                                </InstantLink>
                                <InstantLink 
                                  href={`/properties/${property.id}/additional`}
                                  className="text-indigo-600 hover:text-indigo-900 p-1 rounded transition-colors"
                                  title="البيانات الإضافية (حسابات الخدمات والمستندات)"
                                >
                                  <FaDatabase />
                                </InstantLink>
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
                                <button
                                  onClick={() => deleteProperty(property.id)}
                                  className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                                  title="حذف العقار نهائياً"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </td>
                          </tr>
                          
                          {/* Building Units Manager in List View */}
                          {property.buildingType === 'multi' && (
                            <tr>
                              <td colSpan={7} className="px-0 py-0">
                                <BuildingUnitsManager
                                  property={property}
                                  onDeleteUnit={async (unitId) => {
                                    console.log('Delete unit:', unitId);
                                    // تحديث محلي فقط بدون إعادة تحميل الصفحة
                                    setProperties(prev => prev.map(p => 
                                      p.id === property.id 
                                        ? { ...p, units: p.units?.filter(u => u.id !== unitId) || [] }
                                        : p
                                    ));
                                  }}
                                  onEditUnit={(unitId) => {
                                    console.log('Edit unit:', unitId);
                                  }}
                                  onViewUnit={(unitId) => {
                                    console.log('View unit:', unitId);
                                  }}
                                  onArchiveUnit={async (unitId) => {
                                    console.log('Archive unit:', unitId);
                                    // تحديث محلي فقط بدون إعادة تحميل الصفحة
                                    setProperties(prev => prev.map(p => 
                                      p.id === property.id 
                                        ? { ...p, units: p.units?.map(u => 
                                            u.id === unitId ? { ...u, status: 'archived', published: false } : u
                                          ) || [] }
                                        : p
                                    ));
                                  }}
                                  onPublishUnit={async (unitId, published) => {
                                    console.log('Publish unit:', unitId, published);
                                    // تحديث محلي فقط بدون إعادة تحميل الصفحة
                                    setProperties(prev => prev.map(p => 
                                      p.id === property.id 
                                        ? { ...p, units: p.units?.map(u => 
                                            u.id === unitId ? { ...u, published } : u
                                          ) || [] }
                                        : p
                                    ));
                                  }}
                                  onDeleteProperty={(propertyId) => deleteProperty(propertyId)}
                                />
                              </td>
                            </tr>
                          )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {getFilteredData().length === 0 && (
                    <div className="text-center py-12">
                      <FaBuilding className="text-6xl text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد عقارات</h3>
                      <p className="text-gray-500 mb-6">ابدأ بإضافة عقار جديد</p>
                      <InstantLink 
                        href="/properties/new"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
                        title="إضافة عقار جديد"
                      >
                        <FaPlus className="ml-2" />
                        إضافة عقار جديد
                      </InstantLink>
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
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">عرض العقارات الشبكي</h3>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">
                      {getFilteredData().length} من {properties.length} عقار
                    </span>
                    <button
                      onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center text-sm"
                      title={viewMode === 'grid' ? 'التبديل إلى عرض القائمة' : 'التبديل إلى العرض الشبكي'}
                      suppressHydrationWarning
                    >
                      {viewMode === 'grid' ? <FaSort className="ml-1" /> : <FaExpand className="ml-1" />}
                      <span suppressHydrationWarning>
                        {viewMode === 'grid' ? 'عرض قائمة' : 'عرض شبكي'}
                      </span>
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getFilteredData().length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <p className="text-gray-500">لا توجد عقارات للعرض</p>
                    </div>
                  ) : (
                    getFilteredData().map((property: Property) => (
                    <div key={property.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden">
                      {/* Property Image */}
                      <div className="relative h-48 bg-gray-200">
                        {getCoverImage(property) ? (
                          <img src={getCoverImage(property)}
                            alt={getTitleFromProperty(property)}
                            className="w-full h-full object-cover"
                           loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <FaBuilding className="text-4xl" />
                          </div>
                        )}
                        
                        {/* Status Badge */}
                        <div className="absolute top-3 right-3 flex flex-col gap-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(property.status || '')}`}>
                            {getStatusLabel(property.status || '')}
                          </span>
                          {/* عدد الأيام المتبقية */}
                          {property.status === 'leased' && (() => {
                            const rental = getRentalForProperty(property.id);
                            const daysRemaining = rental ? getDaysRemaining(rental) : null;
                            if (daysRemaining !== null) {
                              return (
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  daysRemaining < 30 ? 'bg-red-100 text-red-800' : 
                                  daysRemaining < 90 ? 'bg-orange-100 text-orange-800' : 
                                  'bg-green-100 text-green-800'
                                }`}>
                                  <FaClock className="ml-1" />
                                  {daysRemaining > 0 ? `${daysRemaining} يوم` : 'منتهي'}
                                </span>
                              );
                            }
                            return null;
                          })()}
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
                              <InstantLink 
                                href={`/properties/${property.id}`}
                                className="hover:text-blue-600 transition-colors"
                                title="عرض تفاصيل العقار"
                              >
                                {getTitleFromProperty(property)}
                              </InstantLink>
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

                        {/* Tenant Info for Leased Properties */}
                        {property.status === 'leased' && (() => {
                          const rental = getRentalForProperty(property.id);
                          if (rental) {
                            return (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                                <div className="flex items-center text-sm font-semibold text-blue-900 mb-2">
                                  <FaUser className="ml-1" />
                                  معلومات المستأجر
                                </div>
                                <div className="text-sm text-blue-800 mb-1">
                                  <strong>الاسم:</strong> {rental.tenantName || 'غير محدد'}
                                </div>
                                {rental.tenantPhone && (
                                  <div className="text-sm text-blue-800 mb-1">
                                    <FaPhone className="inline ml-1" />
                                    {rental.tenantPhone}
                                  </div>
                                )}
                                <div className="text-sm text-blue-800">
                                  <strong>الإيجار:</strong> {rental.monthlyRent} OMR/شهر
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })()}

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

                        {/* Multi-unit badge */}
                        {property.buildingType === 'multi' && (
                          <div className="mb-4">
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-2 text-center">
                              <span className="text-purple-700 font-bold text-sm">
                                <FaBuilding className="inline ml-1" />
                                مبنى متعدد الوحدات ({(property.units || []).length} وحدة)
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-2">
                          <InstantLink 
                            href={`/properties/${property.id}`}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                            title="عرض تفاصيل العقار"
                          >
                            <FaEye className="ml-1" />
                            عرض
                          </InstantLink>
                          <InstantLink 
                            href={`/properties/${property.id}/edit`}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                            title="تعديل العقار"
                          >
                            <FaEdit className="ml-1" />
                            تعديل
                          </InstantLink>
                          <InstantLink 
                            href={`/property/${property.id}/admin`}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                            title="إدارة العقار"
                          >
                            <FaCog className="ml-1" />
                            إدارة
                          </InstantLink>
                          <InstantLink 
                            href={`/properties/${property.id}/additional`}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                            title="البيانات الإضافية"
                          >
                            <FaDatabase className="ml-1" />
                            بيانات إضافية
                          </InstantLink>
                        </div>
                      </div>
                      
                      {/* Building Units Manager Component */}
                      {property.buildingType === 'multi' && (
                        <BuildingUnitsManager
                          property={property}
                          onDeleteUnit={async (unitId) => {
                            console.log('Delete unit:', unitId);
                            // تحديث محلي فقط بدون إعادة تحميل الصفحة
                            setProperties(prev => prev.map(p => 
                              p.id === property.id 
                                ? { ...p, units: p.units?.filter(u => u.id !== unitId) || [] }
                                : p
                            ));
                          }}
                          onEditUnit={(unitId) => {
                            console.log('Edit unit:', unitId);
                          }}
                          onViewUnit={(unitId) => {
                            console.log('View unit:', unitId);
                          }}
                          onArchiveUnit={async (unitId) => {
                            console.log('Archive unit:', unitId);
                            // تحديث محلي فقط بدون إعادة تحميل الصفحة
                            setProperties(prev => prev.map(p => 
                              p.id === property.id 
                                ? { ...p, units: p.units?.map(u => 
                                    u.id === unitId ? { ...u, status: 'archived', published: false } : u
                                  ) || [] }
                                : p
                            ));
                          }}
                          onPublishUnit={async (unitId, published) => {
                            console.log('Publish unit:', unitId, published);
                            // تحديث محلي فقط بدون إعادة تحميل الصفحة
                            setProperties(prev => prev.map(p => 
                              p.id === property.id 
                                ? { ...p, units: p.units?.map(u => 
                                    u.id === unitId ? { ...u, published } : u
                                  ) || [] }
                                : p
                            ));
                          }}
                          onDeleteProperty={(propertyId) => deleteProperty(propertyId)}
                        />
                      )}

                    </div>
                  ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* تبويب عقود الإيجار */}
          {activeTab === 'rentals' && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
              <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">عقود الإيجار</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">إدارة جميع عقود الإيجار</p>
                </div>
                <InstantLink
                  href="/rentals/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <FaPlus className="ml-2" />
                  إنشاء عقد جديد
                </InstantLink>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">رقم العقد</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">العقار</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المستأجر</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ البدء</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ الانتهاء</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإيجار الشهري</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rentals.map((rental) => {
                      const property = properties.find(p => p.id === rental.propertyId);
                      const actualState = (rental as any).signatureWorkflow || rental.state;
                      return (
                        <tr key={rental.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`h-3 w-3 rounded-full ml-2 ${
                                actualState === "active" ? "bg-green-400" :
                                actualState === "pending_owner_signature" || actualState === "pending_tenant_signature" ? "bg-orange-400" :
                                "bg-gray-400"
                              }`}></div>
                              <div className="text-sm font-medium text-gray-900">#{rental.id?.split('-')[1]?.substring(0, 8) || rental.id}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {getTitleFromProperty(property || {} as Property) || 'غير محدد'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{rental.tenantName || rental.tenantId || 'غير محدد'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {rental.startDate ? new Date(rental.startDate).toLocaleDateString('ar-EG') : 'غير محدد'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {rental.endDate ? new Date(rental.endDate).toLocaleDateString('ar-EG') : 'غير محدد'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {rental.monthlyRent || rental.amount || 0} {rental.currency || 'OMR'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              actualState === "active" ? "bg-green-100 text-green-800" :
                              actualState === "pending_owner_signature" || actualState === "pending_tenant_signature" ? "bg-orange-100 text-orange-800" :
                              "bg-gray-100 text-gray-800"
                            }`}>
                              {getStateLabel(actualState)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <InstantLink href={`/contracts/rental/${rental.id}`} className="text-blue-600 hover:text-blue-900">
                              عرض التفاصيل
                            </InstantLink>
                          </td>
                        </tr>
                      );
                    })}
                    {rentals.length === 0 && (
                      <tr><td colSpan={8} className="px-6 py-10 text-center text-gray-500">لا توجد عقود إيجار</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* تبويب الحجوزات */}
          {activeTab === 'bookings' && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">الحجوزات</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">عرض جميع الحجوزات</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">العقار</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المستأجر</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ الحجز</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {ownerBookings.map((booking: any) => {
                      const property = properties.find(p => p.id === booking.propertyId);
                      return (
                        <tr key={booking.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">{getTitleFromProperty(property || {} as Property)}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{booking.tenantName || 'غير محدد'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('ar-EG') : 'غير محدد'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {booking.status || 'قيد المراجعة'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <InstantLink href={`/bookings/${booking.id}`} className="text-blue-600 hover:text-blue-900">
                              عرض
                            </InstantLink>
                          </td>
                        </tr>
                      );
                    })}
                    {ownerBookings.length === 0 && (
                      <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500">لا توجد حجوزات</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* تبويب الوحدات */}
          {activeTab === 'units' && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
              <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">الوحدات</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">عرض جميع الوحدات</p>
                </div>
                <div className="text-sm text-gray-600">
                  إجمالي الوحدات: <span className="font-bold text-blue-600">{units.length}</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">رقم الوحدة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">العقار</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">النوع</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المساحة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الغرف</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">السعر</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المستأجر</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getFilteredData().length > 0 ? (
                      getFilteredData().map((unit: Unit) => {
                        const property = properties.find(p => p.id === unit.propertyId);
                        return (
                          <tr key={unit.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {unit.unitNo || unit.unitNumber || 'غير محدد'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {getTitleFromProperty(property || {} as Property) || 'غير محدد'}
                              {property?.buildingNumber && (
                                <div className="text-xs text-gray-500">مبنى: {property.buildingNumber}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {unit.type || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {unit.area ? `${unit.area} م²` : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {unit.beds || unit.bedrooms || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {unit.rentalPrice || unit.price ? `${unit.rentalPrice || unit.price} OMR` : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(unit.status)}`}>
                                {getStatusLabel(unit.status)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {unit.tenantName || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <InstantLink
                                href={`/properties/${unit.propertyId}?unit=${unit.id}`}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                عرض
                              </InstantLink>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={9} className="px-6 py-10 text-center text-gray-500">
                          {units.length === 0 ? 'لا توجد وحدات' : 'لا توجد وحدات تطابق معايير البحث'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* تبويب العملاء */}
          {activeTab === 'customers' && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
              <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">العملاء</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">عرض جميع العملاء</p>
                </div>
                <div className="text-sm text-gray-600">
                  إجمالي العملاء: <span className="font-bold text-blue-600">{customers.length}</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الاسم</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">البريد الإلكتروني</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الهاتف</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">النوع</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getFilteredData().length > 0 ? (
                      getFilteredData().map((customer: Customer) => (
                        <tr key={customer.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {customer.name || 'غير محدد'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {customer.email || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {customer.phone || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              customer.type === 'company' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {customer.type === 'company' ? 'شركة' : 'فرد'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <InstantLink
                              href={`/customers/${customer.id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              عرض التفاصيل
                            </InstantLink>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                          {customers.length === 0 ? 'لا يوجد عملاء' : 'لا يوجد عملاء يطابقون معايير البحث'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* تبويب المستأجرين */}
          {activeTab === 'tenants' && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">المستأجرين</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">عرض جميع المستأجرين</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الاسم</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">العقار</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ البدء</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ الانتهاء</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(() => {
                      // إنشاء قائمة المستأجرين الفريدة من العقود
                      const uniqueTenantsList = Array.from(
                        new Set(rentals.map(r => r.tenantId || r.tenantName).filter(Boolean))
                      );
                      
                      return uniqueTenantsList.map((tenantId, idx) => {
                        const tenantRentals = rentals.filter(r => (r.tenantId || r.tenantName) === tenantId);
                        const activeRental = tenantRentals.find(r => {
                          const state = (r as any).signatureWorkflow || r.state;
                          return state === 'active';
                        }) || tenantRentals[0];
                        const property = properties.find(p => p.id === activeRental?.propertyId);
                        
                        // محاولة جلب بيانات المستخدم للحصول على الاسم الكامل
                        const tenantUser = allUsers.find((u: any) => 
                          u.id === tenantId || 
                          u.email === tenantId || 
                          (u.role === 'tenant' && (u.name?.includes(tenantId) || tenantId?.includes(u.name)))
                        );
                        
                        const displayName = tenantUser?.name || activeRental?.tenantName || tenantId;
                        
                        return (
                          <tr key={tenantId || idx} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                              <div>{displayName}</div>
                              <div className="text-xs text-gray-500">{tenantId}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">{getTitleFromProperty(property || {} as Property)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {activeRental?.startDate ? new Date(activeRental.startDate).toLocaleDateString('ar-EG') : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {activeRental?.endDate ? new Date(activeRental.endDate).toLocaleDateString('ar-EG') : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <InstantLink href={`/tenants/${tenantId}`} className="text-blue-600 hover:text-blue-900">
                                عرض التفاصيل
                              </InstantLink>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                    {(() => {
                      const uniqueTenantsList = Array.from(
                        new Set(rentals.map(r => r.tenantId || r.tenantName).filter(Boolean))
                      );
                      if (uniqueTenantsList.length === 0 && rentals.length > 0) {
                        return <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500">لا يوجد مستأجرين في العقود</td></tr>;
                      }
                      return null;
                    })()}
                    {rentals.length === 0 && (
                      <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500">لا يوجد عقود إيجار</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* تبويب الخدمات */}
          {activeTab === 'services' && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
              <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">الخدمات والمرافق</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">عرض جميع الخدمات المرتبطة بعقاراتك</p>
                </div>
                <InstantLink
                  href="/property-management/overdue#add-service"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <FaPlus className="ml-2" />
                  إضافة خدمة جديدة
                </InstantLink>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الخدمة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحساب</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المزود</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المبلغ الشهري</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الاستحقاق</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {services.map((s: any) => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{s.serviceName}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{s.accountNumber}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{s.provider}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{(s.monthlyAmount || 0).toLocaleString()} {s.currency || 'OMR'}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${s.isOverdue ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                            {s.isOverdue ? 'متأخر' : 'مستحق'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {services.length === 0 && (
                      <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500">لا توجد خدمات</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* تبويب المستندات */}
          {activeTab === 'documents' && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
              <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">المستندات</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">عرض جميع المستندات</p>
                </div>
                <InstantLink
                  href="/property-management/overdue#add-document"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <FaPlus className="ml-2" />
                  إضافة مستند جديد
                </InstantLink>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">اسم المستند</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">النوع</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ الإصدار</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ الانتهاء</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {documents.map((doc: any) => (
                      <tr key={doc.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{doc.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{doc.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {doc.issueDate ? new Date(doc.issueDate).toLocaleDateString('ar-EG') : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString('ar-EG') : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            doc.isExpiring ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {doc.isExpiring ? 'ينتهي قريباً' : 'صالح'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {documents.length === 0 && (
                      <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500">لا توجد مستندات</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* تبويب المصاريف */}
          {activeTab === 'expenses' && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
              <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">المصاريف</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">عرض جميع المصاريف</p>
                </div>
                <InstantLink
                  href="/property-management/overdue#add-expense"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <FaPlus className="ml-2" />
                  إضافة مصروف جديد
                </InstantLink>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الوصف</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الفئة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المبلغ</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {expenses.map((exp: any) => (
                      <tr key={exp.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{exp.description}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{exp.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {(exp.amount || 0).toLocaleString()} {exp.currency || 'OMR'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {exp.date ? new Date(exp.date).toLocaleDateString('ar-EG') : '-'}
                        </td>
                      </tr>
                    ))}
                    {expenses.length === 0 && (
                      <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-500">لا توجد مصاريف</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* تبويب المتأخرات */}
          {activeTab === 'overdue' && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">المتأخرات</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">عرض الخدمات والمستندات المتأخرة</p>
              </div>
              <div className="p-6 space-y-6">
                {overdueServices.length > 0 && (
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">خدمات متأخرة</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-red-50">
                          <tr>
                            <th className="px-6 py-3 text-right text-xs font-medium text-red-700 uppercase">الخدمة</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-red-700 uppercase">المبلغ</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-red-700 uppercase">تاريخ الاستحقاق</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {overdueServices.map((s: any) => (
                            <tr key={s.id} className="hover:bg-red-50">
                              <td className="px-6 py-4 text-sm text-gray-900">{s.serviceName}</td>
                              <td className="px-6 py-4 text-sm font-medium text-red-600">
                                {(s.monthlyAmount || 0).toLocaleString()} {s.currency || 'OMR'}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">{s.dueDate ? new Date(s.dueDate).toLocaleDateString('ar-EG') : '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                {expiringDocuments.length > 0 && (
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">مستندات تنتهي قريباً</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-orange-50">
                          <tr>
                            <th className="px-6 py-3 text-right text-xs font-medium text-orange-700 uppercase">اسم المستند</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-orange-700 uppercase">تاريخ الانتهاء</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {expiringDocuments.map((doc: any) => (
                            <tr key={doc.id} className="hover:bg-orange-50">
                              <td className="px-6 py-4 text-sm text-gray-900">{doc.name}</td>
                              <td className="px-6 py-4 text-sm text-orange-600">
                                {doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString('ar-EG') : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                {overdueServices.length === 0 && expiringDocuments.length === 0 && (
                  <div className="text-center py-12">
                    <FaCheck className="text-6xl text-green-300 mx-auto mb-4" />
                    <p className="text-gray-500">لا توجد متأخرات</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* تبويب التحليلات */}
          {activeTab === 'analytics' && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 p-6">
              <div className="text-center py-8">
                <FaChartLine className="text-6xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">التحليلات المتقدمة</h3>
                <p className="text-gray-500 mb-4">للوصول إلى مركز الذكاء الاصطناعي، اضغط على الزر في أعلى الصفحة</p>
                <button
                  onClick={() => setShowAIModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 mx-auto"
                >
                  <FaRobot />
                  فتح مركز الذكاء الاصطناعي
                </button>
              </div>
            </div>
          )}

          {/* إزالة محتوى التحليلات القديم - تم نقله إلى Modal */}
          {false && activeTab === 'analytics-old' && (
            <div className="space-y-6">
              {/* AI Insights Dashboard */}
              {aiInsights && (
                <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-lg shadow-lg p-4 text-white border border-blue-500/20">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h2 className="text-lg font-bold flex items-center">
                        <div className="bg-white/20 p-1.5 rounded-lg ml-2">
                          <FaRobot className="text-lg" />
                        </div>
                        مركز الذكاء الاصطناعي
                      </h2>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={generateAIInsights}
                        className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-3 py-1.5 rounded-lg transition-all duration-300 flex items-center border border-white/20 hover:border-white/40 text-sm"
                        title="تحديث جميع الإحصائيات والتحليلات"
                      >
                        <FaStar className="ml-1 text-sm" />
                        تحديث
                      </button>
                      <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-3 py-1.5 rounded-lg transition-all duration-300 flex items-center border border-white/20 hover:border-white/40 text-sm"
                        title="عرض/إخفاء الفلاتر المتقدمة"
                      >
                        <FaFilter className="ml-1 text-sm" />
                        {showFilters ? 'إخفاء' : 'فلاتر'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-3">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center border border-white/20 hover:bg-white/30 transition-all duration-300 group cursor-pointer" title="إجمالي عدد العقارات في النظام">
                      <div className="bg-blue-500/30 w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-1 group-hover:scale-110 transition-transform duration-300">
                        <FaBuilding className="text-sm" />
                      </div>
                      <div className="text-lg font-bold mb-0.5">{aiInsights.totalProperties}</div>
                      <div className="text-xs text-blue-100">إجمالي</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center border border-white/20 hover:bg-white/30 transition-all duration-300 group cursor-pointer" title="العقارات المنشورة والمتاحة للجمهور">
                      <div className="bg-green-500/30 w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-1 group-hover:scale-110 transition-transform duration-300">
                        <FaGlobe className="text-sm" />
                      </div>
                      <div className="text-lg font-bold mb-0.5">{aiInsights.publishedProperties}</div>
                      <div className="text-xs text-blue-100">منشور</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center border border-white/20 hover:bg-white/30 transition-all duration-300 group cursor-pointer" title="العقارات المحفوظة كمسودات">
                      <div className="bg-yellow-500/30 w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-1 group-hover:scale-110 transition-transform duration-300">
                        <FaEyeSlash className="text-sm" />
                      </div>
                      <div className="text-lg font-bold mb-0.5">{aiInsights.draftProperties}</div>
                      <div className="text-xs text-blue-100">مسودة</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center border border-white/20 hover:bg-white/30 transition-all duration-300 group cursor-pointer" title="المباني التي تحتوي على وحدات متعددة">
                      <div className="bg-purple-500/30 w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-1 group-hover:scale-110 transition-transform duration-300">
                        <FaHome className="text-sm" />
                      </div>
                      <div className="text-lg font-bold mb-0.5">{aiInsights.multiUnitBuildings}</div>
                      <div className="text-xs text-blue-100">متعدد</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center border border-white/20 hover:bg-white/30 transition-all duration-300 group cursor-pointer" title="العقارات المتاحة للإيجار أو البيع">
                      <div className="bg-orange-500/30 w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-1 group-hover:scale-110 transition-transform duration-300">
                        <FaTag className="text-sm" />
                      </div>
                      <div className="text-lg font-bold mb-0.5">{aiInsights.vacantProperties}</div>
                      <div className="text-xs text-blue-100">شاغر</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center border border-white/20 hover:bg-white/30 transition-all duration-300 group cursor-pointer" title="العقارات المؤجرة حالياً">
                      <div className="bg-indigo-500/30 w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-1 group-hover:scale-110 transition-transform duration-300">
                        <FaCheck className="text-sm" />
                      </div>
                      <div className="text-lg font-bold mb-0.5">{aiInsights.leasedProperties}</div>
                      <div className="text-xs text-blue-100">مؤجر</div>
                    </div>
                  </div>

                  {/* Smart Recommendations */}
                  {aiInsights.recommendations && aiInsights.recommendations.length > 0 && (
                    <div className="mt-3">
                      <h3 className="text-sm font-semibold mb-2 flex items-center">
                        <div className="bg-yellow-500/30 p-1 rounded-lg ml-2">
                          <FaLightbulb className="text-sm" />
                        </div>
                        التوصيات الذكية
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {aiInsights.recommendations.map((rec: any, index: number) => (
                          <div key={index} className={`bg-white/20 backdrop-blur-sm rounded-lg p-2 border transition-all duration-300 hover:bg-white/30 ${
                            rec.type === 'error' ? 'border-red-400/50' :
                            rec.type === 'warning' ? 'border-yellow-400/50' :
                            'border-blue-400/50'
                          }`}>
                            <div className="flex items-start space-x-2">
                              <div className={`p-1 rounded-lg ${
                                rec.type === 'error' ? 'bg-red-500/30' :
                                rec.type === 'warning' ? 'bg-yellow-500/30' :
                                'bg-blue-500/30'
                              }`}>
                                {rec.type === 'error' && <FaExclamationTriangle className="text-red-300 text-xs" />}
                                {rec.type === 'warning' && <FaExclamationTriangle className="text-yellow-300 text-xs" />}
                                {rec.type === 'info' && <FaInfoCircle className="text-blue-300 text-xs" />}
                              </div>
                              <div className="flex-1">
                                <p className="text-white/90 mb-2 text-xs">{rec.message}</p>
                                <button className="bg-white/30 hover:bg-white/40 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium transition-all duration-200 border border-white/20 hover:border-white/40">
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
                  <div className="mt-3">
                    <h3 className="text-sm font-semibold mb-2 flex items-center">
                      <div className="bg-green-500/30 p-1 rounded-lg ml-2">
                        <FaStar className="text-sm" />
                      </div>
                      إجراءات سريعة
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <InstantLink 
                        href="/properties/new"
                        className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 rounded-lg transition-all duration-300 border border-white/20 hover:border-white/40 flex items-center justify-center space-x-1"
                        title="إضافة عقار جديد"
                      >
                        <FaPlus className="text-sm" />
                        <span className="text-xs font-medium">عقار جديد</span>
                      </InstantLink>
                      <button 
                        onClick={publishAllDrafts}
                        className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 rounded-lg transition-all duration-300 border border-white/20 hover:border-white/40 flex items-center justify-center space-x-1"
                        title="نشر جميع المسودات"
                      >
                        <FaGlobe className="text-sm" />
                        <span className="text-xs font-medium">نشر المسودات</span>
                      </button>
                      <button 
                        onClick={exportReport}
                        className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 rounded-lg transition-all duration-300 border border-white/20 hover:border-white/40 flex items-center justify-center space-x-1"
                        title="تصدير تقرير شامل"
                      >
                        <FaDownload className="text-sm" />
                        <span className="text-xs font-medium">تصدير تقرير</span>
                      </button>
                      <button 
                        onClick={printPropertiesList}
                        className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 rounded-lg transition-all duration-300 border border-white/20 hover:border-white/40 flex items-center justify-center space-x-1"
                        title="طباعة قائمة العقارات"
                      >
                        <FaPrint className="text-sm" />
                        <span className="text-xs font-medium">طباعة</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* تحليلات إضافية */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">تحليلات الأداء</h3>
                <p className="text-gray-500 mb-4">قريباً: تحليلات متقدمة للأداء والإيرادات</p>
                
                {/* إحصائيات إضافية */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">متوسط سعر العقارات</p>
                        <p className="text-2xl font-bold text-blue-600 mt-1">
                          {aiInsights?.averagePrice ? `${aiInsights.averagePrice.toFixed(0)} ر.ع` : '0 ر.ع'}
                        </p>
                      </div>
                      <FaTag className="text-blue-400 text-2xl" />
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">أفضل موقع</p>
                        <p className="text-lg font-bold text-green-600 mt-1">
                          {aiInsights?.topLocation || 'غير محدد'}
                        </p>
                      </div>
                      <FaMapMarkerAlt className="text-green-400 text-2xl" />
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">إجمالي الوحدات</p>
                        <p className="text-2xl font-bold text-purple-600 mt-1">
                          {units.length}
                        </p>
                      </div>
                      <FaHome className="text-purple-400 text-2xl" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Smart Suggestions */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 p-3 mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                <div className="bg-green-500/20 p-1 rounded-lg ml-2">
                  <FaLightbulb className="text-green-600 text-sm" />
                </div>
                اقتراحات ذكية
              </h3>
              <button
                onClick={() => generateSmartSuggestions()}
                className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded-lg transition-colors flex items-center text-xs"
                title="تحديث الاقتراحات الذكية"
              >
                <FaStar className="ml-1 text-xs" />
                تحديث
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="bg-white rounded-lg p-2 border border-green-200 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-1">
                  <FaChartLine className="text-blue-600 ml-1 text-sm" />
                  <h4 className="font-medium text-gray-900 text-sm">تحليل الأداء</h4>
                </div>
                <p className="text-xs text-gray-600 mb-2">تحليل أداء عقاراتك ومقارنتها بالسوق</p>
                <button className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                  عرض التحليل →
                </button>
              </div>
              <div className="bg-white rounded-lg p-2 border border-green-200 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-1">
                  <FaTag className="text-green-600 ml-1 text-sm" />
                  <h4 className="font-medium text-gray-900 text-sm">تحسين الأسعار</h4>
                </div>
                <p className="text-xs text-gray-600 mb-2">اقتراحات لتحسين أسعار العقارات</p>
                <button className="text-green-600 hover:text-green-800 text-xs font-medium">
                  عرض الاقتراحات →
                </button>
              </div>
              <div className="bg-white rounded-lg p-2 border border-green-200 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-1">
                  <FaGlobe className="text-purple-600 ml-1 text-sm" />
                  <h4 className="font-medium text-gray-900 text-sm">تحسين التسويق</h4>
                </div>
                <p className="text-xs text-gray-600 mb-2">نصائح لتحسين عرض العقارات</p>
                <button className="text-purple-600 hover:text-purple-800 text-xs font-medium">
                  عرض النصائح →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

