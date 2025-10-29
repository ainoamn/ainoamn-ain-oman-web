# حل مشكلة Gemini API - دليل شامل

## المشكلة
```
Error: [GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com/v1beta/models/...:generateContent: [404 Not Found]
```

## الحل النهائي - خطوات مفصلة

### الخطوة 1: تفعيل Generative Language API في Google Cloud Console

1. اذهب إلى: https://console.cloud.google.com/
2. اختر مشروعك أو أنشئ مشروع جديد
3. اذهب إلى **APIs & Services** > **Library**
4. ابحث عن **"Generative Language API"**
5. اضغط **Enable** لتفعيل الخدمة

### الخطوة 2: تفعيل الفوترة

1. اذهب إلى: https://console.cloud.google.com/billing
2. اختر مشروعك
3. اربط حساب فوترة (بطاقة ائتمانية أو بطاقة مجانية)
4. تأكد من أن الفوترة مفعلة

### الخطوة 3: إنشاء API Key جديد

1. اذهب إلى: https://makersuite.google.com/app/apikey
2. اضغط **Create API Key**
3. اختر المشروع الذي فعلت عليه الـ API
4. انسخ المفتاح الجديد
5. ضعه في `.env.local`:
   ```
   GEMINI_API_KEY=your_new_api_key_here
   ```

### الخطوة 4: إعادة تشغيل السيرفر

```bash
# أوقف السيرفر (Ctrl+C)
npm run dev
```

### الخطوة 5: التحقق من النماذج المتاحة

الكود الآن سيتحقق تلقائياً من النماذج المتاحة. عند حدوث خطأ، ستظهر لك رسالة تحتوي على:
- قائمة النماذج المتاحة
- اقتراحات لحل المشكلة

## إذا استمرت المشكلة

### تحقق من Terminal/S console

الكود الآن يطبع في Terminal:
- قائمة النماذج المتاحة: `Available models: ...`
- النماذج التي تم تجربتها: `Trying model: ...`

### حلول إضافية

1. **تأكد من أن المشروع صحيح**
   - في Google Cloud Console، تأكد من اختيار المشروع الصحيح

2. **تحقق من الأذونات**
   - تأكد من أن API key لديه أذونات للوصول إلى Generative Language API

3. **انتظر قليلاً**
   - بعد تفعيل الـ API، قد تحتاج إلى الانتظار بضع دقائق

4. **استخدم API key من مشروع مختلف**
   - جرب إنشاء مشروع جديد من الصفر وتفعيل الخدمات عليه

## النماذج المدعومة

الكود يحاول استخدام هذه النماذج بالترتيب:
1. `gemini-pro` - النموذج الأساسي
2. `gemini-1.5-flash` - الأسرع
3. `gemini-1.5-pro` - الأكثر دقة
4. `gemini-pro-vision` - للصور

## ملاحظات مهمة

- ⚠️ **تفعيل Generative Language API إلزامي** - بدونها لن يعمل أي نموذج
- ⚠️ **تفعيل الفوترة قد يكون مطلوباً** للوصول إلى النماذج الحديثة
- ✅ الكود الآن يكتشف النماذج المتاحة تلقائياً
- ✅ رسائل الخطأ مفصلة وتخبرك بالنماذج المتاحة

