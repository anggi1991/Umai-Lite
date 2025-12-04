-- Create assistant_learnings table for storing conversation context and patterns
-- This enables the Azure OpenAI Assistant to learn from user interactions

CREATE TABLE IF NOT EXISTS assistant_learnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  conversation_topic TEXT NOT NULL,
  user_preference JSONB DEFAULT '{}',
  key_insights TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes for faster queries
  CONSTRAINT assistant_learnings_user_id_idx CHECK (user_id IS NOT NULL)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_assistant_learnings_user_id ON assistant_learnings(user_id);
CREATE INDEX IF NOT EXISTS idx_assistant_learnings_child_id ON assistant_learnings(child_id);
CREATE INDEX IF NOT EXISTS idx_assistant_learnings_topic ON assistant_learnings(conversation_topic);
CREATE INDEX IF NOT EXISTS idx_assistant_learnings_created_at ON assistant_learnings(created_at DESC);

-- Enable Row Level Security
ALTER TABLE assistant_learnings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own learnings
CREATE POLICY "Users can view their own assistant learnings"
  ON assistant_learnings
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role can insert learnings (from Edge Functions)
CREATE POLICY "Service role can insert assistant learnings"
  ON assistant_learnings
  FOR INSERT
  WITH CHECK (true); -- Edge Function uses service role

-- Policy: Service role can read all learnings (for analysis)
CREATE POLICY "Service role can view all assistant learnings"
  ON assistant_learnings
  FOR SELECT
  USING (auth.role() = 'service_role');

-- Create view for learning analytics
CREATE OR REPLACE VIEW assistant_learning_analytics AS
SELECT 
  user_id,
  conversation_topic,
  COUNT(*) as conversation_count,
  array_agg(DISTINCT key_insights) as all_insights,
  MIN(created_at) as first_conversation,
  MAX(created_at) as last_conversation
FROM assistant_learnings
GROUP BY user_id, conversation_topic;

-- Grant permissions
GRANT SELECT ON assistant_learning_analytics TO authenticated;
GRANT ALL ON assistant_learnings TO service_role;

-- Add comment
COMMENT ON TABLE assistant_learnings IS 'Stores conversation patterns and user preferences for Azure OpenAI Assistant learning';
