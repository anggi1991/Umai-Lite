import { supabase } from './supabaseClient';
import { logEvent } from './analyticsService';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_name: string;
  category: 'engagement' | 'milestone' | 'social' | 'learning';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  unlock_criteria: any; // JSON object with criteria
  points_reward: number;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  progress: number;
  is_displayed: boolean;
  badge?: Badge;
}

export interface BadgeProgress {
  badge: Badge;
  progress: number;
  unlocked: boolean;
  earned_at?: string;
}

/**
 * Badge Service
 * Manages gamification badges and achievements
 */
export class BadgeService {
  /**
   * Get all available badges
   */
  static async getAllBadges(): Promise<Badge[]> {
    try {
      console.log('[BadgeService] Querying badges table...');
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .order('tier', { ascending: true })
        .order('category', { ascending: true });

      if (error) {
        console.error('[BadgeService] Database error:', error);
        throw error;
      }

      console.log('[BadgeService] Badges query successful, count:', data?.length || 0);
      return (data || []) as Badge[];
    } catch (error) {
      console.error('[BadgeService] Error getting badges:', error);
      console.error('[BadgeService] Error type:', typeof error);
      console.error('[BadgeService] Error stack:', error instanceof Error ? error.stack : 'No stack');
      return [];
    }
  }

  /**
   * Get badges by category
   */
  static async getBadgesByCategory(category: Badge['category']): Promise<Badge[]> {
    try {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .eq('category', category)
        .order('tier', { ascending: true });

      if (error) throw error;

      return (data || []) as Badge[];
    } catch (error) {
      console.error('Error getting badges by category:', error);
      return [];
    }
  }

  /**
   * Get user's earned badges
   */
  static async getUserBadges(): Promise<UserBadge[]> {
    try {
      console.log('[BadgeService] Getting user badges...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('[BadgeService] User not authenticated for getUserBadges');
        throw new Error('User not authenticated');
      }

      console.log('[BadgeService] Querying user_badges for user:', user.id);
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          *,
          badge:badges(*)
        `)
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (error) {
        console.error('[BadgeService] User badges query error:', error);
        throw error;
      }

      console.log('[BadgeService] User badges query successful, count:', data?.length || 0);
      return (data || []) as UserBadge[];
    } catch (error) {
      console.error('[BadgeService] Error getting user badges:', error);
      console.error('[BadgeService] Error details:', JSON.stringify(error, null, 2));
      return [];
    }
  }

  /**
   * Get user's badge progress for all badges
   */
  static async getUserBadgeProgress(): Promise<BadgeProgress[]> {
    try {
      console.log('[BadgeService] Getting user badge progress...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('[BadgeService] User not authenticated');
        throw new Error('User not authenticated');
      }
      console.log('[BadgeService] User authenticated:', user.id);

      // Get all badges
      console.log('[BadgeService] Fetching all badges...');
      const allBadges = await this.getAllBadges();
      console.log('[BadgeService] All badges fetched:', allBadges.length);

      // Get user's earned badges
      console.log('[BadgeService] Fetching user badges...');
      const earnedBadges = await this.getUserBadges();
      console.log('[BadgeService] User badges fetched:', earnedBadges.length);

      // Combine into progress objects
      const progress: BadgeProgress[] = allBadges.map(badge => {
        const userBadge = earnedBadges.find(ub => ub.badge_id === badge.id);
        
        return {
          badge,
          progress: userBadge?.progress || 0,
          unlocked: !!userBadge,
          earned_at: userBadge?.earned_at,
        };
      });

      console.log('[BadgeService] Badge progress calculated:', progress.length);
      return progress;
    } catch (error) {
      console.error('[BadgeService] Error getting badge progress:', error);
      console.error('[BadgeService] Error details:', JSON.stringify(error, null, 2));
      return [];
    }
  }

  /**
   * Check if user should receive any badges and award them
   */
  static async checkAndAwardBadges(): Promise<UserBadge[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Call database function to check and award badges
      const { data, error } = await supabase.rpc('check_and_award_badges', {
        p_user_id: user.id,
      });

      if (error) throw error;

      const newBadges = (data || []) as UserBadge[];

      // Log analytics for each new badge
      for (const badge of newBadges) {
        await logEvent({
          action: 'badge_earned',
          details: {
            badge_id: badge.badge_id,
            progress: badge.progress,
          },
        });
      }

      return newBadges;
    } catch (error) {
      console.error('Error checking badges:', error);
      return [];
    }
  }

  /**
   * Update progress for a specific badge
   */
  static async updateBadgeProgress(badgeId: string, progress: number): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if user already has this badge
      const { data: existing } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', user.id)
        .eq('badge_id', badgeId)
        .single();

      if (existing) {
        // Update progress
        const { error } = await supabase
          .from('user_badges')
          .update({ progress })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Create new progress record
        const { error } = await supabase
          .from('user_badges')
          .insert({
            user_id: user.id,
            badge_id: badgeId,
            progress,
          });

        if (error) throw error;
      }

      // Check if badge should be awarded
      await this.checkAndAwardBadges();
    } catch (error) {
      console.error('Error updating badge progress:', error);
    }
  }

  /**
   * Set badge as displayed on profile
   */
  static async setDisplayedBadge(userBadgeId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Unset all other displayed badges
      await supabase
        .from('user_badges')
        .update({ is_displayed: false })
        .eq('user_id', user.id);

      // Set this badge as displayed
      const { error } = await supabase
        .from('user_badges')
        .update({ is_displayed: true })
        .eq('id', userBadgeId)
        .eq('user_id', user.id);

      if (error) throw error;

      await logEvent({
        action: 'badge_displayed',
        details: { user_badge_id: userBadgeId },
      });
    } catch (error) {
      console.error('Error setting displayed badge:', error);
    }
  }

  /**
   * Get user's currently displayed badge
   */
  static async getDisplayedBadge(): Promise<UserBadge | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          *,
          badge:badges(*)
        `)
        .eq('user_id', user.id)
        .eq('is_displayed', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return (data as UserBadge) || null;
    } catch (error) {
      console.error('Error getting displayed badge:', error);
      return null;
    }
  }

  /**
   * Get total badge points for user
   */
  static async getTotalBadgePoints(): Promise<number> {
    try {
      console.log('[BadgeService] Getting total badge points...');
      const userBadges = await this.getUserBadges();
      
      const totalPoints = userBadges.reduce((sum, ub) => {
        return sum + (ub.badge?.points_reward || 0);
      }, 0);

      console.log('[BadgeService] Total points calculated:', totalPoints);
      return totalPoints;
    } catch (error) {
      console.error('[BadgeService] Error getting badge points:', error);
      return 0;
    }
  }

  /**
   * Get badge completion percentage
   */
  static async getBadgeCompletionPercentage(): Promise<number> {
    try {
      console.log('[BadgeService] Getting badge completion percentage...');
      const allBadges = await this.getAllBadges();
      const earnedBadges = await this.getUserBadges();

      if (allBadges.length === 0) {
        console.log('[BadgeService] No badges available, returning 0%');
        return 0;
      }

      const percentage = Math.round((earnedBadges.length / allBadges.length) * 100);
      console.log('[BadgeService] Completion percentage:', percentage);
      return percentage;
    } catch (error) {
      console.error('[BadgeService] Error getting badge completion:', error);
      return 0;
    }
  }

  /**
   * Get badges by tier
   */
  static async getBadgesByTier(tier: Badge['tier']): Promise<Badge[]> {
    try {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .eq('tier', tier)
        .order('category', { ascending: true });

      if (error) throw error;

      return (data || []) as Badge[];
    } catch (error) {
      console.error('Error getting badges by tier:', error);
      return [];
    }
  }

  /**
   * Get recent badge unlocks (for notifications/feed)
   */
  static async getRecentBadgeUnlocks(limit: number = 5): Promise<UserBadge[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error} = await supabase
        .from('user_badges')
        .select(`
          *,
          badge:badges(*)
        `)
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []) as UserBadge[];
    } catch (error) {
      console.error('Error getting recent badges:', error);
      return [];
    }
  }

  /**
   * Get next badge to unlock for motivation
   */
  static async getNextBadgeToUnlock(): Promise<BadgeProgress | null> {
    try {
      console.log('[BadgeService] Getting next badge to unlock...');
      const progress = await this.getUserBadgeProgress();
      
      // Filter to badges not yet unlocked
      const locked = progress.filter(p => !p.unlocked);
      console.log('[BadgeService] Locked badges count:', locked.length);
      
      // Sort by progress descending (closest to unlock)
      locked.sort((a, b) => b.progress - a.progress);

      const nextBadge = locked[0] || null;
      console.log('[BadgeService] Next badge to unlock:', nextBadge?.badge.name || 'None');
      return nextBadge;
    } catch (error) {
      console.error('[BadgeService] Error getting next badge:', error);
      return null;
    }
  }
}

// Export convenience functions
export const getAllBadges = BadgeService.getAllBadges.bind(BadgeService);
export const getBadgesByCategory = BadgeService.getBadgesByCategory.bind(BadgeService);
export const getUserBadges = BadgeService.getUserBadges.bind(BadgeService);
export const getUserBadgeProgress = BadgeService.getUserBadgeProgress.bind(BadgeService);
export const checkAndAwardBadges = BadgeService.checkAndAwardBadges.bind(BadgeService);
export const updateBadgeProgress = BadgeService.updateBadgeProgress.bind(BadgeService);
export const setDisplayedBadge = BadgeService.setDisplayedBadge.bind(BadgeService);
export const getDisplayedBadge = BadgeService.getDisplayedBadge.bind(BadgeService);
export const getTotalBadgePoints = BadgeService.getTotalBadgePoints.bind(BadgeService);
export const getBadgeCompletionPercentage = BadgeService.getBadgeCompletionPercentage.bind(BadgeService);
export const getNextBadgeToUnlock = BadgeService.getNextBadgeToUnlock.bind(BadgeService);
