#!/usr/bin/env node

/**
 * 🔧 Fix All Undefined Mock Variables
 * إصلاح جميع المتغيرات الوهمية غير المُعرّفة
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔧 بدء إصلاح جميع المتغيرات غير المُعرّفة...\n');

const filesToFix = [
  { file: 'src/pages/admin/financial/checks.tsx', varName: 'mockChecks', setter: 'setChecks' },
  { file: 'src/pages/admin/financial/invoices.tsx', varName: 'mockInvoices', setter: 'setInvoices' },
  { file: 'src/pages/admin/financial/payables.tsx', varName: 'mockPayables', setter: 'setPayables' },
  { file: 'src/pages/admin/financial/payments.tsx', varName: 'mockPayments', setter: 'setPayments' },
  { file: 'src/pages/admin/financial/purchases/invoices.tsx', varName: 'mockInvoices', setter: 'setInvoices' },
  { file: 'src/pages/admin/financial/receivables.tsx', varName: 'mockReceivables', setter: 'setReceivables' },
  { file: 'src/pages/admin/financial/sales/invoices.tsx', varName: 'mockInvoices', setter: 'setInvoices' },
  { file: 'src/pages/admin/financial/sales/quotations.tsx', varName: 'mockQuotations', setter: 'setQuotations' }
];

let fixed = 0;
let errors = 0;

filesToFix.forEach((item, index) => {
  const fullPath = path.join(process.cwd(), item.file);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`${index + 1}. ⚪ ${item.file} - غير موجود`);
    return;
  }

  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // البحث عن: setXxx(mockXxx);
    const searchPattern = `${item.setter}(${item.varName});`;
    
    if (content.includes(searchPattern)) {
      // استبداله بـ: setXxx([]);
      content = content.replace(
        searchPattern,
        `${item.setter}([]); // تم استبدال ${item.varName} ببيانات فارغة`
      );
      
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`${index + 1}. ✅ ${item.file} - تم الإصلاح`);
      fixed++;
    } else {
      console.log(`${index + 1}. ⚪ ${item.file} - لا يحتاج إصلاح`);
    }
  } catch (error) {
    console.log(`${index + 1}. ❌ ${item.file} - خطأ: ${error.message}`);
    errors++;
  }
});

console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
console.log(`📊 الإحصائيات:`);
console.log(`   • الملفات المُصلحة: ${fixed}`);
console.log(`   • الأخطاء: ${errors}`);
console.log(`\n✅ تم إصلاح جميع المتغيرات غير المُعرّفة\n`);

