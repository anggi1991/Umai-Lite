import { supabase } from './supabaseClient';
import { Activity } from '../types/database';
import { 
  getGrowthChartData as getGrowthChartDataFromService,
  ChartDataPoint as GrowthChartDataPoint
} from './growthService';

// Re-export ChartDataPoint for backward compatibility
export type ChartDataPoint = GrowthChartDataPoint;

/**
 * Statistik untuk satu tipe aktivitas
 */
export interface ActivityStats {
  count: number;
  lastRecorded: string | null;
  averagePerDay: number;
  trend: 'up' | 'down' | 'stable';
}

/**
 * Rangkuman semua statistik
 */
export interface ComprehensiveStats {
  feeding: ActivityStats;
  sleep: ActivityStats;
  diaper: ActivityStats;
  mood: ActivityStats;
  growth: ActivityStats;
  totalActivities: number;
  period: string; // e.g., "Last 7 days"
}

/**
 * NOTE: ChartDataPoint is now imported from growthService for consistency
 * Both /growth-tracker and /statistics now use the same interface
 */

/**
 * Get activities untuk periode tertentu (default 7 hari)
 */
export async function getActivitiesForPeriod(
  userId: string,
  childId?: string,
  days: number = 7
): Promise<Activity[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  console.log('[GET-ACTIVITIES-PERIOD] Query params:', {
    userId,
    childId,
    days,
    startDate: startDate.toISOString()
  });

  let query = supabase
    .from('activities')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false });

  if (childId) {
    console.log('[GET-ACTIVITIES-PERIOD] Filtering by child_id:', childId);
    query = query.eq('child_id', childId);
  } else {
    console.log('[GET-ACTIVITIES-PERIOD] No child_id filter applied');
  }

  const { data, error } = await query;
  
  if (error) {
    console.error('[GET-ACTIVITIES-PERIOD] Query error:', error);
    throw error;
  }

  console.log('[GET-ACTIVITIES-PERIOD] Query result:', {
    count: data?.length || 0,
    sample: data?.slice(0, 3).map(a => ({
      id: a.id,
      type: a.type,
      child_id: a.child_id,
      created_at: a.created_at
    }))
  });

  return data as Activity[];
}

/**
 * Calculate statistics untuk satu tipe aktivitas
 */
function calculateActivityStats(
  activities: Activity[],
  type: string,
  days: number
): ActivityStats {
  const filtered = activities.filter((a) => a.type === type);
  const count = filtered.length;

  const lastActivity = filtered[0]; // Already sorted desc
  const lastRecorded = lastActivity ? lastActivity.created_at : null;

  const averagePerDay = count / days;

  // Simple trend: compare first half vs second half
  const midpoint = Math.floor(filtered.length / 2);
  const firstHalf = filtered.slice(midpoint).length;
  const secondHalf = filtered.slice(0, midpoint).length;

  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (secondHalf > firstHalf * 1.2) trend = 'up';
  else if (secondHalf < firstHalf * 0.8) trend = 'down';

  return {
    count,
    lastRecorded,
    averagePerDay: parseFloat(averagePerDay.toFixed(1)),
    trend,
  };
}

/**
 * Get comprehensive statistics rangkuman semua aktivitas
 */
export async function getComprehensiveStats(
  userId: string,
  childId?: string,
  days: number = 7
): Promise<ComprehensiveStats> {
  const activities = await getActivitiesForPeriod(userId, childId, days);

  return {
    feeding: calculateActivityStats(activities, 'feeding', days),
    sleep: calculateActivityStats(activities, 'sleep', days),
    diaper: calculateActivityStats(activities, 'diaper', days),
    mood: calculateActivityStats(activities, 'mood', days),
    growth: calculateActivityStats(activities, 'growth', days),
    totalActivities: activities.length,
    period: `Last ${days} days`,
  };
}

/**
 * Get chart data untuk satu tipe aktivitas (count per day)
 */
export async function getActivityChartData(
  userId: string,
  activityType: string,
  childId?: string,
  days: number = 7
): Promise<ChartDataPoint[]> {
  const activities = await getActivitiesForPeriod(userId, childId, days);
  const filtered = activities.filter((a) => a.type === activityType);

  // Group by date
  const countByDate: Record<string, number> = {};

  // Initialize all dates with 0
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    const dateKey = date.toISOString().split('T')[0];
    countByDate[dateKey] = 0;
  }

  // Count activities per date
  filtered.forEach((activity) => {
    const dateKey = activity.created_at.split('T')[0];
    if (dateKey in countByDate) {
      countByDate[dateKey]++;
    }
  });

  // Convert to chart data format (match ChartDataPoint interface)
  return Object.entries(countByDate).map(([date, value]) => ({
    date,
    measured_date: date, // Alias for compatibility
    value,
    label: new Date(date).toLocaleDateString('id-ID', { 
      month: 'short', 
      day: 'numeric' 
    }),
  }));
}

/**
 * Get sleep duration chart data (hours per day)
 * Mengambil dari activities.duration_seconds
 */
export async function getSleepDurationChart(
  userId: string,
  childId?: string,
  days: number = 7
): Promise<ChartDataPoint[]> {
  console.log('[SLEEP-CHART] Fetching sleep data for user:', userId, 'child:', childId, 'days:', days);
  
  const activities = await getActivitiesForPeriod(userId, childId, days);
  console.log('[SLEEP-CHART] Total activities fetched:', activities.length);
  
  const sleepActivities = activities.filter((a) => a.type === 'sleep');
  console.log('[SLEEP-CHART] Sleep activities found:', sleepActivities.length);
  console.log('[SLEEP-CHART] Sleep activities:', sleepActivities.map(a => ({
    id: a.id,
    child_id: a.child_id,
    duration_seconds: a.duration_seconds,
    created_at: a.created_at
  })));

  // Group by date and sum duration
  const durationByDate: Record<string, number> = {};

  // Initialize all dates
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    const dateKey = date.toISOString().split('T')[0];
    durationByDate[dateKey] = 0;
  }

  // Sum sleep duration per date
  sleepActivities.forEach((activity) => {
    const dateKey = activity.created_at.split('T')[0];
    
    // Try to get duration from duration_seconds field first, fallback to metadata
    let durationHours = 0;
    
    if (activity.duration_seconds && activity.duration_seconds > 0) {
      durationHours = activity.duration_seconds / 3600; // Convert seconds to hours
    } else if (activity.metadata?.duration_minutes) {
      // Backward compatibility: extract from metadata
      durationHours = activity.metadata.duration_minutes / 60; // Convert minutes to hours
    }
    
    console.log('[SLEEP-CHART] Processing activity:', {
      dateKey,
      duration_seconds: activity.duration_seconds,
      metadata_duration_minutes: activity.metadata?.duration_minutes,
      calculated_hours: durationHours,
      hasDateKey: dateKey in durationByDate
    });
    
    if (dateKey in durationByDate && durationHours > 0) {
      durationByDate[dateKey] += durationHours;
    }
  });

  const chartResult = Object.entries(durationByDate).map(([date, value]) => ({
    date,
    measured_date: date, // Alias for compatibility with ChartDataPoint interface
    value: parseFloat(value.toFixed(1)),
    label: new Date(date).toLocaleDateString('id-ID', { 
      weekday: 'short' 
    }),
  }));

  console.log('[SLEEP-CHART] Final chart data:', chartResult);
  console.log('[SLEEP-CHART] Total duration by date:', durationByDate);

  return chartResult;
}

/**
 * Get weight/height chart from growth_records (for Berat/Tinggi tabs)
 * Now uses shared implementation from growthService to ensure consistency
 */
export async function getGrowthChartData(
  childId: string,
  recordType: 'weight' | 'height',
  months: number = 6
): Promise<ChartDataPoint[]> {
  console.log('[STATISTICS] Using shared getGrowthChartData from growthService');
  return getGrowthChartDataFromService(childId, recordType, months);
}
