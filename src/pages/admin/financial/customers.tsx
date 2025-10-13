// src/pages/admin/financial/customers.tsx - نظام إدارة العملاء والموردين الشامل
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  FiUsers, FiPlus, FiSearch, FiFilter, FiEye, FiEdit, FiTrash2,
  FiDownload, FiUpload, FiMail, FiPhone, FiMapPin, FiGlobe,
  FiDollarSign, FiStar, FiAlertCircle, FiCheckCircle, FiRefreshCw
} from 'react-icons/fi';
import { Contact, ContactType } from '@/types/contacts';
import { analyzeCustomerBehavior } from '@/lib/financial-ai';

export default function CustomersPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<ContactType | ''>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      // بيانات تجريبية
      const mockContacts: Contact[] = [
        {
          id: 'contact_1',
          type: 'customer',
          name: 'أحمد محمد السالمي',
          companyName: 'شركة السالمي التجارية',
          taxId: 'OM123456789',
          email: 'ahmed@alsalmi.com',
          phone: '+968 9123 4567',
          mobile: '+968 9123 4567',
          address: {
            street: 'شارع السلطان قابوس',
            city: 'مسقط',
            state: 'محافظة مسقط',
            country: 'سلطنة عُمان',
            postalCode: '100'
          },
          currency: 'OMR',
          paymentTerms: 30,
          creditLimit: 10000,
          currentBalance: 1500,
          category: 'VIP',
          tags: ['مستأجر', 'منتظم'],
          isActive: true,
          isVerified: true,
          createdAt: '2024-06-15T08:00:00Z',
          updatedAt: '2025-01-15T10:00:00Z'
        },
        {
          id: 'contact_2',
          type: 'vendor',
          name: 'شركة الصيانة المتقدمة',
          taxId: 'OM987654321',
          commercialRegistration: 'CR-2024-5678',
          email: 'info@maintenance.com',
          phone: '+968 2465 7890',
          address: {
            city: 'مسقط',
            country: 'سلطنة عُمان'
          },
          currency: 'OMR',
          paymentTerms: 15,
          creditLimit: 0,
          currentBalance: -3200,
          category: 'مورد خدمات',
          isActive: true,
          isVerified: true,
          createdAt: '2024-08-01T09:00:00Z',
          updatedAt: '2025-01-12T14:00:00Z'
        }
      ];

      setContacts(mockContacts);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: contacts.length,
    customers: contacts.filter(c => c.type === 'customer').length,
    vendors: contacts.filter(c => c.type === 'vendor').length,
    employees: contacts.filter(c => c.type === 'employee').length,
    totalReceivable: contacts.filter(c => c.currentBalance > 0).reduce((sum, c) => sum + c.currentBalance, 0),
    totalPayable: contacts.filter(c => c.currentBalance < 0).reduce((sum, c) => sum + Math.abs(c.currentBalance), 0)
  };

  const filteredContacts = contacts.filter(c => {
    const matchesType = !filterType || c.type === filterType;
    const matchesSearch = 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesSearch;
  });

  const getTypeColor = (type: ContactType) => {
    const colors = {
      customer: 'bg-blue-100 text-blue-800',
      vendor: 'bg-green-100 text-green-800',
      employee: 'bg-purple-100 text-purple-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[type];
  };

  const getTypeText = (type: ContactType) => {
    const types = { customer: 'عميل', vendor: 'مورد', employee: 'موظف', other: 'أخرى' };
    return types[type];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>العملاء والموردين - النظام المالي</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FiUsers className="text-blue-600" />
                العملاء والموردين
              </h1>
              <p className="text-gray-600 mt-2">إدارة جهات الاتصال والمستفيدين</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowImportModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <FiUpload />
                استيراد
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <FiPlus />
                إضافة جهة اتصال
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-600">الإجمالي</p>
          </div>
          <div className="bg-blue-50 rounded-lg shadow-sm p-4 text-center border border-blue-200">
            <p className="text-2xl font-bold text-blue-600">{stats.customers}</p>
            <p className="text-xs text-blue-700">عملاء</p>
          </div>
          <div className="bg-green-50 rounded-lg shadow-sm p-4 text-center border border-green-200">
            <p className="text-2xl font-bold text-green-600">{stats.vendors}</p>
            <p className="text-xs text-green-700">موردين</p>
          </div>
          <div className="bg-purple-50 rounded-lg shadow-sm p-4 text-center border border-purple-200">
            <p className="text-2xl font-bold text-purple-600">{stats.employees}</p>
            <p className="text-xs text-purple-700">موظفين</p>
          </div>
          <div className="bg-orange-50 rounded-lg shadow-sm p-4 text-center border border-orange-200">
            <p className="text-lg font-bold text-orange-600">{stats.totalReceivable.toLocaleString()}</p>
            <p className="text-xs text-orange-700">لنا عليهم</p>
          </div>
          <div className="bg-red-50 rounded-lg shadow-sm p-4 text-center border border-red-200">
            <p className="text-lg font-bold text-red-600">{stats.totalPayable.toLocaleString()}</p>
            <p className="text-xs text-red-700">لهم علينا</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="البحث..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as ContactType | '')}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="">جميع الأنواع</option>
              <option value="customer">عملاء</option>
              <option value="vendor">موردين</option>
              <option value="employee">موظفين</option>
            </select>

            <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2">
              <FiDownload />
              تصدير Excel
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الاسم</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">النوع</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الاتصال</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الرصيد</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">شروط الدفع</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredContacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{contact.name}</div>
                    {contact.companyName && (
                      <div className="text-xs text-gray-500">{contact.companyName}</div>
                    )}
                    {contact.taxId && (
                      <div className="text-xs text-gray-400">ض.ق: {contact.taxId}</div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(contact.type)}`}>
                      {getTypeText(contact.type)}
                    </span>
                    {contact.category && (
                      <div className="text-xs text-gray-500 mt-1">{contact.category}</div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-1">
                        <FiMail className="w-3 h-3 text-gray-400" />
                        <span>{contact.email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiPhone className="w-3 h-3 text-gray-400" />
                        <span>{contact.phone}</span>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className={`font-bold ${contact.currentBalance > 0 ? 'text-green-600' : contact.currentBalance < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                      {Math.abs(contact.currentBalance).toLocaleString()} ر.ع
                    </div>
                    <div className="text-xs text-gray-500">
                      {contact.currentBalance > 0 ? 'لنا عليه' : contact.currentBalance < 0 ? 'له علينا' : 'متوازن'}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {contact.paymentTerms} يوم
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {contact.isActive && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          <FiCheckCircle className="w-3 h-3 ml-1" />
                          نشط
                        </span>
                      )}
                      {contact.isVerified && (
                        <FiCheckCircle className="w-4 h-4 text-blue-600" title="موثق" />
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/admin/financial/customers/${contact.id}`)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      <button className="text-indigo-600 hover:text-indigo-900 p-1">
                        <FiEdit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Create Contact Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-blue-600 p-6 text-white">
                <h2 className="text-2xl font-bold">إضافة جهة اتصال جديدة</h2>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">النوع *</label>
                    <select className="w-full px-4 py-2 border rounded-lg">
                      <option value="customer">عميل</option>
                      <option value="vendor">مورد</option>
                      <option value="employee">موظف</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">الاسم *</label>
                    <input type="text" className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">البريد *</label>
                    <input type="email" className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">الهاتف *</label>
                    <input type="tel" className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">حد الائتمان</label>
                    <input type="number" className="w-full px-4 py-2 border rounded-lg" defaultValue="0" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">شروط الدفع (أيام)</label>
                    <input type="number" className="w-full px-4 py-2 border rounded-lg" defaultValue="30" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 flex justify-end gap-3">
                <button onClick={() => setShowCreateModal(false)} className="px-6 py-2 border rounded-lg">إلغاء</button>
                <button onClick={() => { alert('تم الحفظ!'); setShowCreateModal(false); }} className="px-6 py-2 bg-blue-600 text-white rounded-lg">حفظ</button>
              </div>
            </div>
          </div>
        )}

        {/* Import Modal */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
              <div className="bg-green-600 p-6 text-white">
                <h2 className="text-2xl font-bold">استيراد جهات الاتصال</h2>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">استيراد من النظام</label>
                    <select className="w-full px-4 py-2 border rounded-lg">
                      <option value="">اختر مصدر البيانات...</option>
                      <option value="users">المستخدمين المسجلين</option>
                      <option value="tenants">المستأجرين</option>
                      <option value="landlords">المُلاك</option>
                    </select>
                  </div>

                  <div className="border-t pt-4">
                    <label className="block text-sm font-medium mb-2">أو استيراد من ملف</label>
                    <input type="file" accept=".xlsx,.csv" className="w-full px-4 py-2 border rounded-lg" />
                    <p className="text-xs text-gray-500 mt-2">صيغ مدعومة: Excel, CSV</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 flex justify-end gap-3">
                <button onClick={() => setShowImportModal(false)} className="px-6 py-2 border rounded-lg">إلغاء</button>
                <button onClick={() => { alert('تم الاستيراد!'); setShowImportModal(false); }} className="px-6 py-2 bg-green-600 text-white rounded-lg">استيراد</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

