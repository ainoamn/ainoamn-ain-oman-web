// src/components/dashboard/UnifiedDashboardLayout.tsx
// تصميم موحد لجميع لوحات التحكم
import React, { ReactNode } from 'react';
import Head from 'next/head';

interface UnifiedDashboardLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
  headerActions?: ReactNode;
}

export default function UnifiedDashboardLayout({
  title,
  description,
  children,
  headerActions
}: UnifiedDashboardLayoutProps) {
  return (
    <>
      <Head>
        <title>{title} | عين عُمان</title>
        {description && <meta name="description" content={description} />}
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        {/* Header موحد */}
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                {description && (
                  <p className="text-sm text-gray-600 mt-1">{description}</p>
                )}
              </div>
              {headerActions && (
                <div className="flex items-center space-x-3 space-x-reverse">
                  {headerActions}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </>
  );
}
