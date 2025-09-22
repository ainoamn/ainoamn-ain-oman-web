// src/components/layout/LegalLayout.tsx
import React from "react";
import EnhancedHeader from "./EnhancedHeader";
import EnhancedFooter from "./EnhancedFooter";
import { LayoutScopeProvider } from "@/contexts/LayoutScope";
function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <LayoutScopeProvider value={{ global: true }}>
      <div className="flex flex-col min-h-screen">
        <EnhancedHeader force />
        <main className="flex-grow bg-gray-50">
          <div className="container mx-auto px-4 py-8">{children}</div>
        </main>
        <EnhancedFooter force />
      </div>
    </LayoutScopeProvider>
  );
}
