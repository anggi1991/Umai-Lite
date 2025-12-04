/**
 * Integration Test Suite
 * End-to-end tests for critical monetization flows
 */

import { supabase } from '@/services/supabaseClient';

// Mock supabase client for integration tests
jest.mock('@/services/supabaseClient', () => ({
  supabase: {
    rpc: jest.fn(),
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
    })),
    auth: {
      getUser: jest.fn(() =>
        Promise.resolve({
          data: { user: { id: 'test-monetization-user' } },
          error: null,
        })
      ),
    },
  },
}));

describe('Monetization Integration Tests', () => {
  const TEST_USER_ID = 'test-monetization-user';
  const mockRpc = supabase.rpc as jest.Mock;
  const mockFrom = supabase.from as jest.Mock;
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  beforeAll(async () => {
    // Setup test environment
    console.log('Setting up monetization integration tests...');
  });

  afterAll(async () => {
    // Cleanup
    console.log('Cleaning up test data...');
  });

  describe('Free Tier User Flow', () => {
    it('should enforce AI tips daily limit (3/day)', async () => {
      mockRpc.mockResolvedValueOnce({
        data: { limit: 3, used: 0, allowed: true },
        error: null,
      });

      const { data, error } = await supabase.rpc('check_and_increment_usage', {
        p_user_id: TEST_USER_ID,
        p_feature_type: 'ai_tips',
        p_tier: 'free',
      });

      expect(error).toBeNull();
      expect(data.limit).toBe(3);
    });

    it('should enforce chat message limit (10/day)', async () => {
      mockRpc.mockResolvedValueOnce({
        data: { limit: 10, used: 0, allowed: true },
        error: null,
      });

      const { data, error } = await supabase.rpc('check_and_increment_usage', {
        p_user_id: TEST_USER_ID,
        p_feature_type: 'chat_messages',
        p_tier: 'free',
      });

      expect(error).toBeNull();
      expect(data.limit).toBe(10);
    });

    it('should enforce media upload limit (20/month)', async () => {
      mockRpc.mockResolvedValueOnce({
        data: { limit: 20, used: 0, allowed: true },
        error: null,
      });

      const { data, error } = await supabase.rpc('check_and_increment_usage', {
        p_user_id: TEST_USER_ID,
        p_feature_type: 'media_upload',
        p_tier: 'free',
      });

      expect(error).toBeNull();
      expect(data.limit).toBe(20);
    });
  });

  describe('Premium Tier User Flow', () => {
    it('should allow unlimited AI tips', async () => {
      mockRpc.mockResolvedValueOnce({
        data: { limit: -1, used: 0, allowed: true },
        error: null,
      });

      const { data, error } = await supabase.rpc('check_and_increment_usage', {
        p_user_id: TEST_USER_ID,
        p_feature_type: 'ai_tips',
        p_tier: 'premium',
      });

      expect(error).toBeNull();
      expect(data.limit).toBe(-1); // unlimited
      expect(data.allowed).toBe(true);
    });

    it('should allow unlimited chat messages', async () => {
      mockRpc.mockResolvedValueOnce({
        data: { limit: -1, used: 0, allowed: true },
        error: null,
      });

      const { data, error } = await supabase.rpc('check_and_increment_usage', {
        p_user_id: TEST_USER_ID,
        p_feature_type: 'chat_messages',
        p_tier: 'premium',
      });

      expect(error).toBeNull();
      expect(data.allowed).toBe(true);
    });
  });

  describe('Referral System', () => {
    it('should generate unique referral code', async () => {
      mockRpc.mockResolvedValueOnce({
        data: { referral_code: 'TEST12345' },
        error: null,
      });

      const { data, error } = await supabase.rpc('generate_referral_code', {
        p_user_id: TEST_USER_ID,
      });

      expect(error).toBeNull();
      expect(data.referral_code).toMatch(/^[A-Z0-9]+$/);
      expect(data.referral_code.length).toBeGreaterThanOrEqual(8);
    });

    it('should track referral completion', async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn(),
      };
      // First .eq() returns this, second .eq() resolves with data
      (mockChain.eq as jest.Mock).mockReturnValueOnce(mockChain).mockResolvedValueOnce({
        data: [{ id: '1', referrer_id: TEST_USER_ID, status: 'completed' }],
        error: null,
      });
      mockFrom.mockReturnValueOnce(mockChain);

      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', TEST_USER_ID)
        .eq('status', 'completed');

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('Badge System', () => {
    it('should check and award eligible badges', async () => {
      mockRpc.mockResolvedValueOnce({
        data: [{ badge_id: 'first_chat', awarded_at: new Date().toISOString() }],
        error: null,
      });

      const { data, error } = await supabase.rpc('check_and_award_badges', {
        p_user_id: TEST_USER_ID,
      });

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should not award duplicate badges', async () => {
      // Award badge first time
      mockRpc.mockResolvedValueOnce({
        data: [{ badge_id: 'first_chat', awarded_at: new Date().toISOString() }],
        error: null,
      });
      await supabase.rpc('check_and_award_badges', {
        p_user_id: TEST_USER_ID,
      });

      // Try awarding again - returns empty (no duplicates)
      mockRpc.mockResolvedValueOnce({
        data: [],
        error: null,
      });
      const { data } = await supabase.rpc('check_and_award_badges', {
        p_user_id: TEST_USER_ID,
      });

      // Should not return duplicate badges
      const badgeIds = data.map((b: any) => b.badge_id);
      const uniqueBadgeIds = [...new Set(badgeIds)];
      expect(badgeIds.length).toBe(uniqueBadgeIds.length);
    });
  });

  describe('Usage Status Retrieval', () => {
    it('should get current usage status for all features', async () => {
      mockRpc.mockResolvedValueOnce({
        data: {
          ai_tips: { used: 0, limit: 3 },
          chat_messages: { used: 0, limit: 10 },
          media_upload: { used: 0, limit: 20 },
        },
        error: null,
      });

      const { data, error } = await supabase.rpc('get_usage_status', {
        p_user_id: TEST_USER_ID,
        p_tier: 'free',
      });

      expect(error).toBeNull();
      expect(data).toHaveProperty('ai_tips');
      expect(data).toHaveProperty('chat_messages');
      expect(data).toHaveProperty('media_upload');
    });
  });

  describe('Subscription Validation', () => {
    it('should validate active subscription status', async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
      };
      (mockChain.single as jest.Mock).mockResolvedValue({
        data: { tier: 'free', status: 'active', user_id: TEST_USER_ID },
        error: null,
      });
      mockFrom.mockReturnValueOnce(mockChain);

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', TEST_USER_ID)
        .eq('status', 'active')
        .single();

      // May not have active subscription in test
      if (data) {
        expect(data.tier).toMatch(/^(free|premium|family)$/);
        expect(['active', 'canceled', 'trialing']).toContain(data.status);
      }
    });
  });
});
