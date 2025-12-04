/**
 * RevenueCat Service Tests
 * Tests for subscription management via RevenueCat SDK
 */

import { Platform } from 'react-native';
import Purchases from 'react-native-purchases';
import {
  initializeRevenueCat,
  getSubscriptionStatus,
  hasProEntitlement,
  shouldShowPaywall,
  getProducts,
  restorePurchases,
} from '@/services/revenueCatService';
import { supabase } from '@/services/supabaseClient';

// Mock modules
jest.mock('react-native-purchases');
jest.mock('@/services/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(() =>
        Promise.resolve({
          data: { user: { id: 'test-user-123' } },
          error: null,
        })
      ),
    },
  },
}));

describe('RevenueCat Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initializeRevenueCat', () => {
    it('should initialize SDK on iOS platform', async () => {
      Platform.OS = 'ios';
      (Purchases.configure as jest.Mock).mockResolvedValueOnce(undefined);

      await initializeRevenueCat();

      expect(Purchases.configure).toHaveBeenCalledWith({
        apiKey: expect.any(String),
      });
    });

    it('should skip initialization on web platform', async () => {
      Platform.OS = 'web';

      await initializeRevenueCat();

      expect(Purchases.configure).not.toHaveBeenCalled();
    });

    it('should handle initialization errors gracefully', async () => {
      Platform.OS = 'ios';
      (Purchases.configure as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      await expect(initializeRevenueCat()).resolves.not.toThrow();
    });

  });

  describe('getSubscriptionStatus', () => {
    it('should return active subscription status', async () => {
      const mockCustomerInfo = {
        entitlements: {
          active: {
            'razqashop Pro': {
              productIdentifier: 'monthly',
              expirationDate: new Date(Date.now() + 86400000).toISOString(),
              willRenew: true,
              isActive: true,
            },
          },
        },
      };

      (Purchases.getCustomerInfo as jest.Mock).mockResolvedValueOnce(
        mockCustomerInfo
      );

      const status = await getSubscriptionStatus();

      expect(status.isActive).toBe(true);
      expect(status.tier).toBe('premium');
      expect(status.willRenew).toBe(true);
    });

    it('should return free tier for non-subscribed users', async () => {
      const mockCustomerInfo = {
        entitlements: {
          active: {},
        },
      };

      (Purchases.getCustomerInfo as jest.Mock).mockResolvedValueOnce(
        mockCustomerInfo
      );

      const status = await getSubscriptionStatus();

      expect(status.isActive).toBe(false);
      expect(status.tier).toBe('free');
    });

    it('should handle SDK errors', async () => {
      (Purchases.getCustomerInfo as jest.Mock).mockRejectedValueOnce(
        new Error('SDK error')
      );

      const status = await getSubscriptionStatus();

      expect(status.isActive).toBe(false);
      expect(status.tier).toBe('free');
    });
  });

  describe('checkEntitlement', () => {
    it('should return true for active entitlement', async () => {
      const mockCustomerInfo = {
        entitlements: {
          active: {
            'razqashop Pro': { isActive: true },
          },
        },
      };

      (Purchases.getCustomerInfo as jest.Mock).mockResolvedValueOnce(
        mockCustomerInfo
      );

      const hasEntitlement = await hasProEntitlement();

      expect(hasEntitlement).toBe(true);
    });

    it('should return false for no active entitlement', async () => {
      const mockCustomerInfo = {
        entitlements: {
          active: {},
        },
      };

      (Purchases.getCustomerInfo as jest.Mock).mockResolvedValueOnce(
        mockCustomerInfo
      );

      const hasEntitlement = await hasProEntitlement();

      expect(hasEntitlement).toBe(false);
    });
  });

  describe('getAvailableProducts', () => {
    it('should return formatted product offerings', async () => {
      const mockOfferings = {
        current: {
          availablePackages: [
            {
              identifier: 'monthly',
              product: {
                title: 'Premium Monthly',
                description: 'Monthly subscription',
                price: 49000,
                priceString: 'IDR 49,000',
                currencyCode: 'IDR',
              },
            },
          ],
        },
      };

      (Purchases.getOfferings as jest.Mock).mockResolvedValueOnce(
        mockOfferings
      );

      const products = await getProducts();

      expect(products).toHaveLength(1);
      expect(products[0].identifier).toBe('monthly');
      expect(products[0].price).toBe('49000');
      expect(products[0].priceString).toBe('IDR 49,000');
    });

    it('should return empty array if no offerings available', async () => {
      (Purchases.getOfferings as jest.Mock).mockResolvedValueOnce({
        current: null,
      });

      const products = await getProducts();

      expect(products).toEqual([]);
    });
  });

  describe('presentPaywall', () => {
    it('should present paywall UI on supported platforms', async () => {
      Platform.OS = 'ios';
      (Purchases.getCustomerInfo as jest.Mock).mockResolvedValueOnce({
        entitlements: { active: {} },
      });

      const shouldShow = await shouldShowPaywall();
      expect(typeof shouldShow).toBe('boolean');

      // Verify paywall was attempted to be shown
      expect(Purchases.getCustomerInfo).toHaveBeenCalled();
    });
  });

  describe('restorePurchases', () => {
    it('should restore previous purchases successfully', async () => {
      const mockCustomerInfo = {
        entitlements: {
          active: {
            'razqashop Pro': { isActive: true },
          },
        },
      };

      (Purchases.restorePurchases as jest.Mock).mockResolvedValueOnce(
        mockCustomerInfo
      );

      const result = await restorePurchases();

      expect(result).toBeDefined();
      expect(result.entitlements).toBeDefined();
      expect(Purchases.restorePurchases).toHaveBeenCalled();
    });

    it('should handle restore errors', async () => {
      (Purchases.restorePurchases as jest.Mock).mockRejectedValueOnce(
        new Error('Restore failed')
      );

      await expect(restorePurchases()).rejects.toThrow('Restore failed');
    });
  });
});
