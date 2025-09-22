import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export function PreviewModal({
  open,
  onClose,
  title = "معاينة",
  children
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState({ x: 80, y: 80 });
  const [size, setSize] = useState({ w: 720, h: 480 });
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!dragging.current) return;
      const dx = e.clientX - last.current.x;
      const dy = e.clientY - last.current.y;
      last.current = { x: e.clientX, y: e.clientY };
      setPos((p) => ({ x: Math.max(0, p.x + dx), y: Math.max(0, p.y + dy) }));
    }
    function onUp() { dragging.current = false; }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  if (!mounted || !open) return null;

  const modal = (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div
        className="absolute bg-white rounded-2xl shadow-2xl ring-1 ring-slate-200 overflow-hidden flex flex-col"
        style={{ left: pos.x, top: pos.y, width: size.w, height: size.h }}
      >
        <div
          className="cursor-move bg-slate-800 text-white px-4 py-2 flex items-center justify-between"
          onMouseDown={(e) => {
            dragging.current = true;
            last.current = { x: e.clientX, y: e.clientY };
          }}
        >
          <span className="font-semibold text-sm">{title}</span>
          <button onClick={onClose} className="rounded-lg bg-white/10 px-3 py-1 text-xs">إغلاق</button>
        </div>
        <div className="flex-1 overflow-auto p-4">{children}</div>
        <div className="p-2 border-t flex">
          <div className="ms-auto h-3 w-3 cursor-se-resize rounded bg-slate-300"
            onMouseDown={(e) => {
              const start = { x: e.clientX, y: e.clientY, w: size.w, h: size.h };
              const onMove = (ev: MouseEvent) => {
                const dx = ev.clientX - start.x;
                const dy = ev.clientY - start.y;
                setSize({ w: Math.max(360, start.w + dx), h: Math.max(240, start.h + dy) });
              };
              const onUp = () => {
                window.removeEventListener("mousemove", onMove);
                window.removeEventListener("mouseup", onUp);
              };
              window.addEventListener("mousemove", onMove);
              window.addEventListener("mouseup", onUp);
            }}
          />
        </div>
      </div>
    </div>
  );
  return createPortal(modal, document.body);
}