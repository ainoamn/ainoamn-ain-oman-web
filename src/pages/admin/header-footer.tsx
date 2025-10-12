import React, { useEffect, useRef, useState } from "react";
import InstantImage from '@/components/InstantImage';
import Head from "next/head";

/* ===== Types ===== */
type MenuItem = { label: string; href: string };
type SectionLink = { label: string; href: string };
type FooterSection = { title: string; links: SectionLink[] };
type Notification = { id: string; message: string; visible: boolean };

type HeaderSettings = {
  backgroundColor: string; textColor: string; logo: string;
  menuItems: MenuItem[]; notifications: Notification[];
  showUserColorPicker: boolean; availableColors: string[];
};

type FooterSettings = {
  textColor: string; transparency: number;
  sections: FooterSection[]; contact: { email: string; phone: string; address: string };
  payments: { name: string; icon?: string }[];
};

const K = { header: "hf.header.v1", footer: "hf.footer.v1" };

/* ===== Defaults ===== */
const defaultHeader: HeaderSettings = {
  backgroundColor: "#0d9488", textColor: "#ffffff", logo: "/logo.png",
  menuItems: [{ label: "الرئيسية", href: "/" }, { label: "العقارات", href: "/properties" }, { label: "المزادات", href: "/auctions" }],
  notifications: [], showUserColorPicker: true,
  availableColors: ["#0d9488","#2563eb","#7c3aed","#dc2626","#0f766e"],
};
const defaultFooter: FooterSettings = {
  textColor: "#ffffff", transparency: 70,
  sections: [
    { title: "عن المنصة", links: [{ label: "من نحن", href: "/about" }, { label: "تواصل معنا", href: "/contact" }] },
    { title: "خدمات", links: [{ label: "العقارات", href: "/properties" }, { label: "المزادات", href: "/auctions" }] },
  ],
  contact: { email: "info@example.com", phone: "+96800000000", address: "مسقط، عُمان" },
  payments: [{ name: "Visa" }, { name: "Mastercard" }],
};

/* ===== Page ===== */
export default function HeaderFooterAdminPage() {
  const [tab, setTab] = useState<"header"|"footer">("header");
  const [header, setHeader] = useState<HeaderSettings>(defaultHeader);
  const [footer, setFooter] = useState<FooterSettings>(defaultFooter);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notifDraft, setNotifDraft] = useState("");

  const lastY = useRef(0);
  const [hideHeader, setHideHeader] = useState(false);

  /* load local + API */
  useEffect(() => {
    try {
      const h = localStorage.getItem(K.header); const f = localStorage.getItem(K.footer);
      if (h) setHeader((o)=>({ ...o, ...JSON.parse(h) }));
      if (f) setFooter((o)=>({ ...o, ...JSON.parse(f) }));
    } catch {}
    (async () => {
      try {
        const r = await fetch("/api/header-footer");
        if (r.ok) {
          const j = await r.json();
          if (j?.header) setHeader((o)=>({ ...o, ...j.header }));
          if (j?.footer) setFooter((o)=>({ ...o, ...j.footer }));
        }
      } finally { setReady(true); }
    })();
  }, []);

  /* apply CSS vars */
  useEffect(() => {
    document.documentElement.style.setProperty("--brand-600", header.backgroundColor);
    document.documentElement.style.setProperty("--footer-opacity", String(Math.max(0.2, Math.min(1, footer.transparency/100))));
  }, [header.backgroundColor, footer.transparency]);

  /* hide header on scroll */
  useEffect(() => {
    const onScroll = () => { const y = window.scrollY; setHideHeader(y > lastY.current && y > 20); lastY.current = y; };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const persist = async (h: HeaderSettings, f: FooterSettings) => {
    try { localStorage.setItem(K.header, JSON.stringify(h)); localStorage.setItem(K.footer, JSON.stringify(f)); } catch {}
    try { await fetch("/api/header-footer", { method: "POST", headers: { "Content-Type":"application/json" }, body: JSON.stringify({ header: h, footer: f }) }); } catch {}
  };
  const saveAll = async () => { setSaving(true); try { await persist(header, footer); } finally { setSaving(false); } };

  const saveHeader = (p: Partial<HeaderSettings>) => setHeader((prev)=>({ ...prev, ...p }));
  const saveFooter = (p: Partial<FooterSettings>) => setFooter((prev)=>({ ...prev, ...p }));

  if (!ready) return <div style={{ padding:24 }}>جارِ التحميل…</div>;

  const stickyHeaderStyle: React.CSSProperties = {
    backgroundColor: header.backgroundColor, color: header.textColor, borderBottom:"1px solid rgba(255,255,255,0.2)",
    position:"sticky", top:0, transform: hideHeader? "translateY(-100%)":"translateY(0)", transition:"transform .3s", zIndex:50,
  };
  const footerBg = toAlpha(header.backgroundColor, footer.transparency);

  return (
    <>
      <Head><title>لوحة الهيدر والفوتر | Ain Oman</title></Head>

      {/* preview header */}
      <header style={stickyHeaderStyle}>
        <div style={{ maxWidth:1120, margin:"0 auto", padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <InstantImage src={header.logo} alt="logo" style={{ width:36, height:36, objectFit:"contain" }} loading="lazy" width={400} height={300}/>
            <strong style={{ opacity:.9 }}>عين عُمان</strong>
          </div>
          <nav style={{ display:"flex", gap:8 }}>
            {header.menuItems.map(m => (
              <a key={m.href} href={m.href} style={{ padding:"6px 10px", borderRadius:10, color: header.textColor, opacity:.9 }}>{m.label}</a>
            ))}
          </nav>
        </div>
      </header>

      {/* save */}
      <div style={{ maxWidth:1120, margin:"12px auto 0", padding:"0 16px", display:"flex", justifyContent:"flex-end", gap:8 }}>
        <button onClick={saveAll} disabled={saving}
          style={{ background:"#0ea5e9", color:"#fff", padding:"10px 14px", borderRadius:10, fontWeight:700 }}>
          {saving? "جاري الحفظ…" : "حفظ"}
        </button>
      </div>

      {/* tabs */}
      <main style={{ maxWidth:1120, margin:"16px auto 24px", padding:"0 16px" }}>
        <div style={{ display:"flex", gap:8, marginBottom:12 }}>
          <button onClick={()=>setTab("header")} style={tabBtn(tab==="header")}>الهيدر</button>
          <button onClick={()=>setTab("footer")} style={tabBtn(tab==="footer")}>الفوتر</button>
        </div>

        {tab==="header" ? (
          <div style={{ display:"grid", gap:16, gridTemplateColumns:"1fr 1fr" }}>
            <section style={panel}>
              <h2 style={h2}>ألوان الهيدر</h2>
              <Row label="لون الخلفية">
                <input type="color" value={header.backgroundColor} onChange={(e)=>saveHeader({ backgroundColor: e.target.value })}/>
                <Input value={header.backgroundColor} onChange={(e)=>saveHeader({ backgroundColor: e.target.value })}/>
              </Row>
              <Row label="لون النص">
                <input type="color" value={header.textColor} onChange={(e)=>saveHeader({ textColor: e.target.value })}/>
                <Input value={header.textColor} onChange={(e)=>saveHeader({ textColor: e.target.value })}/>
              </Row>
              <Row label="الشعار">
                <Input value={header.logo} onChange={(e)=>saveHeader({ logo: e.target.value })}/>
              </Row>

              <h3 style={h3}>لوحة ألوان للمستخدم</h3>
              <Row label="إظهار في الهيدر">
                <label style={{ display:"inline-flex", alignItems:"center", gap:8 }}>
                  <input type="checkbox" checked={header.showUserColorPicker}
                         onChange={(e)=>saveHeader({ showUserColorPicker: e.target.checked })}/>
                  <span style={{ fontSize:14 }}>مُبدّل اللون</span>
                </label>
              </Row>
              <div style={{ display:"grid", gap:8 }}>
                {header.availableColors.map((c,i)=>(
                  <div key={i} style={{ display:"flex", gap:8, alignItems:"center" }}>
                    <input type="color" value={c} onChange={(e)=> {
                      const arr=[...header.availableColors]; arr[i]=e.target.value; saveHeader({ availableColors: arr });
                    }}/>
                    <Input value={c} onChange={(e)=> {
                      const arr=[...header.availableColors]; arr[i]=e.target.value; saveHeader({ availableColors: arr });
                    }}/>
                    <button onClick={()=> saveHeader({ availableColors: header.availableColors.filter((_,x)=>x!==i) })}
                      style={btnDanger}>حذف</button>
                  </div>
                ))}
                <div>
                  <button onClick={()=> header.availableColors.length<5 && saveHeader({ availableColors:[...header.availableColors, "#0ea5e9"] })}
                    style={btnPrimary} disabled={header.availableColors.length>=5}>+ لون</button>
                </div>
              </div>
            </section>

            <section style={panel}>
              <h2 style={h2}>قوائم الهيدر</h2>
              {header.menuItems.map((m,i)=>(
                <div key={i} style={row}>
                  <Input value={m.label} onChange={(e)=> {
                    const arr=[...header.menuItems]; arr[i]={...m, label:e.target.value}; saveHeader({ menuItems: arr });
                  }}/>
                  <Input value={m.href} onChange={(e)=> {
                    const arr=[...header.menuItems]; arr[i]={...m, href:e.target.value}; saveHeader({ menuItems: arr });
                  }}/>
                  <button style={btnDanger} onClick={()=> saveHeader({ menuItems: header.menuItems.filter((_,x)=>x!==i) })}>حذف</button>
                </div>
              ))}
              <div style={row}>
                <button style={btnPrimary} onClick={()=> saveHeader({ menuItems: [...header.menuItems, { label:"رابط جديد", href:"#"}] })}>+ عنصر</button>
              </div>

              <h2 style={h2}>الإشعار العلوي</h2>
              <div style={{ display:"flex", gap:8 }}>
                <Input value={notifDraft} onChange={(e)=>setNotifDraft(e.target.value)} placeholder="رسالة الإشعار"/>
                <button style={btnPrimary} onClick={()=> {
                  const v = notifDraft.trim(); if(!v) return;
                  setNotifDraft("");
                  setHeader(h=>({ ...h, notifications:[...h.notifications, { id: crypto.randomUUID(), message:v, visible:true }] }));
                }}>إضافة</button>
              </div>
            </section>
          </div>
        ) : (
          <div style={{ display:"grid", gap:16, gridTemplateColumns:"1fr 1fr" }}>
            <section style={panel}>
              <h2 style={h2}>ألوان الفوتر</h2>
              <Row label="شفافية اللون">
                <input type="range" min={20} max={100} step={5} value={footer.transparency}
                  onChange={(e)=>saveFooter({ transparency: parseInt(e.target.value) })}/>
                <span>{footer.transparency}%</span>
              </Row>
              <Row label="لون النص">
                <input type="color" value={footer.textColor} onChange={(e)=>saveFooter({ textColor: e.target.value })}/>
                <Input value={footer.textColor} onChange={(e)=>saveFooter({ textColor: e.target.value })}/>
              </Row>
            </section>

            <section style={panel}>
              <h2 style={h2}>معلومات التواصل</h2>
              <Row label="البريد"><Input value={footer.contact.email} onChange={(e)=>saveFooter({ contact:{ ...footer.contact, email:e.target.value }})}/></Row>
              <Row label="الهاتف"><Input value={footer.contact.phone} onChange={(e)=>saveFooter({ contact:{ ...footer.contact, phone:e.target.value }})}/></Row>
              <Row label="العنوان"><Input value={footer.contact.address} onChange={(e)=>saveFooter({ contact:{ ...footer.contact, address:e.target.value }})}/></Row>
            </section>

            <section style={{ ...panel, gridColumn:"1 / -1" }}>
              <h2 style={h2}>أقسام الفوتر</h2>
              {footer.sections.map((s,i)=>(
                <div key={i} style={{ border:"1px solid #e5e7eb", borderRadius:10, padding:12, marginBottom:10 }}>
                  <Row label={`العنوان #${i+1}`}>
                    <Input value={s.title} onChange={(e)=> {
                      const arr=[...footer.sections]; arr[i]={ ...s, title:e.target.value }; saveFooter({ sections: arr });
                    }}/>
                    <button style={btnDanger} onClick={()=> saveFooter({ sections: footer.sections.filter((_,x)=>x!==i) })}>حذف القسم</button>
                  </Row>

                  {s.links.map((l,j)=>(
                    <div key={j} style={row}>
                      <Input value={l.label} onChange={(e)=> {
                        const arr=[...footer.sections]; const links=[...arr[i].links]; links[j]={ ...l, label:e.target.value }; arr[i]={ ...arr[i], links }; saveFooter({ sections: arr });
                      }}/>
                      <Input value={l.href} onChange={(e)=> {
                        const arr=[...footer.sections]; const links=[...arr[i].links]; links[j]={ ...l, href:e.target.value }; arr[i]={ ...arr[i], links }; saveFooter({ sections: arr });
                      }}/>
                      <button style={btnDanger} onClick={()=> {
                        const arr=[...footer.sections]; const links=[...arr[i].links]; links.splice(j,1); arr[i]={ ...arr[i], links }; saveFooter({ sections: arr });
                      }}>حذف</button>
                    </div>
                  ))}
                  <div style={row}>
                    <button style={btnPrimary} onClick={()=> {
                      const arr=[...footer.sections]; arr[i]={ ...s, links:[...s.links, { label:"رابط", href:"#"}] }; saveFooter({ sections: arr });
                    }}>+ رابط</button>
                  </div>
                </div>
              ))}
              <div style={row}>
                <button style={btnPrimary} onClick={()=> saveFooter({ sections:[...footer.sections, { title:"قسم جديد", links:[{ label:"رابط", href:"#"}] } ] })}>+ قسم</button>
              </div>
            </section>

            <section style={{ ...panel, gridColumn:"1 / -1" }}>
              <h2 style={h2}>طرق الدفع</h2>
              {footer.payments.map((p,i)=>(
                <div key={i} style={row}>
                  <Input value={p.name} onChange={(e)=> {
                    const arr=[...footer.payments]; arr[i]={ ...p, name:e.target.value }; saveFooter({ payments: arr });
                  }} placeholder="الاسم"/>
                  <Input value={p.icon||""} onChange={(e)=> {
                    const arr=[...footer.payments]; arr[i]={ ...p, icon:e.target.value }; saveFooter({ payments: arr });
                  }} placeholder="رابط الأيقونة (اختياري)"/>
                  <button style={btnDanger} onClick={()=> saveFooter({ payments: footer.payments.filter((_,x)=>x!==i) })}>حذف</button>
                </div>
              ))}
              <div style={row}>
                <button style={btnPrimary} onClick={()=> saveFooter({ payments:[...footer.payments, { name:"طريقة جديدة" }] })}>+ طريقة</button>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* preview footer */}
      <footer style={{ background: footerBg, color: footer.textColor, borderTop:"1px solid rgba(255,255,255,0.2)" }}>
        <div style={{ maxWidth:1120, margin:"0 auto", padding:"32px 16px" }}>
          <div style={{ display:"grid", gap:24, gridTemplateColumns:"repeat(4,minmax(0,1fr))" }}>
            <div><div style={{ fontWeight:600, fontSize:18 }}>عين عُمان</div><p style={{ opacity:.9, marginTop:8, fontSize:14 }}>منصّة عقارية لإدارة العقارات والمزادات.</p></div>
            {footer.sections.map((s,i)=>(
              <div key={i}>
                <div style={{ fontWeight:600 }}>{s.title}</div>
                <ul style={{ marginTop:12, fontSize:14, lineHeight:"28px" }}>
                  {s.links.map((l,j)=>(<li key={j}><a href={l.href} style={{ color:"inherit" }}>{l.label}</a></li>))}
                </ul>
              </div>
            ))}
            <div>
              <div style={{ fontWeight:600 }}>تواصل</div>
              <ul style={{ marginTop:12, fontSize:14, lineHeight:"28px" }}>
                <li>البريد: <a href={`mailto:${footer.contact.email}`} style={{ color:"inherit" }}>{footer.contact.email}</a></li>
                <li>الهاتف: <a href={`tel:${footer.contact.phone}`} style={{ color:"inherit" }}>{footer.contact.phone}</a></li>
                <li>العنوان: {footer.contact.address}</li>
              </ul>
              <div style={{ marginTop:16, fontSize:12, opacity:.9 }}>طرق الدفع: {footer.payments.map(p=>p.name).join(" • ")}</div>
            </div>
          </div>
          <div style={{ marginTop:24, paddingTop:16, borderTop:"1px solid rgba(255,255,255,0.2)", fontSize:12, opacity:.8, display:"flex", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
            <div>© {new Date().getFullYear()} عين عُمان</div>
            <div style={{ display:"flex", gap:16 }}>
              <a href="/terms" style={{ color:"inherit" }}>الشروط</a>
              <a href="/privacy" style={{ color:"inherit" }}>الخصوصية</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

/* ===== UI helpers ===== */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={row}>
      <label style={lbl}>{label}</label>
      <div style={{ display:"flex", gap:8, alignItems:"center", flex:1, flexWrap:"wrap" }}>{children}</div>
    </div>
  );
}
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={{ ...txt, ...(props.style||{}) }} />;
}

/* ===== styles ===== */
const panel: React.CSSProperties = { border:"1px solid #e5e7eb", borderRadius:12, padding:16, background:"#fff" };
const row: React.CSSProperties = { display:"flex", alignItems:"center", gap:8, marginBottom:10, flexWrap:"wrap" };
const lbl: React.CSSProperties = { width:140, fontSize:14, color:"#374151" };
const txt: React.CSSProperties = { border:"1px solid #d1d5db", borderRadius:8, padding:"8px 10px", flex:1, minWidth:160 };
const btnPrimary: React.CSSProperties = { background:"#0ea5e9", color:"#fff", padding:"8px 12px", borderRadius:8 };
const btnDanger: React.CSSProperties = { background:"#fee2e2", color:"#b91c1c", padding:"8px 12px", borderRadius:8 };
const h2: React.CSSProperties = { fontWeight:700, marginBottom:12 };
const h3: React.CSSProperties = { fontWeight:700, margin:"12px 0 8px" };

/* ===== utils ===== */
function toAlpha(hex: string, percent: number) {
  const clean = hex.replace("#",""); const n = parseInt(clean,16);
  const r = clean.length===3 ? ((n>>8)&0xf)*17 : (n>>16)&0xff;
  const g = clean.length===3 ? ((n>>4)&0xf)*17 : (n>>8)&0xff;
  const b = clean.length===3 ? (n&0xf)*17 : n&0xff;
  const a = Math.round(Math.max(0.2, Math.min(1, percent/100))*255);
  return `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}${a.toString(16).padStart(2,"0")}`;
}
function tabBtn(active:boolean): React.CSSProperties {
  return { padding:"8px 12px", borderRadius:10, fontWeight:700, border:"1px solid #e5e7eb",
    background: active? "#0ea5e9":"#fff", color: active? "#fff":"#111827" };
}

