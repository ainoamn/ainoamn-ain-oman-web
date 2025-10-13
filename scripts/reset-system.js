#!/usr/bin/env node

/**
 * 🔄 Reset System Script
 * تصفير النظام الكامل - حذف جميع البيانات الوهمية
 * 
 * الاستخدام:
 *   node scripts/reset-system.js
 * 
 * أو:
 *   npm run reset
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔄 بدء تصفير النظام...\n');

// المجلد الذي يحتوي على البيانات
const dataDir = path.join(__dirname, '..', '.data');

// البيانات الفارغة لكل ملف
const emptyData = {
  'properties.json': {
    properties: [],
    lastId: 0
  },
  'units.json': {
    units: [],
    lastId: 0
  },
  'buildings.json': {
    buildings: [],
    lastId: 0
  },
  'tenants.json': {
    tenants: [],
    lastId: 0
  },
  'bookings.json': {
    bookings: [],
    lastId: 0
  },
  'contracts.json': {
    contracts: [],
    lastId: 0
  },
  'invoices.json': {
    invoices: [],
    lastId: 0
  },
  'checks.json': {
    checks: [],
    lastId: 0
  },
  'maintenance.json': {
    requests: [],
    lastId: 0
  },
  'tasks.json': {
    tasks: [],
    lastId: 0
  },
  'payments.json': {
    payments: [],
    lastId: 0
  },
  'legal-cases.json': {
    cases: [],
    lastId: 0
  },
  'legal.json': {
    cases: [],
    documents: [],
    appointments: [],
    lastId: 0
  },
  'messages.json': {
    messages: [],
    conversations: [],
    lastId: 0
  },
  'notifications.json': {
    notifications: [],
    lastId: 0
  },
  'viewings.json': {
    viewings: [],
    lastId: 0
  },
  'favorites.json': {
    favorites: []
  },
  'reservations.json': {
    reservations: [],
    lastId: 0
  },
  'customers.json': {
    customers: [],
    lastId: 0
  },
  'appointments.json': {
    appointments: [],
    lastId: 0
  },
  'requests.json': {
    requests: [],
    lastId: 0
  },
  'ad-orders.json': {
    orders: [],
    lastId: 0
  },
  'ad-products.json': {
    products: [],
    lastId: 0
  },
  'coupons.json': {
    coupons: [],
    lastId: 0
  },
  'db.json': {
    properties: [],
    bookings: [],
    tenants: [],
    contracts: [],
    invoices: [],
    payments: [],
    lastId: 0
  },
  'reports.json': {
    reports: [],
    lastId: 0
  },
  'auctions.json': {
    auctions: [],
    lastId: 0
  }
};

// الملفات التي سنحتفظ بها (الحسابات التجريبية)
const keepFiles = [
  'demo-users.json',
  'all-demo-accounts.json'
];

// إنشاء مجلد .data إذا لم يكن موجوداً
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('✅ تم إنشاء مجلد .data');
}

let filesReset = 0;
let errors = 0;

// مسح كل ملف
Object.keys(emptyData).forEach(filename => {
  const filePath = path.join(dataDir, filename);
  
  try {
    // كتابة البيانات الفارغة
    fs.writeFileSync(
      filePath,
      JSON.stringify(emptyData[filename], null, 2),
      'utf8'
    );
    console.log(`✅ تم تصفير: ${filename}`);
    filesReset++;
  } catch (error) {
    console.error(`❌ خطأ في تصفير ${filename}:`, error.message);
    errors++;
  }
});

// إعادة ضبط ملف المستخدمين (مسح الكل ما عدا الحسابات التجريبية)
const usersFile = path.join(dataDir, 'users.json');
try {
  const emptyUsers = {
    users: [],
    lastId: 0
  };
  fs.writeFileSync(usersFile, JSON.stringify(emptyUsers, null, 2), 'utf8');
  console.log(`✅ تم تصفير: users.json`);
  filesReset++;
} catch (error) {
  console.error(`❌ خطأ في تصفير users.json:`, error.message);
  errors++;
}

// إعادة ضبط الإحصائيات
const statsFile = path.join(dataDir, 'stats.json');
try {
  const emptyStats = {
    totalProperties: 0,
    totalUnits: 0,
    totalBuildings: 0,
    totalTenants: 0,
    totalBookings: 0,
    totalContracts: 0,
    totalInvoices: 0,
    totalRevenue: 0,
    occupancyRate: 0,
    lastUpdated: new Date().toISOString()
  };
  fs.writeFileSync(statsFile, JSON.stringify(emptyStats, null, 2), 'utf8');
  console.log(`✅ تم تصفير: stats.json`);
  filesReset++;
} catch (error) {
  console.error(`❌ خطأ في تصفير stats.json:`, error.message);
  errors++;
}

// النتيجة النهائية
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (errors === 0) {
  console.log('✅ تم تصفير النظام بنجاح!\n');
  console.log(`📊 الإحصائيات:`);
  console.log(`   • عدد الملفات المُصفّرة: ${filesReset}`);
  console.log(`   • الأخطاء: ${errors}`);
  console.log(`\n✅ الحسابات التجريبية محفوظة:`);
  console.log(`   • demo-users.json`);
  console.log(`   • all-demo-accounts.json`);
  console.log(`\n🎯 النظام جاهز للبدء من الصفر!`);
  console.log(`\n🚀 يمكنك الآن البدء بإضافة عقارات جديدة\n`);
} else {
  console.log(`⚠️  تم تصفير النظام مع بعض الأخطاء`);
  console.log(`   • نجح: ${filesReset}`);
  console.log(`   • فشل: ${errors}\n`);
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

