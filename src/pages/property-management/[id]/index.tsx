// src/pages/property-management/[id]/index.tsx - صفحة إدارة العقار الرئيسية
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import InstantLink from '@/components/InstantLink';
import PropertyNotifications from '@/components/property/PropertyNotifications';
import { motion } from 'framer-motion';

interface Property {
  id: string;
  titleAr: string;
  titleEn: string;
  address: string;
  buildingType: 'single' | 'multi';
  units?: any[];
  ownerId: string;
}

interface Service {
  id: string;
  serviceType: string;
  serviceName: string;
  monthlyAmount: number;
  status: string;
  isOverdue: boolean;
  nextDueDate: string;
}

interface Document {
  id: string;
  documentType: string;
  documentName: string;
  status: string;
  expiryDate?: string;
}

interface Expense {
  id: string;
  expenseType: string;
  title: string;
  amount: number;
  date: string;
  status: string;
}

export default function PropertyManagement() {
  const router = useRouter();
  const { id } = router.query;
  const [activeTab, setActiveTab] = useState('overview');
  const [property, setProperty] = useState<Property | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  // جلب بيانات العقار
  useEffect(() => {
    if (id) {
      fetchPropertyData();
    }
  }, [id]);

  const fetchPropertyData = async () => {
    try {
      setLoading(true);
      
      // جلب بيانات العقار
      const propertyResponse = await fetch(`/api/properties/${id}`);
      if (propertyResponse.ok) {
        const propertyData = await propertyResponse.json();
        setProperty(propertyData.property);
      }

      // جلب الخدمات
      const servicesResponse = await fetch(`/api/property-services?propertyId=${id}`);
      if (servicesResponse.ok) {
        const servicesData = await servicesResponse.json();
        setServices(servicesData.services || []);
      }

      // جلب المستندات
      const documentsResponse = await fetch(`/api/property-documents?propertyId=${id}`);
      if (documentsResponse.ok) {
        const documentsData = await documentsResponse.json();
        setDocuments(documentsData.documents || []);
      }

      // جلب المصاريف
      const expensesResponse = await fetch(`/api/property-expenses?propertyId=${id}`);
      if (expensesResponse.ok) {
        const expensesData = await expensesResponse.json();
        setExpenses(expensesData.expenses || []);
      }

    } catch (error) {
      console.error('Error fetching property data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'نظرة عامة', icon: '📊' },
    { id: 'services', label: 'الخدمات والمرافق', icon: '⚡' },
    { id: 'documents', label: 'المستندات', icon: '📄' },
    { id: 'expenses', label: 'المصاريف', icon: '💰' },
    { id: 'reports', label: 'التقارير', icon: '📈' }
  ];

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case 'electricity': return '⚡';
      case 'water': return '💧';
      case 'internet': return '🌐';
      case 'gas': return '🔥';
      case 'maintenance': return '🔧';
      default: return '⚙️';
    }
  };

  const getDocumentIcon = (documentType: string) => {
    switch (documentType) {
      case 'deed': return '📜';
      case 'permit': return '📋';
      case 'insurance': return '🛡️';
      case 'contract': return '📝';
      case 'maintenance': return '🔧';
      default: return '📄';
    }
  };

  const getExpenseIcon = (expenseType: string) => {
    switch (expenseType) {
      case 'maintenance': return '🔧';
      case 'utilities': return '⚡';
      case 'insurance': return '🛡️';
      case 'cleaning': return '🧹';
      case 'security': return '🔒';
      default: return '💰';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar', { 
      calendar: 'gregory', 
      numberingSystem: 'latn' 
    });
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} ر.ع`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل بيانات العقار...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">العقار غير موجود</h1>
          <InstantLink href="/dashboard/property-owner" className="text-blue-600 hover:underline">
            العودة للوحة التحكم
          </InstantLink>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>إدارة العقار - {property.titleAr}</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* الشريط العلوي */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <InstantLink 
                  href="/dashboard/property-owner" 
                  className="text-gray-500 hover:text-gray-700"
                >
                  <span className="text-xl">←</span>
                </InstantLink>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{property.titleAr}</h1>
                  <p className="text-sm text-gray-500">{property.address}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  {property.buildingType === 'multi' ? 'مبنى متعدد الوحدات' : 'عقار منفرد'}
                </span>
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
                  <span className="text-sm">👤</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* التبويبات */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="ml-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* المحتوى */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* الإحصائيات السريعة */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <span className="text-2xl">⚡</span>
                    </div>
                    <div className="mr-4">
                      <p className="text-sm font-medium text-gray-500">الخدمات النشطة</p>
                      <p className="text-2xl font-bold text-gray-900">{services.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <span className="text-2xl">📄</span>
                    </div>
                    <div className="mr-4">
                      <p className="text-sm font-medium text-gray-500">المستندات</p>
                      <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <span className="text-2xl">💰</span>
                    </div>
                    <div className="mr-4">
                      <p className="text-sm font-medium text-gray-500">إجمالي المصاريف</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(expenses.reduce((sum, exp) => sum + exp.amount, 0))}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <span className="text-2xl">⚠️</span>
                    </div>
                    <div className="mr-4">
                      <p className="text-sm font-medium text-gray-500">الحسابات المتأخرة</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {services.filter(s => s.isOverdue).length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* التنبيهات */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b">
                  <h3 className="text-lg font-medium text-gray-900">التنبيهات</h3>
                </div>
                <div className="p-6">
                  <PropertyNotifications 
                    propertyId={id as string}
                    ownerId="khalid.alabri@ainoman.om"
                    limit={3}
                  />
                </div>
              </div>

              {/* الخدمات الحديثة */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b">
                  <h3 className="text-lg font-medium text-gray-900">الخدمات الحديثة</h3>
                </div>
                <div className="p-6">
                  {services.length > 0 ? (
                    <div className="space-y-4">
                      {services.slice(0, 3).map((service) => (
                        <div key={service.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <span className="text-2xl ml-3">{getServiceIcon(service.serviceType)}</span>
                            <div>
                              <p className="font-medium">{service.serviceName}</p>
                              <p className="text-sm text-gray-500">الاستحقاق: {formatDate(service.nextDueDate)}</p>
                            </div>
                          </div>
                          <div className="text-left">
                            <p className="font-medium">{formatCurrency(service.monthlyAmount)}</p>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              service.isOverdue ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {service.isOverdue ? 'متأخر' : 'مستحق'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">لا توجد خدمات مسجلة</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'services' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">الخدمات والمرافق</h2>
                <InstantLink
                  href={`/property-management/${id}/services/new`}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  <span className="ml-2">➕</span>
                  إضافة خدمة جديدة
                </InstantLink>
              </div>

              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الخدمة
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          المزود
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          المبلغ الشهري
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الاستحقاق
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الحالة
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          إجراءات
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {services.map((service) => (
                        <tr key={service.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="text-xl ml-3">{getServiceIcon(service.serviceType)}</span>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{service.serviceName}</div>
                                <div className="text-sm text-gray-500">{service.serviceType}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {service.serviceType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(service.monthlyAmount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(service.nextDueDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              service.isOverdue 
                                ? 'bg-red-100 text-red-800' 
                                : service.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {service.isOverdue ? 'متأخر' : service.status === 'active' ? 'نشط' : service.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900 ml-4">تعديل</button>
                            <button className="text-red-600 hover:text-red-900">حذف</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'documents' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">المستندات</h2>
                <InstantLink
                  href={`/property-management/${id}/documents/new`}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  <span className="ml-2">📤</span>
                  رفع مستند جديد
                </InstantLink>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {documents.map((document) => (
                  <div key={document.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center mb-4">
                      <span className="text-3xl ml-3">{getDocumentIcon(document.documentType)}</span>
                      <div>
                        <h3 className="font-medium text-gray-900">{document.documentName}</h3>
                        <p className="text-sm text-gray-500">{document.documentType}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">{document.title}</p>
                      {document.expiryDate && (
                        <p className="text-sm text-gray-500">
                          انتهاء الصلاحية: {formatDate(document.expiryDate)}
                        </p>
                      )}
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        document.status === 'valid' 
                          ? 'bg-green-100 text-green-800'
                          : document.status === 'expired'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {document.status === 'valid' ? 'صالح' : document.status === 'expired' ? 'منتهي' : 'معلق'}
                      </span>
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 text-sm">عرض</button>
                      <button className="text-gray-600 hover:text-gray-900 text-sm">تحميل</button>
                      <button className="text-red-600 hover:text-red-900 text-sm">حذف</button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'expenses' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">المصاريف</h2>
                <InstantLink
                  href={`/property-management/${id}/expenses/new`}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  <span className="ml-2">➕</span>
                  إضافة مصروف جديد
                </InstantLink>
              </div>

              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          المصروف
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          النوع
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          المبلغ
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          التاريخ
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الحالة
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          إجراءات
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {expenses.map((expense) => (
                        <tr key={expense.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="text-xl ml-3">{getExpenseIcon(expense.expenseType)}</span>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{expense.title}</div>
                                <div className="text-sm text-gray-500">{expense.expenseType}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {expense.expenseType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(expense.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(expense.date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              expense.status === 'paid' 
                                ? 'bg-green-100 text-green-800'
                                : expense.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {expense.status === 'paid' ? 'مدفوع' : expense.status === 'pending' ? 'معلق' : 'متأخر'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900 ml-4">عرض</button>
                            <button className="text-gray-600 hover:text-gray-900 ml-4">تعديل</button>
                            <button className="text-red-600 hover:text-red-900">حذف</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'reports' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-gray-900">التقارير المالية</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">تقرير المصاريف الشهري</h3>
                  <p className="text-gray-600">عرض تفصيلي للمصاريف خلال الشهر الحالي</p>
                  <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    عرض التقرير
                  </button>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">تقرير الخدمات</h3>
                  <p className="text-gray-600">تقرير شامل لجميع الخدمات والمرافق</p>
                  <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    عرض التقرير
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </>
  );
}
