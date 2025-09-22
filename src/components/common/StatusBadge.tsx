function StatusBadge({ status }: { status: "open" | "in_progress" | "done" | string }) {
  const map: Record<string, string> = {
    open: "bg-blue-100 text-blue-700",
    in_progress: "bg-amber-100 text-amber-700",
    done: "bg-emerald-100 text-emerald-700",
  };
  const cls = map[status] || "bg-neutral-100 text-neutral-700";
  return <span className={`px-2 py-1 rounded-full text-xs ${cls}`}>{status}</span>;
}
