/* eslint-env jest */
import {
  getCurrentSubscription,
  hasActiveSubscription,
  cancelSubscription,
  isPremiumUser,
  getSubscriptionFeatures,
  initializeFreeSubscription,
  canAccessFeature,
  getDaysRemaining,
  getSubscriptionStatus,
} from '@/services/subscriptionService';
import { supabase } from '@/services/supabaseClient';

jest.mock('@/services/supabaseClient');

describe('subscriptionService', () => {
  const mockUserId = 'test-user-id';
  const mockUser = { id: mockUserId, email: 'test@example.com' };

  beforeEach(() => {
    jest.clearAllMocks();
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
  });

  describe('getCurrentSubscription', () => {
    it('should return current subscription', async () => {
      const mockSubscription = {
        id: 'sub-123',
        user_id: mockUserId,
        tier: 'free',
        status: 'active',
        started_at: '2025-11-01T00:00:00Z',
        expires_at: null,
        metadata: null,
        created_at: '2025-11-01T00:00:00Z',
      };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockSubscription, error: null }),
      });

      const subscription = await getCurrentSubscription();

      expect(subscription).toEqual(mockSubscription);
      expect(supabase.from).toHaveBeenCalledWith('subscriptions');
    });

    it('should return null if no subscription exists', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { code: 'PGRST116' } // Not found
        }),
      });

      const subscription = await getCurrentSubscription();
      expect(subscription).toBeNull();
    });

    it('should return null when user not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const subscription = await getCurrentSubscription();
      expect(subscription).toBeNull();
    });
  });

  describe('hasActiveSubscription', () => {
    it('should return true for active subscription', async () => {
      const mockSubscription = {
        tier: 'premium',
        status: 'active',
        expires_at: null,
      };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockSubscription, error: null }),
      });

      const isActive = await hasActiveSubscription();
      expect(isActive).toBe(true);
    });

    it('should return false for expired subscription', async () => {
      const mockSubscription = {
        tier: 'premium',
        status: 'active',
        expires_at: '2025-01-01T00:00:00Z', // Past date
      };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockSubscription, error: null }),
      });

      const isActive = await hasActiveSubscription();
      expect(isActive).toBe(false);
    });

    it('should return false for cancelled subscription', async () => {
      const mockSubscription = {
        tier: 'premium',
        status: 'cancelled',
        expires_at: null,
      };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockSubscription, error: null }),
      });

      const isActive = await hasActiveSubscription();
      expect(isActive).toBe(false);
    });

    it('should return false when no subscription exists', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
      });

      const isActive = await hasActiveSubscription();
      expect(isActive).toBe(false);
    });
  });

  describe('isPremiumUser', () => {
    it('should return true for premium tier with active subscription', async () => {
      const mockSubscription = {
        tier: 'premium',
        status: 'active',
        expires_at: null,
      };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockSubscription, error: null }),
      });

      const isPremium = await isPremiumUser();
      expect(isPremium).toBe(true);
    });

    it('should return true for family tier', async () => {
      const mockSubscription = {
        tier: 'family',
        status: 'active',
        expires_at: null,
      };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockSubscription, error: null }),
      });

      const isPremium = await isPremiumUser();
      expect(isPremium).toBe(true);
    });

    it('should return false for free tier', async () => {
      const mockSubscription = {
        tier: 'free',
        status: 'active',
        expires_at: null,
      };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockSubscription, error: null }),
      });

      const isPremium = await isPremiumUser();
      expect(isPremium).toBe(false);
    });
  });

  describe('getSubscriptionFeatures', () => {
    it('should return correct features for free tier', () => {
      const features = getSubscriptionFeatures('free');

      expect(features).toEqual({
        maxChildren: 3,
        aiTipsDaily: 3,
        chatMessagesPerDay: 20,
        mediaStorageGB: 1,
        analytics: false,
        prioritySupport: false,
      });
    });

    it('should return correct features for premium tier', () => {
      const features = getSubscriptionFeatures('premium');

      expect(features).toEqual({
        maxChildren: 3,
        aiTipsDaily: 10,
        chatMessagesPerDay: 100,
        mediaStorageGB: 5,
        analytics: true,
        prioritySupport: true,
      });
    });

    it('should return correct features for family tier', () => {
      const features = getSubscriptionFeatures('family');

      expect(features).toEqual({
        maxChildren: 5,
        aiTipsDaily: 20,
        chatMessagesPerDay: 200,
        mediaStorageGB: 10,
        analytics: true,
        prioritySupport: true,
      });
    });
  });

  describe('initializeFreeSubscription', () => {
    it('should create free subscription for new user', async () => {
      // Mock no existing subscription
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
      });

      // Mock successful insert
      const mockInsert = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: {
          id: 'sub-123',
          user_id: mockUserId,
          tier: 'free',
          status: 'active',
        },
        error: null,
      });

      (supabase.from as jest.Mock).mockReturnValueOnce({
        insert: mockInsert,
        select: mockSelect,
        single: mockSingle,
      });

      await initializeFreeSubscription();

      expect(mockInsert).toHaveBeenCalledWith([
        expect.objectContaining({
          user_id: mockUserId,
          tier: 'free',
          status: 'active',
        }),
      ]);
    });

    it('should not create duplicate subscription', async () => {
      // Mock existing subscription
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { tier: 'free', status: 'active' },
          error: null,
        }),
      });

      await initializeFreeSubscription();

      // Verify insert was not called (only called for select)
      expect(supabase.from).toHaveBeenCalledTimes(1);
    });
  });

  describe('canAccessFeature', () => {
    it('should allow free users to access chat', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { tier: 'free', status: 'active' },
          error: null,
        }),
      });

      const canAccess = await canAccessFeature('chat');
      expect(canAccess).toBe(true);
    });

    it('should not allow free users to access analytics', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { tier: 'free', status: 'active' },
          error: null,
        }),
      });

      const canAccess = await canAccessFeature('analytics');
      expect(canAccess).toBe(false);
    });

    it('should allow premium users to access analytics', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { tier: 'premium', status: 'active' },
          error: null,
        }),
      });

      const canAccess = await canAccessFeature('analytics');
      expect(canAccess).toBe(true);
    });
  });

  describe('getDaysRemaining', () => {
    it('should return null for subscription without expiry', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { expires_at: null },
          error: null,
        }),
      });

      const days = await getDaysRemaining();
      expect(days).toBeNull();
    });

    it('should return 0 for expired subscription', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { expires_at: '2025-01-01T00:00:00Z' }, // Past date
          error: null,
        }),
      });

      const days = await getDaysRemaining();
      expect(days).toBe(0);
    });
  });
});
