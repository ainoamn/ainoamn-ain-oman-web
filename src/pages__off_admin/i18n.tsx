// src/pages/admin/i18n.tsx
import React, { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { DICTS as CORE_DICTS, SUPPORTED_LANGS as CORE_LANGS, type Lang as CoreLang } from "@/lib/i18n";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

type Lang = string;
type Dict = Record<string, string>;
type Dicts = Record<Lang, Dict>;
type Meta = Record<string, { hint?: string; icon?: string; route?: string; visible?: boolean }>;
type Data = { langs: Lang[]; keys: string[]; dicts: Dicts; meta?: Meta; };

const inpt: React.CSSProperties = { width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff" };
const th:   React.CSSProperties = { position: "sticky", top: 0, background: "#f8fafc", fontWeight: 600, padding: 10, borderBottom: "1px solid #e5e7eb", zIndex: 1 };
const td:   React.CSSProperties = { padding: 8, verticalAlign: "top", borderBottom: "1px solid #f1f5f9", background: "#fff" };
const btn:  React.CSSProperties = { padding: "8px 12px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff" };

/* نص آمن */
function str(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return String(v);
  try { return JSON.stringify(v); } catch { return ""; }
}

/* دمج المفاتيح */
function mergeKeys(dicts: Dicts): string[] {
  const s = new Set<string>();
  for (const d of Object.values(dicts)) Object.keys(d || {}).forEach(k => s.add(k));
  return Array.from(s).sort();
}

/* JSON tolerant: يزيل BOM + التعليقات + الفواصل الزائدة */
function parseJsonLoose(txt: string) {
  if (txt.charCodeAt(0) === 0xfeff) txt = txt.slice(1);
  txt = txt.replace(/^\s*\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
  txt = txt.replace(/,(\s*[}\]])/g, "$1");
  return JSON.parse(txt);
}

/* تسطيح كائنات اللغة إلى مفاتيح dot */
function flatten(obj: any, p = ""): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj || {})) {
    const nk = p ? `${p}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      Object.assign(out, flatten(v, nk));
    } else {
      out[nk] = str(v);
    }
  }
  return out;
}

/* قراءة من API أو من الثابت */
async function fetchAll(): Promise<Data | null> {
  try {
    const r = await fetch("/api/i18n/all").then(r => r.ok ? r.json() : null).catch(() => null);
    if (r && r.dicts && r.langs) {
      const dicts: Dicts = {};
      for (const [l, d] of Object.entries(r.dicts as Dicts)) {
        dicts[l] = {};
        for (const [k, v] of Object.entries(d || {})) dicts[l][k] = str(v);
      }
      return { langs: r.langs as Lang[], keys: mergeKeys(dicts), dicts, meta: r.meta || {} };
    }
  } catch {}
  return null;
}

/* بناء احتياطي */
function buildFromStatic(): Data {
  const dicts: Dicts = {};
  const src = (CORE_DICTS ?? {}) as Record<string, Dict>;
  for (const l of CORE_LANGS as CoreLang[]) dicts[l] = { ...(src[l] ?? {}) };
  const keys = mergeKeys(dicts);
  return { langs: [...CORE_LANGS], keys, dicts, meta: {} };
}

export default function AdminI18nPage() {
  const [autoMT, setAutoMT] = useState(true);
  const [mtProvider, setMtProvider] = useState<"deepl" | "google" | "libre">("google");
  const [filter, setFilter] = useState("");
  const [data, setData] = useState<Data | null>(null);
  const [newKey, setNewKey] = useState("");
  const [addingLang, setAddingLang] = useState("");

  useEffect(() => { (async () => setData((await fetchAll()) ?? buildFromStatic()))(); }, []);

  const filteredKeys = useMemo(() => {
    if (!data) return [];
    if (!filter.trim()) return data.keys;
    const f = filter.toLowerCase();
    return data.keys.filter(k => k.toLowerCase().includes(f) || str(data.meta?.[k]?.hint).toLowerCase().includes(f));
  }, [data, filter]);

  if (!data) {
    return (
      <main className="min-h-screen flex flex-col bg-gray-50">
        <Head><title>i18n Admin | Ain Oman</title></Head>
        <Header />
        <div className="flex-1 flex items-center justify-center text-gray-600">...تحميل</div>
        <Footer />
      </main>
    );
  }

  async function autoTranslateIfNeeded(srcLang: string, key: string, value: string) {
    if (!autoMT || !value.trim()) return;
    const targets = data.langs.filter(l => l !== srcLang && (data.dicts[l]?.[key] ?? "") === "");
    if (!targets.length) return;
    const r = await fetch("/api/i18n/mt", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: value, source: srcLang, targets, provider: mtProvider })
    }).then(r => r.json()).catch(() => null as any);
    if (r?.translations) {
      setData(d0 => {
        const copy = structuredClone(d0!);
        for (const [lang, translated] of Object.entries(r.translations as Record<string, unknown>)) {
          if (!copy.dicts[lang]) copy.dicts[lang] = {};
          copy.dicts[lang][key] = str(translated);
        }
        return copy;
      });
    }
  }

  const updateCell = (l: Lang, k: string, v: string) => {
    setData(d0 => {
      if (!d0) return d0;
      const copy = structuredClone(d0);
      if (!copy.dicts[l]) copy.dicts[l] = {};
      const wasEmpty = (copy.dicts[l][k] ?? "") === "";
      copy.dicts[l][k] = v;
      if (!copy.keys.includes(k)) copy.keys.push(k);
      if (wasEmpty) setTimeout(() => autoTranslateIfNeeded(l, k, v), 0);
      return copy;
    });
  };

  const addKey = () => {
    const k = newKey.trim();
    if (!k) return;
    setData(d0 => {
      if (!d0 || d0.keys.includes(k)) return d0;
      const copy = structuredClone(d0);
      copy.keys.push(k);
      for (const l of copy.langs) {
        if (!copy.dicts[l]) copy.dicts[l] = {};
        copy.dicts[l][k] = "";
      }
      return copy;
    });
    setNewKey("");
  };

  const removeKey = (k: string) => {
    setData(d0 => {
      if (!d0) return d0;
      const copy = structuredClone(d0);
      copy.keys = copy.keys.filter(x => x !== k);
      for (const l of copy.langs) if (copy.dicts[l]) delete copy.dicts[l][k];
      if (copy.meta && copy.meta[k]) delete copy.meta[k];
      return copy;
    });
  };

  const addLang = () => {
    const l = addingLang.trim().toLowerCase();
    if (!l || data.langs.includes(l)) return;
    setData(d0 => {
      if (!d0) return d0;
      const copy = structuredClone(d0);
      copy.langs.push(l);
      copy.dicts[l] = {};
      for (const k of copy.keys) copy.dicts[l][k] = "";
      return copy;
    });
    setAddingLang("");
  };

  const saveAll = async () => {
    const payload: Data = structuredClone(data);
    for (const [l, d] of Object.entries(payload.dicts)) {
      for (const [k, v] of Object.entries(d)) (payload.dicts[l] as any)[k] = str(v);
    }
    try {
      const r = await fetch("/api/i18n/save", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        alert("فشل الحفظ" + (j?.error ? `: ${j.error}` : ""));
      } else {
        alert("تم الحفظ");
      }
    } catch (e: any) {
      alert("فشل الحفظ: " + (e?.message || "network_error"));
    }
  };

  const exportAs = async (format: "json" | "csv" | "xlsx") => {
    const rows: string[][] = [
      ["Key", ...data.langs],
      ...data.keys.map(k => [k, ...data.langs.map(l => str(data.dicts[l]?.[k] ?? ""))])
    ];
    if (format === "json") {
      const blob = new Blob([JSON.stringify({ langs: data.langs, dicts: data.dicts }, null, 2)], { type: "application/json" });
      return downloadBlob(blob, "i18n.json");
    }
    if (format === "csv") {
      const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
      return downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), "i18n.csv");
    }
    const mod = await import("xlsx").catch(() => null as any);
    if (!mod) return alert("الرجاء تثبيت الحزمة xlsx");
    const XLSX: any = (mod as any).default ?? mod;
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, "Translations");
    const out = XLSX.write(wb, { type: "array", bookType: "xlsx" });
    downloadBlob(new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), "i18n.xlsx");
  };

  /* تنزيل قالب الاستيراد */
  const downloadTemplate = async () => {
    const fmt = (window.prompt("صيغة القالب؟ اكتب: csv أو xlsx أو json", "csv") || "").toLowerCase() as "csv"|"xlsx"|"json";
    if (!["csv","xlsx","json"].includes(fmt)) return;
    const includeKeys = (window.prompt("هل تريد تضمين المفاتيح الحالية؟ اكتب yes أو no", "yes") || "").toLowerCase().startsWith("y");

    const header = ["Key", ...data.langs];
    const baseRows: string[][] = [header];
    const rows = includeKeys ? [
      header,
      ...data.keys.map(k => [k, ...data.langs.map(() => "")])
    ] : baseRows;

    if (fmt === "json") {
      const dicts: Dicts = {};
      for (const l of data.langs) dicts[l] = {};
      if (includeKeys) for (const k of data.keys) for (const l of data.langs) dicts[l][k] = "";
      const json = JSON.stringify({ langs: data.langs, dicts }, null, 2);
      return downloadBlob(new Blob([json], { type: "application/json" }), "i18n-template.json");
    }
    if (fmt === "csv") {
      const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
      return downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), "i18n-template.csv");
    }
    const mod = await import("xlsx").catch(() => null as any);
    if (!mod) return alert("الرجاء تثبيت الحزمة xlsx");
    const XLSX: any = (mod as any).default ?? mod;
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    const out = XLSX.write(wb, { type: "array", bookType: "xlsx" });
    downloadBlob(new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), "i18n-template.xlsx");
  };

  const onImportFile = async (f: File) => {
    const name = f.name.toLowerCase();
    try {
      if (name.endsWith(".json")) {
        const txt = await f.text();
        const parsed = parseJsonLoose(txt);
        const langs = Array.from(new Set<string>(parsed.langs || Object.keys(parsed.dicts || {})));
        const dicts: Dicts = {};
        for (const l of langs) {
          const raw = (parsed.dicts || {})[l] || {};
          dicts[l] = flatten(raw); // دعم JSON متداخل
        }
        const keys = mergeKeys(dicts);
        setData({ langs, keys, dicts, meta: data.meta });
        return;
      }
      if (name.endsWith(".csv")) {
        const txt = await f.text();
        const rows = txt
          .replace(/^\uFEFF/, "")
          .split(/\r?\n/)
          .filter(line => line.trim().length > 0)
          .map(line => line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(c => c.replace(/^"|"$/g, "").replace(/""/g, `"`)));
        return applyRows(rows);
      }
      const buf = await f.arrayBuffer();
      const mod = await import("xlsx").catch(() => null as any);
      if (!mod) return alert("الرجاء تثبيت الحزمة xlsx");
      const XLSX: any = (mod as any).default ?? mod;
      const wb = XLSX.read(buf, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
      applyRows(rows);
    } catch (e: any) {
      alert("فشل الاستيراد: " + (e?.message || "invalid_file"));
    }
  };

  function applyRows(rows: any[][]) {
    const header = (rows[0] || []).map(str);
    const langs = header.slice(1).filter(Boolean);
    const dicts: Dicts = {};
    for (const l of langs) dicts[l] = {};
    for (const r of rows.slice(1)) {
      const key = str(r[0]);
      if (!key) continue;
      r.slice(1).forEach((val, idx) => {
        const l = langs[idx];
        if (!l) return;
        if (!dicts[l]) dicts[l] = {};
        dicts[l][key] = str(val);
      });
    }
    const keys = mergeKeys(dicts);
    setData({ langs, keys, dicts, meta: data.meta });
  }

  function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <Head><title>i18n Admin | Ain Oman</title></Head>
      <Header />

      <div className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-6">
          {/* أدوات */}
          <div className="flex flex-wrap items-center gap-8 mb-6">
            <div className="flex items-center gap-2">
              <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input type="checkbox" checked={autoMT} onChange={e => setAutoMT(e.target.checked)} />
                <span>ترجمة تلقائية</span>
              </label>
              <select value={mtProvider} onChange={e => setMtProvider(e.target.value as any)} style={inpt}>
                <option value="deepl">DeepL</option>
                <option value="google">Google</option>
                <option value="libre">LibreTranslate</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input placeholder="إضافة مفتاح جديد" value={newKey} onChange={e => setNewKey(e.target.value)} style={inpt} />
              <button style={btn} onClick={addKey}>إضافة مفتاح</button>
            </div>

            <div className="flex items-center gap-2">
              <input placeholder="إضافة لغة (ex: en, fr, hi)" value={addingLang} onChange={e => setAddingLang(e.target.value)} style={inpt} />
              <button style={btn} onClick={addLang}>إضافة لغة</button>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <input placeholder="بحث في المفاتيح أو التلميحات" value={filter} onChange={e => setFilter(e.target.value)} style={inpt} />
              <button style={btn} onClick={downloadTemplate}>تنزيل القالب</button>
              <button style={btn} onClick={() => exportAs("xlsx")}>تصدير XLSX</button>
              <button style={btn} onClick={() => exportAs("csv")}>تصدير CSV</button>
              <button style={btn} onClick={() => exportAs("json")}>تصدير JSON</button>
              <label style={{ ...btn, cursor: "pointer" }}>
                استيراد
                <input type="file" accept=".xlsx,.csv,.json" style={{ display: "none" }}
                       onChange={e => e.target.files && e.target.files[0] && onImportFile(e.target.files[0])} />
              </label>
              <button style={{ ...btn, background: "#0ea5a3", color: "#fff", borderColor: "#0ea5a3" }} onClick={saveAll}>حفظ</button>
            </div>
          </div>

          {/* جدول */}
          <div style={{ overflow: "auto", border: "1px solid #e5e7eb", borderRadius: 12 }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, minWidth: 900 }}>
              <thead>
                <tr>
                  <th style={{ ...th, left: 0, position: "sticky", zIndex: 2, minWidth: 260, textAlign: "start" }}>Key</th>
                  <th style={th}>Hint</th>
                  {data.langs.map(l => (<th key={l} style={th}>{l.toUpperCase()}</th>))}
                </tr>
              </thead>
              <tbody>
                {filteredKeys.map(k => {
                  const hint = str(data.meta?.[k]?.hint);
                  return (
                    <tr key={k}>
                      <td style={{ ...td, position: "sticky", left: 0, zIndex: 1, background: "#fff" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <code title={k} style={{ direction: "ltr" }}>{k}</code>
                          <button title="حذف" onClick={() => removeKey(k)} style={{ ...btn, padding: "4px 8px" }}>حذف</button>
                        </div>
                      </td>
                      <td style={td}>
                        <input
                          style={inpt}
                          value={hint}
                          onChange={e => {
                            const v = e.target.value;
                            setData(d0 => {
                              const copy = structuredClone(d0!);
                              if (!copy.meta) copy.meta = {};
                              if (!copy.meta[k]) copy.meta[k] = {};
                              copy.meta[k].hint = v;
                              return copy;
                            });
                          }}
                          placeholder="تلميح الاستخدام"
                        />
                      </td>
                      {data.langs.map(l => {
                        const v = str(data.dicts[l]?.[k] ?? "");
                        const missing = !v.trim();
                        return (
                          <td key={l} style={td}>
                            <input
                              style={{ ...inpt, borderColor: missing ? "#ef4444" : "#e5e7eb", background: missing ? "#fff1f2" : "#fff" }}
                              value={v}
                              onChange={e => updateCell(l, k, e.target.value)}
                              placeholder={missing ? "غير مترجم" : ""}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="text-sm text-gray-500 mt-3">صيغة القالب: CSV/XLSX رأسه: <code>Key,{data.langs.join(",")}</code>. JSON: <code>{`{ "langs": [...], "dicts": { "<lang>": { "<key>": "<value>" } } }`}</code>.</div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
