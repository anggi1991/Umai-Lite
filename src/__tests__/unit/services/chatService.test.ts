/**
 * Chat Service Tests
 * Tests for AI chat functionality with correct API
 */

import { supabase } from '@/services/supabaseClient';
import {
  createChatSession,
  listChatSessions,
  listMessages,
  sendChatMessage,
} from '@/services/chatService';

// Mock Supabase client
jest.mock('@/services/supabaseClient', () => ({
  supabase: {
    from: jest.fn(),
    functions: {
      invoke: jest.fn(),
    },
    auth: {
      getUser: jest.fn(),
      getSession: jest.fn(),
    },
  },
}));

// Mock usage limit service
jest.mock('@/services/usageLimitService', () => ({
  UsageLimitService: {
    checkAndIncrementUsage: jest.fn(),
  },
}));

describe('Chat Service', () => {
  const mockUserId = 'test-user-123';
  const mockChildId = 'child-123';
  const mockSessionId = 'session-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listChatSessions', () => {
    it('should list all chat sessions for user', async () => {
      const mockSessions = [
        {
          id: 'session-1',
          user_id: mockUserId,
          title: 'Chat 1',
          created_at: new Date().toISOString(),
        },
        {
          id: 'session-2',
          user_id: mockUserId,
          title: 'Chat 2',
          created_at: new Date().toISOString(),
        },
      ];

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockSessions,
          error: null,
        }),
      });

      const sessions = await listChatSessions(mockUserId);

      expect(sessions).toEqual(mockSessions);
      expect(supabase.from).toHaveBeenCalledWith('chat_sessions');
    });

    it('should handle timeout gracefully', async () => {
      jest.useFakeTimers();
      
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn(() => new Promise(() => {})), // Never resolves
      });

      const promise = listChatSessions(mockUserId);
      jest.advanceTimersByTime(11000);
      
      const sessions = await promise;
      expect(sessions).toEqual([]);
      
      jest.useRealTimers();
    });
  });

  describe('listMessages', () => {
    it('should list all messages for a session', async () => {
      const mockMessages = [
        {
          id: 'msg-1',
          session_id: mockSessionId,
          content: 'Hello',
          role: 'user',
          created_at: new Date().toISOString(),
        },
        {
          id: 'msg-2',
          session_id: mockSessionId,
          content: 'Hi there!',
          role: 'assistant',
          created_at: new Date().toISOString(),
        },
      ];

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockMessages,
          error: null,
        }),
      });

      const messages = await listMessages(mockSessionId);

      expect(messages).toEqual(mockMessages);
      expect(supabase.from).toHaveBeenCalledWith('messages');
    });

    it('should handle timeout gracefully', async () => {
      jest.useFakeTimers();
      
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn(() => new Promise(() => {})), // Never resolves
      });

      const promise = listMessages(mockSessionId);
      jest.advanceTimersByTime(11000);
      
      const messages = await promise;
      expect(messages).toEqual([]);
      
      jest.useRealTimers();
    });
  });

  describe('createChatSession', () => {
    it('should create a new chat session', async () => {
      const mockSession = {
        id: mockSessionId,
        user_id: mockUserId,
        child_id: mockChildId,
        title: 'New Chat',
        created_at: new Date().toISOString(),
      };

      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockSession,
          error: null,
        }),
      });

      const session = await createChatSession(mockUserId, mockChildId, 'New Chat');

      expect(session).toEqual(mockSession);
      expect(supabase.from).toHaveBeenCalledWith('chat_sessions');
    });

    it('should create session without child_id', async () => {
      const mockSession = {
        id: mockSessionId,
        user_id: mockUserId,
        child_id: null,
        title: 'General Chat',
        created_at: new Date().toISOString(),
      };

      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockSession,
          error: null,
        }),
      });

      const session = await createChatSession(mockUserId);

      expect(session.child_id).toBeNull();
    });
  });

  describe('sendChatMessage', () => {
    it('should send a message and get AI response', async () => {
      const mockResponse = {
        session_id: mockSessionId,
        answer: 'This is an AI response',
      };

      // Mock authentication
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: {
          session: {
            user: { id: mockUserId },
            access_token: 'mock-token',
          },
        },
      });

      // Mock usage limit check
      const { UsageLimitService } = require('@/services/usageLimitService');
      (UsageLimitService.checkAndIncrementUsage as jest.Mock).mockResolvedValue({
        allowed: true,
        status: { current_count: 1, limit: 10, remaining: 9 },
      });

      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: mockResponse,
        error: null,
      });

      const response = await sendChatMessage(mockSessionId, 'Hello AI', mockChildId);

      expect(response.session_id).toBe(mockSessionId);
      expect(response.answer).toBe('This is an AI response');
      expect(supabase.functions.invoke).toHaveBeenCalledWith('chat', {
        body: {
          message: 'Hello AI',
          session_id: mockSessionId,
          child_id: mockChildId,
        },
      });
    });

    it('should handle errors from edge function', async () => {
      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Edge function error' },
      });

      await expect(sendChatMessage(mockSessionId, 'Test')).rejects.toThrow();
    });
  });
});
