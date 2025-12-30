# دليل البدء السريع - نظام اللغات والعملات ⚡

## ✅ تم إنجازه

### اللغات المدعومة (7 لغات)
- 🇴🇲 العربية (ar) - RTL
- 🇬🇧 الإنجليزية (en) - LTR  
- 🇫🇷 الفرنسية (fr) - LTR
- 🇮🇳 الهندية (hi) - LTR
- 🇵🇰 الأوردو (ur) - RTL
- 🇮🇷 الفارسية (fa) - RTL
- 🇨🇳 الصينية (zh) - LTR

### العملات المدعومة (7 عملات)
- 🇴🇲 الريال العماني (OMR) - الأساسية
- 🇦🇪 الدرهم الإماراتي (AED)
- 🇸🇦 الريال السعودي (SAR)
- 🇧🇭 الدينار البحريني (BHD)
- 🇰🇼 الدينار الكويتي (KWD)
- 🇶🇦 الريال القطري (QAR)
- 🇺🇸 الدولار الأمريكي (USD)

### التاريخ والوقت
- ✅ التاريخ: إنجليزي دائماً
- ✅ الوقت: توقيت الدولة تلقائياً

## 🚀 الاستخدام السريع

### 1. في المكونات React:

```tsx
import { useI18n } from '@/lib/i18n-enhanced';
import { useCurrency } from '@/context/CurrencyContext-enhanced';
import { formatDate, formatTime } from '@/lib/date-time';

export default function MyComponent() {
  const { t, lang, setLang } = useI18n();
  const { format, currency, setCurrency } = useCurrency();
  
  return (
    <div>
      <h1>{t('common.loading', 'جاري التحميل...')}</h1>
      <p>السعر: {format(1000)}</p>
      <p>التاريخ: {formatDate(new Date())}</p>
      <p>الوقت: {formatTime(new Date())}</p>
    </div>
  );
}
```

### 2. مبدل اللغة:

```tsx
import EnhancedLanguageSwitcher from '@/components/common/LanguageSwitcher-enhanced';

<EnhancedLanguageSwitcher />
```

### 3. مبدل العملة:

```tsx
import EnhancedCurrencySwitcher from '@/components/common/CurrencySwitcher-enhanced';

<EnhancedCurrencySwitcher />
```

### 4. الترجمة بالذكاء الاصطناعي:

```tsx
const { translate } = useI18n();
const translated = await translate('Hello', 'ar');
```

## 📁 الملفات المهمة

- `src/lib/i18n-enhanced.tsx` - نظام i18n
- `src/context/CurrencyContext-enhanced.tsx` - نظام العملات
- `src/lib/date-time.ts` - التاريخ والوقت
- `src/pages/api/ai/translate.ts` - API الترجمة
- `locales/{lang}/common.json` - ملفات الترجمة

## ⚙️ الإعداد

تم التكامل تلقائياً في `_app.tsx`. لا حاجة لإعداد إضافي!

## 🔧 متغيرات البيئة

```env
GOOGLE_AI_API_KEY=your_api_key_here  # للترجمة بالذكاء الاصطناعي (اختياري)
```

---

**جاهز للاستخدام!** 🎉






