#!/usr/bin/env node

/**
 * 🚀 Ultimate Zero All - The Final Solution
 * تصفير شامل ونهائي لجميع الأرقام الوهمية في كل صفحات المحاسبة
 */

const fs = require('fs');
const path = require('path');

console.log('\n🚀 بدء التصفير الشامل والنهائي...\n');

// جميع ملفات tsx في admin/financial
function getAllFiles(dir, list = []) {
  const items = fs.readdirSync(dir);
  items.forEach(item => {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      getAllFiles(full, list);
    } else if (item.endsWith('.tsx')) {
      list.push(full);
    }
  });
  return list;
}

const dir = path.join(process.cwd(), 'src', 'pages', 'admin', 'financial');
const allFiles = getAllFiles(dir);

let fixed = 0;
let total = 0;

allFiles.forEach((file, idx) => {
  const rel = file.replace(process.cwd(), '').replace(/\\/g, '/').substring(1);
  
  try {
    let content = fs.readFileSync(file, 'utf8');
    const original = content;
    
    // استبدال جميع الأرقام الكبيرة (>= 100) بـ 0
    // إلا إذا كانت سنة (2024, 2025, etc)
    content = content.replace(/:\s*(\d{3,}\.?\d*)/g, (match, num) => {
      const n = parseFloat(num);
      
      // استثناءات:
      // - سنوات (2020-2030)
      if (n >= 2020 && n <= 2030) return match;
      // - أرقام صغيرة (< 100)
      if (n < 100) return match;
      // - أرقام في تواريخ أو strings
      if (match.includes('20')) return match;
      
      total++;
      return ': 0 /* ' + num + ' */';
    });
    
    // استبدال أرقام في المصفوفات const data
    content = content.replace(/(const\s+data\s*=[\s\S]*?\{[\s\S]*?\})/g, (match) => {
      return match.replace(/:\s*(-?\d{3,})/g, (m, num) => {
        const n = parseInt(num);
        if (Math.abs(n) >= 100) {
          total++;
          return ': 0 /* ' + num + ' */';
        }
        return m;
      });
    });

    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      fixed++;
      console.log(`✅ ${idx + 1}. ${rel}`);
    }
  } catch (e) {
    console.log(`❌ ${idx + 1}. ${rel} - ${e.message}`);
  }
});

console.log(`\n${'='.repeat(70)}\n`);
console.log(`📊 النتيجة النهائية:`);
console.log(`   • ملفات تم فحصها: ${allFiles.length}`);
console.log(`   • ملفات تم إصلاحها: ${fixed}`);
console.log(`   • أرقام تم تصفيرها: ${total}`);
console.log(`\n✅ تم التصفير الشامل بنجاح!\n`);

