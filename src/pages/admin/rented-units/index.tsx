// src/pages/admin/rented-units/index.tsx - نظام إدارة الوحدات المؤجرة الشامل
import { NextPage } from "next";
import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import InstantLink from "@/components/InstantLink";
import { motion } from "framer-motion";
import {
  FaHome, FaFileInvoice, FaCreditCard, FaTools, FaChartLine, FaTasks,
  FaExclamationCircle, FaPlus, FaSearch, FaEye, FaEdit,
  FaCalendar, FaDollarSign, FaUser, FaBuilding, FaClock,
  FaCheckCircle, FaTimesCircle, FaSpinner, FaDownload, FaPrint, FaExternalLinkAlt
} from "react-icons/fa";

interface RentedUnit {
  id: string;
  propertyId: string;
  unitId?: string;
  tenantId: string;
  tenantName: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  currency: string;
  status: 'active' | 'expired' | 'terminated';
}

interface Invoice {
  id: string;
  invoiceNumber?: string;
  propertyId?: string;
  unitId?: string;
  contractId?: string;
  customerId?: string;
  customerName?: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: string;
  dueDate?: string;
  paidDate?: string;
  currency?: string;
  type?: string;
}

interface Payment {
  id: string;
  paymentNumber?: string;
  invoiceId?: string;
  amount: number;
  status?: string;
  method?: string;
  paymentDate?: string;
  payerName?: string;
  currency?: string;
}

interface MaintenanceRequest {
  id: string;
  requestNumber?: string;
  unitId?: string;
  propertyId?: string;
  tenantId?: string;
  tenantName?: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  reportedDate?: string;
  createdAt?: string;
}

interface Task {
  id: string;
  title: string;
  status?: string;
  priority?: string;
  propertyId?: string;
  unitId?: string;
  assignee?: string;
  dueDate?: string;
  createdAt?: string;
}

const RentedUnitsManagementPage: NextPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'units' | 'invoices' | 'payments' | 'maintenance' | 'tasks' | 'reports'>('units');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  
  // Data states
  const [rentals, setRentals] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [units, setUnits] = useState<RentedUnit[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    // عند تغيير التبويب، جلب البيانات المناسبة (بعد تحميل الوحدات)
    if (units.length > 0 || !loading) {
      if (activeTab === 'invoices') {
        fetchInvoices();
      } else if (activeTab === 'payments') {
        fetchPayments();
      } else if (activeTab === 'maintenance') {
        fetchMaintenance();
      } else if (activeTab === 'tasks') {
        fetchTasks();
      }
    }
  }, [activeTab, units.length, loading]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [rentalsRes, propertiesRes] = await Promise.all([
        fetch("/api/rentals"),
        fetch("/api/properties")
      ]);

      if (rentalsRes.ok) {
        const rentalsData = await rentalsRes.json();
        const allRentals = Array.isArray(rentalsData?.items) ? rentalsData.items : [];
        
        // فلترة فقط العقود النشطة
        const activeRentals = allRentals.filter((r: any) => {
          const state = (r as any).signatureWorkflow || r.state;
          return state === 'active' || state === 'paid' || state === 'handover_completed';
        });
        
        setRentals(activeRentals);
        
        // تحويل العقود إلى وحدات مؤجرة
        const rentedUnitsData: RentedUnit[] = activeRentals.map((rental: any) => ({
          id: rental.id,
          propertyId: rental.propertyId,
          unitId: rental.unitId,
          tenantId: rental.tenantId || rental.tenantName,
          tenantName: rental.tenantName || rental.tenantId || 'غير محدد',
          startDate: rental.startDate,
          endDate: rental.endDate,
          monthlyRent: rental.monthlyRent || rental.amount || 0,
          currency: rental.currency || 'OMR',
          status: rental.endDate && new Date(rental.endDate) < new Date() ? 'expired' : 'active'
        }));
        
        setUnits(rentedUnitsData);
      }

      if (propertiesRes.ok) {
        const propertiesData = await propertiesRes.json();
        setProperties(Array.isArray(propertiesData?.items) ? propertiesData.items : []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/invoices');
      if (response.ok) {
        const data = await response.json();
        const allInvoices = Array.isArray(data?.items) ? data.items : [];
        
        // فلترة الفواتير المرتبطة بالوحدات المؤجرة
        if (units.length > 0) {
          const rentedPropertyIds = units.map(u => u.propertyId);
          const rentedUnitIds = units.map(u => u.unitId).filter(Boolean);
          const rentedContractIds = units.map(u => u.id);
          
          const filteredInvoices = allInvoices.filter((inv: Invoice) => {
            return rentedPropertyIds.includes(inv.propertyId || '') ||
                   rentedUnitIds.includes(inv.unitId || '') ||
                   rentedContractIds.includes(inv.contractId || '');
          });
          
          setInvoices(filteredInvoices);
        } else {
          // إذا لم تكن هناك وحدات، اعرض جميع الفواتير
          setInvoices(allInvoices);
        }
      } else {
        setInvoices([]);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setInvoices([]);
    }
  };

  const fetchPayments = async () => {
    try {
      // جلب المدفوعات من API الحقيقي
      const response = await fetch('/api/payments');
      if (response.ok) {
        const data = await response.json();
        const allPayments = Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : []);
        
        // إذا كان هناك فواتير، فلترة المدفوعات حسب الفواتير
        if (invoices.length > 0) {
          const invoiceIds = invoices.map(inv => inv.id);
          const filteredPayments = allPayments.filter((pay: Payment) => {
            return invoiceIds.includes(pay.invoiceId || '') ||
                   (pay as any).invoiceId === undefined; // إذا لم يكن مرتبط بفاتورة
          });
          setPayments(filteredPayments);
        } else {
          // إذا لم تكن هناك فواتير، اعرض جميع المدفوعات المرتبطة بالوحدات
          // من خلال bookingId أو propertyId إذا كان موجوداً
          const rentedPropertyIds = units.map(u => u.propertyId);
          const filteredPayments = allPayments.filter((pay: Payment) => {
            const payment = pay as any;
            return rentedPropertyIds.some(propId => 
              payment.propertyId === propId ||
              payment.bookingId?.includes(propId)
            );
          });
          setPayments(filteredPayments.length > 0 ? filteredPayments : allPayments);
        }
      } else {
        setPayments([]);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPayments([]);
    }
  };

  const fetchMaintenance = async () => {
    try {
      const response = await fetch('/api/admin/maintenance');
      if (response.ok) {
        const data = await response.json();
        const allRequests = Array.isArray(data?.requests) ? data.requests : [];
        
        // فلترة طلبات الصيانة المرتبطة بالوحدات المؤجرة
        if (units.length > 0) {
          const rentedUnitIds = units.map(u => u.unitId).filter(Boolean);
          const rentedPropertyIds = units.map(u => u.propertyId);
          const rentedTenantIds = units.map(u => u.tenantId);
          
          const filteredRequests = allRequests.filter((req: MaintenanceRequest) => {
            return rentedUnitIds.includes(req.unitId || '') ||
                   rentedPropertyIds.includes(req.propertyId || '') ||
                   rentedTenantIds.includes(req.tenantId || '');
          });
          
          setMaintenanceRequests(filteredRequests);
        } else {
          // إذا لم تكن هناك وحدات، اعرض جميع الطلبات
          setMaintenanceRequests(allRequests);
        }
      } else {
        setMaintenanceRequests([]);
      }
    } catch (error) {
      console.error('Error fetching maintenance:', error);
      setMaintenanceRequests([]);
    }
  };

  const fetchTasks = async () => {
    try {
      if (units.length === 0) {
        setTasks([]);
        return;
      }
      
      // جلب المهام المرتبطة بالعقارات المؤجرة
      const rentedPropertyIds = units.map(u => u.propertyId);
      const rentedUnitIds = units.map(u => u.unitId).filter(Boolean);
      const allTasks: Task[] = [];
      
      // جلب المهام لكل عقار
      for (const propertyId of rentedPropertyIds) {
        try {
          const response = await fetch(`/api/tasks/simple?propertyId=${propertyId}`);
          if (response.ok) {
            const data = await response.json();
            const tasks = Array.isArray(data?.tasks) ? data.tasks : [];
            allTasks.push(...tasks);
          }
        } catch (e) {
          console.error(`Error fetching tasks for property ${propertyId}:`, e);
        }
      }
      
      // فلترة المهام المرتبطة بالوحدات المؤجرة
      const filteredTasks = allTasks.filter((task: Task) => {
        return rentedPropertyIds.includes(task.propertyId || '') ||
               rentedUnitIds.includes(task.unitId || '');
      });
      
      // إزالة التكرارات
      const uniqueTasks = filteredTasks.filter((task, index, self) =>
        index === self.findIndex(t => t.id === task.id)
      );
      
      setTasks(uniqueTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    }
  };

  const getTitleFromProperty = (property: any) => {
    if (property?.titleAr) return property.titleAr;
    if (property?.titleEn) return property.titleEn;
    if (property?.title) {
      if (typeof property.title === 'string') return property.title;
      if (typeof property.title === 'object') return property.title.ar || property.title.en || '';
    }
    return property?.buildingNumber ? `مبنى ${property.buildingNumber}` : `العقار ${property?.id || ''}`;
  };

  const getDaysRemaining = (endDate: string): number | null => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'paid': 'مدفوعة',
      'pending': 'معلقة',
      'overdue': 'متأخرة',
      'sent': 'مرسلة',
      'draft': 'مسودة',
      'completed': 'مكتملة',
      'in_progress': 'قيد التنفيذ',
      'cancelled': 'ملغية',
      'open': 'مفتوحة',
      'done': 'منجزة'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'paid': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'overdue': 'bg-red-100 text-red-800',
      'sent': 'bg-blue-100 text-blue-800',
      'draft': 'bg-gray-100 text-gray-800',
      'completed': 'bg-green-100 text-green-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'cancelled': 'bg-gray-100 text-gray-800',
      'open': 'bg-yellow-100 text-yellow-800',
      'done': 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'low': 'bg-green-100 text-green-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-orange-100 text-orange-800',
      'urgent': 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const filteredUnits = units.filter(unit => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    const property = properties.find(p => p.id === unit.propertyId);
    const propertyTitle = getTitleFromProperty(property || {});
    return (
      unit.id?.toLowerCase().includes(search) ||
      unit.tenantName?.toLowerCase().includes(search) ||
      unit.tenantId?.toLowerCase().includes(search) ||
      propertyTitle?.toLowerCase().includes(search) ||
      unit.unitId?.toLowerCase().includes(search)
    );
  });

  if (loading && activeTab === 'units') {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>إدارة الوحدات المؤجرة - عين عُمان</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <FaHome className="text-amber-600" />
                  إدارة الوحدات المؤجرة
                </h1>
                <p className="mt-1 text-sm text-gray-500">نظام شامل لإدارة الوحدات المؤجرة: الفواتير، المدفوعات، الصيانة، المهام، والتقارير</p>
              </div>
              <div className="flex items-center gap-3">
                <InstantLink
                  href="/rentals/new"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FaPlus className="ml-2" />
                  إضافة عقد جديد
                </InstantLink>
                <InstantLink
                  href="/dashboard/admin"
                  className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  رجوع
                </InstantLink>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                {[
                  { id: 'units', label: 'الوحدات المؤجرة', icon: FaHome, count: units.length },
                  { id: 'invoices', label: 'الفواتير', icon: FaFileInvoice, count: invoices.length },
                  { id: 'payments', label: 'المدفوعات', icon: FaCreditCard, count: payments.length },
                  { id: 'maintenance', label: 'الصيانة', icon: FaTools, count: maintenanceRequests.length },
                  { id: 'tasks', label: 'المهام', icon: FaTasks, count: tasks.length },
                  { id: 'reports', label: 'التقارير', icon: FaChartLine, count: 0 }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`
                        py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
                        ${activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                      {tab.count > 0 && (
                        <span className="ml-2 py-0.5 px-2 text-xs bg-gray-100 rounded-full">
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Search Bar */}
          {activeTab === 'units' && (
            <div className="mb-6">
              <div className="relative">
                <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="ابحث بالوحدة، المستأجر، أو العقار..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Units Tab */}
          {activeTab === 'units' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">الوحدات المؤجرة ({filteredUnits.length})</h2>
                <InstantLink
                  href="/admin/financial/invoices"
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <span>عرض جميع الفواتير</span>
                  <FaExternalLinkAlt className="w-3 h-3" />
                </InstantLink>
              </div>
              
              {filteredUnits.length === 0 ? (
                <div className="p-10 text-center">
                  <FaHome className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-sm font-medium text-gray-900">لا توجد وحدات مؤجرة</h3>
                  <p className="mt-1 text-sm text-gray-500">ابدأ بإنشاء عقد إيجار جديد.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الوحدة</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المستأجر</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ البدء</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ الانتهاء</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإيجار الشهري</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المدة المتبقية</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUnits.map((unit) => {
                        const property = properties.find(p => p.id === unit.propertyId);
                        const daysRemaining = getDaysRemaining(unit.endDate);
                        return (
                          <tr key={unit.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {getTitleFromProperty(property || {}) || 'غير محدد'}
                              </div>
                              {unit.unitId && (
                                <div className="text-xs text-gray-500">وحدة: {unit.unitId}</div>
                              )}
                              {property?.buildingNumber && (
                                <div className="text-xs text-gray-500">مبنى: {property.buildingNumber}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{unit.tenantName}</div>
                              <div className="text-xs text-gray-500">{unit.tenantId}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {unit.startDate ? new Date(unit.startDate).toLocaleDateString('ar-EG') : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {unit.endDate ? new Date(unit.endDate).toLocaleDateString('ar-EG') : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {unit.monthlyRent.toLocaleString()} {unit.currency}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {daysRemaining !== null ? (
                                <span className={`text-sm font-medium ${
                                  daysRemaining < 30 ? 'text-red-600' :
                                  daysRemaining < 90 ? 'text-orange-600' :
                                  'text-green-600'
                                }`}>
                                  {daysRemaining > 0 ? `${daysRemaining} يوم` : 'منتهي'}
                                </span>
                              ) : (
                                <span className="text-sm text-gray-500">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                unit.status === 'active' ? 'bg-green-100 text-green-800' :
                                unit.status === 'expired' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {unit.status === 'active' ? 'نشط' : unit.status === 'expired' ? 'منتهي' : 'منهي'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center gap-2">
                                <InstantLink
                                  href={`/admin/rented-units/${unit.id}`}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  <FaEye className="inline ml-1" />
                                  عرض
                                </InstantLink>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {/* Invoices Tab */}
          {activeTab === 'invoices' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">الفواتير المرتبطة بالوحدات المؤجرة ({invoices.length})</h2>
                <div className="flex items-center gap-3">
                  <InstantLink
                    href="/admin/invoices/new"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    <FaPlus className="ml-2" />
                    فاتورة جديدة
                  </InstantLink>
                  <InstantLink
                    href="/admin/financial/invoices"
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <span>عرض جميع الفواتير</span>
                    <FaExternalLinkAlt className="w-3 h-3" />
                  </InstantLink>
                </div>
              </div>
              
              {invoices.length === 0 ? (
                <div className="p-10 text-center">
                  <FaFileInvoice className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-sm font-medium text-gray-900">لا توجد فواتير</h3>
                  <p className="mt-1 text-sm text-gray-500">لا توجد فواتير مرتبطة بالوحدات المؤجرة.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">رقم الفاتورة</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">العميل</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المبلغ الإجمالي</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المدفوع</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المتبقي</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ الاستحقاق</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {invoices.map((invoice) => {
                        const unit = units.find(u => u.propertyId === invoice.propertyId || u.unitId === invoice.unitId);
                        const property = properties.find(p => p.id === invoice.propertyId);
                        return (
                          <tr key={invoice.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {invoice.invoiceNumber || invoice.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{invoice.customerName || 'غير محدد'}</div>
                              {property && (
                                <div className="text-xs text-gray-500">{getTitleFromProperty(property)}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {invoice.totalAmount?.toLocaleString() || 0} {invoice.currency || 'OMR'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                              {invoice.paidAmount?.toLocaleString() || 0} {invoice.currency || 'OMR'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                              {invoice.remainingAmount?.toLocaleString() || 0} {invoice.currency || 'OMR'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('ar-EG') : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                                {getStatusLabel(invoice.status)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <InstantLink
                                href={`/admin/financial/invoices`}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                عرض
                              </InstantLink>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">المدفوعات المرتبطة بالوحدات المؤجرة ({payments.length})</h2>
                <div className="flex items-center gap-3">
                  <InstantLink
                    href="/admin/financial/payments"
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    <FaPlus className="ml-2" />
                    تسجيل دفعة جديدة
                  </InstantLink>
                  <InstantLink
                    href="/admin/financial/payments"
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <span>عرض جميع المدفوعات</span>
                    <FaExternalLinkAlt className="w-3 h-3" />
                  </InstantLink>
                </div>
              </div>
              
              {payments.length === 0 ? (
                <div className="p-10 text-center">
                  <FaCreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-sm font-medium text-gray-900">لا توجد مدفوعات</h3>
                  <p className="mt-1 text-sm text-gray-500">لا توجد مدفوعات مرتبطة بفواتير الوحدات المؤجرة.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">رقم الدفعة</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الدافع</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المبلغ</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">طريقة الدفع</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ الدفع</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {payments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {payment.paymentNumber || payment.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {payment.payerName || 'غير محدد'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {payment.amount?.toLocaleString() || 0} {payment.currency || 'OMR'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {payment.method || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString('ar-EG') : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status || '')}`}>
                              {getStatusLabel(payment.status || '')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <InstantLink
                              href={`/admin/financial/payments`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              عرض
                            </InstantLink>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {/* Maintenance Tab */}
          {activeTab === 'maintenance' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">طلبات الصيانة للوحدات المؤجرة ({maintenanceRequests.length})</h2>
                <div className="flex items-center gap-3">
                  <InstantLink
                    href="/admin/maintenance/new"
                    className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm"
                  >
                    <FaPlus className="ml-2" />
                    طلب صيانة جديد
                  </InstantLink>
                  <InstantLink
                    href="/admin/maintenance"
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <span>عرض جميع طلبات الصيانة</span>
                    <FaExternalLinkAlt className="w-3 h-3" />
                  </InstantLink>
                </div>
              </div>
              
              {maintenanceRequests.length === 0 ? (
                <div className="p-10 text-center">
                  <FaTools className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-sm font-medium text-gray-900">لا توجد طلبات صيانة</h3>
                  <p className="mt-1 text-sm text-gray-500">لا توجد طلبات صيانة للوحدات المؤجرة.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">رقم الطلب</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">العنوان</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المستأجر</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الوحدة</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الأولوية</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ الطلب</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {maintenanceRequests.map((request) => {
                        const unit = units.find(u => u.unitId === request.unitId || u.propertyId === request.propertyId);
                        const property = properties.find(p => p.id === request.propertyId);
                        return (
                          <tr key={request.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {request.requestNumber || request.id}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {request.title}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {request.tenantName || 'غير محدد'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {property ? getTitleFromProperty(property) : '-'}
                              </div>
                              {request.unitId && (
                                <div className="text-xs text-gray-500">وحدة: {request.unitId}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                                {request.priority === 'low' ? 'منخفضة' :
                                 request.priority === 'medium' ? 'متوسطة' :
                                 request.priority === 'high' ? 'عالية' : 'عاجلة'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                {getStatusLabel(request.status)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {request.reportedDate || request.createdAt ? new Date(request.reportedDate || request.createdAt || '').toLocaleDateString('ar-EG') : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <InstantLink
                                href={`/admin/maintenance`}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                عرض
                              </InstantLink>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">المهام المرتبطة بالوحدات المؤجرة ({tasks.length})</h2>
                <div className="flex items-center gap-3">
                  <InstantLink
                    href="/admin/tasks"
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                  >
                    <FaPlus className="ml-2" />
                    مهمة جديدة
                  </InstantLink>
                  <InstantLink
                    href="/admin/tasks"
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <span>عرض جميع المهام</span>
                    <FaExternalLinkAlt className="w-3 h-3" />
                  </InstantLink>
                </div>
              </div>
              
              {tasks.length === 0 ? (
                <div className="p-10 text-center">
                  <FaTasks className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-sm font-medium text-gray-900">لا توجد مهام</h3>
                  <p className="mt-1 text-sm text-gray-500">لا توجد مهام مرتبطة بالوحدات المؤجرة.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المهمة</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الأولوية</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المحال إليه</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ الاستحقاق</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {tasks.map((task) => {
                        const unit = units.find(u => u.propertyId === task.propertyId || u.unitId === task.unitId);
                        const property = properties.find(p => p.id === task.propertyId);
                        return (
                          <tr key={task.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">{task.title}</div>
                              {property && (
                                <div className="text-xs text-gray-500">{getTitleFromProperty(property)}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status || '')}`}>
                                {getStatusLabel(task.status || '')}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {task.priority && (
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                  {task.priority === 'low' ? 'منخفضة' :
                                   task.priority === 'medium' ? 'متوسطة' :
                                   task.priority === 'high' ? 'عالية' : 'عاجلة'}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {task.assignee || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {task.dueDate ? new Date(task.dueDate).toLocaleDateString('ar-EG') : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <InstantLink
                                href={`/admin/tasks/${task.id}`}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                عرض
                              </InstantLink>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="text-center py-12">
                <FaChartLine className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">التقارير المالية</h3>
                <p className="text-gray-500 mb-6">عرض التقارير المالية الشاملة للوحدات المؤجرة</p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <InstantLink
                    href="/admin/financial/reports"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <FaChartLine className="ml-2" />
                    عرض جميع التقارير
                  </InstantLink>
                  <InstantLink
                    href="/admin/financial/reports/receivables-aging"
                    className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <FaDownload className="ml-2" />
                    تقرير المتأخرات
                  </InstantLink>
                  <InstantLink
                    href="/admin/financial/reports/profit-loss"
                    className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    <FaChartLine className="ml-2" />
                    تقرير الأرباح والخسائر
                  </InstantLink>
                </div>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </>
  );
};

export default RentedUnitsManagementPage;
