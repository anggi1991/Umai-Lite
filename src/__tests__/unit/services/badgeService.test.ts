/**
 * Badge Service Tests
 * Tests for gamification badge system
 */

import { supabase } from '@/services/supabaseClient';
import {
  checkAndAwardBadges,
  getUserBadges,
  getAllBadges,
} from '@/services/badgeService';

// Mock Supabase client
jest.mock('@/services/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(() => ({
        data: { user: { id: 'test-user-123' } },
        error: null,
      })),
    },
    rpc: jest.fn(),
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
    })),
  },
}));

describe('Badge Service', () => {
  const mockUserId = 'test-user-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkAndAwardBadges', () => {
    it('should award new badges when conditions are met', async () => {
      const mockNewBadges = [
        {
          badge_id: 'badge-1',
          name: '7-Day Streak',
          description: 'Log aktivitas 7 hari berturut-turut',
          icon_name: 'fire',
        },
      ];

      (supabase.rpc as jest.Mock).mockResolvedValueOnce({
        data: mockNewBadges,
        error: null,
      });

      const badges = await checkAndAwardBadges();

      expect(badges).toBeDefined();
      expect(Array.isArray(badges)).toBe(true);
      expect(supabase.rpc).toHaveBeenCalled();
    });

    it('should return empty array when no new badges earned', async () => {
      (supabase.rpc as jest.Mock).mockResolvedValueOnce({
        data: [],
        error: null,
      });

      const badges = await checkAndAwardBadges();

      expect(badges).toEqual([]);
    });

    it('should handle RPC errors', async () => {
      (supabase.rpc as jest.Mock).mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error' },
      });

      const result = await checkAndAwardBadges();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getUserBadges', () => {
    it('should return all badges earned by user', async () => {
      const mockBadges = [
        {
          id: 'user-badge-1',
          badge_id: 'badge-1',
          user_id: 'test-user-123',
          earned_at: '2025-01-01T06:00:00Z',
          badge: {
            id: 'badge-1',
            name: 'Early Bird',
            icon_name: 'sunrise',
            description: 'Early activity',
          },
        },
        {
          id: 'user-badge-2',
          badge_id: 'badge-2',
          user_id: 'test-user-123',
          earned_at: '2025-01-08T12:00:00Z',
          badge: {
            id: 'badge-2',
            name: '7-Day Streak',
            icon_name: 'fire',
            description: 'Streak achievement',
          },
        },
      ];

      const mockFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValueOnce({
          data: mockBadges,
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValueOnce(mockFrom);

      const badges = await getUserBadges();

      expect(badges).toHaveLength(2);
      expect(badges[0].badge?.name).toBe('Early Bird');
      expect(supabase.from).toHaveBeenCalledWith('user_badges');
    });

    it('should return empty array for users with no badges', async () => {
      const mockFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValueOnce({
          data: [],
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValueOnce(mockFrom);

      const badges = await getUserBadges();

      expect(badges).toEqual([]);
    });
  });

  describe('getAllBadges', () => {
    it('should return all available badges', async () => {
      const mockBadges = [
        {
          id: 'badge-1',
          name: 'Early Bird',
          description: 'Log aktivitas sebelum jam 7 pagi',
          category: 'engagement',
          tier: 'bronze',
          icon_name: 'sunrise',
        },
        {
          id: 'badge-2',
          name: '7-Day Streak',
          description: 'Log 7 hari berturut-turut',
          category: 'milestone',
          tier: 'silver',
          icon_name: 'fire',
        },
      ];

      const mockOrder = jest.fn().mockReturnThis();
      const mockFrom = {
        select: jest.fn().mockReturnThis(),
        order: mockOrder,
      };

      mockOrder
        .mockReturnValueOnce(mockFrom)
        .mockResolvedValueOnce({
          data: mockBadges,
          error: null,
        });

      (supabase.from as jest.Mock).mockReturnValueOnce(mockFrom);

      const badges = await getAllBadges();

      expect(badges).toHaveLength(2);
      expect(badges[0].category).toBe('engagement');
    });
  });

});
