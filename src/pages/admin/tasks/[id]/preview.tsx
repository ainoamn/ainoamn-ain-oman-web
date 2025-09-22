import Head from "next/head";
import Layout from "@/components/layout/Layout";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type Task = {
  id: string;
  serial?: string;
  title: string;
  description?: string;
  status: "open" | "in_progress" | "blocked" | "done" | "canceled";
  priority: "low" | "medium" | "high" | "urgent";
  assignees?: string[];
  watchers?: string[];
  labels?: string[];
  category?: string;
  createdAt: string;
  updatedAt?: string;
  dueDate?: string;
  startDate?: string;
};

const StatusBadge = ({ status }: { status: Task["status"] }) => {
  const statusConfig = {
    open: { color: "bg-blue-100 text-blue-800", text: "مفتوحة" },
    in_progress: { color: "bg-purple-100 text-purple-800", text: "قيد التنفيذ" },
    blocked: { color: "bg-red-100 text-red-800", text: "متوقفة" },
    done: { color: "bg-green-100 text-green-800", text: "منجزة" },
    canceled: { color: "bg-gray-100 text-gray-800", text: "ملغاة" }
  };

  const config = statusConfig[status];

  return (
    <span className={`text-xs font-medium rounded-full px-3 py-1 ${config.color}`}>
      {config.text}
    </span>
  );
};

const PriorityBadge = ({ priority }: { priority: Task["priority"] }) => {
  const priorityConfig = {
    low: { color: "bg-green-100 text-green-800", text: "منخفضة" },
    medium: { color: "bg-yellow-100 text-yellow-800", text: "متوسطة" },
    high: { color: "bg-orange-100 text-orange-800", text: "مرتفعة" },
    urgent: { color: "bg-red-100 text-red-800", text: "طارئة" }
  };

  const config = priorityConfig[priority];

  return (
    <span className={`text-xs font-medium rounded-full px-3 py-1 ${config.color}`}>
      {config.text}
    </span>
  );
};
function TaskPreviewPage() {
  const router = useRouter();
  const tid = Array.isArray(router.query.id) ? router.query.id[0] : router.query.id;
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!router.isReady || !tid) return;
    (async () => {
      try {
        const response = await fetch(`/api/tasks/${encodeURIComponent(String(tid))}`);
        const data = await response.json();
        setTask(data?.item || null);
      } catch (error) {
        console.error("Failed to load task:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [router.isReady, tid]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse bg-white rounded-2xl p-6 shadow-sm">
            <div className="h-8 bg-slate-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-3">
              <div className="h-4 bg-slate-200 rounded"></div>
              <div className="h-4 bg-slate-200 rounded w-5/6"></div>
              <div className="h-4 bg-slate-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!task) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
            <svg className="w-16 h-16 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">المهمة غير موجودة</h2>
            <p className="text-slate-600 mb-4">لم يتم العثور على المهمة بالمعرف المطلوب</p>
            <button 
              onClick={() => router.push('/admin/tasks')}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
            >
              العودة إلى لوحة المهام
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>{task.title} - معاينة المهمة | Ain Oman</title>
      </Head>
      <Layout>
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <button 
                onClick={() => router.push(`/admin/tasks/${tid}`)}
                className="flex items-center text-blue-600 hover:text-blue-800 mb-2"
              >
                <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                العودة إلى تحرير المهمة
              </button>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{task.title}</h1>
              <div className="text-sm text-slate-500 mt-1">رقم المهمة: {task.serial || task.id}</div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 flex items-center"
              >
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m4 4h6a2 2 0 002-2v-4a2 2 0 00-2-2h-6a2 2 0 00-2 2v4a2 2 0 002 2z" />
                </svg>
                طباعة
              </button>
              
              <button
                onClick={() => router.push(`/admin/tasks/${tid}/send`)}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 flex items-center"
              >
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                إرسال
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h2 className="text-lg font-semibold text-slate-800 mb-4">معلومات المهمة</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-600">الحالة</span>
                    <StatusBadge status={task.status} />
                  </div>
                  
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-600">الأولوية</span>
                    <PriorityBadge priority={task.priority} />
                  </div>
                  
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-600">تاريخ الإنشاء</span>
                    <span className="text-slate-800">{formatDate(task.createdAt)}</span>
                  </div>
                  
                  {task.dueDate && (
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-600">تاريخ الاستحقاق</span>
                      <span className="text-slate-800">{formatDate(task.dueDate)}</span>
                    </div>
                  )}
                  
                  {task.updatedAt && (
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-600">آخر تحديث</span>
                      <span className="text-slate-800">{formatDate(task.updatedAt)}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold text-slate-800 mb-4">الفريق</h2>
                
                <div className="space-y-4">
                  <div className="py-2 border-b border-slate-100">
                    <div className="text-slate-600 mb-2">المكلفون</div>
                    <div className="text-slate-800">
                      {task.assignees && task.assignees.length > 0 ? (
                        <ul className="list-disc list-inside">
                          {task.assignees.map((assignee, index) => (
                            <li key={index}>{assignee}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="py-2 border-b border-slate-100">
                    <div className="text-slate-600 mb-2">المراقبون</div>
                    <div className="text-slate-800">
                      {task.watchers && task.watchers.length > 0 ? (
                        <ul className="list-disc list-inside">
                          {task.watchers.map((watcher, index) => (
                            <li key={index}>{watcher}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </div>
                  </div>
                  
                  {task.labels && task.labels.length > 0 && (
                    <div className="py-2 border-b border-slate-100">
                      <div className="text-slate-600 mb-2">التصنيفات</div>
                      <div className="flex flex-wrap gap-2">
                        {task.labels.map((label, index) => (
                          <span key={index} className="bg-slate-100 text-slate-800 text-xs px-2 py-1 rounded-full">
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {task.category && (
                    <div className="py-2 border-b border-slate-100">
                      <div className="text-slate-600 mb-2">الفئة</div>
                      <div className="text-slate-800">{task.category}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">وصف المهمة</h2>
              <div className="bg-slate-50 rounded-xl p-4 md:p-6">
                {task.description ? (
                  <div className="whitespace-pre-wrap text-slate-800 leading-relaxed">
                    {task.description}
                  </div>
                ) : (
                  <div className="text-slate-400 text-center py-8">
                    <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>لا يوجد وصف للمهمة</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-center gap-4 pt-4 border-t border-slate-200">
              <button
                onClick={() => router.push(`/admin/tasks/${tid}`)}
                className="px-6 py-2 rounded-xl border border-slate-300 hover:bg-slate-50"
              >
                تعديل المهمة
              </button>
              <button
                onClick={() => router.push(`/api/tasks/${tid}/print`)}
                className="px-6 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
              >
                نسخة PDF
              </button>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}