import Head from "next/head";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useRouter } from "next/router";

export default function LoginPage() {
  const { dir } = useI18n();
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("individual_tenant");
  const [busy, setBusy] = useState(false);
  const [demoUser, setDemoUser] = useState({ id: "", name: "", role: "guest" });

  async function sendOtp() {
    setBusy(true);
    try {
      const r = await fetch("/api/auth/request-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone }) });
      const d = await r.json();
      if (!r.ok) return alert(d?.error || "فشل إرسال الكود");
      setOtpSent(true);
      // عرض الكود في التطوير
      if (d.demoCode) console.log("OTP:", d.demoCode);
      alert("تم إرسال الكود عبر واتساب (وضع التطوير)");
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
      router.push("/dashboard");
    } finally {
      setBusy(false);
    }
  }

  async function demoLogin() {
    setBusy(true);
    try {
      const r = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(demoUser) });
      const d = await r.json();
      if (!r.ok) return alert(d?.error || "خطأ");
      router.push("/dashboard");
    } finally {
      setBusy(false);
    }
  }

  async function social(provider: "google" | "microsoft") {
    // نقطة دمج OAuth الحقيقية لاحقًا. الآن تسجيل فوري لأغراض التطوير.
    setBusy(true);
    try {
      const r = await fetch(`/api/auth/login?dev=1&id=${encodeURIComponent(provider + ":demo")}&name=${encodeURIComponent(provider)}&role=${encodeURIComponent(role)}`);
      if (!r.ok) return alert("فشل الدخول الاجتماعي");
      router.push("/dashboard");
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
          {/* بطاقة الدخول الذكي */}
          <div className="bg-white rounded-3xl shadow p-8">
            <h1 className="text-2xl font-bold mb-1">تسجيل الدخول</h1>
            <p className="text-slate-600 mb-6 text-sm">دخول مرن عبر واتساب OTP أو عبر مزوّدي الهوية.</p>

            <div className="space-y-4">
              <label className="block">
                <span className="text-sm">اختر الدور (للتجربة)</span>
                <select className="mt-1 w-full border rounded px-3 py-2" value={role} onChange={e=> setRole(e.target.value)}>
                  <option value="individual_tenant">مستأجر فردي</option>
                  <option value="corporate_tenant">مستأجر شركة</option>
                  <option value="basic_individual_landlord">مؤجر فردي عادي</option>
                  <option value="property_owner_individual_landlord">مؤجر فردي متعدد العقارات</option>
                  <option value="corporate_landlord">مؤجر شركة</option>
                  <option value="individual_property_manager">مدير عقارات فردي</option>
                  <option value="service_provider">مقدم خدمة</option>
                  <option value="admin_staff">موظف إداري</option>
                  <option value="broker">وسيط عقاري</option>
                  <option value="investor">مستثمر</option>
                  <option value="sub_user">مستخدم فرعي</option>
                </select>
              </label>

              <div className="border rounded-2xl p-4">
                <div className="font-semibold mb-2">واتساب OTP</div>
                {!otpSent ? (
                  <>
                    <input className="w-full border rounded px-3 py-2 mb-2" placeholder="رقم الهاتف" value={phone} onChange={e=> setPhone(e.target.value)} />
                    <input className="w-full border rounded px-3 py-2 mb-2" placeholder="الاسم (اختياري)" value={name} onChange={e=> setName(e.target.value)} />
                    <button disabled={busy} onClick={sendOtp} className="w-full bg-teal-600 text-white rounded px-4 py-2">إرسال الكود</button>
                  </>
                ) : (
                  <>
                    <input className="w-full border rounded px-3 py-2 mb-2 font-mono" placeholder="أدخل الكود" value={code} onChange={e=> setCode(e.target.value)} />
                    <button disabled={busy} onClick={verifyOtp} className="w-full bg-teal-600 text-white rounded px-4 py-2">تأكيد الدخول</button>
                  </>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button disabled={busy} onClick={()=> social("google")} className="border rounded-xl px-4 py-2">Google</button>
                <button disabled={busy} onClick={()=> social("microsoft")} className="border rounded-xl px-4 py-2">Microsoft</button>
              </div>
            </div>
          </div>

          {/* بطاقة حسابات العرض ولوحة التحكم */}
          <div className="bg-white rounded-3xl shadow p-8">
            <h2 className="text-xl font-bold mb-2">حسابات تجريبية فورية</h2>
            <p className="text-slate-600 text-sm mb-4">لاختبار اللوحات بسرعة.</p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <input className="border rounded px-3 py-2" placeholder="id" value={demoUser.id} onChange={e=> setDemoUser(v=>({...v,id:e.target.value}))}/>
                <input className="border rounded px-3 py-2" placeholder="name" value={demoUser.name} onChange={e=> setDemoUser(v=>({...v,name:e.target.value}))}/>
              </div>
              <select className="w-full border rounded px-3 py-2" value={demoUser.role} onChange={e=> setDemoUser(v=>({...v,role:e.target.value}))}>
                <option value="guest">Guest</option>
                <option value="individual_tenant">Individual Tenant</option>
                <option value="corporate_tenant">Corporate Tenant</option>
                <option value="basic_individual_landlord">Basic Individual Landlord</option>
                <option value="property_owner_individual_landlord">Property-owner Individual Landlord</option>
                <option value="corporate_landlord">Corporate Landlord</option>
                <option value="individual_property_manager">Individual Property Manager</option>
                <option value="service_provider">Service Provider</option>
                <option value="admin_staff">Admin Staff</option>
                <option value="broker">Broker</option>
                <option value="investor">Investor</option>
                <option value="sub_user">Sub-user</option>
                <option value="super_admin">Super Admin</option>
              </select>
              <button disabled={busy} onClick={demoLogin} className="w-full bg-slate-800 text-white rounded px-4 py-2">دخول تجريبي</button>

              <div className="mt-6">
                <div className="text-sm text-slate-700">بعد الدخول سيتم ربط الحساب بلوحته تلقائيًا.</div>
                <ul className="list-disc ps-5 text-sm mt-2 space-y-1">
                  <li>المستأجر: العقود، الفواتير، الصيانة، الإشعارات.</li>
                  <li>المؤجر/الشركة: العقارات، العقود، الصيانة، التقارير.</li>
                  <li>الموظف: صلاحيات حسب الشركة.</li>
                  <li>الوسيط: رفع عقارات، جدولة زيارات.</li>
                  <li>المستثمر: تقارير وعوائد فقط.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
