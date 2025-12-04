-- =====================================================
-- COMPLETELY NEW APPROACH - Simple and Direct
-- =====================================================
-- Drop old function
DROP FUNCTION IF EXISTS check_and_increment_usage(UUID, TEXT, TEXT);

-- Create new simple function without nested blocks
CREATE OR REPLACE FUNCTION check_and_increment_usage(
  p_user_id UUID,
  p_feature_type TEXT,
  p_tier TEXT
) RETURNS JSONB 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_limit INTEGER;
  v_current_count INTEGER := 0;
  v_allowed BOOLEAN;
  v_new_count INTEGER := 0;
BEGIN
  -- Validate input
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'user_id cannot be null';
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
    v_limit := 999999;
  END IF;

  -- Get current usage count
  SELECT COALESCE(usage_count, 0) 
  INTO v_current_count
  FROM usage_limits
  WHERE user_id = p_user_id
    AND feature_type = p_feature_type
    AND usage_date = CURRENT_DATE;

  -- Default to 0 if not found
  v_current_count := COALESCE(v_current_count, 0);

  -- Check if allowed
  v_allowed := (v_current_count < v_limit);

  -- If allowed, increment
  IF v_allowed THEN
    -- Try INSERT first
    BEGIN
      INSERT INTO usage_limits (user_id, feature_type, usage_date, usage_count, last_used_at)
      VALUES (p_user_id, p_feature_type, CURRENT_DATE, 1, NOW());
      
      v_new_count := 1;
    EXCEPTION
      WHEN unique_violation THEN
        -- Record exists, UPDATE instead
        UPDATE usage_limits
        SET usage_count = usage_count + 1,
            last_used_at = NOW()
        WHERE user_id = p_user_id
          AND feature_type = p_feature_type
          AND usage_date = CURRENT_DATE
        RETURNING usage_count INTO v_new_count;
    END;
  ELSE
    v_new_count := v_current_count;
  END IF;

  -- Return result
  RETURN jsonb_build_object(
    'allowed', v_allowed,
    'current_count', v_new_count,
    'limit', v_limit,
    'remaining', v_limit - v_new_count
  );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION check_and_increment_usage(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION check_and_increment_usage(UUID, TEXT, TEXT) TO anon;

-- Test it with explicit UUID (replace with your actual user_id from app logs)
-- Example: '36c7f204-68ab-4921-8f55-d3cea9cd24d3'
SELECT check_and_increment_usage(
  '36c7f204-68ab-4921-8f55-d3cea9cd24d3'::uuid,
  'ai_tips',
  'free'
);

-- If you want to test with auth.uid(), run this instead:
-- SELECT check_and_increment_usage(
--   (SELECT auth.uid()),
--   'ai_tips',
--   'free'
-- );
