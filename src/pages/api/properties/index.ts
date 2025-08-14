// src/pages/api/properties/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { readJson, writeJson } from "@/server/fsdb";

const FILE = "properties";

type AnyObj = Record<string, any>;
type StoredProp = AnyObj;

async function getDemoList(): Promise<StoredProp[]> {
  // نقرأ من demoData فقط (إن وُجد) لتفادي أخطاء البناء
  try {
    const mod: AnyObj = await import("@/lib/demoData").catch(() => ({} as AnyObj));
    const arr = mod?.PROPERTIES || mod?.properties || mod?.default || [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

// توحيد الحقول: لو فيه serial ولم يوجد referenceNo ننسخه
function normalizeRef(items: StoredProp[]): StoredProp[] {
  return (items || []).map((it) => {
    const referenceNo = it?.referenceNo ?? it?.serial ?? undefined;
    return referenceNo ? { ...it, referenceNo } : it;
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      const stored = await readJson<StoredProp[]>(FILE, []);
      const demo = await getDemoList();

      // نمنع التكرار حسب id
      const merged = [
        ...stored,
        ...demo.filter((d) => !stored.some((s) => String(s?.id) === String(d?.id))),
      ];

      // ✅ توحيد رقم السيريال
      const items = normalizeRef(merged);
      return res.status(200).json({ items });
    }

    if (req.method === "POST") {
      const body = (req.body ?? {}) as AnyObj;
      if (!body?.title) {
        return res.status(400).json({ ok: false, error: "العنوان مطلوب." });
      }

      const nowIso = new Date().toISOString();
      const newId = String(body?.id ?? Date.now());
      let referenceNo: string | undefined = body?.referenceNo ?? body?.serial; // قبول أيهما

      // إن لم يصل رقم مرجعي من الواجهة، نحاول توليده (اختياري)
      if (!referenceNo) {
        try {
          const base = process.env.NEXT_PUBLIC_BASE_URL || `http://${req.headers.host}`;
          const r = await fetch(`${base}/api/seq/next`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ entity: "PROPERTY" }),
          });
          if (r.ok) {
            const js = await r.json();
            referenceNo = js?.referenceNo ?? js?.ref ?? js?.seq ?? undefined;
          }
        } catch {
          // نتجاوز بصمت
        }
      }

      const item: StoredProp = {
        ...body,
        id: newId,
        referenceNo,
        createdAt: body?.createdAt ?? nowIso,
        promotedAt: body?.promoted ? body?.promotedAt ?? nowIso : body?.promotedAt ?? null,
      };

      const list = await readJson<StoredProp[]>(FILE, []);
      const nextList = [item, ...list];
      await writeJson(FILE, nextList);

      return res.status(200).json({ ok: true, item });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  } catch (e: any) {
    console.error("API /api/properties error:", e);
    return res.status(500).json({ ok: false, error: "Internal Server Error" });
  }
}
