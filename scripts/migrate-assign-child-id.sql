-- Migration: Auto-assign child_id untuk aktivitas dengan NULL child_id
-- Mengatasi masalah data yang tidak sync karena child_id = NULL

-- Timestamp: 2025-01-11
-- Purpose: Assign child_id ke aktivitas yang NULL berdasarkan child pertama user
-- SAFETY: Full backup before migration

BEGIN;

-- STEP 1: FULL BACKUP untuk safety
CREATE TABLE IF NOT EXISTS activities_backup_20250111 AS 
SELECT * FROM activities;

RAISE NOTICE 'Backup created: activities_backup_20250111 with % rows', 
  (SELECT COUNT(*) FROM activities_backup_20250111);

-- STEP 2: Backup hanya data yang akan diupdate
CREATE TEMP TABLE activities_to_update AS 
SELECT * FROM activities WHERE child_id IS NULL;

-- Update aktivitas dengan child_id = NULL
-- Assign ke child pertama user (berdasarkan created_at ascending)
UPDATE activities
SET child_id = (
  SELECT id 
  FROM children 
  WHERE children.user_id = activities.user_id 
  ORDER BY created_at ASC 
  LIMIT 1
)
WHERE child_id IS NULL
  AND user_id IN (
    -- Hanya untuk user yang punya child
    SELECT DISTINCT user_id FROM children
  );

-- Verifikasi hasil
DO $$
DECLARE
  updated_count INTEGER;
  remaining_null INTEGER;
BEGIN
  -- Hitung jumlah yang diupdate
  SELECT COUNT(*) INTO updated_count
  FROM activities
  WHERE child_id IS NOT NULL
    AND user_id IN (
      SELECT user_id FROM activities_backup
    );
  
  -- Hitung sisa yang masih NULL (user tanpa child)
  SELECT COUNT(*) INTO remaining_null
  FROM activities
  WHERE child_id IS NULL;
  
  RAISE NOTICE 'Migration Complete:';
  RAISE NOTICE '  - Updated: % activities', updated_count;
  RAISE NOTICE '  - Remaining NULL: % activities (users without children)', remaining_null;
END $$;

COMMIT;

-- Drop backup table setelah selesai (opsional)
-- DROP TABLE activities_backup;

-- Verification query
-- Jalankan setelah migration untuk memastikan hasil
SELECT 
  'After Migration' as status,
  COUNT(*) as total_activities,
  COUNT(CASE WHEN child_id IS NOT NULL THEN 1 END) as with_child_id,
  COUNT(CASE WHEN child_id IS NULL THEN 1 END) as null_child_id,
  ROUND(COUNT(CASE WHEN child_id IS NOT NULL THEN 1 END) * 100.0 / COUNT(*), 2) as percentage_assigned
FROM activities;


-- ==============================================
-- POST-MIGRATION VERIFICATION QUERIES
-- ==============================================

-- Query 1: Check backup integrity
SELECT 
  COUNT(*) as backup_count,
  MIN(created_at) as oldest_record,
  MAX(created_at) as newest_record
FROM activities_backup_20250111;

-- Query 2: Activities yang di-update
SELECT 
  a.id,
  a.type,
  a.child_id as new_child_id,
  a.metadata->>'auto_assigned' as was_auto_assigned,
  a.metadata->>'migrated_at' as migrated_at
FROM activities a
WHERE a.metadata @> '{"migrated": true}'
ORDER BY a.created_at DESC
LIMIT 20;

-- Query 3: Check untuk NULL yang masih ada (edge case)
SELECT 
  p.id as profile_id,
  COUNT(DISTINCT c.id) as children_count,
  COUNT(a.id) as activities_with_null
FROM profiles p
LEFT JOIN children c ON c.user_id = p.id
LEFT JOIN activities a ON a.user_id = p.id AND a.child_id IS NULL
GROUP BY p.id
HAVING COUNT(DISTINCT c.id) > 0 AND COUNT(a.id) > 0;

-- Query 4: Verify auto-assign distribution
SELECT 
  child_id,
  COUNT(*) as activity_count,
  COUNT(*) FILTER (WHERE metadata @> '{"migrated": true}') as migrated_count
FROM activities
WHERE child_id IS NOT NULL
GROUP BY child_id
ORDER BY migrated_count DESC
LIMIT 10;

-- ==============================================
-- ROLLBACK PROCEDURE (if needed)
-- ==============================================

/*
⚠️ WARNING: Only use if migration failed or produced unexpected results

-- To rollback the migration:

BEGIN;

-- Step 1: Find activities yang di-migrate
CREATE TEMP TABLE migrated_ids AS
SELECT id FROM activities WHERE metadata @> '{"migrated": true}';

-- Step 2: Delete migrated activities
DELETE FROM activities WHERE id IN (SELECT id FROM migrated_ids);

-- Step 3: Restore dari backup
INSERT INTO activities 
SELECT * FROM activities_backup_20250111
WHERE id IN (SELECT id FROM migrated_ids);

-- Step 4: Verify rollback
SELECT 
  COUNT(*) as restored_count,
  COUNT(CASE WHEN child_id IS NULL THEN 1 END) as restored_null_count
FROM activities a
WHERE EXISTS (SELECT 1 FROM migrated_ids m WHERE m.id = a.id);

-- If verification looks good:
COMMIT;

-- If something wrong:
ROLLBACK;

RAISE NOTICE '✅ Rollback completed successfully';
*/
