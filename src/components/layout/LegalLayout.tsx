// src/components/layout/LegalLayout.tsx
import React from "react";
import EnhancedHeader from "./EnhancedHeader";
import EnhancedFooter from "./EnhancedFooter";
import { LayoutScopeProvider } from "@/contexts/LayoutScope";

interface LegalLayoutProps {
  children: React.ReactNode;
}

const LegalLayout: React.FC<LegalLayoutProps> = ({ children }) => {
  return (
    <LayoutScopeProvider value={{ global: true }}>
      <div className="flex flex-col min-h-screen">
        <EnhancedHeader />
        <main className="flex-grow bg-gray-50">
          <div className="container mx-auto px-4 py-8">{children}</div>
        </main>
        <EnhancedFooter />
      </div>
    </LayoutScopeProvider>
  );
};

export default LegalLayout;
