import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Ambil konfigurasi dari app.config.js (expo.extra) atau fallback ke process.env
export const SUPABASE_URL =
  (Constants.expoConfig?.extra as any)?.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY =
  (Constants.expoConfig?.extra as any)?.SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // jangan lempar error di runtime build, hanya log supaya developer sadar
  // Saat production pastikan nilai ini di-set melalui EAS secrets / environment
  console.warn('Supabase config kosong. Pastikan EXPO_PUBLIC_SUPABASE_URL dan EXPO_PUBLIC_SUPABASE_ANON_KEY di-set.');
}

// Custom storage for better session persistence
import AsyncStorage from '@react-native-async-storage/async-storage';

const customStorage = {
  getItem: async (key: string) => {
    try {
      const value = await AsyncStorage.getItem(key);
      // Log in production for debugging (remove after stable)
      if (!__DEV__ && value) {
        console.log('[Storage] Retrieved session key');
      }
      return value;
    } catch (error) {
      console.error('[Storage] Error getting item:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
      // Log in production for debugging (remove after stable)
      if (!__DEV__) {
        console.log('[Storage] Saved session key');
      }
    } catch (error) {
      console.error('[Storage] Error setting item:', error);
      // Don't throw - allow app to continue
    }
  },
  removeItem: async (key: string) => {
    try {
      await AsyncStorage.removeItem(key);
      if (!__DEV__) {
        console.log('[Storage] Removed session key');
      }
    } catch (error) {
      console.error('[Storage] Error removing item:', error);
    }
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: customStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  // Konfigurasi fetch untuk Edge Functions
  global: {
    fetch: (url, options = {}) => {
      // Hapus header yang tidak diizinkan
      const headers = options.headers as Record<string, string>;
      delete headers['Access-Control-Allow-Origin'];
      
      return fetch(url, {
        ...options,
        headers,
      });
    },
  },
  // Fallback function for chat
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export default supabase;

// Helper untuk get atau create profile
export const getOrCreateProfile = async (
  userId: string, 
  email: string, 
  fullName?: string,
  avatarUrl?: string
) => {
  try {
    // Coba get profile dulu
    let { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();  // Gunakan maybeSingle untuk handle null tanpa error
    
    // Jika dapat error selain "not found", throw
    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    // Jika profile sudah ada
    if (existingProfile) {
      // Update jika ada data baru
      if ((fullName || avatarUrl) && (!existingProfile.full_name || !existingProfile.avatar_url)) {
        const updateData: any = {};
        if (fullName && !existingProfile.full_name) updateData.full_name = fullName;
        if (avatarUrl && !existingProfile.avatar_url) updateData.avatar_url = avatarUrl;
        
        if (Object.keys(updateData).length > 0) {
          const { data: updatedProfile, error: updateError } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', userId)
            .select()
            .single();
            
          if (updateError) throw updateError;
          return updatedProfile;
        }
      }
      return existingProfile;
    }

    // Jika profile tidak ada, buat baru
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert([{
        id: userId,
        email: email,
        full_name: fullName || email.split('@')[0],
        avatar_url: avatarUrl,
      }])
      .select()
      .single();

    if (insertError) {
      if (insertError.code === '42501') {
        console.error('[RLS ERROR] Migration 003_fix_rls_policies.sql belum dijalankan');
      }
      throw insertError;
    }

    if (!newProfile) {
      throw new Error('Failed to create profile');
    }

    return newProfile;
  } catch (err) {
    console.error('getOrCreateProfile error:', err);
    throw err;
  }
};

// Helper placeholder (tambahkan fungsi auth / query sesuai kebutuhan)
export const getProfile = async (userId: string) => {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) throw error;
  return data;
};
