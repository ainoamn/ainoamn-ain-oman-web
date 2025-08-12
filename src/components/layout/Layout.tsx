// src/components/layout/Layout.tsx
import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col page-vanilla vanilla-pattern dark:bg-gray-900 dark:vanilla-none text-gray-900 dark:text-white transition-colors">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-7xl px-3 sm:px-4 lg:px-6 py-6 brand-scope">
        {children}
      </main>
      <Footer />
    </div>
  );
}
