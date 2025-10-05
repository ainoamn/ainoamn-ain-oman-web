import type { NextApiRequest, NextApiResponse } from "next";

type AnyRec = Record<string, any>;

function cleanSingleItemArrays(obj: AnyRec): AnyRec {
  const out: AnyRec = { ...obj };
  for (const [k, v] of Object.entries(obj)) {
    out[k] = Array.isArray(v) && v.length === 1 ? v[0] : v;
  }
  return out;
}

async function loadStore() {
  try {
    const mod: AnyRec = await import("@/server/properties/store");
    return {
      getById: (mod.getById ?? (() => null)) as (id: string | number) => any,
      getAll: (mod.getAll ?? mod.list ?? (() => [])) as () => any[],
    };
  } catch {
    return { getById: (_: any) => null, getAll: () => [] };
  }
}

function resolvePropertyByAnyId(all: AnyRec[], rawId: string) {
  const target = String(rawId);
  const byExact = all.find((p) => String(p?.id) === target);
  if (byExact) return byExact;
  const byNumeric = all.find((p) => String(p?.id) === String(Number(target)));
  if (byNumeric) return byNumeric;
  const byRef = all.find((p) => String(p?.referenceNo) === target);
  if (byRef) return byRef;
  return null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const raw = req.query.id;
  const id = Array.isArray(raw) ? raw[0] : raw;

  if (!id) {
    res.status(400).json({ ok: false, error: "missing_id" });
    return;
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ ok: false, error: "method_not_allowed" });
    return;
  }

  const { getById, getAll } = await loadStore();

  let item = getById(String(id));
  if (!item) {
    const all = getAll();
    item = resolvePropertyByAnyId(all, String(id));
  }

  if (!item) {
    res.status(404).json({
      ok: false,
      error: "not_found",
      message: "العقار المطلوب غير موجود أو تم حذفه",
    });
    return;
  }

  const cleaned = cleanSingleItemArrays(item);
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.status(200).json({ ok: true, item: cleaned });
}
