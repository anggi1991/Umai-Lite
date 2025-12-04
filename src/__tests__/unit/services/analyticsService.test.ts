/* eslint-env jest */
import { 
  logEvent, 
  trackAppLaunch, 
  trackScreenView, 
  trackFeatureUsage,
  trackActivityCreated,
  getDAUCount,
  getUserActivitySummary 
} from '@/services/analyticsService';
import { supabase } from '@/services/supabaseClient';

// Mock supabase
jest.mock('@/services/supabaseClient');

describe('analyticsService', () => {
  const mockUserId = 'test-user-id';
  const mockUser = { id: mockUserId, email: 'test@example.com' };

  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default auth mock
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
  });

  describe('logEvent', () => {
    it('should log event to audit_logs table', async () => {
      const mockInsert = jest.fn().mockResolvedValue({ data: null, error: null });
      (supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
      });

      await logEvent({
        action: 'test_action',
        table_name: 'test_table',
        record_id: 'test-id',
        details: { test: true },
      });

      expect(supabase.from).toHaveBeenCalledWith('audit_logs');
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: mockUserId,
        action: 'test_action',
        table_name: 'test_table',
        record_id: 'test-id',
        details: { test: true },
      });
    });

    it('should handle error gracefully when user not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      // Should not throw
      await expect(logEvent({ action: 'test' })).resolves.not.toThrow();
    });

    it('should handle database error gracefully', async () => {
      const mockInsert = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });
      (supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
      });

      // Should not throw
      await expect(logEvent({ action: 'test' })).resolves.not.toThrow();
    });
  });

  describe('trackAppLaunch', () => {
    it('should track app launch event', async () => {
      const mockInsert = jest.fn().mockResolvedValue({ data: null, error: null });
      (supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
      });

      await trackAppLaunch();

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: mockUserId,
          action: 'app_launch',
          details: expect.objectContaining({
            timestamp: expect.any(String),
          }),
        })
      );
    });
  });

  describe('trackScreenView', () => {
    it('should track screen view with screen name', async () => {
      const mockInsert = jest.fn().mockResolvedValue({ data: null, error: null });
      (supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
      });

      await trackScreenView('Dashboard');

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: mockUserId,
          action: 'screen_view',
          details: expect.objectContaining({
            screen: 'Dashboard',
            timestamp: expect.any(String),
          }),
        })
      );
    });
  });

  describe('trackFeatureUsage', () => {
    it('should track feature usage with metadata', async () => {
      const mockInsert = jest.fn().mockResolvedValue({ data: null, error: null });
      (supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
      });

      await trackFeatureUsage('generate_tip', { tip_id: 'test-tip-id' });

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: mockUserId,
          action: 'feature_usage',
          details: expect.objectContaining({
            feature: 'generate_tip',
            tip_id: 'test-tip-id',
            timestamp: expect.any(String),
          }),
        })
      );
    });
  });

  describe('trackActivityCreated', () => {
    it('should track activity creation with type and id', async () => {
      const mockInsert = jest.fn().mockResolvedValue({ data: null, error: null });
      (supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
      });

      await trackActivityCreated('feeding', 'activity-123');

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: mockUserId,
          action: 'activity_created',
          table_name: 'activities',
          record_id: 'activity-123',
          details: expect.objectContaining({
            type: 'feeding',
            timestamp: expect.any(String),
          }),
        })
      );
    });
  });

  describe('getDAUCount', () => {
    it('should return count of unique users for today', async () => {
      const mockData = [
        { user_id: 'user1' },
        { user_id: 'user2' },
        { user_id: 'user1' }, // duplicate
      ];

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      });

      const count = await getDAUCount();

      expect(count).toBe(2); // Only unique users
      expect(supabase.from).toHaveBeenCalledWith('audit_logs');
    });

    it('should return 0 on error', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockResolvedValue({ data: null, error: { message: 'Error' } }),
      });

      const count = await getDAUCount();
      expect(count).toBe(0);
    });
  });

  describe('getUserActivitySummary', () => {
    it('should return activity summary for user', async () => {
      const mockData = [
        { action: 'app_launch', created_at: '2025-11-06T10:00:00Z' },
        { action: 'screen_view', created_at: '2025-11-06T10:01:00Z' },
        { action: 'screen_view', created_at: '2025-11-06T10:02:00Z' },
      ];

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      });

      const summary = await getUserActivitySummary('user-123');

      expect(summary.totalEvents).toBe(3);
      expect(summary.eventsByAction).toEqual({
        app_launch: 1,
        screen_view: 2,
      });
      expect(summary.lastActive).toBe('2025-11-06T10:00:00Z');
    });

    it('should handle empty activity', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      });

      const summary = await getUserActivitySummary('user-123');

      expect(summary.totalEvents).toBe(0);
      expect(summary.eventsByAction).toEqual({});
      expect(summary.lastActive).toBeNull();
    });
  });
});
