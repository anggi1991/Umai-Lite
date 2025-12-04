// Database types
export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  locale: string;
  created_at: string;
}

export interface Child {
  id: string;
  user_id: string;
  name: string;
  dob: string;
  gender: string | null;
  photo_url: string | null;
  initial_weight_kg: number | null;
  initial_height_cm: number | null;
  created_at: string;
  updated_at: string;
}

export type ActivityType = 'feeding' | 'sleep' | 'diaper' | 'mood' | 'growth';

export interface Activity {
  id: string;
  user_id: string;
  child_id: string | null;
  type: ActivityType;
  start_time: string | null;
  end_time: string | null;
  duration_seconds: number | null;
  value: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
}

export interface ActivityInput {
  child_id?: string;
  type: ActivityType;
  start_time?: string;
  end_time?: string;
  duration_seconds?: number;
  value?: string;
  metadata?: Record<string, any>;
}

export interface Reminder {
  id: string;
  user_id: string;
  child_id: string | null;
  type: string;
  next_at: string;
  recurrence: Record<string, any> | null;
  timezone: string | null;
  enabled: boolean;
  metadata: Record<string, any> | null;
  created_at: string;
}

export interface DailyTip {
  id: string;
  user_id: string;
  child_id: string | null;
  tip_text: string;
  model: string | null;
  prompt: Record<string, any> | null;
  cost_info: Record<string, any> | null;
  generated_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  child_id: string | null;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  session_id: string;
  sender: 'user' | 'assistant' | 'system';
  role: string | null;
  content: string;
  tokens: number | null;
  model: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
}
