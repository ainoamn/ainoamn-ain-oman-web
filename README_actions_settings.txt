# /admin/settings/actions — دليل الدمج السريع

## الملفات الجديدة
- src/types/actions-settings.ts
- src/lib/actionsSettingsClient.ts
- src/pages/api/admin/settings/actions.ts
- src/pages/admin/settings/actions.tsx

> انسخ المحتوى أعلاه إلى نفس المسارات داخل مشروعك.

## تشغيل
1) npm install
2) (اختياري) npx prisma generate && npx prisma migrate dev --name init
3) npm run dev

## نقاط مهمّة
- لا يوجد استعمال لـ fs على الواجهة؛ التخزين في `.data/actions-settings.json` عبر الـ API فقط.
- لو تعمل خلف بروكسي/دومين: أضف `NEXT_PUBLIC_BASE_URL=http://localhost:3000` إلى `.env.local`.

## ربط صفحة العقار
في `src/pages/property/[id].tsx`:

import { useEffect, useState } from "react";
import type { ActionsSettings } from "@/types/actions-settings";

export default function PropertyDetailsPage() {
  const [actionsSettings, setActionsSettings] = useState<ActionsSettings | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings/actions")
      .then((r) => r.json())
      .then((s) => setActionsSettings(s))
      .catch(() => setActionsSettings(null));
  }, []);

  // استخدم actionsSettings.builtin لإظهار/إخفاء الأزرار المدمجة،
  // و actionsSettings.custom للأزرار الإضافية بترتيبها.
}

## التالي المقترح
- حماية الصفحة بـ NextAuth/JWT (أدوار المدراء).
- ربط فعلي داخل صفحة العقار لإظهار/إخفاء الأزرار.
- خريطة أيقونات (lucide-react) إن رغبت.
