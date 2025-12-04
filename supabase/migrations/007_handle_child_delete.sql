-- Migration: Handle Activities When Child is Deleted
-- Options: Reassign to another child OR set NULL with flag

-- Timestamp: 2025-01-11
-- Purpose: Prevent orphaned activities when child is deleted

BEGIN;

-- Option A: Reassign ke child lain (default behavior)
CREATE OR REPLACE FUNCTION reassign_activities_on_child_delete()
RETURNS TRIGGER AS $$
DECLARE
  alternative_child_id UUID;
BEGIN
  -- Cari child alternatif untuk user ini (yang bukan child yang dihapus)
  SELECT id INTO alternative_child_id
  FROM children
  WHERE user_id IN (
    SELECT user_id FROM children WHERE id = OLD.id
  )
  AND id != OLD.id
  ORDER BY created_at ASC
  LIMIT 1;
  
  IF alternative_child_id IS NOT NULL THEN
    -- Reassign semua aktivitas ke child alternatif
    UPDATE activities
    SET child_id = alternative_child_id,
        metadata = jsonb_set(
          COALESCE(metadata, '{}'::jsonb),
          '{reassigned_from}',
          to_jsonb(OLD.id::text)
        ),
        metadata = jsonb_set(
          metadata,
          '{reassigned_at}',
          to_jsonb(NOW()::text)
        )
    WHERE child_id = OLD.id;
    
    RAISE NOTICE 'Reassigned % activities from child % to child %', 
      (SELECT COUNT(*) FROM activities WHERE child_id = alternative_child_id),
      OLD.id,
      alternative_child_id;
  ELSE
    -- Tidak ada child alternatif, set NULL dengan flag
    UPDATE activities
    SET child_id = NULL,
        metadata = jsonb_set(
          COALESCE(metadata, '{}'::jsonb),
          '{unlinked}',
          'true'::jsonb
        ),
        metadata = jsonb_set(
          metadata,
          '{unlinked_from}',
          to_jsonb(OLD.id::text)
        ),
        metadata = jsonb_set(
          metadata,
          '{unlinked_at}',
          to_jsonb(NOW()::text)
        )
    WHERE child_id = OLD.id;
    
    RAISE NOTICE 'Set % activities to NULL (no alternative child found)', 
      (SELECT COUNT(*) FROM activities WHERE metadata @> '{"unlinked": true}');
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger BEFORE DELETE
CREATE TRIGGER reassign_activities_before_child_delete
BEFORE DELETE ON children
FOR EACH ROW
EXECUTE FUNCTION reassign_activities_on_child_delete();

-- Verifikasi trigger
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'reassign_activities_before_child_delete';

COMMIT;

-- Test scenarios (opsional)
/*
-- Scenario 1: Delete child ketika ada child lain
-- Harusnya aktivitas di-reassign

-- Scenario 2: Delete child terakhir
-- Harusnya aktivitas di-set NULL dengan flag unlinked
*/
