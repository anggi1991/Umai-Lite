-- Monetization Migration Verification Queries
-- Run these queries in Supabase SQL Editor to verify migration success

-- ============================================
-- 1. CHECK TABLES CREATED
-- ============================================
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'usage_limits', 
  'iap_receipts', 
  'ads_metrics', 
  'referrals', 
  'badges', 
  'user_badges', 
  'affiliate_links', 
  'affiliate_clicks'
)
ORDER BY table_name;
-- Expected: 8 rows

-- ============================================
-- 2. CHECK FUNCTIONS CREATED
-- ============================================
SELECT routine_name, routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
  'check_and_increment_usage',
  'get_usage_status',
  'generate_referral_code',
  'check_and_award_badges'
)
ORDER BY routine_name;
-- Expected: 4 rows

-- ============================================
-- 3. CHECK SAMPLE BADGES DATA
-- ============================================
SELECT id, name, category, tier, points_required, is_premium_only
FROM badges 
ORDER BY points_required;
-- Expected: 8 badges (Bronze, Silver, Gold, Platinum tiers)

-- ============================================
-- 4. CHECK TABLE STRUCTURES
-- ============================================

-- Usage Limits table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'usage_limits'
ORDER BY ordinal_position;

-- Referrals table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'referrals'
ORDER BY ordinal_position;

-- Badges table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'badges'
ORDER BY ordinal_position;

-- User Badges table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_badges'
ORDER BY ordinal_position;

-- ============================================
-- 5. CHECK RLS POLICIES
-- ============================================
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename IN (
  'usage_limits', 
  'referrals', 
  'badges', 
  'user_badges'
)
ORDER BY tablename, policyname;
-- Expected: Multiple policies per table

-- ============================================
-- 6. CHECK INDEXES
-- ============================================
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN (
  'usage_limits',
  'referrals', 
  'badges',
  'user_badges'
)
ORDER BY tablename, indexname;

-- ============================================
-- 7. TEST FUNCTIONS
-- ============================================

-- Test generate_referral_code() function
SELECT generate_referral_code();
-- Expected: 6-character uppercase code (e.g., 'XYZABC')

-- Test get_usage_status() function
-- (Replace 'YOUR_USER_ID' with actual user ID)
-- SELECT get_usage_status('YOUR_USER_ID', 'ai_tips');

-- ============================================
-- 8. VERIFY BADGE DATA DETAILS
-- ============================================
SELECT 
  name,
  description,
  category,
  tier,
  points_required,
  icon,
  is_premium_only
FROM badges
ORDER BY 
  CASE category
    WHEN 'activity' THEN 1
    WHEN 'social' THEN 2
    WHEN 'engagement' THEN 3
    WHEN 'growth' THEN 4
  END,
  points_required;

-- ============================================
-- VERIFICATION CHECKLIST
-- ============================================
-- [ ] 8 tables created
-- [ ] 4 functions created
-- [ ] 8 badges inserted
-- [ ] RLS policies active
-- [ ] Indexes created
-- [ ] generate_referral_code() returns 6-char code
-- [ ] All tables have correct columns
