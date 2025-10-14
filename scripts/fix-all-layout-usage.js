// scripts/fix-all-layout-usage.js
// إصلاح جميع استخدامات Layout في الصفحات

const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/pages/admin/actions.tsx',
  'src/pages/admin/login.tsx',
  'src/pages/admin/sequencing.tsx',
  'src/pages/auth/login.tsx',
  'src/pages/invest/calculator.tsx',
  'src/pages/invest/index.tsx',
  'src/pages/invest/portfolio.tsx',
  'src/pages/invest/[id].tsx',
  'src/pages/legal/drafts.tsx',
  'src/pages/legal/new.tsx',
  'src/pages/legal/[caseId].tsx',
  'src/pages/manage-properties/[id].tsx',
  'src/pages/owners-association/alerts.tsx',
  'src/pages/owners-association/create.tsx',
  'src/pages/owners-association/home.tsx',
  'src/pages/owners-association/investors.tsx',
  'src/pages/owners-association/management.tsx',
  'src/pages/owners-association/notifications.tsx',
  'src/pages/owners-association/requests.tsx',
  'src/pages/owners-association/tracking.tsx',
  'src/pages/owners-association/_dev.tsx',
  'src/pages/properties/finance.tsx',
  'src/pages/properties/unified-management.tsx',
  'src/pages/tasks/new.tsx'
];

let totalFixed = 0;

filesToFix.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  ملف غير موجود: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;
  
  // إزالة import Layout
  if (content.includes("import Layout from '@/components/layout/Layout'") ||
      content.includes('import Layout from "@/components/layout/Layout"')) {
    content = content.replace(/import Layout from ['"]@\/components\/layout\/Layout['"];?\n?/g, '');
    modified = true;
  }
  
  // استبدال <Layout> بـ <>
  if (content.includes('<Layout>')) {
    content = content.replace(/<Layout>/g, '<>');
    content = content.replace(/<\/Layout>/g, '</>');
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ ${filePath}`);
    totalFixed++;
  } else {
    console.log(`⏭️  ${filePath} (لا يحتاج تعديل)`);
  }
});

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log(`✅ تم إصلاح ${totalFixed} ملف بنجاح!`);
console.log('\n🎯 جميع الصفحات الآن تستخدم Fragment بدلاً من Layout\n');

