# 🧪 Testing Session - Live Now!

**Status:** ✅ App Running  
**URL:** http://localhost:8081  
**Time:** January 11, 2025

---

## ✅ What's Ready

- [x] Expo development server running
- [x] App accessible at http://localhost:8081
- [x] Database migration applied
- [x] All monetization features integrated

---

## 🎯 Testing Steps (Follow in Order)

### Step 1: Sign In (1 min)

1. Open app at http://localhost:8081
2. If not signed in:
   - Click "Sign In"
   - Use your test account credentials
   - Or create new account

---

### Step 2: Navigate to Developer Tools (30 sec)

1. Click **Settings** tab (bottom navigation)
2. Scroll down to **"Developer Tools"** section
3. You should see **"Run Tests"** button

⚠️ **Note:** Developer Tools only show in development mode (`__DEV__ = true`)

---

### Step 3: Run Automated Tests (2 min)

1. Click **"Run Tests"** button
2. Wait for test execution...
3. Review results:

**Expected Results:**
```
📊 TEST RESULTS SUMMARY
══════════════════════════════════════════════════════

1. ✅ Setup Test User
   Status: PASS
   Message: Test user ready: your@email.com

2. ✅ Initial Usage Status
   Status: PASS
   Message: Free tier limits correctly initialized
   Details: { ai_tips: { limit: 3, current_count: 0 }, ... }

3. ✅ Increment Usage Count
   Status: PASS
   Message: 2 tips generated, 1 remaining

4. ✅ Limit Reached Scenario
   Status: PASS
   Message: USAGE_LIMIT_REACHED error correctly thrown

5. ✅ Chat Message Limits
   Status: PASS
   Message: 10 chat messages used, limit reached correctly

6. ✅ Cleanup Test Data
   Status: PASS
   Message: Test data cleaned successfully

══════════════════════════════════════════════════════
Total: 6 tests
✅ Passed: 6
❌ Failed: 0
══════════════════════════════════════════════════════
```

**If any test fails:** Check troubleshooting section below

---

### Step 4: Manual Testing - Dashboard (3 min)

1. Navigate to **Dashboard** (Home tab)
2. Find the **AI Tips** section
3. Look for **UsageLimitBadge** at the top of AI Tips card

**Test Sequence:**

#### 4.1 Initial State
- Badge should show: **"AI Tips 0/3"**
- Progress bar: Empty (0%)
- Color: Blue

#### 4.2 First Tip
- Click **"Generate Daily Tip"**
- Wait for tip to appear
- Badge should update to: **"AI Tips 1/3"**
- Progress bar: 33% filled

#### 4.3 Second Tip
- Click **"Generate Daily Tip"** again
- Badge updates to: **"AI Tips 2/3"**
- Progress bar: 66% filled

#### 4.4 Third Tip
- Click **"Generate Daily Tip"** again
- Badge updates to: **"AI Tips 3/3"**
- Progress bar: 100% filled (red/orange)

#### 4.5 Fourth Tip (Limit Reached!)
- Click **"Generate Daily Tip"** once more
- **UpgradeModal should appear!**

**Expected Modal:**
```
╔════════════════════════════════════╗
║     Upgrade to Premium             ║
╠════════════════════════════════════╣
║                                    ║
║ You've reached your daily limit    ║
║ for AI Tips                        ║
║                                    ║
║ Current Usage:                     ║
║ 3/3 AI Tips used today            ║
║                                    ║
║ ✨ Premium Benefits:               ║
║ ✓ Unlimited AI Tips                ║
║ ✓ Unlimited Chat Messages          ║
║ ✓ Advanced Analytics               ║
║ ✓ Ad-Free Experience               ║
║ ✓ Priority Support                 ║
║                                    ║
║ [  Upgrade Now  ] [  Cancel  ]    ║
╚════════════════════════════════════╝
```

#### 4.6 Test Navigation
- Click **"Upgrade Now"**
- Should navigate to **Subscription** screen
- Screen shows:
  - Your current plan: **Free**
  - Two plan cards: **Premium** (Rp 29,000) & **Family** (Rp 49,000)
  - Feature comparison
  - **"Start 7-Day Free Trial"** button

---

### Step 5: Manual Testing - Settings Navigation (2 min)

1. Go to **Settings** tab

#### 5.1 Subscription Link
- Find **"Langganan"** section
- Click **"Kelola Langganan"**
- Should open: Subscription screen
- Go back

#### 5.2 Referral Link
- Find **"Referral & Rewards"** section
- Click **"Ajak Teman"**
- Should open: Referral screen
- Verify:
  - Your unique referral code displayed (6 characters)
  - Share buttons: WhatsApp, Instagram, Copy Link
  - Stats: Total referrals (0), Completed (0), Pending (0)
  - Reward info: "Dapatkan 1 bulan Premium gratis"
- Go back

#### 5.3 Badges Link
- Click **"Pencapaian"**
- Should open: Badge Showcase screen
- Verify:
  - Filter tabs: All, Activity, Social, Engagement, Growth
  - Badge grid displayed
  - Locked badges shown with lock icon
  - Progress: "0 / 8 badges earned"

---

### Step 6: Verify Referral Code (1 min)

In Referral screen:

1. Note your referral code (e.g., "ABC123")
2. Click **"Copy Link"**
3. Verify toast message: "Link berhasil disalin!"
4. Paste somewhere to verify format:
   ```
   https://parentingai.app/ref/ABC123
   ```

---

## ✅ Success Checklist

Mark each as you test:

### Automated Tests
- [ ] 6/6 tests PASS
- [ ] No errors in test execution
- [ ] All test cards show green background

### Dashboard - Usage Limits
- [ ] UsageLimitBadge visible
- [ ] Badge shows "0/3" initially
- [ ] Badge updates after each tip: 1/3, 2/3, 3/3
- [ ] Progress bar animates correctly
- [ ] Progress bar color changes (blue → orange → red)

### Dashboard - Upgrade Modal
- [ ] Modal appears on 4th tip attempt
- [ ] Modal shows correct title and message
- [ ] Current usage displayed: "3/3 AI Tips used today"
- [ ] Premium benefits listed
- [ ] Two buttons visible: "Upgrade Now" and "Cancel"
- [ ] "Upgrade Now" navigates to Subscription screen
- [ ] "Cancel" closes modal

### Settings - Navigation
- [ ] "Kelola Langganan" opens Subscription screen
- [ ] "Ajak Teman" opens Referral screen
- [ ] "Pencapaian" opens Badge Showcase screen

### Subscription Screen
- [ ] Current tier displayed: "Free"
- [ ] Two plan cards shown: Premium & Family
- [ ] Pricing visible: Rp 29,000 & Rp 49,000
- [ ] Feature comparison displayed
- [ ] "Start 7-Day Free Trial" button visible

### Referral Screen
- [ ] Referral code displayed (6 characters)
- [ ] Share buttons functional (WhatsApp, Instagram, Copy)
- [ ] "Copy Link" adds to clipboard
- [ ] Stats displayed: 0/0/0
- [ ] Reward info visible

### Badge Showcase
- [ ] Filter tabs functional
- [ ] Badge grid displayed
- [ ] Locked badges shown with grey + lock icon
- [ ] Progress counter: "0 / 8 badges earned"

---

## 🐛 Troubleshooting

### Developer Tools Not Visible
**Cause:** App not in dev mode  
**Fix:** Restart with `npm start` (not production build)

### Tests Fail: "No authenticated user"
**Cause:** Not signed in  
**Fix:** Sign in to app first, then run tests

### Tests Fail: "Function does not exist"
**Cause:** Migration not applied  
**Fix:** 
1. Go to Supabase Dashboard → SQL Editor
2. Run queries from `scripts/verify-migration.sql`
3. Verify 4 functions exist

### UsageLimitBadge Shows "0/0"
**Cause:** `getAllUsageStatus()` failing  
**Fix:**
1. Check Supabase connection (.env file)
2. Verify `get_usage_status` function exists
3. Check RLS policies allow reading `usage_limits`

### UpgradeModal Doesn't Appear
**Cause:** Error not caught properly  
**Fix:**
1. Check console for errors
2. Verify Dashboard.tsx has try-catch in `handleGenerateTip()`
3. Error message must be exactly `'USAGE_LIMIT_REACHED'`

### Navigation Doesn't Work
**Cause:** Route files not found  
**Fix:**
1. Verify files exist: `app/subscription.tsx`, `app/referral.tsx`, `app/badges.tsx`
2. Restart Metro: Stop server, run `npm start --reset-cache`

### Referral Code Not Generated
**Cause:** Function not called or database issue  
**Fix:**
1. Check `generate_referral_code()` function exists in Supabase
2. Verify RLS policies on `referrals` table
3. Check console for errors

---

## 📊 Report Results

After testing, report results by creating checklist update:

**If All Tests Pass (100%):**
```
✅ Phase 1 Testing: COMPLETE
- Automated: 6/6 PASS
- Manual: All scenarios work
- Ready for production!
```

**If Some Tests Fail:**
```
⚠️ Phase 1 Testing: Issues Found
- Automated: X/6 PASS
- Manual: [list failing scenarios]
- Action: [troubleshooting steps taken]
```

---

## 🎉 Next Steps After Testing

### If All Tests Pass:

**Option A: Database Verification**
- Run SQL queries in Supabase Dashboard
- Verify: 8 tables, 4 functions, 8 badges
- Document: `scripts/verify-migration.sql`

**Option B: RevenueCat Setup** ⭐
- Create RevenueCat account
- Configure iOS/Android apps
- Set up products: Premium, Family
- Implement purchase flow

**Option C: Phase 2 (AdMob)**
- Create AdMob account
- Install `react-native-google-mobile-ads`
- Create ad components
- Implement ad placement

**Option D: Production Deployment**
- Apply migration to production Supabase
- Deploy to TestFlight (iOS)
- Deploy to Internal Testing (Android)

---

## 📚 Documentation Reference

- **Full Testing Guide:** [docs/MONETIZATION_TESTING_GUIDE.md](docs/MONETIZATION_TESTING_GUIDE.md)
- **Quick Start:** [MONETIZATION_QUICK_START.md](MONETIZATION_QUICK_START.md)
- **Next Steps:** [NEXT_STEPS.md](NEXT_STEPS.md)
- **Verification:** [MIGRATION_VERIFICATION.md](MIGRATION_VERIFICATION.md)

---

**Current Status:** 🟢 App Running - Ready for Testing!  
**Progress:** 91% Complete (43+ / 47 tasks)

**Let's test! 🚀**
