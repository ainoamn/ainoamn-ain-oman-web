// src/components/floating/FloatingButtons.tsx
import { useEffect, useState } from "react";
import { FaComments, FaWhatsapp } from 'react-icons/fa';
import { useChat } from "../../context/ChatContext";

export default function FloatingButtons() {
  const { openChat } = useChat();
  const [href, setHref] = useState<string>("#");

  useEffect(() => {
    const admin = process.env.NEXT_PUBLIC_WHATSAPP_ADMIN || ""; // مثال: "9689XXXXXXXX"
    const text = encodeURIComponent("مرحبًا، أحتاج مساعدة عبر عين عُمان.");
    setHref(admin ? `https://wa.me/${admin}?text=${text}` : "#");
  }, []);

  return (
    <div className="fixed bottom-4 end-4 z-[55] flex flex-col items-end gap-3">
      {/* زر الدردشة الداخلية */}
      <button
        onClick={() => openChat({ target: "admin", subject: "دردشة مع الإدارة" })}
        className="shadow-lg rounded-full w-14 h-14 inline-flex items-center justify-center bg-[var(--brand-800)] hover:bg-[var(--brand-700)] text-white"
        title="دردشة مباشرة"
      >
        <FaComments size={20} />
      </button>

      {/* زر واتساب (الإدارة فقط) */}
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="shadow-lg rounded-full w-14 h-14 inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white"
        title="واتساب الإدارة"
      >
        <FaWhatsapp size={22} />
      </a>
    </div>
  );
}
