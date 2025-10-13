#!/usr/bin/env node

/**
 * 🔧 Fix Properties Page Script
 * إصلاح صفحة تفاصيل العقار properties/[id].tsx
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔧 بدء إصلاح صفحة properties/[id].tsx...\n');

const file = 'src/pages/properties/[id].tsx';
const fullPath = path.join(process.cwd(), file);

if (!fs.existsSync(fullPath)) {
  console.log('❌ الملف غير موجود');
  process.exit(1);
}

let content = fs.readFileSync(fullPath, 'utf8');
let fixedCount = 0;

// استبدال جميع البيانات الوهمية في properties/[id].tsx
const replacements = [
  {
    name: 'mockReviews',
    from: /const mockReviews: Review\[\] = \[[\s\S]*?\];/,
    to: 'const mockReviews: Review[] = []; // تم إزالة البيانات الوهمية - يتم الجلب من API',
  },
  {
    name: 'mockStats',
    from: /const mockStats: Statistics = \{[\s\S]*?\};/,
    to: 'const mockStats: Statistics = { views: 0, favorites: 0, shares: 0, bookings: 0, avgRating: 0 }; // من API',
  },
  {
    name: 'mockRatings (PropertyRating)',
    from: /const mockRatings: PropertyRating\[\] = \[[\s\S]*?\];/,
    to: 'const mockRatings: PropertyRating[] = []; // تم إزالة البيانات الوهمية',
  },
  {
    name: 'mockRatings (CompanyRating)',
    from: /const mockRatings: CompanyRating\[\] = \[[\s\S]*?\];/,
    to: 'const mockRatings: CompanyRating[] = []; // تم إزالة البيانات الوهمية',
  },
  {
    name: 'mockRatings (ServiceRating)',
    from: /const mockRatings: ServiceRating\[\] = \[[\s\S]*?\];/,
    to: 'const mockRatings: ServiceRating[] = []; // تم إزالة البيانات الوهمية',
  },
  {
    name: 'mockProfile',
    from: /const mockProfile: UserProfile = \{[\s\S]*?\};/,
    to: 'const mockProfile: UserProfile | null = null; // تم إزالة البيانات الوهمية',
  },
  {
    name: 'mockBadges',
    from: /const mockBadges: Badge\[\] = \[[\s\S]*?\];/,
    to: 'const mockBadges: Badge[] = []; // تم إزالة البيانات الوهمية',
  },
  {
    name: 'mockSimilar',
    from: /const mockSimilar: SimilarProperty\[\] = \[[\s\S]*?\];/,
    to: 'const mockSimilar: SimilarProperty[] = []; // تم إزالة البيانات الوهمية',
  },
  {
    name: 'mockUser',
    from: /const mockUser: User = \{[\s\S]*?\};/,
    to: 'const mockUser: User | null = null; // تم إزالة البيانات الوهمية',
  },
  {
    name: 'mockUnits',
    from: /const mockUnits: BuildingUnit\[\] = \[[\s\S]*?\];/,
    to: 'const mockUnits: BuildingUnit[] = []; // تم إزالة البيانات الوهمية',
  }
];

replacements.forEach((replacement, index) => {
  if (replacement.from.test(content)) {
    content = content.replace(replacement.from, replacement.to);
    console.log(`${index + 1}. ✅ تم إصلاح: ${replacement.name}`);
    fixedCount++;
  } else {
    console.log(`${index + 1}. ⚪ لم يتم العثور على: ${replacement.name}`);
  }
});

// حفظ الملف
fs.writeFileSync(fullPath, content, 'utf8');

console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
console.log(`📊 النتيجة:`);
console.log(`   • تم إصلاح: ${fixedCount} بيانات وهمية`);
console.log(`\n✅ تم حفظ الملف: properties/[id].tsx\n`);

