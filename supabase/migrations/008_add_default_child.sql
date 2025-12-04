-- Migration: Add default_child_id to profiles for user preference

-- Timestamp: 2025-01-11
-- Purpose: Allow user to set preferred default child for activities

BEGIN;

-- Add default_child_id column to profiles
ALTER TABLE profiles 
ADD COLUMN default_child_id UUID REFERENCES children(id) ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX idx_profiles_default_child_id ON profiles(default_child_id);

-- Add comment
COMMENT ON COLUMN profiles.default_child_id IS 'User preferred default child for new activities';

-- Update auto_assign function to check default_child_id first
CREATE OR REPLACE FUNCTION auto_assign_child_id()
RETURNS TRIGGER AS $$
DECLARE
  default_child UUID;
BEGIN
  -- Hanya assign jika child_id NULL dan user_id ada
  IF NEW.child_id IS NULL AND NEW.user_id IS NOT NULL THEN
    -- Step 1: Cek apakah user punya default_child_id di profile
    SELECT default_child_id INTO default_child
    FROM profiles
    WHERE id = NEW.user_id
    AND default_child_id IS NOT NULL;
    
    IF default_child IS NOT NULL THEN
      -- Gunakan default child dari profile
      NEW.child_id := default_child;
      RAISE NOTICE 'Using default child_id % from profile for user %', default_child, NEW.user_id;
    ELSE
      -- Step 2: Jika tidak ada default, ambil child pertama (oldest)
      SELECT id INTO NEW.child_id
      FROM children
      WHERE user_id = NEW.user_id
      ORDER BY created_at ASC
      LIMIT 1;
      
      IF NEW.child_id IS NOT NULL THEN
        RAISE NOTICE 'Auto-assigned first child_id % to activity for user %', NEW.child_id, NEW.user_id;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger dengan function yang updated
DROP TRIGGER IF EXISTS assign_child_before_insert ON activities;
CREATE TRIGGER assign_child_before_insert
BEFORE INSERT ON activities
FOR EACH ROW
EXECUTE FUNCTION auto_assign_child_id();

COMMIT;

-- Helper function untuk set default child
CREATE OR REPLACE FUNCTION set_default_child(
  p_user_id UUID,
  p_child_id UUID
) RETURNS void AS $$
BEGIN
  -- Validasi child milik user
  IF EXISTS (
    SELECT 1 FROM children 
    WHERE id = p_child_id 
    AND user_id = p_user_id
  ) THEN
    UPDATE profiles
    SET default_child_id = p_child_id
    WHERE id = p_user_id;
    
    RAISE NOTICE 'Default child set to % for user %', p_child_id, p_user_id;
  ELSE
    RAISE EXCEPTION 'Child % does not belong to user %', p_child_id, p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION set_default_child TO authenticated;
