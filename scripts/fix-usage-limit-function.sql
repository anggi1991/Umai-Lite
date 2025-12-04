-- =====================================================
-- FIX USAGE LIMIT RPC FUNCTION
-- =====================================================
-- Purpose: Recreate check_and_increment_usage function with proper permissions
-- Run this in Supabase SQL Editor if RPC returns null
-- =====================================================

-- Step 1: Drop existing function (if any)
DROP FUNCTION IF EXISTS check_and_increment_usage(UUID, TEXT, TEXT);

-- Step 2: Recreate function with better error handling
CREATE OR REPLACE FUNCTION check_and_increment_usage(
  p_user_id UUID,
  p_feature_type TEXT,
  p_tier TEXT
) RETURNS JSONB AS $$
DECLARE
  v_limit INTEGER;
  v_current_count INTEGER;
  v_allowed BOOLEAN;
BEGIN
  -- Validate inputs
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'p_user_id cannot be null';
  END IF;

  IF p_feature_type IS NULL OR p_feature_type NOT IN ('ai_tips', 'chat_messages', 'media_upload') THEN
    RAISE EXCEPTION 'Invalid feature_type: %', p_feature_type;
  END IF;

  -- Set limits based on tier
  IF p_tier = 'free' THEN
    v_limit := CASE p_feature_type
      WHEN 'ai_tips' THEN 3
      WHEN 'chat_messages' THEN 10
      WHEN 'media_upload' THEN 20
      ELSE 0
    END;
  ELSE
    -- Premium, Family, or other tiers get unlimited
    v_limit := 999999;
  END IF;

  -- Get current usage for today
  SELECT COALESCE(usage_count, 0) INTO v_current_count
  FROM usage_limits
  WHERE user_id = p_user_id
    AND feature_type = p_feature_type
    AND usage_date = CURRENT_DATE;

  -- If no record found, initialize to 0
  IF v_current_count IS NULL THEN
    v_current_count := 0;
  END IF;

  -- Check if allowed
  v_allowed := v_current_count < v_limit;

  -- If allowed, increment counter
  IF v_allowed THEN
    INSERT INTO usage_limits (user_id, feature_type, usage_date, usage_count, last_used_at)
    VALUES (p_user_id, p_feature_type, CURRENT_DATE, 1, NOW())
    ON CONFLICT (user_id, feature_type, usage_date)
    DO UPDATE SET
      usage_count = usage_limits.usage_count + 1,
      last_used_at = NOW();

    -- Update count after increment
    v_current_count := v_current_count + 1;
  END IF;

  -- Return result as JSONB
  RETURN jsonb_build_object(
    'allowed', v_allowed,
    'current_count', v_current_count,
    'limit', v_limit,
    'remaining', GREATEST(0, v_limit - v_current_count)
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Log error and return safe fallback
    RAISE WARNING 'Error in check_and_increment_usage: %', SQLERRM;
    RETURN jsonb_build_object(
      'allowed', false,
      'current_count', 0,
      'limit', v_limit,
      'remaining', 0,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Grant permissions
GRANT EXECUTE ON FUNCTION check_and_increment_usage(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION check_and_increment_usage(UUID, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION check_and_increment_usage(UUID, TEXT, TEXT) TO service_role;

-- Step 4: Verify table permissions
GRANT SELECT, INSERT, UPDATE ON usage_limits TO authenticated;
GRANT SELECT ON usage_limits TO anon;

-- Step 5: Verify function exists
SELECT 
  routine_name,
  routine_type,
  data_type as return_type,
  routine_definition
FROM information_schema.routines
WHERE routine_name = 'check_and_increment_usage'
  AND routine_schema = 'public';

-- Step 6: Test the function
DO $$
DECLARE
  v_result JSONB;
  v_test_user_id UUID;
BEGIN
  -- Get current user or use a test UUID
  SELECT COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::UUID) INTO v_test_user_id;
  
  -- Test function call
  SELECT check_and_increment_usage(
    v_test_user_id,
    'ai_tips',
    'free'
  ) INTO v_result;
  
  -- Show result
  RAISE NOTICE 'Test Result: %', v_result;
  
  -- Verify structure
  IF v_result ? 'allowed' AND v_result ? 'current_count' AND v_result ? 'limit' AND v_result ? 'remaining' THEN
    RAISE NOTICE '✅ Function working correctly!';
  ELSE
    RAISE WARNING '❌ Function returned unexpected structure!';
  END IF;
END $$;

-- Step 7: Show current usage for current user
SELECT 
  user_id,
  feature_type,
  usage_count,
  usage_date,
  last_used_at
FROM usage_limits
WHERE user_id = auth.uid()
  AND usage_date = CURRENT_DATE
ORDER BY last_used_at DESC;

-- =====================================================
-- VERIFICATION COMPLETE
-- =====================================================
-- If you see "✅ Function working correctly!" then the fix is successful
-- If you see errors, check:
-- 1. auth.uid() is not null (user must be authenticated)
-- 2. usage_limits table exists
-- 3. RLS policies allow access
-- =====================================================

COMMENT ON FUNCTION check_and_increment_usage IS 
  'Check if user can use a feature based on tier limits and increment counter if allowed. Returns JSONB with allowed status and usage stats.';
