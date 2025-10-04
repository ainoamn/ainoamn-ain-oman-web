import React from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { FaBuilding, FaHome } from 'react-icons/fa';

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

function PropertyDetailsPage({ property }: PageProps) {
  // إذا لم توجد البيانات، اعرض رسالة خطأ
  if (!property || !property.id) {
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

  // الحصول على السعر
  const getPrice = () => {
    if (property.priceOMR) {
      const price = typeof property.priceOMR === 'string' ? property.priceOMR : property.priceOMR.toString();
      return new Intl.NumberFormat('ar-OM', {
        style: 'currency',
        currency: 'OMR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(parseFloat(price));
    }
    return 'غير محدد';
  };

  // الحصول على الموقع
  const getLocation = () => {
    const parts = [];
    if (property.province) parts.push(property.province);
    if (property.state) parts.push(property.state);
    return parts.length > 0 ? parts.join(' - ') : 'الموقع غير محدد';
  };

  return (
    <Layout>
      <Head>
        <title>{getTitle()} - عين عُمان</title>
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
              <span className="text-gray-600 truncate">
                {getTitle()}
              </span>
            </nav>
        </div>
      </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {getTitle()}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>📍 {getLocation()}</span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    متاح
                  </span>
                  </div>
              </div>
            </div>

            {/* السعر */}
            <div className="text-center mb-6">
              <div className="text-sm text-gray-600 mb-2">السعر</div>
              <div className="text-4xl font-bold text-green-600">
                {getPrice()}
              </div>
            </div>

            {/* الصور */}
            {property.images && property.images.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">الصور</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.images.slice(0, 6).map((image, index) => (
                    <div key={index} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={image}
                        alt={`صورة ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* معلومات العقار */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">معلومات العقار</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">رقم المرجع:</span>
                    <span className="font-medium">{property.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">الموقع:</span>
                    <span className="font-medium">{getLocation()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">السعر:</span>
                    <span className="font-medium text-green-600">{getPrice()}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">إجراءات</h4>
                <div className="space-y-3">
              <Link
                    href={`/properties/${property.id}/edit`}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors font-medium text-center block"
              >
                    تعديل العقار
              </Link>

              <Link 
                    href={`/properties/${property.id}/admin`}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors font-medium text-center block"
>
                    إدارة العقار
              </Link>
                </div>
              </div>
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
    // إضافة استيراد getAll دون حذف السطر السابق
    const { getAll } = await import('@/server/properties/store');
    
    // البحث عن العقار
    let property = getById(id);

    // إضافة مطابقة بديلة: مطابقة id كرقم أو مطابقة referenceNo
    if (!property) {
      const all = typeof getAll === 'function' ? getAll() : [];
      const target = String(id);
      property = all.find((p: any) =>
        String(p?.id) === target ||
        String(p?.id) === String(Number(target)) ||
        String(p?.referenceNo) === target
      );
    }
    
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
      cleaned.id = (property as any).id;
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

export default PropertyDetailsPage;
