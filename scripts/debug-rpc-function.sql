-- =====================================================
-- DEBUG RPC FUNCTION - Find the exact issue
-- =====================================================

-- Step 1: Check your auth.uid()
SELECT 
  auth.uid() as my_user_id,
  auth.email() as my_email;

-- Step 2: Check if usage_limits table exists and accessible
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_name = 'usage_limits';

-- Step 3: Try manual INSERT (this will show exact error)
INSERT INTO usage_limits (user_id, feature_type, usage_date, usage_count, last_used_at)
VALUES (
  (SELECT auth.uid()),
  'ai_tips',
  CURRENT_DATE,
  1,
  NOW()
)
ON CONFLICT (user_id, feature_type, usage_date)
DO UPDATE SET
  usage_count = usage_limits.usage_count + 1,
  last_used_at = NOW()
RETURNING *;

-- Step 4: Check RLS policies on usage_limits
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'usage_limits';

-- Step 5: Try the function with explicit parameters
SELECT check_and_increment_usage(
  '36c7f204-68ab-4921-8f55-d3cea9cd24d3'::uuid,  -- your actual user_id
  'ai_tips',
  'free'
);
