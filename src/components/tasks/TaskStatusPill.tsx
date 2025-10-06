/**
 * TaskStatusPill — شارة حالة ملوّنة اعتمادًا على "الأولوية"
 * الاستخدام: <TaskStatusPill status={task.status} priority={task.priority} />
 */
export default function TaskStatusPill({
  status,
  priority,
}: {
  status: "open" | "in_progress" | "done" | string;
  priority: "low" | "medium" | "high" | "urgent" | string;
}) {
  const color =
    priority === "urgent" ? "bg-red-100/80 text-red-700 ring-red-200" :
    priority === "high"   ? "bg-orange-100/80 text-orange-700 ring-orange-200" :
    priority === "medium" ? "bg-amber-100/80 text-amber-700 ring-amber-200" :
                            "bg-emerald-100/80 text-emerald-700 ring-emerald-200"; // low

  const labelStatus =
    status === "done" ? "منجزة" :
    status === "in_progress" ? "قيد العمل" : "مفتوحة";

  const labelPriority =
    priority === "urgent" ? "عاجلة" :
    priority === "high" ? "مرتفعة" :
    priority === "medium" ? "متوسطة" : "منخفضة";

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] ring-1 ${color} backdrop-blur`}
      title={`الحالة: ${labelStatus} • الأولوية: ${labelPriority}`}>
      <span className="inline-flex w-1.5 h-1.5 rounded-full bg-current opacity-60" />
      <span>{labelStatus}</span>
      <span className="opacity-50">•</span>
      <span className="font-medium">{labelPriority}</span>
    </span>
  );
}
