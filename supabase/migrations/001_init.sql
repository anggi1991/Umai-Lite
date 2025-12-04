-- Inisialisasi skema database Parenting AI Assistant
-- Jalankan di Supabase SQL Editor atau via CLI

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE profiles (
  id uuid PRIMARY KEY, -- gunakan auth.users.id dari Supabase
  full_name text,
  email text,
  avatar_url text,
  locale text DEFAULT 'id',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE children (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  dob date NOT NULL,
  gender text,
  photo_url text,
  initial_weight_kg numeric,
  initial_height_cm numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE activities (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  child_id uuid REFERENCES children(id) ON DELETE CASCADE,
  type text NOT NULL,
  start_time timestamptz,
  end_time timestamptz,
  duration_seconds int,
  value text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE reminders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  child_id uuid REFERENCES children(id) ON DELETE CASCADE,
  type text NOT NULL,
  next_at timestamptz NOT NULL,
  recurrence jsonb,
  timezone text,
  enabled boolean DEFAULT true,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE daily_tips (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  child_id uuid REFERENCES children(id),
  tip_text text NOT NULL,
  model text,
  prompt jsonb,
  cost_info jsonb,
  generated_at timestamptz DEFAULT now()
);

CREATE TABLE chat_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  child_id uuid REFERENCES children(id),
  title text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id uuid NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  sender text NOT NULL,
  role text,
  content text NOT NULL,
  tokens int,
  model text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE media (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  child_id uuid REFERENCES children(id),
  url text NOT NULL,
  type text,
  caption text,
  uploaded_at timestamptz DEFAULT now()
);

CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tier text,
  status text,
  started_at timestamptz,
  expires_at timestamptz,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE notification_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id),
  child_id uuid REFERENCES children(id),
  reminder_id uuid REFERENCES reminders(id),
  provider text,
  provider_response jsonb,
  status text,
  sent_at timestamptz DEFAULT now()
);

CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid,
  action text,
  table_name text,
  record_id uuid,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX ON activities(user_id);
CREATE INDEX ON activities(child_id);
CREATE INDEX ON reminders(user_id);
CREATE INDEX ON chat_sessions(user_id);
CREATE INDEX ON messages(session_id);

-- Aktifkan RLS dan policies untuk semua tabel
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_can_manage_own_profile"
  ON profiles USING (id = auth.uid());

ALTER TABLE children ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_can_manage_own_children"
  ON children USING (user_id = auth.uid());

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_can_manage_own_activities"
  ON activities USING (user_id = auth.uid());

ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_can_manage_own_reminders"
  ON reminders USING (user_id = auth.uid());

ALTER TABLE daily_tips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_can_manage_own_tips"
  ON daily_tips USING (user_id = auth.uid());

ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_can_manage_own_chat_sessions"
  ON chat_sessions USING (user_id = auth.uid());

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_can_manage_own_messages"
  ON messages USING (session_id IN (
    SELECT id FROM chat_sessions WHERE user_id = auth.uid()
  ));

ALTER TABLE media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_can_manage_own_media"
  ON media USING (user_id = auth.uid());

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_can_manage_own_subscriptions"
  ON subscriptions USING (user_id = auth.uid());

ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_can_view_own_notifications"
  ON notification_logs USING (user_id = auth.uid());

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_can_view_own_audit_logs"
  ON audit_logs USING (user_id = auth.uid());

-- Function untuk auto-create profile saat user sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger untuk menjalankan function saat user baru dibuat
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
