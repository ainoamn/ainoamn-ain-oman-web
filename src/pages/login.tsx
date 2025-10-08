import Head from "next/head";
import Link from "next/link";
// Header and Footer are now handled by MainLayout in _app.tsx
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useRouter } from "next/router";

type AinAuth = { 
  id: string; 
  name: string; 
  role: string; 
  features?: string[]; 
  plan?: any;
  subscription?: {
    planId: string;
    planName: string;
    permissions: string[];
    limits: {
      properties: number;
      units: number;
      bookings: number;
      users: number;
      storage: number;
    };
    usage: {
      properties: number;
      units: number;
      bookings: number;
      users: number;
      storage: number;
    };
    remainingDays: number;
  };
};

function setSession(u: AinAuth) {
  localStorage.setItem("ain_auth", JSON.stringify(u));
  localStorage.setItem("auth_token", JSON.stringify(u)); // توافق مع أكواد أخرى
  try { window.dispatchEvent(new CustomEvent("ain_auth:change")); } catch {}
}

function getReturn(router: ReturnType<typeof useRouter>) {
  const ret = (router.query.return as string) || "";
  return ret && ret.startsWith("/") ? ret : "/dashboard";
}

function LoginPage() {
  const { dir } = useI18n();
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("individual_tenant");
  const [busy, setBusy] = useState(false);

  async function sendOtp() {
    setBusy(true);
    try {
      const r = await fetch("/api/auth/request-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone }) });
      const d = await r.json();
      if (!r.ok) return alert(d?.error || "فشل إرسال الكود");
      setOtpSent(true);
      if (d?.demoCode) console.log("OTP:", d.demoCode);
      alert("تم إرسال الكود عبر واتساب");
    } finally {
      setBusy(false);
    }
  }

  async function verifyOtp() {
    setBusy(true);
    try {
      const r = await fetch("/api/auth/verify-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone, code, name: name || phone, role }) });
      const d = await r.json();
      if (!r.ok) return alert(d?.error || "فشل التحقق");
      
      // جلب معلومات الاشتراك
      let subscription = null;
      try {
        const subRes = await fetch(`/api/subscriptions/user?userId=${d.id || phone}`);
        if (subRes.ok) {
          const subData = await subRes.json();
          subscription = subData.stats;
        }
      } catch (error) {
        console.log("No subscription found, using default");
      }
      
      setSession({ 
        id: d.id || phone, 
        name: d.name || name || phone, 
        role: d.role || role, 
        features: d.features || ["DASHBOARD_ACCESS"],
        subscription: subscription
      });
      router.replace(getReturn(router));
    } finally {
      setBusy(false);
    }
  }

  async function social(provider: "google" | "microsoft") {
    setBusy(true);
    try {
      const r = await fetch(`/api/auth/login?dev=1&id=${encodeURIComponent(provider + ":demo")}&name=${encodeURIComponent(provider)}&role=${encodeURIComponent(role)}`);
      const d = await r.json();
      if (!r.ok) return alert(d?.error || "فشل الدخول الاجتماعي");
      setSession({ id: d.id || provider + ":demo", name: d.name || provider, role: d.role || role, features: d.features || ["DASHBOARD_ACCESS"] });
      router.replace(getReturn(router));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main dir={dir} className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      <Head><title>تسجيل الدخول</title></Head>

      <div className="flex-1 container mx-auto px-4 py-12">
        <div className="mx-auto max-w-5xl grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow p-6">
            <h1 className="text-2xl font-bold mb-4 text-center">تسجيل الدخول</h1>

            <label className="block mb-2 text-sm">رقم الهاتف</label>
            <input value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="الرقم" className="w-full border rounded px-3 py-2 mb-4" />

            {!otpSent ? (
              <button disabled={!phone || busy} onClick={sendOtp} className="w-full px-4 py-2 rounded bg-slate-800 text-white">إرسال كود</button>
            ) : (
              <>
                <label className="block mt-4 mb-2 text-sm">الكود</label>
                <input value={code} onChange={(e)=>setCode(e.target.value)} placeholder="XXXXXX" className="w-full border rounded px-3 py-2 mb-4" />
                <label className="block mb-2 text-sm">الاسم</label>
                <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="اسمك" className="w-full border rounded px-3 py-2 mb-4" />
                <label className="block mb-2 text-sm">نوع الحساب</label>
                <select value={role} onChange={(e)=>setRole(e.target.value)} className="w-full border rounded px-3 py-2 mb-4">
                  <option value="individual_tenant">فرد - مستأجر</option>
                  <option value="owner">مالك عقار</option>
                  <option value="broker">وسيط عقاري</option>
                  <option value="developer">مطور عقاري</option>
                  <option value="company">شركة إدارة عقارات</option>
                  <option value="admin">مدير النظام</option>
                </select>
                <button disabled={!code || busy} onClick={verifyOtp} className="w-full px-4 py-2 rounded bg-emerald-600 text-white">تحقق</button>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button disabled={busy} onClick={()=>social("google")} className="px-4 py-2 rounded border">Google</button>
                  <button disabled={busy} onClick={()=>social("microsoft")} className="px-4 py-2 rounded border">Microsoft</button>
                </div>
              </>
            )}

            <p className="text-xs text-slate-500 mt-4 text-center">سيتم توجيهك تلقائيًا بعد الدخول.</p>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">خطط الاشتراك</h2>
            <div className="space-y-3">
              <div className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-blue-600">الخطة الأساسية</h3>
                  <span className="text-sm text-gray-500">29 ر.ع/شهر</span>
                </div>
                <p className="text-xs text-gray-600">حتى 5 عقارات، 20 وحدة</p>
              </div>
              
              <div className="border rounded-lg p-3 bg-green-50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-green-600">الخطة المعيارية</h3>
                  <span className="text-sm text-gray-500">79 ر.ع/شهر</span>
                </div>
                <p className="text-xs text-gray-600">حتى 25 عقار، 100 وحدة، تقويم ومهام</p>
              </div>
              
              <div className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-purple-600">الخطة المميزة</h3>
                  <span className="text-sm text-gray-500">149 ر.ع/شهر</span>
                </div>
                <p className="text-xs text-gray-600">حتى 100 عقار، ذكاء اصطناعي</p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <Link href="/subscriptions" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                عرض جميع الخطط →
              </Link>
            </div>
          </div>
        </div>
      </div>

    </main>
  );
}

(LoginPage as any).noChrome = true;
export default LoginPage;
