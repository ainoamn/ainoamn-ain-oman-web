const XLSX = require('xlsx');
const fs = require('fs');

try {
  const workbook = XLSX.readFile('temp_template.xlsx');
  
  console.log('=== معلومات الملف ===');
  console.log('عدد الأوراق:', workbook.SheetNames.length);
  console.log('أسماء الأوراق:', workbook.SheetNames.join(', '));
  console.log('\n');
  
  workbook.SheetNames.forEach((sheetName, index) => {
    console.log(`\n=== ورقة ${index + 1}: ${sheetName} ===`);
    const worksheet = workbook.Sheets[sheetName];
    
    // تحويل إلى JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
    
    // عرض أول 50 صف
    console.log(`عدد الصفوف: ${jsonData.length}`);
    console.log('\nأول 50 صف:');
    jsonData.slice(0, 50).forEach((row, rowIndex) => {
      if (row && row.length > 0 && row.some(cell => cell !== '')) {
        console.log(`الصف ${rowIndex + 1}:`, JSON.stringify(row));
      }
    });
    
    // حفظ كم JSON للتحليل
    const outputFile = `template_sheet_${index + 1}_${sheetName.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
    fs.writeFileSync(outputFile, JSON.stringify(jsonData, null, 2));
    console.log(`\nتم حفظ البيانات في: ${outputFile}`);
  });
  
  console.log('\n=== تم الانتهاء من تحليل الملف ===');
} catch (error) {
  console.error('خطأ في قراءة الملف:', error.message);
  process.exit(1);
}

