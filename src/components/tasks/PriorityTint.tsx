/**
 * يلوّن خلفية المحتوى بنِسَب خفيفة حسب الأولوية.
 * الاستخدام:
 * <PriorityTint priority={task.priority}><Card ... /></PriorityTint>
 */
export default function PriorityTint({ priority, children }: { priority: "low"|"medium"|"high"|"urgent"|string; children: React.ReactNode; }) {
  const cls =
    priority === "urgent" ? "from-red-50 to-rose-50 ring-red-100" :
    priority === "high"   ? "from-orange-50 to-amber-50 ring-orange-100" :
    priority === "medium" ? "from-yellow-50 to-amber-50 ring-amber-100" :
                            "from-emerald-50 to-teal-50 ring-emerald-100";
  return (
    <div className={`rounded-xl ring-1 bg-gradient-to-br ${cls} transition-shadow duration-200 hover:shadow-md`}>{children}</div>
  );
}
