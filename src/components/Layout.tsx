import React from "react";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ children }:{children: React.ReactNode}) {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
      <Footer />
    </div>
  );
}