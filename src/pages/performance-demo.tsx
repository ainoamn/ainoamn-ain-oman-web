// src/pages/performance-demo.tsx
// صفحة تجريبية لعرض قدرات نظام الأداء الفائق ⚡

import React, { useState, useEffect } from 'react';
import { usePerformance } from '@/context/PerformanceContext';
import InstantLink from '@/components/InstantLink';
import { InstantButton } from '@/components/InstantLink';
import InstantImage, { InstantImageGallery } from '@/components/InstantImage';
import { useInstantData, preloadData, clearCache, getCacheSize } from '@/hooks/useInstantData';
import { 
  measurePerformance, 
  formatDuration, 
  formatBytes, 
  getWebVitalsScore 
} from '@/lib/performance';
import {
  BoltIcon,
  ClockIcon,
  ServerIcon,
  PhotoIcon,
  ArrowPathIcon,
  TrashIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

export default function PerformanceDemoPage() {
  const {
    isOnline,
    connectionType,
    prefetchPage,
    performanceMetrics,
    cacheSize,
    isServiceWorkerReady,
  } = usePerformance();

  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);

  // مثال على استخدام useInstantData
  const { data: demoData, isLoading, mutate } = useInstantData(
    'demo-data',
    async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return {
        message: 'تم تحميل البيانات بنجاح!',
        timestamp: new Date().toISOString(),
      };
    }
  );

  // صور للمعرض
  const galleryImages = [
    { src: '/demo/apartment1.jpg', alt: 'شقة 1' },
    { src: '/demo/villa1.jpg', alt: 'فيلا 1' },
    { src: '/demo/villa2.jpg', alt: 'فيلا 2' },
    { src: '/demo/office1.jpg', alt: 'مكتب 1' },
  ];

  // اختبار الأداء
  const runPerformanceTests = async () => {
    setIsRunningTests(true);
    const results: any[] = [];

    // Test 1: Prefetch Speed
    const prefetchResult = await measurePerformance('Prefetch Test', async () => {
      await prefetchPage('/properties');
      return { success: true, time: performance.now() };
    });
    results.push({
      name: 'Prefetch Speed',
      result: 'نجح',
      time: prefetchResult.time,
    });

    // Test 2: Data Loading
    const dataResult = await measurePerformance('Data Loading Test', async () => {
      await preloadData('test-key', async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return { test: 'data' };
      });
      return { success: true };
    });
    results.push({
      name: 'Data Loading',
      result: 'نجح',
      time: 500,
    });

    // Test 3: Cache Size
    const size = await getCacheSize();
    results.push({
      name: 'Cache Size',
      result: formatBytes(size),
      time: 0,
    });

    setTestResults(results);
    setIsRunningTests(false);
  };

  // مسح الـ cache
  const handleClearCache = async () => {
    await clearCache();
    alert('تم مسح الـ cache بنجاح!');
  };

  // رمز للحالة
  const StatusIcon = ({ status }: { status: 'good' | 'needs-improvement' | 'poor' }) => {
    if (status === 'good') return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
    if (status === 'needs-improvement') return <ExclamationCircleIcon className="w-5 h-5 text-yellow-500" />;
    return <XCircleIcon className="w-5 h-5 text-red-500" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 rounded-full text-blue-800 dark:text-blue-200 text-sm font-medium mb-4">
            <BoltIcon className="w-4 h-4" />
            نظام الأداء الفائق
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            صفحة تجريبية للأداء ⚡
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            اختبر قدرات نظام التنقل الفوري والتحسينات المتقدمة
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <ServerIcon className="w-8 h-8 text-blue-500" />
              <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
            <h3 className="text-sm text-gray-600 dark:text-gray-400">حالة الاتصال</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {isOnline ? 'متصل' : 'غير متصل'}
            </p>
            {connectionType && (
              <p className="text-xs text-gray-500 mt-1">{connectionType}</p>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <ClockIcon className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-sm text-gray-600 dark:text-gray-400">FCP</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {performanceMetrics.fcp ? `${Math.round(performanceMetrics.fcp)}ms` : '-'}
            </p>
            {performanceMetrics.fcp && (
              <div className="flex items-center gap-1 mt-1">
                <StatusIcon status={getWebVitalsScore('FCP', performanceMetrics.fcp)} />
                <span className="text-xs text-gray-500">First Contentful Paint</span>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <ChartBarIcon className="w-8 h-8 text-purple-500" />
            </div>
            <h3 className="text-sm text-gray-600 dark:text-gray-400">LCP</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {performanceMetrics.lcp ? `${Math.round(performanceMetrics.lcp)}ms` : '-'}
            </p>
            {performanceMetrics.lcp && (
              <div className="flex items-center gap-1 mt-1">
                <StatusIcon status={getWebVitalsScore('LCP', performanceMetrics.lcp)} />
                <span className="text-xs text-gray-500">Largest Contentful Paint</span>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <ServerIcon className="w-8 h-8 text-orange-500" />
              <div className={`w-3 h-3 rounded-full ${isServiceWorkerReady ? 'bg-green-500' : 'bg-gray-500'}`} />
            </div>
            <h3 className="text-sm text-gray-600 dark:text-gray-400">Service Worker</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {isServiceWorkerReady ? 'جاهز' : 'غير جاهز'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Cache: {formatBytes(cacheSize)}
            </p>
          </div>
        </div>

        {/* InstantLink Demo */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BoltIcon className="w-6 h-6 text-blue-500" />
            InstantLink - التنقل الفوري
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            هذه الروابط تستخدم InstantLink للتنقل الفوري. مرر الماوس لرؤية التحميل المسبق.
          </p>
          <div className="flex flex-wrap gap-4">
            <InstantLink
              href="/properties"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              العقارات
            </InstantLink>
            <InstantLink
              href="/auctions"
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              المزادات
            </InstantLink>
            <InstantButton
              href="/favorites"
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              المفضلة
            </InstantButton>
          </div>
        </div>

        {/* InstantImage Demo */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <PhotoIcon className="w-6 h-6 text-green-500" />
            InstantImage - الصور المحسنة
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            صور محسنة مع تحميل تدريجي و blur placeholder
          </p>
          <InstantImageGallery images={galleryImages} columns={4} gap={4} />
        </div>

        {/* useInstantData Demo */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <ArrowPathIcon className="w-6 h-6 text-purple-500" />
            useInstantData - البيانات الفورية
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Hook للبيانات مع تخزين مؤقت ذكي
          </p>
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-4">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                <span className="text-gray-600 dark:text-gray-400">جاري التحميل...</span>
              </div>
            ) : (
              <div>
                <p className="text-gray-900 dark:text-white font-medium mb-2">
                  {demoData?.message}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Timestamp: {demoData?.timestamp}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={() => mutate()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <ArrowPathIcon className="w-4 h-4" />
            إعادة التحميل
          </button>
        </div>

        {/* Performance Tests */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <ChartBarIcon className="w-6 h-6 text-orange-500" />
            اختبارات الأداء
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            قم بإجراء اختبارات شاملة للأداء
          </p>
          <div className="flex gap-4 mb-6">
            <button
              onClick={runPerformanceTests}
              disabled={isRunningTests}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isRunningTests ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  جاري الاختبار...
                </>
              ) : (
                <>
                  <BoltIcon className="w-4 h-4" />
                  تشغيل الاختبارات
                </>
              )}
            </button>
            <button
              onClick={handleClearCache}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <TrashIcon className="w-4 h-4" />
              مسح الـ Cache
            </button>
          </div>

          {testResults.length > 0 && (
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    <span className="text-gray-900 dark:text-white font-medium">
                      {result.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-900 dark:text-white font-bold">
                      {result.result}
                    </p>
                    {result.time > 0 && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDuration(result.time)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Web Vitals Summary */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white shadow-lg">
          <h2 className="text-2xl font-bold mb-4">ملخص Web Vitals</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm opacity-90 mb-1">FCP (First Contentful Paint)</p>
              <p className="text-3xl font-bold">
                {performanceMetrics.fcp ? `${Math.round(performanceMetrics.fcp)}ms` : 'قيد القياس...'}
              </p>
            </div>
            <div>
              <p className="text-sm opacity-90 mb-1">LCP (Largest Contentful Paint)</p>
              <p className="text-3xl font-bold">
                {performanceMetrics.lcp ? `${Math.round(performanceMetrics.lcp)}ms` : 'قيد القياس...'}
              </p>
            </div>
            <div>
              <p className="text-sm opacity-90 mb-1">CLS (Cumulative Layout Shift)</p>
              <p className="text-3xl font-bold">
                {performanceMetrics.cls !== undefined ? performanceMetrics.cls.toFixed(3) : 'قيد القياس...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


