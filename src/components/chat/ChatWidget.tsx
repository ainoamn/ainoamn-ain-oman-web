// src/components/chat/ChatWidget.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useChat, ChatTarget } from "../../context/ChatContext";
import { FaTimes, FaPaperPlane, FaUserShield, FaUserTie } from 'react-icons/fa';

type Message = { id: string; from: "user"|"owner"|"system"|"admin"; text: string; at: string };
type Thread = { id: string; subject?: string; pageUrl?: string; propertyId?: number; target: ChatTarget; createdAt: string; messages: Message[] };

const LS_KEY = (t: ChatTarget, propertyId?: number) => t === "admin" ? "ao_chat_admin" : `ao_chat_owner_${propertyId ?? "none"}`;

export default function ChatWidget() {
  const { isOpen, closeChat, target, setTarget, propertyId, subject } = useChat();
  const [thread, setThread] = useState<Thread | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // حمّل/أنشئ محادثة عند الفتح أو عند تغيير الهدف
  useEffect(() => {
    if (!isOpen) return;
    const init = async () => {
      setLoading(true);
      try {
        const key = LS_KEY(target, propertyId);
        const stored = typeof window !== "undefined" ? localStorage.getItem(key) : null;
        if (stored) {
          const { threadId } = JSON.parse(stored);
          const r = await fetch(`/api/chat/${threadId}`);
          if (r.ok) {
            const data = await r.json();
            setThread(data.thread);
          } else {
            localStorage.removeItem(key);
            await createThread();
          }
        } else {
          await createThread();
        }
      } finally {
        setLoading(false);
      }
    };
    const createThread = async () => {
      const payload: any = {
        message: "بدء محادثة",
        subject,
        pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
        propertyId: propertyId ?? undefined,
        target
      };
      const r = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await r.json();
      if (data?.threadId) {
        localStorage.setItem(LS_KEY(target, propertyId), JSON.stringify({ threadId: data.threadId, target, propertyId }));
        const rr = await fetch(`/api/chat/${data.threadId}`);
        const dd = await rr.json();
        setThread(dd.thread);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, target]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages?.length]);

  const canSelectOwner = useMemo(() => typeof propertyId === "number", [propertyId]);

  const send = async () => {
    const text = msg.trim();
    if (!text || !thread) return;
    setMsg("");
    const optimistic: Thread = {
      ...thread,
      messages: [...thread.messages, { id: `tmp_${Date.now()}`, from: "user", text, at: new Date().toISOString() }]
    };
    setThread(optimistic);
    await fetch(`/api/chat/${thread.id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: text, from: "user" }) });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 flex items-end md:items-center justify-center">
      <div className="bg-white rounded-t-2xl md:rounded-2xl w-full md:max-w-lg max-h-[85vh] md:max-h-[80vh] overflow-hidden shadow-2xl">
        {/* رأس */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-3">
            <select
              className="border rounded px-2 py-1 text-sm"
              value={canSelectOwner && target === "owner" ? "owner" : "admin"}
              onChange={(e) => setTarget(e.target.value === "owner" ? "owner" : "admin")}
              disabled={!canSelectOwner}
              title={canSelectOwner ? "اختر جهة الدردشة" : "خيار المالك يظهر عند فتح الدردشة من صفحة عقار"}
            >
              <option value="admin">الإدارة <span>— <FaUserShield className="inline" /></span></option>
              <option value="owner">المالك <span>— <FaUserTie className="inline" /></span></option>
            </select>
            <div className="text-sm text-gray-600 line-clamp-1">{subject ?? "دردشة عامة"}</div>
          </div>
          <button onClick={closeChat} className="text-red-600"><FaTimes /></button>
        </div>

        {/* الرسائل */}
        <div className="px-3 py-2 overflow-auto" style={{ maxHeight: "55vh" }}>
          {loading && <div className="text-center py-8 text-gray-500">جاري التحميل…</div>}
          {!loading && thread?.messages?.map((m) => (
            <div key={m.id} className={`my-1 ${m.from === "user" ? "text-end" : ""}`}>
              <div className={`inline-block px-2 py-1 rounded ${m.from === "user" ? "bg-[var(--brand-800)] text-white" : "bg-gray-100"}`}>
                {m.text}
              </div>
              <div className="text-[10px] text-gray-500">{new Date(m.at).toLocaleString()}</div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* إدخال */}
        <div className="border-t p-2 flex gap-2">
          <input
            className="flex-1 border rounded p-2"
            placeholder="اكتب رسالتك…"
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") send(); }}
          />
          <button
            onClick={send}
            className="inline-flex items-center gap-2 px-4 py-2 rounded bg-[var(--brand-800)] hover:bg-[var(--brand-700)] text-white"
            title="إرسال"
          >
            <FaPaperPlane /> إرسال
          </button>
        </div>
      </div>
    </div>
  );
}
