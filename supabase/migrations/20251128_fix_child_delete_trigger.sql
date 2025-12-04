-- Migration: Fix Multiple Metadata Assignments in Child Delete Trigger
-- Date: 2025-11-28
-- Issue: PostgreSQL error 42601 - "multiple assignments to same column 'metadata'"

BEGIN;

-- Drop existing trigger first
DROP TRIGGER IF EXISTS reassign_activities_before_child_delete ON children;

-- Replace function with fixed version (nested jsonb_set calls)
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
    -- ✅ FIX: Nested jsonb_set untuk avoid multiple assignments
    UPDATE activities
    SET child_id = alternative_child_id,
        metadata = jsonb_set(
          jsonb_set(
            COALESCE(metadata, '{}'::jsonb),
            '{reassigned_from}',
            to_jsonb(OLD.id::text)
          ),
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
    -- ✅ FIX: Triple-nested jsonb_set
    UPDATE activities
    SET child_id = NULL,
        metadata = jsonb_set(
          jsonb_set(
            jsonb_set(
              COALESCE(metadata, '{}'::jsonb),
              '{unlinked}',
              'true'::jsonb
            ),
            '{unlinked_from}',
            to_jsonb(OLD.id::text)
          ),
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

-- Recreate trigger with fixed function
CREATE TRIGGER reassign_activities_before_child_delete
BEFORE DELETE ON children
FOR EACH ROW
EXECUTE FUNCTION reassign_activities_on_child_delete();

-- Verify trigger
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'reassign_activities_before_child_delete';

COMMIT;
