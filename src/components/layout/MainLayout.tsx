// src/components/layout/MainLayout.tsx
import React from "react";
import Header from "./Header";
import Footer from "./Footer";

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
    <div className="flex flex-col min-h-screen">
      {showHeader && <Header />}
      <main className="flex-grow bg-gray-50">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
}
