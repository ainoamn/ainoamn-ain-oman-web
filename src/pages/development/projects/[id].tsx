import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

type Unit = { id: string; type: string; area?: number; bedrooms?: number; bathrooms?: number; priceBase?: number; currencyBase?: string; status?: string; };
type Project = {
  id: string; title: string; city?: string; status?: string; deliveryDate?: string;
  description?: string; amenities?: string[]; milestones?: { id: string; name: string; dueAt?: string; progress?: number }[];
  units?: Unit[];
};

export default function ProjectDetailsPage() {
  const { query } = useRouter();
  const id = String(query.id || "");
  const [item, setItem] = useState<Project | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    const r = await fetch(`/api/development/projects/${id}`, { cache: "no-store" });
    const j = await r.json();
    setItem(j?.item || null);
    const ru = await fetch(`/api/development/projects/${id}/units`, { cache: "no-store" });
    const ju = await ru.json();
    setUnits(ju?.items || []);
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const priceFmt = (n?: number, c?: string) =>
    typeof n === "number" ? new Intl.NumberFormat(undefined, { style: "currency", currency: c || "OMR" }).format(n) : "—";

  const soldCount = useMemo(() => units.filter(u => u.status === "sold").length, [units]);

  return (
    <>
      <Head><title>{item?.title || "تفاصيل المشروع"}</title></Head>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">{item?.title || "…"}</h1>
        <Link href="/development" className="px-3 py-2 rounded-lg border hover:bg-gray-50">الرجوع للقائمة</Link>
      </div>

      {loading && <div>جارِ التحميل…</div>}
      {!loading && !item && <div className="text-red-600">المشروع غير موجود.</div>}

      {!!item && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="border rounded-xl p-4">
              <div className="text-sm text-gray-600">{item.city || "—"} • {item.status || "planned"}</div>
              {item.deliveryDate && <div className="text-sm text-gray-600">التسليم: {new Date(item.deliveryDate).toLocaleDateString()}</div>}
              {item.description && <p className="mt-3 leading-7">{item.description}</p>}
              {!!item.amenities?.length && (
                <div className="mt-4">
                  <div className="font-semibold mb-2">المزايا</div>
                  <div className="flex flex-wrap gap-2">
                    {item.amenities.map((a, i) => <span key={i} className="text-xs px-2 py-1 rounded-full border">{a}</span>)}
                  </div>
                </div>
              )}
            </div>

            {!!item.milestones?.length && (
              <div className="border rounded-xl p-4">
                <div className="font-semibold mb-2">الجدول الزمني</div>
                <div className="space-y-2">
                  {item.milestones.map(m => (
                    <div key={m.id} className="flex items-center justify-between">
                      <div>{m.name}</div>
                      <div className="text-sm text-gray-600">
                        {m.dueAt ? new Date(m.dueAt).toLocaleDateString() : "—"} • {typeof m.progress === "number" ? `${m.progress}%` : "—"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="border rounded-xl p-4">
              <div className="font-semibold mb-2">الوحدات المتاحة</div>
              <div className="space-y-2">
                {units.map(u => (
                  <div key={u.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{u.type}</div>
                      <span className="text-xs px-2 py-1 rounded-full border">{u.status || "available"}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {u.area ? `${u.area} م²` : "—"} • {u.bedrooms ?? "—"} غرف • {u.bathrooms ?? "—"} حمام
                    </div>
                    <div className="mt-1 text-sm">{priceFmt(u.priceBase, u.currencyBase)}</div>
                  </div>
                ))}
                {!units.length && <div className="text-gray-500">لا يوجد وحدات.</div>}
              </div>
            </div>
            <div className="border rounded-xl p-4 text-sm text-gray-700">
              <div>إجمالي الوحدات: {units.length} • المباعة: {soldCount}</div>
            </div>

            <Link href={`/admin/development/projects/${item.id}`} className="block text-center w-full py-2 rounded-xl border hover:bg-gray-50">
              تحرير/اعتماد (مسؤول)
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
صفحات الإدارة التي سلّمتها لك سابقًا تعمل كما هي؛ ولا تحتاج أي لفّ للهيدر/الفوتر (الغلاف من _app.tsx يتكفل بهما).

(ج) بيانات جاهزة — 5 مشاريع افتراضية كاملة
المسار: data/development.projects.json
انسخ الملف التالي (سيُقرأ تلقائيًا من API):

[
  {
    "id": "PRJ-ALFURSAN",
    "title": "مجمع الفرسان السكني",
    "city": "مسقط - الخوض",
    "status": "selling",
    "deliveryDate": "2026-03-31T00:00:00.000Z",
    "description": "مجمع سكني عائلي متكامل الخدمات قرب جامعة السلطان قابوس. حدائق وممشى ونادٍ صحي.",
    "amenities": ["مسبح", "نادي رياضي", "حديقة", "أمن 24/7", "مواقف مظللة"],
    "developer": { "id": "DEV-OM-01", "name": "شركة عين عُمان للتطوير", "phone": "+968-9000-0001", "email": "dev1@ainoman.example" },
    "media": { "cover": "/images/dev/alfursan/cover.jpg" },
    "paymentPlans": [
      { "id": "PP-ALF-1", "name": "خطة 30/70", "schedule": [{ "label": "حجز", "pct": 10 }, { "label": "عند توقيع العقد", "pct": 20 }, { "label": "عند التسليم", "pct": 70 }] }
    ],
    "milestones": [
      { "id": "MS-ALF-1", "name": "الأساسات", "dueAt": "2025-01-31T00:00:00.000Z", "progress": 100 },
      { "id": "MS-ALF-2", "name": "الهيكل",   "dueAt": "2025-08-31T00:00:00.000Z", "progress": 70 },
      { "id": "MS-ALF-3", "name": "التشطيبات","dueAt": "2026-02-28T00:00:00.000Z", "progress": 20 }
    ],
    "units": [
      { "id": "U-ALF-101", "type": "شقة 2 غرف", "area": 115, "bedrooms": 2, "bathrooms": 2, "priceBase": 52000, "currencyBase": "OMR", "status": "available" },
      { "id": "U-ALF-102", "type": "شقة 3 غرف", "area": 145, "bedrooms": 3, "bathrooms": 3, "priceBase": 68000, "currencyBase": "OMR", "status": "reserved" },
      { "id": "U-ALF-201", "type": "شقة 1 غرفة", "area": 80, "bedrooms": 1, "bathrooms": 1, "priceBase": 39000, "currencyBase": "OMR", "status": "sold" }
    ],
    "createdAt": "2025-07-01T08:00:00.000Z",
    "updatedAt": "2025-08-15T10:20:00.000Z"
  },
  {
    "id": "PRJ-ALBAHR",
    "title": "أبراج البحر الفاخرة",
    "city": "مسقط - القرم",
    "status": "selling",
    "deliveryDate": "2027-06-30T00:00:00.000Z",
    "description": "أبراج فندقية بإطلالة بحرية مباشرة، شقق مخدومة ومرافق راقية، مسافات مشي للشاطئ.",
    "amenities": ["إطلالة بحرية", "سبا", "مطاعم", "خدمة غرف", "مواقف ضيوف"],
    "developer": { "id": "DEV-OM-02", "name": "الخليج للتطوير العقاري", "phone": "+968-9000-0002", "email": "info@gulfdev.example" },
    "media": { "cover": "/images/dev/albahr/cover.jpg" },
    "paymentPlans": [
      { "id": "PP-SEA-1", "name": "خطة 10/20/70", "schedule": [{ "label": "حجز", "pct": 10 }, { "label": "بعد 6 أشهر", "pct": 20 }, { "label": "التسليم", "pct": 70 }] }
    ],
    "milestones": [
      { "id": "MS-SEA-1", "name": "تصاريح وبنية تحتية", "dueAt": "2025-12-31T00:00:00.000Z", "progress": 60 },
      { "id": "MS-SEA-2", "name": "الهيكل العلوي", "dueAt": "2026-11-30T00:00:00.000Z", "progress": 25 }
    ],
    "units": [
      { "id": "U-SEA-PH1", "type": "بنتهاوس 4 غرف", "area": 320, "bedrooms": 4, "bathrooms": 5, "priceBase": 320000, "currencyBase": "OMR", "status": "available" },
      { "id": "U-SEA-1203", "type": "شقة 2 غرف", "area": 130, "bedrooms": 2, "bathrooms": 2, "priceBase": 120000, "currencyBase": "OMR", "status": "available" }
    ],
    "createdAt": "2025-06-20T09:30:00.000Z",
    "updatedAt": "2025-08-12T13:00:00.000Z"
  },
  {
    "id": "PRJ-ALNAKHIL",
    "title": "مساكن النخيل",
    "city": "صحار",
    "status": "planned",
    "deliveryDate": "2026-12-31T00:00:00.000Z",
    "description": "حي سكني متوسط الكثافة مع فلل تاون هاوس وحدائق داخلية ومدارس قريبة.",
    "amenities": ["مدرسة قريبة", "مسجد", "حدائق", "مضامير جري"],
    "developer": { "id": "DEV-OM-03", "name": "العمران الحديثة", "phone": "+968-9000-0003", "email": "sales@omran-modern.example" },
    "media": { "cover": "/images/dev/alnakhil/cover.jpg" },
    "paymentPlans": [
      { "id": "PP-NKH-1", "name": "خطة 20/80", "schedule": [{ "label": "حجز", "pct": 20 }, { "label": "التسليم", "pct": 80 }] }
    ],
    "milestones": [
      { "id": "MS-NKH-1", "name": "تصميم تفصيلي", "dueAt": "2025-10-31T00:00:00.000Z", "progress": 40 }
    ],
    "units": [
      { "id": "U-NKH-T1", "type": "تاون هاوس 3 غرف", "area": 180, "bedrooms": 3, "bathrooms": 3, "priceBase": 78000, "currencyBase": "OMR", "status": "available" },
      { "id": "U-NKH-V1", "type": "فيلا مستقلة 4 غرف", "area": 280, "bedrooms": 4, "bathrooms": 5, "priceBase": 155000, "currencyBase": "OMR", "status": "available" }
    ],
    "createdAt": "2025-08-01T07:00:00.000Z",
    "updatedAt": "2025-08-16T07:45:00.000Z"
  },
  {
    "id": "PRJ-DOWNTOWN",
    "title": "وسط المدينة للأعمال",
    "city": "مسقط - روي",
    "status": "delivered",
    "deliveryDate": "2024-11-30T00:00:00.000Z",
    "description": "مكاتب حديثة مع مساحات عمل مشتركة وقاعات اجتماعات ومواقف متعددة الطوابق.",
    "amenities": ["قاعات اجتماعات", "مواقف متعددة", "خدمات تقنية", "مطاعم ومقاهي"],
    "developer": { "id": "DEV-OM-04", "name": "مسقط للتطوير التجاري", "phone": "+968-9000-0004", "email": "office@muscat-dev.example" },
    "media": { "cover": "/images/dev/downtown/cover.jpg" },
    "paymentPlans": [],
    "milestones": [
      { "id": "MS-DTN-1", "name": "التسليم النهائي", "dueAt": "2024-11-30T00:00:00.000Z", "progress": 100 }
    ],
    "units": [
      { "id": "U-DTN-5A", "type": "مكتب 85م²", "area": 85, "priceBase": 52000, "currencyBase": "OMR", "status": "sold" },
      { "id": "U-DTN-9C", "type": "مكتب 120م²", "area": 120, "priceBase": 78000, "currencyBase": "OMR", "status": "sold" }
    ],
    "createdAt": "2024-05-10T10:00:00.000Z",
    "updatedAt": "2025-01-05T12:00:00.000Z"
  },
  {
    "id": "PRJ-ALRAWDA",
    "title": "روضة التلال",
    "city": "نزوى",
    "status": "selling",
    "deliveryDate": "2026-09-30T00:00:00.000Z",
    "description": "فلل عائلية بإطلالات جبلية هادئة، تشطيبات فاخرة وخدمات مجتمعية متكاملة.",
    "amenities": ["مسبح عائلي", "مركز مجتمعي", "مسارات دراجات", "ألعاب أطفال"],
    "developer": { "id": "DEV-OM-05", "name": "التلال الذهبية", "phone": "+968-9000-0005", "email": "golden@hills.example" },
    "media": { "cover": "/images/dev/alrawda/cover.jpg" },
    "paymentPlans": [
      { "id": "PP-RWD-1", "name": "خطة 5/45/50", "schedule": [{ "label": "حجز", "pct": 5 }, { "label": "دفعات أثناء التنفيذ", "pct": 45 }, { "label": "التسليم", "pct": 50 }] }
    ],
    "milestones": [
      { "id": "MS-RWD-1", "name": "تمهيد الموقع", "dueAt": "2025-05-31T00:00:00.000Z", "progress": 100 },
      { "id": "MS-RWD-2", "name": "أعمال إنشائية", "dueAt": "2025-12-31T00:00:00.000Z", "progress": 50 }
    ],
    "units": [
      { "id": "U-RWD-V101", "type": "فيلا 4 غرف", "area": 300, "bedrooms": 4, "bathrooms": 5, "priceBase": 165000, "currencyBase": "OMR", "status": "available" },
      { "id": "U-RWD-V102", "type": "فيلا 5 غرف", "area": 360, "bedrooms": 5, "bathrooms": 6, "priceBase": 189000, "currencyBase": "OMR", "status": "available" }
    ],
    "createdAt": "2025-07-05T09:15:00.000Z",
    "updatedAt": "2025-08-17T09:10:00.000Z"
  }
]
تأكيد الربط والترابط (checklist سريع)
الهيدر/الفوتر يظهران الآن تلقائيًا لكل الصفحات عبر _app.tsx (مطابق لتعليمات 12.txt).  

صفحات التطوير العقاري لا تحتوي أي هيدر/فوتر أو غلاف مضاعف—محتوى فقط داخل <main>.

الـAPI تقرأ/تكتب من data/development.projects.json كما هو نهج المشروع.

عند فتح /development سترى الأقسام حسب الحالة (selling / planned / delivered) ومشاريعك الافتراضية الخمسة؛ وبالدخول لأي مشروع سترى الوحدات، المراحل، وخطة الدفع.

إذا أردت، أضيف الآن إدخال/تحرير الوحدات وخطط الدفع من صفحة الإدارة، أو ننتقل مباشرة لوحدة جمعية الملاك بنفس الأسلوب.

أنت قلت:
_app.tsx
TypeScript
هذا هو الكود السابق 
عند تعديله بالكود الجديد تظهر لي هذه الملاحظه 


1/1

Next.js 15.4.6
Webpack
Build Error

Module not found: Can't resolve '././styles/globals.css'

./src/pages/_app.tsx (8:1)

Module not found: Can't resolve '././styles/globals.css'
   6 |
   7 | // NOTE: أبقِ هذا كما في مشروعك
>  8 | import "././styles/globals.css";
     | ^
   9 |
  10 | // i18n لديك مسبقًا (إن لم تكن موجودة، اترك الاستيراد كما هو ولن يتعطل)
  11 | import { I18nProvider, useI18n } from "@/lib/i18n";

https://nextjs.org/docs/messages/module-not-found
1
2
قال ChatGPT:

قام بالتفكير لمدة 31s
عبد الحميد .
وصلتني الملاحظة، والحل عندي على خطوتين بسيطات:

1) إصلاح خطأ الاستيراد في _app.tsx
الخطأ سببه مسار خاطئ لملف الأنماط. بما أن _app.tsx موجود تحت src/pages/_app.tsx وملف الأنماط في src/styles/globals.css فالمسار الصحيح هو:

// src/pages/_app.tsx  ← عدّل فقط هذا السطر
import "../styles/globals.css";
أنت أرفقت نسخة من _app.tsx تستورد بـ"../../styles/globals.css"؛ غيّرها إلى "../styles/globals.css" كما بالأعلى. 

ملاحظة: أي مسار مثل ././styles/... أو ../../styles/... سيكسر البناء لأن styles شقيق لمجلد pages داخل src وليس أعلى منه.

2) إظهار الهيدر والفوتر تلقائيًا على الصفحات الجديدة
نسخة _app.tsx الحالية لديك لا تُدرج الهيدر/الفوتر تلقائيًا، بل تعتمد أسلوب getLayout داخل كل صفحة (كما هو واضح من التعليقات بملفك). لذلك يجب أن نضيف getLayout للصفحات الجديدة (التطوير العقاري) لتلتف بـLayout الموجود لديك.

أضف هذا الجزء في أسفل كل صفحة جديدة:

أ) src/pages/development/index.tsx
// Layout handled by _app.tsx

// ... (الكود الحالي للصفحة كما هو)

DevelopmentListPage.getLayout = function getLayout(page: React.ReactElement) {
  return <>{page}</>;
};
ب) src/pages/development/projects/[id].tsx
// Layout handled by _app.tsx

// ... (الكود الحالي للصفحة كما هو)

ProjectDetailsPage.getLayout = function getLayout(page: React.ReactElement) {
  return <>{page}</>;
};
ج) صفحات الإدارة كذلك (حتى تظهر داخل نفس الإطار):