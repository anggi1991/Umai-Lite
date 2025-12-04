-- Usage Analytics Migration
-- Track user engagement and AI usage patterns

-- Table: usage_analytics
CREATE TABLE IF NOT EXISTS usage_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_category TEXT,
  metadata JSONB DEFAULT '{}',
  session_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_usage_analytics_user_id ON usage_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_analytics_event_type ON usage_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_usage_analytics_created_at ON usage_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_usage_analytics_session_id ON usage_analytics(session_id);

-- RLS
ALTER TABLE usage_analytics ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view own analytics" ON usage_analytics;
CREATE POLICY "Users can view own analytics"
  ON usage_analytics
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can insert analytics" ON usage_analytics;
CREATE POLICY "Service role can insert analytics"
  ON usage_analytics
  FOR INSERT
  WITH CHECK (true);

-- View: Daily Active Users
CREATE OR REPLACE VIEW analytics_dau AS
SELECT 
  DATE(created_at) as date,
  COUNT(DISTINCT user_id) as active_users
FROM usage_analytics
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- View: Top Features
CREATE OR REPLACE VIEW analytics_top_features AS
SELECT 
  event_type,
  event_category,
  COUNT(*) as usage_count,
  COUNT(DISTINCT user_id) as unique_users
FROM usage_analytics
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY event_type, event_category
ORDER BY usage_count DESC;

-- View: User Engagement
CREATE OR REPLACE VIEW analytics_user_engagement AS
SELECT 
  user_id,
  COUNT(*) as total_events,
  COUNT(DISTINCT DATE(created_at)) as active_days,
  COUNT(*) FILTER (WHERE event_category = 'ai_chat') as chat_messages,
  COUNT(*) FILTER (WHERE event_category = 'tracking') as tracking_entries,
  MAX(created_at) as last_active
FROM usage_analytics
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY user_id
ORDER BY total_events DESC;

-- Function: Get user analytics summary
CREATE OR REPLACE FUNCTION get_user_analytics_summary(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_events', COUNT(*),
    'active_days', COUNT(DISTINCT DATE(created_at)),
    'chat_messages', COUNT(*) FILTER (WHERE event_category = 'ai_chat'),
    'tracking_entries', COUNT(*) FILTER (WHERE event_category = 'tracking'),
    'suggestions_viewed', COUNT(*) FILTER (WHERE event_type = 'view_suggestion'),
    'last_active', MAX(created_at),
    'top_features', (
      SELECT jsonb_agg(jsonb_build_object('event_type', event_type, 'count', cnt))
      FROM (
        SELECT event_type, COUNT(*) as cnt
        FROM usage_analytics
        WHERE user_id = p_user_id
          AND created_at >= NOW() - INTERVAL '30 days'
        GROUP BY event_type
        ORDER BY cnt DESC
        LIMIT 5
      ) top
    )
  ) INTO v_result
  FROM usage_analytics
  WHERE user_id = p_user_id
    AND created_at >= NOW() - INTERVAL '30 days';
  
  RETURN v_result;
END;
$$;

COMMENT ON TABLE usage_analytics IS 'Tracks user engagement and feature usage';
COMMENT ON FUNCTION get_user_analytics_summary IS 'Returns analytics summary for user (last 30 days)';
