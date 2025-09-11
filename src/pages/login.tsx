import Head from "next/head";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useRouter } from "next/router";

type AinAuth = { id: string; name: string; role: string; features?: string[]; plan?: any };

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
      setSession({ id: d.id || phone, name: d.name || name || phone, role: d.role || role, features: d.features || ["DASHBOARD_ACCESS"] });
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
      <Header />

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
                <label className="block mb-2 text-sm">الدور</label>
                <select value={role} onChange={(e)=>setRole(e.target.value)} className="w-full border rounded px-3 py-2 mb-4">
                  <option value="individual_tenant">Individual</option>
                  <option value="owner">Owner</option>
                  <option value="broker">Broker</option>
                  <option value="admin">Admin</option>
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
            <h2 className="text-lg font-semibold mb-2">الميزات</h2>
            <ul className="list-disc ps-5 text-sm space-y-1 text-slate-700">
              <li>دخول سريع برقم الهاتف</li>
              <li>توافق مع لوحة التحكم</li>
              <li>يحفظ الجلسة في المتصفح</li>
            </ul>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

(LoginPage as any).noChrome = true;
export default LoginPage;
