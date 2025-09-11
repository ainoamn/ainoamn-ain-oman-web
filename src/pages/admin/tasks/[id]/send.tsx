import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Layout from "@/components/layout/Layout";

export default function TaskSendPage() {
  const router = useRouter();
  const { id } = router.query;
  const [recipients, setRecipients] = useState("");
  const [subject, setSubject] = useState("مهمة جديدة/تحديث");
  const [message, setMessage] = useState("");
  const [includeCalendar, setIncludeCalendar] = useState(true);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string }>({});

  const handleSend = async () => {
    if (!id) return;
    
    setSending(true);
    try {
      const response = await fetch(`/api/tasks/${id}/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipients: recipients.split(",").map(r => r.trim()).filter(r => r),
          subject,
          message,
          autoCalendar: includeCalendar
        }),
      });
      
      const data = await response.json();
      
      if (data.ok) {
        setResult({ success: true, message: `تم إرسال المهمة إلى ${data.count} مستلم` });
      } else {
        setResult({ success: false, message: data.error || "فشل في الإرسال" });
      }
    } catch (error) {
      setResult({ success: false, message: "حدث خطأ أثناء الإرسال" });
    } finally {
      setSending(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>إرسال المهمة | Ain Oman</title>
      </Head>
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">إرسال المهمة</h1>
          <button 
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800"
          >
            عودة
          </button>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm p-6 max-w-2xl mx-auto">
          {result.message && (
            <div className={`p-4 rounded-xl mb-6 ${result.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
              {result.message}
            </div>
          )}
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                المستلمون (افصل بينهم بفواصل)
              </label>
              <textarea
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                placeholder="example@email.com, 971234567890"
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
              <p className="text-sm text-slate-500 mt-1">
                أدخل عناوين البريد الإلكتروني أو أرقام الهواتف (للواتساب)
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                الموضوع
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                الرسالة (اختياري)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="أضف رسالة شخصية..."
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeCalendar"
                checked={includeCalendar}
                onChange={(e) => setIncludeCalendar(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
              />
              <label htmlFor="includeCalendar" className="mr-2 block text-sm text-slate-700">
                إضافة إلى التقويم تلقائياً
              </label>
            </div>
            
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => router.back()}
                className="px-6 py-3 rounded-xl border border-slate-300 hover:bg-slate-50"
                disabled={sending}
              >
                إلغاء
              </button>
              <button
                onClick={handleSend}
                disabled={sending || !recipients.trim()}
                className="px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {sending ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    جاري الإرسال...
                  </>
                ) : (
                  "إرسال المهمة"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}