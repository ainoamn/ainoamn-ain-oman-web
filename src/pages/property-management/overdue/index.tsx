// src/pages/property-management/overdue/index.tsx - صفحة الحسابات المتأخرة
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import InstantLink from '@/components/InstantLink';

interface OverdueService {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
  unitId?: string;
  unitNo?: string;
  serviceType: string;
  serviceName: string;
  accountNumber: string;
  provider: string;
  monthlyAmount: number;
  currency: string;
  lastPaymentDate: string;
  nextDueDate: string;
  overdueAmount: number;
  overdueDays: number;
  isReimbursable: boolean;
  tenantId?: string;
  tenantName?: string;
}

interface OverdueDocument {
  id: string;
  propertyId: string;
  propertyTitle: string;
  documentType: string;
  documentName: string;
  expiryDate: string;
  daysUntilExpiry: number;
  status: string;
}

export default function OverdueAccounts() {
  const [overdueServices, setOverdueServices] = useState<OverdueService[]>([]);
  const [expiringDocuments, setExpiringDocuments] = useState<OverdueDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('services');

  useEffect(() => {
    fetchOverdueData();
  }, []);

  const fetchOverdueData = async () => {
    try {
      setLoading(true);

      // جلب الخدمات المتأخرة
      const servicesResponse = await fetch('/api/property-services?overdue=true');
      if (servicesResponse.ok) {
        const servicesData = await servicesResponse.json();
        const services = servicesData.services || [];
        
        // إضافة معلومات العقار لكل خدمة
        const servicesWithPropertyInfo = await Promise.all(
          services.map(async (service: any) => {
            try {
              const propertyResponse = await fetch(`/api/properties/${service.propertyId}`);
              if (propertyResponse.ok) {
                const propertyData = await propertyResponse.json();
                const property = propertyData.property;
                
                // حساب الأيام المتأخرة
                const today = new Date();
                const dueDate = new Date(service.nextDueDate);
                const overdueDays = Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
                
                return {
                  ...service,
                  propertyTitle: property.titleAr || 'عقار',
                  propertyAddress: property.address || '',
                  unitNo: service.unitId ? 'وحدة' : undefined,
                  overdueDays: Math.max(0, overdueDays),
                  overdueAmount: service.monthlyAmount * Math.ceil(overdueDays / 30)
                };
              }
              return service;
            } catch (error) {
              console.error('Error fetching property:', error);
              return service;
            }
          })
        );
        
        setOverdueServices(servicesWithPropertyInfo);
      }

      // جلب المستندات المنتهية الصلاحية
      const documentsResponse = await fetch('/api/property-documents?expiring=true');
      if (documentsResponse.ok) {
        const documentsData = await documentsResponse.json();
        const documents = documentsData.documents || [];
        
        // إضافة معلومات العقار لكل مستند
        const documentsWithPropertyInfo = await Promise.all(
          documents.map(async (document: any) => {
            try {
              const propertyResponse = await fetch(`/api/properties/${document.propertyId}`);
              if (propertyResponse.ok) {
                const propertyData = await propertyResponse.json();
                const property = propertyData.property;
                
                // حساب الأيام المتبقية
                const today = new Date();
                const expiryDate = new Date(document.expiryDate);
                const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                
                return {
                  ...document,
                  propertyTitle: property.titleAr || 'عقار',
                  daysUntilExpiry: Math.max(0, daysUntilExpiry),
                  status: daysUntilExpiry <= 0 ? 'expired' : daysUntilExpiry <= 30 ? 'expiring' : 'valid'
                };
              }
              return document;
            } catch (error) {
              console.error('Error fetching property:', error);
              return document;
            }
          })
        );
        
        setExpiringDocuments(documentsWithPropertyInfo);
      }

    } catch (error) {
      console.error('Error fetching overdue data:', error);
    } finally {
      setLoading(false);
    }
  };

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
      default: return '📄';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar', { 
      calendar: 'gregory', 
      numberingSystem: 'latn' 
    });
  };

  const formatCurrency = (amount: number, currency: string = 'OMR') => {
    return `${amount.toLocaleString()} ${currency}`;
  };

  const getUrgencyColor = (days: number) => {
    if (days <= 0) return 'text-red-600 bg-red-100';
    if (days <= 7) return 'text-orange-600 bg-orange-100';
    if (days <= 30) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>الحسابات المتأخرة - إدارة العقارات</title>
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
                  <h1 className="text-2xl font-bold text-gray-900">الحسابات المتأخرة</h1>
                  <p className="text-sm text-gray-500">متابعة الحسابات المتأخرة والمستندات المنتهية الصلاحية</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                  <span className="ml-2">📧</span>
                  إرسال تذكيرات
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* التبويبات */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('services')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'services'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="ml-2">⚡</span>
                الخدمات المتأخرة ({overdueServices.length})
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'documents'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="ml-2">📄</span>
                المستندات المنتهية ({expiringDocuments.length})
              </button>
            </nav>
          </div>
        </div>

        {/* المحتوى */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'services' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {overdueServices.length > 0 ? (
                <div className="space-y-4">
                  {overdueServices.map((service) => (
                    <div key={service.id} className="bg-white rounded-lg shadow p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <span className="text-3xl">{getServiceIcon(service.serviceType)}</span>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-lg font-medium text-gray-900">{service.serviceName}</h3>
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getUrgencyColor(service.overdueDays)}`}>
                                {service.overdueDays > 0 ? `${service.overdueDays} يوم متأخر` : 'متأخر'}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p><strong>العقار:</strong> {service.propertyTitle}</p>
                              <p><strong>العنوان:</strong> {service.propertyAddress}</p>
                              {service.unitNo && <p><strong>الوحدة:</strong> {service.unitNo}</p>}
                              <p><strong>المزود:</strong> {service.provider}</p>
                              <p><strong>رقم الحساب:</strong> {service.accountNumber}</p>
                              <p><strong>آخر دفع:</strong> {formatDate(service.lastPaymentDate)}</p>
                              <p><strong>تاريخ الاستحقاق:</strong> {formatDate(service.nextDueDate)}</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-left">
                          <div className="text-2xl font-bold text-red-600 mb-2">
                            {formatCurrency(service.overdueAmount, service.currency)}
                          </div>
                          <div className="text-sm text-gray-500 mb-4">
                            المبلغ الشهري: {formatCurrency(service.monthlyAmount, service.currency)}
                          </div>
                          <div className="flex space-x-2">
                            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
                              تسديد
                            </button>
                            <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm">
                              تذكير
                            </button>
                            <InstantLink
                              href={`/property-management/${service.propertyId}?tab=services`}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                            >
                              إدارة
                            </InstantLink>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
                  <span className="text-4xl mb-4 block">✅</span>
                  <h3 className="text-lg font-medium text-green-800 mb-2">لا توجد حسابات متأخرة</h3>
                  <p className="text-green-600">جميع الحسابات محدثة ومستحقة في مواعيدها</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'documents' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {expiringDocuments.length > 0 ? (
                <div className="space-y-4">
                  {expiringDocuments.map((document) => (
                    <div key={document.id} className="bg-white rounded-lg shadow p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <span className="text-3xl">{getDocumentIcon(document.documentType)}</span>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-lg font-medium text-gray-900">{document.documentName}</h3>
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                document.status === 'expired' 
                                  ? 'text-red-600 bg-red-100'
                                  : 'text-orange-600 bg-orange-100'
                              }`}>
                                {document.status === 'expired' ? 'منتهي' : 'ينتهي قريباً'}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p><strong>العقار:</strong> {document.propertyTitle}</p>
                              <p><strong>النوع:</strong> {document.documentType}</p>
                              <p><strong>تاريخ الانتهاء:</strong> {formatDate(document.expiryDate)}</p>
                              <p><strong>الأيام المتبقية:</strong> {document.daysUntilExpiry} يوم</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-left">
                          <div className={`text-2xl font-bold mb-2 ${
                            document.status === 'expired' ? 'text-red-600' : 'text-orange-600'
                          }`}>
                            {document.daysUntilExpiry <= 0 ? 'منتهي' : `${document.daysUntilExpiry} يوم`}
                          </div>
                          <div className="flex space-x-2">
                            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
                              تجديد
                            </button>
                            <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm">
                              تذكير
                            </button>
                            <InstantLink
                              href={`/property-management/${document.propertyId}?tab=documents`}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                            >
                              إدارة
                            </InstantLink>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
                  <span className="text-4xl mb-4 block">✅</span>
                  <h3 className="text-lg font-medium text-green-800 mb-2">لا توجد مستندات منتهية</h3>
                  <p className="text-green-600">جميع المستندات صالحة ولا تحتاج تجديد</p>
                </div>
              )}
            </motion.div>
          )}
        </main>
      </div>
    </>
  );
}
