// src/lib/unitPropertySystem.ts
// نظام فصل الوحدات - كل وحدة تصبح عقار منفصل

export interface ParentProperty {
  id: string;
  referenceNo: string;
  // معلومات أساسية مشتركة
  province: string;
  state: string;
  city: string;
  address: string;
  latitude: string;
  longitude: string;
  mapAddress: string;
  
  // معلومات العقار الأم
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  
  // التفاصيل المشتركة
  usageType: string;
  buildingAge: string;
  floors: string;
  totalArea: string;
  
  // المزايا المشتركة
  amenities: string[];
  customAmenities: string[];
  
  // المعلومات الإدارية
  surveyNumber: string;
  landNumber: string;
  notes: string;
  
  // معلومات المالك (مشتركة)
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  
  // حالة العقار الأم
  buildingType: 'multi';
  isParent: true;
  totalUnits: number;
  published: boolean;
  
  createdAt: string;
  updatedAt: string;
}

export interface UnitProperty {
  id: string;
  referenceNo: string; // رقم متسلسل فريد: UNIT-XXXX-A101-XXXXXX
  
  // ربط مع العقار الأم
  parentPropertyId: string;
  parentReferenceNo: string;
  isUnit: true;
  
  // معلومات الوحدة الخاصة
  unitNo: string; // A-101, B-205, etc.
  floor: number;
  
  // معلومات أساسية منسوخة من الأم (قابلة للتعديل)
  titleAr: string; // مثلاً: "وحدة A-101 - برج السلام"
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  province: string;
  state: string;
  city: string;
  address: string;
  latitude: string;
  longitude: string;
  mapAddress: string;
  
  // تفاصيل الوحدة
  type: string; // apartment, studio, etc.
  usageType: string;
  purpose: string; // rent, sale
  area: string;
  beds: string;
  baths: string;
  halls: string;
  majlis: string;
  
  // السعر الخاص بالوحدة
  priceOMR: string;
  rentalPrice: string;
  deposit: string;
  
  // المزايا الخاصة بالوحدة (منسوخة + إضافات)
  amenities: string[];
  customAmenities: string[];
  
  // الميديا الخاصة بالوحدة
  images: string[];
  videoUrl: string;
  coverIndex: number;
  
  // معلومات إدارية منسوخة (قابلة للتعديل)
  surveyNumber: string;
  landNumber: string;
  notes: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  
  // حالة الوحدة
  status: 'available' | 'rented' | 'reserved' | 'maintenance';
  published: boolean;
  
  // معلومات المستأجر (إن وجد)
  tenantId?: string;
  tenantName?: string;
  leaseStartDate?: string;
  leaseEndDate?: string;
  
  // طرق الدفع
  paymentMethods: string[];
  
  createdAt: string;
  updatedAt: string;
}

/**
 * توليد رقم متسلسل فريد للوحدة
 */
export function generateUnitReferenceNo(parentRefNo: string, unitNo: string): string {
  const timestamp = Date.now().toString().slice(-6);
  const parentShort = parentRefNo.replace(/[^0-9]/g, '').slice(-4) || '0000';
  const unitShort = unitNo.replace(/[^A-Za-z0-9]/g, '');
  return `UNIT-${parentShort}-${unitShort}-${timestamp}`;
}

/**
 * تحويل وحدة من units[] إلى عقار منفصل
 */
export function convertUnitToProperty(
  parentProperty: any,
  unit: any,
  unitIndex: number
): UnitProperty {
  const unitNo = unit.unitNo || `U${unitIndex + 1}`;
  const referenceNo = generateUnitReferenceNo(
    parentProperty.referenceNo || parentProperty.id,
    unitNo
  );
  
  return {
    id: unit.id || `${parentProperty.id}-unit-${unitIndex}`,
    referenceNo,
    
    // ربط
    parentPropertyId: parentProperty.id,
    parentReferenceNo: parentProperty.referenceNo || parentProperty.id,
    isUnit: true,
    
    // معلومات الوحدة
    unitNo,
    floor: unit.floor || Math.floor(unitIndex / 4) + 1, // تخمين الطابق
    
    // نسخ من العقار الأم (قابل للتعديل)
    titleAr: unit.titleAr || `وحدة ${unitNo} - ${parentProperty.titleAr || parentProperty.title?.ar || ''}`,
    titleEn: unit.titleEn || `Unit ${unitNo} - ${parentProperty.titleEn || parentProperty.title?.en || ''}`,
    descriptionAr: unit.descriptionAr || parentProperty.descriptionAr || parentProperty.description?.ar || '',
    descriptionEn: unit.descriptionEn || parentProperty.descriptionEn || parentProperty.description?.en || '',
    province: unit.province || parentProperty.province || '',
    state: unit.state || parentProperty.state || '',
    city: unit.city || parentProperty.city || '',
    address: unit.address || `${parentProperty.address || ''} - وحدة ${unitNo}`,
    latitude: unit.latitude || parentProperty.latitude || '',
    longitude: unit.longitude || parentProperty.longitude || '',
    mapAddress: unit.mapAddress || parentProperty.mapAddress || '',
    
    // تفاصيل الوحدة
    type: unit.type || 'apartment',
    usageType: unit.usageType || parentProperty.usageType || 'residential',
    purpose: unit.purpose || 'rent',
    area: unit.area?.toString() || '',
    beds: unit.beds?.toString() || unit.bedrooms?.toString() || '',
    baths: unit.baths?.toString() || unit.bathrooms?.toString() || '',
    halls: unit.halls || '',
    majlis: unit.majlis || '',
    
    // السعر
    priceOMR: unit.price?.toString() || unit.priceOMR?.toString() || '',
    rentalPrice: unit.rentalPrice?.toString() || unit.monthlyRent?.toString() || '',
    deposit: unit.deposit?.toString() || '',
    
    // المزايا (نسخ من الأم + إضافات)
    amenities: [...(parentProperty.amenities || []), ...(unit.amenities || [])],
    customAmenities: [...(parentProperty.customAmenities || []), ...(unit.features || [])],
    
    // الميديا
    images: unit.images || [],
    videoUrl: unit.videoUrl || '',
    coverIndex: 0,
    
    // معلومات إدارية
    surveyNumber: unit.surveyNumber || parentProperty.surveyNumber || '',
    landNumber: unit.landNumber || parentProperty.landNumber || '',
    notes: unit.notes || parentProperty.notes || '',
    ownerName: unit.ownerName || parentProperty.ownerName || '',
    ownerPhone: unit.ownerPhone || parentProperty.ownerPhone || '',
    ownerEmail: unit.ownerEmail || parentProperty.ownerEmail || '',
    
    // الحالة
    status: (unit.status as any) || 'available',
    published: unit.published !== false,
    
    // المستأجر
    tenantId: unit.tenantId,
    tenantName: unit.tenantName,
    leaseStartDate: unit.leaseStartDate,
    leaseEndDate: unit.leaseEndDate,
    
    // طرق الدفع
    paymentMethods: unit.paymentMethods || parentProperty.paymentMethods || [],
    
    createdAt: unit.createdAt || new Date().toISOString(),
    updatedAt: unit.updatedAt || new Date().toISOString()
  };
}

/**
 * فصل الوحدات من العقار الأم إلى عقارات منفصلة
 */
export function separateUnitsFromBuilding(building: any): {
  parentProperty: ParentProperty;
  unitProperties: UnitProperty[];
} {
  const units = building.units || [];
  
  const parentProperty: ParentProperty = {
    id: building.id,
    referenceNo: building.referenceNo || building.id,
    
    // معلومات أساسية
    province: building.province || '',
    state: building.state || '',
    city: building.city || '',
    address: building.address || '',
    latitude: building.latitude || '',
    longitude: building.longitude || '',
    mapAddress: building.mapAddress || '',
    
    titleAr: building.titleAr || building.title?.ar || '',
    titleEn: building.titleEn || building.title?.en || '',
    descriptionAr: building.descriptionAr || building.description?.ar || '',
    descriptionEn: building.descriptionEn || building.description?.en || '',
    
    usageType: building.usageType || '',
    buildingAge: building.buildingAge || '',
    floors: building.floors?.toString() || '',
    totalArea: building.totalArea?.toString() || '',
    
    amenities: building.amenities || [],
    customAmenities: building.customAmenities || [],
    
    surveyNumber: building.surveyNumber || '',
    landNumber: building.landNumber || '',
    notes: building.notes || '',
    
    ownerName: building.ownerName || '',
    ownerPhone: building.ownerPhone || '',
    ownerEmail: building.ownerEmail || '',
    
    buildingType: 'multi',
    isParent: true,
    totalUnits: units.length,
    published: building.published !== false,
    
    createdAt: building.createdAt || new Date().toISOString(),
    updatedAt: building.updatedAt || new Date().toISOString()
  };
  
  const unitProperties: UnitProperty[] = units.map((unit: any, index: number) => 
    convertUnitToProperty(building, unit, index)
  );
  
  return {
    parentProperty,
    unitProperties
  };
}

/**
 * دمج الوحدات المنفصلة مع العقار الأم للعرض
 */
export function mergeUnitsWithParent(
  parentProperty: any,
  unitProperties: UnitProperty[]
): any {
  return {
    ...parentProperty,
    buildingType: 'multi',
    units: unitProperties
  };
}

