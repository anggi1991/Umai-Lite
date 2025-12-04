import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { supabase } from './supabaseClient';

// Conditionally import notifications only in development builds (not Expo Go)
let Notifications: any = null;
let Device: any = null;

// Only import notifications in development builds (not Expo Go)
if (Constants.appOwnership !== 'expo') {
  try {
    Notifications = require('expo-notifications');
    Device = require('expo-device');
    
    // Configure how notifications are presented when app is in foreground
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch (e) {
    console.warn('Notifications not available in Expo Go. Use development build for push notifications.');
  }
}

export const cancelScheduledNotification = async (id: string) => {
  if (!Notifications) {
    console.log('Notifications not available in Expo Go');
    return;
  }
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch (e) {
    console.warn('Failed to cancel notification', id, e);
  }
};

// Konfigurasi default untuk notifikasi (Android channel)
export const configureNotificationChannel = async () => {
  if (!Notifications) {
    console.log('Notifications not available in Expo Go');
    return;
  }
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!Notifications) {
    console.log('Notifications not available in Expo Go');
    return false;
  }
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return true;
  }
  const req = await Notifications.requestPermissionsAsync();
  return req.granted || req.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL || false;
};

export const scheduleLocalReminder = async (title: string, body: string, date: Date) => {
  // Web platform fallback menggunakan browser notifications
  if (Platform.OS === 'web') {
    try {
      if (!("Notification" in window)) {
        console.log("Browser tidak mendukung notifikasi");
        return null;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        console.warn('Permission not granted for web notifications');
        return null;
      }

      // Simpan reminder di localStorage untuk web
      const reminderId = `reminder_${Date.now()}`;
      const reminder = { title, body, date: date.toISOString() };
      localStorage.setItem(reminderId, JSON.stringify(reminder));

      // Schedule reminder menggunakan setTimeout
      const diffMs = date.getTime() - Date.now();
      if (diffMs <= 0) return null;

      setTimeout(() => {
        new Notification(title, { body });
        localStorage.removeItem(reminderId);
      }, diffMs);

      return reminderId;
    } catch (e) {
      console.warn('Failed to schedule web notification:', e);
      return null;
    }
  }

  // Native platform implementation
  if (!Notifications) {
    console.log('Notifications not available in Expo Go. Use development build.');
    return null;
  }

  // Pastikan permission
  const granted = await requestNotificationPermission();
  if (!granted) {
    console.warn('Permission not granted for notifications');
    return null;
  }

  await configureNotificationChannel();

  // For SDK 54, use seconds trigger
  const diffMs = date.getTime() - Date.now();
  if (diffMs <= 0) return null;
  
  const trigger: any = { 
    type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
    seconds: Math.floor(diffMs / 1000),
    repeats: false,
  };
  
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: { 
        title, 
        body,
        sound: true,
      },
      trigger,
    });
    return id;
  } catch (e) {
    console.warn('Failed to schedule notification:', e);
    return null;
  }
};

/**
 * Register device for push notifications and get Expo Push Token
 * This token is needed to send push notifications from server
 */
export const registerForPushNotificationsAsync = async (): Promise<string | null> => {
  if (Platform.OS === 'web') {
    console.log('Push notifications not supported on web');
    return null;
  }

  if (!Notifications || !Device) {
    console.log('Push notifications not available in Expo Go. Use development build.');
    return null;
  }

  try {
    // Check if running on physical device
    if (!Device.isDevice) {
      console.log('Push notifications require a physical device');
      return null;
    }

    // Request permission
    const granted = await requestNotificationPermission();
    if (!granted) {
      console.warn('Permission not granted for push notifications');
      return null;
    }

    // Get Expo Push Token
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) {
      console.warn('EAS project ID not configured');
      return null;
    }

    const token = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    console.log('Expo Push Token:', token.data);

    // Save token to Supabase for the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('profiles')
        .update({ 
          push_token: token.data,
          push_token_updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      
      console.log('Push token saved to profile');
    }

    return token.data;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
  }
};

/**
 * Send a push notification to a specific user (server-side or admin function)
 * In production, this should be called from your backend/Edge Function
 */
export const sendPushNotification = async (
  expoPushToken: string,
  title: string,
  body: string,
  data?: Record<string, any>
) => {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title,
    body,
    data: data || {},
  };

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();
    console.log('Push notification sent:', result);
    return result;
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw error;
  }
};
