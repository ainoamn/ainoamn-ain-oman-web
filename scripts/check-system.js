// سكريبت فحص النظام السريع
const fs = require('fs');
const path = require('path');

console.log('🔍 فحص النظام...\n');

// قائمة الصفحات المطلوب فحصها
const pagesToCheck = [
  'src/pages/dashboard/admin.tsx',
  'src/pages/dashboard/property-owner.tsx', 
  'src/pages/dashboard/customer.tsx',
  'src/pages/subscriptions/index.tsx',
  'src/pages/calendar/index.tsx',
  'src/lib/subscriptionSystem.ts',
  'src/components/dashboard/IntegratedDashboard.tsx'
];

// قائمة APIs المطلوب فحصها
const apisToCheck = [
  'src/pages/api/subscriptions/index.ts',
  'src/pages/api/subscriptions/user.ts',
  'src/pages/api/subscriptions/permissions.ts',
  'src/pages/api/calendar/events.ts'
];

console.log('📄 فحص الصفحات:');
pagesToCheck.forEach(page => {
  const exists = fs.existsSync(page);
  console.log(`${exists ? '✅' : '❌'} ${page}`);
});

console.log('\n🔌 فحص APIs:');
apisToCheck.forEach(api => {
  const exists = fs.existsSync(api);
  console.log(`${exists ? '✅' : '❌'} ${api}`);
});

console.log('\n🎯 المطلوب إنجازه:');
console.log('1. إصلاح الأخطاء في الصفحات');
console.log('2. إكمال ربط الأنظمة');
console.log('3. اختبار جميع الوظائف');
console.log('4. توثيق نهائي');

console.log('\n📝 للاستمرار في دردشة جديدة:');
console.log('1. اقرأ ملف PROJECT_STATUS.md');
console.log('2. شغل هذا السكريبت: node scripts/check-system.js');
console.log('3. ابدأ من حيث توقفنا');
