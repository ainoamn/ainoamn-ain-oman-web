# حل مشكلة Gemini API - دليل شامل

## المشكلة
```
Error: [GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent: [404 Not Found]
```

## الحل النهائي

### 1. تفعيل الفوترة في Google AI Studio

النماذج الحديثة (`gemini-1.5-flash` و `gemini-1.5-pro`) تحتاج إلى تفعيل الفوترة في Google AI Studio:

1. اذهب إلى: https://makersuite.google.com/app/apikey
2. اضغط على **Settings** أو **Billing**
3. فعل **Billing** لأحد مشاريع Google Cloud
4. اربط بطاقة ائتمانية (أو استخدم البطاقة المجانية المتاحة)

### 2. التحقق من API Key

تأكد من أن API key لديه الوصول إلى:
- Gemini 1.5 Flash
- Gemini 1.5 Pro

### 3. تحديث API Key في .env.local

تأكد من أن المفتاح في `.env.local` صحيح:
```
GEMINI_API_KEY=AIzaSyDm5cowCdkisYDqozTlOYbYjCvRcJTokks
```

### 4. إعادة تشغيل السيرفر

بعد أي تغييرات، أعد تشغيل السيرفر:
```bash
# أوقف السيرفر (Ctrl+C)
npm run dev
```

## النماذج المدعومة حالياً

الكود الآن يحاول استخدام هذه النماذج بالترتيب:
1. `gemini-1.5-flash` - الأسرع والأرخص
2. `gemini-1.5-pro` - الأكثر دقة
3. `gemini-pro-vision` - بديل احتياطي

## إذا استمرت المشكلة

1. **تحقق من سجلات السيرفر** - ستظهر لك أي نموذج تم استخدامه
2. **تحقق من Google AI Studio** - تأكد من تفعيل الفوترة
3. **أنشئ API key جديد** - قد يكون المفتاح القديم لا يدعم النماذج الحديثة

## ملاحظات مهمة

- النماذج القديمة (`gemini-pro`) لم تعد متاحة في v1beta API
- يجب استخدام النماذج الحديثة (`gemini-1.5-*`)
- بعض النماذج تحتاج إلى تفعيل الفوترة للوصول إليها

