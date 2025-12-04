import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, ActivityIndicator, Button } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '../src/services/supabaseClient';
import * as Linking from 'expo-linking';

// Handle OAuth callback from Supabase (Google Sign-In, etc.)
export default function AuthCallbackScreen() {
  const [error, setError] = useState<string | null>(null);
  const params = useLocalSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('[Auth Callback] Processing OAuth callback...');
        console.log('[Auth Callback] URL Params:', params);
        
        // IMPORTANT: For Expo Go, we need to poll for session
        // because OAuth redirect doesn't work properly with deep links
        console.log('[Auth Callback] Polling for session (Expo Go workaround)...');
        
        let attempts = 0;
        const maxAttempts = 10;
        
        while (attempts < maxAttempts) {
          attempts++;
          console.log(`[Auth Callback] Attempt ${attempts}/${maxAttempts}...`);
          
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (session) {
            console.log('[Auth Callback] ✅ Session found!', {
              email: session.user?.email,
              attempt: attempts,
            });
            
            // Wait a bit for AuthContext to process
            await new Promise(resolve => setTimeout(resolve, 500));
            router.replace('/dashboard');
            return;
          }
          
          if (sessionError) {
            console.error('[Auth Callback] Session error:', sessionError);
          }
          
          // Wait before next attempt
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // No session after all attempts
        console.log('[Auth Callback] ❌ No session after polling');
        
        // Fallback: Try to extract tokens from URL (only if no session)
        const url = await Linking.getInitialURL();
        console.log('[Auth Callback] No session, checking URL:', url);
        
        if (url) {
          const hashIndex = url.indexOf('#');
          if (hashIndex !== -1) {
            const hash = url.substring(hashIndex + 1);
            const urlParams = new URLSearchParams(hash);
            
            const accessToken = urlParams.get('access_token');
            const refreshToken = urlParams.get('refresh_token');
            
            console.log('[Auth Callback] Tokens found:', {
              hasAccessToken: !!accessToken,
              hasRefreshToken: !!refreshToken,
            });
            
            if (accessToken && refreshToken) {
              console.log('[Auth Callback] Setting session with tokens...');
              
              const { error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
              
              if (sessionError) {
                console.error('[Auth Callback] Session error:', sessionError);
                throw sessionError;
              }
              
              console.log('[Auth Callback] Session set successfully!');
              
              // Wait for auth state change to propagate
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              console.log('[Auth Callback] Redirecting to dashboard...');
              router.replace('/dashboard');
              return;
            }
          }
        }
        
        // Final fallback: No session found after timeout
        console.log('[Auth Callback] ⚠️ No session found after waiting, redirecting to sign in...');
        router.replace('/(auth)/signin');
      } catch (err: any) {
        console.error('[Auth Callback] Error:', err.message);
        setError(err.message || 'Terjadi kesalahan saat login');
      }
    };

    handleCallback();
  }, [params]);

  if (error) {
    return (
      <View style={styles.container}>
        <Text variant="headlineSmall" style={styles.title}>Terjadi Kesalahan</Text>
        <Text style={styles.text}>{error}</Text>
        <Button 
          mode="contained" 
          onPress={() => router.replace('/(auth)/signin')}
          style={styles.button}
        >
          Kembali ke Login
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
      <Text style={styles.text}>Menyelesaikan login...</Text>
      <Text style={[styles.text, { marginTop: 20, fontSize: 12, color: '#666' }]}>
        Jika stuck disini, tekan tombol back pada browser OAuth dan kembali ke app
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { marginBottom: 16, fontWeight: 'bold', textAlign: 'center' },
  text: { textAlign: 'center', marginBottom: 12 },
  url: { fontSize: 12, color: '#666', marginBottom: 20 },
  button: { alignSelf: 'center' },
});
