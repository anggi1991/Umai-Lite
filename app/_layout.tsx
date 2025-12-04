import { Stack } from 'expo-router';
import { AuthProvider } from '../src/contexts/AuthContext';
import { UserPreferencesProvider } from '../src/contexts/UserPreferencesContext';
import { PaperProvider } from 'react-native-paper';
import { useEffect } from 'react';
import Constants from 'expo-constants';
import theme from '../src/theme';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { initializeRevenueCat } from '../src/services/revenueCatService';
import { MainLayout } from '../src/components/layout';
import { i18n } from '../src/i18n';

// Conditionally import and setup notifications only in development builds
let Notifications: any = null;

// Only setup notifications in development builds (not Expo Go)
if (Constants.appOwnership !== 'expo') {
  try {
    Notifications = require('expo-notifications');
    // Global handler: tampilkan alert biasa (sound true) dan tampilkan di foreground
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch (e) {
    console.log('Notifications not available:', e);
  }
}

function NotificationBootstrap() {
  useEffect(() => {
    // Optional: log token pengujian (only in development builds)
    const prepare = async () => {
      if (Notifications && Constants.appOwnership !== 'expo') {
        try {
          // In dev build you could get push token here
          // const token = (await Notifications.getExpoPushTokenAsync()).data;
          // console.log('Expo push token', token);
        } catch (e) {
          console.log('Push token fetch skipped:', e);
        }
      }
    };
    prepare();
  }, []);
  return null;
}

function RevenueCatBootstrap() {
  useEffect(() => {
    const initRC = async () => {
      try {
        console.log('[App] Initializing RevenueCat...');
        await initializeRevenueCat();
        console.log('[App] RevenueCat initialized successfully');
      } catch (error) {
        console.error('[App] RevenueCat initialization error:', error);
      }
    };
    initRC();
  }, []);
  return null;
}

function I18nBootstrap() {
  useEffect(() => {
    const initI18n = async () => {
      try {
        console.log('[App] Initializing i18n...');
        await i18n.init();
        console.log('[App] i18n initialized successfully');
      } catch (error) {
        console.error('[App] i18n initialization error:', error);
      }
    };
    initI18n();
  }, []);
  return null;
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <UserPreferencesProvider>
            <NotificationBootstrap />
            <RevenueCatBootstrap />
            <I18nBootstrap />
            <MainLayout>
              <Stack
                screenOptions={{
                  headerShown: false, // Sembunyikan semua header
                  animation: 'slide_from_right',
                  animationDuration: 300,
                  contentStyle: {
                    backgroundColor: theme.colors.background,
                  },
                }}
              />
            </MainLayout>
          </UserPreferencesProvider>
        </AuthProvider>
      </PaperProvider>
    </ErrorBoundary>
  );
}
