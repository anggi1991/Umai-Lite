-- Migration 010: Monetization Infrastructure
-- Description: Add tables for in-app purchases, ads tracking, referrals, and gamification
-- Date: 2025-11-08

-- =====================================================
-- TABLE: iap_receipts (In-App Purchase Receipts)
-- Description: Store subscription transaction receipts
-- =====================================================
CREATE TABLE IF NOT EXISTS iap_receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  transaction_id TEXT UNIQUE NOT NULL,
  product_id TEXT NOT NULL, -- 'premium_monthly', 'family_monthly', 'premium_annual'
  purchase_date TIMESTAMPTZ NOT NULL,
  expiry_date TIMESTAMPTZ,
  receipt_data TEXT, -- Base64 encoded receipt
  is_validated BOOLEAN DEFAULT FALSE,
  validation_response JSONB,
  revenue_cents INTEGER NOT NULL DEFAULT 0, -- Revenue in cents (IDR)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for quick validation lookup
CREATE INDEX idx_iap_user ON iap_receipts(user_id, purchase_date DESC);
CREATE INDEX idx_iap_transaction ON iap_receipts(transaction_id);
CREATE INDEX idx_iap_subscription ON iap_receipts(subscription_id);
CREATE INDEX idx_iap_platform ON iap_receipts(platform, purchase_date DESC);

-- RLS policies
ALTER TABLE iap_receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own receipts"
  ON iap_receipts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert receipts"
  ON iap_receipts FOR INSERT
  WITH CHECK (true); -- Only service role should insert via webhook

-- =====================================================
-- TABLE: ads_metrics (Advertising Performance Tracking)
-- Description: Track ad impressions, clicks, and revenue
-- =====================================================
CREATE TABLE IF NOT EXISTS ads_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ad_type TEXT NOT NULL CHECK (ad_type IN ('banner', 'interstitial', 'rewarded', 'native')),
  ad_unit_id TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('impression', 'click', 'rewarded', 'closed')),
  revenue_cents INTEGER DEFAULT 0, -- Estimated revenue in cents
  metadata JSONB, -- Additional data: placement, creative_id, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for analytics queries
CREATE INDEX idx_ads_user_date ON ads_metrics(user_id, created_at DESC);
CREATE INDEX idx_ads_type_date ON ads_metrics(ad_type, created_at DESC);
CREATE INDEX idx_ads_event ON ads_metrics(event_type, created_at DESC);
CREATE INDEX idx_ads_created ON ads_metrics(created_at DESC);

-- RLS policies
ALTER TABLE ads_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ads metrics"
  ON ads_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ads metrics"
  ON ads_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- TABLE: referrals (Referral Program)
-- Description: Track user referrals and rewards
-- =====================================================
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referral_code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rewarded', 'expired')),
  reward_type TEXT DEFAULT 'premium_month', -- 'premium_month', 'discount', 'credits'
  reward_given BOOLEAN DEFAULT FALSE,
  reward_given_at TIMESTAMPTZ,
  referred_user_email TEXT, -- For tracking before signup
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '90 days')
);

-- Indexes
CREATE INDEX idx_referrals_referrer ON referrals(referrer_id, created_at DESC);
CREATE INDEX idx_referrals_code ON referrals(referral_code);
CREATE INDEX idx_referrals_referred ON referrals(referred_id);
CREATE INDEX idx_referrals_status ON referrals(status, created_at DESC);

-- RLS policies
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referrals"
  ON referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Users can create own referrals"
  ON referrals FOR INSERT
  WITH CHECK (auth.uid() = referrer_id);

CREATE POLICY "Users can update own referrals"
  ON referrals FOR UPDATE
  USING (auth.uid() = referrer_id);

-- =====================================================
-- TABLE: badges (Gamification Badges)
-- Description: Define achievement badges
-- =====================================================
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon_name TEXT NOT NULL, -- Icon identifier for app
  category TEXT NOT NULL CHECK (category IN ('activity', 'streak', 'engagement', 'milestone', 'special')),
  requirement JSONB NOT NULL, -- {"type": "streak", "count": 7, "activity": "daily_log"}
  reward_type TEXT, -- 'ai_tips', 'premium_day', 'badge_only'
  reward_value INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sample badges
INSERT INTO badges (name, description, icon_name, category, requirement, reward_type, reward_value, sort_order) VALUES
  ('Early Bird', 'Log aktivitas pertama sebelum jam 7 pagi', 'sunrise', 'activity', '{"type": "time_based", "before": "07:00"}', 'badge_only', 0, 1),
  ('7-Day Streak', 'Log aktivitas 7 hari berturut-turut', 'fire', 'streak', '{"type": "streak", "count": 7}', 'ai_tips', 3, 2),
  ('30-Day Streak', 'Log aktivitas 30 hari berturut-turut', 'fire-2', 'streak', '{"type": "streak", "count": 30}', 'premium_day', 7, 3),
  ('Activity Master', 'Log 100 aktivitas', 'trophy', 'activity', '{"type": "count", "activity": "any", "count": 100}', 'ai_tips', 5, 4),
  ('AI Enthusiast', 'Gunakan AI chat 50 kali', 'robot', 'engagement', '{"type": "count", "feature": "chat", "count": 50}', 'ai_tips', 5, 5),
  ('Photo Keeper', 'Upload 50 foto bayi', 'camera', 'engagement', '{"type": "count", "feature": "media", "count": 50}', 'badge_only', 0, 6),
  ('Night Owl', 'Log aktivitas setelah jam 10 malam', 'moon', 'activity', '{"type": "time_based", "after": "22:00"}', 'badge_only', 0, 7),
  ('First Week', 'Selesaikan minggu pertama', 'calendar', 'milestone', '{"type": "days_active", "count": 7}', 'ai_tips', 3, 8);

-- Indexes
CREATE INDEX idx_badges_category ON badges(category, sort_order);
CREATE INDEX idx_badges_active ON badges(is_active, sort_order);

-- RLS policies
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active badges"
  ON badges FOR SELECT
  USING (is_active = TRUE);

-- =====================================================
-- TABLE: user_badges (User Badge Achievements)
-- Description: Track which badges users have earned
-- =====================================================
CREATE TABLE IF NOT EXISTS user_badges (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  notified BOOLEAN DEFAULT FALSE,
  notified_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, badge_id)
);

-- Indexes
CREATE INDEX idx_user_badges_user ON user_badges(user_id, earned_at DESC);
CREATE INDEX idx_user_badges_badge ON user_badges(badge_id, earned_at DESC);
CREATE INDEX idx_user_badges_unnotified ON user_badges(user_id, notified) WHERE notified = FALSE;

-- RLS policies
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own badges"
  ON user_badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges"
  ON user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own badges"
  ON user_badges FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- TABLE: affiliate_links (Affiliate Marketing)
-- Description: Store product affiliate links
-- =====================================================
CREATE TABLE IF NOT EXISTS affiliate_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('nutrition', 'diapers', 'toys', 'gear', 'health', 'books', 'clothes')),
  description TEXT,
  affiliate_url TEXT NOT NULL,
  image_url TEXT,
  price_range TEXT, -- "Rp 50.000 - Rp 100.000"
  age_range TEXT, -- "0-6 months", "6-12 months", "12-24 months"
  provider TEXT NOT NULL CHECK (provider IN ('shopee', 'tokopedia', 'lazada', 'amazon', 'blibli')),
  commission_rate DECIMAL(5,2), -- Percentage: 5.00 = 5%
  click_count INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_affiliate_category ON affiliate_links(category, is_active, sort_order);
CREATE INDEX idx_affiliate_age ON affiliate_links(age_range, is_active);
CREATE INDEX idx_affiliate_provider ON affiliate_links(provider, is_active);
CREATE INDEX idx_affiliate_active ON affiliate_links(is_active, sort_order);

-- RLS policies
ALTER TABLE affiliate_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active affiliate links"
  ON affiliate_links FOR SELECT
  USING (is_active = TRUE);

-- =====================================================
-- TABLE: affiliate_clicks (Affiliate Click Tracking)
-- Description: Track user clicks on affiliate links
-- =====================================================
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  link_id UUID NOT NULL REFERENCES affiliate_links(id) ON DELETE CASCADE,
  clicked_at TIMESTAMPTZ DEFAULT NOW(),
  converted BOOLEAN DEFAULT FALSE,
  conversion_value_cents INTEGER, -- If conversion tracked
  converted_at TIMESTAMPTZ,
  metadata JSONB -- User agent, referrer, etc.
);

-- Indexes
CREATE INDEX idx_affiliate_clicks_user ON affiliate_clicks(user_id, clicked_at DESC);
CREATE INDEX idx_affiliate_clicks_link ON affiliate_clicks(link_id, clicked_at DESC);
CREATE INDEX idx_affiliate_clicks_converted ON affiliate_clicks(converted, clicked_at DESC);

-- RLS policies
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own clicks"
  ON affiliate_clicks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clicks"
  ON affiliate_clicks FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- =====================================================
-- TABLE: usage_limits (Daily Usage Tracking)
-- Description: Track daily usage for feature gating
-- =====================================================
CREATE TABLE IF NOT EXISTS usage_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_type TEXT NOT NULL CHECK (feature_type IN ('ai_tips', 'chat_messages', 'media_upload')),
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  usage_count INTEGER NOT NULL DEFAULT 0,
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, feature_type, usage_date)
);

-- Indexes
CREATE INDEX idx_usage_user_date ON usage_limits(user_id, feature_type, usage_date DESC);
CREATE INDEX idx_usage_date ON usage_limits(usage_date DESC);

-- RLS policies
ALTER TABLE usage_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage"
  ON usage_limits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage"
  ON usage_limits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage"
  ON usage_limits FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS: Helper functions for usage limits
-- =====================================================

-- Function to check and increment usage limit
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

    v_current_count := v_current_count + 1;
  END IF;

  -- Return result
  RETURN jsonb_build_object(
    'allowed', v_allowed,
    'current_count', v_current_count,
    'limit', v_limit,
    'remaining', v_limit - v_current_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current usage
CREATE OR REPLACE FUNCTION get_usage_status(
  p_user_id UUID,
  p_feature_type TEXT,
  p_tier TEXT
) RETURNS JSONB AS $$
DECLARE
  v_limit INTEGER;
  v_current_count INTEGER;
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

  -- Return result
  RETURN jsonb_build_object(
    'current_count', v_current_count,
    'limit', v_limit,
    'remaining', GREATEST(0, v_limit - v_current_count),
    'is_unlimited', p_tier != 'free'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTIONS: Referral code generation
-- =====================================================

CREATE OR REPLACE FUNCTION generate_referral_code() RETURNS TEXT AS $$
DECLARE
  v_code TEXT;
  v_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 8-character alphanumeric code
    v_code := upper(substr(md5(random()::text), 1, 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM referrals WHERE referral_code = v_code) INTO v_exists;
    
    -- Exit loop if unique
    EXIT WHEN NOT v_exists;
  END LOOP;
  
  RETURN v_code;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTIONS: Badge earning check
-- =====================================================

CREATE OR REPLACE FUNCTION check_and_award_badges(p_user_id UUID) RETURNS VOID AS $$
DECLARE
  v_badge RECORD;
  v_activities_count INTEGER;
  v_streak_count INTEGER;
  v_chat_count INTEGER;
  v_media_count INTEGER;
BEGIN
  -- Get user statistics
  SELECT COUNT(*) INTO v_activities_count
  FROM activities WHERE user_id = p_user_id;

  SELECT COUNT(*) INTO v_chat_count
  FROM messages m
  JOIN chat_sessions cs ON m.session_id = cs.id
  WHERE cs.user_id = p_user_id AND m.sender = 'user';

  SELECT COUNT(*) INTO v_media_count
  FROM media WHERE user_id = p_user_id;

  -- Check each badge requirement
  FOR v_badge IN SELECT * FROM badges WHERE is_active = TRUE LOOP
    -- Skip if user already has this badge
    CONTINUE WHEN EXISTS (
      SELECT 1 FROM user_badges 
      WHERE user_id = p_user_id AND badge_id = v_badge.id
    );

    -- Check requirements based on type
    CASE v_badge.requirement->>'type'
      WHEN 'count' THEN
        IF v_badge.requirement->>'feature' = 'chat' AND 
           v_chat_count >= (v_badge.requirement->>'count')::INTEGER THEN
          INSERT INTO user_badges (user_id, badge_id) VALUES (p_user_id, v_badge.id);
        ELSIF v_badge.requirement->>'feature' = 'media' AND 
              v_media_count >= (v_badge.requirement->>'count')::INTEGER THEN
          INSERT INTO user_badges (user_id, badge_id) VALUES (p_user_id, v_badge.id);
        ELSIF v_badge.requirement->>'activity' = 'any' AND 
              v_activities_count >= (v_badge.requirement->>'count')::INTEGER THEN
          INSERT INTO user_badges (user_id, badge_id) VALUES (p_user_id, v_badge.id);
        END IF;
      -- Add more badge type checks as needed
    END CASE;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS: Auto-update timestamps
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_iap_receipts_updated_at
  BEFORE UPDATE ON iap_receipts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_affiliate_links_updated_at
  BEFORE UPDATE ON affiliate_links
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- GRANTS: Ensure service role has access
-- =====================================================

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON usage_limits TO authenticated;
GRANT SELECT ON badges TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_badges TO authenticated;
GRANT SELECT ON affiliate_links TO authenticated;
GRANT SELECT, INSERT ON affiliate_clicks TO authenticated;
GRANT SELECT, INSERT ON ads_metrics TO authenticated;
GRANT SELECT ON referrals TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION check_and_increment_usage TO authenticated;
GRANT EXECUTE ON FUNCTION get_usage_status TO authenticated;
GRANT EXECUTE ON FUNCTION generate_referral_code TO authenticated;
GRANT EXECUTE ON FUNCTION check_and_award_badges TO authenticated;

-- =====================================================
-- COMMENTS: Documentation
-- =====================================================

COMMENT ON TABLE iap_receipts IS 'Store in-app purchase transaction receipts for subscription validation';
COMMENT ON TABLE ads_metrics IS 'Track advertising performance (impressions, clicks, revenue)';
COMMENT ON TABLE referrals IS 'Manage user referral program and rewards';
COMMENT ON TABLE badges IS 'Define achievement badges for gamification';
COMMENT ON TABLE user_badges IS 'Track which badges users have earned';
COMMENT ON TABLE affiliate_links IS 'Store affiliate product links for monetization';
COMMENT ON TABLE affiliate_clicks IS 'Track user clicks on affiliate links';
COMMENT ON TABLE usage_limits IS 'Track daily feature usage for tier-based limits';

COMMENT ON FUNCTION check_and_increment_usage IS 'Check if user can use feature and increment counter if allowed';
COMMENT ON FUNCTION get_usage_status IS 'Get current usage status for a feature';
COMMENT ON FUNCTION generate_referral_code IS 'Generate unique 8-character referral code';
COMMENT ON FUNCTION check_and_award_badges IS 'Check user progress and award earned badges';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Log migration
DO $$
BEGIN
  RAISE NOTICE 'Migration 010_monetization_infrastructure completed successfully';
  RAISE NOTICE 'Created 7 new tables: iap_receipts, ads_metrics, referrals, badges, user_badges, affiliate_links, affiliate_clicks, usage_limits';
  RAISE NOTICE 'Created 4 helper functions for usage limits, referrals, and badges';
  RAISE NOTICE 'Inserted 8 sample badges for gamification';
END $$;
