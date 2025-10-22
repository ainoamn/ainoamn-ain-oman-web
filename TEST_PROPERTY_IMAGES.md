# 🧪 دليل اختبار نظام الصور في العقارات

## ✅ الإصلاحات المطبقة:

### **1. API Backend (`src/pages/api/properties/[id].tsx`):**
- ✅ `import formidable from "formidable"` - استيراد صحيح
- ✅ `export const config = { api: { bodyParser: false } }` - تعطيل bodyParser
- ✅ `formidable({ ... })` - استخدام مباشر (نفس index.ts)
- ✅ معالجة `existingImages` + `files.images` جديدة
- ✅ دمج الصور الموجودة + الجديدة في `finalImages`
- ✅ قراءة JSON body يدوياً عندما لا يوجد multipart

### **2. Frontend (`src/pages/properties/[id]/edit.tsx`):**
- ✅ نوع البيانات: `images: (File | string)[]`
- ✅ تحميل الصور كـ URLs (strings) بدون تحويل لـ Files
- ✅ عرض الصور: دعم `typeof img === 'string' ? img : URL.createObjectURL(img)`
- ✅ ضغط الصور قبل الرفع (توفير 50-80%)
- ✅ إرسال FormData عند وجود Files جديدة
- ✅ إرسال JSON عند عدم وجود Files جديدة
- ✅ مؤشر تقدم حي
- ✅ Error handling شامل

### **3. API Index (`src/pages/api/properties/index.ts`):**
- ✅ `published: true` افتراضياً للعقارات الجديدة
- ✅ إرجاع `{ properties: [...], items: [...] }` (دعم كلا التنسيقين)

---

## 📋 خطة الاختبار الشاملة:

### **اختبار 1: إنشاء عقار جديد مع صور**

**الخطوات:**
1. افتح: `http://localhost:3000/properties/new`
2. املأ البيانات الأساسية
3. أضف 2-3 صور
4. اضغط "حفظ"

**النتيجة المتوقعة:**
- ✅ الصور تُضغَط (راقب Console)
- ✅ رسالة "تم حفظ العقار بنجاح!"
- ✅ إعادة توجيه لصفحة الإدارة
- ✅ العقار يظهر في القائمة
- ✅ `published: true` تلقائياً

---

### **اختبار 2: تعديل عقار بدون تغيير الصور**

**الخطوات:**
1. افتح عقار موجود: `http://localhost:3000/properties/P-.../edit`
2. عدّل العنوان فقط
3. **لا تلمس الصور**
4. اضغط "حفظ"

**النتيجة المتوقعة:**
- ✅ يُرسَل JSON (ليس FormData)
- ✅ الصور تبقى كما هي
- ✅ رسالة نجاح
- في Terminal:
  ```
  📝 Parsed JSON body, keys: [...]
  🖼️ Images before upsert: ['/uploads/...']
  ✅ Property updated, images: ['/uploads/...']
  ```

---

### **اختبار 3: تعديل عقار + إضافة صور جديدة**

**الخطوات:**
1. افتح عقار موجود له صور: `http://localhost:3000/properties/P-.../edit`
2. أضف 1-2 صورة جديدة
3. اضغط "حفظ"

**النتيجة المتوقعة:**
- ✅ يُرسَل FormData (لأن هناك Files)
- ✅ الصور القديمة تُرسَل في `existingImages`
- ✅ الصور الجديدة تُضغَط وتُرفَع
- ✅ يتم دمجهم
- في Terminal:
  ```
  ✅ FormData parsed successfully
  📸 Restored existing images: 3
  🆕 Added new images: 2
  📊 Total images in body: 5
  ✅ Property updated, images: [5 items]
  ```

---

### **اختبار 4: حذف صورة من عقار موجود**

**الخطوات:**
1. افتح عقار له صور: `http://localhost:3000/properties/P-.../edit`
2. احذف صورة واحدة (زر X)
3. اضغط "حفظ"

**النتيجة المتوقعة:**
- ✅ يُرسَل JSON (لا توجد Files جديدة)
- ✅ الصور المتبقية فقط تُحفَظ
- ✅ الصورة المحذوفة لا تظهر

---

## 🔍 نقاط التشخيص:

### **في Console المتصفح:**
```javascript
// عند الحفظ بدون صور جديدة:
📤 Sending data to API:
🖼️ Images count: 3
🖼️ Images: ["/uploads/...", "/uploads/...", "/uploads/..."]

// عند الحفظ مع صور جديدة:
🗜️ Compressing images...
  image1.jpg: 2500.0KB → 450.0KB
✅ Compression complete!
📤 Sending FormData with:
  - Existing images: 3
  - New files: 1
```

### **في Terminal:**
```javascript
// FormData route:
✅ FormData parsed successfully
📝 Fields keys: ['titleAr', 'titleEn', ...]
📁 Files keys: ['images']
📸 Restored existing images: 3
🆕 Added new images: 1
📊 Total images in body: 4
🖼️ Images before upsert: ['/uploads/...', ...]
✅ Property updated, images: [4 items]
PUT /api/properties/P-... 200 in 2000ms

// JSON route:
📝 Parsed JSON body, keys: [...]
🖼️ Images before upsert: ['/uploads/...', ...]
✅ Property updated, images: [3 items]
PUT /api/properties/P-... 200 in 50ms
```

---

## ❌ الأخطاء المحتملة وحلولها:

### **خطأ: "formidable is not a function"**
**السبب:** استيراد أو استخدام خاطئ  
**الحل:** استخدام `formidable({ ... })` مباشرة (تم ✅)

### **خطأ: "Failed to fetch"**
**السبب:** انقطاع شبكة أو timeout  
**الحل:** ضغط الصور + timeout أطول (تم ✅)

### **خطأ: الصور تختفي**
**السبب:** إرسال URLs كـ Files  
**الحل:** فصل existingImages + newFiles (تم ✅)

---

## ✅ Checklist النهائي:

- [x] formidable يستخدم بشكل صحيح
- [x] bodyParser معطل في API
- [x] قراءة JSON يدوياً
- [x] معالجة FormData صحيحة
- [x] ضغط الصور قبل الرفع
- [x] الحفاظ على الصور الموجودة
- [x] مؤشر تقدم واضح
- [x] Error handling شامل
- [ ] **الاختبار الفعلي** ← التالي

---

**تاريخ:** 2025-10-22  
**الحالة:** ✅ جاهز للاختبار النهائي

