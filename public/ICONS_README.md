# 📌 أيقونات PWA المطلوبة

## ملفات الأيقونات المفقودة

يجب إضافة الأيقونات التالية في مجلد `public/`:

### 1. Favicons
- `favicon-16x16.png` - 16x16 pixels
- `favicon-32x32.png` - 32x32 pixels
- `favicon.ico` - 16x16, 32x32, 48x48

### 2. PWA Icons
- `icon-72x72.png`
- `icon-96x96.png`
- `icon-128x128.png`
- `icon-144x144.png` ⚠️ مطلوب حالياً
- `icon-152x152.png`
- `icon-192x192.png`
- `icon-384x384.png`
- `icon-512x512.png`

### 3. Apple Touch Icons
- `apple-touch-icon.png` - 180x180 pixels

---

## 🎨 إنشاء الأيقونات

### طريقة سريعة:

1. **استخدم أداة أونلاين:**
   - https://realfavicongenerator.net/
   - https://favicon.io/

2. **قم برفع شعار عين عُمان**

3. **قم بتحميل جميع الأحجام**

4. **ضعهم في مجلد `public/`**

---

## 🔧 حل مؤقت

حتى يتم إنشاء الأيقونات، يمكن إنشاء placeholders بسيطة:

```bash
# في PowerShell (من مجلد المشروع)
cd public
echo '' > icon-144x144.png
echo '' > favicon-32x32.png
echo '' > favicon-16x16.png
echo '' > apple-touch-icon.png
```

---

## ملاحظة

الأيقونات ضرورية لـ:
- ✅ PWA functionality
- ✅ ظهور احترافي
- ✅ تجربة مستخدم أفضل
- ✅ SEO

---

*آخر تحديث: أكتوبر 2025*

