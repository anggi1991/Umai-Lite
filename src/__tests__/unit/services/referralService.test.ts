/**
 * Referral Service Tests
 * Tests for referral program functionality with correct API
 */

import { supabase } from '@/services/supabaseClient';
import {
  generateReferralCode,
  getOrCreateReferralCode,
  applyReferralCode,
  getReferralStats,
  getMyReferrals,
  getReferralLink,
  shareReferral,
} from '@/services/referralService';

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

// Mock analytics service
jest.mock('@/services/analyticsService', () => ({
  logEvent: jest.fn(),
}));

// Mock i18n
jest.mock('@/i18n', () => ({
  i18n: {
    t: jest.fn((key: string, params?: any) => {
      if (key === 'referral.shareMessage') {
        return `Join me on ParentingAI! Use code ${params.code}: ${params.link}`;
      }
      return key;
    }),
  },
}));

describe('Referral Service', () => {
  const mockUserId = 'test-user-123';
  const mockReferralCode = 'ABC123';

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default auth mock
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: mockUserId } },
      error: null,
    });
  });

  describe('generateReferralCode', () => {
    it('should return existing code if user already has one', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { referral_code: mockReferralCode },
          error: null,
        }),
      });

      const code = await generateReferralCode();

      expect(code).toBe(mockReferralCode);
    });

    it('should generate new code if user has none', async () => {
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' },
        }),
      }).mockReturnValueOnce({
        insert: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      });

      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: 'NEWCODE123',
        error: null,
      });

      const code = await generateReferralCode();

      expect(code).toBe('NEWCODE123');
      expect(supabase.rpc).toHaveBeenCalledWith('generate_referral_code');
    });
  });

  describe('getOrCreateReferralCode', () => {
    it('should return existing referral code', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { referral_code: mockReferralCode },
          error: null,
        }),
      });

      const code = await getOrCreateReferralCode();

      expect(code).toBe(mockReferralCode);
    });
  });

  describe('applyReferralCode', () => {
    it('should apply valid referral code', async () => {
      const mockReferral = {
        id: 'ref-1',
        referrer_id: 'other-user',
        referral_code: mockReferralCode,
        status: 'pending',
      };

      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockReferral,
          error: null,
        }),
      }).mockReturnValueOnce({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      });

      const result = await applyReferralCode(mockReferralCode, 'user@example.com');

      expect(result).toBe(true);
    });

    it('should reject invalid referral code', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found' },
        }),
      });

      const result = await applyReferralCode('INVALID');

      expect(result).toBe(false);
    });

    it('should reject self-referral', async () => {
      const mockReferral = {
        id: 'ref-1',
        referrer_id: mockUserId, // Same as current user
        referral_code: mockReferralCode,
        status: 'pending',
      };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockReferral,
          error: null,
        }),
      });

      const result = await applyReferralCode(mockReferralCode);

      expect(result).toBe(false);
    });
  });

  describe('getReferralStats', () => {
    it('should return referral statistics', async () => {
      const mockReferrals = [
        { status: 'completed', reward_given: true },
        { status: 'completed', reward_given: true },
        { status: 'completed', reward_given: false },
        { status: 'pending', reward_given: false },
        { status: 'pending', reward_given: false },
      ];

      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: mockReferrals,
          error: null,
        }),
      }).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { referral_code: mockReferralCode },
          error: null,
        }),
      });

      const stats = await getReferralStats();

      expect(stats.total_referrals).toBe(5);
      expect(stats.completed_referrals).toBe(3);
      expect(stats.pending_referrals).toBe(2);
      expect(stats.total_rewards_earned).toBe(2);
    });
  });

  describe('getMyReferrals', () => {
    it('should return list of referrals', async () => {
      const mockReferrals = [
        {
          id: '1',
          referrer_id: mockUserId,
          referral_code: mockReferralCode,
          status: 'completed',
          created_at: new Date().toISOString(),
        },
      ];

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockReferrals,
          error: null,
        }),
      });

      const referrals = await getMyReferrals();

      expect(referrals).toHaveLength(1);
      expect(referrals[0].status).toBe('completed');
    });
  });

  describe('getReferralLink', () => {
    it('should generate referral link', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { referral_code: mockReferralCode },
          error: null,
        }),
      });

      const link = await getReferralLink();

      expect(link).toContain('parentingai.app');
      expect(link).toContain(mockReferralCode);
    });
  });

  describe('shareReferral', () => {
    beforeEach(() => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { referral_code: mockReferralCode },
          error: null,
        }),
      });
    });

    it('should return WhatsApp share URL', async () => {
      const url = await shareReferral('whatsapp');

      expect(url).toContain('whatsapp://send');
      expect(url).toContain(mockReferralCode);
    });

    it('should return Facebook share URL', async () => {
      const url = await shareReferral('facebook');

      expect(url).toContain('facebook.com/sharer');
    });

    it('should return message for Instagram', async () => {
      const message = await shareReferral('instagram');

      expect(message).toContain(mockReferralCode);
    });

    it('should return message for copy', async () => {
      const message = await shareReferral('copy');

      expect(message).toContain(mockReferralCode);
    });
  });
});
