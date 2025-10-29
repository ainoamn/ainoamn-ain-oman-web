const XLSX = require('xlsx');
const fs = require('fs');

function analyzeTemplate(filename, type) {
  try {
    console.log(`\n=== تحليل ${type} ===`);
    const workbook = XLSX.readFile(filename);
    
    console.log(`عدد الأوراق: ${workbook.SheetNames.length}`);
    console.log(`أسماء الأوراق: ${workbook.SheetNames.join(', ')}\n`);
    
    const templates = {};
    
    workbook.SheetNames.forEach((sheetName, index) => {
      console.log(`\n--- ورقة ${index + 1}: ${sheetName} ---`);
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
      
      // استخراج البيانات المهمة
      const sheetData = {
        name: sheetName,
        rows: jsonData.length,
        data: jsonData.filter(row => row && row.some(cell => cell !== '' && cell !== null)),
        summary: extractSummary(jsonData)
      };
      
      templates[sheetName] = sheetData;
      console.log(`الصفوف: ${sheetData.data.length}`);
      console.log(`الملخص:`, JSON.stringify(sheetData.summary, null, 2));
    });
    
    // حفظ النتيجة
    const outputFile = `analyzed_${type}_template.json`;
    fs.writeFileSync(outputFile, JSON.stringify(templates, null, 2));
    console.log(`\nتم حفظ التحليل في: ${outputFile}`);
    
    return templates;
  } catch (error) {
    console.error(`خطأ في قراءة ${filename}:`, error.message);
    return null;
  }
}

function extractSummary(data) {
  const summary = {
    headers: [],
    bilingualFields: [],
    sections: []
  };
  
  // البحث عن العناوين الثنائية اللغة
  data.forEach((row, index) => {
    if (!row || row.length === 0) return;
    
    // البحث عن صفوف تحتوي على نص عربي وإنجليزي
    const hasArabic = row.some(cell => {
      const str = String(cell || '');
      return /[\u0600-\u06FF]/.test(str) && str.trim().length > 3;
    });
    
    const hasEnglish = row.some(cell => {
      const str = String(cell || '');
      return /^[A-Za-z]/.test(str) && str.trim().length > 3 && !hasArabic;
    });
    
    if (hasArabic || hasEnglish) {
      const meaningfulCells = row.filter(cell => {
        const str = String(cell || '');
        return str.trim().length > 2;
      });
      
      if (meaningfulCells.length > 0) {
        summary.sections.push({
          row: index + 1,
          content: meaningfulCells.slice(0, 5) // أول 5 خلايا
        });
      }
    }
  });
  
  return summary;
}

// تحليل كلا الملفين
const residential = analyzeTemplate('residential_template.xlsx', 'residential');
const commercial = analyzeTemplate('commercial_template.xlsx', 'commercial');

console.log('\n=== تم الانتهاء من التحليل ===');

