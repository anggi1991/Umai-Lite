import { supabase } from './supabaseClient';
import { logEvent } from './analyticsService';
import { hasProEntitlement } from './revenueCatService';

export interface UsageStatus {
  current_count: number;
  limit: number;
  remaining: number;
  is_unlimited: boolean;
}

export type FeatureType = 'ai_tips' | 'chat_messages' | 'media_upload';

/**
 * Usage Limit Service
 * Manages feature usage limits based on subscription tier
 */
export class UsageLimitService {
  /**
   * Check if user can use a feature and increment usage counter
   */
  static async checkAndIncrementUsage(
    featureType: FeatureType,
    userId?: string
  ): Promise<{ allowed: boolean; status: UsageStatus }> {
    try {
      // Check RevenueCat Pro entitlement first
      const hasPro = await hasProEntitlement();
      
      // If user has Pro, allow unlimited access
      if (hasPro) {
        return {
          allowed: true,
          status: {
            current_count: 0,
            limit: 999999,
            remaining: 999999,
            is_unlimited: true,
          },
        };
      }
      
      // Get current user subscription tier from Supabase (fallback)
      console.log('[UsageLimitService] Getting user subscription tier...');
      let tier = 'free'; // Default to free
      
      try {
        let currentUserId = userId;
        if (!currentUserId) {
          const { data: userData } = await supabase.auth.getUser();
          currentUserId = userData.user?.id;
        }
        console.log('[UsageLimitService] Current user ID:', currentUserId);
        
        if (!currentUserId) {
          console.warn('[UsageLimitService] No user ID available');
          tier = 'free';
        } else {
          const { data: subscription, error: subError } = await supabase
            .from('subscriptions')
            .select('tier')
            .eq('user_id', currentUserId)
            .eq('status', 'active')
            .single();
          
          if (subError) {
            console.warn('[UsageLimitService] Subscription query error:', subError.message);
          } else {
            tier = subscription?.tier || 'free';
            console.log('[UsageLimitService] User tier:', tier);
          }
        }
        
      } catch (err) {
        console.warn('[UsageLimitService] Error fetching subscription, defaulting to free:', err);
      }

      // Call database function to check and increment
      console.log('[UsageLimitService] Calling check_and_increment_usage RPC...');
      
      // Ensure we have a valid user_id
      let currentUserId = userId;
      if (!currentUserId) {
        const { data: userData } = await supabase.auth.getUser();
        currentUserId = userData.user?.id;
      }
      
      if (!currentUserId) {
        console.error('[UsageLimitService] No user_id found! User must be signed in.');
        throw new Error('User not authenticated');
      }
      
      console.log('[UsageLimitService] Using user_id:', currentUserId);
      
      const { data, error } = await supabase.rpc('check_and_increment_usage', {
        p_user_id: currentUserId,
        p_feature_type: featureType,
        p_tier: tier,
      });

      console.log('[UsageLimitService] RPC result:', { data, error });
      console.log('[UsageLimitService] RPC data type:', typeof data);
      console.log('[UsageLimitService] RPC data stringified:', JSON.stringify(data));
      
      if (error) {
        console.error('[UsageLimitService] RPC error:', error);
        throw error;
      }

      // Parse the JSONB result - Supabase returns it directly as data
      const result = data as { allowed: boolean; current_count: number; limit: number; remaining: number };
      
      console.log('[UsageLimitService] Parsed result:', result);
      console.log('[UsageLimitService] Parsed result stringified:', JSON.stringify(result));
      
      // Validate result structure and handle null values
      if (result.allowed === null || result.allowed === undefined) {
        console.error('[UsageLimitService] RPC returned null values - function may not be working correctly');
        console.error('[UsageLimitService] This usually means the database function is not executing properly');
        console.error('[UsageLimitService] Please run verify-rpc-function.sql in Supabase SQL Editor');
        
        // Fallback: allow usage but warn
        console.warn('[UsageLimitService] Falling back to allow usage (fail-open mode)');
        return {
          allowed: true,
          status: {
            current_count: 0,
            limit: 3,
            remaining: 3,
            is_unlimited: false,
          },
        };
      }

      // Track analytics if limit reached
      if (!result.allowed) {
        await logEvent({
          action: 'usage_limit_reached',
          details: {
            feature: featureType,
            tier,
            limit: result.limit,
          },
        });
        
        // Throw error for limit reached
        throw new Error('USAGE_LIMIT_REACHED');
      }

      return {
        allowed: result.allowed,
        status: {
          current_count: result.current_count,
          limit: result.limit,
          remaining: result.remaining,
          is_unlimited: tier !== 'free',
        },
      };
    } catch (error) {
      // Re-throw USAGE_LIMIT_REACHED errors
      if (error instanceof Error && error.message === 'USAGE_LIMIT_REACHED') {
        throw error;
      }
      
      console.error('Error checking usage limit:', error);
      // Allow usage on error (fail open)
      return {
        allowed: true,
        status: {
          current_count: 0,
          limit: 999,
          remaining: 999,
          is_unlimited: false,
        },
      };
    }
  }

  /**
   * Get current usage status without incrementing
   */
  static async getUsageStatus(
    featureType: FeatureType,
    userId?: string
  ): Promise<UsageStatus> {
    try {
      // Get current user subscription tier
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('tier')
        .eq('user_id', userId || supabase.auth.getUser().then(u => u.data.user?.id))
        .eq('status', 'active')
        .single();

      const tier = subscription?.tier || 'free';

      // Call database function to get status
      const { data, error } = await supabase.rpc('get_usage_status', {
        p_user_id: userId || (await supabase.auth.getUser()).data.user?.id,
        p_feature_type: featureType,
        p_tier: tier,
      });

      if (error) throw error;

      const result = data as UsageStatus;
      
      // Normalize null to 0 for current_count
      return {
        ...result,
        current_count: result.current_count ?? 0,
      };
    } catch (error) {
      console.error('Error getting usage status:', error);
      return {
        current_count: 0,
        limit: 999,
        remaining: 999,
        is_unlimited: false,
      };
    }
  }

  /**
   * Get usage status for all features
   */
  static async getAllUsageStatus(userId?: string): Promise<Record<FeatureType, UsageStatus>> {
    const [tipsStatus, chatStatus, mediaStatus] = await Promise.all([
      this.getUsageStatus('ai_tips', userId),
      this.getUsageStatus('chat_messages', userId),
      this.getUsageStatus('media_upload', userId),
    ]);

    return {
      ai_tips: tipsStatus,
      chat_messages: chatStatus,
      media_upload: mediaStatus,
    };
  }

  /**
   * Reset usage for testing (development only)
   */
  static async resetUsage(featureType: FeatureType, userId?: string): Promise<void> {
    if (process.env.NODE_ENV !== 'development') {
      console.warn('resetUsage should only be called in development');
      return;
    }

    try {
      const { error } = await supabase
        .from('usage_limits')
        .delete()
        .eq('user_id', userId || (await supabase.auth.getUser()).data.user?.id)
        .eq('feature_type', featureType)
        .eq('usage_date', new Date().toISOString().split('T')[0]);

      if (error) throw error;

      console.log(`Reset usage for ${featureType}`);
    } catch (error) {
      console.error('Error resetting usage:', error);
    }
  }
}

// Export convenience functions
export const checkAndIncrementUsage = UsageLimitService.checkAndIncrementUsage.bind(UsageLimitService);
export const getUsageStatus = UsageLimitService.getUsageStatus.bind(UsageLimitService);
export const getAllUsageStatus = UsageLimitService.getAllUsageStatus.bind(UsageLimitService);
