-- Quick verification query to check current state of activities table
-- Run this BEFORE migration to establish baseline

SELECT 
  '🔍 PRE-MIGRATION CHECK' as phase,
  COUNT(*) as total_activities,
  COUNT(CASE WHEN child_id IS NOT NULL THEN 1 END) as with_child_id,
  COUNT(CASE WHEN child_id IS NULL THEN 1 END) as null_child_id,
  ROUND(COUNT(CASE WHEN child_id IS NULL THEN 1 END) * 100.0 / COUNT(*), 2) as percentage_null
FROM activities;

-- Check how many users have children
SELECT 
  '👥 USERS WITH CHILDREN' as info,
  COUNT(DISTINCT user_id) as total_users_with_children
FROM children;

-- Check users with activities but no children (edge case)
SELECT 
  '⚠️ EDGE CASES' as warning,
  COUNT(DISTINCT a.user_id) as users_with_activities_no_children
FROM activities a
LEFT JOIN children c ON c.user_id = a.user_id
WHERE a.child_id IS NULL 
  AND c.id IS NULL;

-- Sample of NULL activities
SELECT 
  '📋 SAMPLE NULL ACTIVITIES' as info,
  a.id,
  a.type,
  a.user_id,
  a.created_at,
  (SELECT COUNT(*) FROM children WHERE user_id = a.user_id) as user_children_count
FROM activities a
WHERE a.child_id IS NULL
ORDER BY a.created_at DESC
LIMIT 10;
