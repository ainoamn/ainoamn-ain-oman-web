// src/components/dashboard/ProfessionalDashboardLayout.tsx
// تصميم احترافي ومريح للعين لجميع لوحات التحكم
import React, { ReactNode } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';

interface ProfessionalDashboardLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
  headerActions?: ReactNode;
  gradient?: 'blue' | 'purple' | 'green' | 'orange';
}

const gradients = {
  blue: 'from-blue-50 via-indigo-50 to-purple-50',
  purple: 'from-purple-50 via-pink-50 to-rose-50',
  green: 'from-emerald-50 via-teal-50 to-cyan-50',
  orange: 'from-orange-50 via-amber-50 to-yellow-50'
};

export default function ProfessionalDashboardLayout({
  title,
  description,
  children,
  headerActions,
  gradient = 'blue'
}: ProfessionalDashboardLayoutProps) {
  return (
    <>
      <Head>
        <title>{title} | عين عُمان</title>
        {description && <meta name="description" content={description} />}
      </Head>
      
      <div className={`min-h-screen bg-gradient-to-br ${gradients[gradient]} relative overflow-hidden`}>
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-200/20 to-rose-200/20 rounded-full blur-3xl"></div>
        </div>

        {/* Header with glassmorphism */}
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="relative backdrop-blur-xl bg-white/70 border-b border-white/20 shadow-lg shadow-black/5 sticky top-0 z-50"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex-1">
                <motion.h1 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent"
                >
                  {title}
                </motion.h1>
                {description && (
                  <motion.p 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-xs text-gray-600 mt-1 font-medium"
                  >
                    {description}
                  </motion.p>
                )}
              </div>
              {headerActions && (
                <motion.div 
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-3"
                >
                  {headerActions}
                </motion.div>
              )}
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </>
  );
}
