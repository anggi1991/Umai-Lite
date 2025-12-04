import { supabase } from './supabaseClient';
import { ChatSession, Message } from '../types/database';
import { UsageLimitService } from './usageLimitService';
import { fallbackChat } from './fallbackService';

export const listChatSessions = async (userId: string): Promise<ChatSession[]> => {
  try {
    // Add timeout protection - 10 seconds max
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 10000);
    });
    
    const queryPromise = supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    
    const { data, error } = await Promise.race([queryPromise, timeoutPromise]);
    
    if (error) throw error;
    return (data || []) as ChatSession[];
  } catch (error) {
    console.error('❌ Load chat sessions error:', error);
    
    // If timeout, return empty array
    if ((error as Error).message === 'Request timeout') {
      console.warn('⚠️ Chat sessions loading timed out, returning empty array');
      return [];
    }
    
    throw error;
  }
};

export const listMessages = async (sessionId: string): Promise<Message[]> => {
  console.log('📨 listMessages called for session:', sessionId);
  
  try {
    // Add timeout protection - 10 seconds max
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 10000);
    });
    
    const queryPromise = supabase
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
    
    const { data, error } = await Promise.race([queryPromise, timeoutPromise]);
    
    if (error) {
      console.error('❌ listMessages error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      throw error;
    }
    
    console.log('✅ listMessages success:', data?.length || 0, 'messages');
    return (data || []) as Message[];
  } catch (error) {
    console.error('❌ Load messages error:', error);
    console.error('Error message:', (error as Error).message);
    console.error('Error code:', (error as any)?.code);
    
    // If timeout, return empty array instead of throwing
    if ((error as Error).message === 'Request timeout') {
      console.warn('⚠️ Message loading timed out, returning empty array');
      return [];
    }
    
    throw error;
  }
};

export const createChatSession = async (userId: string, childId?: string, title?: string): Promise<ChatSession> => {
  const { data, error } = await supabase
    .from('chat_sessions')
    .insert([{ user_id: userId, child_id: childId || null, title: title || null }])
    .select()
    .single();
  if (error) throw error;
  return data as ChatSession;
};

export const sendChatMessage = async (sessionId: string | undefined, message: string, childId?: string): Promise<{ session_id: string; answer: string; }> => {
  try {
    // Check authentication status
    const { data: { session: authSession } } = await supabase.auth.getSession();
    
    if (!authSession) {
      console.error('❌ No active session - user not authenticated');
      throw new Error('NOT_AUTHENTICATED');
    }

    console.log('✅ User authenticated:', authSession.user.id);
    
    // Check usage limit
    const usageCheck = await UsageLimitService.checkAndIncrementUsage('chat_messages');
    
    if (!usageCheck.allowed) {
      throw new Error('USAGE_LIMIT_REACHED');
    }

    console.log('🚀 Invoking Edge Function: chat');
    console.log('📤 Payload:', { session_id: sessionId, message: message.slice(0, 50), child_id: childId });
    console.log('🔑 Auth token present:', !!authSession.access_token);

    const { data, error } = await supabase.functions.invoke('chat', {
      body: {
        session_id: sessionId,
        message,
        child_id: childId,
      },
    });
    
    console.log('📥 Edge Function Response:', { 
      hasData: !!data, 
      hasError: !!error,
      errorMessage: error?.message,
      errorContext: error?.context
    });
    
    if (error) {
      console.error('❌ Edge Function Error Details:', {
        message: error.message,
        name: error.name,
        context: error.context,
        stack: error.stack
      });
      throw error;
    }
    
    if (!data || !data.answer) {
      console.error('❌ Invalid response from Edge Function:', data);
      throw new Error('INVALID_RESPONSE');
    }
    
    console.log('✅ Edge Function Success - Answer length:', data.answer.length);
    return data as { session_id: string; answer: string; };
  } catch (error) {
    const errorMessage = (error as Error).message;
    
    // If usage limit reached, throw specific error
    if (errorMessage === 'USAGE_LIMIT_REACHED') {
      throw error;
    }

    // If not authenticated, throw to trigger login
    if (errorMessage === 'NOT_AUTHENTICATED') {
      console.error('⚠️ User needs to login');
      throw error;
    }

    console.error('❌ Chat Service Error:', error);
    console.error('Error type:', (error as any)?.constructor?.name);
    console.error('Error message:', errorMessage);
    console.warn('⚠️ Falling back to template response');
    
    // Use fallback
    return fallbackChat(message, sessionId);
  }
};

export const sendChatMessageStreaming = async (
  sessionId: string | undefined, 
  message: string, 
  onChunk: (chunk: string) => void,
  onComplete: (sessionId: string, messageId: string) => void,
  onError: (error: Error) => void,
  childId?: string,
  aiPersona?: string
): Promise<void> => {
  try {
    // Check authentication status
    const { data: { session: authSession } } = await supabase.auth.getSession();
    
    if (!authSession) {
      console.error('❌ No active session - user not authenticated');
      throw new Error('NOT_AUTHENTICATED');
    }

    console.log('✅ User authenticated:', authSession.user.id);
    
    // Check usage limit
    const usageCheck = await UsageLimitService.checkAndIncrementUsage('chat_messages');
    
    if (!usageCheck.allowed) {
      throw new Error('USAGE_LIMIT_REACHED');
    }

    console.log('🚀 Starting streaming chat...');
    console.log('🔍 DEBUG chatService: child_id parameter received:', childId);
    
    // Add timeout protection for Edge Function - 60 seconds max
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        console.error('❌ Edge Function timeout after 60 seconds');
        reject(new Error('EDGE_FUNCTION_TIMEOUT'));
      }, 60000);
    });
    
    // Use Supabase functions invoke method for compatibility
    const invokePromise = supabase.functions.invoke('chat', {
      body: {
        session_id: sessionId,
        message,
        child_id: childId,
        ai_persona: aiPersona, // 🎨 Kirim AI persona untuk custom response style
      },
    });
    
    const { data, error } = await Promise.race([invokePromise, timeoutPromise]);
    
    console.log('🔍 DEBUG chatService: Request body sent:', {
      session_id: sessionId,
      message: message.substring(0, 50),
      child_id: childId,
      ai_persona: aiPersona
    });
    
    console.log('📥 Edge Function Response:', { 
      hasData: !!data, 
      hasError: !!error,
      dataKeys: data ? Object.keys(data) : [],
      data: data
    });
    
    if (error) {
      console.error('❌ Streaming error:', error);
      throw error;
    }
    
    // Check if Edge Function failed silently (only returned session_id)
    if (!data || !data.answer) {
      console.error('❌ Edge Function returned no answer:', data);
      throw new Error('INVALID_RESPONSE');
    }
    
    // Edge Function returns SSE stream, not JSON with answer field
    // We need to check if it's the old format or handle differently
    if (data) {
      // Check if it's the old JSON format with answer field
      if (data.answer) {
        const answer = data.answer;
        const chunkSize = 3; // words per chunk
        const words = answer.split(' ');
        
        for (let i = 0; i < words.length; i += chunkSize) {
          const chunk = words.slice(i, i + chunkSize).join(' ') + (i + chunkSize < words.length ? ' ' : '');
          onChunk(chunk);
          // Small delay to simulate streaming
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        onComplete(data.session_id || sessionId || '', '');
        return;
      }
      
      // If no answer field, Edge Function might be returning streaming format
      // For now, fall back to non-streaming method
      console.log('⚠️ Edge Function returned streaming format, falling back to sendChatMessage');
      const result = await sendChatMessage(sessionId, message, childId);
      
      // Simulate streaming with the result
      const answer = result.answer;
      const chunkSize = 3;
      const words = answer.split(' ');
      
      for (let i = 0; i < words.length; i += chunkSize) {
        const chunk = words.slice(i, i + chunkSize).join(' ') + (i + chunkSize < words.length ? ' ' : '');
        onChunk(chunk);
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      onComplete(result.session_id, '');
      return;
    }
    
    throw new Error('No data received');
  } catch (error) {
    const errorMessage = (error as Error).message;
    
    // If usage limit reached, throw specific error
    if (errorMessage === 'USAGE_LIMIT_REACHED') {
      onError(error as Error);
      return;
    }

    // If not authenticated, throw to trigger login
    if (errorMessage === 'NOT_AUTHENTICATED') {
      console.error('⚠️ User needs to login');
      onError(error as Error);
      return;
    }

    // If Edge Function timeout, provide helpful error
    if (errorMessage === 'EDGE_FUNCTION_TIMEOUT') {
      console.error('❌ Edge Function took too long to respond');
      onError(new Error('The AI is taking too long to respond. Please try again.'));
      return;
    }

    console.error('❌ Streaming Chat Service Error:', error);
    onError(error as Error);
  }
};
