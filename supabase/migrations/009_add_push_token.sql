-- Migration: Add push notification token fields to profiles table
-- This allows storing Expo Push Tokens for sending push notifications

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS push_token TEXT,
ADD COLUMN IF NOT EXISTS push_token_updated_at TIMESTAMPTZ;

-- Create index for faster lookup by push token
CREATE INDEX IF NOT EXISTS idx_profiles_push_token ON profiles(push_token);

-- Comment on columns
COMMENT ON COLUMN profiles.push_token IS 'Expo Push Token for sending push notifications';
COMMENT ON COLUMN profiles.push_token_updated_at IS 'Timestamp when push token was last updated';
