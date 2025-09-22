import React, { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Layout from "@/components/layout/Layout";
import type { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async () => ({ redirect: { destination: "/admin/dashboard?section=tasks", permanent: false }});
function RedirectTasks(){ return null; }
function TasksIndexPage() {
  const router = useRouter();
  const [taskId, setTaskId] = useState("");

  const handleOpenTask = () => {
    if (taskId.trim()) {
      router.push(`/admin/tasks/${encodeURIComponent(taskId.trim())}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleOpenTask();
    }
  };

  return (
    <Layout>
      <Head>
        <title>لوحة إدارة المهام | Ain Oman</title>
      </Head>

      <div className="max-w-4xl mx-auto px-4 py-8" dir="rtl">
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">لوحة إدارة المهام</h1>
            <p className="text-slate-600">افتح مهمة موجودة أو ابدأ مهمة جديدة عبر إدخال المعرّف</p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <input
                className="w-full border border-slate-300 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="أدخل معرّف المهمة (مثال: AO-T-000002)"
                value={taskId}
                onChange={(e) => setTaskId(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <svg 
                className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={!taskId.trim()}
              onClick={handleOpenTask}
            >
              فتح المهمة
            </button>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <h3 className="font-medium text-slate-800 mb-2 flex items-center">
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              تلميحات سريعة
            </h3>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• أدخل معرّف المهمة مباشرةً في المتصفح: <code className="bg-slate-100 px-2 py-1 rounded-md text-blue-600">/admin/tasks/AO-T-000002</code></li>
              <li>• يمكنك نسخ معرّف المهمة من جدول المهام أو من البريد الإلكتروني</li>
              <li>• إذا لم تكن المهمة موجودة، سيتم إنشاؤها تلقائياً</li>
            </ul>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center mb-2">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-900 mr-2">مهمة جديدة</h3>
              </div>
              <p className="text-sm text-slate-600">ابدأ مهمة جديدة بإدخال معرّف فريد</p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center mb-2">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-900 mr-2">إدارة المهام</h3>
              </div>
              <p className="text-sm text-slate-600">عرض وتعديل تفاصيل المهام الحالية</p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <div className="flex items-center mb-2">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-900 mr-2">التقارير</h3>
              </div>
              <p className="text-sm text-slate-600">اطبع التقارير أو أنشئ ملفات ICS</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}