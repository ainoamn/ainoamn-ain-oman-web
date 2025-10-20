// scripts/fix-duplicate-vars.js - إصلاح المتغيرات المكررة
const fs = require('fs');
const path = require('path');

const files = [
  'src/pages/api/auctions.ts',
  'src/pages/api/auctions/bids.ts',
  'src/pages/api/billing/invoices.ts',
  'src/pages/api/favorites.ts',
];

console.log('🔧 إصلاح المتغيرات المكررة...\n');

for (const file of files) {
  const filePath = path.join(process.cwd(), file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⏭️  ${file} (غير موجود)`);
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Pattern للعثور على switch/case مع const destructuring مكرر
  // نستبدل const بـ let في حالات معينة
  
  // مثال: const { userId, ... } = req.body;
  // إذا كان userId موجود قبلها، نحوله لـ:
  // const bodyData = req.body;
  // const userId = bodyData.userId;
  
  // حل مؤقت: نضيف @ts-ignore قبل السطور المشكلة
  // أو نغير الأسماء لتكون unique
  
  // إذا كان الملف يحتوي على: const { userId, ...
  if (content.includes('const { userId,') && content.split('const { userId,').length > 2) {
    // استبدل التكرار الثاني بـ const destructuring مع prefix
    const parts = content.split('case \'POST\':');
    if (parts.length > 1) {
      // ابحث في الـ POST case عن const destructuring
      parts[1] = parts[1].replace(
        /const \{ userId,([^}]+)\} = req\.body;/,
        'const reqBody = req.body;\n                const userId = reqBody.userId,$1 = reqBody;'
      );
      content = parts.join('case \'POST\':');
      changed = true;
    }
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${file}`);
  } else {
    console.log(`⏭️  ${file} (لا يحتاج تغيير)`);
  }
}

console.log('\n✨ انتهى!');

