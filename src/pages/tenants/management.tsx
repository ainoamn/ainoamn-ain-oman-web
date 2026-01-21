// src/pages/tenants/management.tsx - صفحة إدارة المستأجرين الشاملة
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  FaUser, FaUsers, FaEnvelope, FaPhone, FaIdCard,
  FaEdit, FaTrash, FaKey, FaCalendar, FaBell,
  FaSearch, FaFilter, FaPlus, FaSave, FaSpinner,
  FaExclamationTriangle, FaCheckCircle, FaTimesCircle,
  FaMapMarkerAlt, FaBriefcase, FaPassport, FaBuilding,
  FaGlobe, FaFlag, FaEye, FaEyeSlash, FaTh, FaList,
  FaFileContract, FaTimes, FaFilePdf, FaFileExcel, FaFileAlt, FaPrint, FaDownload
} from 'react-icons/fa';
import InstantLink from '@/components/InstantLink';
import Layout from '@/components/layout/Layout';
import EditTenantModal from '@/components/tenants/EditTenantModal';

interface Contract {
  id: string;
  propertyId: string;
  buildingNo: string;
  unitNo: string;
  unitId?: string;
  contractStartDate: string;
  contractEndDate: string;
  status: 'active' | 'expired' | 'expiring-soon';
}

interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  username?: string;
  password?: string;
  createdAt: string;
  // Legacy support (backward compatibility)
  propertyId?: string;
  unitId?: string;
  buildingNo?: string;
  unitNo?: string;
  contractStartDate?: string;
  contractEndDate?: string;
  // New: Multiple contracts support
  contracts?: Contract[];
  tenantDetails?: {
    type: 'individual_omani' | 'individual_foreign' | 'company';
    fullName?: string;
    tribe?: string;
    nationalId?: string;
    nationalIdExpiry?: string;
    residenceId?: string;
    residenceIdExpiry?: string;
    passportNumber?: string;
    passportExpiry?: string;
    [key: string]: any;
  };
  credentials?: {
    username?: string;
    password?: string;
    [key: string]: any;
  };
}

export default function TenantsManagement() {
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [filteredTenants, setFilteredTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState<'all' | 'name' | 'email' | 'nationalId' | 'id' | 'building' | 'phone'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [expiringDocuments, setExpiringDocuments] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list'); // افتراضي دائماً list
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    
    // استرجاع viewMode من localStorage بعد التحميل
    const savedViewMode = localStorage.getItem('tenants-view-mode') as 'grid' | 'list';
    if (savedViewMode) {
      setViewMode(savedViewMode);
    } else {
      // حفظ القيمة الافتراضية (list) في localStorage
      localStorage.setItem('tenants-view-mode', 'list');
    }
    fetchTenants();
  }, []);

  useEffect(() => {
    filterTenants();
  }, [tenants, searchQuery, searchField, filterStatus]);

  // حفظ viewMode في localStorage
  useEffect(() => {
    if (hasMounted) {
      localStorage.setItem('tenants-view-mode', viewMode);
    }
  }, [viewMode, hasMounted]);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      
      // الحصول على معلومات المستخدم الحالي
      let userId: string | null = null;
      let userRole: string | null = null;
      
      if (typeof window !== 'undefined') {
        try {
          const authStr = localStorage.getItem("ain_auth");
          if (authStr) {
            const auth = JSON.parse(authStr);
            userId = auth.id;
            userRole = auth.role;
          }
        } catch (e) {
          // تجاهل الأخطاء
        }
      }
      
      // إذا كان المستخدم مستأجراً، لا يظهر له أي مستأجرين
      if (userRole === 'tenant') {
        setTenants([]);
        setFilteredTenants([]);
        setLoading(false);
        return;
      }
      
      // للملاك: جلب المستأجرين الذين استأجروا عقاراتهم فقط
      let tenantsOnly: any[] = [];
      
      if (userId && userRole !== 'tenant') {
        // جلب العقود المرتبطة بعقارات المستخدم
        const rentalsRes = await fetch('/api/rentals');
        if (rentalsRes.ok) {
          const rentalsData = await rentalsRes.json();
          const rentals = Array.isArray(rentalsData.items) ? rentalsData.items : [];
          
          // جلب عقارات المستخدم
          const propertiesRes = await fetch(`/api/properties?mine=true&userId=${encodeURIComponent(userId)}`);
          if (propertiesRes.ok) {
            const propertiesData = await propertiesRes.json();
            const userProperties = Array.isArray(propertiesData.items) ? propertiesData.items : [];
            const userPropertyIds = new Set(userProperties.map((p: any) => p.id));
            
            // استخراج معرفات المستأجرين من العقود المرتبطة بعقارات المستخدم
            const tenantIds = new Set<string>();
            rentals.forEach((rental: any) => {
              if (rental.propertyId && userPropertyIds.has(rental.propertyId)) {
                if (rental.tenantId) {
                  tenantIds.add(rental.tenantId);
                }
              }
            });
            
            // جلب بيانات المستخدمين (المستأجرين فقط)
            const usersRes = await fetch('/api/users');
            if (usersRes.ok) {
              const usersData = await usersRes.json();
              const allUsers = Array.isArray(usersData.users) ? usersData.users : (Array.isArray(usersData) ? usersData : []);
              tenantsOnly = allUsers.filter((user: any) => 
                user.role === 'tenant' && tenantIds.has(user.id)
              );
            }
          }
        }
      } else {
        // إذا لم يكن هناك userId، جلب جميع المستأجرين (للمديرين)
        const response = await fetch('/api/users');
        if (response.ok) {
          const data = await response.json();
          const allUsers = Array.isArray(data.users) ? data.users : (Array.isArray(data) ? data : []);
          tenantsOnly = allUsers.filter(user => user.role === 'tenant');
        }
      }
      
      setTenants(tenantsOnly);
      setFilteredTenants(tenantsOnly);
      
      // فحص الوثائق المنتهية
      checkExpiringDocuments(tenantsOnly);
    } catch (error) {
      console.error('Error fetching tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkExpiringDocuments = (tenantsList: Tenant[]) => {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiring: any[] = [];

    tenantsList.forEach(tenant => {
      if (tenant.tenantDetails) {
        const details = tenant.tenantDetails;
        
        // فحص البطاقة الشخصية
        if (details.nationalIdExpiry) {
          const expiryDate = new Date(details.nationalIdExpiry);
          if (expiryDate < thirtyDaysFromNow) {
            expiring.push({
              tenantId: tenant.id,
              tenantName: tenant.name,
              documentType: 'البطاقة الشخصية',
              expiryDate: details.nationalIdExpiry,
              daysRemaining: Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
              isExpired: expiryDate < today
            });
          }
        }
        
        // فحص بطاقة الإقامة
        if (details.residenceIdExpiry) {
          const expiryDate = new Date(details.residenceIdExpiry);
          if (expiryDate < thirtyDaysFromNow) {
            expiring.push({
              tenantId: tenant.id,
              tenantName: tenant.name,
              documentType: 'بطاقة الإقامة',
              expiryDate: details.residenceIdExpiry,
              daysRemaining: Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
              isExpired: expiryDate < today
            });
          }
        }
        
        // فحص جواز السفر
        if (details.passportExpiry) {
          const expiryDate = new Date(details.passportExpiry);
          if (expiryDate < thirtyDaysFromNow) {
            expiring.push({
              tenantId: tenant.id,
              tenantName: tenant.name,
              documentType: 'جواز السفر',
              expiryDate: details.passportExpiry,
              daysRemaining: Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
              isExpired: expiryDate < today
            });
          }
        }
      }
    });

    setExpiringDocuments(expiring);
  };

  // دالة للحصول على جميع عقود المستأجر (backward compatible)
  const getTenantContracts = (tenant: Tenant): Contract[] => {
    if (tenant.contracts && tenant.contracts.length > 0) {
      return tenant.contracts;
    }
    
    // للتوافق مع البيانات القديمة
    if (tenant.propertyId) {
      return [{
        id: `contract-${tenant.id}-1`,
        propertyId: tenant.propertyId,
        buildingNo: tenant.buildingNo || '',
        unitNo: tenant.unitNo || '',
        unitId: tenant.unitId,
        contractStartDate: tenant.contractStartDate || '',
        contractEndDate: tenant.contractEndDate || '',
        status: 'active'
      }];
    }
    
    return [];
  };

  const filterTenants = () => {
    let filtered = [...tenants];

    // فلترة حسب الحالة
    if (filterStatus !== 'all') {
      filtered = filtered.filter(t => t.status === filterStatus);
    }

    // فلترة حسب البحث المتقدم
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      
      filtered = filtered.filter(t => {
        // البحث حسب الحقل المحدد
        switch (searchField) {
          case 'name':
            return t.name.toLowerCase().includes(query);
          case 'email':
            return t.email.toLowerCase().includes(query);
          case 'nationalId':
            return (t.tenantDetails?.nationalId || '').toLowerCase().includes(query) ||
                   (t.tenantDetails?.residenceId || '').toLowerCase().includes(query);
          case 'id':
            return t.id.toLowerCase().includes(query) ||
                   (t.username || '').toLowerCase().includes(query) ||
                   (t.credentials?.username || '').toLowerCase().includes(query);
          case 'building':
            const contracts = getTenantContracts(t);
            return contracts.some(c => 
              (c.buildingNo || '').toLowerCase().includes(query) ||
              (c.unitNo || '').toLowerCase().includes(query) ||
              (c.propertyId || '').toLowerCase().includes(query)
            );
          case 'phone':
            return t.phone.includes(query) ||
                   (t.tenantDetails?.phone1 || '').includes(query) ||
                   (t.tenantDetails?.phone2 || '').includes(query);
          case 'all':
          default:
            // البحث في جميع الحقول
            const contractsSearch = getTenantContracts(t).some(c =>
              (c.buildingNo || '').toLowerCase().includes(query) ||
              (c.unitNo || '').toLowerCase().includes(query) ||
              (c.propertyId || '').toLowerCase().includes(query)
            );
            
            return t.name.toLowerCase().includes(query) ||
                   t.email.toLowerCase().includes(query) ||
                   t.phone.includes(query) ||
                   t.id.toLowerCase().includes(query) ||
                   (t.username || '').toLowerCase().includes(query) ||
                   (t.credentials?.username || '').toLowerCase().includes(query) ||
                   (t.tenantDetails?.nationalId || '').toLowerCase().includes(query) ||
                   (t.tenantDetails?.residenceId || '').toLowerCase().includes(query) ||
                   contractsSearch;
        }
      });
    }

    setFilteredTenants(filtered);
  };

  const getTenantTypeLabel = (type: string) => {
    switch (type) {
      case 'individual_omani': return '🇴🇲 عماني';
      case 'individual_foreign': return '🌍 وافد';
      case 'company': return '🏢 شركة';
      default: return 'غير محدد';
    }
  };

  // دالة لحساب حالة البطاقة
  const getIdCardStatus = (expiryDate: string) => {
    if (!expiryDate) return null;
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return {
        status: 'expired',
        label: 'منتهية الصلاحية',
        color: 'bg-red-100 text-red-800 border-red-300',
        icon: '❌',
        days: Math.abs(diffDays)
      };
    } else if (diffDays <= 90) {
      return {
        status: 'expiring-soon',
        label: 'قاربت على الانتهاء',
        color: 'bg-orange-100 text-orange-800 border-orange-300',
        icon: '⚠️',
        days: diffDays
      };
    } else {
      return {
        status: 'active',
        label: 'نشطة',
        color: 'bg-green-100 text-green-800 border-green-300',
        icon: '✅',
        days: diffDays
      };
    }
  };

  // دالة لحساب حالة عقد الإيجار
  const getContractStatus = (endDate: string) => {
    if (!endDate) return null;
    
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return {
        status: 'expired',
        label: 'عقد منتهي',
        color: 'bg-red-100 text-red-800 border-red-300',
        icon: '❌',
        days: Math.abs(diffDays)
      };
    } else if (diffDays <= 90) {
      return {
        status: 'expiring-soon',
        label: 'قريب الانتهاء',
        color: 'bg-orange-100 text-orange-800 border-orange-300',
        icon: '⚠️',
        days: diffDays
      };
    } else {
      return {
        status: 'active',
        label: 'عقد صالح',
        color: 'bg-green-100 text-green-800 border-green-300',
        icon: '✅',
        days: diffDays
      };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">نشط</span>;
      case 'inactive':
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">غير نشط</span>;
      case 'suspended':
        return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">موقوف</span>;
      case 'pending_approval':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">بانتظار الاعتماد</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  // دوال التصدير والطباعة
  const exportToExcel = () => {
    const data = filteredTenants.map(t => {
      const contracts = getTenantContracts(t);
      return {
        'الاسم': t.name,
        'البريد': t.email,
        'الهاتف': t.phone,
        'اسم المستخدم': t.credentials?.username || t.username || '-',
        'الرقم المدني': t.tenantDetails?.nationalId || t.tenantDetails?.residenceId || '-',
        'عدد العقود': contracts.length,
        'المبنى': contracts.map(c => c.buildingNo).join(', ') || '-',
        'الوحدة': contracts.map(c => c.unitNo).join(', ') || '-',
        'الحالة': t.status
      };
    });
    
    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `tenants-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF('l', 'mm', 'a4'); // Landscape orientation for more columns
      
      // العنوان
      doc.setFontSize(16);
      doc.text('Ain Oman - Tenants Report', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
      
      doc.setFontSize(10);
      doc.text(`Date: ${new Date().toLocaleDateString('en-US')}`, doc.internal.pageSize.getWidth() / 2, 22, { align: 'center' });
      doc.text(`Total Tenants: ${filteredTenants.length}`, doc.internal.pageSize.getWidth() / 2, 28, { align: 'center' });
      
      // ملاحظة حول الأسماء
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('Note: Arabic names displayed as ID/Username due to PDF font limitations', doc.internal.pageSize.getWidth() / 2, 32, { align: 'center' });
      doc.setTextColor(0, 0, 0);
      
      // إعداد البيانات - استخدام ID بدلاً من الاسم العربي
      const tableData = filteredTenants.map((t, index) => {
        const contracts = getTenantContracts(t);
        const tenantId = t.id || `TENANT-${index + 1}`;
        const username = t.credentials?.username || t.username || '-';
        const nationalId = t.tenantDetails?.nationalId || t.tenantDetails?.residenceId || t.tenantDetails?.commercialRegister || '-';
        
        return [
          tenantId, // استخدام ID بدلاً من الاسم
          username, // اسم المستخدم (إنجليزي)
          t.email,
          t.phone,
          nationalId,
          contracts.length.toString(),
          contracts.map(c => c.buildingNo).join(', ') || '-',
          contracts.map(c => c.unitNo).join(', ') || '-',
          t.status
        ];
      });
      
      // إنشاء الجدول باستخدام autoTable
      autoTable(doc, {
        head: [['Tenant ID', 'Username', 'Email', 'Phone', 'ID Number', 'Contracts', 'Buildings', 'Units', 'Status']],
        body: tableData,
        startY: 38,
        styles: {
          font: 'helvetica',
          fontSize: 8,
          cellPadding: 2,
          overflow: 'linebreak',
          halign: 'left'
        },
        headStyles: {
          fillColor: [147, 51, 234], // purple
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center'
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251]
        },
        columnStyles: {
          0: { cellWidth: 28 }, // Tenant ID
          1: { cellWidth: 32 }, // Username
          2: { cellWidth: 40 }, // Email
          3: { cellWidth: 28 }, // Phone
          4: { cellWidth: 25 }, // ID Number
          5: { cellWidth: 18 }, // Contracts
          6: { cellWidth: 25 }, // Buildings
          7: { cellWidth: 25 }, // Units
          8: { cellWidth: 20 }  // Status
        },
        margin: { top: 38, left: 10, right: 10 },
        tableWidth: 'auto'
      });
      
      // حفظ الملف
      doc.save(`tenants-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('حدث خطأ أثناء إنشاء ملف PDF');
    }
  };

  const exportToText = () => {
    let text = '=== بيانات المستأجرين ===\n\n';
    text += `التاريخ: ${new Date().toLocaleDateString('ar')}\n`;
    text += `إجمالي المستأجرين: ${filteredTenants.length}\n\n`;
    text += '='.repeat(60) + '\n\n';
    
    filteredTenants.forEach((tenant, index) => {
      const contracts = getTenantContracts(tenant);
      text += `${index + 1}. ${tenant.name}\n`;
      text += `   اسم المستخدم: ${tenant.credentials?.username || tenant.username || '-'}\n`;
      text += `   البريد: ${tenant.email}\n`;
      text += `   الهاتف: ${tenant.phone}\n`;
      text += `   الرقم المدني: ${tenant.tenantDetails?.nationalId || tenant.tenantDetails?.residenceId || '-'}\n`;
      text += `   عدد العقود: ${contracts.length}\n`;
      if (contracts.length > 0) {
        contracts.forEach((c, i) => {
          text += `   العقد ${i + 1}: مبنى ${c.buildingNo} - وحدة ${c.unitNo}\n`;
        });
      }
      text += `   الحالة: ${tenant.status}\n`;
      text += '\n' + '-'.repeat(60) + '\n\n';
    });
    
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `tenants-${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
  };

  return (
    <Layout>
      <Head>
        <title>إدارة المستأجرين - عين عُمان</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 py-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-2 mb-3">
                <FaUsers className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold mb-2">إدارة المستأجرين</h1>
              <p className="text-sm opacity-90 mb-4">
                إدارة شاملة لجميع المستأجرين والوثائق والتنبيهات
              </p>
              
              {/* إحصائيات سريعة */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-3">
                  <div className="text-2xl font-bold">{tenants.length}</div>
                  <div className="text-xs opacity-90">إجمالي المستأجرين</div>
                </div>
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-3">
                  <div className="text-2xl font-bold">{tenants.filter(t => t.status === 'active').length}</div>
                  <div className="text-xs opacity-90">نشط</div>
                </div>
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-3">
                  <div className="text-2xl font-bold">{expiringDocuments.filter(d => !d.isExpired).length}</div>
                  <div className="text-xs opacity-90">قرب الانتهاء</div>
                </div>
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-3">
                  <div className="text-2xl font-bold text-red-200">{expiringDocuments.filter(d => d.isExpired).length}</div>
                  <div className="text-xs opacity-90">منتهية</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* تنبيهات الوثائق المنتهية */}
          {expiringDocuments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg p-4 shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <FaBell className="w-4 h-4" />
                  <h3 className="text-lg font-bold">تنبيهات هامة</h3>
                  <span className="bg-white bg-opacity-30 px-2 py-0.5 rounded-full text-xs">
                    {expiringDocuments.length}
                  </span>
                </div>
                
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {expiringDocuments.map((doc, index) => (
                    <div
                      key={index}
                      className={`bg-white bg-opacity-20 backdrop-blur-sm rounded-md p-2 ${
                        doc.isExpired ? 'border border-red-300' : 'border border-white border-opacity-20'
                      }`}
                    >
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex-1">
                          <div className="font-semibold">{doc.tenantName}</div>
                          <div className="text-xs opacity-90">{doc.documentType}</div>
                        </div>
                        <div className="text-left">
                          {doc.isExpired ? (
                            <span className="bg-red-600 px-2 py-0.5 rounded-full text-xs font-bold">
                              منتهي
                            </span>
                          ) : (
                            <span className="bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full text-xs font-bold">
                              {doc.daysRemaining} يوم
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* البحث والفلترة المتقدمة */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <FaSearch className="w-4 h-4 text-purple-600" />
              البحث والفلترة المتقدمة
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* نوع البحث */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  البحث في
                </label>
                <select
                  value={searchField}
                  onChange={(e) => setSearchField(e.target.value as any)}
                  className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-purple-50 text-sm"
                >
                  <option value="all">🔍 جميع الحقول</option>
                  <option value="name">👤 الاسم</option>
                  <option value="email">📧 البريد الإلكتروني</option>
                  <option value="phone">📞 رقم الهاتف</option>
                  <option value="nationalId">🆔 الرقم المدني</option>
                  <option value="id">🔢 رقم المعرف</option>
                  <option value="building">🏢 رقم المبنى/الوحدة</option>
                </select>
              </div>

              {/* حقل البحث */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  كلمة البحث
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                    placeholder={
                      searchField === 'all' ? 'ابحث في جميع الحقول...' :
                      searchField === 'name' ? 'مثال: محمد' :
                      searchField === 'email' ? 'مثال: ahmed@example.com' :
                      searchField === 'phone' ? 'مثال: 92890123' :
                      searchField === 'nationalId' ? 'مثال: 12345678' :
                      searchField === 'id' ? 'مثال: TENANT-002 أو T-AH12...' :
                      'مثال: 123 أو A-201'
                    }
                  />
                  <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              
              {/* الحالة */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <FaFilter className="inline ml-1 w-3 h-3" />
                  الحالة
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                >
                  <option value="all">الكل</option>
                  <option value="active">نشط</option>
                  <option value="inactive">غير نشط</option>
                  <option value="suspended">موقوف</option>
                </select>
              </div>
            </div>
            
            {/* عرض نتائج البحث */}
            {searchQuery && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <div className="text-gray-600 flex items-center gap-2">
                    <FaCheckCircle className="text-green-500 w-4 h-4" />
                    <span>نتيجة:</span>
                    <span className="font-bold text-purple-600">{filteredTenants.length}</span>
                    <span>من</span>
                    <span className="font-bold text-gray-900">{tenants.length}</span>
                  </div>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSearchField('all');
                    }}
                    className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1.5 text-xs"
                  >
                    <FaTimes className="w-3 h-3" />
                    مسح
                  </button>
                </div>
              </div>
            )}
          </div>

            <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-600">
                  عرض {filteredTenants.length} من {tenants.length} مستأجر
                </div>
                
                {/* زر التبديل بين Grid و List */}
                <button
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-gray-300 rounded-lg hover:border-purple-500 transition-colors"
                  title={viewMode === 'grid' ? 'التبديل للقائمة' : 'التبديل للشبكة'}
                  suppressHydrationWarning
                >
                  {viewMode === 'grid' ? (
                    <>
                      <FaList className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-700" suppressHydrationWarning>قائمة</span>
                    </>
                  ) : (
                    <>
                      <FaTh className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-700" suppressHydrationWarning>شبكي</span>
                    </>
                  )}
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                {/* أزرار التصدير */}
                <button
                  onClick={exportToExcel}
                  className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm text-sm"
                  title="تصدير إلى Excel"
                >
                  <FaFileExcel className="w-4 h-4" />
                  <span className="hidden md:inline">Excel</span>
                </button>
                
                <button
                  onClick={exportToText}
                  className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm"
                  title="تصدير كملف نصي"
                >
                  <FaFileAlt className="w-4 h-4" />
                  <span className="hidden md:inline">Text</span>
                </button>
                
                <button
                  onClick={exportToPDF}
                  className="flex items-center gap-1.5 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm text-sm"
                  title="تصدير إلى PDF"
                >
                  <FaFilePdf className="w-4 h-4" />
                  <span className="hidden md:inline">PDF</span>
                </button>
                
              <InstantLink
                href="/rentals/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-md"
              >
                <FaPlus className="w-4 h-4" />
                إضافة عقد جديد
              </InstantLink>
            </div>
          </div>

          {/* قائمة المستأجرين */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <FaSpinner className="w-8 h-8 text-purple-600 animate-spin" />
              <span className="mr-3 text-gray-600">جاري التحميل...</span>
            </div>
          ) : filteredTenants.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <FaUsers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchQuery ? 'لا توجد نتائج' : 'لا يوجد مستأجرين'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery ? 'جرب البحث بكلمات مختلفة' : 'ابدأ بإضافة مستأجر جديد عبر صفحة العقود'}
              </p>
              <InstantLink
                href="/rentals/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <FaPlus className="w-4 h-4" />
                إضافة عقد جديد
              </InstantLink>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTenants.map((tenant) => (
                <motion.div
                  key={tenant.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
                >
                  {/* Header - Compact */}
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3">
                    <div className="flex flex-col items-center text-center gap-2">
                      <div className="w-16 h-16 bg-white bg-opacity-30 rounded-full flex items-center justify-center">
                        <FaUser className="w-8 h-8" />
                      </div>
                      <div className="w-full">
                        <button
                          onClick={() => {
                            setSelectedTenant(tenant);
                            setShowDetailsModal(true);
                          }}
                          className="font-bold text-base truncate w-full hover:bg-white/10 rounded px-2 py-1 transition-colors"
                        >
                          {tenant.name}
                        </button>
                        <p className="text-xs opacity-90">{tenant.id}</p>
                        <div className="mt-2">
                          {getStatusBadge(tenant.status)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Body - Compact */}
                  <div className="p-3">
                    <div className="space-y-2">
                      {/* البيانات الأساسية */}
                      <div className="space-y-1.5 text-xs">
                        {/* اسم المستخدم */}
                        <div className="flex items-center gap-2 text-blue-700 bg-blue-50 px-2 py-1 rounded-md">
                          <FaUser className="w-3 h-3 flex-shrink-0" />
                          <span className="font-bold truncate flex-1">
                            {tenant.credentials?.username || tenant.username || 'لم يُنشأ بعد'}
                          </span>
                        </div>
                        
                        {/* العقار */}
                        {tenant.propertyId ? (
                          <InstantLink
                            href={`/tenant/my-contract?tenantId=${tenant.id}`}
                            className="flex items-center gap-2 text-purple-700 bg-purple-50 px-2 py-1 rounded-md hover:bg-purple-100 hover:shadow-sm transition-all"
                          >
                            <FaBuilding className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate flex-1">
                              {tenant.buildingNo && `مبنى ${tenant.buildingNo}`}
                              {tenant.buildingNo && tenant.unitNo && ' - '}
                              {tenant.unitNo && `وحدة ${tenant.unitNo}`}
                            </span>
                            <FaEye className="w-3 h-3 flex-shrink-0" />
                          </InstantLink>
                        ) : (
                          <div className="flex items-center gap-2 text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                            <FaExclamationTriangle className="w-3 h-3 flex-shrink-0" />
                            <span className="text-xs truncate flex-1">لا يوجد عقد</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-gray-700">
                          <FaEnvelope className="w-3 h-3 text-purple-500 flex-shrink-0" />
                          <span className="truncate flex-1">{tenant.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <FaPhone className="w-3 h-3 text-purple-500 flex-shrink-0" />
                          <span className="flex-1">{tenant.phone}</span>
                        </div>
                        
                        {/* نوع المستأجر */}
                        {tenant.tenantDetails?.type && (
                          <div className="pt-1">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              tenant.tenantDetails.type === 'individual_omani' ? 'bg-green-100 text-green-800' :
                              tenant.tenantDetails.type === 'individual_foreign' ? 'bg-blue-100 text-blue-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {getTenantTypeLabel(tenant.tenantDetails.type)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* تنبيه العقد - Compact */}
                      {tenant.contractEndDate && (() => {
                        const contractStatus = getContractStatus(tenant.contractEndDate);
                        if (!contractStatus) return null;
                        
                        return (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <div className={`px-2 py-1.5 rounded-lg border text-center ${contractStatus.color}`}>
                              <div className="text-xs font-medium mb-0.5">
                                {contractStatus.icon} العقد: {contractStatus.label}
                              </div>
                              <div className="text-xs font-bold">
                                {contractStatus.status === 'expired' 
                                  ? `منتهي منذ ${contractStatus.days} يوم`
                                  : contractStatus.status === 'expiring-soon'
                                  ? `ينتهي خلال ${contractStatus.days} يوم`
                                  : `صالح`
                                }
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* تنبيه البطاقة - Compact */}
                      {tenant.tenantDetails?.nationalIdExpiry && (() => {
                        const cardStatus = getIdCardStatus(tenant.tenantDetails.nationalIdExpiry);
                        if (!cardStatus) return null;
                        
                        const cardFile = tenant.tenantDetails?.nationalIdFile || tenant.tenantDetails?.residenceIdAttachment;
                        
                        if (cardFile) {
                          return (
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <a
                                href={cardFile}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`block px-2 py-1.5 rounded-lg border text-center ${cardStatus.color} hover:shadow-md transition-all cursor-pointer`}
                              >
                                <div className="text-xs font-medium mb-0.5">
                                  {cardStatus.icon} البطاقة: {cardStatus.label}
                                </div>
                                <div className="text-xs font-bold flex items-center justify-center gap-1">
                                  {cardStatus.status === 'expired' 
                                    ? `منتهية منذ ${cardStatus.days} يوم`
                                    : cardStatus.status === 'expiring-soon'
                                    ? `باقي ${cardStatus.days} يوم`
                                    : `صالحة`
                                  }
                                  <FaEye className="w-3 h-3" />
                                </div>
                              </a>
                            </div>
                          );
                        } else {
                          return (
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <div className={`px-2 py-1.5 rounded-lg border text-center ${cardStatus.color}`}>
                                <div className="text-xs font-medium mb-0.5">
                                  {cardStatus.icon} البطاقة: {cardStatus.label}
                                </div>
                                <div className="text-xs font-bold">
                                  {cardStatus.status === 'expired' 
                                    ? `منتهية منذ ${cardStatus.days} يوم`
                                    : cardStatus.status === 'expiring-soon'
                                    ? `باقي ${cardStatus.days} يوم`
                                    : `صالحة`
                                  }
                                </div>
                              </div>
                            </div>
                          );
                        }
                      })()}

                      {/* تنبيهات الوثائق - Compact */}
                      {expiringDocuments.filter(d => d.tenantId === tenant.id).length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <div className="flex items-center justify-center gap-1">
                            <FaExclamationTriangle className="w-3 h-3 text-orange-500" />
                            <span className="text-xs font-medium text-orange-600">
                              {expiringDocuments.filter(d => d.tenantId === tenant.id).length} تنبيه آخر
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* حالة الاعتماد - Compact */}
                    {tenant.status === 'pending_approval' && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mb-2">
                          <div className="flex items-center gap-2 text-sm font-medium text-yellow-800">
                            <FaExclamationTriangle className="w-4 h-4" />
                            بانتظار الاعتماد
                          </div>
                          <div className="mt-2 space-y-1 text-xs">
                            <div className="flex items-center gap-2">
                              {tenant.credentials?.ownerApproved ? (
                                <FaCheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <FaTimesCircle className="w-4 h-4 text-gray-400" />
                              )}
                              <span>اعتماد المالك</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {tenant.credentials?.tenantApproved ? (
                                <FaCheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <FaTimesCircle className="w-4 h-4 text-gray-400" />
                              )}
                              <span>توقيع المستأجر</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {tenant.credentials?.adminApproved ? (
                                <FaCheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <FaTimesCircle className="w-4 h-4 text-gray-400" />
                              )}
                              <span>موافقة الإدارة</span>
                            </div>
                          </div>
                        </div>
                        
                        <button
                          onClick={async () => {
                            if (confirm('هل تريد اعتماد هذا المستأجر كمسؤول؟')) {
                              const response = await fetch('/api/tenants/approve', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  tenantId: tenant.id,
                                  approvalType: 'admin',
                                  approvedBy: 'ADMIN'
                                })
                              });
                              if (response.ok) {
                                alert('تم الاعتماد بنجاح!');
                                window.location.reload();
                              }
                            }
                          }}
                          className="w-full flex items-center justify-center gap-1 px-2 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-xs font-medium"
                        >
                          <FaCheckCircle className="w-3 h-3" />
                          اعتماد
                        </button>
                      </div>
                    )}
                    
                    {/* زر إرسال بيانات الدخول - Compact */}
                    {tenant.status === 'active' && !tenant.credentials?.sentViaWhatsApp && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <button
                          onClick={async () => {
                              if (confirm(`إرسال بيانات الدخول إلى ${tenant.name} عبر الواتساب والبريد؟`)) {
                                const response = await fetch('/api/tenants/send-credentials', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    tenantId: tenant.id,
                                    method: 'both' // whatsapp + email
                                  })
                                });
                                if (response.ok) {
                                  const data = await response.json();
                                  
                                  // فتح الواتساب مباشرة
                                  if (data.whatsappUrl) {
                                    window.open(data.whatsappUrl, '_blank');
                                  }
                                  
                                  alert(`✅ تم التحضير!\n\nاسم المستخدم: ${data.credentials.username}\n\nتم فتح الواتساب - أرسل الرسالة الآن!`);
                                  window.location.reload();
                                }
                              }
                            }}
                            className="w-full flex items-center justify-center gap-1 px-2 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all text-xs font-medium"
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                            إرسال للواتساب
                          </button>
                      </div>
                    )}
                    
                    {/* بعد الإرسال - Compact */}
                    {tenant.credentials?.sentViaWhatsApp && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
                          <div className="flex items-center justify-center gap-1 text-xs font-medium text-green-800">
                            <FaCheckCircle className="w-3 h-3" />
                            تم الإرسال ✓
                          </div>
                        </div>
                      </div>
                    )}

                    {/* أزرار الإجراءات - Compact Icons */}
                    <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => {
                          setSelectedTenant(tenant);
                          setShowEditModal(true);
                        }}
                        className="flex items-center justify-center w-10 h-10 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                        title="تعديل"
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => {
                          setSelectedTenant(tenant);
                          setShowPasswordModal(true);
                        }}
                        className="flex items-center justify-center w-10 h-10 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
                        title="كلمة المرور"
                      >
                        <FaKey className="w-4 h-4" />
                      </button>
                      
                      <button
                        className="flex items-center justify-center w-10 h-10 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        title="حذف"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="space-y-4">
              {filteredTenants.map((tenant) => (
                <motion.div
                  key={tenant.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
                >
                  <div className="flex items-center gap-4 p-4">
                    {/* Avatar */}
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaUser className="w-8 h-8 text-white" />
                    </div>

                    {/* معلومات أساسية */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <button
                          onClick={() => {
                            setSelectedTenant(tenant);
                            setShowDetailsModal(true);
                          }}
                          className="font-bold text-lg text-gray-900 hover:text-purple-600 transition-colors underline decoration-transparent hover:decoration-purple-600"
                        >
                          {tenant.name}
                        </button>
                        {getStatusBadge(tenant.status)}
                        {tenant.tenantDetails?.type && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            tenant.tenantDetails.type === 'individual_omani' ? 'bg-green-100 text-green-800' :
                            tenant.tenantDetails.type === 'individual_foreign' ? 'bg-blue-100 text-blue-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {getTenantTypeLabel(tenant.tenantDetails.type)}
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <FaUser className="w-4 h-4 text-blue-500" />
                          <span className="font-medium text-blue-600">
                            {tenant.credentials?.username || tenant.username || 'لم يُنشأ بعد'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaEnvelope className="w-4 h-4 text-purple-500" />
                          <span>{tenant.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaPhone className="w-4 h-4 text-purple-500" />
                          <span>{tenant.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaIdCard className="w-4 h-4 text-purple-500" />
                          <span>{tenant.id}</span>
                        </div>
                      </div>
                      
                      {/* بيانات العقار المستأجر */}
                      {(() => {
                        const tenantContracts = getTenantContracts(tenant);
                        
                        if (tenantContracts.length === 0) {
                          return (
                            <div className="mt-2 flex items-center gap-2 text-sm bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-gray-600">
                              <FaExclamationTriangle className="w-4 h-4 text-gray-500" />
                              <span>لا يوجد عقد موثق</span>
                            </div>
                          );
                        }
                        
                        if (tenantContracts.length === 1) {
                          const contract = tenantContracts[0];
                          return (
                            <div className="mt-2 space-y-2">
                              <InstantLink
                                href={`/tenant/my-contract?tenantId=${tenant.id}&contractId=${contract.id}`}
                                className="flex items-center gap-4 text-sm bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg px-3 py-2 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
                              >
                                <div className="flex items-center gap-2">
                                  <FaBuilding className="w-4 h-4 text-blue-600" />
                                  <span className="font-medium text-blue-900">العقار:</span>
                                </div>
                                {contract.buildingNo && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-gray-600">مبنى:</span>
                                    <span className="font-bold text-blue-700">{contract.buildingNo}</span>
                                  </div>
                                )}
                                {contract.unitNo && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-gray-600">وحدة:</span>
                                    <span className="font-bold text-purple-700">{contract.unitNo}</span>
                                  </div>
                                )}
                                <FaEye className="w-4 h-4 text-blue-500 ml-auto" />
                              </InstantLink>
                            </div>
                          );
                        }
                        
                        // عقود متعددة
                        return (
                          <div className="mt-2 flex items-center gap-3 text-sm bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg px-3 py-2">
                            <FaBuilding className="w-4 h-4 text-blue-600" />
                            <span className="font-medium text-blue-900">
                              {tenantContracts.length} عقود إيجار
                            </span>
                            <button
                              onClick={() => {
                                setSelectedTenant(tenant);
                                setShowDetailsModal(true);
                              }}
                              className="mr-auto px-3 py-1 bg-blue-600 text-white rounded-full text-xs hover:bg-blue-700 transition-colors"
                            >
                              عرض الكل
                            </button>
                          </div>
                        );
                      })()}
                      
                      {/* تنبيه حالة البطاقة */}
                      {tenant.tenantDetails?.nationalIdExpiry && (() => {
                        const cardStatus = getIdCardStatus(tenant.tenantDetails.nationalIdExpiry);
                        if (!cardStatus) return null;
                        
                        const cardFile = tenant.tenantDetails?.nationalIdFile || tenant.tenantDetails?.residenceIdAttachment;
                        
                        if (cardFile) {
                          return (
                            <a
                              href={cardFile}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`mt-2 flex items-center justify-between text-sm border rounded-lg px-3 py-2 ${cardStatus.color} hover:shadow-md transition-all cursor-pointer`}
                            >
                              <div className="flex items-center gap-2">
                                <FaIdCard className="w-4 h-4" />
                                <span className="font-medium">
                                  {cardStatus.icon} البطاقة: {cardStatus.label}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold">
                                  {cardStatus.status === 'expired' 
                                    ? `منتهية منذ ${cardStatus.days} يوم`
                                    : cardStatus.status === 'expiring-soon'
                                    ? `باقي ${cardStatus.days} يوم`
                                    : `صالحة لـ ${cardStatus.days} يوم`
                                  }
                                </span>
                                <FaEye className="w-4 h-4" />
                              </div>
                            </a>
                          );
                        } else {
                          return (
                            <div className={`mt-2 flex items-center justify-between text-sm border rounded-lg px-3 py-2 ${cardStatus.color}`}>
                              <div className="flex items-center gap-2">
                                <FaIdCard className="w-4 h-4" />
                                <span className="font-medium">
                                  {cardStatus.icon} البطاقة: {cardStatus.label}
                                </span>
                              </div>
                              <div className="text-xs font-bold">
                                {cardStatus.status === 'expired' 
                                  ? `منتهية منذ ${cardStatus.days} يوم`
                                  : cardStatus.status === 'expiring-soon'
                                  ? `باقي ${cardStatus.days} يوم`
                                  : `صالحة لـ ${cardStatus.days} يوم`
                                }
                              </div>
                            </div>
                          );
                        }
                      })()}
                    </div>

                    {/* تنبيهات */}
                    {expiringDocuments.filter(d => d.tenantId === tenant.id).length > 0 && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 text-sm">
                        <FaExclamationTriangle className="w-4 h-4 text-orange-500 inline ml-1" />
                        {expiringDocuments.filter(d => d.tenantId === tenant.id).length} تنبيه
                      </div>
                    )}

                    {/* الأزرار */}
                    <div className="flex items-center gap-2">
                      {tenant.status === 'pending_approval' && (
                        <button
                          onClick={async () => {
                            if (confirm('اعتماد هذا المستأجر؟')) {
                              const response = await fetch('/api/tenants/approve', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  tenantId: tenant.id,
                                  approvalType: 'admin',
                                  approvedBy: 'ADMIN'
                                })
                              });
                              if (response.ok) {
                                fetchTenants();
                              }
                            }
                          }}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                        >
                          اعتماد
                        </button>
                      )}
                      
                      {tenant.status === 'active' && !tenant.credentials?.sentViaWhatsApp && (
                        <button
                          onClick={async () => {
                            const response = await fetch('/api/tenants/send-credentials', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ tenantId: tenant.id, method: 'both' })
                            });
                            if (response.ok) {
                              const data = await response.json();
                              if (data.whatsappUrl) window.open(data.whatsappUrl, '_blank');
                              fetchTenants();
                            }
                          }}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                        >
                          إرسال
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          setSelectedTenant(tenant);
                          setShowEditModal(true);
                        }}
                        className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                        title="تعديل"
                      >
                        <FaEdit className="w-4 h-4 mx-auto" />
                      </button>
                      
                      <button
                        onClick={() => {
                          setSelectedTenant(tenant);
                          setShowPasswordModal(true);
                        }}
                        className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100"
                        title="كلمة المرور"
                      >
                        <FaKey className="w-4 h-4 mx-auto" />
                      </button>
                      
                      <button
                        className="w-10 h-10 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                        title="حذف"
                      >
                        <FaTrash className="w-4 h-4 mx-auto" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showEditModal && selectedTenant && (
        <EditTenantModal
          tenant={selectedTenant}
          onClose={() => {
            setShowEditModal(false);
            setSelectedTenant(null);
          }}
          onSave={() => {
            fetchTenants();
            setShowEditModal(false);
            setSelectedTenant(null);
          }}
        />
      )}

      {showPasswordModal && selectedTenant && (
        <PasswordModal
          tenant={selectedTenant}
          onClose={() => {
            setShowPasswordModal(false);
            setSelectedTenant(null);
          }}
        />
      )}

      {showDetailsModal && selectedTenant && (
        <TenantDetailsModal
          tenant={selectedTenant}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedTenant(null);
          }}
        />
      )}
    </Layout>
  );
}

// Component لعرض تفاصيل المستأجر الكاملة
function TenantDetailsModal({ tenant, onClose }: any) {
  const [expandedContracts, setExpandedContracts] = useState(new Set<string>());

  const getTenantTypeLabel = (type: string) => {
    switch (type) {
      case 'individual_omani': return '🇴🇲 عماني';
      case 'individual_foreign': return '🌐 وافد';
      case 'company': return '🏢 شركة';
      default: return 'غير محدد';
    }
  };

  // الحصول على جميع عقود المستأجر
  const contracts: Contract[] = tenant.contracts && tenant.contracts.length > 0
    ? tenant.contracts
    : tenant.propertyId
    ? [{
        id: `contract-${tenant.id}-1`,
        propertyId: tenant.propertyId,
        buildingNo: tenant.buildingNo || '',
        unitNo: tenant.unitNo || '',
        unitId: tenant.unitId,
        contractStartDate: tenant.contractStartDate || '',
        contractEndDate: tenant.contractEndDate || '',
        status: 'active'
      }]
    : [];

  const toggleContract = (contractId: string) => {
    const newExpanded = new Set(expandedContracts);
    if (newExpanded.has(contractId)) {
      newExpanded.delete(contractId);
    } else {
      newExpanded.add(contractId);
    }
    setExpandedContracts(newExpanded);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-70 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-2xl font-bold">{tenant.name}</h3>
              <p className="text-sm opacity-90 mt-1">{tenant.id}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                title="طباعة"
              >
                <FaPrint className="w-4 h-4" />
                <span className="text-sm">طباعة</span>
              </button>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-white/20 rounded-full hover:bg-white/30 transition-colors flex items-center justify-center"
              >
                <FaTimesCircle className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* البيانات الأساسية */}
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaUser className="w-5 h-5 text-purple-600" />
                البيانات الأساسية
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
                <div>
                  <p className="text-sm text-gray-600 mb-1">اسم المستخدم</p>
                  <p className="font-bold text-blue-600">{tenant.credentials?.username || tenant.username || 'لم يُنشأ'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">البريد الإلكتروني</p>
                  <p className="font-medium text-gray-900">{tenant.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">رقم الهاتف</p>
                  <p className="font-medium text-gray-900">{tenant.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">نوع المستأجر</p>
                  <p className="font-medium text-gray-900">
                    {tenant.tenantDetails?.type ? getTenantTypeLabel(tenant.tenantDetails.type) : 'غير محدد'}
                  </p>
                </div>
              </div>
            </div>

            {/* عقود الإيجار */}
            {contracts.length > 0 ? (
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FaBuilding className="w-5 h-5 text-blue-600" />
                  عقود الإيجار
                  <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm">
                    {contracts.length}
                  </span>
                </h4>
                
                {/* قائمة العقود القابلة للتوسع */}
                <div className="space-y-3">
                  {contracts.map((contract, index) => (
                    <div key={contract.id} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 overflow-hidden">
                      {/* رأس العقد */}
                      <button
                        onClick={() => toggleContract(contract.id)}
                        className="w-full p-4 flex items-center justify-between hover:bg-blue-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                            {index + 1}
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-900">
                              مبنى {contract.buildingNo} - وحدة {contract.unitNo}
                            </div>
                            <div className="text-sm text-gray-600">
                              {contract.propertyId}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            contract.status === 'active' ? 'bg-green-100 text-green-800' :
                            contract.status === 'expiring-soon' ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {contract.status === 'active' ? 'نشط' : contract.status === 'expiring-soon' ? 'قريب الانتهاء' : 'منتهي'}
                          </span>
                          {expandedContracts.has(contract.id) ? 
                            <FaChevronUp className="w-4 h-4 text-gray-400" /> : 
                            <FaChevronDown className="w-4 h-4 text-gray-400" />
                          }
                        </div>
                      </button>

                      {/* تفاصيل العقد (قابلة للتوسع) */}
                      {expandedContracts.has(contract.id) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-t border-blue-300 bg-white p-4"
                        >
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-600 mb-1">تاريخ البداية</p>
                              <p className="font-bold text-gray-900">
                                {contract.contractStartDate ? new Date(contract.contractStartDate).toLocaleDateString('ar-SA', { timeZone: 'UTC' }) : '-'}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 mb-1">تاريخ الانتهاء</p>
                              <p className="font-bold text-gray-900">
                                {contract.contractEndDate ? new Date(contract.contractEndDate).toLocaleDateString('ar-SA', { timeZone: 'UTC' }) : '-'}
                              </p>
                            </div>
                          </div>
                          
                          <InstantLink
                            href={`/tenant/my-contract?tenantId=${tenant.id}&contractId=${contract.id}`}
                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors text-sm font-medium"
                          >
                            <FaEye className="w-4 h-4" />
                            عرض تفاصيل العقد الكاملة
                          </InstantLink>
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-gray-100 border border-gray-300 rounded-xl p-6 text-center">
                <FaExclamationTriangle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">لا يوجد عقد موثق لهذا المستأجر بعد</p>
              </div>
            )}

            {/* بيانات البطاقة */}
            {tenant.tenantDetails && (
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FaIdCard className="w-5 h-5 text-green-600" />
                  بيانات الهوية
                </h4>
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {tenant.tenantDetails.nationalId && (
                      <div>
                        <p className="text-gray-600 mb-1">رقم البطاقة/الإقامة</p>
                        <p className="font-bold text-gray-900">{tenant.tenantDetails.nationalId || tenant.tenantDetails.residenceId}</p>
                      </div>
                    )}
                    {tenant.tenantDetails.nationalIdExpiry && (
                      <div>
                        <p className="text-gray-600 mb-1">تاريخ الانتهاء</p>
                        <p className="font-bold text-gray-900">
                          {new Date(tenant.tenantDetails.nationalIdExpiry).toLocaleDateString('ar-SA', { timeZone: 'UTC' })}
                        </p>
                      </div>
                    )}
                    {tenant.tenantDetails.tribe && (
                      <div>
                        <p className="text-gray-600 mb-1">القبيلة</p>
                        <p className="font-medium text-gray-900">{tenant.tenantDetails.tribe}</p>
                      </div>
                    )}
                    {tenant.tenantDetails.employer && (
                      <div>
                        <p className="text-gray-600 mb-1">جهة العمل</p>
                        <p className="font-medium text-gray-900">{tenant.tenantDetails.employer}</p>
                      </div>
                    )}
                  </div>
                  
                  {(tenant.tenantDetails.nationalIdFile || tenant.tenantDetails.residenceIdAttachment) && (
                    <div className="mt-4 pt-4 border-t border-green-200">
                      <a
                        href={tenant.tenantDetails.nationalIdFile || tenant.tenantDetails.residenceIdAttachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        <FaEye className="w-4 h-4" />
                        عرض صورة البطاقة
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
          >
            إغلاق
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// Component لتغيير كلمة المرور
function PasswordModal({ tenant, onClose }: any) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/users?id=${tenant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword })
      });
      
      if (response.ok) {
        alert('تم تغيير كلمة المرور بنجاح');
        onClose();
      }
    } catch (error) {
      setError('حدث خطأ أثناء تغيير كلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
      >
        <div className="p-6 border-b border-gray-200 bg-purple-50">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FaKey className="text-purple-600" />
            تغيير كلمة المرور
          </h3>
          <p className="text-sm text-gray-600 mt-1">لـ: {tenant.name}</p>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور الجديدة</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="أدخل كلمة المرور الجديدة"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">تأكيد كلمة المرور</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="أعد إدخال كلمة المرور"
            />
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            <FaBell className="inline ml-2" />
            سيتم إرسال كلمة المرور الجديدة إلى البريد الإلكتروني: {tenant.email}
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            إلغاء
          </button>
          <button
            onClick={handleChangePassword}
            disabled={loading}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaKey />}
            تغيير كلمة المرور
          </button>
        </div>
      </motion.div>
    </div>
  );
}

