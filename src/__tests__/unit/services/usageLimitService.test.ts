/**
 * Usage Limit Service Tests
 * Tests for daily usage limits and feature gating
 */

// Mock RevenueCat service FIRST to avoid native module loading
jest.mock('@/services/revenueCatService', () => ({
  hasProEntitlement: jest.fn(() => Promise.resolve(false)),
  initializeRevenueCat: jest.fn(() => Promise.resolve()),
  getOfferings: jest.fn(() => Promise.resolve({ all: {}, current: null })),
  purchasePackage: jest.fn(() => Promise.resolve({ customerInfo: {} })),
  restorePurchases: jest.fn(() => Promise.resolve({})),
  getCustomerInfo: jest.fn(() => Promise.resolve({})),
}));

import { supabase } from '@/services/supabaseClient';
import {
  checkAndIncrementUsage,
  getUsageStatus,
  getAllUsageStatus,
} from '@/services/usageLimitService';
import { hasProEntitlement } from '@/services/revenueCatService';

// Mock Supabase client
jest.mock('@/services/supabaseClient', () => ({
  supabase: {
    rpc: jest.fn(),
    from: jest.fn(),
    auth: {
      getUser: jest.fn(),
    },
  },
}));

describe('Usage Limit Service', () => {
  const mockUserId = 'test-user-123';

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset mock implementations
    (hasProEntitlement as jest.Mock).mockResolvedValue(false);
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: mockUserId } },
      error: null,
    });
  });

  describe('checkAndIncrementUsage', () => {
    it('should allow usage for Pro users (unlimited)', async () => {
      // Mock Pro entitlement
      (hasProEntitlement as jest.Mock).mockResolvedValue(true);

      const result = await checkAndIncrementUsage('ai_tips');

      expect(result.allowed).toBe(true);
      expect(result.status.is_unlimited).toBe(true);
      expect(result.status.limit).toBe(999999);
    });

    it('should call RPC function for free users', async () => {
      // Mock subscription tier query
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { tier: 'free' },
          error: null,
        }),
      });

      // Mock RPC call
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: {
          allowed: true,
          current_count: 1,
          limit: 3,
          remaining: 2,
        },
        error: null,
      });

      const result = await checkAndIncrementUsage('ai_tips', mockUserId);

      expect(supabase.rpc).toHaveBeenCalledWith('check_and_increment_usage', {
        p_user_id: mockUserId,
        p_feature_type: 'ai_tips',
        p_tier: 'free',
      });
      expect(result.allowed).toBe(true);
      expect(result.status.remaining).toBe(2);
    });

    it('should handle database subscription query errors', async () => {
      // Mock subscription tier query failure
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Query error' },
        }),
      });

      // Should still proceed with free tier as default
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: {
          allowed: true,
          current_count: 1,
          limit: 3,
          remaining: 2,
        },
        error: null,
      });

      const result = await checkAndIncrementUsage('ai_tips', mockUserId);

      expect(result.allowed).toBe(true);
    });
  });

  describe('getUsageStatus', () => {
    it('should return usage status for a specific feature', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            ai_tips: 2,
            chat_messages: 5,
            media_upload: 10,
          },
          error: null,
        }),
      });

      const status = await getUsageStatus('ai_tips');

      expect(status.current_count).toBeDefined();
    });

    it('should handle Pro users', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { tier: 'pro' },
          error: null,
        }),
      });

      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: {
          current_count: 10,
          limit: 999999,
          remaining: 999989,
          is_unlimited: true,
        },
        error: null,
      });

      const status = await getUsageStatus('chat_messages');

      expect(status.is_unlimited).toBe(true);
      expect(status.limit).toBe(999999);
    });
  });

  describe('getAllUsageStatus', () => {
    it('should return all feature usage statuses', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            ai_tips: 2,
            chat_messages: 5,
            media_upload: 10,
          },
          error: null,
        }),
      });

      const allStatus = await getAllUsageStatus();

      expect(allStatus).toBeDefined();
      expect(typeof allStatus).toBe('object');
    });

    it('should handle Pro users with unlimited access', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { tier: 'pro' },
          error: null,
        }),
      });

      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: {
          current_count: 10,
          limit: 999999,
          remaining: 999989,
          is_unlimited: true,
        },
        error: null,
      });

      const allStatus = await getAllUsageStatus();

      expect(allStatus.ai_tips.is_unlimited).toBe(true);
      expect(allStatus.chat_messages.is_unlimited).toBe(true);
      expect(allStatus.media_upload.is_unlimited).toBe(true);
    });

    it('should handle missing subscription data gracefully', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'No data' },
        }),
      });

      // Should return default values
      const allStatus = await getAllUsageStatus();

      expect(allStatus).toBeDefined();
    });
  });
});
