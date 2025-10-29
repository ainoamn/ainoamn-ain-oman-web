const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

/**
 * محول Excel إلى JSON للقوالب الثنائية اللغة
 * يستخرج القوالب من ملفات Excel ويحولها إلى JSON منظم
 */

function convertExcelToTemplate(excelFile, templateType) {
  try {
    console.log(`\n=== تحويل ${templateType} ===`);
    const workbook = XLSX.readFile(excelFile);
    
    const templates = {};
    
    workbook.SheetNames.forEach((sheetName) => {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
      
      // تنظيف البيانات
      const cleanData = jsonData.filter(row => 
        row && row.some(cell => {
          const str = String(cell || '').trim();
          return str.length > 0;
        })
      );
      
      // استخراج البنية
      const structure = extractStructure(cleanData);
      
      templates[sheetName] = {
        name: sheetName,
        type: templateType,
        structure: structure,
        rawData: cleanData
      };
    });
    
    return templates;
  } catch (error) {
    console.error(`خطأ في تحويل ${excelFile}:`, error.message);
    return null;
  }
}

function extractStructure(data) {
  const structure = {
    header: null,
    sections: [],
    fields: []
  };
  
  // البحث عن رأس الصفحة (اسم الشركة)
  for (let i = 0; i < Math.min(10, data.length); i++) {
    const row = data[i];
    if (!row) continue;
    
    const rowText = row.map(cell => String(cell || '').trim()).join(' ');
    
    // البحث عن اسم الشركة
    if (rowText.includes('مجموعة سيد فياض') || rowText.includes('SYED FAYYAZ')) {
      structure.header = {
        companyNameAr: extractText(row, 'arabic'),
        companyNameEn: extractText(row, 'english'),
        contactInfo: extractContactInfo(data, i)
      };
      break;
    }
  }
  
  // استخراج الأقسام والحقول
  let currentSection = null;
  
  data.forEach((row, index) => {
    if (!row || row.length === 0) return;
    
    const rowText = row.map(cell => String(cell || '').trim()).join(' ');
    
    // البحث عن عنوان قسم
    if (isSectionTitle(row)) {
      if (currentSection) {
        structure.sections.push(currentSection);
      }
      currentSection = {
        title: {
          ar: extractText(row, 'arabic'),
          en: extractText(row, 'english')
        },
        fields: [],
        clauses: []
      };
    } else if (currentSection) {
      // إضافة حقول إلى القسم الحالي
      const field = extractField(row);
      if (field) {
        currentSection.fields.push(field);
      }
    } else {
      // حقول بدون قسم
      const field = extractField(row);
      if (field) {
        structure.fields.push(field);
      }
    }
  });
  
  // إضافة القسم الأخير
  if (currentSection) {
    structure.sections.push(currentSection);
  }
  
  return structure;
}

function extractText(row, language) {
  if (!row || row.length === 0) return '';
  
  const texts = row
    .map(cell => String(cell || '').trim())
    .filter(cell => cell.length > 0);
  
  if (language === 'arabic') {
    // البحث عن نص عربي
    const arabicText = texts.find(text => /[\u0600-\u06FF]/.test(text));
    return arabicText || '';
  } else {
    // البحث عن نص إنجليزي (ليس عربي)
    const englishText = texts.find(text => 
      /^[A-Za-z]/.test(text) && !/[\u0600-\u06FF]/.test(text)
    );
    return englishText || '';
  }
}

function extractContactInfo(data, startIndex) {
  const contactInfo = {
    ar: '',
    en: ''
  };
  
  // البحث في الصفوف التالية
  for (let i = startIndex; i < Math.min(startIndex + 5, data.length); i++) {
    const row = data[i];
    if (!row) continue;
    
    const rowText = row.map(cell => String(cell || '').trim()).join(' ');
    
    if (rowText.includes('ص.ب') || rowText.includes('P.O.Box')) {
      contactInfo.ar = extractText(row, 'arabic');
      contactInfo.en = extractText(row, 'english');
      break;
    }
  }
  
  return contactInfo;
}

function isSectionTitle(row) {
  if (!row || row.length === 0) return false;
  
  const rowText = row.map(cell => String(cell || '').trim()).join(' ');
  
  // البحث عن عناوين الأقسام الشائعة
  const sectionKeywords = [
    'Document', 'مستند', 'Agreement', 'عقد',
    'Details', 'بيانات', 'Terms', 'شروط',
    'Conditions', 'أحكام', 'Tenant', 'مستأجر',
    'Landlord', 'مؤجر', 'Property', 'عقار',
    'Unit', 'وحدة', 'Check', 'تسجيل',
    'Guarantee', 'ضمان', 'Personal', 'شخصي'
  ];
  
  const hasKeyword = sectionKeywords.some(keyword => 
    rowText.toLowerCase().includes(keyword.toLowerCase())
  );
  
  // التأكد من وجود نص عربي وإنجليزي معاً
  const hasArabic = /[\u0600-\u06FF]/.test(rowText);
  const hasEnglish = /[A-Za-z]{3,}/.test(rowText);
  
  return hasKeyword && (hasArabic || hasEnglish) && rowText.length > 10;
}

function extractField(row) {
  if (!row || row.length === 0) return null;
  
  const field = {
    label: {
      ar: '',
      en: ''
    },
    value: '',
    type: 'text'
  };
  
  // استخراج التسميات
  field.label.ar = extractText(row, 'arabic');
  field.label.en = extractText(row, 'english');
  
  // استخراج القيمة (عادة في عمود منفصل)
  const values = row
    .map(cell => String(cell || '').trim())
    .filter(cell => {
      const str = String(cell);
      // تجاهل التسميات ونصوص الشركة
      return str.length > 0 && 
             !str.includes('مجموعة') && 
             !str.includes('SYED') &&
             !/^[\u0600-\u06FF\s:،]+$/.test(str) && // ليس فقط عربي
             !/^[A-Za-z\s:]+$/.test(str); // ليس فقط إنجليزي
    });
  
  if (values.length > 0) {
    field.value = values[0];
  }
  
  // تحديد نوع الحقل
  if (field.label.en.toLowerCase().includes('date') || field.label.ar.includes('تاريخ')) {
    field.type = 'date';
  } else if (field.label.en.toLowerCase().includes('number') || field.label.ar.includes('رقم')) {
    field.type = 'number';
  } else if (field.label.en.toLowerCase().includes('amount') || field.label.ar.includes('مبلغ')) {
    field.type = 'amount';
  }
  
  // تجاهل الحقول الفارغة
  if (!field.label.ar && !field.label.en && !field.value) {
    return null;
  }
  
  return field;
}

// تحويل الملفين
const residentialTemplates = convertExcelToTemplate('residential_template.xlsx', 'residential');
const commercialTemplates = convertExcelToTemplate('commercial_template.xlsx', 'commercial');

// دمج النتائج
const allTemplates = {
  residential: residentialTemplates,
  commercial: commercialTemplates,
  metadata: {
    generatedAt: new Date().toISOString(),
    source: 'Excel files',
    version: '1.0'
  }
};

// حفظ النتيجة
const outputFile = path.join(__dirname, '..', '.data', 'excel-templates.json');
fs.writeFileSync(outputFile, JSON.stringify(allTemplates, null, 2));

console.log(`\n✅ تم حفظ القوالب في: ${outputFile}`);
console.log(`📊 إجمالي القوالب السكنية: ${Object.keys(residentialTemplates || {}).length}`);
console.log(`📊 إجمالي القوالب التجارية: ${Object.keys(commercialTemplates || {}).length}`);

