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
    priority === "urgent" ? "bg-red-100 text-red-700 ring-red-200" :
    priority === "high"   ? "bg-orange-100 text-orange-700 ring-orange-200" :
    priority === "medium" ? "bg-amber-100 text-amber-700 ring-amber-200" :
                            "bg-emerald-100 text-emerald-700 ring-emerald-200"; // low

  const labelStatus =
    status === "done" ? "منجزة" :
    status === "in_progress" ? "قيد العمل" : "مفتوحة";

  const labelPriority =
    priority === "urgent" ? "عاجلة" :
    priority === "high" ? "مرتفعة" :
    priority === "medium" ? "متوسطة" : "منخفضة";

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs ring-1 ${color}`}>
      <span>{labelStatus}</span>
      <span className="opacity-60">•</span>
      <span>{labelPriority}</span>
    </span>
  );
}
ضعها بجانب عنوان المهمة في محرّر /admin/tasks، مثال:

<h1 className="text-xl font-bold">{task.title}</h1>
<div className="mt-1">
  <TaskStatusPill status={task.status} priority={task.priority} />
</div>
3) شريط فلاتر متقدّم مع حفظ محلي