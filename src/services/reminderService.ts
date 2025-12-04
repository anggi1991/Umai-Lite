import { supabase } from './supabaseClient';

export interface ReminderInput {
  child_id?: string; // optional jika reminder umum
  type: string; // e.g. 'immunization' | 'feeding' | 'sleep' | 'custom'
  next_at: string; // ISO timestamp
  timezone?: string;
  recurrence?: Record<string, any>; // { rrule: 'FREQ=DAILY;INTERVAL=1' }
  metadata?: Record<string, any>;
  notification_title?: string;
  notification_message?: string;
}

export interface Reminder extends ReminderInput {
  id: string;
  user_id: string;
  enabled: boolean;
  created_at: string;
  local_notification_id?: string;
}

export const createReminder = async (userId: string, data: ReminderInput): Promise<Reminder> => {
  const payload = {
    user_id: userId,
    enabled: true,
    ...data,
  };
  const { data: inserted, error } = await supabase
    .from('reminders')
    .insert([payload])
    .select()
    .single();
  if (error) throw error;
  return inserted as Reminder;
};

export const getUpcomingReminders = async (userId: string): Promise<Reminder[]> => {
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from('reminders')
    .select('*')
    .eq('user_id', userId)
    .gte('next_at', nowIso)
    .order('next_at', { ascending: true })
    .limit(20);
  if (error) throw error;
  return (data || []) as Reminder[];
};

export interface ReminderUpdate extends Partial<ReminderInput> {
  enabled?: boolean;
  local_notification_id?: string;
  notification_title?: string;
  notification_message?: string;
}

export const updateReminder = async (reminderId: string, updates: ReminderUpdate): Promise<Reminder> => {
  const { data, error } = await supabase
    .from('reminders')
    .update({ ...updates })
    .eq('id', reminderId)
    .select()
    .single();
  if (error) throw error;
  return data as Reminder;
};

export const deleteReminder = async (reminderId: string, userId: string): Promise<{success: boolean, message: string}> => {
  console.log('=== DELETE REMINDER SERVICE ===');
  console.log('Parameters:', { reminderId, userId });

  try {
    // Verifikasi reminder exists dan dimiliki user yang benar
    const { data: existing, error: checkError } = await supabase
      .from('reminders')
      .select('id')
      .match({ id: reminderId, user_id: userId })
      .single();

    if (checkError || !existing) {
      console.error('Reminder tidak ditemukan atau tidak dimiliki user:', { checkError });
      throw new Error('Reminder tidak ditemukan atau Anda tidak memiliki akses');
    }

    console.log('Reminder ditemukan, mencoba menghapus...');
    
    const { error: deleteError } = await supabase
      .from('reminders')
      .delete()
      .match({ id: reminderId, user_id: userId });
      
    if (deleteError) {
      console.error('Gagal menghapus reminder:', deleteError);
      throw new Error(`Gagal menghapus reminder: ${deleteError.message}`);
    }

    console.log('Reminder berhasil dihapus dari database');
    return { 
      success: true, 
      message: 'Reminder berhasil dihapus' 
    };

  } catch (error: any) {
    console.error('Error in deleteReminder service:', error);
    throw new Error(`Gagal menghapus reminder: ${error.message}`);
  }
};
