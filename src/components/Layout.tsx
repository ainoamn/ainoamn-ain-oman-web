// src/components/Layout.tsx
import React from "react";

// Compatibility import: works whether Header/Footer are default or named exports
import * as HeaderMod from "@/components/layout/Header";
import * as FooterMod from "@/components/layout/Footer";
const Header: React.ComponentType<any> = (HeaderMod as any).default ?? (HeaderMod as any).Header;
const Footer: React.ComponentType<any> = (FooterMod as any).default ?? (FooterMod as any).Footer;

type Props = { children: React.ReactNode };

export default function Layout({ children }: Props) {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
      <Footer />
    </div>
  );
}
