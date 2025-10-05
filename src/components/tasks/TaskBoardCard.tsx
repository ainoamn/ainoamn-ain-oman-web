import TaskStatusPill from "./TaskStatusPill";
import TaskQuickActions from "./TaskQuickActions";
import TaskExportButtons from "./TaskExportButtons";
import PriorityTint from "./PriorityTint";

export default function TaskBoardCard({
  task,
  onChanged,
}: {
  task: {
    id: string;
    title: string;
    description?: string;
    status: string;
    priority: "low"|"medium"|"high"|"urgent"|string;
    category?: string;
    assignees?: string[];
    labels?: string[];
    createdAt?: string;
    updatedAt?: string;
  };
  onChanged?: () => void;
}) {
  return (
    <PriorityTint priority={task.priority}>
      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="text-sm font-semibold leading-5">{task.title}</div>
          <TaskStatusPill status={task.status} priority={task.priority} />
        </div>
        {task.description && <div className="text-xs text-gray-700 line-clamp-3">{task.description}</div>}
        <div className="flex flex-wrap gap-1">
          {(task.labels || []).map((t) => (
            <span key={t} className="rounded px-2 py-0.5 text-[10px] bg-white/70 ring-1 ring-gray-200">#{t}</span>
          ))}
        </div>
        <TaskQuickActions taskId={task.id} status={task.status} priority={task.priority} onChanged={onChanged} />
        <TaskExportButtons taskId={task.id} />
      </div>
    </PriorityTint>
  );
}
5) صفحة كانبان وإدارة المهام (كاملة)