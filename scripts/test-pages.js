// scripts/test-pages.js
// Script لاختبار جميع الصفحات الرئيسية ⚡

const http = require('http');

const BASE_URL = 'http://localhost:3000';

const PAGES_TO_TEST = [
  { path: '/', name: 'الصفحة الرئيسية' },
  { path: '/properties', name: 'العقارات' },
  { path: '/auctions', name: 'المزادات' },
  { path: '/calendar', name: 'التقويم' },
  { path: '/performance-demo', name: 'صفحة التجربة' },
  { path: '/partners', name: 'الشركاء' },
  { path: '/about', name: 'من نحن' },
  { path: '/contact', name: 'اتصل بنا' },
];

async function testPage(path, name) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    http.get(`${BASE_URL}${path}`, (res) => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      const status = res.statusCode;
      const statusEmoji = status === 200 ? '✅' : status === 404 ? '❌' : '⚠️';
      
      console.log(`${statusEmoji} ${name.padEnd(20)} | ${path.padEnd(30)} | Status: ${status} | Time: ${responseTime}ms`);
      
      resolve({
        path,
        name,
        status,
        responseTime,
        success: status === 200
      });
    }).on('error', (err) => {
      console.log(`❌ ${name.padEnd(20)} | ${path.padEnd(30)} | Error: ${err.message}`);
      resolve({
        path,
        name,
        status: 0,
        responseTime: 0,
        success: false,
        error: err.message
      });
    });
  });
}

async function runTests() {
  console.log('\n🧪 بدء اختبار الصفحات الرئيسية...\n');
  console.log('═'.repeat(90));
  console.log('الحالة | الاسم              | المسار                         | الحالة + الوقت');
  console.log('═'.repeat(90));
  
  const results = [];
  
  for (const page of PAGES_TO_TEST) {
    const result = await testPage(page.path, page.name);
    results.push(result);
    // انتظر قليلاً بين الطلبات
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('═'.repeat(90));
  console.log('\n📊 ملخص النتائج:\n');
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
  
  console.log(`✅ نجح: ${successful}/${results.length}`);
  console.log(`❌ فشل: ${failed}/${results.length}`);
  console.log(`⚡ متوسط وقت الاستجابة: ${Math.round(avgResponseTime)}ms`);
  
  if (failed > 0) {
    console.log('\n⚠️ الصفحات الفاشلة:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.name} (${r.path})`);
    });
  }
  
  console.log('\n' + '═'.repeat(90));
  
  if (avgResponseTime < 100) {
    console.log('🚀 الأداء ممتاز! جميع الصفحات سريعة جداً!');
  } else if (avgResponseTime < 500) {
    console.log('✅ الأداء جيد! الصفحات تعمل بشكل جيد.');
  } else {
    console.log('⚠️ الأداء متوسط. قد تحتاج بعض التحسينات.');
  }
  
  console.log('\n');
}

// تشغيل الاختبارات
runTests().catch(console.error);

