# Ain Oman — Pages Bundle

This ZIP contains fixed Next.js **Pages Router** screens + a corrected `src/lib/i18n.tsx`:

- partners, reviews, badges, tasks
- accounts, manage-properties, hoa, invest
- policies: terms, privacy, faq
- auctions: index (Google Maps dynamic import fix)

## Usage
1. Unzip into your project root, merging into the existing `src/` directory.
2. Ensure you have Header/Footer components available at `@/components/layout/{Header,Footer}`.
3. Replace your `src/lib/i18n.tsx` with the provided one (includes `getT()` and `getDir()`).
4. If you use Google Maps on Auctions page, set `.env.local`:
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_KEY
```
5. Install deps if needed:
```
npm i @react-google-maps/api
```
6. Run dev:
```
npm run dev
```

All pages use RTL/LTR via `useI18n().dir`. Each page has a single `default export` named `Page` and renders a named `<Content />` inside.


دمج الملفات:

1) انسخ الملف التالي فوق ملف مشروعك:
   src/pages/admin/tasks/[id].tsx

2) أضف ترجمات الصفحة (يمكنك دمجها مع نظام i18n لديك):
   locales/ar/tasks.json
   locales/en/tasks.json

   إذا كان مشروعك يستخدم ملفًا واحدًا مثل locales/ar.json، فادمج محتويات tasks.json داخله تحت المفتاح "tasks".

3) افتح الصفحة:
   http://localhost:3000/admin/tasks/TEST123
   - إذا لم تكن موجودة، سيتم إنشاؤها تلقائيًا ولن ترى 404 مرة أخرى.

خطوات تثبيت مسارات الواجهة الخلفية ومنع 404:

1) انسخ المجلدات التالية كاملة داخل مشروعك *بنفس المسارات*:
   - src/server/db.ts
   - src/pages/api/tasks/[id]/index.ts
   - src/pages/api/tasks/[id]/thread.ts
   - src/pages/api/tasks/[id]/notify.ts
   - src/pages/api/tasks/[id]/print.ts
   - src/pages/api/tasks/[id]/ics.ts
   - src/pages/api/tasks/[id]/link.ts
   - src/pages/api/tasks/ping.ts
   - src/pages/api/calendar/add.ts
   - src/pages/admin/tasks/[id].tsx
   - locales/ar/tasks.json
   - locales/en/tasks.json

2) افتح في المتصفح هذا الرابط للتأكد أن مسار الـ API موجود:
   http://localhost:3000/api/tasks/ping
   يجب أن ترى: {"ok": true, "ts": "..."}.
   إن ظهر 404 هنا، فهذا يعني أن مجلد /src/pages/api لم يتم وضعه في مكانه الصحيح.

3) افتح صفحة مهمة:
   http://localhost:3000/admin/tasks/TEST123
   - إذا لم تكن موجودة، سيتم إنشاؤها تلقائيًا.
   - لن ترى 404 حتى وإن كانت قاعدة البيانات فارغة.

ملاحظة: جميع الاستيرادات داخل ملفات API تستخدم مسارات نسبية، لذلك لا تحتاج لإعداد alias '@'.
# Appendix — Fix Log & Migration Guide (2025-09-29)

هذا الملحق يكمّل التعليمات السابقة ولا يستبدلها.

## A) ضبط بنية Next.js Pages
1) منع صفحات UI داخل `/pages/api`:
   - حوّل كل `.tsx` تحت `src/pages/api/**` إلى `.ts` واجعلها دوال API.
   - قالب موحّد:
     ```ts
     import type { NextApiRequest, NextApiResponse } from "next";
     export default function handler(req: NextApiRequest, res: NextApiResponse) {
       if (req.method === "GET") return res.status(200).json({ ok: true });
       return res.status(405).json({ ok: false, error: "Method Not Allowed" });
     }
     ```

2) إزالة المسارات المكررة:
   - إن وُجد ملف `pages/foo.tsx` ومعه `pages/foo/index.tsx` أبقِ `index.tsx` واحذف الآخر.
   - أمثلة عُولِجت: `/dashboard`, `/subscriptions`, `/admin/{ads,coupons,i18n,invoices,notifications,reservations,subscriptions,tasks}`.

3) فرض `export default` لكل صفحة `.tsx`:
   - إن لم تكن تعرف المكوّن الرئيسي مؤقتًا، أضف في آخر الملف:
     ```tsx
     export default function Page(){ return null; }
     ```
   - لاحقًا استبدله بالمكوّن الصحيح.

4) إصلاح استيرادات Next:
   ```tsx
   import Link from "next/link";
   import Image from "next/image";
