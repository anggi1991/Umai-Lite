import { supabase } from './supabaseClient';
import { logEvent } from './analyticsService';
import { i18n } from '../i18n';

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string | null;
  referral_code: string;
  status: 'pending' | 'completed' | 'rewarded' | 'expired';
  reward_type: string;
  reward_given: boolean;
  reward_given_at: string | null;
  referred_user_email: string | null;
  created_at: string;
  completed_at: string | null;
  expires_at: string;
}

export interface ReferralStats {
  total_referrals: number;
  completed_referrals: number;
  pending_referrals: number;
  total_rewards_earned: number;
  referral_code: string;
}

/**
 * Referral Service
 * Manages user referral program and rewards
 */
export class ReferralService {
  /**
   * Generate a new referral code for the current user
   */
  static async generateReferralCode(): Promise<string> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if user already has an active referral code
      const { data: existing } = await supabase
        .from('referrals')
        .select('referral_code')
        .eq('referrer_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (existing) {
        return existing.referral_code;
      }

      // Generate new referral code using database function
      const { data: code, error } = await supabase.rpc('generate_referral_code');
      
      if (error) throw error;

      // Create referral record
      const { error: insertError } = await supabase
        .from('referrals')
        .insert({
          referrer_id: user.id,
          referral_code: code,
          status: 'pending',
        });

      if (insertError) throw insertError;

      await logEvent({
        action: 'referral_code_generated',
        details: { code },
      });

      return code as string;
    } catch (error) {
      console.error('Error generating referral code:', error);
      throw error;
    }
  }

  /**
   * Get or create referral code for current user
   */
  static async getOrCreateReferralCode(): Promise<string> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check for existing code
      const { data: existing } = await supabase
        .from('referrals')
        .select('referral_code')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (existing) {
        return existing.referral_code;
      }

      // Generate new code
      return await this.generateReferralCode();
    } catch (error) {
      console.error('Error getting referral code:', error);
      throw error;
    }
  }

  /**
   * Apply referral code during signup
   */
  static async applyReferralCode(code: string, newUserEmail?: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Find referral by code
      const { data: referral, error: findError } = await supabase
        .from('referrals')
        .select('*')
        .eq('referral_code', code.toUpperCase())
        .eq('status', 'pending')
        .single();

      if (findError || !referral) {
        console.warn('Invalid or expired referral code:', code);
        return false;
      }

      // Cannot refer yourself
      if (referral.referrer_id === user.id) {
        console.warn('User cannot refer themselves');
        return false;
      }

      // Update referral record
      const { error: updateError } = await supabase
        .from('referrals')
        .update({
          referred_id: user.id,
          referred_user_email: newUserEmail,
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', referral.id);

      if (updateError) throw updateError;

      // Grant extended trial to new user (7 days instead of 3)
      await this.grantExtendedTrial(user.id);

      // Check if referrer should get reward
      await this.checkAndGrantReferrerReward(referral.referrer_id);

      await logEvent({
        action: 'referral_applied',
        details: {
          code,
          referrer_id: referral.referrer_id,
          referred_id: user.id,
        },
      });

      return true;
    } catch (error) {
      console.error('Error applying referral code:', error);
      return false;
    }
  }

  /**
   * Grant extended trial to referred user
   */
  private static async grantExtendedTrial(userId: string): Promise<void> {
    try {
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 7); // 7 days trial

      const { error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          tier: 'premium',
          status: 'trialing',
          current_period_start: new Date().toISOString(),
          current_period_end: trialEndDate.toISOString(),
        });

      if (error) throw error;

      await logEvent({
        action: 'extended_trial_granted',
        details: { user_id: userId, days: 7 },
      });
    } catch (error) {
      console.error('Error granting extended trial:', error);
    }
  }

  /**
   * Check if referrer should get reward and grant it
   */
  private static async checkAndGrantReferrerReward(referrerId: string): Promise<void> {
    try {
      // Count completed referrals for this user
      const { count } = await supabase
        .from('referrals')
        .select('*', { count: 'exact', head: true })
        .eq('referrer_id', referrerId)
        .eq('status', 'completed');

      // Grant 1 month free Premium for each completed referral
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', referrerId)
        .single();

      if (subscription) {
        const currentEnd = new Date(subscription.current_period_end);
        const newEnd = new Date(currentEnd);
        newEnd.setMonth(newEnd.getMonth() + 1); // Add 1 month

        const { error } = await supabase
          .from('subscriptions')
          .update({
            current_period_end: newEnd.toISOString(),
          })
          .eq('user_id', referrerId);

        if (error) throw error;

        // Mark referral as rewarded
        const { error: rewardError } = await supabase
          .from('referrals')
          .update({
            status: 'rewarded',
            reward_given: true,
            reward_given_at: new Date().toISOString(),
          })
          .eq('referrer_id', referrerId)
          .eq('status', 'completed');

        if (rewardError) throw rewardError;

        await logEvent({
          action: 'referral_reward_granted',
          details: {
            referrer_id: referrerId,
            reward_type: 'premium_month',
            total_referrals: count,
          },
        });
      }
    } catch (error) {
      console.error('Error granting referrer reward:', error);
    }
  }

  /**
   * Get referral statistics for current user
   */
  static async getReferralStats(): Promise<ReferralStats> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: referrals, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id);

      if (error) throw error;

      const completed = referrals?.filter(r => r.status === 'completed' || r.status === 'rewarded') || [];
      const pending = referrals?.filter(r => r.status === 'pending') || [];
      const rewarded = referrals?.filter(r => r.reward_given) || [];

      // Get user's referral code
      const code = await this.getOrCreateReferralCode();

      return {
        total_referrals: referrals?.length || 0,
        completed_referrals: completed.length,
        pending_referrals: pending.length,
        total_rewards_earned: rewarded.length,
        referral_code: code,
      };
    } catch (error) {
      console.error('Error getting referral stats:', error);
      return {
        total_referrals: 0,
        completed_referrals: 0,
        pending_referrals: 0,
        total_rewards_earned: 0,
        referral_code: '',
      };
    }
  }

  /**
   * Get referral link for sharing
   */
  static async getReferralLink(): Promise<string> {
    const code = await this.getOrCreateReferralCode();
    // TODO: Replace with actual deep link URL when configured
    return `https://parentingai.app/ref/${code}`;
  }

  /**
   * Share referral link via platform
   */
  static async shareReferral(platform: 'whatsapp' | 'instagram' | 'facebook' | 'copy'): Promise<string> {
    const code = await this.getOrCreateReferralCode();
    const link = await this.getReferralLink();
    
    const message = i18n.t('referral.shareMessage', { code, link });

    await logEvent({
      action: 'referral_shared',
      details: { platform, code },
    });

    switch (platform) {
      case 'whatsapp':
        return `whatsapp://send?text=${encodeURIComponent(message)}`;
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`;
      case 'instagram':
        // Instagram doesn't support direct sharing, return message for clipboard
        return message;
      case 'copy':
        return message;
      default:
        return message;
    }
  }

  /**
   * Get all referrals for current user
   */
  static async getMyReferrals(): Promise<Referral[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []) as Referral[];
    } catch (error) {
      console.error('Error getting referrals:', error);
      return [];
    }
  }
}

// Export convenience functions
export const generateReferralCode = ReferralService.generateReferralCode.bind(ReferralService);
export const getOrCreateReferralCode = ReferralService.getOrCreateReferralCode.bind(ReferralService);
export const applyReferralCode = ReferralService.applyReferralCode.bind(ReferralService);
export const getReferralStats = ReferralService.getReferralStats.bind(ReferralService);
export const getReferralLink = ReferralService.getReferralLink.bind(ReferralService);
export const shareReferral = ReferralService.shareReferral.bind(ReferralService);
export const getMyReferrals = ReferralService.getMyReferrals.bind(ReferralService);
