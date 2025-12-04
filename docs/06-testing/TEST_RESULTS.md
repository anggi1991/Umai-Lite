# Testing Results - Umai App

**Test Date**: November 14, 2025  
**Version**: 1.0.0  
**Tester**: [Your Name]  
**Status**: 🔄 IN PROGRESS

---

## Test Summary

| Phase | Total Tests | Passed | Failed | Skipped | Pass Rate | Status |
|-------|-------------|--------|--------|---------|-----------|--------|
| Phase 1: Email Delivery | 6 | 2 | 0 | 4 | 33.3% | 🔄 Testing |
| Phase 2: Authentication | 4 | 3 | 0 | 1 | 75% | ✅ Core Done |
| Phase 3: Core Features | 7 | 0 | 0 | 7 | 0% | ⏳ Pending |
| Phase 4: Performance | 4 | 0 | 0 | 4 | 0% | ⏳ Pending |
| Phase 5: Cross-Platform | 3 | 0 | 0 | 3 | 0% | ⏳ Pending |
| **OVERALL** | **24** | **5** | **0** | **19** | **20.8%** | ⏳ NOT READY |

**Target**: >95% pass rate before launch

---

## Phase 1: Email Delivery Testing

### 1.1 Custom Domain Setup ✅

- [x] **Domain configured**: `umai.naturaerp.id`
- [x] **DNS records added**: SPF, DKIM, DMARC, MX
- [x] **Domain verified**: Resend dashboard ✅
- [x] **Supabase SMTP**: Configured with Resend
- [x] **Test email sent**: Successfully delivered to inbox

**Result**: ✅ **PASS**

---

### 1.2 Email Templates Testing

Test all 6 Supabase email templates with custom domain.

#### Template 1: Confirm Signup Email

**How to Test**:
1. Open app in simulator
2. Sign up with NEW email: `test1@youremail.com`
3. Check email inbox within 30 seconds

**Test Checklist**:
- [x] Email received within 30 seconds ✅
- [x] Sender: "Umai <noreply@umai.naturaerp.id>" ✅
- [x] Subject: "Confirm your signup" ✅
- [x] Email contains:
  - [x] Umai mascot image visible ✅
  - [x] Gradient background (baby blue/pink) ✅
  - [x] "Confirm Email" button (centered, rounded) ✅
  - [x] Verification link works ✅
  - [x] Footer with Privacy/Terms/Support links ✅
  - [x] © 2025 Umai branding ✅
- [x] Lands in INBOX (not spam) ✅
- [x] Mobile responsive (check on phone) ✅
- [x] Links clickable and work correctly ✅

**Result**: ✅ **PASS**

**Notes**: 
```
✅ Email sent successfully from noreply@umai.naturaerp.id
✅ Delivered to inbox (not spam) within 30 seconds
✅ Custom domain email working perfectly
✅ Verification link functional - redirects to app
✅ User successfully verified and logged in
✅ Dashboard displayed after verification
✅ Email template displays Umai branding correctly
```

---

#### Template 2: Reset Password Email

**How to Test**:
1. Open app
2. Click "Forgot Password"
3. Enter email: `test1@youremail.com`
4. Click "Send Reset Link"
5. Check email inbox

**Test Checklist**:
- [ ] Email received within 30 seconds
- [ ] Sender: "Umai <noreply@umai.naturaerp.id>"
- [ ] Subject: "Reset your password"
- [ ] Email contains:
  - [ ] Umai branding
  - [ ] Security warning box (yellow/orange)
  - [ ] "Reset Password" button
  - [ ] Link expiry time (1 hour)
  - [ ] "Didn't request?" message
  - [ ] Support link
- [ ] Reset link works
- [ ] Redirects to password reset page
- [ ] Can set new password
- [ ] Can login with new password

**Result**: ⏳ **PENDING**

**Notes**: 
```
[Add test notes here]
```

---

#### Template 3: Magic Link Email

**How to Test**:
1. Open app
2. Choose "Sign in with Magic Link" (if available)
3. Or test via Supabase dashboard: Auth → Users → Send magic link
4. Check email inbox

**Test Checklist**:
- [ ] Email received within 30 seconds
- [ ] Sender: "Umai <noreply@umai.naturaerp.id>"
- [ ] Subject: "Your magic link"
- [ ] Email contains:
  - [ ] Umai branding
  - [ ] "Sign In" button
  - [ ] One-time use warning
  - [ ] Link expiry (5 minutes)
  - [ ] Security tips
- [ ] Magic link works (one-time)
- [ ] User logged in after click
- [ ] Link expires after use

**Result**: ⏳ **PENDING**

**Notes**: 
```
[Add test notes here]
```

---

#### Template 4: Email OTP (One-Time Password)

**How to Test**:
1. Test via Supabase dashboard: Auth → Settings → Enable "Email OTP"
2. Try login with OTP
3. Check email for code

**Test Checklist**:
- [ ] Email received within 30 seconds
- [ ] Sender: "Umai <noreply@umai.naturaerp.id>"
- [ ] Subject: "Your login code"
- [ ] Email contains:
  - [ ] Umai branding
  - [ ] 6-digit code in large box
  - [ ] Code expiry (10 minutes)
  - [ ] "Didn't request?" warning
  - [ ] Support link
- [ ] Code works when entered
- [ ] Code expires after 10 minutes
- [ ] Old code invalid after new request

**Result**: ⏳ **PENDING**

**Notes**: 
```
[Add test notes here]
```

---

#### Template 5: Email Change Confirmation

**How to Test**:
1. Login to app
2. Go to Settings → Account
3. Click "Change Email"
4. Enter new email
5. Check BOTH old and new email inboxes

**Test Checklist**:
- [ ] Email received within 30 seconds
- [ ] Sender: "Umai <noreply@umai.naturaerp.id>"
- [ ] Subject: "Confirm email change"
- [ ] Email contains:
  - [ ] Umai branding
  - [ ] Old email address shown
  - [ ] New email address shown
  - [ ] "Confirm Change" button
  - [ ] Security warning
  - [ ] Cancel option
- [ ] Confirmation link works
- [ ] Email actually changes
- [ ] Can login with new email
- [ ] Old email no longer works

**Result**: ⏳ **PENDING**

**Notes**: 
```
[Add test notes here]
```

---

#### Template 6: Invite User Email

**How to Test**:
1. Go to Supabase dashboard
2. Auth → Users → Invite user
3. Enter email: `invite@youremail.com`
4. Click "Send invite"
5. Check email inbox

**Test Checklist**:
- [ ] Email received within 30 seconds
- [ ] Sender: "Umai <noreply@umai.naturaerp.id>"
- [ ] Subject: "You've been invited to Umai"
- [ ] Email contains:
  - [ ] Umai branding
  - [ ] Welcome message
  - [ ] App feature highlights (3-4 bullet points)
  - [ ] "Accept Invite" button
  - [ ] Invite expiry (7 days)
  - [ ] App Store/Play Store links
- [ ] Invite link works
- [ ] Can create account via invite
- [ ] Invite expires after 7 days

**Result**: ⏳ **PENDING**

**Notes**: 
```
[Add test notes here]
```

---

### 1.3 Email Deliverability Test

Test email quality and spam score.

**Test with mail-tester.com**:

1. Go to: https://www.mail-tester.com
2. Copy test email address (e.g., `test-abc123@mail-tester.com`)
3. Send test email to that address
4. Click "Then check your score"

**Checklist**:
- [ ] Spam score: ___/10 (Target: 8+/10)
- [ ] SPF: PASS ✅
- [ ] DKIM: PASS ✅
- [ ] DMARC: PASS ✅
- [ ] Blacklist check: PASS ✅
- [ ] Content analysis: No spam triggers

**Test on Multiple Providers**:
- [ ] Gmail: Inbox placement ✅ / Spam ❌
- [ ] Outlook: Inbox placement ✅ / Spam ❌
- [ ] Yahoo: Inbox placement ✅ / Spam ❌

**Result**: ⏳ **PENDING**

**Mail-tester score**: ___/10

**Notes**: 
```
[Add test notes here]
```

---

### 1.4 Performance Metrics

**Email Delivery Time**:
- [ ] Average delivery time: ___ seconds (Target: <30s)
- [ ] Tested on: ___ emails
- [ ] Slowest delivery: ___ seconds
- [ ] Fastest delivery: ___ seconds

**Resend Dashboard Metrics**:
- [ ] Delivery rate: ___% (Target: >99%)
- [ ] Bounce rate: ___% (Target: <2%)
- [ ] Open rate: ___%
- [ ] Click rate: ___%

**Result**: ⏳ **PENDING**

---

## Phase 2: Authentication Flow Testing

### 2.1 Signup Flow

**Test Steps**:
1. Open app → "Sign Up"
2. Enter email: `auth-test@youremail.com`
3. Enter password: `Test123!`
4. Click "Sign Up"
5. Check email for verification
6. Click verification link
7. Redirected to app
8. Login successful

**Checklist**:
- [x] Email validation works (invalid format rejected) ✅
- [x] Password validation works (min 8 chars, complexity) ✅
- [x] "Sign Up" button disabled during submission ✅
- [x] Loading indicator shown ✅
- [x] Verification email sent within 30s ✅
- [x] Verification link works ✅
- [x] User redirected to app after verification ✅
- [x] User logged in automatically ✅
- [x] Welcome screen shown (Dashboard) ✅

**Edge Cases**:
- [ ] Already registered email → Error shown (NOT TESTED)
- [ ] Weak password → Error shown (NOT TESTED)
- [ ] Network error → Retry option shown (NOT TESTED)
- [ ] Email already verified → Skip verification (NOT TESTED)

**Result**: ✅ **PASS** (Core flow working, edge cases not tested)

---

### 2.2 Login Flow

**Test Steps**:
1. Open app → "Sign In"
2. Enter email: `auth-test@youremail.com`
3. Enter password: `Test123!`
4. Click "Sign In"
5. Dashboard shown

**Checklist**:
- [x] Correct credentials → Login successful ✅
- [x] Wrong password → Error message shown (notif :
login gagal
invalid login cridential)
- [ ] Unregistered email → Error message shown (NOT TESTED)
- [x] Loading indicator shown ✅
- [ ] Biometric login option (Face ID/Touch ID) (NOT TESTED)
- [ ] "Remember me" option works (NOT TESTED)
- [ ] Session persists after app restart (NOT TESTED)

**Result**: ✅ **PASS** (Core flow working)

---

### 2.3 Password Reset Flow

**Test Steps**:
1. Click "Forgot Password"
2. Enter email: `auth-test@youremail.com`
3. Click "Send Reset Link"
4. Check email
5. Click reset link
6. Enter new password: `NewTest123!`
7. Click "Reset Password"
8. Login with new password

**Checklist**:
- [x] Reset email sent within 30s ✅
- [x] Reset link works ✅
- [x] Password reset page shown ✅
- [x] Can set new password ✅
- [x] Password validation works ✅
- [x] Success message shown ✅
- [x] Can login with new password ✅
- [x] Old password no longer works ✅

**Edge Cases**:
- [ ] Expired link (>1 hour) → Error shown (NOT TESTED)
- [ ] Link reuse → Error shown (NOT TESTED)
- [ ] Non-existent email → Silent success (NOT TESTED)

**Result**: ✅ **PASS** (Core flow working)

**Note**: Email went to spam (using Supabase default, not Resend custom domain for reset emails), but link still functional

---

### 2.4 Logout Flow

**Test Steps**:
1. Login to app
2. Go to Settings
3. Click "Logout"
4. Confirm logout

**Checklist**:
- [ ] Logout confirmation dialog shown
- [ ] User logged out
- [ ] Redirected to login screen
- [ ] Session cleared
- [ ] Biometric data cleared
- [ ] Can't access protected routes
- [ ] Cache cleared (if applicable)

**Result**: ⏳ **PENDING**

---

## Phase 3: Core Features Testing

*[To be filled during testing]*

---

## Phase 4: Performance & Security Testing

*[To be filled during testing]*

---

## Phase 5: Cross-Platform Testing

*[To be filled during testing]*

---

## Bugs Found

### Bug #1: Missing "Forgot Password" Link on Login Screen

**Severity**: P1 (Critical) - Blocks password reset testing  
**Platform**: Both (iOS/Android)  
**Found in**: Phase 2, Test 2.3 (Password Reset Flow)

**Description**:
```
Login screen (app/(auth)/signin.tsx) does not have "Forgot Password" link.
Users cannot initiate password reset flow from the app.
```

**Steps to Reproduce**:
1. Open app
2. Navigate to Sign In screen
3. Look for "Forgot Password" link
4. Link not found

**Expected Behavior**:
```
Login screen should have "Forgot Password?" link below password field or near submit button.
Clicking it should navigate to password reset screen or open dialog to enter email.
```

**Actual Behavior**:
```
No "Forgot Password" link present on login screen.
Users cannot reset password from app (must use Supabase dashboard or direct link).
```

**Impact**:
- Users with forgotten passwords cannot recover accounts
- Poor UX - common feature missing
- Cannot test password reset flow (Test 2.3 blocked)

**Suggested Fix**:
Add TextButton "Forgot Password?" in signin.tsx that navigates to password reset screen or triggers reset flow.

**Fix Implemented**:
- Added "Forgot Password?" link to signin screen
- Created reset password screen (app/(auth)/reset-password.tsx)
- Added resetPassword function to AuthContext
- Added translations (EN + ID)

**Status**: � Fixed (Commits: 733ac33, f518bde, 730d496)

---

### Bug #2: Add Reminder Form Not Multilingual

**Severity**: P2 (Major) - UX issue, not blocking  
**Platform**: Both (iOS/Android)  
**Found in**: Phase 3, Reminders Feature Test

**Description**:
```
Add Reminder form shows hardcoded Indonesian text instead of using i18n translations.
Form labels: "Tipe Reminder *", "Waktu *", "Catatan (opsional)", "* Wajib diisi"
Should switch between English/Indonesian based on app language setting.
```

**Steps to Reproduce**:
1. Navigate to Reminders
2. Click "Add Reminder" button
3. Form shows Indonesian text regardless of language setting

**Expected Behavior**:
```
Form should use i18n translations:
- "Tipe Reminder" → "Reminder Type"
- "Waktu" → "Time"
- "Catatan (opsional)" → "Notes (optional)"
- "* Wajib diisi" → "* Required"
```

**Actual Behavior**:
```
Form always shows Indonesian text, even when app language is English.
```

**Status**: 🔴 Open

---

### Bug #3: Notification Icon Not Clickable

**Severity**: P1 (Critical) - Blocks user notifications  
**Platform**: Both (iOS/Android)  
**Found in**: Phase 3, Dashboard/Header Test

**Description**:
```
Notification bell icon in header does not respond to taps.
Users cannot view notifications or manage notification settings.
```

**Steps to Reproduce**:
1. Look at top header (notification bell icon)
2. Tap notification icon
3. Nothing happens

**Expected Behavior**:
```
Tapping notification icon should:
- Open notifications panel/screen
- Show unread notification count badge
- Allow users to view and manage notifications
```

**Actual Behavior**:
```
Icon is visible but not interactive. No response to taps.
```

**Status**: 🔴 Open

---

### Bug #4: Three Dots Menu Not Clickable

**Severity**: P1 (Critical) - Blocks menu access  
**Platform**: Both (iOS/Android)  
**Found in**: Phase 3, Navigation Test

**Description**:
```
Three dots (⋮) menu button in header does not respond to taps.
Users cannot access additional options/settings from this menu.
```

**Steps to Reproduce**:
1. Look at top header (three dots icon)
2. Tap three dots menu
3. Nothing happens

**Expected Behavior**:
```
Tapping three dots should open dropdown menu with options like:
- Settings
- Help
- About
- Logout (possibly)
```

**Actual Behavior**:
```
Icon visible but not interactive. No menu opens.
```

**Status**: 🔴 Open

---

### Bug #5: Search Button Blank on Android (Journal Popup)

**Severity**: P2 (Major) - Android-specific issue  
**Platform**: Android only  
**Found in**: Phase 3, Journal Feature Test

**Description**:
```
Search button in journal popup dialog shows blank/no icon on Android.
Button is visible on iOS but missing on Android.
```

**Steps to Reproduce**:
1. Open Journal screen
2. Look at search button in popup
3. On Android: button appears blank

**Expected Behavior**:
```
Search button should show search icon (magnifying glass) consistently across platforms.
```

**Actual Behavior**:
```
iOS: Search icon visible ✅
Android: Button blank/no icon ❌
```

**Status**: 🔴 Open

---

### Bug #6: Chat History Lost When Navigating Away

**Severity**: P0 (Blocker) - Critical UX issue  
**Platform**: Both (iOS/Android)  
**Found in**: Phase 3, AI Chat Test

**Description**:
```
Chat messages disappear when user navigates to another screen and returns to chat.
This is a critical bug as users lose their conversation history.
```

**Steps to Reproduce**:
1. Navigate to AI Chat
2. Send message: "Hello"
3. AI responds
4. Navigate to another screen (Dashboard, Settings, etc.)
5. Return to AI Chat
6. Chat history is gone - screen is empty

**Expected Behavior**:
```
Chat history should persist:
- Messages stored in database (Supabase)
- Messages loaded when returning to chat screen
- Conversation continues from where user left off
```

**Actual Behavior**:
```
All messages disappear when navigating away.
User must start new conversation each time.
```

**Impact**:
- Users cannot maintain conversation context
- Poor UX - frustrating experience
- Defeats purpose of AI assistant
- Cannot reference previous advice

**Status**: 🔴 Open - **CRITICAL**

---

### Bug #7: [Next bug if found]

---

## Sign-Off

### Critical (100% Required)
- [ ] All email templates working
- [ ] Signup/login working
- [ ] Email verification working
- [ ] No app crashes
- [ ] Data persistence working

### High Priority (>95% Required)
- [ ] All core features working
- [ ] Performance targets met
- [ ] Cross-platform tested
- [ ] Security audit passed

### Launch Decision

**Overall Pass Rate**: ___% (Target: >95%)

**Decision**: 
- [ ] ✅ READY FOR LAUNCH
- [ ] ⏳ NEEDS MORE TESTING
- [ ] ❌ NOT READY (critical bugs)

**Sign-off**: ________________  
**Date**: ________________

---

**Last Updated**: November 14, 2025  
**Next Review**: [Date]
