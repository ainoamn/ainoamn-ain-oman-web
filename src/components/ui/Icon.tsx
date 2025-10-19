// @ts-nocheck
// src/components/ui/Icon.tsx
import React from "react";

interface IconProps {
  name: string;
  stroke?: number;
  className?: string;
  [key: string]: any;
}

type Props = IconProps;

const MAP: Record<string, (p: any)=>React.ReactElement> = {
  "arrow-left": (p)=>(<svg viewBox="0 0 24 24" {...p}><path d="M12 19l-7-7 7-7"/><path d="M19 12H5"/></svg>),
  "search": (p)=>(<svg viewBox="0 0 24 24" {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>),
  "trash": (p)=>(<svg viewBox="0 0 24 24" {...p}><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>),
  "x": (p)=>(<svg viewBox="0 0 24 24" {...p}><path d="M18 6L6 18M6 6l12 12"/></svg>),
  "plus": (p)=>(<svg viewBox="0 0 24 24" {...p}><path d="M12 5v14M5 12h14"/></svg>),
  "file-text": (p)=>(<svg viewBox="0 0 24 24" {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12V8Z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>),
  "calendar-days": (p)=>(<svg viewBox="0 0 24 24" {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>),
  "bell": (p)=>(<svg viewBox="0 0 24 24" {...p}><path d="M6 8a6 6 0 0 1 12 0v5l2 2H4l2-2Z"/><path d="M10 19a2 2 0 0 0 4 0"/></svg>),
  "users": (p)=>(<svg viewBox="0 0 24 24" {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>),
  "home": (p)=>(<svg viewBox="0 0 24 24" {...p}><path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z"/></svg>),
  "gavel": (p)=>(<svg viewBox="0 0 24 24" {...p}><path d="M14 4l6 6M7 14l6-6M3 21h7"/></svg>),
  "handshake": (p)=>(<svg viewBox="0 0 24 24" {...p}><path d="M8 12l4 4 4-4"/><path d="M2 12l6-6 4 4 4-4 6 6"/></svg>),
  "star": (p)=>(<svg viewBox="0 0 24 24" {...p}><path d="M12 17.3l6.18 3.7-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>),
  "receipt": (p)=>(<svg viewBox="0 0 24 24" {...p}><path d="M4 2h16v20l-3-2-3 2-3-2-3 2-4-2z"/><path d="M8 7h8M8 11h8M8 15h8"/></svg>),
  "badge-dollar-sign": (p)=>(<svg viewBox="0 0 24 24" {...p}><circle cx="12" cy="12" r="9"/><path d="M12 6v12M15 9a3 3 0 1 0-3 3 3 3 0 1 1-3 3"/></svg>),
  "megaphone": (p)=>(<svg viewBox="0 0 24 24" {...p}><path d="M3 11l14-5v12L3 13v-2z"/><path d="M7 14v4a2 2 0 0 0 2 2h2"/></svg>),
  "tickets": (p)=>(<svg viewBox="0 0 24 24" {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 5v14M17 5v14"/></svg>),
  "bot": (p)=>(<svg viewBox="0 0 24 24" {...p}><rect x="6" y="8" width="12" height="10" rx="2"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M12 8V4M10 4h4"/></svg>),
  "chart-line": (p)=>(<svg viewBox="0 0 24 24" {...p}><path d="M3 3v18h18"/><path d="M19 7l-6 6-4-4-4 4"/></svg>),
  "languages": (p)=>(<svg viewBox="0 0 24 24" {...p}><path d="M5 8h14M12 6v12"/><path d="M7 20l5-14 5 14"/></svg>),
  "settings": (p)=>(<svg viewBox="0 0 24 24" {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a2 2 0 0 0 .33 2.18l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a2 2 0 0 0-2.18-.33 2 2 0 0 0-1 1.73V22a2 2 0 1 1-4 0v-.09a2 2 0 0 0-1-1.73 2 2 0 0 0-2.18.33l-.06.06A2 2 0 1 1 4.2 17.2l.06-.06a2 2 0 0 0 .33-2.18 2 2 0 0 0-1.73-1H2a2 2 0 1 1 0-4h.09a2 2 0 0 0 1.73-1 2 2 0 0 0-.33-2.18l-.06-.06A2 2 0 1 1 6.8 4.2l.06.06a2 2 0 0 0 2.18.33H9a2 2 0 0 0 1-1.73V2a2 2 0 1 1 4 0v.09c0 .72.39 1.38 1 1.73.63.25 1.35.11 1.86-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a2 2 0 0 0-.33 2.18V9c0 .74.41 1.42 1.06 1.78"/></svg>),
  "code": (p)=>(<svg viewBox="0 0 24 24" {...p}><path d="M16 18l6-6-6-6"/><path d="M8 6L2 12l6 6"/></svg>),
  "user-cog": (p)=>(<svg viewBox="0 0 24 24" {...p}><circle cx="8" cy="8" r="4"/><path d="M2 22a6 6 0 0 1 12 0"/><path d="M19.4 15a2 2 0 0 0 .33 2.18"/><path d="M22 12h-2"/></svg>)
};

export default function Icon(props: Props) {
  const { name, stroke = 1.8, className = "h-5 w-5", ...rest } = props;
  const common: any = { fill: "none", stroke: "currentColor", strokeWidth: stroke, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, className, ...rest };
  const render = MAP[name];
  if (render) return render(common);
  return <svg viewBox="0 0 24 24" {...common}><circle cx="12" cy="12" r="9"/></svg>;
}
