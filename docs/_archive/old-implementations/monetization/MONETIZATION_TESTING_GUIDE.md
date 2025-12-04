# 🧪 Monetization Testing Guide

**Last Updated:** January 11, 2025  
**Status:** Ready for Testing

---

## 📋 Overview

Panduan ini menjelaskan cara menjalankan end-to-end testing untuk fitur monetization yang telah diimplementasikan di Phase 1.

---

## ⚙️ Pre-requisites

### 1. Database Migration
Pastikan migration `010_monetization_infrastructure.sql` sudah dijalankan:

```bash
# Login ke Supabase Dashboard
# Navigate to SQL Editor
# Run migration file dari: supabase/migrations/010_monetization_infrastructure.sql
```

**Verifikasi:**
```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('usage_limits', 'referrals', 'badges', 'user_badges');

-- Check if functions exist
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('check_and_increment_usage', 'get_usage_status', 'generate_referral_code', 'check_and_award_badges');

-- Check sample badges data
SELECT * FROM badges ORDER BY points_required;
```

### 2. Test User Setup
Buat test user di Supabase Auth (atau gunakan existing user):
- Email: test@parentingai.com
- Password: TestPassword123!
- Tier: Free (default)

---

## 🧪 Automated Testing

### Method 1: Run Integration Tests via UI

1. **Sign in** dengan test user
2. Navigate ke **Settings**
3. Scroll ke bagian **Developer Tools** (hanya muncul di development mode)
4. Tap **"Run Tests"**
5. Review test results:
   - ✅ **Initial Usage Status**: Verifikasi Free tier limits (3 AI tips, 10 chat messages)
   - ✅ **Increment Usage**: Test generate 2 AI tips, cek progress
   - ✅ **Limit Reached**: Test 4th tip harus gagal dengan error
   - ✅ **Chat Limits**: Test 10 chat messages, cek limit reached

**Expected Results:**
- Total: 6 tests
- Passed: 6
- Failed: 0

### Method 2: Run Tests Programmatically

```typescript
// In your code or React Native Debugger console
import { runUsageLimitTests } from './src/tests/usageLimitIntegrationTest';

const results = await runUsageLimitTests();
console.log(results);
```

---

## 📱 Manual Testing Flow

### Test 1: Dashboard Usage Badge Display

**Steps:**
1. Sign in dengan Free tier user
2. Navigate ke **Dashboard**
3. Scroll ke AI Tips section

**Expected:**
- UsageLimitBadge muncul dengan "AI Tips 0/3"
- Progress bar shows 0% (empty)
- Badge color: blue/neutral

---

### Test 2: Generate AI Tips (Within Limit)

**Steps:**
1. Di Dashboard, tap **"Generate Daily Tip"**
2. Observe badge update setelah tip muncul
3. Tap **"Generate Daily Tip"** lagi (2nd tip)
4. Observe badge update
5. Tap **"Generate Daily Tip"** lagi (3rd tip)

**Expected:**
- 1st tip: Badge shows "1/3", progress bar 33%
- 2nd tip: Badge shows "2/3", progress bar 66%
- 3rd tip: Badge shows "3/3", progress bar 100%
- Semua tips berhasil di-generate
- Tidak ada error muncul

---

### Test 3: Limit Reached - Upgrade Modal

**Steps:**
1. Setelah 3 tips ter-generate, tap **"Generate Daily Tip"** lagi (4th attempt)
2. Observe UpgradeModal muncul

**Expected:**
- UpgradeModal appears dengan:
  - Title: "Upgrade to Premium"
  - Message: "You've reached your daily limit for AI Tips"
  - Current usage: "3/3 AI Tips used today"
  - Benefit badges: "Unlimited AI Tips", "Priority Support", dll
  - Two buttons: "Upgrade Now" dan "Cancel"
- No fallback tip generated
- Badge tetap "3/3"

---

### Test 4: Upgrade Modal Navigation

**Steps:**
1. Di UpgradeModal, tap **"Upgrade Now"**

**Expected:**
- Modal closes
- Navigasi ke `/subscription` screen
- SubscriptionScreen shows:
  - Current tier: "Free"
  - Two plan cards: Premium (Rp 29,000) dan Family (Rp 49,000)
  - Feature comparison
  - "Start 7-Day Free Trial" button

---

### Test 5: Settings Navigation

**Steps:**
1. Navigate ke **Settings**
2. Scroll ke "Langganan" section
3. Tap **"Kelola Langganan"**

**Expected:**
- Navigasi ke `/subscription`
- Screen sama seperti Test 4

**Steps:**
4. Back to Settings
5. Scroll ke "Referral & Rewards" section
6. Tap **"Ajak Teman"**

**Expected:**
- Navigasi ke `/referral`
- ReferralScreen shows:
  - Your referral code (auto-generated)
  - Share buttons (WhatsApp, Instagram, Copy Link)
  - Referral stats: 0 total, 0 completed, 0 pending
  - Reward info: "Dapatkan 1 bulan Premium gratis"

**Steps:**
7. Back to Settings
8. Tap **"Pencapaian"**

**Expected:**
- Navigasi ke `/badges`
- BadgeShowcase shows:
  - Filter tabs: All, Activity, Social, Engagement, Growth
  - Badge grid (sample badges dari migration)
  - Locked badges (grey, with lock icon)
  - Progress: "0 / 8 badges earned"

---

### Test 6: Chat Message Limits

**Steps:**
1. Navigate ke **Chat** (atau AI Assistant screen)
2. Send 10 chat messages
3. Try to send 11th message

**Expected:**
- First 10 messages: Berhasil terkirim dan dapat response
- 11th message: Error "USAGE_LIMIT_REACHED"
- UpgradeModal muncul dengan:
  - Current usage: "10/10 Chat Messages used today"
  - Feature: "Chat Messages"

---

### Test 7: Referral Code Generation

**Steps:**
1. Navigate ke `/referral`
2. Observe referral code displayed
3. Note the code (format: XXXXXX, 6 characters uppercase)
4. Tap **"Copy Link"**

**Expected:**
- Referral code is unique per user
- Code is consistent (same user = same code)
- Copy link adds to clipboard: `https://parentingai.app/ref/XXXXXX`
- Toast notification: "Link berhasil disalin!"

---

### Test 8: Badge System (If Implemented)

**Steps:**
1. Complete actions to earn badges:
   - Create 5 activities → "Activity Starter" badge
   - Generate 10 AI tips (across multiple days) → "AI Explorer" badge
   - Refer 1 friend → "Social Butterfly" badge

**Expected:**
- Badges automatically awarded via `check_and_award_badges()` function
- Badge appears unlocked in `/badges` screen
- Points added to user profile

---

## 🔍 Database Verification

After manual testing, verify data in Supabase:

```sql
-- Check usage limits table
SELECT * FROM usage_limits 
WHERE user_id = 'YOUR_USER_ID'
ORDER BY feature, created_at DESC;

-- Check referrals table
SELECT * FROM referrals 
WHERE referrer_id = 'YOUR_USER_ID' OR referred_id = 'YOUR_USER_ID';

-- Check user badges
SELECT ub.*, b.name, b.description 
FROM user_badges ub
JOIN badges b ON ub.badge_id = b.id
WHERE ub.user_id = 'YOUR_USER_ID';
```

**Expected Data:**
- `usage_limits`: 2 rows (ai_tips: 3/3, chat_messages: 10/10)
- `referrals`: 1 row with status='pending', your referral code
- `user_badges`: 0 rows (until badge conditions met)

---

## � Resetting Usage Limits (For Testing)

### Method 1: Using RPC Function (Recommended)

**In Supabase SQL Editor:**
```sql
SELECT force_reset_usage_limits('USER_UUID_HERE');

-- Expected output:
-- {
--   "success": true,
--   "deleted_count": 2,
--   "message": "Deleted 2 usage limit records"
-- }
```

**In TypeScript/Tests:**
```typescript
const { data, error } = await supabase.rpc('force_reset_usage_limits', {
  p_user_id: userId
});

if (data?.success) {
  console.log(`Reset successful: ${data.deleted_count} records deleted`);
}
```

**Why this method:**
- ✅ Bypasses RLS with SECURITY DEFINER
- ✅ Safe for testing environments
- ✅ Returns confirmation with deleted count
- ✅ Used by integration tests

### Method 2: Manual DELETE (Alternative)

**In Supabase SQL Editor (as postgres role):**
```sql
DELETE FROM usage_limits WHERE user_id = 'USER_UUID_HERE';
```

**Note:** This requires postgres superuser role. In tests, use Method 1 (RPC).

---

## �🐛 Common Issues & Solutions

### Issue 1: "Function does not exist"
**Cause:** Migration not fully applied  
**Solution:** Re-run migration, check all 5 functions created (including `force_reset_usage_limits`)

### Issue 2: UpgradeModal tidak muncul
**Cause:** Error handling tidak catch USAGE_LIMIT_REACHED  
**Solution:** 
- Check Dashboard.tsx handleGenerateTip function has try/catch
- Verify usageLimitService.ts throws error: `throw new Error('USAGE_LIMIT_REACHED')`
- Ensure error is re-thrown in catch block

### Issue 3: UsageLimitBadge shows 0/0
**Cause:** getAllUsageStatus() returns null or RPC fails  
**Solution:** 
- Check network inspector for API errors
- Verify user has profile in `profiles` table
- Check if `get_usage_status` RPC returns `current_count` (should default to 0, not null)

### Issue 4: Tests fail with "Cannot delete usage_limits"
**Cause:** RLS policy blocks DELETE operations in tests  
**Solution:** 
- Use `force_reset_usage_limits` RPC instead of direct DELETE
- Updated in usageLimitIntegrationTest.ts lines 30-72, 298-322

### Issue 5: Function parameter order errors
**Cause:** Calling with reversed parameters  
**Solution:**
```typescript
// ✅ CORRECT
await checkAndIncrementUsage('ai_tips', userId);

// ❌ WRONG (old pattern)
await checkAndIncrementUsage(userId, 'ai_tips');
```

### Issue 6: Referral code null
**Cause:** generate_referral_code() function not called on first load  
**Solution:** Call ReferralService.getOrCreateReferralCode() on mount

### Issue 7: TypeScript errors
**Cause:** Type mismatch (FeatureType, UsageStatus, etc.)  
**Solution:** Check service interfaces match component props

---

## ✅ Testing Checklist

### Core Functionality
- [ ] UsageLimitBadge displays correct usage (0/3, 1/3, 2/3, 3/3)
- [ ] Progress bar animates correctly
- [ ] UpgradeModal appears when limit reached
- [ ] Modal shows correct feature and usage count
- [ ] Upgrade button navigates to /subscription
- [ ] Cancel button closes modal

### Navigation
- [ ] Settings → Subscription works
- [ ] Settings → Referral works
- [ ] Settings → Badges works
- [ ] UpgradeModal → Subscription works
- [ ] Back navigation works on all screens

### Services
- [ ] UsageLimitService.getAllUsageStatus() returns correct data
- [ ] UsageLimitService.checkAndIncrementUsage() increments correctly
- [ ] checkAndIncrementUsage() throws error when limit reached (not just returns false)
- [ ] Error is caught and UpgradeModal shown
- [ ] getUsageStatus() returns current_count: 0 (not null) for new users
- [ ] force_reset_usage_limits RPC works for test cleanup
- [ ] ReferralService.getOrCreateReferralCode() generates unique code
- [ ] BadgeService.getEarnedBadges() returns user badges

### UI/UX
- [ ] All screens responsive (iPhone & Android)
- [ ] Loading states show properly
- [ ] Error messages user-friendly
- [ ] Colors match brand (baby blue #CDE9F9, soft pink #F9DDEB)
- [ ] Fonts readable (Poppins/Nunito style)
- [ ] Animations smooth (CustomCard, progress bars)

### Edge Cases
- [ ] First-time user (no usage data) → defaults to Free tier
- [ ] Premium user → unlimited usage, no badges shown
- [ ] Network error handling
- [ ] Offline mode handling
- [ ] Concurrent usage increments (race conditions)

---

## 📊 Success Criteria

Testing dianggap sukses jika:
- ✅ **All automated tests PASS** (6/6 tests)
- ✅ **Manual testing flow complete** without critical bugs
- ✅ **Database data consistent** dengan expected behavior
- ✅ **No TypeScript errors** during compilation
- ✅ **No console errors** during runtime
- ✅ **User experience smooth** and intuitive

---

## 🚀 Next Steps After Testing

1. **Fix any bugs found**
2. **Update MONETIZATION_LAUNCH_CHECKLIST.md** dengan test results
3. **Apply migration to production** Supabase
4. **Deploy to TestFlight/Internal Testing**
5. **Proceed to Phase 2** (AdMob Integration)

---

## 📞 Support

Jika menemukan bugs atau issues:
1. Screenshot error message
2. Check browser/React Native console
3. Check Supabase logs (Edge Functions, Database)
4. Document steps to reproduce
5. Report di project tracker

---

**Happy Testing! 🎉**
