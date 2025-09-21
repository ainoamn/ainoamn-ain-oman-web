// src/components/layout/MainLayout.tsx
import React from "react";
import EnhancedHeader from "./EnhancedHeader";
import EnhancedFooter from "./EnhancedFooter";
import { LayoutScopeProvider } from "@/contexts/LayoutScope";

interface MainLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  showHeader = true,
  showFooter = true,
}) => {
  return (
    <LayoutScopeProvider value={{ global: true }}>
      <div className="flex flex-col min-h-screen">
        {showHeader && <EnhancedHeader />}
        <main className="flex-grow bg-gray-50">{children}</main>
        {showFooter && <EnhancedFooter />}
      </div>
    </LayoutScopeProvider>
  );
};

export default MainLayout;
