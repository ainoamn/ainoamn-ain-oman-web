// src/components/layout/MainLayout.tsx
import React from "react";
import EnhancedHeader from "./EnhancedHeader";
import EnhancedFooter from "./EnhancedFooter";
import { LayoutScopeProvider } from "@/contexts/LayoutScope";

interface Props {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
}

export default function MainLayout({
  children,
  showHeader = true,
  showFooter = true,
}: Props) {
  return (
    <LayoutScopeProvider value={{ global: true }}>
      <div className="flex flex-col min-h-screen">
        {showHeader && <EnhancedHeader force />}
        <main className="flex-grow bg-gray-50">{children}</main>
        {showFooter && <EnhancedFooter force />}
      </div>
    </LayoutScopeProvider>
  );
}
