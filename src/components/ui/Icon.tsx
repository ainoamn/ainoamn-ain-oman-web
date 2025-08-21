import React from "react";

type IconName =
  | "building" | "map-pin" | "calendar" | "trending" | "save" | "print" | "eye" | "wand"
  | "plus" | "file-text" | "image" | "link" | "settings" | "shield" | "check"
  | "camera" | "upload" | "gavel" | "bookmark";

export function Icon({ name, className = "w-4 h-4", stroke = 1.8 }: { name: IconName; className?: string; stroke?: number }) {
  const props = { className, fill: "none", stroke: "currentColor", strokeWidth: stroke, strokeLinecap: "round", strokeLinejoin: "round" } as any;

  switch (name) {
    case "building": return (
      <svg viewBox="0 0 24 24" {...props}><path d="M3 21h18M5 21V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v14M9 21v-4h2v4M13 21v-6h2v6M7 9h6M7 12h6M7 15h6" /></svg>
    );
    case "map-pin": return (
      <svg viewBox="0 0 24 24" {...props}><path d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10Z"/><circle cx="12" cy="11" r="2.5"/></svg>
    );
    case "calendar": return (
      <svg viewBox="0 0 24 24" {...props}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
    );
    case "trending": return (
      <svg viewBox="0 0 24 24" {...props}><path d="M3 17l6-6 4 4 7-7"/><path d="M14 8h7v7"/></svg>
    );
    case "save": return (
      <svg viewBox="0 0 24 24" {...props}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h10l6 6v10a2 2 0 0 1-2 2Z"/><path d="M17 21V13H7v8"/><path d="M7 3v5h8"/></svg>
    );
    case "print": return (
      <svg viewBox="0 0 24 24" {...props}><path d="M6 9V3h12v6"/><rect x="6" y="13" width="12" height="8" rx="2"/><path d="M6 17H4a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2"/></svg>
    );
    case "eye": return (
      <svg viewBox="0 0 24 24" {...props}><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"/><circle cx="12" cy="12" r="3"/></svg>
    );
    case "wand": return (
      <svg viewBox="0 0 24 24" {...props}><path d="M15 4V2M15 10v-2M19 6h2M9 6H7M19.5 10.5l1.5 1.5M8.5 3.5 7 2M2 22l9-9"/></svg>
    );
    case "plus": return (
      <svg viewBox="0 0 24 24" {...props}><path d="M12 5v14M5 12h14"/></svg>
    );
    case "file-text": return (
      <svg viewBox="0 0 24 24" {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12V8Z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>
    );
    case "image": return (
      <svg viewBox="0 0 24 24" {...props}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
    );
    case "link": return (
      <svg viewBox="0 0 24 24" {...props}><path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 1 0-7.07-7.07L11 4"/><path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 0 0 7.07 7.07L13 20"/></svg>
    );
    case "settings": return (
      <svg viewBox="0 0 24 24" {...props}><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 1 1 7.04 3.3l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51c.6.25 1.29.11 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c0 .63.37 1.21.94 1.51.57.3 1.24.26 1.76-.09"/></svg>
    );
    case "shield": return (
      <svg viewBox="0 0 24 24" {...props}><path d="M12 2l7 4v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-4z"/></svg>
    );
    case "check": return (
      <svg viewBox="0 0 24 24" {...props}><path d="M20 6 9 17l-5-5"/></svg>
    );
    case "camera": return (
      <svg viewBox="0 0 24 24" {...props}><path d="M4 7h3l2-2h6l2 2h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z"/><circle cx="12" cy="13" r="4"/></svg>
    );
    case "upload": return (
      <svg viewBox="0 0 24 24" {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/></svg>
    );
    case "gavel": return (
      <svg viewBox="0 0 24 24" {...props}><path d="M14 4l6 6M3 21h7M7 14l4-4M8 13l6-6"/><path d="M9 7l4 4"/></svg>
    );
    case "bookmark": return (
      <svg viewBox="0 0 24 24" {...props}><path d="M6 2h12a1 1 0 0 1 1 1v19l-7-4-7 4V3a1 1 0 0 1 1-1Z"/></svg>
    );
    default: return null;
  }
}
