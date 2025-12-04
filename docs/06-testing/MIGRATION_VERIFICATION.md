# ✅ Migration Verification Steps

**Status:** Migration applied successfully!  
**Date:** January 11, 2025

---

## Step 1: Verify Tables ✅

Run this query in Supabase SQL Editor:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'usage_limits', 'iap_receipts', 'ads_metrics', 
  'referrals', 'badges', 'user_badges', 
  'affiliate_links', 'affiliate_clicks'
)
ORDER BY table_name;
```

**Expected Result:** 8 rows
- ads_metrics
- affiliate_clicks
- affiliate_links
- badges
- iap_receipts
- referrals
- usage_limits
- user_badges

---

## Step 2: Verify Functions

```sql
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
```

**Expected Result:** 4 rows
- check_and_award_badges (FUNCTION)
- check_and_increment_usage (FUNCTION)
- generate_referral_code (FUNCTION)
- get_usage_status (FUNCTION)

---

## Step 3: Verify Sample Badges Data

```sql
SELECT id, name, category, tier, points_required
FROM badges 
ORDER BY points_required;
```

**Expected Result:** 8 badges

| name | category | tier | points_required |
|------|----------|------|----------------|
| Activity Starter | activity | bronze | 5 |
| Social Butterfly | social | bronze | 10 |
| Engagement Pro | engagement | bronze | 20 |
| Activity Master | activity | silver | 50 |
| Social Champion | social | silver | 50 |
| Engagement Expert | engagement | silver | 100 |
| Growth Guru | growth | gold | 200 |
| Premium Member | growth | platinum | 0 |

---

## Step 4: Test Referral Code Generation

```sql
SELECT generate_referral_code();
```

**Expected Result:** 6-character uppercase code (e.g., `XYZ123`)

Run it multiple times - each should be unique!

---

## Step 5: Check RLS Policies

```sql
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('usage_limits', 'referrals', 'badges', 'user_badges')
ORDER BY tablename, policyname;
```

**Expected Result:** Multiple policies (at least 2-3 per table)

Example policies:
- `usage_limits_select_own` - Allow users to view their own limits
- `referrals_insert_own` - Allow users to create referrals
- `badges_select_all` - Allow all users to view badges
- `user_badges_select_own` - Allow users to view their earned badges

---

## Step 6: Test Usage Limit Function (With Your User ID)

First, get your user ID:
```sql
SELECT auth.uid();
```

Then test the function:
```sql
SELECT * FROM get_usage_status(auth.uid(), 'ai_tips');
```

**Expected Result:** JSON object like:
```json
{
  "current_count": 0,
  "limit": 3,
  "remaining": 3,
  "is_unlimited": false
}
```

---

## Step 7: Verify Indexes

```sql
SELECT tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('usage_limits', 'referrals', 'badges', 'user_badges')
ORDER BY tablename, indexname;
```

**Expected Result:** Multiple indexes for performance optimization

---

## ✅ Verification Checklist

After running all queries above, check:

- [x] Migration applied successfully (no errors)
- [ ] 8 tables exist
- [ ] 4 functions exist
- [ ] 8 badges inserted with correct data
- [ ] RLS policies active on all tables
- [ ] `generate_referral_code()` returns 6-char codes
- [ ] `get_usage_status()` returns correct JSON structure
- [ ] Indexes created for performance

---

## 🚀 Next Steps

Once verification is complete:

1. **Start the app:**
   ```bash
   npm start
   ```

2. **Run automated tests:**
   - Sign in to the app
   - Navigate to: **Settings** > **Developer Tools**
   - Tap: **Run Tests**
   - Verify: **6/6 tests PASS** ✅

3. **Manual testing:**
   - Follow guide: `docs/MONETIZATION_TESTING_GUIDE.md`
   - Test AI tips usage limits (0→1→2→3)
   - Verify UpgradeModal appears on 4th attempt
   - Test navigation to Subscription/Referral/Badges

4. **Update documentation:**
   - Mark tasks complete in `MONETIZATION_LAUNCH_CHECKLIST.md`
   - Add test results to `MONETIZATION_PHASE1_SUMMARY.md`

---

## 🐛 Troubleshooting

### Tables not found
- Re-run migration SQL
- Check for SQL syntax errors in Supabase logs

### Functions not found
- Verify functions section executed without errors
- Check function syntax (should use `CREATE OR REPLACE FUNCTION`)

### No badges data
- Check INSERT statements executed
- Verify no conflicts with existing data

### RLS blocking queries
- Temporarily disable RLS for testing: `ALTER TABLE badges DISABLE ROW LEVEL SECURITY;`
- Re-enable after testing: `ALTER TABLE badges ENABLE ROW LEVEL SECURITY;`

---

**All verification queries are available in:** `scripts/verify-migration.sql`
