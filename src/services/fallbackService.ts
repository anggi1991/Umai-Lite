// Fallback service untuk saat Edge Functions tidak tersedia
import { supabase } from './supabaseClient';
import { i18n } from '../i18n';

// Simulasi respons chat
export const fallbackChat = async (message: string, sessionId?: string) => {
  const response = {
    answer: i18n.t('fallback.chatResponse', { message: message.slice(0, 50) }),
    session_id: sessionId || '' // Will be set after creating session in DB
  };

  // Get current user for RLS
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('❌ No authenticated user for fallback chat');
    throw new Error('User not authenticated');
  }

  // Simpan percakapan ke database jika bisa
  try {
    // Always create or use existing session
    if (!sessionId) {
      const { data: session, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert([{ 
          title: message.slice(0, 40),
          user_id: user.id // Required for RLS
        }])
        .select()
        .single();
      
      if (sessionError) {
        console.error('❌ Failed to create fallback session:', sessionError);
        throw new Error('Failed to create chat session');
      }
      
      if (session) {
        response.session_id = session.id;
      } else {
        throw new Error('No session returned from database');
      }
    } else {
      response.session_id = sessionId;
    }

    // Now insert messages with valid session_id
    const { error: messagesError } = await supabase.from('messages').insert([
      {
        session_id: response.session_id,
        sender: 'user',
        content: message,
        role: 'user'
      },
      {
        session_id: response.session_id,
        sender: 'assistant',
        content: response.answer,
        role: 'assistant'
      }
    ]);
    
    if (messagesError) {
      console.error('❌ Failed to save fallback messages:', messagesError);
    }
  } catch (e) {
    console.error('❌ Error in fallback chat:', e);
    throw e; // Re-throw to prevent using invalid session_id
  }

  return response;
};

// Simulasi daily tips
export const fallbackGenerateTip = async (childId?: string) => {
  const tips = [
    i18n.t('fallback.tip1'),
    i18n.t('fallback.tip2'),
    i18n.t('fallback.tip3'),
    i18n.t('fallback.tip4'),
    i18n.t('fallback.tip5')
  ];

  const randomTip = tips[Math.floor(Math.random() * tips.length)];
  
  try {
    const now = new Date().toISOString();
    const userId = childId?.split('_')[0] || 'anonymous';
    
    const { data, error } = await supabase
      .from('daily_tips')
      .insert([{
        tip_text: randomTip,
        user_id: userId,
        child_id: childId || null, // Menggunakan null jika tidak ada childId
        model: 'fallback',
        prompt: { source: 'fallback_service', type: 'static' },
        cost_info: { tokens: 0, cost: 0 },
        generated_at: now,
        created_at: now
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    // Memastikan data memiliki semua properti DailyTip yang diperlukan
    return {
      id: data?.id || `fallback_${Date.now()}`,
      user_id: childId?.split('_')[0] || 'anonymous', // Mengambil user_id dari child_id atau default
      child_id: childId || null, // Menggunakan null jika tidak ada childId
      tip_text: data?.tip_text || randomTip,
      model: 'fallback',
      prompt: { source: 'fallback_service', type: 'static' },
      cost_info: { tokens: 0, cost: 0 },
      generated_at: data?.generated_at || new Date().toISOString(),
      created_at: data?.created_at || new Date().toISOString()
    };
  } catch (e) {
    console.error('Error saving fallback tip:', e);
    // Selalu mengembalikan objek dengan semua properti DailyTip
    const now = new Date().toISOString();
    return {
      id: `fallback_${Date.now()}`,
      user_id: childId?.split('_')[0] || 'anonymous',
      child_id: childId || null, // Menggunakan null jika tidak ada childId
      tip_text: randomTip,
      model: 'fallback',
      prompt: { source: 'fallback_service', type: 'static' },
      cost_info: { tokens: 0, cost: 0 },
      generated_at: now,
      created_at: now
    };
  }
};