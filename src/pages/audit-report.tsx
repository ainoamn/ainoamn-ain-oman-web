// src/pages/audit-report.tsx - صفحة عرض التقرير الشامل الكامل
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FaPrint, FaDownload, FaHome, FaChevronUp, FaSpinner } from 'react-icons/fa';
import { marked } from 'marked';

// Configure marked options
marked.setOptions({
  breaks: true,
  gfm: true,
});

export default function AuditReportPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    loadReport();
    
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadReport = async () => {
    try {
      const response = await fetch('/api/audit-report');
      if (response.ok) {
        const data = await response.json();
        setContent(data.content);
      }
    } catch (error) {
      console.error('Error loading report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">جاري تحميل التقرير...</p>
        </div>
      </div>
    );
  }

  // Convert Markdown to HTML using marked library
  const htmlContent = marked.parse(content);

  return (
    <>
      <Head>
        <title>التقرير الشامل للموقع - عين عُمان</title>
        <meta name="description" content="تقرير شامل ومفصل عن جميع صفحات ومكونات الموقع" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-50 print:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push('/')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="الرئيسية"
                >
                  <FaHome className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">التقرير الشامل للموقع</h1>
                  <p className="text-sm text-gray-500">عين عُمان - تقرير شامل ومفصل</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <FaPrint className="w-4 h-4" />
                  طباعة
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Scroll to Top Button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-8 left-8 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all print:hidden"
            title="العودة للأعلى"
          >
            <FaChevronUp className="w-5 h-5" />
          </button>
        )}

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div 
            className="bg-white rounded-lg shadow-sm p-8 print:shadow-none print:p-4 prose prose-lg max-w-none"
            dir="rtl"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </main>

        {/* Footer */}
        <footer className="bg-white border-t mt-12 py-6 print:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
            <p>© 2025 عين عُمان - جميع الحقوق محفوظة</p>
            <p className="mt-2">تاريخ التقرير: 23 يناير 2025</p>
          </div>
        </footer>
      </div>

      <style jsx global>{`
        @media print {
          @page {
            margin: 2cm;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:p-4 {
            padding: 1rem !important;
          }
        }
        
        .prose {
          color: #374151;
          line-height: 1.75;
        }
        
        .prose h1 {
          font-size: 2.25em;
          font-weight: 800;
          margin-top: 0;
          margin-bottom: 0.8888889em;
          line-height: 1.1111111;
          color: #111827;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 0.5em;
          page-break-after: avoid;
        }
        
        .prose h2 {
          font-size: 1.5em;
          font-weight: 700;
          margin-top: 2em;
          margin-bottom: 1em;
          line-height: 1.3333333;
          color: #111827;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 0.5em;
          page-break-after: avoid;
        }
        
        .prose h3 {
          font-size: 1.25em;
          font-weight: 600;
          margin-top: 1.6em;
          margin-bottom: 0.6em;
          line-height: 1.6;
          color: #111827;
        }
        
        .prose h4 {
          font-size: 1.1em;
          font-weight: 600;
          margin-top: 1.4em;
          margin-bottom: 0.5em;
          color: #111827;
        }
        
        .prose table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5em 0;
          font-size: 0.9em;
        }
        
        .prose table thead {
          background-color: #f3f4f6;
        }
        
        .prose table th {
          font-weight: 600;
          padding: 0.75em;
          text-align: right;
          border: 1px solid #e5e7eb;
        }
        
        .prose table td {
          padding: 0.75em;
          border: 1px solid #e5e7eb;
        }
        
        .prose table tbody tr:nth-child(even) {
          background-color: #f9fafb;
        }
        
        .prose ul, .prose ol {
          margin: 1.25em 0;
          padding-right: 1.625em;
        }
        
        .prose li {
          margin: 0.5em 0;
        }
        
        .prose code {
          background-color: #f3f4f6;
          padding: 0.2em 0.4em;
          border-radius: 0.25rem;
          font-size: 0.875em;
          font-family: monospace;
        }
        
        .prose pre {
          background-color: #1f2937;
          color: #f9fafb;
          padding: 1em;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1.5em 0;
        }
        
        .prose pre code {
          background-color: transparent;
          color: inherit;
          padding: 0;
        }
        
        .prose blockquote {
          border-right: 4px solid #3b82f6;
          padding-right: 1em;
          margin: 1.5em 0;
          font-style: italic;
          color: #6b7280;
        }
        
        .prose a {
          color: #3b82f6;
          text-decoration: underline;
        }
        
        .prose a:hover {
          color: #2563eb;
        }
        
        .prose p {
          margin: 1.25em 0;
        }
        
        .prose strong {
          font-weight: 600;
          color: #111827;
        }
        
        .page-break {
          page-break-after: always;
          break-after: page;
          margin: 2em 0;
        }
        
        .prose hr {
          border: none;
          border-top: 1px solid #e5e7eb;
          margin: 2em 0;
        }
      `}</style>
    </>
  );
}
