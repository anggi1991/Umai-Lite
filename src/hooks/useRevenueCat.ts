/**
 * useRevenueCat Hook
 * 
 * React hook for managing RevenueCat subscription state
 * Provides real-time entitlement checking and subscription status
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getCustomerInfo,
  hasProEntitlement,
  getSubscriptionStatus,
  addCustomerInfoUpdateListener,
  type SubscriptionStatus,
} from '../services/revenueCatService';
import type { CustomerInfo } from 'react-native-purchases';

interface UseRevenueCatReturn {
  isLoading: boolean;
  isPro: boolean;
  subscriptionStatus: SubscriptionStatus | null;
  customerInfo: CustomerInfo | null;
  error: Error | null;
  refresh: () => Promise<void>;
}

export const useRevenueCat = (): UseRevenueCatReturn => {
  const [isLoading, setIsLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check Pro entitlement first (has built-in SDK check)
      const hasAccess = await hasProEntitlement();
      setIsPro(hasAccess);

      // Only fetch full details if entitlement check succeeded
      if (hasAccess !== undefined) {
        const [status, info] = await Promise.all([
          getSubscriptionStatus().catch((err) => {
            console.warn('[useRevenueCat] getSubscriptionStatus skipped:', err.message);
            return {
              isActive: false,
              tier: 'free' as const,
              willRenew: false,
              isInTrial: false,
            };
          }),
          getCustomerInfo().catch((err) => {
            console.warn('[useRevenueCat] getCustomerInfo skipped:', err.message);
            return null;
          }),
        ]);

        setSubscriptionStatus(status);
        setCustomerInfo(info);
      }
    } catch (err) {
      console.warn('[useRevenueCat] Error loading data:', err);
      setError(err as Error);
      setIsPro(false);
      setSubscriptionStatus({
        isActive: false,
        tier: 'free',
        willRenew: false,
        isInTrial: false,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

  useEffect(() => {
    loadData();

    // Listen for customer info updates
    const removeListener = addCustomerInfoUpdateListener((info) => {
      console.log('[useRevenueCat] Customer info updated');
      setCustomerInfo(info);
      
      // Re-check entitlement and status
      loadData();
    });

    return () => {
      removeListener();
    };
  }, [loadData]);

  return {
    isLoading,
    isPro,
    subscriptionStatus,
    customerInfo,
    error,
    refresh,
  };
};

/**
 * Hook for checking if user has access to a specific feature
 */
export const useFeatureAccess = (featureName: string): boolean => {
  const { isPro, isLoading } = useRevenueCat();

  if (isLoading) {
    return false; // Default to no access while loading
  }

  // Add feature-specific logic here if needed
  // For now, all Pro features require Pro entitlement
  return isPro;
};
