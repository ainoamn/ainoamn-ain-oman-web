import React, { useMemo, useState } from "react";

export type Column<T> = {
  key: keyof T;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
};

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchable = true,
}: {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
}) {
  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const filtered = useMemo(() => {
    if (!q) return data;
    const lq = q.toLowerCase();
    return data.filter((row) =>
      Object.values(row).some((v) => String(v).toLowerCase().includes(lq))
    );
  }, [q, data]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const arr = [...filtered];
    arr.sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      if (va === vb) return 0;
      return (va > vb ? 1 : -1) * (sortDir === "asc" ? 1 : -1);
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  return (
    <div>
      {searchable && (
        <div className="mb-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث..."
            className="w-full rounded-xl border px-3 py-2 text-sm"
          />
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full rounded-2xl overflow-hidden border">
          <thead className="bg-slate-100">
            <tr>
              {columns.map((c) => (
                <th key={String(c.key)} className="px-3 py-2 text-start text-sm">
                  <button
                    className="font-medium"
                    onClick={() => {
                      if (!c.sortable) return;
                      if (sortKey === c.key) {
                        setSortDir(sortDir === "asc" ? "desc" : "asc");
                      } else {
                        setSortKey(c.key);
                        setSortDir("asc");
                      }
                    }}
                  >
                    {c.header}
                    {sortKey === c.key ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, idx) => (
              <tr key={idx} className="border-t">
                {columns.map((c) => (
                  <td key={String(c.key)} className="px-3 py-2 text-sm">
                    {c.render ? c.render(row) : String(row[c.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
