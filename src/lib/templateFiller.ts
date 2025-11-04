// src/lib/templateFiller.ts - دالة لملء القوالب تلقائياً بالبيانات

interface TemplateData {
  // بيانات العقار
  property?: {
    id?: string;
    titleAr?: string;
    address?: string;
    buildingNumber?: string;
    plotNumber?: string;
    serialNumber?: string;
    area?: string | number;
    usageType?: string;
    neighborhood?: string;
    city?: string;
    wilayat?: string;
    facilities?: string[];
  };
  
  // بيانات الوحدة
  unit?: {
    unitNo?: string;
    type?: string;
    area?: string | number;
    floor?: number;
    beds?: number;
    baths?: number;
    rentalPrice?: string | number;
  };
  
  // بيانات المالك
  owner?: {
    name?: string;
    nameEn?: string;
    id?: string;
    idNumber?: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  
  // بيانات المستأجر
  tenant?: {
    name?: string;
    nameEn?: string;
    id?: string;
    idNumber?: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  
  // بيانات العقد
  contract?: {
    startDate?: string;
    endDate?: string;
    duration?: number | string;
    monthlyRent?: number | string;
    deposit?: number | string;
    currency?: string;
    paymentDay?: number | string;
    customTerms?: string;
    status?: string;
  };
  
  // بيانات إضافية
  additional?: {
    signingDate?: string;
    [key: string]: any;
  };
}

/**
 * ملء قالب العقد بالبيانات الفعلية
 * @param template القالب الأصلي
 * @param data البيانات المطلوب ملء القالب بها
 * @returns القالب المملوء
 */
export function fillTemplate(template: any, data: TemplateData): any {
  // إنشاء نسخة من القالب
  const filledTemplate = JSON.parse(JSON.stringify(template));
  
  // خريطة الاستبدال
  const replacements = buildReplacementMap(data);
  
  // ملء القالب
  if (filledTemplate.content?.sections) {
    filledTemplate.content.sections = filledTemplate.content.sections.map((section: any) => ({
      ...section,
      clauses: section.clauses.map((clause: any) => {
        if (typeof clause === 'string') {
          return replaceVariables(clause, replacements);
        }
        if (clause.ar) {
          clause.ar = replaceVariables(clause.ar, replacements);
        }
        if (clause.en) {
          clause.en = replaceVariables(clause.en, replacements);
        }
        return clause;
      })
    }));
  }
  
  // إضافة البيانات المستخدمة
  filledTemplate.filledData = data;
  filledTemplate.filledAt = new Date().toISOString();
  
  return filledTemplate;
}

/**
 * بناء خريطة الاستبدال من البيانات
 */
function buildReplacementMap(data: TemplateData): Record<string, string> {
  const map: Record<string, string> = {};
  
  // بيانات العقار
  if (data.property) {
    map['[عنوان العقار]'] = data.property.address || 'غير محدد';
    map['[Property Address]'] = data.property.address || 'Not specified';
    
    map['[رقم القطعة]'] = data.property.plotNumber || data.property.buildingNumber || 'غير محدد';
    map['[Plot Number]'] = data.property.plotNumber || data.property.buildingNumber || 'Not specified';
    
    map['[الرقم المتسلسل]'] = data.property.serialNumber || 'غير محدد';
    map['[Serial Number]'] = data.property.serialNumber || 'Not specified';
    
    map['[المساحة]'] = String(data.property.area || 'غير محدد');
    map['[Area]'] = String(data.property.area || 'Not specified');
    
    map['[نوع الاستخدام]'] = getUsageTypeLabel(data.property.usageType);
    map['[Usage Type]'] = getUsageTypeEnLabel(data.property.usageType);
    
    map['[الحي]'] = data.property.neighborhood || 'غير محدد';
    map['[Neighborhood]'] = data.property.neighborhood || 'Not specified';
    
    map['[المدينة]'] = data.property.city || 'غير محدد';
    map['[City]'] = data.property.city || 'Not specified';
    
    map['[الولاية]'] = data.property.wilayat || 'غير محدد';
    map['[Wilayat]'] = data.property.wilayat || 'Not specified';
    
    if (data.property.facilities && data.property.facilities.length > 0) {
      map['[قائمة المرافق]'] = data.property.facilities.join('، ');
      map['[Facilities List]'] = data.property.facilities.join(', ');
    } else {
      map['[قائمة المرافق]'] = 'لا توجد';
      map['[Facilities List]'] = 'None';
    }
  }
  
  // بيانات الوحدة
  if (data.unit) {
    map['[رقم الوحدة]'] = data.unit.unitNo || 'غير محدد';
    map['[Unit Number]'] = data.unit.unitNo || 'Not specified';
    
    map['[نوع الوحدة]'] = data.unit.type || 'غير محدد';
    map['[Unit Type]'] = data.unit.type || 'Not specified';
    
    map['[مساحة الوحدة]'] = String(data.unit.area || 'غير محدد');
    map['[Unit Area]'] = String(data.unit.area || 'Not specified');
    
    map['[الطابق]'] = String(data.unit.floor || 'غير محدد');
    map['[Floor]'] = String(data.unit.floor || 'Not specified');
    
    map['[عدد الغرف]'] = String(data.unit.beds || 'غير محدد');
    map['[Beds Count]'] = String(data.unit.beds || 'Not specified');
    
    map['[عدد دورات المياه]'] = String(data.unit.baths || 'غير محدد');
    map['[Baths Count]'] = String(data.unit.baths || 'Not specified');
  }
  
  // بيانات المالك
  if (data.owner) {
    map['[اسم المالك]'] = data.owner.name || 'غير محدد';
    map['[Owner Name]'] = data.owner.nameEn || data.owner.name || 'Not specified';
    
    map['[رقم هوية المالك]'] = data.owner.idNumber || data.owner.id || 'غير محدد';
    map['[Owner ID Number]'] = data.owner.idNumber || data.owner.id || 'Not specified';
    
    map['[هاتف المالك]'] = data.owner.phone || 'غير محدد';
    map['[Owner Phone]'] = data.owner.phone || 'Not specified';
    
    map['[بريد المالك]'] = data.owner.email || 'غير محدد';
    map['[Owner Email]'] = data.owner.email || 'Not specified';
    
    map['[عنوان المالك]'] = data.owner.address || 'غير محدد';
    map['[Owner Address]'] = data.owner.address || 'Not specified';
  }
  
  // بيانات المستأجر
  if (data.tenant) {
    map['[اسم المستأجر]'] = data.tenant.name || 'غير محدد';
    map['[Tenant Name]'] = data.tenant.nameEn || data.tenant.name || 'Not specified';
    
    map['[رقم هوية المستأجر]'] = data.tenant.idNumber || data.tenant.id || 'غير محدد';
    map['[Tenant ID Number]'] = data.tenant.idNumber || data.tenant.id || 'Not specified';
    
    map['[رقم الهوية]'] = data.tenant.idNumber || data.tenant.id || 'غير محدد'; // اختصار
    map['[ID Number]'] = data.tenant.idNumber || data.tenant.id || 'Not specified';
    
    map['[هاتف المستأجر]'] = data.tenant.phone || 'غير محدد';
    map['[Tenant Phone]'] = data.tenant.phone || 'Not specified';
    
    map['[بريد المستأجر]'] = data.tenant.email || 'غير محدد';
    map['[Tenant Email]'] = data.tenant.email || 'Not specified';
    
    map['[عنوان المستأجر]'] = data.tenant.address || 'غير محدد';
    map['[Tenant Address]'] = data.tenant.address || 'Not specified';
    
    // اختصار للاستخدام العام
    map['[العنوان]'] = data.tenant.address || 'غير محدد';
    map['[Address]'] = data.tenant.address || 'Not specified';
  }
  
  // بيانات العقد
  if (data.contract) {
    map['[تاريخ البداية]'] = formatDate(data.contract.startDate);
    map['[Start Date]'] = formatDate(data.contract.startDate);
    
    map['[تاريخ النهاية]'] = formatDate(data.contract.endDate);
    map['[End Date]'] = formatDate(data.contract.endDate);
    
    map['[المدة]'] = `${data.contract.duration || 'غير محدد'} شهر`;
    map['[Duration]'] = `${data.contract.duration || 'Not specified'} months`;
    
    const currency = data.contract.currency || 'OMR';
    const currencyLabel = getCurrencyLabel(currency);
    const currencyLabelEn = getCurrencyLabelEn(currency);
    
    map['[المبلغ]'] = formatMoney(data.contract.monthlyRent, currency);
    map['[Amount]'] = formatMoney(data.contract.monthlyRent, currency);
    
    map['[الإيجار الشهري]'] = formatMoney(data.contract.monthlyRent, currency);
    map['[Monthly Rent]'] = formatMoney(data.contract.monthlyRent, currency);
    
    map['[مبلغ التأمين]'] = formatMoney(data.contract.deposit, currency);
    map['[Security Amount]'] = formatMoney(data.contract.deposit, currency);
    
    map['[العملة]'] = currencyLabel;
    map['[Currency]'] = currencyLabelEn;
    
    map['[تاريخ الاستحقاق]'] = String(data.contract.paymentDay || '5');
    map['[Due Date]'] = String(data.contract.paymentDay || '5');
    
    // حساب إجمالي الإيجار
    if (data.contract.monthlyRent && data.contract.duration) {
      const total = Number(data.contract.monthlyRent) * Number(data.contract.duration);
      map['[إجمالي الإيجار]'] = formatMoney(total, currency);
      map['[Total Rent]'] = formatMoney(total, currency);
    }
  }
  
  // بيانات التوقيع
  if (data.additional?.signingDate) {
    map['[التاريخ]'] = formatDate(data.additional.signingDate);
    map['[Date]'] = formatDate(data.additional.signingDate);
  } else {
    map['[التاريخ]'] = formatDate(new Date().toISOString());
    map['[Date]'] = formatDate(new Date().toISOString());
  }
  
  // معالجة أي بيانات إضافية
  if (data.additional) {
    Object.keys(data.additional).forEach(key => {
      if (key !== 'signingDate') {
        map[`[${key}]`] = String(data.additional![key] || 'غير محدد');
      }
    });
  }
  
  return map;
}

/**
 * استبدال المتغيرات في النص
 */
function replaceVariables(text: string, replacements: Record<string, string>): string {
  let result = text;
  Object.keys(replacements).forEach(key => {
    result = result.replace(new RegExp(escapeRegex(key), 'g'), replacements[key]);
  });
  return result;
}

/**
 * Escape regex special characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * تنسيق التاريخ
 */
function formatDate(date?: string | Date): string {
  if (!date) return 'غير محدد';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return String(date);
  }
}

/**
 * تنسيق المبلغ المالي
 */
function formatMoney(amount?: number | string, currency: string = 'OMR'): string {
  if (amount === undefined || amount === null) return 'غير محدد';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 'غير محدد';
  return `${num.toFixed(3)} ${getCurrencyLabel(currency)}`;
}

/**
 * الحصول على تسمية العملة بالعربية
 */
function getCurrencyLabel(currency: string): string {
  const labels: Record<string, string> = {
    'OMR': 'ريال عماني',
    'USD': 'دولار أمريكي',
    'EUR': 'يورو',
    'AED': 'درهم إماراتي',
    'SAR': 'ريال سعودي'
  };
  return labels[currency] || currency;
}

/**
 * الحصول على تسمية العملة بالإنجليزية
 */
function getCurrencyLabelEn(currency: string): string {
  const labels: Record<string, string> = {
    'OMR': 'Omani Rial',
    'USD': 'US Dollar',
    'EUR': 'Euro',
    'AED': 'UAE Dirham',
    'SAR': 'Saudi Riyal'
  };
  return labels[currency] || currency;
}

/**
 * الحصول على تسمية نوع الاستخدام بالعربية
 */
function getUsageTypeLabel(type?: string): string {
  const labels: Record<string, string> = {
    'residential': 'سكني',
    'commercial': 'تجاري',
    'industrial': 'صناعي',
    'agricultural': 'زراعي',
    'mixed': 'مختلط'
  };
  return labels[type || ''] || type || 'غير محدد';
}

/**
 * الحصول على تسمية نوع الاستخدام بالإنجليزية
 */
function getUsageTypeEnLabel(type?: string): string {
  const labels: Record<string, string> = {
    'residential': 'Residential',
    'commercial': 'Commercial',
    'industrial': 'Industrial',
    'agricultural': 'Agricultural',
    'mixed': 'Mixed'
  };
  return labels[type || ''] || type || 'Not specified';
}

/**
 * اختيار القالب المناسب تلقائياً
 */
export function selectBestTemplate(templates: any[], data: TemplateData): any | null {
  if (!templates || templates.length === 0) return null;
  
  // إعطاء أولوية للقوالب حسب المعايير
  let bestTemplate = null;
  let bestScore = 0;
  
  templates.forEach(template => {
    let score = 0;
    
    // قالب افتراضي
    if (template.isDefault) score += 10;
    
    // نوع العقد (rental)
    if (template.type === 'rental') score += 20;
    
    // نوع الاستخدام
    if (data.property?.usageType && template.usageTypes?.includes(data.property.usageType)) {
      score += 30;
    }
    
    // مرتبط بعقار محدد
    if (data.property?.id && template.linkedProperties?.includes(data.property.id)) {
      score += 50;
    }
    
    // مرتبط بوحدة محددة
    if (data.unit?.unitNo && template.linkedUnits?.includes(data.unit.unitNo)) {
      score += 40;
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestTemplate = template;
    }
  });
  
  return bestTemplate;
}

