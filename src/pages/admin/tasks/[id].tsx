import React, { useCallback, useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "@/components/layout/Layout";

type Task = {
  id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "done" | "archived";
  assignees?: string[];
  dueDate?: string;
  labels?: string[];
  createdAt?: string;
  updatedAt?: string;
  attachments?: { id: string; name: string; url?: string }[];
  thread?: { id: string; author: string; ts: string; text: string }[];
  relatedEntity?: { type: string; id: string };
};

function arrayBufferToBase64(buf: ArrayBuffer) {
  let binary = "";
  const bytes = new Uint8Array(buf);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  return typeof btoa !== "undefined" ? btoa(binary) : Buffer.from(binary, "binary").toString("base64");
}

const fallbackTask = (id: string): Task => ({
  id,
  title: "مهمة جديدة",
  description: "",
  priority: "medium",
  status: "open",
  labels: [],
  assignees: [],
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  attachments: [],
  thread: [],
});

const PriorityBadge = ({ priority }: { priority: Task["priority"] }) => {
  const priorityConfig = {
    low: { color: "bg-green-100 text-green-800", text: "منخفضة" },
    medium: { color: "bg-yellow-100 text-yellow-800", text: "متوسطة" },
    high: { color: "bg-orange-100 text-orange-800", text: "مرتفعة" },
    urgent: { color: "bg-red-100 text-red-800", text: "طارئة" }
  };

  const config = priorityConfig[priority];

  return (
    <span className={`text-xs rounded-full px-2 py-1 ${config.color}`}>
      {config.text}
    </span>
  );
};

const StatusBadge = ({ status }: { status: Task["status"] }) => {
  const statusConfig = {
    open: { color: "bg-blue-100 text-blue-800", text: "مفتوحة" },
    in_progress: { color: "bg-purple-100 text-purple-800", text: "قيد التنفيذ" },
    done: { color: "bg-green-100 text-green-800", text: "منجزة" },
    archived: { color: "bg-gray-100 text-gray-800", text: "مؤرشفة" }
  };

  const config = statusConfig[status];

  return (
    <span className={`text-xs rounded-full px-2 py-1 ${config.color}`}>
      {config.text}
    </span>
  );
};

export default function TaskDetailsPage() {
  const router = useRouter();
  const { id } = router.query as { id?: string };

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  const loadTask = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/tasks/${encodeURIComponent(String(id))}`, { 
        cache: "no-store" as RequestCache 
      });
      
      if (response.status === 404) {
        // إنشاء تلقائي عند 404
        const newTask = fallbackTask(String(id));
        await fetch(`/api/tasks/${encodeURIComponent(String(id))}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newTask),
        });
        setTask(newTask);
      } else if (response.ok) {
        const data = await response.json();
        const taskData = (data?.item as Task) ?? (data as Task) ?? fallbackTask(String(id));
        setTask(taskData);
      } else {
        setTask(fallbackTask(String(id)));
      }
    } catch (error) {
      console.error("Failed to load task:", error);
      setTask(fallbackTask(String(id)));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadTask();
  }, [loadTask]);

  const saveTask = async (updates: Partial<Task>) => {
    if (!id) return false;
    
    setSaving(true);
    try {
      const response = await fetch(`/api/tasks/${encodeURIComponent(String(id))}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      
      if (response.ok) {
        const data = await response.json();
        const updatedTask = (data?.item as Task) ?? (data as Task);
        setTask(prev => updatedTask ?? { ...(prev as Task), ...updates });
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 2000);
        return true;
      } else {
        const error = await response.text();
        throw new Error(error || "Failed to save task");
      }
    } catch (error) {
      console.error("Save error:", error);
      setTask(prev => ({ ...(prev as Task), ...updates }));
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = async (field: keyof Task, value: any) => {
    if (!task) return;
    
    const updatedTask = { ...task, [field]: value };
    setTask(updatedTask);
    
    // حفظ تلقائي بعد التعديل
    await saveTask({ [field]: value });
  };

  const handlePrint = () => {
    if (!id) return;
    window.open(`/api/tasks/${encodeURIComponent(String(id))}/print`, "_blank");
  };

  const handleGenerateICS = () => {
    if (!id) return;
    window.open(`/api/tasks/${encodeURIComponent(String(id))}/ics`, "_blank");
  };

  const sendMessage = async () => {
    if (!id || !message.trim()) return;
    
    const newMessage = { 
      id: `m-${Date.now()}`, 
      author: "admin", 
      ts: new Date().toISOString(), 
      text: message.trim() 
    };
    
    setTask(prev => prev ? { 
      ...prev, 
      thread: [newMessage, ...(prev.thread ?? [])] 
    } : prev);
    
    setMessage("");
    
    try {
      await fetch(`/api/tasks/${encodeURIComponent(String(id))}/thread`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMessage),
      });
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const uploadAttachment = async (file: File) => {
    if (!id) return;
    
    try {
      const buffer = await file.arrayBuffer();
      const base64Data = arrayBufferToBase64(buffer);
      
      await fetch(`/api/tasks/${encodeURIComponent(String(id))}/attachments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          filename: file.name, 
          contentType: file.type, 
          data: base64Data 
        }),
      });
      
      // إعادة تحميل المهمة بعد إضافة المرفق
      await loadTask();
    } catch (error) {
      console.error("Upload error:", error);
      alert("تعذّر رفع المرفق. يرجى المحاولة مرة أخرى.");
    }
  };

  const sendInvites = async () => {
    if (!id) return;
    
    try {
      await fetch(`/api/tasks/${encodeURIComponent(String(id))}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails: [] }),
      });
      
      alert("تم إرسال الدعوات بنجاح.");
    } catch (error) {
      console.error("Invite error:", error);
      alert("تعذّر إرسال الدعوات. يرجى المحاولة مرة أخرى.");
    }
  };

  if (!id) {
    return (
      <Layout>
        <div className="p-6 text-center">لا يوجد معرّف مهمة.</div>
      </Layout>
    );
  }

  if (loading || !task) {
    return (
      <Layout>
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4">جارٍ تحميل بيانات المهمة...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>{task.title} | إدارة المهام | Ain Oman</title>
      </Head>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* شريط الحالة وأزرار التنقل */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <button 
              onClick={() => router.push("/admin/tasks")}
              className="flex items-center text-blue-600 hover:text-blue-800 mb-2"
            >
              <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              العودة إلى لوحة المهام
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">تفاصيل المهمة</h1>
          </div>
          
          <div className="flex items-center gap-3">
            {saveStatus === "success" && (
              <span className="text-green-600 text-sm bg-green-100 px-3 py-1 rounded-full">
                تم الحفظ بنجاح
              </span>
            )}
            {saveStatus === "error" && (
              <span className="text-red-600 text-sm bg-red-100 px-3 py-1 rounded-full">
                خطأ في الحفظ
              </span>
            )}
            {saving && (
              <span className="text-blue-600 text-sm bg-blue-100 px-3 py-1 rounded-full">
                جاري الحفظ...
              </span>
            )}
            
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 flex items-center"
              >
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m4 4h6a2 2 0 002-2v-4a2 2 0 00-2-2h-6a2 2 0 00-2 2v4a2 2 0 002 2z" />
                </svg>
                طباعة
              </button>
              <button
                onClick={handleGenerateICS}
                className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 flex items-center"
              >
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                ICS
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr,400px] gap-6">
          {/* المحتوى الرئيسي */}
          <div className="space-y-6">
            {/* معلومات الأساسية */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-xl font-semibold mb-4">معلومات المهمة</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">العنوان</label>
                  <input
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={task.title}
                    onChange={(e) => setTask({ ...task, title: e.target.value })}
                    onBlur={() => handleFieldChange("title", task.title)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">الحالة</label>
                  <select
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={task.status}
                    onChange={(e) => handleFieldChange("status", e.target.value as Task["status"])}
                  >
                    <option value="open">مفتوحة</option>
                    <option value="in_progress">قيد التنفيذ</option>
                    <option value="done">منجزة</option>
                    <option value="archived">مؤرشفة</option>
                  </select>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">الوصف</label>
                <textarea
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={task.description ?? ""}
                  onChange={(e) => setTask({ ...task, description: e.target.value })}
                  onBlur={() => handleFieldChange("description", task.description)}
                  placeholder="أضف وصفًا مفصلاً للمهمة..."
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">الأولوية</label>
                  <select
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={task.priority}
                    onChange={(e) => handleFieldChange("priority", e.target.value as Task["priority"])}
                  >
                    <option value="low">منخفضة</option>
                    <option value="medium">متوسطة</option>
                    <option value="high">مرتفعة</option>
                    <option value="urgent">طارئة</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">تاريخ الاستحقاق</label>
                  <input
                    type="date"
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={task.dueDate || ""}
                    onChange={(e) => handleFieldChange("dueDate", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* المحادثة */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-xl font-semibold mb-4">المحادثة</h2>
              
              <div className="flex gap-2 mb-4">
                <input
                  className="flex-1 border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="اكتب رسالة..."
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                />
                <button 
                  onClick={sendMessage}
                  className="px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50"
                  disabled={!message.trim()}
                >
                  إرسال
                </button>
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {(task.thread ?? []).length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <p>لا توجد رسائل بعد</p>
                  </div>
                ) : (
                  task.thread.map((msg) => (
                    <div key={msg.id} className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-slate-600 font-medium">{msg.author.charAt(0)}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{msg.author}</span>
                          <span className="text-xs text-slate-500">
                            {new Date(msg.ts).toLocaleString('ar-EG')}
                          </span>
                        </div>
                        <div className="bg-slate-100 rounded-xl p-3">
                          <p className="text-slate-800">{msg.text}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* الشريط الجانبي */}
          <div className="space-y-6">
            {/* معلومات إضافية */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-xl font-semibold mb-4">معلومات إضافية</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">المسؤولون</label>
                  <input
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={task.assignees?.join(", ") || ""}
                    onChange={(e) => setTask({ ...task, assignees: e.target.value.split(",").map(s => s.trim()) })}
                    onBlur={() => handleFieldChange("assignees", task.assignees)}
                    placeholder="أدخل أسماء المسؤولين مفصولة بفواصل"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">التصنيفات</label>
                  <input
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={task.labels?.join(", ") || ""}
                    onChange={(e) => setTask({ ...task, labels: e.target.value.split(",").map(s => s.trim()) })}
                    onBlur={() => handleFieldChange("labels", task.labels)}
                    placeholder="أدخل التصنيفات مفصولة بفواصل"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <div className="text-sm font-medium text-slate-700">تاريخ الإنشاء</div>
                    <div className="text-slate-600">
                      {task.createdAt ? new Date(task.createdAt).toLocaleDateString('ar-EG') : "-"}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-slate-700">آخر تحديث</div>
                    <div className="text-slate-600">
                      {task.updatedAt ? new Date(task.updatedAt).toLocaleDateString('ar-EG') : "-"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* المرفقات */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-xl font-semibold mb-4">المرفقات</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">إضافة مرفق</label>
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadAttachment(file);
                  }}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                {(task.attachments ?? []).length === 0 ? (
                  <div className="text-center py-4 text-slate-500">
                    لا توجد مرفقات
                  </div>
                ) : (
                  task.attachments.map((att) => (
                    <a
                      key={att.id}
                      href={att.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50"
                    >
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      <span className="text-sm truncate flex-1">{att.name}</span>
                    </a>
                  ))
                )}
              </div>
            </div>

            {/* الإجراءات */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-xl font-semibold mb-4">الإجراءات</h2>
              
              <div className="space-y-3">
                <button
                  onClick={sendInvites}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  إرسال دعوات مراقبة
                </button>
                
                <button
                  onClick={() => navigator.clipboard.writeText(window.location.href)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  نسخ رابط المهمة
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}