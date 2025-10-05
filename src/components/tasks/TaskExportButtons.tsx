export default function TaskExportButtons({ taskId }: { taskId: string }) {
  return (
    <div className="flex items-center gap-2">
      <a className="rounded-lg px-3 py-1.5 text-xs ring-1 ring-gray-200 hover:bg-gray-50"
         href={`/api/tasks/${encodeURIComponent(taskId)}/print`} target="_blank" rel="noreferrer">
        تحميل PDF
      </a>
      <a className="rounded-lg px-3 py-1.5 text-xs ring-1 ring-gray-200 hover:bg-gray-50"
         href={`/api/tasks/${encodeURIComponent(taskId)}/ics`} target="_blank" rel="noreferrer">
        تحميل ICS
      </a>
    </div>
  );
}
