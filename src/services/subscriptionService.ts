import { supabase } from './supabaseClient';
import { logEvent } from './analyticsService';

/**
 * Subscription Service
 * Manages user subscriptions and billing
 */

export type SubscriptionTier = 'free' | 'premium' | 'family';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | 'paused';

export interface Subscription {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  trial_end: string | null;
  revenue_cat_customer_id: string | null;
  revenue_cat_entitlement_id: string | null;
  platform: 'ios' | 'android' | 'web' | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionTierInfo {
  id: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  limits: {
    ai_tips_per_day: number;
    chat_messages_per_day: number;
    media_storage_gb: number;
    children_profiles: number;
  };
}

export interface SubscriptionStatusInfo {
  isActive: boolean;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  daysRemaining: number;
  nextBillingDate: string | null;
  cancelAtPeriodEnd: boolean;
}

/**
 * Subscription tier definitions
 */
export const SUBSCRIPTION_TIERS: Record<string, SubscriptionTierInfo> = {
  free: {
    id: 'free',
    name: 'Free',
    price_monthly: 0,
    price_yearly: 0,
    features: [
      'subscription.features.aiTipsPerDay',
      'subscription.features.chatMessagesPerDay',
      'subscription.features.basicTracking',
      'subscription.features.oneChildProfile',
      'subscription.features.displayAds',
    ],
    limits: {
      ai_tips_per_day: 3,
      chat_messages_per_day: 10,
      media_storage_gb: 1,
      children_profiles: 1,
    },
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price_monthly: 29000,
    price_yearly: 290000,
    features: [
      'subscription.features.unlimitedAITips',
      'subscription.features.unlimitedChat',
      'subscription.features.advancedTracking',
      'subscription.features.upTo3Profiles',
      'subscription.features.noAds',
      'subscription.features.prioritySupport',
      'subscription.features.offlineMode',
    ],
    limits: {
      ai_tips_per_day: -1, // unlimited
      chat_messages_per_day: -1, // unlimited
      media_storage_gb: 10,
      children_profiles: 3,
    },
  },
  family: {
    id: 'family',
    name: 'Family',
    price_monthly: 79000,
    price_yearly: 799000,
    features: [
      'subscription.features.allPremiumFeatures',
      'subscription.features.unlimitedProfiles',
      'subscription.features.familySharing',
      'subscription.features.customAIPersona',
      'subscription.features.exportAllData',
      'subscription.features.premiumSupport',
    ],
    limits: {
      ai_tips_per_day: -1,
      chat_messages_per_day: -1,
      media_storage_gb: 50,
      children_profiles: -1, // unlimited
    },
  },
};

/**
 * Get current user's subscription
 */
export const getCurrentSubscription = async (): Promise<any | null> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  } catch (err) {
    console.error('Failed to get subscription:', err);
    return null;
  }
};

/**
 * Create or update subscription
 */
export const upsertSubscription = async (
  tier: SubscriptionTier,
  status: SubscriptionStatus,
  expiresAt?: Date,
  metadata?: Record<string, any>,
): Promise<Subscription> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const subscriptionData = {
      user_id: user.id,
      tier,
      status,
      started_at: new Date().toISOString(),
      expires_at: expiresAt?.toISOString() || null,
      metadata: metadata || null,
    };

    const { data, error } = await supabase
      .from('subscriptions')
      .insert([subscriptionData])
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (err) {
    console.error('Failed to upsert subscription:', err);
    throw err;
  }
};

/**
 * Check if user has active subscription
 */
export const hasActiveSubscription = async (): Promise<boolean> => {
  try {
    const subscription = await getCurrentSubscription();

    if (!subscription) return false;

    if (subscription.status !== 'active' && subscription.status !== 'trialing') {
      return false;
    }

    // Support legacy field naming: expires_at OR current_period_end
    const expiryField = (subscription.expires_at || subscription.current_period_end) as
      | string
      | null;
    if (expiryField) {
      const expiryDate = new Date(expiryField);
      if (expiryDate < new Date()) return false;
    }

    return true;
  } catch (err) {
    console.error('Failed to check subscription status:', err);
    return false;
  }
};

/**
 * Check if user is on premium tier
 */
export const isPremiumUser = async (): Promise<boolean> => {
  try {
    const subscription = await getCurrentSubscription();

    if (!subscription) return false;

    const isActive = await hasActiveSubscription();
    return isActive && (subscription.tier === 'premium' || subscription.tier === 'family');
  } catch (err) {
    console.error('Failed to check premium status:', err);
    return false;
  }
};

/**
 * Get subscription tier features
 */
export const getSubscriptionFeatures = (
  tier: SubscriptionTier,
): {
  maxChildren: number;
  aiTipsDaily: number;
  chatMessagesPerDay: number;
  mediaStorageGB: number;
  analytics: boolean;
  prioritySupport: boolean;
} => {
  switch (tier) {
    case 'premium':
      return {
        maxChildren: 3,
        aiTipsDaily: 10,
        chatMessagesPerDay: 100,
        mediaStorageGB: 5,
        analytics: true,
        prioritySupport: true,
      };
    case 'family':
      return {
        maxChildren: 5,
        aiTipsDaily: 20,
        chatMessagesPerDay: 200,
        mediaStorageGB: 10,
        analytics: true,
        prioritySupport: true,
      };
    case 'free':
    default:
      return {
        maxChildren: 3,
        aiTipsDaily: 3,
        chatMessagesPerDay: 20,
        mediaStorageGB: 1,
        analytics: false,
        prioritySupport: false,
      };
  }
};

/**
 * Cancel subscription
 */
export const cancelSubscription = async (): Promise<void> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const subscription = await getCurrentSubscription();

    if (!subscription) {
      throw new Error('No active subscription found');
    }

    // Set flag to cancel at end of billing period (not immediately)
    const { error } = await supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: true,
        canceled_at: new Date().toISOString(),
      })
      .eq('id', subscription.id);

    if (error) throw error;

    await logEvent({
      action: 'subscription_canceled',
      details: { tier: subscription.tier },
    });
  } catch (err) {
    console.error('Failed to cancel subscription:', err);
    throw err;
  }
};

/**
 * Get days remaining in subscription
 */
export const getDaysRemaining = async (): Promise<number | null> => {
  try {
    const subscription = await getCurrentSubscription();

    const expiryField = subscription?.expires_at || subscription?.current_period_end;
    if (!subscription || !expiryField) return null;
    const expiryDate = new Date(expiryField);
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  } catch (err) {
    console.error('Failed to get days remaining:', err);
    return null;
  }
};

/**
 * Initialize free subscription for new users
 */
export const initializeFreeSubscription = async (): Promise<void> => {
  try {
    const existing = await getCurrentSubscription();

    if (existing) {
      console.log('User already has a subscription');
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Insert minimal free subscription record (tests expect array payload)
    const { error } = await supabase.from('subscriptions').insert([
      {
        user_id: user.id,
        tier: 'free',
        status: 'active',
      },
    ]);

    if (error) throw error;

    await logEvent({
      action: 'subscription_initialized',
      details: { tier: 'free' },
    });
  } catch (err) {
    console.error('Failed to initialize free subscription:', err);
    throw err;
  }
};

/**
 * Check if user can access feature based on subscription
 */
export const canAccessFeature = async (
  feature: 'ai_tips' | 'chat' | 'analytics' | 'priority_support',
): Promise<boolean> => {
  try {
    const subscription = await getCurrentSubscription();

    if (!subscription) return false;

    const features = getSubscriptionFeatures(subscription.tier);

    switch (feature) {
      case 'ai_tips':
        return features.aiTipsDaily > 0;
      case 'chat':
        return features.chatMessagesPerDay > 0;
      case 'analytics':
        return features.analytics;
      case 'priority_support':
        return features.prioritySupport;
      default:
        return false;
    }
  } catch (err) {
    console.error('Failed to check feature access:', err);
    return false;
  }
};

/**
 * Get subscription status with computed fields
 */
export const getSubscriptionStatus = async (): Promise<SubscriptionStatusInfo> => {
  try {
    const subscription = await getCurrentSubscription();

    if (!subscription) {
      return {
        isActive: true,
        tier: 'free',
        status: 'active',
        daysRemaining: -1,
        nextBillingDate: null,
        cancelAtPeriodEnd: false,
      };
    }

    const now = new Date();
    const rawPeriodEnd = subscription.current_period_end || subscription.expires_at;
    const periodEnd = new Date(rawPeriodEnd);
    const daysRemaining = Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    const isActive = subscription.status === 'active' || subscription.status === 'trialing';

    return {
      isActive,
      tier: subscription.tier,
      status: subscription.status,
      daysRemaining,
      nextBillingDate: rawPeriodEnd,
      cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
    };
  } catch (error) {
    console.error('Error getting subscription status:', error);
    return {
      isActive: true,
      tier: 'free',
      status: 'active',
      daysRemaining: -1,
      nextBillingDate: null,
      cancelAtPeriodEnd: false,
    };
  }
};

/**
 * Check if user has premium access (Premium or Family tier)
 */
export const hasPremiumAccess = async (): Promise<boolean> => {
  const status = await getSubscriptionStatus();
  return status.isActive && (status.tier === 'premium' || status.tier === 'family');
};

/**
 * Check if user has family tier access
 */
export const hasFamilyAccess = async (): Promise<boolean> => {
  const status = await getSubscriptionStatus();
  return status.isActive && status.tier === 'family';
};

/**
 * Get tier limits for current user
 */
export const getCurrentTierLimits = async () => {
  const status = await getSubscriptionStatus();
  return SUBSCRIPTION_TIERS[status.tier].limits;
};

/**
 * Get tier features for current user
 */
export const getCurrentTierFeatures = async (): Promise<string[]> => {
  const status = await getSubscriptionStatus();
  return SUBSCRIPTION_TIERS[status.tier].features;
};

/**
 * Start a premium trial (3 days for normal, 7 days for referred users)
 */
export const startTrial = async (days: number = 3): Promise<boolean> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Check if user already had a trial
    const existing = await getCurrentSubscription();
    if (existing && existing.trial_end) {
      console.warn('User already had a trial');
      return false;
    }

    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + days);

    const { error } = await supabase.from('subscriptions').upsert({
      user_id: user.id,
      tier: 'premium',
      status: 'trialing',
      current_period_start: new Date().toISOString(),
      current_period_end: trialEnd.toISOString(),
      trial_end: trialEnd.toISOString(),
    });

    if (error) throw error;

    await logEvent({
      action: 'trial_started',
      details: { days, tier: 'premium' },
    });

    return true;
  } catch (error) {
    console.error('Error starting trial:', error);
    return false;
  }
};

/**
 * Upgrade to Premium or Family tier
 */
export const upgradeTier = async (
  tier: 'premium' | 'family',
  billingPeriod: 'monthly' | 'yearly' = 'monthly',
): Promise<string> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // TODO: Integrate with RevenueCat to create purchase

    await logEvent({
      action: 'upgrade_initiated',
      details: { tier, billing: billingPeriod },
    });

    // This will be replaced with actual RevenueCat integration
    return `revenuecat://checkout?tier=${tier}&period=${billingPeriod}`;
  } catch (error) {
    console.error('Error upgrading subscription:', error);
    throw error;
  }
};

/**
 * Reactivate a canceled subscription
 */
export const reactivateSubscription = async (): Promise<boolean> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const subscription = await getCurrentSubscription();
    if (!subscription || !subscription.cancel_at_period_end) {
      throw new Error('No canceled subscription to reactivate');
    }

    // TODO: Reactivate via RevenueCat API

    const { error } = await supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: false,
        canceled_at: null,
      })
      .eq('id', subscription.id);

    if (error) throw error;

    await logEvent({
      action: 'subscription_reactivated',
      details: { tier: subscription.tier },
    });

    return true;
  } catch (error) {
    console.error('Error reactivating subscription:', error);
    return false;
  }
};

/**
 * Get all available subscription tiers
 */
export const getAvailableTiers = (): SubscriptionTierInfo[] => {
  return Object.values(SUBSCRIPTION_TIERS);
};

/**
 * Get tier by ID
 */
export const getTierInfo = (tierId: string): SubscriptionTierInfo | null => {
  return SUBSCRIPTION_TIERS[tierId] || null;
};

/**
 * Calculate savings for yearly billing
 */
export const calculateYearlySavings = (tier: 'premium' | 'family'): number => {
  const tierData = SUBSCRIPTION_TIERS[tier];
  const monthlyTotal = tierData.price_monthly * 12;
  const savings = monthlyTotal - tierData.price_yearly;
  return savings;
};

/**
 * Get subscription pricing in IDR
 */
export const getPricing = () => {
  return {
    premium: {
      monthly: 29000,
      yearly: 29000,
      savings: calculateYearlySavings('premium'),
    },
    family: {
      monthly: 79000,
      yearly: 799000,
      savings: calculateYearlySavings('family'),
    },
  };
};
