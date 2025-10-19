const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// خريطة بدائل الأيقونات
const iconReplacements = {
  'FaRefresh': 'FaSync',
  'FaCloudUpload': 'FaCloudUploadAlt',
  'FaTarget': 'FaBullseye',
  'FaBrain': 'FaRobot',
  'FaMagic': 'FaStar',
  'FaScale': 'FaBalanceScale',
};

// دالة للبحث عن جميع ملفات tsx و ts
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (!filePath.includes('node_modules') && !filePath.includes('.next')) {
        arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

// دالة لاستبدال الأيقونات في ملف
function replaceIconsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  Object.entries(iconReplacements).forEach(([oldIcon, newIcon]) => {
    if (content.includes(oldIcon)) {
      content = content.replace(new RegExp(oldIcon, 'g'), newIcon);
      modified = true;
      console.log(`  ✓ ${oldIcon} → ${newIcon} في ${path.basename(filePath)}`);
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
  }

  return modified;
}

// البدء
console.log('🔧 إصلاح أيقونات React Icons...\n');

const srcDir = path.join(process.cwd(), 'src');
const allFiles = getAllFiles(srcDir);

let filesModified = 0;
let totalReplacements = 0;

allFiles.forEach((filePath) => {
  const modified = replaceIconsInFile(filePath);
  if (modified) {
    filesModified++;
  }
});

console.log(`\n✅ تم الانتهاء!`);
console.log(`📁 ملفات معدلة: ${filesModified}`);

console.log('\n🧪 اختبار البناء...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('\n✅ البناء نجح!');
} catch (error) {
  console.log('\n⚠️  لا تزال هناك أخطاء، يرجى مراجعتها.');
}

