const fs = require('fs');
const path = require('path');

console.log('🧹 Cleaning component files with mixed API code...\n');

// الملفات التي تحتوي على component + API code
const problematicFiles = [
  'src/components/tasks/TaskFiltersBar.tsx',
  'src/components/tasks/TaskInvitePanel.tsx',
];

problematicFiles.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`⏭️  Skipping ${path.basename(filePath)} (not found)`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // البحث عن export default function handler
  const handlerIndex = content.indexOf('export default function handler');
  const asyncHandlerIndex = content.indexOf('export default async function handler');
  
  const cutIndex = Math.min(
    handlerIndex === -1 ? Infinity : handlerIndex,
    asyncHandlerIndex === -1 ? Infinity : asyncHandlerIndex
  );
  
  if (cutIndex !== Infinity) {
    // قص الـ component فقط (قبل API handler)
    content = content.substring(0, cutIndex).trim();
    
    // إضافة سطر نهائي
    if (!content.endsWith('\n')) {
      content += '\n';
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Cleaned ${path.basename(filePath)}`);
  }
});

console.log('\n✅ Done!\n');

