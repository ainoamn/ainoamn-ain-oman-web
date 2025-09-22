const memoryCounters: Record<string, number> = {};

export function nextId(prefix: string): string {
  if (typeof window !== "undefined") {
    const key = `seq:${prefix}`;
    const n = parseInt(localStorage.getItem(key) || "0", 10) + 1;
    localStorage.setItem(key, String(n));
    return `${prefix}-${String(n).padStart(4, "0")}`;
  }
  memoryCounters[prefix] = (memoryCounters[prefix] || 0) + 1;
  return `${prefix}-${String(memoryCounters[prefix]).padStart(4, "0")}`;
}