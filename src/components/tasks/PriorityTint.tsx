/**
 * يلوّن خلفية المحتوى بنِسَب خفيفة حسب الأولوية.
 * الاستخدام:
 * <PriorityTint priority={task.priority}><Card ... /></PriorityTint>
 */
function PriorityTint({ priority, children }: { priority: "low"|"medium"|"high"|"urgent"|string; children: React.ReactNode; }) {
  const cls =
    priority === "urgent" ? "bg-red-50 ring-red-100" :
    priority === "high"   ? "bg-orange-50 ring-orange-100" :
    priority === "medium" ? "bg-amber-50 ring-amber-100" :
                            "bg-emerald-50 ring-emerald-100";
  return <div className={`rounded-xl ring-1 ${cls}`}>{children}</div>;
}
