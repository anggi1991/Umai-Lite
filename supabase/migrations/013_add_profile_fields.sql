-- Add phone and bio columns to profiles table
-- Run this migration to add additional profile fields

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);

-- Add comment
COMMENT ON COLUMN profiles.phone IS 'User phone number';
COMMENT ON COLUMN profiles.bio IS 'User biography/about me (max 200 chars)';
COMMENT ON COLUMN profiles.updated_at IS 'Last profile update timestamp';
