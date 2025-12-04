-- Migration: Add Database Trigger for Auto-Assign child_id
-- Defensive layer to ensure data integrity at database level

-- Timestamp: 2025-01-11
-- Purpose: Auto-assign child_id even if API layer is bypassed

BEGIN;

-- Create function untuk auto-assign child_id
CREATE OR REPLACE FUNCTION auto_assign_child_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Hanya assign jika child_id NULL dan user_id ada
  IF NEW.child_id IS NULL AND NEW.user_id IS NOT NULL THEN
    -- Ambil child pertama user (oldest by created_at)
    SELECT id INTO NEW.child_id
    FROM children
    WHERE user_id = NEW.user_id
    ORDER BY created_at ASC
    LIMIT 1;
    
    -- Log jika auto-assign berhasil
    IF NEW.child_id IS NOT NULL THEN
      RAISE NOTICE 'Auto-assigned child_id % to activity for user %', NEW.child_id, NEW.user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger yang akan fire sebelum insert
CREATE TRIGGER assign_child_before_insert
BEFORE INSERT ON activities
FOR EACH ROW
EXECUTE FUNCTION auto_assign_child_id();

-- Verifikasi trigger berhasil dibuat
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'assign_child_before_insert';

COMMIT;

-- Test trigger (opsional - uncomment untuk test)
/*
-- Insert test data tanpa child_id
INSERT INTO activities (user_id, type, value)
VALUES (
  (SELECT id FROM profiles LIMIT 1),
  'sleep',
  '30 menit'
) RETURNING id, child_id;
-- Harusnya child_id otomatis terisi
*/
