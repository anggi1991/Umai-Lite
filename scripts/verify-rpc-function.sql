-- =====================================================
-- VERIFY RPC FUNCTION EXISTS AND WORKS
-- =====================================================

-- 1. Check if function exists
SELECT 
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines
WHERE routine_name = 'check_and_increment_usage'
  AND routine_schema = 'public';

-- 2. Test the function directly
SELECT check_and_increment_usage(
  (SELECT auth.uid()),  -- your user_id
  'ai_tips',            -- feature_type
  'free'                -- tier
);

-- 3. Check current usage_limits data
SELECT * FROM usage_limits
WHERE user_id = (SELECT auth.uid())
  AND usage_date = CURRENT_DATE
ORDER BY last_used_at DESC;
