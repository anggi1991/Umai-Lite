import { supabase } from './supabaseClient';
import { DailyTip } from '../types/database';
import { UsageLimitService } from './usageLimitService';
import { fallbackGenerateTip } from './fallbackService';

interface GenerateTipPayload {
  child_id?: string;
  context?: string; // tambahan info dari UI
  language?: string; // 'id', 'en', 'zh', 'jp'
  bypassLimit?: boolean; // New: Allow bypassing limit if ad watched
}

export const generateDailyTip = async (payload: GenerateTipPayload): Promise<DailyTip> => {
  try {
    console.log('[dailyTipsService] Checking usage limit before generating tip...');

    // Check usage limit first, unless bypassed
    if (!payload.bypassLimit) {
      const usageCheck = await UsageLimitService.checkAndIncrementUsage('ai_tips');

      console.log('[dailyTipsService] Usage check result:', {
        allowed: usageCheck.allowed,
        current: usageCheck.status.current_count,
        limit: usageCheck.status.limit,
        remaining: usageCheck.status.remaining,
      });

      if (!usageCheck.allowed) {
        console.warn('[dailyTipsService] Usage limit reached!');
        throw new Error('USAGE_LIMIT_REACHED');
      }
    } else {
      console.log('[dailyTipsService] Bypassing usage limit (Rewarded Ad)');
    }

    console.log('[dailyTipsService] Calling Edge Function generate-tip...');
    const { data, error } = await supabase.functions.invoke('generate-tip', {
      body: payload,
    });
    if (error) throw error;

    console.log('[dailyTipsService] Tip generated successfully');
    return data as DailyTip;
  } catch (error) {
    // If usage limit reached, throw specific error
    if ((error as Error).message === 'USAGE_LIMIT_REACHED') {
      throw error;
    }

    console.warn('[dailyTipsService] Edge Function tidak tersedia, menggunakan fallback:', error);
    return fallbackGenerateTip(payload.child_id);
  }
};

export const getLatestTip = async (userId: string, childId?: string): Promise<DailyTip | null> => {
  let query = supabase
    .from('daily_tips')
    .select('*')
    .eq('user_id', userId)
    .order('generated_at', { ascending: false })
    .limit(1);
  if (childId) query = query.eq('child_id', childId);
  const { data, error } = await query;
  if (error) throw error;
  return data && data.length ? (data[0] as DailyTip) : null;
};
