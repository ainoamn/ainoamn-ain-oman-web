import React from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { FaBuilding, FaHome, FaArrowLeft } from 'react-icons/fa';

interface Property {
  id: string;
  title?: any;
  titleAr?: string;
  titleEn?: string;
  priceOMR?: any;
  province?: string;
  state?: string;
  images?: string[];
  [key: string]: any;
}

interface PageProps {
  property: Property | null;
}

function PropertyAdminPage({ property }: PageProps) {
  // إذا لم توجد البيانات، اعرض رسالة خطأ
  if (!property) {
    return (
      <Layout>
        <Head>
          <title>لم يتم العثور على العقار</title>
        </Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl text-gray-400 mb-4">
              <FaBuilding />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              لم يتم العثور على العقار
            </h1>
            <p className="text-gray-600 mb-6">
              العقار المطلوب غير موجود أو تم حذفه
            </p>
            <Link
              href="/properties"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <FaBuilding className="text-sm" />
              العودة للعقارات
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  // الحصول على العنوان
  const getTitle = () => {
    if (property.titleAr) return property.titleAr;
    if (property.titleEn) return property.titleEn;
    if (property.title && property.title.ar) return property.title.ar;
    if (property.title && property.title.en) return property.title.en;
    return `عقار ${property.id}`;
  };

  return (
    <Layout>
      <Head>
        <title>إدارة {getTitle()} - عين عُمان</title>
      </Head>

      <main className="min-h-screen bg-gray-50">
        {/* Breadcrumbs */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center space-x-2 py-4 text-sm">
              <Link href="/" className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                <FaHome className="text-xs" />
                الرئيسية
              </Link>
              <span className="text-gray-400">/</span>
              <Link href="/properties" className="text-blue-600 hover:text-blue-800">
                العقارات
              </Link>
              <span className="text-gray-400">/</span>
              <Link href={`/properties/${property.id}`} className="text-blue-600 hover:text-blue-800">
                {getTitle()}
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-600">إدارة</span>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                إدارة {getTitle()}
              </h1>
              <p className="text-gray-600">
                إدارة شاملة لجميع جوانب العقار
              </p>
            </div>
            <Link
              href={`/properties/${property.id}`}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <FaArrowLeft className="text-sm" />
              العودة للعقار
            </Link>
          </div>

          {/* Admin Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* معلومات العقار */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">معلومات العقار</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">رقم المرجع:</span>
                  <span className="font-medium">{property.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">العنوان:</span>
                  <span className="font-medium">{getTitle()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الموقع:</span>
                  <span className="font-medium">
                    {property.province && property.state ? `${property.province} - ${property.state}` : 'غير محدد'}
                  </span>
                </div>
              </div>
            </div>

            {/* إدارة الحجوزات */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">إدارة الحجوزات</h3>
              <div className="space-y-3">
                <Link
                  href={`/properties/${property.id}/bookings`}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors font-medium text-center block"
                >
                  عرض الحجوزات
                </Link>
                <Link
                  href={`/properties/${property.id}/appointments`}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors font-medium text-center block"
                >
                  المواعيد
                </Link>
              </div>
            </div>

            {/* إدارة المالية */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">إدارة المالية</h3>
              <div className="space-y-3">
                <Link
                  href={`/properties/${property.id}/finance`}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors font-medium text-center block"
                >
                  التقارير المالية
                </Link>
                <Link
                  href={`/properties/${property.id}/payment`}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg transition-colors font-medium text-center block"
                >
                  إدارة المدفوعات
                </Link>
              </div>
            </div>

            {/* إدارة الصيانة */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">إدارة الصيانة</h3>
              <div className="space-y-3">
                <Link
                  href={`/properties/${property.id}/requests`}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg transition-colors font-medium text-center block"
                >
                  طلبات الصيانة
                </Link>
                <Link
                  href={`/properties/${property.id}/handover`}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors font-medium text-center block"
                >
                  تسليم العقار
                </Link>
              </div>
            </div>

            {/* إدارة العقود */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">إدارة العقود</h3>
              <div className="space-y-3">
                <Link
                  href={`/properties/${property.id}/book`}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition-colors font-medium text-center block"
                >
                  حجز العقار
                </Link>
                <Link
                  href={`/properties/${property.id}/complete`}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded-lg transition-colors font-medium text-center block"
                >
                  إكمال العملية
                </Link>
              </div>
            </div>

            {/* إدارة التواصل */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">إدارة التواصل</h3>
              <div className="space-y-3">
                <Link
                  href={`/properties/${property.id}/messages`}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded-lg transition-colors font-medium text-center block"
                >
                  الرسائل
                </Link>
                <Link
                  href={`/properties/${property.id}/customer-connection`}
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-4 rounded-lg transition-colors font-medium text-center block"
                >
                  ربط العملاء
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">إجراءات سريعة</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href={`/properties/${property.id}/edit`}
                className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors font-medium text-center"
              >
                تعديل العقار
              </Link>
              <Link
                href={`/properties/${property.id}`}
                className="bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg transition-colors font-medium text-center"
              >
                عرض العقار
              </Link>
              <button className="bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg transition-colors font-medium">
                حذف العقار
              </button>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as { id: string };
  
  try {
    // استيراد دالة getById
    const { getById } = await import('@/server/properties/store');
    
    // البحث عن العقار
    const property = getById(id);
    
    // إذا لم يوجد العقار
    if (!property) {
      return {
        props: {
          property: null
        }
      };
    }
    
    // تنظيف البيانات - استخراج القيم من arrays
    const cleaned: any = { ...property }; // نسخ جميع البيانات أولاً
    
    for (const [key, value] of Object.entries(property)) {
      if (Array.isArray(value) && value.length === 1) {
        // إذا كان array يحتوي على عنصر واحد، استخرجه
        cleaned[key] = value[0];
      } else if (Array.isArray(value) && value.length > 1) {
        // إذا كان array يحتوي على عدة عناصر، اتركه كما هو
        cleaned[key] = value;
      } else {
        // إذا لم يكن array، اتركه كما هو
        cleaned[key] = value;
      }
    }
    
    // التأكد من وجود id
    if (!cleaned.id) {
      cleaned.id = property.id;
    }
    
    // إرجاع العقار المنظف
    return {
      props: {
        property: cleaned
      }
    };
  } catch (error) {
    console.error('Error fetching property:', error);
    return {
      props: {
        property: null
      }
    };
  }
};

export default PropertyAdminPage;
