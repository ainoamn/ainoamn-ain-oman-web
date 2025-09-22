// src/components/ai/AiPanel.tsx
import React, { useState } from "react";
function AiPanel({ taskId, onApply }: { taskId: string; onApply?: (cmd: string) => void }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{summary?: string; nextSteps?: string[]; hints?: string[]}>({});

  const run = async () => {
    try {
      setLoading(true);
      const r = await fetch("/api/ai/tasks/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId })
      });
      const j = await r.json();
      setData(j || {});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">المساعد الذكي</h3>
        <button onClick={run} disabled={loading} className="px-3 py-1 rounded-lg border disabled:opacity-60">
          {loading ? "جارٍ التحليل…" : "تحليل بالذكاء الاصطناعي"}
        </button>
      </div>
      {data?.summary && (
        <div className="text-sm bg-gray-50 border rounded-lg p-3">{data.summary}</div>
      )}
      {data?.nextSteps?.length ? (
        <div className="text-sm">
          <div className="text-gray-600 mb-1">الخطوات المقترحة:</div>
          <ul className="list-disc ms-5 space-y-1">
            {data.nextSteps.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      ) : null}
      {data?.hints?.length ? (
        <div className="text-xs text-gray-600">
          {data.hints.map((h, i) => <div key={i}>• {h}</div>)}
        </div>
      ) : null}
    </div>
  );
}
