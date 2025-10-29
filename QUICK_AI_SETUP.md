# إعداد سريع للذكاء الاصطناعي

## 1. احصل على API Key
- اذهب إلى: https://makersuite.google.com/app/apikey
- اضغط "Create API Key"
- انسخ المفتاح

## 2. أضف المفتاح إلى .env.local
```bash
GEMINI_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 3. أعد تشغيل السيرفر
```bash
npm run dev
```

## 4. اختبر الميزات
- اذهب إلى: http://localhost:3000/contracts/templates/new
- اكتب نصاً بالعربية
- اضغط زر الترجمة أو التحسين
