// src/hooks/useFeature.ts - Hook للتحقق من الميزات
import { useState, useEffect } from 'react';
import { FeatureId, UserRole } from '@/types/features';

interface UseFeatureContext {
  userId?: string;
  userRole?: UserRole;
  propertyId?: string;
  organizationId?: string;
  country?: string;
  subscription?: string;
}

export function useFeature(
  featureId: FeatureId,
  context?: UseFeatureContext
): {
  enabled: boolean;
  loading: boolean;
  error: Error | null;
} {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const checkFeature = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/features/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ featureId, context }),
        });

        if (!response.ok) {
          throw new Error('Failed to check feature');
        }

        const data = await response.json();
        if (mounted) {
          setEnabled(data.enabled);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error);
          setEnabled(false);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkFeature();

    return () => {
      mounted = false;
    };
  }, [featureId, JSON.stringify(context)]);

  return { enabled, loading, error };
}

// Hook للتحقق من عدة ميزات
export function useFeatures(
  featureIds: FeatureId[],
  context?: UseFeatureContext
): Record<FeatureId, boolean> {
  const [features, setFeatures] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const checkFeatures = async () => {
      const results: Record<string, boolean> = {};
      
      for (const featureId of featureIds) {
        try {
          const response = await fetch('/api/features/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ featureId, context }),
          });
          
          if (response.ok) {
            const data = await response.json();
            results[featureId] = data.enabled;
          } else {
            results[featureId] = false;
          }
        } catch {
          results[featureId] = false;
        }
      }
      
      setFeatures(results);
    };

    checkFeatures();
  }, [JSON.stringify(featureIds), JSON.stringify(context)]);

  return features as Record<FeatureId, boolean>;
}






