/**
 * TaskExportOptions — واجهة خفيفة لاختيار ماذا يتضمن الـPDF
 * الاستخدام:
 * <TaskExportOptions taskId={task.id} />
 */
import { useMemo, useState } from "react";

export default function TaskExportOptions({ taskId }: { taskId: string }) {
  const [includeThread, setIncludeThread] = useState(true);
  const [includeAttachments, setIncludeAttachments] = useState(true);

  const url = useMemo(() => {
    const p = new URLSearchParams();
    if (!includeThread) p.set("includeThread", "0");
    if (!includeAttachments) p.set("includeAttachments", "0");
    return `/api/tasks/${encodeURIComponent(taskId)}/print${p.toString() ? `?${p}` : ""}`;
  }, [taskId, includeThread, includeAttachments]);

  return (
    <div className="rounded-xl border border-gray-200 p-3 text-sm">
      <div className="font-semibold mb-2">خيارات التصدير</div>
      <label className="flex items-center gap-2 mb-1">
        <input type="checkbox" checked={includeThread} onChange={(e)=>setIncludeThread(e.target.checked)} />
        تضمين المحادثة
      </label>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={includeAttachments} onChange={(e)=>setIncludeAttachments(e.target.checked)} />
        تضمين المرفقات (روابط)
      </label>
      <div className="mt-3">
        <a href={url} target="_blank" rel="noreferrer"
          className="rounded-lg px-3 py-1.5 text-xs ring-1 ring-gray-200 hover:bg-gray-50">
          تنزيل PDF
        </a>
      </div>
    </div>
  );
}




