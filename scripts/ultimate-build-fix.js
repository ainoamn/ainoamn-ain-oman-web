const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🛠️  ULTIMATE BUILD FIX - Fixing all common TypeScript/Build errors\n');

function getAllTsFiles(dir, files = []) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      if (!item.name.startsWith('.') && item.name !== 'node_modules' && item.name !== '.next') {
        getAllTsFiles(fullPath, files);
      }
    } else if (item.name.match(/\.(ts|tsx)$/)) {
      files.push(fullPath);
    }
  }
  return files;
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // 1. إزالة كود API من ملفات Components
  if (filePath.includes('/components/') || filePath.includes('\\components\\')) {
    const handlerRegex = /export\s+(default\s+)?(async\s+)?function\s+handler\s*\(/;
    const match = content.match(handlerRegex);
    
    if (match) {
      const index = content.indexOf(match[0]);
      // حذف كل شيء بعد أول export default function handler
      content = content.substring(0, index).trim() + '\n';
      modified = true;
      console.log(`  ✓ Removed API code from ${path.basename(filePath)}`);
    }
    
    // إزالة نصوص تعليمية (مثل "دمج سريع")
    const instructionRegex = /^(دمج سريع|TXT:|إن أردت|ماذا تبقى|4\)|5\))/m;
    const instructionMatch = content.match(instructionRegex);
    
    if (instructionMatch) {
      const index = content.indexOf(instructionMatch[0]);
      content = content.substring(0, index).trim() + '\n';
      modified = true;
      console.log(`  ✓ Removed instructions from ${path.basename(filePath)}`);
    }
  }

  // 2. إضافة export للملفات في src/services/ إذا كانت مفقودة
  if ((filePath.includes('/services/') || filePath.includes('\\services\\')) && !content.includes('export')) {
    const className = path.basename(filePath, path.extname(filePath));
    const classNameCamel = className.charAt(0).toLowerCase() + className.slice(1);
    
    if (content.includes(`class ${className}`)) {
      content = content.trim() + `\n\nexport const ${classNameCamel} = new ${className}();\nexport default ${className};\n`;
      modified = true;
      console.log(`  ✓ Added exports to ${path.basename(filePath)}`);
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
  
  return modified;
}

const srcDir = path.join(process.cwd(), 'src');
const files = getAllTsFiles(srcDir);

let fixedCount = 0;
files.forEach(file => {
  if (fixFile(file)) fixedCount++;
});

console.log(`\n✅ Fixed ${fixedCount} files\n`);

// اختبار البناء
console.log('🧪 Testing build...\n');
try {
  execSync('npm run build -- --no-lint', { stdio: 'inherit', timeout: 120000 });
  console.log('\n✅ BUILD SUCCESSFUL!\n');
} catch (error) {
  console.log('\n⚠️  Build still has errors. Manual review needed.\n');
}




