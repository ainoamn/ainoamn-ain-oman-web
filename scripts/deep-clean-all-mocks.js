#!/usr/bin/env node

/**
 * 🧹 Deep Clean All Mock Data
 * تنظيف عميق لجميع البيانات الوهمية - بحث شامل في كل الصفحات
 */

const fs = require('fs');
const path = require('path');

console.log('\n🧹 بدء التنظيف العميق لجميع البيانات الوهمية...\n');

// البحث عن جميع ملفات tsx في admin/financial
function getAllTsxFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllTsxFiles(filePath, fileList);
    } else if (file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

const financialDir = path.join(process.cwd(), 'src', 'pages', 'admin', 'financial');
const allFiles = getAllTsxFiles(financialDir);

console.log(`📁 تم العثور على ${allFiles.length} ملف tsx\n`);

let filesFixed = 0;
let totalReplacements = 0;

allFiles.forEach((filePath, index) => {
  const relativePath = filePath.replace(process.cwd(), '').replace(/\\/g, '/');
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let fileModCount = 0;

    // استبدال الأرقام الكبيرة المُحتمل أن تكون وهمية
    // مثل: openingBalance: 50000 → openingBalance: 0
    const largeNumberPattern = /:\s*(\d{4,}\.?\d*)/g;
    content = content.replace(largeNumberPattern, (match, num) => {
      // تجاهل السنوات (2024, 2025) والأرقام الصغيرة
      if (num.length === 4 && num.startsWith('20')) return match;
      if (parseInt(num) < 1000) return match;
      
      fileModCount++;
      return ': 0 // تم تصفير من ' + num;
    });

    // استبدال البيانات الثابتة في objects
    // مثل: const data = { total: 120020 }
    const dataPattern = /(const\s+data\s*=\s*\{[\s\S]*?\})/g;
    content = content.replace(dataPattern, (match) => {
      if (match.includes('mock') || match.includes('dummy')) {
        return match; // already handled
      }
      
      // استبدال الأرقام الكبيرة داخل const data
      return match.replace(/:\s*(\d{4,})/g, (m, num) => {
        if (num.length === 4 && num.startsWith('20')) return m;
        fileModCount++;
        return ': 0 /* ' + num + ' */';
      });
    });

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      filesFixed++;
      totalReplacements += fileModCount;
      console.log(`${index + 1}. ✅ ${relativePath.substring(1)}`);
      console.log(`   → ${fileModCount} استبدالات\n`);
    }
  } catch (error) {
    console.log(`${index + 1}. ❌ ${relativePath} - خطأ\n`);
  }
});

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log(`📊 النتيجة:`);
console.log(`   • ملفات تم فحصها: ${allFiles.length}`);
console.log(`   • ملفات تم إصلاحها: ${filesFixed}`);
console.log(`   • إجمالي الاستبدالات: ${totalReplacements}`);
console.log(`\n✅ تم التنظيف العميق!\n`);

