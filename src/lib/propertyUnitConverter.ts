// src/lib/propertyUnitConverter.ts
// تحويل المباني متعددة الوحدات إلى عقارات منفصلة

/**
 * عند حفظ عقار متعدد الوحدات، يتم:
 * 1. حفظ العقار الأم (مع علامة isParent: true)
 * 2. حفظ كل وحدة كعقار منفصل (مع علامة isUnit: true)
 * 3. نسخ البيانات الأساسية من الأم للوحدات
 */

export function generateUnitId(parentId: string, unitNo: string): string {
  return `${parentId}-UNIT-${unitNo.replace(/[^A-Za-z0-9]/g, '')}-${Date.now()}`;
}

export function generateUnitReferenceNo(parentRefNo: string, unitNo: string): string {
  const timestamp = Date.now().toString().slice(-6);
  const parentShort = parentRefNo.replace(/[^0-9]/g, '').slice(-4) || '0000';
  const unitShort = unitNo.replace(/[^A-Za-z0-9]/g, '');
  return `UNIT-${parentShort}-${unitShort}-${timestamp}`;
}

/**
 * تحويل عقار متعدد الوحدات إلى عقار أم + وحدات منفصلة
 */
export function convertMultiUnitPropertyToSeparate(propertyData: any): {
  parentProperty: any;
  unitProperties: any[];
} {
  const units = propertyData.units || [];
  
  // العقار الأم (بدون units array)
  const parentProperty = {
    ...propertyData,
    isParent: true,
    buildingType: 'multi',
    totalUnits: units.length,
    units: undefined, // حذف array الوحدات
    // يمكن جعله مخفي افتراضياً
    published: propertyData.published !== undefined ? propertyData.published : false,
    status: 'parent', // حالة خاصة للعقار الأم
  };
  
  // الوحدات كعقارات منفصلة
  const unitProperties = units.map((unit: any, index: number) => {
    const unitNo = unit.unitNo || `U${index + 1}`;
    const unitId = unit.id || generateUnitId(propertyData.id, unitNo);
    const unitRefNo = generateUnitReferenceNo(
      propertyData.referenceNo || propertyData.id,
      unitNo
    );
    
    return {
      // معرفات فريدة
      id: unitId,
      referenceNo: unitRefNo,
      
      // علامات
      isUnit: true,
      parentPropertyId: propertyData.id,
      parentReferenceNo: propertyData.referenceNo || propertyData.id,
      
      // معلومات الوحدة
      unitNo,
      floor: unit.floor || Math.floor(index / 4) + 1,
      
      // عنوان الوحدة (منسوخ + مخصص)
      titleAr: unit.titleAr || `وحدة ${unitNo} - ${propertyData.titleAr || ''}`,
      titleEn: unit.titleEn || `Unit ${unitNo} - ${propertyData.titleEn || ''}`,
      
      // الوصف (منسوخ + قابل للتعديل)
      descriptionAr: unit.descriptionAr || propertyData.descriptionAr || '',
      descriptionEn: unit.descriptionEn || propertyData.descriptionEn || '',
      
      // الموقع (منسوخ من الأم)
      province: propertyData.province || '',
      state: propertyData.state || '',
      city: propertyData.city || '',
      village: propertyData.village || '',
      address: `${propertyData.address || ''} - وحدة ${unitNo}`,
      
      // الموقع على الخريطة (منسوخ)
      latitude: propertyData.latitude || '',
      longitude: propertyData.longitude || '',
      mapAddress: propertyData.mapAddress || '',
      
      // التفاصيل الخاصة بالوحدة
      type: unit.type || 'apartment',
      usageType: propertyData.usageType || 'residential',
      purpose: unit.purpose || 'rent',
      buildingType: 'single', // الوحدة تعتبر مفردة
      buildingAge: propertyData.buildingAge || '',
      area: unit.area?.toString() || '',
      beds: unit.beds?.toString() || '',
      baths: unit.baths?.toString() || '',
      halls: unit.halls || '',
      majlis: unit.majlis || '',
      kitchens: '1',
      floors: '1',
      
      // السعر
      priceOMR: unit.price?.toString() || unit.priceOMR?.toString() || '',
      rentalPrice: unit.rentalPrice?.toString() || '',
      deposit: unit.deposit?.toString() || '',
      
      // المزايا (منسوخة من الأم + إضافات الوحدة)
      amenities: [
        ...(propertyData.amenities || []),
        ...(unit.amenities || [])
      ],
      customAmenities: [
        ...(propertyData.customAmenities || []),
        ...(unit.features || [])
      ],
      
      // الميديا الخاصة بالوحدة
      images: unit.images || [],
      videoUrl: unit.videoUrl || '',
      coverIndex: 0,
      
      // المعلومات الإدارية (منسوخة)
      surveyNumber: propertyData.surveyNumber || '',
      landNumber: propertyData.landNumber || '',
      notes: unit.notes || propertyData.notes || `وحدة ${unitNo} في ${propertyData.titleAr || ''}`,
      
      // معلومات المالك (منسوخة)
      ownerName: propertyData.ownerName || '',
      ownerPhone: propertyData.ownerPhone || '',
      ownerEmail: propertyData.ownerEmail || '',
      useUserContact: propertyData.useUserContact !== false,
      
      // الحالة
      status: unit.status || 'vacant',
      published: unit.published !== false,
      
      // معلومات المستأجر
      tenantId: unit.tenantId,
      tenantName: unit.tenantName,
      leaseStartDate: unit.leaseStartDate,
      leaseEndDate: unit.leaseEndDate,
      
      // طرق الدفع
      paymentMethods: unit.paymentMethods || [],
      
      // التواريخ
      createdAt: unit.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });
  
  return {
    parentProperty,
    unitProperties
  };
}

/**
 * حفظ عقار متعدد الوحدات (الأم + الوحدات)
 */
export async function saveMultiUnitProperty(propertyData: any): Promise<{
  success: boolean;
  parentId: string;
  unitIds: string[];
  message: string;
}> {
  try {
    // تحويل إلى أم + وحدات
    const { parentProperty, unitProperties } = convertMultiUnitPropertyToSeparate(propertyData);
    
    // حفظ العقار الأم
    const parentResponse = await fetch('/api/properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parentProperty)
    });
    
    if (!parentResponse.ok) {
      throw new Error('فشل حفظ العقار الأم');
    }
    
    const parentResult = await parentResponse.json();
    const savedUnitIds: string[] = [];
    
    // حفظ كل وحدة كعقار منفصل
    for (const unit of unitProperties) {
      const unitResponse = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(unit)
      });
      
      if (unitResponse.ok) {
        const unitResult = await unitResponse.json();
        savedUnitIds.push(unitResult.id);
      }
    }
    
    return {
      success: true,
      parentId: parentResult.id,
      unitIds: savedUnitIds,
      message: `تم حفظ العقار الأم + ${savedUnitIds.length} وحدة بنجاح`
    };
    
  } catch (error) {
    console.error('Error saving multi-unit property:', error);
    return {
      success: false,
      parentId: '',
      unitIds: [],
      message: error instanceof Error ? error.message : 'حدث خطأ'
    };
  }
}

