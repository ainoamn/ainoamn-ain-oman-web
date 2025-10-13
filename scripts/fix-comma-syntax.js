#!/usr/bin/env node

/**
 * 🔧 Fix Comma Syntax Errors
 * إصلاح أخطاء الفواصل في التعليقات
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔧 بدء إصلاح أخطاء الفواصل...\n');

function getAllFiles(dir, list = []) {
  const items = fs.readdirSync(dir);
  items.forEach(item => {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      getAllFiles(full, list);
    } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
      list.push(full);
    }
  });
  return list;
}

const dir = path.join(process.cwd(), 'src', 'pages', 'admin', 'financial');
const files = getAllFiles(dir);

let fixed = 0;

files.forEach((file, idx) => {
  const rel = file.replace(process.cwd(), '').replace(/\\/g, '/').substring(1);
  
  try {
    let content = fs.readFileSync(file, 'utf8');
    const original = content;
    
    // إصلاح: : 0 // تم تصفير من 123,
    // إلى:   : 0, // تم تصفير من 123
    content = content.replace(/: 0 \/\/ تم تصفير من (\d+\.?\d*),/g, ': 0, // تم تصفير من $1');
    
    // إصلاح: : 0 /* 123 */,
    // إلى:   : 0, /* 123 */
    content = content.replace(/: 0 \/\* (\d+\.?\d*) \*\/,/g, ': 0, /* $1 */');
    
    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`✅ ${idx + 1}. ${rel}`);
      fixed++;
    }
  } catch (e) {
    console.log(`❌ ${rel} - ${e.message}`);
  }
});

console.log(`\n${'='.repeat(70)}\n`);
console.log(`📊 النتيجة: ${fixed} ملف تم إصلاحه`);
console.log(`\n✅ تم إصلاح جميع أخطاء الفواصل!\n`);

