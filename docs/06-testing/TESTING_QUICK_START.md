# <!-- Moved from root path: /TESTING_QUICK_START.md on 2025-11-11. Consolidated into docs/testing/guides/. -->
# ⚡ Quick Start - Testing Phase

**Status:** ✅ CODE COMPLETE | ⏳ Ready for User Testing  
**Time Needed:** 15 minutes  
**Progress:** 96% (50/52 tasks)

---

## 🚀 Start Here

You have **3 tasks** to complete testing:

### 1️⃣ Database Verification (2 min)

Open [Supabase Dashboard](https://app.supabase.com) → SQL Editor

Run this quick check:
```sql
-- Should return 8 tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('usage_limits', 'referrals', 'badges', 'user_badges', 
                   'iap_receipts', 'ads_metrics', 'affiliate_links', 'affiliate_clicks')
ORDER BY table_name;
```

**Expected:** 8 rows ✅

Full queries: `scripts/verify-migration.sql`

---

### 2️⃣ Run Automated Tests (3 min)

```bash
# Start app (if not running)
npm start
```

**In the app:**
1. Navigate to: `/test-analytics`
2. Tap: **"Usage Limits & Referrals (8 Tests)"**
3. Wait ~30 seconds

**Expected:** ✅ **8/8 tests PASS**

---

### 3️⃣ Manual Testing (10 min)

#### A. Test AI Tips Limits (5 min)
1. Go to **Dashboard**
2. Tap "Generate Daily Tip" 4 times
3. **Verify:** Badge shows 0/3 → 1/3 → 2/3 → 3/3
4. **Verify:** 4th attempt shows **UpgradeModal**
5. **Verify:** "Upgrade Now" navigates to Subscription

#### B. Test Navigation (3 min)
1. Go to **Settings**
2. Tap "Kelola Langganan" → Opens Subscription ✅
3. Tap "Ajak Teman" → Opens Referral ✅
4. Tap "Pencapaian" → Opens Badges ✅

#### C. Test Referral (2 min)
1. Open **Referral** screen
2. **Verify:** Shows 6-char code (e.g., "ABC123")
3. **Verify:** "Copy Link" works
4. **Verify:** Stats: Total: 0, Completed: 0

---

## ✅ Success Checklist

- [ ] 8 tables exist in database
- [ ] 8/8 automated tests pass
- [ ] UsageLimitBadge displays correctly (0/3 → 3/3)
- [ ] UpgradeModal appears on 4th attempt
- [ ] All Settings links work
- [ ] Referral code displays and copies

---

## 📚 Full Documentation

- **Complete Status:** `docs/testing/COMPLETE_IMPLEMENTATION_STATUS.md`
- **Detailed Guide:** `docs/NEXT_STEPS.md`
- **Checklist:** `docs/monetization/MONETIZATION_LAUNCH_CHECKLIST.md`
- **All Docs:** `docs/README.md`

---

## 🐛 Quick Troubleshooting

**Tests fail?**
→ Check: Are you signed in? Database connection OK?

**Can't find test screen?**
→ Navigate to: `exp://localhost:8081/test-analytics`

**UpgradeModal doesn't show?**
→ Check console logs, verify error handling in Dashboard.tsx

**Full troubleshooting:** `docs/testing/COMPLETE_IMPLEMENTATION_STATUS.md`

---

## 🎯 After Testing Passes

Next steps (30 min):
1. Create RevenueCat account
2. Configure products (monthly, yearly, lifetime)
3. Create "razqashop Pro" entitlement
4. Test purchase flow

**Guide:** `docs/monetization/REVENUECAT_DASHBOARD_SETUP.md`

---

**Ready? Start with Step 1: Database Verification ⬆️**
