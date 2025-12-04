import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as Linking from 'expo-linking';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { supabase, getOrCreateProfile, SUPABASE_URL } from '../services/supabaseClient';
import { trackAppLaunch } from '../services/analyticsService';
import { initializeFreeSubscription } from '../services/subscriptionService';
import { registerForPushNotificationsAsync } from '../services/notificationService';
import { identifyUser, logoutUser } from '../services/revenueCatService';
import { Platform } from 'react-native';

// Helper functions untuk storage yang mendukung web
const setStorageItem = async (key: string, value: string) => {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
};

const deleteStorageItem = async (key: string) => {
  if (Platform.OS === 'web') {
    localStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
};

// Configure Google Sign-In
if (Platform.OS !== 'web') {
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID, // From Google Console
    iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
    offlineAccess: true,
    forceCodeForRefreshToken: true, // Required to get idToken
    scopes: ['profile', 'email'],
  });
}

interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  console.log('[Google Sign-In] Using native Google Sign-In');
  console.log('[Google Sign-In] Client IDs configured:', {
    ios: !!process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
    android: !!process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID,
    web: !!process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
  });

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;
    
    const initAuth = async () => {
      try {
        // Set timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error('Auth initialization timeout')), 5000);
        });
        
        const sessionPromise = supabase.auth.getSession();
        
        const { data } = await Promise.race([sessionPromise, timeoutPromise]) as any;
        clearTimeout(timeoutId);
        
        if (data.session?.user && isMounted) {
          // Ensure profile exists
          try {
            await Promise.race([
              getOrCreateProfile(data.session.user.id, data.session.user.email ?? ''),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Profile creation timeout')), 3000))
            ]);
            
            if (isMounted) {
              setUser({ id: data.session.user.id, email: data.session.user.email ?? '' });
            }
            
            // Track app launch (non-blocking)
            trackAppLaunch().catch(e => console.warn('Track launch failed:', e));
            
            // Initialize free subscription (non-blocking)
            initializeFreeSubscription().catch(e => console.warn('Init subscription failed:', e));
          } catch (error) {
            console.error('Error creating profile:', error);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        clearTimeout(timeoutId);
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    initAuth();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Auth] State change:', event);
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('[Auth] User signed in:', session.user.email);
        
        try {
          // Create or update profile
          await getOrCreateProfile(
            session.user.id,
            session.user.email ?? '',
            session.user.user_metadata?.full_name || session.user.user_metadata?.name,
            session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture
          );

          setUser({
            id: session.user.id,
            email: session.user.email ?? '',
            fullName: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
            avatarUrl: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture,
          });

          await setStorageItem('supabase_token', session.access_token);
          
          // Track app launch and init subscription (non-blocking)
          trackAppLaunch().catch(e => console.warn('Track launch failed:', e));
          initializeFreeSubscription().catch(e => console.warn('Init subscription failed:', e));
          
          console.log('[Auth] Sign-in complete, setting loading to false');
          // Small delay to prevent view hierarchy conflicts during navigation
          setTimeout(() => {
            setLoading(false); // This will allow navigation to dashboard
          }, 100);
        } catch (error) {
          console.error('[Auth] Error during sign-in setup:', error);
          setLoading(false);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('[Auth] User signed out');
        setUser(null);
        await deleteStorageItem('supabase_token');
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.session?.user) {
        // Ensure profile exists (for existing users before trigger was added)
        await getOrCreateProfile(data.session.user.id, data.session.user.email ?? '');
        setUser({ id: data.session.user.id, email: data.session.user.email ?? '' });
        await setStorageItem('supabase_token', data.session.access_token);
        
        // Identify user in RevenueCat (non-blocking)
        identifyUser(data.session.user.id)
          .then(() => console.log('[Auth] RevenueCat user identified'))
          .catch((rcError) => {
            console.warn('[Auth] RevenueCat identification skipped:', rcError.message);
            // Non-fatal error - continue with app functionality
          });
        
        // Track app launch and initialize subscription
        await trackAppLaunch();
        await initializeFreeSubscription();
        
        // Register for push notifications (async, don't block login)
        registerForPushNotificationsAsync().catch(err => 
          console.warn('Failed to register push notifications:', err)
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: 'parentingai://auth-callback', // Deep link untuk magic link / verifikasi email
          data: {
            full_name: fullName || email.split('@')[0], // Use email username as fallback
          }
        }
      });
      if (error) throw error;
      if (data.session?.user) {
        setUser({ id: data.session.user.id, email: data.session.user.email ?? '' });
        await setStorageItem('supabase_token', data.session.access_token);
        
        // Identify user in RevenueCat (non-blocking)
        identifyUser(data.session.user.id)
          .then(() => console.log('[Auth] RevenueCat user identified'))
          .catch((rcError) => {
            console.warn('[Auth] RevenueCat identification skipped:', rcError.message);
            // Non-fatal error - continue with app functionality
          });
        
        // Track app launch and initialize free subscription for new users
        await trackAppLaunch();
        
        // Register for push notifications (async, don't block signup)
        registerForPushNotificationsAsync().catch(err => 
          console.warn('Failed to register push notifications:', err)
        );
        await initializeFreeSubscription();
      }
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    if (Platform.OS === 'web') {
      throw new Error('Google Sign-In not supported on web. Use email/password.');
    }

    setLoading(true);
    
    try {
      console.log('[Google Sign-In] Starting native Google Sign-In...');
      
      // Check if Google Play Services are available
      await GoogleSignin.hasPlayServices();
      
      // Sign in with Google
      const _result = await GoogleSignin.signIn();
      console.log('[Google Sign-In] Sign-in result received');
      
      // Get tokens explicitly
      const tokens = await GoogleSignin.getTokens();
      console.log('[Google Sign-In] Tokens retrieved:', {
        hasIdToken: !!tokens.idToken,
        hasAccessToken: !!tokens.accessToken,
      });
      
      const idToken = tokens.idToken;
      
      if (!idToken) {
        throw new Error('No ID token received from Google');
      }
      
      console.log('[Google Sign-In] ID token received, signing in to Supabase...');
      
      // Sign in to Supabase with Google ID token
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });

      if (error) {
        console.error('[Google Sign-In] Supabase error:', error.message);
        throw error;
      }

      console.log('[Google Sign-In] ✅ Successfully signed in!', {
        email: data.user?.email,
      });
      
      // onAuthStateChange will handle the rest
      
    } catch (error: any) {
      console.error('[Google Sign-In] Error:', error);
      
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('[Google Sign-In] User cancelled sign-in');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('[Google Sign-In] Sign-in already in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error('Google Play Services not available');
      } else {
        throw error;
      }
      
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      console.log('[Auth] Sending password reset email to:', email);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${Linking.createURL('/auth-callback')}`,
      });
      
      if (error) {
        console.error('[Auth] Password reset error:', error);
        throw error;
      }
      
      console.log('[Auth] Password reset email sent successfully');
    } catch (error) {
      console.error('[Auth] Password reset failed:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('[Auth] Signing out...');
      setLoading(true);
      
      // Logout from RevenueCat (switch to anonymous) - non-blocking
      logoutUser()
        .then(() => console.log('[Auth] RevenueCat user logged out'))
        .catch((rcError) => {
          console.warn('[Auth] RevenueCat logout skipped:', rcError.message);
          // Non-fatal error - continue with sign out
        });
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('[Auth] Supabase signOut error:', error);
        throw error;
      }
      
      // Clear local state
      setUser(null);
      await deleteStorageItem('supabase_token');
      
      console.log('[Auth] Sign out successful');
      setLoading(false);
    } catch (error) {
      console.error('[Auth] Sign out failed:', error);
      setLoading(false);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signInWithGoogle, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
