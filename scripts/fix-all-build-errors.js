const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Fixing all build errors automatically...\n');

// 1. إصلاح BookingLikeFilter.tsx - sortBy
const bookingFilterPath = 'src/components/search/BookingLikeFilter.tsx';
if (fs.existsSync(bookingFilterPath)) {
  let content = fs.readFileSync(bookingFilterPath, 'utf8');
  content = content.replace(/sortBy:\s*""/g, 'sortBy: undefined');
  fs.writeFileSync(bookingFilterPath, content, 'utf8');
  console.log('✓ Fixed BookingLikeFilter.tsx - sortBy type');
}

// 2. التأكد من استيراد FaClock في جميع الملفات التي تستخدمه
const filesUsingFaClock = [
  'src/components/property/LegalTab.tsx',
  'src/components/property/AIInsightsTab.tsx',
  'src/components/property/TasksTab.tsx',
  'src/components/property/SimpleTasksTab.tsx',
  'src/components/property/ReservationsTab.tsx',
  'src/components/property/FinancialTab.tsx',
  'src/components/property/ContractsTab.tsx',
  'src/components/property/AnalyticsTab.tsx',
  'src/components/NotificationsDropdown.tsx',
];

filesUsingFaClock.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // البحث عن سطر استيراد react-icons/fa
    const importMatch = content.match(/import\s*{([^}]+)}\s*from\s*['"]react-icons\/fa['"]/);
    
    if (importMatch) {
      const currentImports = importMatch[1];
      
      // التحقق من وجود FaClock
      if (!currentImports.includes('FaClock')) {
        // إضافة FaClock
        const newImports = currentImports.trim() + ', FaClock';
        content = content.replace(importMatch[0], `import { ${newImports} } from 'react-icons/fa'`);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✓ Added FaClock to ${path.basename(filePath)}`);
      }
    }
  }
});

// 3. اختبار البناء
console.log('\n🧪 Testing build...');
try {
  execSync('npm run build', { stdio: 'pipe' });
  console.log('\n✅ BUILD SUCCESSFUL!\n');
  process.exit(0);
} catch (error) {
  console.log('\n⚠️  Still have errors. Checking...\n');
  try {
    const output = execSync('npm run build 2>&1', { encoding: 'utf8' });
    const lines = output.split('\n');
    const errorLines = lines.filter(line => 
      line.includes('Type error') || 
      line.includes('Cannot find') ||
      line.includes('not assignable')
    );
    
    console.log('Errors found:');
    errorLines.slice(0, 5).forEach(line => console.log('  ' + line.trim()));
  } catch {}
  process.exit(1);
}


