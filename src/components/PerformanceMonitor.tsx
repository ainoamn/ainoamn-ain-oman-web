// src/components/PerformanceMonitor.tsx
// مراقب الأداء المباشر للمطورين ⚡

"use client";

import React, { useState, useEffect } from 'react';
import { usePerformance } from '@/context/PerformanceContext';
import { formatDuration, formatBytes, getWebVitalsScore } from '@/lib/performance';
import {
  XMarkIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  SignalIcon,
  ClockIcon,
  ServerIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';

interface PerformanceMonitorProps {
  enabled?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

/**
 * PerformanceMonitor - مراقب الأداء المباشر
 * 
 * مكون للمطورين لمراقبة الأداء في الوقت الفعلي
 * يظهر فقط في بيئة التطوير
 */
export default function PerformanceMonitor({
  enabled = process.env.NODE_ENV === 'development',
  position = 'bottom-right',
}: PerformanceMonitorProps) {
  const {
    isOnline,
    connectionType,
    performanceMetrics,
    cacheSize,
    isServiceWorkerReady,
  } = usePerformance();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);

  if (!enabled) return null;

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  const getScoreColor = (score: 'good' | 'needs-improvement' | 'poor') => {
    if (score === 'good') return 'text-green-500';
    if (score === 'needs-improvement') return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: 'good' | 'needs-improvement' | 'poor') => {
    if (score === 'good') return 'bg-green-100';
    if (score === 'needs-improvement') return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed ${positionClasses[position]} z-[9999] p-3 bg-gray-900 text-white rounded-full shadow-lg hover:bg-gray-800 transition-all`}
        title="فتح مراقب الأداء"
      >
        <SignalIcon className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div
      className={`fixed ${positionClasses[position]} z-[9999] bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 transition-all ${
        isMinimized ? 'w-64' : 'w-96'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <SignalIcon className="w-5 h-5 text-blue-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            مراقب الأداء
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title={isMinimized ? 'توسيع' : 'تصغير'}
          >
            {isMinimized ? (
              <ChevronUpIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title="إغلاق"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
          {/* Connection Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                حالة الاتصال
              </span>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isOnline ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {isOnline ? 'متصل' : 'غير متصل'}
                </span>
              </div>
            </div>
            {connectionType && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  نوع الاتصال
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {connectionType.toUpperCase()}
                </span>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700" />

          {/* Web Vitals */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <ClockIcon className="w-4 h-4" />
              Web Vitals
            </h4>

            {/* FCP */}
            {performanceMetrics.fcp !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  FCP
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-medium ${getScoreColor(
                      getWebVitalsScore('FCP', performanceMetrics.fcp)
                    )}`}
                  >
                    {Math.round(performanceMetrics.fcp)}ms
                  </span>
                  <div
                    className={`w-2 h-2 rounded-full ${getScoreBg(
                      getWebVitalsScore('FCP', performanceMetrics.fcp)
                    )}`}
                  />
                </div>
              </div>
            )}

            {/* LCP */}
            {performanceMetrics.lcp !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  LCP
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-medium ${getScoreColor(
                      getWebVitalsScore('LCP', performanceMetrics.lcp)
                    )}`}
                  >
                    {Math.round(performanceMetrics.lcp)}ms
                  </span>
                  <div
                    className={`w-2 h-2 rounded-full ${getScoreBg(
                      getWebVitalsScore('LCP', performanceMetrics.lcp)
                    )}`}
                  />
                </div>
              </div>
            )}

            {/* FID */}
            {performanceMetrics.fid !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  FID
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-medium ${getScoreColor(
                      getWebVitalsScore('FID', performanceMetrics.fid)
                    )}`}
                  >
                    {Math.round(performanceMetrics.fid)}ms
                  </span>
                  <div
                    className={`w-2 h-2 rounded-full ${getScoreBg(
                      getWebVitalsScore('FID', performanceMetrics.fid)
                    )}`}
                  />
                </div>
              </div>
            )}

            {/* CLS */}
            {performanceMetrics.cls !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  CLS
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-medium ${getScoreColor(
                      getWebVitalsScore('CLS', performanceMetrics.cls)
                    )}`}
                  >
                    {performanceMetrics.cls.toFixed(3)}
                  </span>
                  <div
                    className={`w-2 h-2 rounded-full ${getScoreBg(
                      getWebVitalsScore('CLS', performanceMetrics.cls)
                    )}`}
                  />
                </div>
              </div>
            )}

            {/* TTFB */}
            {performanceMetrics.ttfb !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  TTFB
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-medium ${getScoreColor(
                      getWebVitalsScore('TTFB', performanceMetrics.ttfb)
                    )}`}
                  >
                    {Math.round(performanceMetrics.ttfb)}ms
                  </span>
                  <div
                    className={`w-2 h-2 rounded-full ${getScoreBg(
                      getWebVitalsScore('TTFB', performanceMetrics.ttfb)
                    )}`}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700" />

          {/* Cache & Service Worker */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <ServerIcon className="w-4 h-4" />
              التخزين المؤقت
            </h4>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Service Worker
              </span>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isServiceWorkerReady ? 'bg-green-500' : 'bg-gray-500'
                  }`}
                />
                <span className="text-xs font-medium text-gray-900 dark:text-white">
                  {isServiceWorkerReady ? 'جاهز' : 'غير جاهز'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                حجم Cache
              </span>
              <span className="text-xs font-medium text-gray-900 dark:text-white">
                {formatBytes(cacheSize)}
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-100" />
                <span className="text-gray-600 dark:text-gray-400">جيد</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-yellow-100" />
                <span className="text-gray-600 dark:text-gray-400">متوسط</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-100" />
                <span className="text-gray-600 dark:text-gray-400">ضعيف</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * DevPerformanceWidget - عرض سريع للأداء في بيئة التطوير
 */
export function DevPerformanceWidget() {
  const { performanceMetrics, isOnline } = usePerformance();

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 text-white text-xs p-2 z-[9998] flex items-center justify-center gap-6">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
        <span>{isOnline ? 'Online' : 'Offline'}</span>
      </div>
      {performanceMetrics.fcp && (
        <span>FCP: {Math.round(performanceMetrics.fcp)}ms</span>
      )}
      {performanceMetrics.lcp && (
        <span>LCP: {Math.round(performanceMetrics.lcp)}ms</span>
      )}
      {performanceMetrics.cls !== undefined && (
        <span>CLS: {performanceMetrics.cls.toFixed(3)}</span>
      )}
    </div>
  );
}


