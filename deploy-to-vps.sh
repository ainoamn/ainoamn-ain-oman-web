#!/bin/bash
# deploy-to-vps.sh - سكريبت نشر Ain Oman Web على VPS

echo "🚀 بدء عملية النشر على VPS..."

# 1. تنظيف وبناء المشروع
echo "📦 بناء المشروع..."
npm install
npm run build

# 2. إنشاء مجلد النشر
echo "📁 تجهيز ملفات النشر..."
rm -rf deploy
mkdir deploy
cp -r .next deploy/
cp -r public deploy/
cp -r node_modules deploy/
cp package.json deploy/
cp package-lock.json deploy/
cp next.config.js deploy/
cp -r data deploy/ 2>/dev/null || true
cp -r .data deploy/ 2>/dev/null || true

# 3. ضغط الملفات
echo "🗜️  ضغط الملفات..."
cd deploy
tar -czf ../ain-oman-web.tar.gz .
cd ..
rm -rf deploy

echo "✅ تم إنشاء ملف ain-oman-web.tar.gz"
echo ""
echo "📋 الخطوات التالية:"
echo "1. ارفع الملف ain-oman-web.tar.gz إلى السيرفر عبر FTP/SFTP"
echo "2. على السيرفر، فك الضغط: tar -xzf ain-oman-web.tar.gz"
echo "3. شغّل التطبيق: npm start"
echo ""
echo "أو استخدم الأمر التالي لرفع الملف مباشرة:"
echo "scp ain-oman-web.tar.gz user@your-server-ip:/path/to/app"

