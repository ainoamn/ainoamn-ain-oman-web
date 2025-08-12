// src/context/ChatContext.tsx
import { createContext, useContext, useMemo, useState, ReactNode } from "react";

export type ChatTarget = "owner" | "admin";

export type ChatOpenOptions = {
  target?: ChatTarget;
  propertyId?: number;
  subject?: string;
  pageUrl?: string;
};

type ChatCtx = {
  isOpen: boolean;
  target: ChatTarget;
  propertyId?: number;
  subject?: string;
  openChat: (opts?: ChatOpenOptions) => void;
  closeChat: () => void;
  setTarget: (t: ChatTarget) => void;
};

const ChatContext = createContext<ChatCtx | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const [target, setTarget] = useState<ChatTarget>("admin");
  const [propertyId, setPropertyId] = useState<number | undefined>();
  const [subject, setSubject] = useState<string | undefined>();

  const openChat = (opts?: ChatOpenOptions) => {
    if (opts?.target) setTarget(opts.target);
    setPropertyId(opts?.propertyId);
    setSubject(opts?.subject);
    setOpen(true);
  };

  const closeChat = () => setOpen(false);

  const value = useMemo(
    () => ({ isOpen, target, propertyId, subject, openChat, closeChat, setTarget }),
    [isOpen, target, propertyId, subject]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}
