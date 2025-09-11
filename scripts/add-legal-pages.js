#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// الدليل الجذر للمشروع
const rootDir = path.join(__dirname, '..');

// هيكل المجلدات والملفات المطلوبة
const structure = {
  'src/components/legal': [
    'CaseForm.tsx',
    'CaseTimeline.tsx',
    'DocumentUploader.tsx',
    'ProceedingsTracker.tsx',
    'LegalChat.tsx'
  ],
  'src/components/ai': [
    'LegalPredictions.tsx'
  ],
  'src/pages/legal': [
    'index.tsx',
    'new.tsx',
    '[caseId].tsx'
  ],
  'src/pages/legal/firms': [
    'index.tsx'
  ],
  'src/pages/api/legal': [
    'cases.ts',
    'proceedings.ts',
    'documents.ts',
    'predictions.ts'
  ],
  'src/server/legal': [
    'store.ts',
    'documentService.ts',
    'predictionService.ts'
  ],
  'src/server/ai': [
    'legalAnalytics.ts'
  ],
  'src/lib': [
    'legalCalculations.ts',
    'deadlineNotifications.ts'
  ]
};

// محتوى أساسي لكل نوع من الملفات
const fileTemplates = {
  '.tsx': `export default function Component() {
  return <div>مكون جديد</div>;
}`,
  '.ts': `export default function handler() {
  return { message: "واجهة برمجية جديدة" };
}`
};

// وظيفة لإنشاء المجلدات والملفات
function createStructure() {
  console.log('بدأ إنشاء هيكل نظام التقاضي...');
  
  for (const [folder, files] of Object.entries(structure)) {
    const fullFolderPath = path.join(rootDir, folder);
    
    // إنشاء المجلد إذا لم يكن موجوداً
    if (!fs.existsSync(fullFolderPath)) {
      fs.mkdirSync(fullFolderPath, { recursive: true });
      console.log(`تم إنشاء مجلد: ${folder}`);
    }
    
    // إنشاء الملفات داخل المجلد
    files.forEach(file => {
      const filePath = path.join(fullFolderPath, file);
      const extension = path.extname(file);
      
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, fileTemplates[extension] || '// ملف جديد', 'utf8');
        console.log(`تم إنشاء ملف: ${path.join(folder, file)}`);
      } else {
        console.log(`الملف موجود مسبقاً: ${path.join(folder, file)}`);
      }
    });
  }
  
  console.log('تم إنشاء هيكل نظام التقاضي بنجاح!');
}

// تشغيل الوظيفة
createStructure();