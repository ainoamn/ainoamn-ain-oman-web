#!/usr/bin/env node

/**
 * 🔧 Fix Mock Data Script
 * سكريبت لاستبدال البيانات الوهمية بجلب من API
 * 
 * الاستخدام:
 *   node scripts/fix-mock-data.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔧 بدء إصلاح البيانات الوهمية...\n');

// الصفحات التي تحتوي على بيانات وهمية
const pagesToFix = [
  {
    file: 'src/pages/dashboard/index.tsx',
    pattern: /const mockUser.*?};/gs,
    replacement: '// تم إزالة البيانات الوهمية - يتم الجلب من API',
    description: 'لوحة التحكم الرئيسية'
  },
  {
    file: 'src/pages/profile/index.tsx',
    pattern: /const mockData.*?;/gs,
    replacement: '// تم إزالة البيانات الوهمية',
    description: 'صفحة الملف الشخصي'
  },
  {
    file: 'src/pages/admin/users/index.tsx',
    pattern: /const mockUsers.*?];/gs,
    replacement: '// تم إزالة البيانات الوهمية',
    description: 'صفحة المستخدمين'
  }
];

// دليل إصلاح مبسط
const simpleFixGuide = `
📋 دليل الإصلاح اليدوي:

لكل صفحة تحتوي على بيانات وهمية:

1. ابحث عن: const mock... = [ ... ]
2. استبدلها بـ: 
   
   const [data, setData] = useState([]);
   
   useEffect(() => {
     fetch('/api/...')
       .then(res => res.json())
       .then(data => setData(data))
       .catch(() => setData([]));
   }, []);

3. أضف حالة فارغة:
   
   {data.length > 0 ? (
     // عرض الجدول
   ) : (
     <div>لا توجد بيانات</div>
   )}
`;

console.log('⚠️  هذا السكريبت للتوثيق فقط');
console.log('📝 الصفحات التي تحتاج إصلاح يدوي:\n');

const filesToCheck = [
  'src/pages/dashboard/index.tsx',
  'src/pages/profile/index.tsx',
  'src/pages/admin/users/index.tsx',
  'src/pages/admin/financial/sales/quotations.tsx',
  'src/pages/admin/financial/sales/invoices.tsx',
  'src/pages/admin/financial/receivables.tsx',
  'src/pages/admin/financial/purchases/invoices.tsx',
  'src/pages/admin/financial/payments.tsx',
  'src/pages/admin/financial/payables.tsx',
  'src/pages/admin/financial/invoices.tsx',
  'src/pages/admin/financial/checks.tsx',
  'src/pages/admin/financial/reports/balance-sheet.tsx',
  'src/pages/auctions/index.tsx',
  'src/pages/properties/[id].tsx'
];

let found = 0;
filesToCheck.forEach((file, index) => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    
    if (content.includes('mock') || content.includes('dummy') || content.includes('sample')) {
      found++;
      console.log(`${index + 1}. ⚠️  ${file}`);
      
      // عد عدد البيانات الوهمية
      const mockMatches = content.match(/const mock/g) || [];
      const dummyMatches = content.match(/const dummy/g) || [];
      const sampleMatches = content.match(/const sample/g) || [];
      
      const total = mockMatches.length + dummyMatches.length + sampleMatches.length;
      console.log(`   → يحتوي على ${total} بيانات وهمية\n`);
    }
  }
});

console.log(`\n📊 الإحصائيات:`);
console.log(`   • الملفات التي تحتوي بيانات وهمية: ${found}`);
console.log(`\n${simpleFixGuide}`);
console.log('\n✅ انتهى الفحص\n');

