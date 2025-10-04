import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";

type Invoice = {
  id: string;
  propertyId: string;
  kind: "rent" | "service" | "sale";
  total: number;
  currency: string;
  dueDate?: string;
  paid?: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function InvoicesPage() {
  const router = useRouter();
  const pid = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("propertyId") || "" : "";
  const [items, setItems] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const u = new URL("/api/invoices", window.location.origin);
    if (pid) u.searchParams.set("propertyId", pid);
    const r = await fetch(u.toString());
    const j = await r.json();
    setItems(j.items || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [pid]);

  async function addInvoice() {
    const totalStr = prompt("Total amount?");
    if (!totalStr) return;
    const total = Number(totalStr);
    const currency = prompt("Currency? (OMR)") || "OMR";
    const body = { propertyId: pid, kind: "service", total, currency, paid: false };
    const r = await fetch("/api/invoices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!r.ok) { alert("Create failed"); return; }
    await load();
  }

  const rows = useMemo(() => items.map((x) => (
    <tr key={x.id} className="border-b">
      <td className="p-2 font-mono">{x.id}</td>
      <td className="p-2">{x.kind}</td>
      <td className="p-2">{x.total} {x.currency}</td>
      <td className="p-2">{x.paid ? "Paid" : "Unpaid"}</td>
      <td className="p-2">{new Date(x.updatedAt || x.createdAt).toLocaleString()}</td>
    </tr>
  )), [items]);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Invoices {pid ? `· Property ${pid}` : ""}</h1>
      <div className="flex items-center gap-3">
        {pid ? (
          <button onClick={addInvoice} className="px-4 py-2 rounded-lg border shadow">+ Add invoice</button>
        ) : (
          <span className="text-sm text-gray-500">مرّر ?propertyId=… لإضافة فواتير لعقار محدد</span>
        )}
      </div>
      {loading ? <div>Loading…</div> : (
        <div className="overflow-x-auto border rounded-xl">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50">
              <th className="p-2 text-start">ID</th>
              <th className="p-2 text-start">Type</th>
              <th className="p-2 text-start">Total</th>
              <th className="p-2 text-start">Status</th>
              <th className="p-2 text-start">Updated</th>
            </tr></thead>
            <tbody>{rows}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
