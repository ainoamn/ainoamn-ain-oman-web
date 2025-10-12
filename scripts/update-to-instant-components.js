// scripts/update-to-instant-components.js
// Script لتحديث جميع الصفحات لاستخدام المكونات المحسنة ⚡

const fs = require('fs');
const path = require('path');

// دالة للبحث في جميع ملفات tsx/ts
function findAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      findAllFiles(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// دالة لتحديث imports في ملف
function updateFileImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // تحديث import Link from "next/link"
  if (content.includes('from "next/link"') || content.includes("from 'next/link'")) {
    // تحقق إذا كان InstantLink موجود بالفعل
    if (!content.includes('InstantLink')) {
      content = content.replace(
        /import Link from ['"]next\/link['"]/g,
        'import Link from "next/link"\nimport InstantLink from "@/components/InstantLink"'
      );
      modified = true;
      console.log(`✓ Updated imports in: ${filePath}`);
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
  
  return modified;
}

// تشغيل التحديث
const srcDir = path.join(__dirname, '..', 'src');
console.log('🚀 بدء تحديث الملفات...\n');

const allFiles = findAllFiles(srcDir);
console.log(`📁 تم العثور على ${allFiles.length} ملف\n`);

let updatedCount = 0;
allFiles.forEach(file => {
  if (updateFileImports(file)) {
    updatedCount++;
  }
});

console.log(`\n✅ تم! تحديث ${updatedCount} ملف`);
console.log('\n💡 ملاحظة: تحتاج إلى استبدال <Link> بـ <InstantLink> يدوياً في الكود');

