// src/components/common/FeatureGate.tsx - بوابة الميزات
import React from 'react';
import { useFeature } from '@/hooks/useFeature';
import { FeatureId } from '@/types/features';
import { FaSpinner, FaLock } from 'react-icons/fa';

interface FeatureGateProps {
  feature: FeatureId;
  fallback?: React.ReactNode;
  showLockedMessage?: boolean;
  context?: {
    userId?: string;
    userRole?: string;
    propertyId?: string;
  };
  children: React.ReactNode;
}

export default function FeatureGate({
  feature,
  fallback,
  showLockedMessage = false,
  context,
  children,
}: FeatureGateProps) {
  const { enabled, loading } = useFeature(feature, context);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <FaSpinner className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (!enabled) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showLockedMessage) {
      return (
        <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-center">
            <FaLock className="text-4xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">هذه الميزة غير متاحة حالياً</p>
          </div>
        </div>
      );
    }

    return null;
  }

  return <>{children}</>;
}






