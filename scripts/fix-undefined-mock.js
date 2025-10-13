#!/usr/bin/env node

/**
 * 🔧 Fix Undefined Mock Variables
 * إصلاح المتغيرات الوهمية غير المُعرّفة
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔧 بدء إصلاح المتغيرات غير المُعرّفة...\n');

const filesToFix = [
  'src/pages/admin/financial/reports/balance-sheet.tsx',
  'src/pages/admin/financial/checks.tsx',
  'src/pages/admin/financial/invoices.tsx',
  'src/pages/admin/financial/payables.tsx',
  'src/pages/admin/financial/payments.tsx',
  'src/pages/admin/financial/purchases/invoices.tsx',
  'src/pages/admin/financial/receivables.tsx',
  'src/pages/admin/financial/sales/invoices.tsx',
  'src/pages/admin/financial/sales/quotations.tsx',
  'src/pages/admin/financial/bank-accounts/[id].tsx'
];

let fixed = 0;
let errors = 0;

filesToFix.forEach((file, index) => {
  const fullPath = path.join(process.cwd(), file);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`${index + 1}. ⚪ ${file} - غير موجود`);
    return;
  }

  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;

    // البحث عن: setXxx(mockXxx) حيث mockXxx غير مُعرّف
    const undefinedMockPattern = /set(\w+)\((mock\w+)\);/g;
    
    const matches = [...content.matchAll(undefinedMockPattern)];
    
    matches.forEach(match => {
      const setter = match[1]; // مثل: BalanceSheet
      const varName = match[2]; // مثل: mockBalanceSheet
      
      // التحقق إذا كان المتغير غير مُعرّف
      const isDefinedPattern = new RegExp(`const ${varName}[\\s\\S]*?=`, 'm');
      
      if (!isDefinedPattern.test(content)) {
        // المتغير غير مُعرّف - استبداله ببيانات فارغة
        content = content.replace(
          `set${setter}(${varName});`,
          `set${setter}([]); // تم استبدال ${varName} ببيانات فارغة`
        );
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`${index + 1}. ✅ ${file}`);
      fixed++;
    } else {
      console.log(`${index + 1}. ⚪ ${file} - لا يحتاج إصلاح`);
    }
  } catch (error) {
    console.log(`${index + 1}. ❌ ${file} - خطأ: ${error.message}`);
    errors++;
  }
});

console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
console.log(`📊 الإحصائيات:`);
console.log(`   • الملفات المُصلحة: ${fixed}`);
console.log(`   • الأخطاء: ${errors}`);
console.log(`\n✅ تم إصلاح المتغيرات غير المُعرّفة\n`);

