const fs = require('fs');
const path = require('path');

/**
 * دمج القوالب الحقيقية من Excel في قاعدة البيانات
 */

// قراءة القوالب المحولة من Excel
const excelTemplates = JSON.parse(fs.readFileSync('.data/excel-templates.json', 'utf8'));

// قراءة قاعدة البيانات الحالية
const currentTemplates = JSON.parse(fs.readFileSync('.data/contract-templates.json', 'utf8'));

// إنشاء قوالب جديدة من Excel
const newTemplates = [];

// دالة لتحويل البيانات إلى بنية القوالب
function convertExcelToTemplate(excelData, sheetName, type) {
  const template = {
    id: `${type}-${sheetName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    name: {
      ar: extractArabicName(sheetName, excelData),
      en: extractEnglishName(sheetName, excelData)
    },
    description: {
      ar: `قالب ${type === 'residential' ? 'سكني' : 'تجاري'} - ${sheetName}`,
      en: `${type === 'residential' ? 'Residential' : 'Commercial'} template - ${sheetName}`
    },
    category: getCategory(sheetName),
    type: getType(sheetName),
    usageTypes: type === 'residential' ? ['residential'] : ['commercial'],
    content: {
      sections: extractSections(excelData)
    },
    linkedProperties: [],
    linkedUnits: [],
    linkedUsageTypes: type === 'residential' ? ['residential'] : ['commercial'],
    isDefault: false,
    source: 'excel',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  return template;
}

function extractArabicName(sheetName, data) {
  // البحث عن العنوان العربي في الصفوف الأولى
  if (data && data.rawData) {
    for (let i = 0; i < Math.min(20, data.rawData.length); i++) {
      const row = data.rawData[i];
      if (!row) continue;
      
      const arabicText = row.find(cell => {
        const str = String(cell || '').trim();
        return /[\u0600-\u06FF]/.test(str) && str.length > 5 && 
               !str.includes('مجموعة') && !str.includes('ص.ب');
      });
      
      if (arabicText) {
        return String(arabicText).trim();
      }
    }
  }
  
  // استخدام اسم الورقة كبديل
  return sheetName;
}

function extractEnglishName(sheetName, data) {
  // البحث عن العنوان الإنجليزي في الصفوف الأولى
  if (data && data.rawData) {
    for (let i = 0; i < Math.min(20, data.rawData.length); i++) {
      const row = data.rawData[i];
      if (!row) continue;
      
      const englishText = row.find(cell => {
        const str = String(cell || '').trim();
        return /^[A-Z]/.test(str) && str.length > 5 && 
               !str.includes('SYED') && !str.includes('P.O.Box') &&
               !/[\u0600-\u06FF]/.test(str);
      });
      
      if (englishText) {
        return String(englishText).trim();
      }
    }
  }
  
  // استخدام اسم الورقة كبديل
  return sheetName;
}

function getCategory(sheetName) {
  const name = sheetName.toLowerCase();
  if (name.includes('check') || name.includes('تسجيل')) return 'contracts';
  if (name.includes('guarantee') || name.includes('ضمان')) return 'contracts';
  if (name.includes('cancellation') || name.includes('إلغاء')) return 'contracts';
  if (name.includes('renewal') || name.includes('تجديد')) return 'contracts';
  if (name.includes('extension') || name.includes('تمديد')) return 'contracts';
  if (name.includes('terms') || name.includes('شروط')) return 'contracts';
  if (name.includes('invoice') || name.includes('فاتورة')) return 'requests';
  return 'contracts';
}

function getType(sheetName) {
  const name = sheetName.toLowerCase();
  if (name.includes('check-in') || name.includes('دخول')) return 'check_in';
  if (name.includes('check-out') || name.includes('خروج')) return 'check_out';
  if (name.includes('guarantee') || name.includes('ضمان')) return 'guarantee';
  if (name.includes('cancellation') || name.includes('إلغاء')) return 'termination';
  if (name.includes('renewal') || name.includes('تجديد')) return 'renewal';
  if (name.includes('extension') || name.includes('تمديد')) return 'extension';
  if (name.includes('invoice') || name.includes('فاتورة')) return 'invoice';
  return 'addendum';
}

function extractSections(excelData) {
  const sections = [];
  
  if (!excelData || !excelData.structure) return sections;
  
  const structure = excelData.structure;
  
  // إضافة الأقسام من البنية
  if (structure.sections && structure.sections.length > 0) {
    structure.sections.forEach(section => {
      if (section.title && (section.title.ar || section.title.en)) {
        sections.push({
          title: {
            ar: section.title.ar || '',
            en: section.title.en || ''
          },
          clauses: extractClauses(section, excelData.rawData)
        });
      }
    });
  }
  
  // إذا لم توجد أقسام، إنشاء قسم واحد من الحقول
  if (sections.length === 0 && structure.fields && structure.fields.length > 0) {
    const clauses = structure.fields
      .filter(field => field.label && (field.label.ar || field.label.en))
      .map(field => ({
        ar: field.label.ar || '',
        en: field.label.en || ''
      }));
    
    if (clauses.length > 0) {
      sections.push({
        title: {
          ar: 'بيانات العقد',
          en: 'Contract Information'
        },
        clauses: clauses
      });
    }
  }
  
  return sections;
}

function extractClauses(section, rawData) {
  const clauses = [];
  
  // إضافة حقول القسم
  if (section.fields && section.fields.length > 0) {
    section.fields.forEach(field => {
      if (field.label && (field.label.ar || field.label.en)) {
        let clauseText = '';
        if (field.label.ar && field.label.en) {
          clauseText = `${field.label.ar} / ${field.label.en}`;
        } else {
          clauseText = field.label.ar || field.label.en || '';
        }
        
        if (field.value) {
          clauseText += `: ${field.value}`;
        }
        
        clauses.push({
          ar: clauseText,
          en: clauseText
        });
      }
    });
  }
  
  // البحث عن البنود في البيانات الخام
  if (rawData && rawData.length > 0) {
    rawData.forEach(row => {
      if (!row || row.length === 0) return;
      
      const arabicText = row.find(cell => {
        const str = String(cell || '').trim();
        return /[\u0600-\u06FF]/.test(str) && str.length > 10 && 
               !str.includes('مجموعة') && !str.includes('ص.ب') &&
               !str.includes('P.O.Box') && !str.includes('SYED');
      });
      
      const englishText = row.find(cell => {
        const str = String(cell || '').trim();
        return /^[A-Z]/.test(str) && str.length > 20 && 
               !str.includes('SYED') && !str.includes('P.O.Box') &&
               !/[\u0600-\u06FF]/.test(str);
      });
      
      if (arabicText && englishText) {
        clauses.push({
          ar: String(arabicText).trim(),
          en: String(englishText).trim()
        });
      }
    });
  }
  
  return clauses;
}

// تحويل القوالب السكنية
if (excelTemplates.residential) {
  Object.keys(excelTemplates.residential).forEach(sheetName => {
    const excelData = excelTemplates.residential[sheetName];
    const template = convertExcelToTemplate(excelData, sheetName, 'residential');
    newTemplates.push(template);
  });
}

// تحويل القوالب التجارية
if (excelTemplates.commercial) {
  Object.keys(excelTemplates.commercial).forEach(sheetName => {
    const excelData = excelTemplates.commercial[sheetName];
    const template = convertExcelToTemplate(excelData, sheetName, 'commercial');
    newTemplates.push(template);
  });
}

// دمج القوالب الجديدة مع القوالب الموجودة
const allTemplates = {
  templates: [...currentTemplates.templates, ...newTemplates]
};

// حفظ النتيجة
fs.writeFileSync('.data/contract-templates.json', JSON.stringify(allTemplates, null, 2));

console.log(`✅ تم دمج ${newTemplates.length} قالب جديد`);
console.log(`📊 إجمالي القوالب: ${allTemplates.templates.length}`);

// حفظ قائمة القوالب الجديدة
const newTemplatesList = newTemplates.map(t => ({
  id: t.id,
  name: t.name,
  type: t.type,
  category: t.category
}));

fs.writeFileSync('.data/new-templates-list.json', JSON.stringify(newTemplatesList, null, 2));
console.log(`✅ تم حفظ قائمة القوالب الجديدة`);

