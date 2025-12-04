import { supabase } from './supabaseClient';
import { Child } from '../types/database';

export interface GrowthRecord {
  id: string;
  user_id: string;
  child_id: string;
  record_type: 'weight' | 'height' | 'sleep';
  weight_kg?: number;
  height_cm?: number;
  sleep_hours?: number;
  note?: string;
  measured_at: string;
  created_at: string;
  updated_at: string;
}

export interface GrowthTrend {
  current_value: number;
  previous_value: number;
  change_value: number;
  change_percentage: number;
}

export interface ChartDataPoint {
  measured_date: string; // Original field from RPC
  date: string; // Alias for consistency with statisticsService
  value: number;
  label?: string; // Display label (e.g., "Nov 12")
}

/**
 * Add a new growth record
 */
export async function addGrowthRecord(
  childId: string,
  recordType: 'weight' | 'height' | 'sleep',
  value: number,
  note?: string,
  measuredAt?: Date
): Promise<GrowthRecord> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const recordData: any = {
    user_id: user.id,
    child_id: childId,
    record_type: recordType,
    note,
    measured_at: measuredAt ? measuredAt.toISOString() : new Date().toISOString(),
  };

  // Set the appropriate field based on record type
  if (recordType === 'weight') {
    recordData.weight_kg = value;
  } else if (recordType === 'height') {
    recordData.height_cm = value;
  } else if (recordType === 'sleep') {
    recordData.sleep_hours = value;
  }

  const { data, error } = await supabase
    .from('growth_records')
    .insert(recordData)
    .select()
    .single();

  if (error) throw error;
  return data as GrowthRecord;
}

/**
 * Get all growth records for a child
 */
export async function getGrowthRecords(
  childId: string,
  recordType?: 'weight' | 'height' | 'sleep'
): Promise<GrowthRecord[]> {
  let query = supabase
    .from('growth_records')
    .select('*')
    .eq('child_id', childId)
    .order('measured_at', { ascending: false });

  if (recordType) {
    query = query.eq('record_type', recordType);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as GrowthRecord[];
}

/**
 * Get the latest growth record of a specific type
 */
export async function getLatestGrowthRecord(
  childId: string,
  recordType: 'weight' | 'height' | 'sleep'
): Promise<GrowthRecord | null> {
  const { data, error } = await supabase.rpc('get_latest_growth_record', {
    p_child_id: childId,
    p_record_type: recordType,
  });

  if (error) throw error;
  if (!data || data.length === 0) return null;

  const record = data[0];
  return {
    id: record.id,
    user_id: '',
    child_id: childId,
    record_type: recordType,
    weight_kg: record.weight_kg,
    height_cm: record.height_cm,
    sleep_hours: record.sleep_hours,
    note: record.note,
    measured_at: record.measured_at,
    created_at: '',
    updated_at: '',
  } as GrowthRecord;
}

/**
 * Get monthly growth trend (comparison of last 30 days vs previous 30 days)
 */
export async function getMonthlyGrowthTrend(
  childId: string,
  recordType: 'weight' | 'height' | 'sleep'
): Promise<GrowthTrend | null> {
  const { data, error } = await supabase.rpc('get_monthly_growth_trend', {
    p_child_id: childId,
    p_record_type: recordType,
  });

  if (error) throw error;
  if (!data || data.length === 0) return null;

  return data[0] as GrowthTrend;
}

/**
 * Get chart data for growth tracking (last N months)
 * Used by both /growth-tracker and /statistics screens
 */
export async function getGrowthChartData(
  childId: string,
  recordType: 'weight' | 'height' | 'sleep',
  months: number = 6
): Promise<ChartDataPoint[]> {
  console.log('[GROWTH-CHART] Fetching data:', { childId, recordType, months });
  
  const { data, error } = await supabase.rpc('get_growth_chart_data', {
    p_child_id: childId,
    p_record_type: recordType,
    p_months: months,
  });

  if (error) {
    console.error('[GROWTH-CHART] RPC error:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    console.log('[GROWTH-CHART] No data returned from RPC');
    return [];
  }

  // Format data with consistent label structure
  const formattedData = data.map((d: any) => ({
    date: d.measured_date || d.date,
    value: d.value,
    measured_date: d.measured_date, // Keep original field for compatibility
    label: new Date(d.measured_date || d.date).toLocaleDateString('id-ID', {
      month: 'short',
      day: 'numeric',
    }),
  }));

  console.log('[GROWTH-CHART] Formatted data:', {
    count: formattedData.length,
    sample: formattedData[0]
  });

  return formattedData as ChartDataPoint[];
}

/**
 * Update a growth record
 */
export async function updateGrowthRecord(
  recordId: string,
  updates: {
    value?: number;
    note?: string;
    measured_at?: Date;
  }
): Promise<GrowthRecord> {
  // First get the existing record to know its type
  const { data: existing, error: fetchError } = await supabase
    .from('growth_records')
    .select('*')
    .eq('id', recordId)
    .single();

  if (fetchError) throw fetchError;

  const updateData: any = { note: updates.note };

  if (updates.measured_at) {
    updateData.measured_at = updates.measured_at.toISOString();
  }

  if (updates.value !== undefined) {
    const recordType = existing.record_type;
    if (recordType === 'weight') {
      updateData.weight_kg = updates.value;
    } else if (recordType === 'height') {
      updateData.height_cm = updates.value;
    } else if (recordType === 'sleep') {
      updateData.sleep_hours = updates.value;
    }
  }

  const { data, error } = await supabase
    .from('growth_records')
    .update(updateData)
    .eq('id', recordId)
    .select()
    .single();

  if (error) throw error;
  return data as GrowthRecord;
}

/**
 * Delete a growth record
 */
export async function deleteGrowthRecord(recordId: string): Promise<void> {
  const { error } = await supabase
    .from('growth_records')
    .delete()
    .eq('id', recordId);

  if (error) throw error;
}

/**
 * Get current stats for a child (latest weight, height, and monthly changes)
 */
export async function getCurrentGrowthStats(childId: string) {
  try {
    const [weightRecord, heightRecord, weightTrend, heightTrend] = await Promise.all([
      getLatestGrowthRecord(childId, 'weight'),
      getLatestGrowthRecord(childId, 'height'),
      getMonthlyGrowthTrend(childId, 'weight'),
      getMonthlyGrowthTrend(childId, 'height'),
    ]);

    return {
      weight: {
        current: weightRecord?.weight_kg || null,
        change: weightTrend?.change_value || 0,
        measuredAt: weightRecord?.measured_at || null,
      },
      height: {
        current: heightRecord?.height_cm || null,
        change: heightTrend?.change_value || 0,
        measuredAt: heightRecord?.measured_at || null,
      },
    };
  } catch (error) {
    console.error('Error fetching growth stats:', error);
    throw error;
  }
}
