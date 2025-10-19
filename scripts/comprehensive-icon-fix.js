const fs = require('fs');
const path = require('path');

console.log('🔧 Comprehensive React Icons Fix\n');

// خريطة كاملة لبدائل الأيقونات
const iconMap = {
  'FaRefresh': 'FaSync',
  'FaCloudUpload': 'FaCloudUploadAlt',
  'FaTarget': 'FaBullseye',
  'FaBrain': 'FaRobot',
  'FaMagic': 'FaStar',
  'FaScale': 'FaBalanceScale',
};

// قائمة الأيقونات غير الموجودة لإزالتها
const iconsToRemove = ['FaClock']; // مثال - أضف هنا أي أيقونات أخرى

// دالة لمعالجة الملف
function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // استبدال الأيقونات
  Object.entries(iconMap).forEach(([old, replacement]) => {
    if (content.includes(old)) {
      content = content.replace(new RegExp(old, 'g'), replacement);
      modified = true;
    }
  });

  // إزالة الأيقونات المكررة في الاستيراد
  const importRegex = /import\s*{([^}]+)}\s*from\s*['"]react-icons\/fa['"]/;
  const match = content.match(importRegex);
  
  if (match) {
    const imports = match[1]
      .split(',')
      .map(i => i.trim())
      .filter((icon, index, self) => self.indexOf(icon) === index) // إزالة المكررات
      .join(', ');
    
    content = content.replace(importRegex, `import { ${imports} } from 'react-icons/fa'`);
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Fixed: ${path.basename(filePath)}`);
    return true;
  }
  return false;
}

// جلب جميع ملفات tsx/ts
function getAllFiles(dir, files = []) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    
    if (item.isDirectory()) {
      if (!item.name.startsWith('.') && item.name !== 'node_modules') {
        getAllFiles(fullPath, files);
      }
    } else if (item.name.endsWith('.tsx') || item.name.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// معالجة جميع الملفات
const srcDir = path.join(process.cwd(), 'src');
const files = getAllFiles(srcDir);

let fixedCount = 0;
files.forEach(file => {
  if (fixFile(file)) fixedCount++;
});

console.log(`\n✅ Fixed ${fixedCount} files\n`);

