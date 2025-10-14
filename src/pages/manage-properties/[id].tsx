// src/pages/manage-properties/[id].tsx
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";


const LS_KEY = "ao_new_property_autosave_v3";

export default function EditPropertyBridge() {
  const router = useRouter();
  const { id } = router.query;
  const pid = Array.isArray(id) ? id[0] : id;

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!pid) return;
    const run = async () => {
      try {
        setLoading(true);
        const r = await fetch(`/api/properties/${encodeURIComponent(String(pid))}`);
        if (!r.ok) throw new Error("Not Found");
        const { item } = await r.json();

        const auto = {
          coverIndex: item.coverIndex ?? 0,
          title: { ar: item?.title?.ar || "", en: item?.title?.en || "" },
          desc: { ar: item?.description?.ar || "", en: item?.description?.en || "" },
          descLocked: { ar: false, en: false },
          category: item.category || "residential",
          purpose: item.purpose || "sale",
          rentalType: item.rentalType || "",
          investmentType: item.investmentType || "",
          province: item.province || "",
          state: item.state || "",
          village: item.village || "",
          promoted: !!item.promoted,
          beds: item.beds != null ? String(item.beds) : "استوديو",
          baths: item.baths != null ? String(item.baths) : "1",
          builtArea: item.area ? String(item.area) : "",
          floors: Array.isArray(item.floors) ? item.floors : [],
          age: item.age || "قيد الإنشاء",
          furnishing: item.furnishing || "unfurnished",
          mainFeatures: Array.isArray(item.amenities) ? item.amenities : [],
          extraFeatures: [],
          nearby: Array.isArray(item.attractions) ? item.attractions : [],
          mortgaged: item.mortgaged ? "yes" : "no",
          orientation: item.orientation || "شمالية",
          priceOMR: item.priceOMR != null ? String(item.priceOMR) : "",
          payments: [],
          altContactName: item?.altContact?.name || "",
          altContactPhone: item?.altContact?.phone || "",
          otpVerified: !!item?.altContact,
          points: Array.isArray(item.points) ? item.points : (item.lat && item.lng ? [{ lat: item.lat, lng: item.lng }] : []),
          units: Array.isArray(item.units) ? item.units.map((u:any)=>({
            name: u.name || "", floor: u.floor || "",
            beds: String(u.beds ?? ""), baths: String(u.baths ?? ""),
            area: String(u.area ?? ""), priceOMR: String(u.priceOMR ?? ""),
            images: [] as File[],
          })) : [],
          images: Array.isArray(item.images) ? item.images : [],
          __editId: String(item.id),
          referenceNo: item.referenceNo || undefined,
        };

        try { localStorage.setItem(LS_KEY, JSON.stringify(auto)); } catch {}
        router.replace(`/properties/new?edit=${encodeURIComponent(String(pid))}`);
      } catch (e:any) {
        setErr(e?.message || "Error");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [pid, router]);

  return (
    <>
      <Head><title>تحضير نموذج التحرير | Ain Oman</title></Head>
      <main className="min-h-screen bg-slate-50">
        <div className="max-w-3xl mx-auto p-6">
          {loading ? "جارِ التحضير لنموذج التحرير…" : err ? `خطأ: ${err}` : "جارٍ الفتح…"}
        </div>
      </main>
    </>
  );
}
