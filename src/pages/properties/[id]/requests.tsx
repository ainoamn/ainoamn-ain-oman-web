

// src/pages/properties/[id]/requests.tsx
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
// Header and Footer are now handled by MainLayout in _app.tsx
import { useI18n } from "@/lib/i18n";


export default function PropertyRequestsPage() {
const { query } = useRouter();
const id = (query.id as string) || "";
const { t, dir } = useI18n();


return (
<div className="min-h-screen flex flex-col bg-slate-50" dir={dir}>
<Head>
<title>{t("property.requests.title","طلبات العقار")} | Ain Oman</title>
</Head>
<main className="flex-1">
<div className="mx-auto max-w-7xl px-4 py-8">
<nav className="text-sm text-slate-500 mb-6">
<Link className="hover:underline" href="/properties">{t("nav.properties","العقارات")}</Link>
<span className="mx-2">/</span>
<Link className="hover:underline" href={`/properties/${id}`}>{t("nav.property","العقار")}</Link>
<span className="mx-2">/</span>
<span className="text-slate-700">{t("property.requests","الطلبات")}</span>
</nav>


<h1 className="text-2xl font-semibold mb-6">{t("property.requests.heading","طلبات واستفسارات")} #{id}</h1>


<div className="bg-white rounded-2xl shadow p-6 overflow-auto">
<table className="min-w-full text-sm">
<thead className="bg-slate-100">
<tr>
<th className="px-3 py-2 text-start">#</th>
<th className="px-3 py-2 text-start">{t("requests.name","الاسم")}</th>
<th className="px-3 py-2 text-start">{t("requests.phone","الهاتف")}</th>
<th className="px-3 py-2 text-start">{t("requests.type","النوع")}</th>
<th className="px-3 py-2 text-start">{t("requests.date","التاريخ")}</th>
</tr>
</thead>
<tbody>
<tr>
<td className="px-3 py-2">1</td>
<td className="px-3 py-2">—</td>
<td className="px-3 py-2">—</td>
<td className="px-3 py-2">—</td>
<td className="px-3 py-2">—</td>
</tr>
</tbody>
</table>
</div>
</div>
</main>
</div>
);
}