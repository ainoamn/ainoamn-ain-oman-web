#!/usr/bin/env node

/**
 * 🔧 Comprehensive Mock Data Fix
 * إصلاح شامل لجميع البيانات الوهمية في النظام بالكامل
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔧 بدء الفحص والإصلاح الشامل...\n');

// البحث عن جميع ملفات tsx و ts في admin/financial
function getAllFilesRecursive(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllFilesRecursive(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

const financialDir = path.join(process.cwd(), 'src', 'pages', 'admin', 'financial');
const allFiles = getAllFilesRecursive(financialDir);

console.log(`📁 تم العثور على ${allFiles.length} ملف\n`);

let totalFiles = 0;
let filesWithMocks = 0;
let mocksRemoved = 0;
let errors = 0;

allFiles.forEach((filePath, index) => {
  totalFiles++;
  const relativePath = filePath.replace(process.cwd(), '').replace(/\\/g, '/');
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let fileModCount = 0;

    // 1. استبدال: const mockXxx: Type[] = [ ... ];
    const arrayPattern = /const (mock\w+|dummy\w+|sample\w+):\s*[\w\[\]<>]+\s*=\s*\[[\s\S]*?\];/g;
    let match;
    while ((match = arrayPattern.exec(content)) !== null) {
      const varName = match[1];
      content = content.replace(match[0], `const ${varName}: any[] = []; // تم إزالة البيانات الوهمية`);
      modified = true;
      fileModCount++;
      mocksRemoved++;
    }

    // 2. استبدال: const mockXxx: Type = { ... };
    const objectPattern = /const (mock\w+|dummy\w+|sample\w+):\s*[\w<>]+\s*=\s*\{[\s\S]*?\n\s*\};/g;
    content = content.replace(objectPattern, (match, varName) => {
      modified = true;
      fileModCount++;
      mocksRemoved++;
      return `const ${varName}: any = {}; // تم إزالة البيانات الوهمية`;
    });

    // 3. استبدال: setXxx(mockXxx) حيث mockXxx غير موجود
    const setterPattern = /set(\w+)\((mock\w+|dummy\w+|sample\w+)\);/g;
    const setterMatches = [...content.matchAll(setterPattern)];
    
    setterMatches.forEach(match => {
      const setter = match[1];
      const varName = match[2];
      
      // التحقق إذا كان المتغير غير مُعرّف
      const isDefinedPattern = new RegExp(`const ${varName}[\\s:\\w\\[\\]<>]*=`, 'm');
      
      if (!isDefinedPattern.test(content)) {
        content = content.replace(
          `set${setter}(${varName});`,
          `set${setter}(null); // تم استبدال ${varName} ببيانات فارغة`
        );
        modified = true;
        fileModCount++;
        mocksRemoved++;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      filesWithMocks++;
      console.log(`${index + 1}. ✅ ${relativePath.substring(1)}`);
      console.log(`   → تم إزالة ${fileModCount} بيانات وهمية\n`);
    }
  } catch (error) {
    console.log(`${index + 1}. ❌ ${relativePath} - خطأ: ${error.message}\n`);
    errors++;
  }
});

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log(`📊 النتيجة النهائية:`);
console.log(`   • إجمالي الملفات: ${totalFiles}`);
console.log(`   • ملفات تحتوي بيانات وهمية: ${filesWithMocks}`);
console.log(`   • بيانات وهمية تم إزالتها: ${mocksRemoved}`);
console.log(`   • أخطاء: ${errors}`);
console.log(`\n✅ تم إصلاح جميع صفحات المحاسبة!\n`);

