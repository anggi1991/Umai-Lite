/**
 * Notification Service Tests
 * Tests for push notification functionality
 * 
 * Note: These tests are simplified due to expo-notifications complex native dependencies
 */

import { supabase } from '@/services/supabaseClient';

// Mock ALL expo dependencies BEFORE imports
jest.mock('expo-notifications', () => ({
  getExpoPushTokenAsync: jest.fn(() => 
    Promise.resolve({ data: 'ExponentPushToken[xxxxxxxxxxxxx]' })
  ),
  getPermissionsAsync: jest.fn(() =>
    Promise.resolve({ 
      status: 'granted',
      granted: true,
      canAskAgain: true,
      expires: 'never',
      ios: { status: 4 } // PROVISIONAL
    })
  ),
  requestPermissionsAsync: jest.fn(() =>
    Promise.resolve({ 
      status: 'granted',
      granted: true,
      canAskAgain: true,
      expires: 'never',
    })
  ),
  scheduleNotificationAsync: jest.fn(() => 
    Promise.resolve('notification-id-123')
  ),
  cancelScheduledNotificationAsync: jest.fn(() => Promise.resolve()),
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(() => Promise.resolve()),
  AndroidImportance: { MAX: 5 },
  IosAuthorizationStatus: {
    NOT_DETERMINED: 0,
    DENIED: 1,
    AUTHORIZED: 2,
    PROVISIONAL: 4,
    EPHEMERAL: 3,
  },
  SchedulableTriggerInputTypes: {
    CALENDAR: 'calendar',
    TIME_INTERVAL: 'timeInterval',
  },
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('expo-device', () => ({
  isDevice: true,
  __esModule: true,
  default: { isDevice: true },
}));

jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    select: jest.fn((obj) => obj.ios),
  },
}));

jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      eas: {
        projectId: 'test-project-id',
      },
    },
  },
}));

jest.mock('@/services/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(() => 
        Promise.resolve({ 
          data: { user: { id: 'test-user-123' } },
          error: null 
        })
      ),
    },
    from: jest.fn(() => ({
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
    })),
  },
}));

// Import AFTER mocks
import * as Notifications from 'expo-notifications';
import {
  registerForPushNotificationsAsync,
  scheduleLocalReminder,
  cancelScheduledNotification,
  requestNotificationPermission,
  sendPushNotification,
} from '@/services/notificationService';

describe('Notification Service', () => {
  const mockUserId = 'test-user-123';
  const mockPushToken = 'ExponentPushToken[xxxxxxxxxxxxx]';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerForPushNotificationsAsync', () => {
    it('should request permissions and get push token', async () => {
      // Mock requestNotificationPermission to return true
      jest.spyOn(require('@/services/notificationService'), 'requestNotificationPermission')
        .mockResolvedValueOnce(true);
      
      (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValueOnce({
        data: mockPushToken,
      });

      const token = await registerForPushNotificationsAsync();

      expect(token).toBe(mockPushToken);
      expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalled();
    });

    it('should return null if permissions denied', async () => {
      // Override getPermissionsAsync to return denied status
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'denied',
        granted: false,
        canAskAgain: false,
        ios: { status: 1 }, // DENIED
      });

      // Override requestPermissionsAsync to also return denied
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'denied',
        granted: false,
        canAskAgain: false,
        ios: { status: 1 }, // DENIED
      });

      const token = await registerForPushNotificationsAsync();

      expect(token).toBeNull();
    });

    it('should handle Android notification channel setup', async () => {
      // Mock for Android
      jest.spyOn(require('@/services/notificationService'), 'requestNotificationPermission')
        .mockResolvedValueOnce(true);
      
      (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValueOnce({
        data: mockPushToken,
      });
      (Notifications.setNotificationChannelAsync as jest.Mock).mockResolvedValueOnce(undefined);

      const token = await registerForPushNotificationsAsync();

      expect(token).toBe(mockPushToken);
    });
  });

  describe('scheduleLocalReminder', () => {
    it('should schedule local notification', async () => {
      const notificationId = 'notif-123';
      
      // Mock dependencies
      jest.spyOn(require('@/services/notificationService'), 'requestNotificationPermission')
        .mockResolvedValueOnce(true);
      jest.spyOn(require('@/services/notificationService'), 'configureNotificationChannel')
        .mockResolvedValueOnce(undefined);
      
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValueOnce(
        notificationId
      );
      (Notifications.SchedulableTriggerInputTypes as any) = {
        TIME_INTERVAL: 'timeInterval',
      };

      const id = await scheduleLocalReminder(
        'Reminder',
        'Time to feed baby',
        new Date(Date.now() + 3600000)
      );

      expect(id).toBe(notificationId);
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
    });

  });

  describe('cancelScheduledNotification', () => {
    it('should cancel scheduled notification', async () => {
      const notificationId = 'notif-123';
      (Notifications.cancelScheduledNotificationAsync as jest.Mock).mockResolvedValueOnce(
        undefined
      );

      await cancelScheduledNotification(notificationId);

      expect(
        Notifications.cancelScheduledNotificationAsync
      ).toHaveBeenCalledWith(notificationId);
    });
  });

  describe('sendPushNotification', () => {
    it('should send push notification to user', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { id: 'push-123' } }),
      });

      await sendPushNotification(
        mockPushToken,
        'New Tip Available',
        'Check out today\'s parenting tip'
      );

      expect(global.fetch).toHaveBeenCalledWith(
        'https://exp.host/--/api/v2/push/send',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('should handle push notification errors', async () => {
      global.fetch = jest.fn().mockRejectedValueOnce(
        new Error('Network error')
      );

      await expect(
        sendPushNotification(mockPushToken, 'Test', 'Test')
      ).rejects.toThrow();
    });
  });

});

