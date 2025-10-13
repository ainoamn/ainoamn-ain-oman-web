#!/usr/bin/env node

/**
 * 🤖 Auto Fix Mock Data Script
 * سكريبت آلي لإصلاح جميع البيانات الوهمية
 */

const fs = require('fs');
const path = require('path');

console.log('\n🤖 بدء الإصلاح التلقائي للبيانات الوهمية...\n');

const filesToFix = [
  'src/pages/profile/index.tsx',
  'src/pages/admin/users/index.tsx',
  'src/pages/auctions/index.tsx',
  'src/pages/admin/financial/sales/quotations.tsx',
  'src/pages/admin/financial/sales/invoices.tsx',
  'src/pages/admin/financial/receivables.tsx',
  'src/pages/admin/financial/purchases/invoices.tsx',
  'src/pages/admin/financial/payments.tsx',
  'src/pages/admin/financial/payables.tsx',
  'src/pages/admin/financial/invoices.tsx',
  'src/pages/admin/financial/checks.tsx',
  'src/pages/admin/financial/reports/balance-sheet.tsx'
];

let fixed = 0;
let errors = 0;

filesToFix.forEach((file, index) => {
  const fullPath = path.join(process.cwd(), file);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`${index + 1}. ⚠️  ${file} - الملف غير موجود`);
    errors++;
    return;
  }

  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;

    // استبدال: const mockXxx = [ ... ];
    const mockArrayPattern = /const (mock\w+|dummy\w+|sample\w+):\s*\w+\[\]\s*=\s*\[[\s\S]*?\];/g;
    if (mockArrayPattern.test(content)) {
      content = content.replace(mockArrayPattern, (match, varName) => {
        modified = true;
        return `const ${varName}: any[] = []; // تم إزالة البيانات الوهمية - يتم الجلب من API`;
      });
    }

    // استبدال: const mockXxx = { ... };
    const mockObjectPattern = /const (mock\w+|dummy\w+|sample\w+):\s*\w+\s*=\s*\{[\s\S]*?\};/g;
    if (mockObjectPattern.test(content)) {
      content = content.replace(mockObjectPattern, (match, varName) => {
        modified = true;
        return `// const ${varName} تم إزالة البيانات الوهمية`;
      });
    }

    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`${index + 1}. ✅ ${file} - تم الإصلاح`);
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
console.log(`\n✅ انتهى الإصلاح التلقائي\n`);

