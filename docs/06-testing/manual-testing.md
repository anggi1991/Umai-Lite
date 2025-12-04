# 🧪 Manual Testing Guide

**Last Updated:** January 11, 2025  
**Status:** ✅ Production-Ready  
**Test Coverage:** 8 major areas, 50+ test scenarios

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Pre-requisites](#pre-requisites)
3. [Test Environment Setup](#test-environment-setup)
4. [Testing Workflows](#testing-workflows)
5. [Feature-Specific Tests](#feature-specific-tests)
6. [Performance Tests](#performance-tests)
7. [Quick Test Checklist](#quick-test-checklist)

---

## 📊 Overview

Panduan lengkap manual testing untuk Parenting AI Assistant, covering all major features dari authentication hingga monetization.

### Testing Goals

- ✅ Verify all features work as expected
- ✅ Ensure UI/UX meets design specifications
- ✅ Validate data persistence and sync
- ✅ Test error handling and edge cases
- ✅ Confirm performance benchmarks
- ✅ Check multi-language support (EN/ID)

### Test Environments

| Environment | URL | Purpose |
|-------------|-----|---------|
| **Local Dev** | http://127.0.0.1:8081 | Development testing |
| **Expo Go** | exp://192.168.x.x:8081 | Device testing |
| **TestFlight** | iOS Beta | Pre-production (iOS) |
| **Internal Testing** | Android Alpha | Pre-production (Android) |

---

## ⚙️ Pre-requisites

### 1. Database Migration

Pastikan semua migrations applied:

\`\`\`bash
# Check applied migrations
supabase migration list

# Apply pending migrations
supabase db push
\`\`\`

**Verify Tables:**
\`\`\`sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'children', 'activities', 'growth_records', 
  'usage_limits', 'referrals', 'badges', 
  'user_badges', 'iap_receipts'
);
\`\`\`

**Expected Result:** 8 tables

### 2. Test User Accounts

Create test users with different tiers:

| Email | Password | Tier | Purpose |
|-------|----------|------|---------|
| free@test.com | Test123! | Free | Test limits |
| premium@test.com | Test123! | Premium | Test unlimited access |
| family@test.com | Test123! | Family | Test multi-child |

---

## 🏗️ Test Environment Setup

### Local Development

\`\`\`bash
# Start development server
npm start

# Open in Expo Go (iOS/Android)
# Scan QR code with camera (iOS) or Expo Go app (Android)

# Open in web browser
w

# Open DevTools (for console logs)
F12 or Cmd+Opt+I
\`\`\`

---

## 🧪 Testing Workflows

### Workflow 1: New User Onboarding

**Test Flow:**
1. Open app (fresh install)
2. Tap "Daftar" (Register)
3. Enter email: newuser@test.com
4. Enter password: NewUser123!
5. Confirm password
6. Tap "Daftar"
7. Verify email (check email or Supabase Auth)
8. Sign in
9. Dashboard loads

**Expected Results:**
- ✅ Registration success
- ✅ Email sent (check Supabase logs)
- ✅ Sign-in successful
- ✅ Dashboard shows empty state (no children yet)
- ✅ Welcome message displayed

### Workflow 2: Add Child & Log Activity

**Test Flow:**
1. Sign in
2. Dashboard → Tap "Tambah Anak"
3. Fill form:
   - Name: "Baby Test"
   - Gender: Male
   - Birth Date: 2024-01-15
   - Relation: Son
4. Tap "Simpan"
5. Dashboard → Tap "Catat Aktivitas"
6. Select activity type: "Feeding"
7. Enter notes: "Breast milk 150ml"
8. Tap "Simpan"
9. View activity in timeline

**Expected Results:**
- ✅ Child created successfully
- ✅ Child appears in dropdown/list
- ✅ Activity logged with correct child
- ✅ Activity shows in timeline
- ✅ Dashboard stats update

### Workflow 3: AI Chat Conversation

**Test Flow:**
1. Sign in
2. Navigate to Chat screen
3. Type message: "Tips makan untuk bayi 6 bulan"
4. Tap send
5. Wait for AI response
6. Verify response is relevant
7. Continue conversation (2-3 messages)

**Expected Results:**
- ✅ Message sent successfully
- ✅ AI response within 5 seconds
- ✅ Response is relevant to parenting
- ✅ Context maintained (follow-up works)
- ✅ Chat history persists

---

## 🎯 Feature-Specific Tests

### 1. Authentication Tests

#### Test 1.1: Email/Password Registration

**Steps:**
1. Tap "Daftar"
2. Enter email: test@example.com
3. Enter password: Test123!
4. Confirm password: Test123!
5. Tap "Daftar"

**Expected:**
- ✅ Validation passes
- ✅ Account created
- ✅ Verification email sent
- ✅ Redirected to sign-in or dashboard

**Edge Cases:**
- ❌ Weak password → Show error
- ❌ Passwords don't match → Show error
- ❌ Email already exists → Show error

#### Test 1.2: Google Sign-In

**Steps:**
1. Tap "Masuk dengan Google"
2. Select Google account
3. Grant permissions

**Expected:**
- ✅ Google popup appears
- ✅ Sign-in successful
- ✅ User data synced (name, email, photo)
- ✅ Dashboard loads

#### Test 1.3: Password Reset

**Steps:**
1. Tap "Lupa Password?"
2. Enter email: test@example.com
3. Tap "Kirim"
4. Check email
5. Click reset link
6. Enter new password
7. Sign in with new password

**Expected:**
- ✅ Reset email sent
- ✅ Reset link works
- ✅ Password updated
- ✅ Sign-in successful with new password

### 2. Child Management Tests

#### Test 2.1: Add Child

**Steps:**
1. Dashboard → "Tambah Anak"
2. Fill form (Name, Gender, Birth Date, Relation)
3. Tap "Simpan"

**Expected:**
- ✅ Child created
- ✅ Appears in child list
- ✅ Can be selected in activities

#### Test 2.2: Edit Child

**Steps:**
1. Child List → Select child
2. Tap "Edit"
3. Change name: "Updated Name"
4. Tap "Simpan"

**Expected:**
- ✅ Child updated
- ✅ Name reflects in all screens

#### Test 2.3: Delete Child

**Steps:**
1. Child List → Select child
2. Tap "Hapus"
3. Confirm deletion

**Expected:**
- ✅ Confirmation dialog appears
- ✅ Child deleted from database
- ✅ Associated activities deleted (cascade)

### 3. Activity Tracking Tests

#### Test 3.1: Log Feeding Activity

**Steps:**
1. Dashboard → "Catat Aktivitas"
2. Select child
3. Select type: "Feeding"
4. Enter notes: "Breast milk 150ml"
5. Tap "Simpan"

**Expected:**
- ✅ Activity saved
- ✅ Shows in timeline
- ✅ Stats update

#### Test 3.2: Log Sleep Activity

**Steps:**
1. "Catat Aktivitas" → "Sleep"
2. Enter duration: 2 hours
3. Notes: "Afternoon nap"
4. Tap "Simpan"

**Expected:**
- ✅ Sleep logged
- ✅ Duration formatted correctly

#### Test 3.3: View Activity History

**Steps:**
1. Navigate to Activities screen
2. View timeline/list
3. Filter by type
4. Filter by date

**Expected:**
- ✅ All activities visible
- ✅ Sorted by date (newest first)
- ✅ Filters work correctly

#### Test 3.4: Delete Activity

**Steps:**
1. Activities → Select activity
2. Tap delete icon
3. Confirm deletion

**Expected:**
- ✅ Confirmation dialog
- ✅ Activity deleted
- ✅ Timeline updates

### 4. Growth Tracker Tests

#### Test 4.1: Log Weight

**Steps:**
1. Growth Tracker → "Weight" tab
2. Tap FAB (+)
3. Enter value: 8.5 kg
4. Tap "Simpan"

**Expected:**
- ✅ Weight logged
- ✅ Current stats update
- ✅ Chart updates

#### Test 4.2: View Growth Chart

**Steps:**
1. Growth Tracker → "Weight" tab
2. View chart (6-month trend)
3. Switch to "Height" tab

**Expected:**
- ✅ Chart renders correctly
- ✅ Data points visible
- ✅ Labels readable

#### Test 4.3: View Growth Trend

**Steps:**
1. Growth Tracker → View current stats
2. Check change indicator (↑ or ↓)
3. Check percentage change

**Expected:**
- ✅ Trend shows correct direction
- ✅ Percentage calculated correctly
- ✅ Green for increase, red for decrease

### 5. AI Chat Tests

#### Test 5.1: Send Message

**Steps:**
1. Navigate to Chat
2. Type: "Tips MPASI untuk bayi 6 bulan"
3. Tap send

**Expected:**
- ✅ Message sent
- ✅ AI responds within 5 seconds
- ✅ Response is relevant
- ✅ No errors in console

#### Test 5.2: Chat History

**Steps:**
1. Send 3-4 messages
2. Close app
3. Reopen app
4. Navigate to Chat

**Expected:**
- ✅ Chat history persists
- ✅ Messages in correct order

#### Test 5.3: Usage Limits (Free Tier)

**Steps:**
1. Sign in as Free user
2. Send 10 messages (Free limit)
3. Try to send 11th message

**Expected:**
- ✅ First 10 messages work
- ✅ 11th message blocked
- ✅ Upgrade modal appears

### 6. Monetization Tests

#### Test 6.1: Usage Limit Badge

**Steps:**
1. Sign in as Free user
2. Dashboard → View "AI Tips 0/3" badge
3. Generate 1 tip
4. Badge updates to "AI Tips 1/3"

**Expected:**
- ✅ Badge displays correctly
- ✅ Progress bar updates
- ✅ Color changes at thresholds

#### Test 6.2: Upgrade Modal

**Steps:**
1. Free user → Generate 4th AI tip
2. Upgrade modal appears

**Expected:**
- ✅ Modal shows current usage (3/3)
- ✅ Lists Premium benefits
- ✅ "Upgrade Now" button works

#### Test 6.3: Subscription Screen

**Steps:**
1. Settings → "Kelola Langganan"
2. View plan cards
3. Tap "Upgrade to Premium"

**Expected:**
- ✅ Current tier displayed
- ✅ Plan cards show features and pricing
- ✅ Button navigates to paywall

#### Test 6.4: Referral Code

**Steps:**
1. Settings → "Ajak Teman"
2. View referral code
3. Tap "Copy Code"
4. Tap "Share on WhatsApp"

**Expected:**
- ✅ 6-character code displayed
- ✅ Copy to clipboard works
- ✅ WhatsApp opens with message

#### Test 6.5: Badge Showcase

**Steps:**
1. Settings → "Pencapaian"
2. View earned badges
3. View locked badges

**Expected:**
- ✅ Earned badges colored
- ✅ Locked badges greyed out
- ✅ Progress indicators visible

### 7. Settings Tests

#### Test 7.1: Language Switching

**Steps:**
1. Settings → "Bahasa"
2. Select "English"
3. Navigate to Dashboard

**Expected:**
- ✅ Language changes immediately
- ✅ All screens reflect new language
- ✅ Persists after app restart

#### Test 7.2: Theme Switching

**Steps:**
1. Settings → "Tema"
2. Select "Dark"

**Expected:**
- ✅ Theme changes immediately
- ✅ Dark colors applied
- ✅ Persists after app restart

#### Test 7.3: Logout

**Steps:**
1. Settings → "Keluar"
2. Confirm logout

**Expected:**
- ✅ Confirmation dialog appears
- ✅ User logged out
- ✅ Redirected to sign-in screen

### 8. Notification Tests

#### Test 8.1: Push Notification

**Steps:**
1. Grant notification permissions
2. Trigger notification
3. Tap notification

**Expected:**
- ✅ Notification received
- ✅ Tapping opens app to correct screen

#### Test 8.2: Local Notification

**Steps:**
1. Set reminder for activity
2. Wait for notification

**Expected:**
- ✅ Notification appears at scheduled time
- ✅ Tapping opens activity screen

---

## 📊 Performance Tests

### Test P.1: App Load Time

**Steps:**
1. Close app completely
2. Start timer
3. Open app
4. Stop timer when Dashboard loads

**Expected:**
- ✅ Load time < 3 seconds (cold start)
- ✅ Load time < 1 second (warm start)

### Test P.2: Image Loading

**Steps:**
1. Navigate to Gallery
2. Observe image load times

**Expected:**
- ✅ Images load within 2 seconds
- ✅ Thumbnails load first
- ✅ Loading skeleton shown

### Test P.3: Offline Functionality

**Steps:**
1. Enable Airplane Mode
2. Navigate to Chat
3. View cached chat history
4. Try to send message

**Expected:**
- ✅ Cached data accessible
- ✅ Graceful error for network actions
- ✅ Queue messages for later (if applicable)

---

## ✅ Quick Test Checklist

For rapid smoke testing (5-10 minutes):

- [ ] **Sign In:** Email/password login works
- [ ] **Dashboard:** Loads without errors
- [ ] **Add Child:** Create test child
- [ ] **Add Activity:** Log feeding activity
- [ ] **Growth Tracker:** Log weight
- [ ] **AI Chat:** Send 1 message, get response
- [ ] **Settings:** Change language (EN → ID)
- [ ] **Navigation:** All tabs accessible
- [ ] **Console:** No errors in DevTools
- [ ] **Performance:** App feels responsive

**Time:** ~10 minutes  
**Pass Criteria:** All checkboxes ✅

---

## 📝 Test Report Template

\`\`\`markdown
### Test Session Report

**Date:** YYYY-MM-DD  
**Tester:** [Name]  
**Environment:** Local Dev / Expo Go / TestFlight  
**Device:** iPhone 14 Pro / Samsung Galaxy S21  

---

#### Test Summary

| Category | Total | Passed | Failed |
|----------|-------|--------|--------|
| Authentication | 3 | 3 | 0 |
| Child Management | 3 | 3 | 0 |
| Activities | 4 | 4 | 0 |
| Growth Tracker | 3 | 3 | 0 |
| AI Chat | 3 | 3 | 0 |
| Monetization | 5 | 5 | 0 |
| Settings | 3 | 3 | 0 |
| Notifications | 2 | 2 | 0 |
| Performance | 3 | 3 | 0 |

**Total:** 29 tests  
**Passed:** 29  
**Failed:** 0  
**Pass Rate:** 100%

---

**Overall Status:** ✅ PASS
\`\`\`

---

## 🎯 Success Criteria

### Definition of "Test Pass"

✅ **Feature Works:**
- All core functionality operates as expected
- No blocking bugs
- UI/UX matches design specs
- Data persists correctly

✅ **Performance:**
- App load < 3s
- No ANR (Application Not Responding)
- Smooth animations (60 FPS)

✅ **Error Handling:**
- Graceful error messages
- No app crashes
- Network errors handled

✅ **Data Integrity:**
- No data loss
- Sync works reliably
- RLS policies enforced

---

## 📚 Resources

- **Automated Tests:** \`src/__tests__/\`
- **Integration Tests:** \`src/tests/usageLimitIntegrationTest.ts\`
- **Test UI:** Settings → Developer Tools → Run Tests
- **Supabase Dashboard:** https://app.supabase.com
- **RevenueCat Dashboard:** https://app.revenuecat.com

---

## 🔄 Continuous Testing

### Daily Smoke Tests (5 min)
- Sign in
- Add activity
- Send chat message
- Check console for errors

### Weekly Regression Tests (30 min)
- Run full checklist
- Test all features
- Update test report

### Pre-Release Tests (2 hours)
- Complete all workflows
- Test on multiple devices
- Performance benchmarking
- Security review

---

**Last Updated:** January 11, 2025  
**Maintained by:** QA Team  
**Status:** ✅ Production-Ready

---

_For automated testing, see \`/docs/06-testing/test-strategy.md\`_  
_For monetization testing, see archived \`MONETIZATION_TESTING_GUIDE.md\`_
