-- =====================================================
-- RESET USAGE LIMITS FOR TESTING
-- =====================================================
-- Run this in Supabase SQL Editor to reset your daily usage

-- Reset AI Tips usage for current user
DELETE FROM usage_limits 
WHERE user_id = (SELECT auth.uid())
  AND feature_type = 'ai_tips'
  AND usage_date = CURRENT_DATE;

-- Reset Chat Messages usage for current user
DELETE FROM usage_limits 
WHERE user_id = (SELECT auth.uid())
  AND feature_type = 'chat_messages'
  AND usage_date = CURRENT_DATE;

-- Reset ALL usage for current user (use with caution)
-- DELETE FROM usage_limits WHERE user_id = (SELECT auth.uid());

-- View current usage status
SELECT 
  feature_type,
  usage_date,
  usage_count,
  last_used_at,
  CASE 
    WHEN feature_type = 'ai_tips' THEN 3
    WHEN feature_type = 'chat_messages' THEN 10
    ELSE 0
  END as limit,
  CASE 
    WHEN feature_type = 'ai_tips' THEN 3 - usage_count
    WHEN feature_type = 'chat_messages' THEN 10 - usage_count
    ELSE 0
  END as remaining
FROM usage_limits
WHERE user_id = (SELECT auth.uid())
  AND usage_date = CURRENT_DATE
ORDER BY feature_type;
