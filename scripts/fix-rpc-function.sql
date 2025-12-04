-- =====================================================
-- FIX check_and_increment_usage FUNCTION
-- =====================================================
-- This fixes the issue where RPC returns null values

-- Drop and recreate the function with proper permissions
DROP FUNCTION IF EXISTS check_and_increment_usage(UUID, TEXT, TEXT);

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
  -- Set limits based on tier
  IF p_tier = 'free' THEN
    v_limit := CASE p_feature_type
      WHEN 'ai_tips' THEN 3
      WHEN 'chat_messages' THEN 10
      WHEN 'media_upload' THEN 20
      ELSE 0
    END;
  ELSE
    v_limit := 999999; -- Unlimited for Premium/Family
  END IF;

  -- Get current usage for today
  SELECT COALESCE(usage_count, 0) INTO v_current_count
  FROM usage_limits
  WHERE user_id = p_user_id
    AND feature_type = p_feature_type
    AND usage_date = CURRENT_DATE;

  -- If no record exists, current_count is 0
  IF v_current_count IS NULL THEN
    v_current_count := 0;
  END IF;

  -- Check if allowed
  v_allowed := v_current_count < v_limit;

  -- If allowed, increment counter
  IF v_allowed THEN
    -- Use explicit casting and separate variables to avoid shadowing
    DECLARE
      v_user_id UUID := p_user_id;
      v_feature TEXT := p_feature_type;
    BEGIN
      INSERT INTO usage_limits (user_id, feature_type, usage_date, usage_count, last_used_at)
      VALUES (v_user_id, v_feature, CURRENT_DATE, 1, NOW())
      ON CONFLICT (user_id, feature_type, usage_date)
      DO UPDATE SET
        usage_count = usage_limits.usage_count + 1,
        last_used_at = NOW();
    END;

    v_current_count := v_current_count + 1;
  END IF;

  -- Debug: Log parameters before return
  RAISE NOTICE 'Function params: user_id=%, feature=%, tier=%, allowed=%, count=%', 
    p_user_id, p_feature_type, p_tier, v_allowed, v_current_count;
  
  -- Return result as JSONB
  RETURN jsonb_build_object(
    'allowed', v_allowed,
    'current_count', v_current_count,
    'limit', v_limit,
    'remaining', v_limit - v_current_count
  );
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;  -- Changed from SECURITY DEFINER

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION check_and_increment_usage(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION check_and_increment_usage(UUID, TEXT, TEXT) TO service_role;

-- Test the function
SELECT check_and_increment_usage(
  (SELECT auth.uid()),
  'ai_tips',
  'free'
);
