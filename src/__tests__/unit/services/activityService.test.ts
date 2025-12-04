/* eslint-env jest */
import {
  createActivity,
  getActivities,
  getTodayActivities,
  getActivitySummary,
  updateActivity,
  deleteActivity,
} from '@/services/activityService';
import { supabase } from '@/services/supabaseClient';

jest.mock('@/services/supabaseClient');

describe('activityService', () => {
  const mockUserId = 'test-user-id';
  const mockChildId = 'test-child-id';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createActivity', () => {
    it('should create activity successfully', async () => {
      const mockActivity = {
        id: 'activity-123',
        user_id: mockUserId,
        child_id: mockChildId,
        type: 'feeding',
        start_time: '2025-11-06T10:00:00Z',
        created_at: '2025-11-06T10:00:00Z',
      };

      const mockInsert = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({ data: mockActivity, error: null });

      (supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
        select: mockSelect,
        single: mockSingle,
      });

      const activityInput = {
        child_id: mockChildId,
        type: 'feeding' as const,
        start_time: '2025-11-06T10:00:00Z',
      };

      const result = await createActivity(mockUserId, activityInput);

      expect(supabase.from).toHaveBeenCalledWith('activities');
      expect(mockInsert).toHaveBeenCalledWith([
        expect.objectContaining({
          user_id: mockUserId,
          child_id: mockChildId,
          type: 'feeding',
        }),
      ]);
      expect(result).toMatchObject({
        child_id: mockChildId,
        type: 'feeding',
        user_id: mockUserId,
      });
    });

    it('should throw error on database failure', async () => {
      const mockError = new Error('Database error');
      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockRejectedValue(mockError),
      });

      const activityInput = {
        child_id: mockChildId,
        type: 'feeding' as const,
        start_time: '2025-11-06T10:00:00Z',
      };

      await expect(createActivity(mockUserId, activityInput)).rejects.toThrow();
    });
  });

  describe('getActivities', () => {
    it('should fetch activities for user', async () => {
      const mockActivities = [
        { id: '1', type: 'feeding', created_at: '2025-11-06T10:00:00Z' },
        { id: '2', type: 'sleep', created_at: '2025-11-06T09:00:00Z' },
      ];

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockActivities, error: null }),
      });

      const result = await getActivities(mockUserId);

      expect(supabase.from).toHaveBeenCalledWith('activities');
      expect(result).toEqual(mockActivities);
    });

  });

  describe('getTodayActivities', () => {
    it('should fetch activities for today', async () => {
      const mockActivities = [
        { id: '1', type: 'feeding', created_at: new Date().toISOString() },
      ];

      const mockGte = jest.fn().mockReturnThis();
      const mockLte = jest.fn().mockReturnThis();

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: mockGte,
        lte: mockLte,
        order: jest.fn().mockResolvedValue({ data: mockActivities, error: null }),
      });

      const result = await getTodayActivities(mockUserId);

      expect(mockGte).toHaveBeenCalledWith('start_time', expect.any(String));
      expect(mockLte).toHaveBeenCalledWith('start_time', expect.any(String));
      expect(result).toEqual(mockActivities);
    });
  });

  describe('getActivitySummary', () => {
    it('should return summary of activities by type', async () => {
      const mockActivities = [
        { type: 'feeding' },
        { type: 'feeding' },
        { type: 'sleep' },
        { type: 'diaper' },
        { type: 'diaper' },
        { type: 'diaper' },
      ];

      const mockGte = jest.fn().mockReturnThis();
      const mockLte = jest.fn().mockReturnThis();

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: mockGte,
        lte: mockLte,
        mockResolvedValue: jest.fn().mockResolvedValue({ data: mockActivities, error: null }),
      });

      // Mock the chained methods to return the data
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockResolvedValue({ data: mockActivities, error: null }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      const result = await getActivitySummary(mockUserId);

      expect(result).toEqual({
        feeding: 2,
        sleep: 1,
        diaper: 3,
        mood: 0,
        growth: 0,
      });
    });

    it('should return zero counts for empty activities', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockResolvedValue({ data: [], error: null }),
      });

      const result = await getActivitySummary(mockUserId);

      expect(result).toEqual({
        feeding: 0,
        sleep: 0,
        diaper: 0,
        mood: 0,
        growth: 0,
      });
    });
  });

  describe('updateActivity', () => {
    it('should update activity successfully', async () => {
      const mockActivity = {
        id: 'activity-123',
        user_id: mockUserId,
        type: 'feeding',
        value: '150ml',
      };

      // First call: update (returns null, triggers fallback)
      const mockUpdate = jest.fn().mockReturnThis();
      const mockUpdateEq = jest.fn().mockResolvedValue({ data: null, error: null });

      // Second call: fallback select
      const mockSelect = jest.fn().mockReturnThis();
      const mockSelectEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({ data: mockActivity, error: null });

      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          update: mockUpdate,
          eq: mockUpdateEq,
        })
        .mockReturnValueOnce({
          select: mockSelect,
          eq: mockSelectEq,
          single: mockSingle,
        });

      const result = await updateActivity('activity-123', { value: '150ml' });

      expect(result).toBeDefined();
      expect(result.id).toBe('activity-123');
    });
  });

  describe('deleteActivity', () => {
    it('should delete activity successfully', async () => {
      const mockDelete = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockResolvedValue({ data: null, error: null });

      (supabase.from as jest.Mock).mockReturnValue({
        delete: mockDelete,
        eq: mockEq,
      });

      await deleteActivity('activity-123');

      expect(supabase.from).toHaveBeenCalledWith('activities');
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('id', 'activity-123');
    });

    it('should throw error on delete failure', async () => {
      const mockError = new Error('Delete failed');
      (supabase.from as jest.Mock).mockReturnValue({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockRejectedValue(mockError),
      });

      await expect(deleteActivity('activity-123')).rejects.toThrow();
    });
  });
});
