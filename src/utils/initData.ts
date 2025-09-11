// src/utils/initData.ts
export const initializeData = () => {
  if (typeof window === 'undefined') return;

  // تهيئة بيانات العقارات إذا لم تكن موجودة
  if (!localStorage.getItem('properties')) {
    const initialProperties = [
      {
        id: 'P-20250911102157',
        title: { ar: 'شقة فاخرة في القرم', en: 'Luxury Apartment in Al Qurum' },
        priceOMR: 1000,
        referenceNo: 'REF-001',
        status: 'vacant',
        published: true,
        location: {
          province: 'مسقط',
          state: 'القرم',
          village: 'السيفة'
        },
        description: 'شقة فاخرة في منطقة القرم بمسقط، Mobily furnished apartment in Al Qurum, Muscat',
        amenities: [' swimming pool', 'gym', 'parking', 'security'],
        images: ['/img/property1.jpg', '/img/property2.jpg'],
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem('properties', JSON.stringify(initialProperties));
  }

  // تهيئة بيانات الحجوزات إذا لم تكن موجودة
  if (!localStorage.getItem('propertyBookings')) {
    localStorage.setItem('propertyBookings', JSON.stringify([]));
  }
};