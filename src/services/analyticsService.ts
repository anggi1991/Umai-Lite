import { supabase } from './supabaseClient';

/**
 * Analytics Service
 * Logs user actions to audit_logs table for DAU/MAU tracking and analytics
 */

export interface AnalyticsEvent {
  action: string;
  table_name?: string;
  record_id?: string;
  details?: Record<string, any>;
}

/**
 * Log an analytics event
 */
export const logEvent = async (event: AnalyticsEvent): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('Cannot log event: user not authenticated');
      return;
    }

    const { error } = await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: event.action,
      table_name: event.table_name,
      record_id: event.record_id,
      details: event.details,
    });

    if (error) {
      console.error('Failed to log analytics event:', error);
    }
  } catch (err) {
    console.error('Analytics logging error:', err);
  }
};

/**
 * Track app open/launch
 */
export const trackAppLaunch = async (): Promise<void> => {
  await logEvent({
    action: 'app_launch',
    details: {
      timestamp: new Date().toISOString(),
    },
  });
};

/**
 * Track screen view
 */
export const trackScreenView = async (screenName: string): Promise<void> => {
  await logEvent({
    action: 'screen_view',
    details: {
      screen: screenName,
      timestamp: new Date().toISOString(),
    },
  });
};

/**
 * Track feature usage
 */
export const trackFeatureUsage = async (
  featureName: string,
  metadata?: Record<string, any>
): Promise<void> => {
  await logEvent({
    action: 'feature_usage',
    details: {
      feature: featureName,
      ...metadata,
      timestamp: new Date().toISOString(),
    },
  });
};

/**
 * Track activity creation
 */
export const trackActivityCreated = async (
  activityType: string,
  activityId: string
): Promise<void> => {
  await logEvent({
    action: 'activity_created',
    table_name: 'activities',
    record_id: activityId,
    details: {
      type: activityType,
      timestamp: new Date().toISOString(),
    },
  });
};

/**
 * Track chat interaction
 */
export const trackChatInteraction = async (sessionId: string): Promise<void> => {
  await logEvent({
    action: 'chat_interaction',
    table_name: 'chat_sessions',
    record_id: sessionId,
    details: {
      timestamp: new Date().toISOString(),
    },
  });
};

/**
 * Track tip viewed
 */
export const trackTipViewed = async (tipId: string): Promise<void> => {
  await logEvent({
    action: 'tip_viewed',
    table_name: 'daily_tips',
    record_id: tipId,
    details: {
      timestamp: new Date().toISOString(),
    },
  });
};

/**
 * Get DAU (Daily Active Users) count
 * Note: This should ideally run as a scheduled job server-side
 */
export const getDAUCount = async (date: Date = new Date()): Promise<number> => {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('audit_logs')
      .select('user_id', { count: 'exact' })
      .gte('created_at', startOfDay.toISOString())
      .lte('created_at', endOfDay.toISOString());

    if (error) throw error;

    // Count unique users
    const uniqueUsers = new Set(data?.map(log => log.user_id) || []);
    return uniqueUsers.size;
  } catch (err) {
    console.error('Failed to get DAU count:', err);
    return 0;
  }
};

/**
 * Get MAU (Monthly Active Users) count
 * Note: This should ideally run as a scheduled job server-side
 */
export const getMAUCount = async (date: Date = new Date()): Promise<number> => {
  try {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

    const { data, error } = await supabase
      .from('audit_logs')
      .select('user_id', { count: 'exact' })
      .gte('created_at', startOfMonth.toISOString())
      .lte('created_at', endOfMonth.toISOString());

    if (error) throw error;

    // Count unique users
    const uniqueUsers = new Set(data?.map(log => log.user_id) || []);
    return uniqueUsers.size;
  } catch (err) {
    console.error('Failed to get MAU count:', err);
    return 0;
  }
};

/**
 * Get user activity summary
 */
export const getUserActivitySummary = async (
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<{
  totalEvents: number;
  eventsByAction: Record<string, number>;
  lastActive: string | null;
}> => {
  try {
    let query = supabase
      .from('audit_logs')
      .select('action, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (startDate) {
      query = query.gte('created_at', startDate.toISOString());
    }
    if (endDate) {
      query = query.lte('created_at', endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) throw error;

    const eventsByAction: Record<string, number> = {};
    data?.forEach(log => {
      eventsByAction[log.action] = (eventsByAction[log.action] || 0) + 1;
    });

    return {
      totalEvents: data?.length || 0,
      eventsByAction,
      lastActive: data?.[0]?.created_at || null,
    };
  } catch (err) {
    console.error('Failed to get user activity summary:', err);
    return {
      totalEvents: 0,
      eventsByAction: {},
      lastActive: null,
    };
  }
};
