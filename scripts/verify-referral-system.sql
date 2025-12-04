-- =====================================================
-- Quick Database Verification for Testing
-- =====================================================
-- Run this in Supabase SQL Editor before manual testing

-- 1. Check if referrals table exists
SELECT EXISTS (
  SELECT FROM pg_tables
  WHERE schemaname = 'public' AND tablename = 'referrals'
) as referrals_table_exists;

-- 2. Check if generate_referral_code function exists
SELECT EXISTS (
  SELECT FROM pg_proc
  WHERE proname = 'generate_referral_code'
) as function_exists;

-- 3. Test generate_referral_code function
SELECT generate_referral_code() as test_code;

-- 4. Check current user's referrals
SELECT 
  referral_code,
  referrer_id,
  referred_id,
  status,
  reward_given,
  created_at
FROM referrals
WHERE referrer_id = (SELECT auth.uid())
ORDER BY created_at DESC
LIMIT 5;

-- 5. Count user's referrals by status
SELECT 
  status,
  COUNT(*) as count
FROM referrals
WHERE referrer_id = (SELECT auth.uid())
GROUP BY status;

-- 6. Check subscriptions table
SELECT 
  user_id,
  tier,
  status,
  started_at,
  expires_at
FROM subscriptions
WHERE user_id = (SELECT auth.uid())
LIMIT 1;

-- Expected Results:
-- 1. referrals_table_exists: true
-- 2. function_exists: true
-- 3. test_code: 8-character uppercase alphanumeric (e.g., A1B2C3D4)
-- 4. Either 0 rows (new user) or existing referral records
-- 5. Stats by status (or 0 rows if no referrals)
-- 6. Subscription record (tier: 'free', status: 'active', started_at/expires_at)
