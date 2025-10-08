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
  createdById?: string;
  createdByName?: string;
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
  return <span className={`text-xs rounded-full px-2 py-1 ${config.color}`}>{config.text}</span>;
};

const StatusBadge = ({ status }: { status: Task["status"] }) => {
  const statusConfig = {
    open: { color: "bg-blue-100 text-blue-800", text: "مفتوحة" },
    in_progress: { color: "bg-purple-100 text-purple-800", text: "قيد التنفيذ" },
    done: { color: "bg-green-100 text-green-800", text: "منجزة" },
    archived: { color: "bg-gray-100 text-gray-800", text: "مؤرشفة" }
  };
  const config = statusConfig[status];
  return <span className={`text-xs rounded-full px-2 py-1 ${config.color}`}>{config.text}</span>;
};

export default function TaskDetailsPage() {
  const router = useRouter();
  const { id } = router.query as { id?: string };

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [canEditCore, setCanEditCore] = useState(false);
  const [message, setMessage] = useState("");
  const [ccEmails, setCcEmails] = useState<string>("");
  const [inviteEmails, setInviteEmails] = useState<string>("");
  const [assignName, setAssignName] = useState<string>("");
  const [assignEmail, setAssignEmail] = useState<string>("");
  const [assignDueDate, setAssignDueDate] = useState<string>("");
  const [pendingAttachment, setPendingAttachment] = useState<File | null>(null);
  const [showCcModal, setShowCcModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPhoneInviteModal, setShowPhoneInviteModal] = useState(false);
  const [phoneNumbers, setPhoneNumbers] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  const loadTask = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      // محاولة 1: API المبسّط بجلب مهمة واحدة
      const basic = await fetch(`/api/tasks/simple?id=${encodeURIComponent(String(id))}`, { cache: "no-store" as RequestCache });
      if (basic.ok) {
        const j = await basic.json();
        const bTask = (j?.task as Task) ?? null;
        if (bTask && bTask.id) { 
          setTask(bTask); 
          setLoading(false);
          return; 
        }
      }

      // محاولة 2: API المتقدم
      const adv = await fetch(`/api/tasks/${encodeURIComponent(String(id))}`, { cache: "no-store" as RequestCache });
      if (adv.ok) {
        const j = await adv.json();
        const advTask = (j?.item as Task) ?? (j as Task);
        if (advTask && advTask.id) { 
          setTask(advTask);
          setLoading(false); 
          return; 
        }
      }

      // fallback
      setTask(fallbackTask(String(id)));
    } catch {
      setTask(fallbackTask(String(id)));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadTask(); }, [loadTask]);
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/auth/me", { cache: "no-store" });
        if (r.ok) {
          const j = await r.json();
          const role = j?.user?.role || j?.role || "user";
          setCanEditCore(role === "admin" || role === "owner" || role === "manager");
        } else {
          setCanEditCore(false);
        }
      } catch { setCanEditCore(false); }
    })();
  }, []);

  async function broadcastUpdated(t: Task) {
    try {
      const bc = new BroadcastChannel("ao_tasks");
      const message = { type: "updated", taskId: t.id, propertyId: t.relatedEntity?.id || "" };
      console.log("Broadcasting task update:", message);
      bc.postMessage(message);
      bc.close();
    } catch (error) {
      console.error("Broadcast error:", error);
    }
    try { 
      localStorage.setItem("ao_tasks_bump", String(Date.now()));
      console.log("Updated localStorage bump");
    } catch (error) {
      console.error("localStorage error:", error);
    }
  }

  const saveTask = async (updates: Partial<Task>) => {
    if (!id) return false;
    setSaving(true);
    try {
      // استخدام API المبسط لتحديث المهمة
      const response = await fetch("/api/tasks/simple", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Task updated successfully via unified API");
        
        // تحديث المهمة محلياً
        setTask(prev => ({ ...(prev as Task), ...updates }));
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 2000);
        
        // إشعار التحديث للقوائم
        await broadcastUpdated({ ...(task as Task), ...updates });
        return true;
      } else {
        const error = await response.text();
        throw new Error(error || "Failed to save task");
      }
    } catch (error) {
      console.error("Error saving task:", error);
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

  const sendUpdate = async () => {
    if (!id || !message.trim()) return;
    const newMessage = { id: `m-${Date.now()}`, author: "admin", ts: new Date().toISOString(), text: message.trim() };
    // تفريغ واجهة الإدخال مبكراً لشعور أسرع
    setTask(prev => prev ? { ...prev, thread: [newMessage, ...(prev.thread ?? [])] } : prev);
    const currentAttachment = pendingAttachment;
    setMessage("");
    setCcEmails("");
    setInviteEmails("");
    setAssignName("");
    setAssignEmail("");
    setAssignDueDate("");
    setPendingAttachment(null);

    try {
      // 1) إنشاء تحديث (رسالة في التحديثات)
      await fetch(`/api/tasks/${encodeURIComponent(String(id))}/thread`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newMessage, cc: ccEmails.split(',').map(e=>e.trim()).filter(Boolean), assignTo: assignName || undefined, assignDue: assignDueDate || undefined }),
      });

      // 2) إرسال CC ودعوات المراقبة (إن وُجدت)
      const inviteList = [
        ...ccEmails.split(',').map(e=>e.trim()).filter(Boolean),
        ...inviteEmails.split(',').map(e=>e.trim()).filter(Boolean)
      ];
      if (inviteList.length > 0) {
        await fetch(`/api/tasks/${encodeURIComponent(String(id))}/invite`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emails: inviteList })
        });
      }

      // 3) رفع مرفق (إن وُجد)
      if (currentAttachment) {
        await uploadAttachment(currentAttachment);
      }

      // 4) إحالة المهمة + تحديد تاريخ إنجاز (إن وُجد)
      if (assignName) {
        await fetch(`/api/tasks/${encodeURIComponent(String(id))}/transfer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to: { name: assignName, email: assignEmail || undefined }, ccSelf: true })
        });
        if (assignDueDate) {
          await saveTask({ dueDate: assignDueDate });
        }
      }

      // تحديث بيانات المهمة من المصدر
      await loadTask();
    } catch (e) {
      console.error("Failed to send update:", e);
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
        body: JSON.stringify({ filename: file.name, contentType: file.type, data: base64Data }),
      });
      await loadTask();
    } catch {
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
    } catch {
      alert("تعذّر إرسال الدعوات. يرجى المحاولة مرة أخرى.");
    }
  };

  const shareTask = async (platform: string) => {
    if (!id) return;
    const taskUrl = `${window.location.origin}/admin/tasks/${id}`;
    const taskTitle = task?.title || "مهمة";
    const shareText = `تحقق من هذه المهمة: ${taskTitle}`;
    
    switch (platform) {
      case 'copy':
        try {
          await navigator.clipboard.writeText(taskUrl);
          alert("تم نسخ الرابط إلى الحافظة");
        } catch {
          alert("تعذّر نسخ الرابط");
        }
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + taskUrl)}`, '_blank');
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(taskUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(taskUrl)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(taskUrl)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(taskUrl)}`, '_blank');
        break;
    }
  };

  const sendPhoneInvites = async () => {
    if (!id || !phoneNumbers.trim()) return;
    try {
      const phones = phoneNumbers.split(',').map(p => p.trim()).filter(Boolean);
      await fetch(`/api/tasks/${encodeURIComponent(String(id))}/invite-phone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumbers: phones }),
      });
      alert("تم إرسال الدعوات عبر الهاتف بنجاح.");
      setPhoneNumbers("");
      setShowPhoneInviteModal(false);
    } catch {
      alert("تعذّر إرسال الدعوات عبر الهاتف. يرجى المحاولة مرة أخرى.");
    }
  };

  const handleTransferTask = async () => {
    if (!id) return;
    const nameInput = document.getElementById("transferName") as HTMLInputElement;
    const emailInput = document.getElementById("transferEmail") as HTMLInputElement;
    
    const name = nameInput?.value?.trim();
    const email = emailInput?.value?.trim();
    
    if (!name) {
      alert("يرجى إدخال اسم الشخص");
      return;
    }
    
    try {
      const response = await fetch(`/api/tasks/${encodeURIComponent(String(id))}/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          to: { name, email: email || undefined },
          ccSelf: true 
        }),
      });
      
      if (response.ok) {
        alert("تم إحالة المهمة بنجاح.");
        nameInput.value = "";
        emailInput.value = "";
        await loadTask(); // إعادة تحميل المهمة
      } else {
        alert("تعذّر إحالة المهمة. يرجى المحاولة مرة أخرى.");
      }
    } catch {
      alert("تعذّر إحالة المهمة. يرجى المحاولة مرة أخرى.");
    }
  };

  if (!id) {
    return (<Layout><div className="p-6 text-center">لا يوجد معرّف مهمة.</div></Layout>);
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
      <Head><title>{task.title} | إدارة المهام | Ain Oman</title></Head>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* شريط الحالة وأزرار التنقل */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <button onClick={() => router.push("/admin/tasks")} className="flex items-center text-blue-600 hover:text-blue-800 mb-2">
              <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              العودة إلى لوحة المهام
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">تفاصيل المهمة</h1>
            <div className="mt-1 flex items-center gap-2 text-slate-600 text-sm">
              <StatusBadge status={task.status} />
              <span>•</span>
              <PriorityBadge priority={task.priority} />
              <span>•</span>
              <span className="font-mono">{task.id}</span>
            </div>
            {(task.createdByName || task.createdById) && (
              <div className="mt-1 text-sm text-slate-600">
                منشئ المهمة: <span className="font-medium">{task.createdByName || "—"}</span>
                {task.createdById && <span className="ml-2 font-mono">({task.createdById})</span>}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {saveStatus === "success" && <span className="text-green-600 text-sm bg-green-100 px-3 py-1 rounded-full">تم الحفظ بنجاح</span>}
            {saveStatus === "error" && <span className="text-red-600 text-sm bg-red-100 px-3 py-1 rounded-full">خطأ في الحفظ</span>}
            {saving && <span className="text-blue-600 text-sm bg-blue-100 px-3 py-1 rounded-full">جاري الحفظ...</span>}
            <div className="flex gap-2">
              <button onClick={handlePrint} className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 flex items-center">
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m4 4h6a2 2 0 002-2v-4a2 2 0 00-2-2h-6a2 2 0 00-2 2v4a2 2 0 002 2z" />
                </svg>
                طباعة
              </button>
              <button onClick={handleGenerateICS} className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 flex items-center">
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
                  {canEditCore ? (
                    <input
                      className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={task.title}
                      onChange={(e) => setTask({ ...task, title: e.target.value })}
                      onBlur={() => handleFieldChange("title", task.title)}
                    />
                  ) : (
                    <div className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 text-slate-700">
                      {task.title}
                    </div>
                  )}
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
                {canEditCore ? (
                  <textarea
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={task.description ?? ""}
                    onChange={(e) => setTask({ ...task, description: e.target.value })}
                    onBlur={() => handleFieldChange("description", task.description)}
                    placeholder="أضف وصفًا مفصلاً للمهمة..."
                  />
                ) : (
                  <div className="w-full min-h-[120px] border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 text-slate-700 whitespace-pre-wrap">
                    {task.description || "—"}
                  </div>
                )}
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

            {/* التحديثات */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-xl font-semibold mb-4">التحديثات</h2>
              <div className="space-y-3 mb-4">
                <textarea
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[90px]"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="أضف تحديثًا، ملاحظة أو تعليقًا..."
                />
                
                {/* شريط الأدوات */}
                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-1">
                    {/* CC */}
                    <button
                      onClick={() => setShowCcModal(true)}
                      className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors relative group"
                      title="إضافة نسخة (CC)"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {ccEmails && <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></span>}
                    </button>
                    
                    {/* دعوة */}
                    <button
                      onClick={() => setShowInviteModal(true)}
                      className="p-2 rounded-lg hover:bg-green-100 text-green-600 transition-colors relative group"
                      title="دعوة أشخاص للمراقبة"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                      {inviteEmails && <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></span>}
                    </button>
                    
                    {/* إحالة */}
                    <button
                      onClick={() => setShowAssignModal(true)}
                      className="p-2 rounded-lg hover:bg-orange-100 text-orange-600 transition-colors relative group"
                      title="إحالة التحديث لشخص"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {assignName && <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full"></span>}
                    </button>
                    
                    {/* دعوة عبر الهاتف */}
                    <button
                      onClick={() => setShowPhoneInviteModal(true)}
                      className="p-2 rounded-lg hover:bg-teal-100 text-teal-600 transition-colors relative group"
                      title="دعوة عبر رقم الهاتف"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {phoneNumbers && <span className="absolute -top-1 -right-1 w-2 h-2 bg-teal-500 rounded-full"></span>}
                    </button>
                    
                    {/* مشاركة */}
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="p-2 rounded-lg hover:bg-indigo-100 text-indigo-600 transition-colors relative group"
                      title="مشاركة المهمة"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="flex-1"></div>
                  
                  {/* مرفق */}
                  <div className="relative">
                    <input
                      type="file"
                      onChange={(e) => setPendingAttachment(e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      id="attachment-input"
                    />
                    <label
                      htmlFor="attachment-input"
                      className="p-2 rounded-lg hover:bg-purple-100 text-purple-600 transition-colors cursor-pointer relative group"
                      title="إضافة مرفق"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      {pendingAttachment && <span className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full"></span>}
                    </label>
                  </div>
                  
                  {/* نشر */}
                  <button
                    onClick={sendUpdate}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50 transition-colors"
                    disabled={!message.trim()}
                  >
                    نشر
                  </button>
                </div>
                
                {/* عرض المرفق المحدد */}
                {pendingAttachment && (
                  <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <span className="text-sm text-purple-700 flex-1">{pendingAttachment.name}</span>
                    <button
                      onClick={() => setPendingAttachment(null)}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {Array.isArray(task.thread) && task.thread.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <p>لا توجد رسائل بعد</p>
                  </div>
                ) : (
                  (task.thread || []).map((msg) => (
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
                  <label className="block text-sm font-medium text-slate-700 mb-2">إحالة المهمة لشخص آخر</label>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="اسم الشخص"
                      id="transferName"
                    />
                    <input
                      className="flex-1 border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="البريد الإلكتروني (اختياري)"
                      id="transferEmail"
                    />
                    <button
                      onClick={handleTransferTask}
                      className="px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium"
                    >
                      إحالة
                    </button>
                  </div>
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
                {Array.isArray(task.attachments) && task.attachments.length === 0 ? (
                  <div className="text-center py-4 text-slate-500">لا توجد مرفقات</div>
                ) : (
                  (task.attachments || []).map((att) => (
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  نسخ رابط المهمة
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* نافذة CC */}
      {showCcModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">إضافة نسخة (CC)</h3>
            <textarea
              className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              value={ccEmails}
              onChange={(e) => setCcEmails(e.target.value)}
              placeholder="أدخل عناوين البريد الإلكتروني مفصولة بفواصل"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowCcModal(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50"
              >
                إلغاء
              </button>
              <button
                onClick={() => setShowCcModal(false)}
                className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
              >
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة الدعوة */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">دعوة أشخاص للمراقبة</h3>
            <textarea
              className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              value={inviteEmails}
              onChange={(e) => setInviteEmails(e.target.value)}
              placeholder="أدخل عناوين البريد الإلكتروني للمدعوين مفصولة بفواصل"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50"
              >
                إلغاء
              </button>
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white"
              >
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة الإحالة */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">إحالة التحديث</h3>
            <div className="space-y-3">
              <input
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={assignName}
                onChange={(e) => setAssignName(e.target.value)}
                placeholder="اسم الشخص"
              />
              <input
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={assignEmail}
                onChange={(e) => setAssignEmail(e.target.value)}
                placeholder="البريد الإلكتروني (اختياري)"
              />
              <input
                type="date"
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={assignDueDate}
                onChange={(e) => setAssignDueDate(e.target.value)}
                placeholder="تاريخ إنجاز التحديث"
              />
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50"
              >
                إلغاء
              </button>
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex-1 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white"
              >
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة المشاركة */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">مشاركة المهمة</h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={() => shareTask('copy')}
                  className="flex-1 p-3 rounded-lg border border-slate-300 hover:bg-slate-50 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  نسخ الرابط
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => shareTask('whatsapp')}
                  className="p-3 rounded-lg bg-green-100 hover:bg-green-200 text-green-700 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  واتساب
                </button>
                <button
                  onClick={() => shareTask('telegram')}
                  className="p-3 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                  تليجرام
                </button>
                <button
                  onClick={() => shareTask('twitter')}
                  className="p-3 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-700 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                  تويتر
                </button>
                <button
                  onClick={() => shareTask('facebook')}
                  className="p-3 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  فيسبوك
                </button>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowShareModal(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة الدعوة عبر الهاتف */}
      {showPhoneInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">دعوة عبر رقم الهاتف</h3>
            <div className="space-y-3">
              <textarea
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                value={phoneNumbers}
                onChange={(e) => setPhoneNumbers(e.target.value)}
                placeholder="أدخل أرقام الهواتف مفصولة بفواصل (مثال: 96812345678, 96887654321)"
              />
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>ملاحظة:</strong> سيتم إرسال رسالة نصية تحتوي على رابط المهمة وكلمة مرور مؤقتة للدخول إلى النظام.
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowPhoneInviteModal(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50"
              >
                إلغاء
              </button>
              <button
                onClick={sendPhoneInvites}
                className="flex-1 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white"
              >
                إرسال الدعوات
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
