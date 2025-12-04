-- Migration: Fix Foreign Key Constraints for Child Delete
-- Date: 2025-11-28
-- Issue: chat_sessions.child_id foreign key blocks child deletion (error 23503)

BEGIN;

-- Drop existing foreign key constraint
ALTER TABLE chat_sessions
DROP CONSTRAINT IF EXISTS chat_sessions_child_id_fkey;

-- Recreate with ON DELETE SET NULL (chat sessions should persist even if child is deleted)
ALTER TABLE chat_sessions
ADD CONSTRAINT chat_sessions_child_id_fkey
FOREIGN KEY (child_id)
REFERENCES children(id)
ON DELETE SET NULL;

-- Also check and fix daily_tips table (same pattern)
ALTER TABLE daily_tips
DROP CONSTRAINT IF EXISTS daily_tips_child_id_fkey;

ALTER TABLE daily_tips
ADD CONSTRAINT daily_tips_child_id_fkey
FOREIGN KEY (child_id)
REFERENCES children(id)
ON DELETE SET NULL;

-- Media table (same pattern)
ALTER TABLE media
DROP CONSTRAINT IF EXISTS media_child_id_fkey;

ALTER TABLE media
ADD CONSTRAINT media_child_id_fkey
FOREIGN KEY (child_id)
REFERENCES children(id)
ON DELETE SET NULL;

-- Verify the changes
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_name = 'children'
  AND kcu.column_name = 'child_id'
ORDER BY tc.table_name;

COMMIT;
