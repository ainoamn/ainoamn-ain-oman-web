# ربط ain-oman-web بهوية BHD الحية

> **تاريخ:** 29 أكتوبر 2026  
> **المستودع:** https://github.com/ainoamn/ainoamn-ain-oman-web  
> **الهوية:** https://id.bhd-om.com — **الأيقونات:** `/admin#apps` — **الربط:** `/admin#connect`  
> **عزل التبديل:** [`BHD-ACCOUNT-ISOLATION.md`](BHD-ACCOUNT-ISOLATION.md) — مرجع §93 في [BHD-HR](https://github.com/ainoamn/BHD-HR) (`docs/BHD-HR-DEPLOYMENT-LOG.md`)

## ما أُضيف (سلك أدنى — Pages Router)

| البند | الموقع |
|---|---|
| سكربت الهوية | `src/pages/_app.tsx` → `https://id.bhd-om.com/bhd-identity.js` |
| CSP | `next.config.js` → `id.bhd-om.com` في script/connect/frame |
| كتالوج حي | `src/lib/bhd/catalog.ts` + شريط `src/components/bhd/BhdProgramsStrip.tsx` (فوق الفوتر) |
| OAuth / عزل | `src/pages/api/auth/bhd/{start,callback,logout,rebind}.ts` |
| مساعد OIDC | `src/lib/bhd/identity.ts` |

## متغيرات البيئة (لا تُرفع أسراراً)

سجّل redirect في لوحة الهوية ثم عيّن محلياً / على Vercel:

```env
BHD_IDENTITY_ISSUER=https://id.bhd-om.com
BHD_OAUTH_CLIENT_ID=          # من /admin#connect
BHD_OAUTH_CLIENT_SECRET=      # إن طلبت الهوية سراً للعميل
# BHD_OAUTH_REDIRECT_URI=     # اختياري؛ الافتراضي {origin}/api/auth/bhd/callback
```

بدون `BHD_OAUTH_CLIENT_ID` يعيد `/api/auth/bhd/start` **503** مع قائمة المتغيرات (لا أسرار وهمية).

## TODO بعد السلك

1. ربط `profile.sub` من callback/rebind بـ `AuthContext` / مستخدم Prisma المحلي (اليوم: كوكي stub `ain_bhd_sub` فقط).
2. مدة جلسة المنتج من `/api/bhd/runtime` عند دمج SSO الكامل.
3. إن أُضيفت أيقونات في الرأس لاحقاً — استخدم نفس `fetchIdentityCatalog()` بدل قائمة ثابتة.

## تحقق

1. `/admin#apps` → بلاطات تظهر في شريط «برامج BHD» خلال ثوانٍ.
2. حسابان → تبديل من نافذة الهوية → `POST /api/auth/bhd/rebind` يعيد التوجيه بكوكي `ain_bhd_sub` للحساب الجديد.
3. `GET /api/auth/bhd/logout` يمسح stub ويواصل end-session على الهوية عند التكوين.

## وثائق مرافقة

- `BHD-CURSOR-PRODUCT-WIRE.md` — أمر الوكيل  
- `BHD-IDENTITY-RUNTIME.md` — runtime + سكربت  
- `BHD-PRODUCTS-WIRE-STATUS.md` — حالة كل المواقع  

## تحديث §95 (29 أكتوبر 2026)

إصلاح جذر العزل على الهوية: `POST /api/auth/switch` يكتب `bhd_id` دائماً. هذا المنتج يعتمد `rebind` محلياً بعد التبديل. التفاصيل: `BHD-ACCOUNT-ISOLATION.md`.
