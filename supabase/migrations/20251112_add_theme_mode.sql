-- Add theme_mode column to profiles table
-- Migration: 20251112_add_theme_mode

-- Add theme_mode column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS theme_mode TEXT CHECK (theme_mode IN ('light', 'dark')) DEFAULT 'light';

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_theme_mode ON profiles(theme_mode);

-- Add comment
COMMENT ON COLUMN profiles.theme_mode IS 'User preferred theme mode: light or dark';
