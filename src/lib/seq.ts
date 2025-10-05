const BASE = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

function pad(n: number, w = 6) { return String(n).padStart(w, "0"); }

export async function nextSerial(entity: "TASK"): Promise<string> {
  try {
    const r = await fetch(`${BASE}/api/seq/next`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entity }),
    });
    if (r.ok) {
      const j = await r.json();
      if (j?.serial) return j.serial;
    }
  } catch {}
  // Fallback محلي
  if (typeof window !== "undefined") {
    const k = "__ao_seq_task";
    const v = Number(localStorage.getItem(k) || "0") + 1;
    localStorage.setItem(k, String(v));
    return `AO-T-${pad(v)}`;
  } else {
    // خادم: عدّاد بسيط بالملفات
    const key = "__ao_seq_task_srv";
    (global as any)[key] = ((global as any)[key] || 0) + 1;
    return `AO-T-${pad((global as any)[key])}`;
  }
}
