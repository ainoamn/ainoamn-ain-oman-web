// src/components/layout/LegalLayout.tsx
import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import { LayoutScopeProvider } from "@/contexts/LayoutScope";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <LayoutScopeProvider value={{ global: true }}>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow bg-gray-50">
          <div className="container mx-auto px-4 py-8">{children}</div>
        </main>
        <Footer />
      </div>
    </LayoutScopeProvider>
  );
}
