# 🧪 Testing Infrastructure Setup - Umai

Complete testing checklist before production deployment.

---

## 📋 Pre-Deployment Testing Phases

### Phase 1: Email Delivery Testing ✅
### Phase 2: Authentication Flow Testing ✅
### Phase 3: Core Features Testing ✅
### Phase 4: Performance & Security Testing ✅
### Phase 5: Cross-Platform Testing ✅

---

## Phase 1: Email Delivery Testing

### 1.1 Supabase Email Templates Verification

- [ ] **Confirm Signup Email**
  - Subject: "Welcome to Umai - Verify Your Email 👶"
  - Template contains `{{ .ConfirmationURL }}`
  - Mascot image loads: `https://parentingai.netlify.app/mascot/buddy-concise.png`
  - All URLs point to `parentingai.netlify.app` (not localhost)
  - Footer links work (Privacy, Terms, Website)
  - Umai branding correct throughout
  
- [ ] **Reset Password Email**
  - Subject: "🔑 Reset Your Umai Password"
  - Template contains `{{ .ConfirmationURL }}` and `{{ .Email }}`
  - Security tips display correctly
  - Warning box visible and clear
  - 1-hour expiry notice visible
  
- [ ] **Magic Link Email** (if enabled)
  - Subject: "🔐 Your Instant Login Link - Umai"
  - One-time use warning clear
  - Security warnings prominent
  
- [ ] **Email OTP** (if enabled)
  - Subject: "🔐 Your Verification Code - Umai"
  - Code box prominent: `{{ .Token }}`
  - 10-minute expiry notice
  
- [ ] **Email Change Confirmation** (if enabled)
  - Subject: "📧 Confirm Your Email Change - Umai"
  - Old/New email display correctly
  - Security warning visible
  
- [ ] **Invite User** (if enabled)
  - Subject: "🎁 You're Invited to Join Umai!"
  - Feature list displays correctly
  - 7-day expiry notice

### 1.2 Email Deliverability Test

**Test Recipients** (use all 3 major providers):
- [ ] Gmail account: `test@gmail.com`
- [ ] Outlook account: `test@outlook.com`
- [ ] Yahoo account: `test@yahoo.com`

**For Each Provider, Check**:
- [ ] Email arrives in **Inbox** (not Spam/Junk)
- [ ] Sender shows: `Umai <noreply@umai.app>` or configured email
- [ ] Subject line displays correctly (no encoding issues)
- [ ] HTML renders properly (images, colors, buttons)
- [ ] CTA buttons are clickable
- [ ] Links work correctly
- [ ] Mascot image loads
- [ ] Mobile responsive (test on phone)

**Email Headers Verification**:
```bash
# Check in email client → View Original/Show Headers
DKIM-Signature: PASS
SPF: PASS
DMARC: PASS
```

### 1.3 Spam Score Test

1. Go to https://www.mail-tester.com
2. Send test email to provided address
3. Check score (must be **8/10 or higher**)
4. Fix any issues flagged:
   - Missing SPF/DKIM
   - Spam trigger words
   - Poor HTML structure
   - Missing plain text version

### 1.4 Email Performance Test

**Resend Dashboard → Logs**:
- [ ] All test emails show status: **Delivered** (not Bounced)
- [ ] Delivery time < 5 seconds
- [ ] No "Soft Bounce" or "Hard Bounce" errors
- [ ] No "Complaint" (marked as spam) events

---

## Phase 2: Authentication Flow Testing

### 2.1 Signup Flow

**Test on Both iOS & Android**:

- [ ] **Step 1: Enter Email/Password**
  - [ ] Email validation works (invalid format shows error)
  - [ ] Password strength indicator visible
  - [ ] Minimum 6 characters enforced
  - [ ] Terms & Privacy links work
  
- [ ] **Step 2: Email Verification**
  - [ ] Verification email arrives within 30 seconds
  - [ ] Subject: "Welcome to Umai - Verify Your Email 👶"
  - [ ] Click "Verify My Email" button
  - [ ] Redirects to website: `https://parentingai.netlify.app`
  - [ ] Success message shown on website
  
- [ ] **Step 3: First Login**
  - [ ] Return to mobile app
  - [ ] Email marked as verified in Supabase
  - [ ] User can login successfully
  - [ ] Dashboard loads with welcome card

**Edge Cases**:
- [ ] Already verified email → Show friendly message
- [ ] Expired verification link (>24 hours) → Show "Request new link"
- [ ] Invalid verification token → Show error message
- [ ] Network error during signup → Show retry button

### 2.2 Login Flow

- [ ] **Normal Login**
  - [ ] Correct email/password → Login successful
  - [ ] Remember me works (stays logged in after app restart)
  - [ ] Welcome back message shows user's name
  
- [ ] **Failed Login**
  - [ ] Wrong password → "Invalid credentials" error
  - [ ] Non-existent email → "User not found" error
  - [ ] Unverified email → "Please verify your email" message
  
- [ ] **Biometric Login** (if implemented)
  - [ ] Face ID/Touch ID prompt appears
  - [ ] Successful auth → Auto-login
  - [ ] Failed auth → Fallback to password

### 2.3 Password Reset Flow

- [ ] **Step 1: Request Reset**
  - [ ] Enter email address
  - [ ] Tap "Send Reset Link"
  - [ ] Success toast: "Reset email sent"
  
- [ ] **Step 2: Email Verification**
  - [ ] Email arrives within 30 seconds
  - [ ] Subject: "🔑 Reset Your Umai Password"
  - [ ] Click "Reset Password Now" button
  - [ ] Redirects to reset page
  
- [ ] **Step 3: Set New Password**
  - [ ] Enter new password (min 6 chars)
  - [ ] Confirm password matches
  - [ ] Security tips visible
  - [ ] Click "Save Password"
  - [ ] Success message shown
  
- [ ] **Step 4: Login with New Password**
  - [ ] Return to mobile app
  - [ ] Login with new password → Success
  - [ ] Old password no longer works

**Edge Cases**:
- [ ] Expired reset link (>1 hour) → "Link expired, request new one"
- [ ] Link used twice → "Link already used"
- [ ] Non-existent email → "If account exists, email sent" (security)

### 2.4 Logout Flow

- [ ] Logout clears session
- [ ] Redirects to login screen
- [ ] Biometric data cleared (if applicable)
- [ ] Can't access protected routes after logout
- [ ] Re-login works correctly

---

## Phase 3: Core Features Testing

### 3.1 Child Profile Management

- [ ] **Add Child**
  - [ ] Name, gender, birthdate fields work
  - [ ] Date picker opens correctly
  - [ ] Photo upload works (from gallery & camera)
  - [ ] Save button creates profile
  - [ ] Profile appears in list
  
- [ ] **Edit Child**
  - [ ] All fields editable
  - [ ] Photo can be changed
  - [ ] Save updates database
  - [ ] Changes reflect immediately
  
- [ ] **Delete Child**
  - [ ] Confirmation dialog shows
  - [ ] Delete removes from list
  - [ ] Associated data handled correctly (activities, growth records)

### 3.2 Dashboard

- [ ] **Welcome Card**
  - [ ] Shows user's name
  - [ ] Umai mascot animates
  - [ ] "You + Me + AI 🤗" tagline visible
  
- [ ] **Quick Actions**
  - [ ] All 6 action cards visible
  - [ ] Icons display correctly
  - [ ] Tapping navigates to correct screen
  
- [ ] **Activity Summary**
  - [ ] Recent activities list populates
  - [ ] Empty state shows friendly message
  - [ ] Umai mascot in empty state

### 3.3 AI Chat (Umai Assistant)

- [ ] **Chat Interface**
  - [ ] Header shows "Umai" (not "Baby Buddy")
  - [ ] Chat bubbles styled correctly (user vs AI)
  - [ ] Input field works smoothly
  - [ ] Send button enabled when text entered
  
- [ ] **AI Responses**
  - [ ] Welcome message: "Hi! I'm Umai, your AI assistant..."
  - [ ] AI personality setting applies (friendly/professional/etc.)
  - [ ] Responses contextual and relevant
  - [ ] Typing indicator shows "Umai is thinking..."
  - [ ] Error handling for API failures
  
- [ ] **Chat History**
  - [ ] Messages persist after app restart
  - [ ] Multiple chat sessions supported
  - [ ] Export chat works
  - [ ] Delete chat works
  - [ ] Clear chat confirmation

### 3.4 Growth Tracker

- [ ] **Add Record**
  - [ ] Weight, height, head circumference inputs work
  - [ ] Date picker defaults to today
  - [ ] Units display correctly (kg/cm)
  - [ ] Save creates record
  
- [ ] **View Chart**
  - [ ] Growth curve displays
  - [ ] WHO percentile lines visible
  - [ ] Data points plotted correctly
  - [ ] Zoom/pan works (if implemented)
  
- [ ] **Empty State**
  - [ ] Umai mascot visible
  - [ ] "Add first measurement" message
  - [ ] CTA button prominent

### 3.5 Photo Gallery

- [ ] **Upload Photo**
  - [ ] Camera permission requested
  - [ ] Gallery permission requested
  - [ ] Photo uploads successfully
  - [ ] Thumbnail generates
  - [ ] Full image viewable
  
- [ ] **Add Caption**
  - [ ] Caption input works
  - [ ] Emoji picker (if implemented)
  - [ ] Save persists caption
  
- [ ] **Delete Photo**
  - [ ] Confirmation dialog
  - [ ] Delete removes from storage
  - [ ] Thumbnail removed from grid

### 3.6 Reminders

- [ ] **Create Reminder**
  - [ ] Title, description fields
  - [ ] Time picker works
  - [ ] Repeat options (daily/weekly)
  - [ ] Notification permission requested
  - [ ] Save creates reminder
  
- [ ] **Notification**
  - [ ] Push notification arrives on time
  - [ ] Notification content correct
  - [ ] Tapping opens app to reminder
  
- [ ] **Edit/Delete**
  - [ ] Edit updates reminder
  - [ ] Delete removes reminder
  - [ ] Mark as done updates status

### 3.7 Settings

- [ ] **Mascot Customization**
  - [ ] Title: "🤗 Umai Mascot" (not "Baby Buddy")
  - [ ] 4 expressions available (happy, waving, thumbs-up, sleeping)
  - [ ] Selection persists
  - [ ] Preview updates immediately
  - [ ] Syncs across app (Dashboard, Chat, etc.)
  
- [ ] **AI Personality**
  - [ ] 4 personas: Friendly, Professional, Encouraging, Concise
  - [ ] Sample responses shown
  - [ ] Selection persists
  - [ ] Affects AI chat responses
  
- [ ] **Language**
  - [ ] English/Indonesian toggle
  - [ ] UI text updates immediately
  - [ ] Preference persists
  
- [ ] **Links**
  - [ ] Privacy Policy opens: `https://parentingai.netlify.app/privacy-policy`
  - [ ] Terms opens: `https://parentingai.netlify.app/terms`
  - [ ] Support opens: `https://parentingai.netlify.app/support`
  
- [ ] **Logout**
  - [ ] Confirmation dialog
  - [ ] Clears session
  - [ ] Returns to login

---

## Phase 4: Performance & Security Testing

### 4.1 Performance Metrics

**Target Benchmarks**:
- [ ] App launch time < 3 seconds (cold start)
- [ ] Screen navigation < 300ms
- [ ] API response time < 2 seconds
- [ ] Image upload < 5 seconds (1MB file)
- [ ] Smooth 60 FPS scrolling (no jank)

**Test Tools**:
- React Native Performance Monitor (shake device → Show Perf Monitor)
- Expo Dev Tools → Performance tab
- Flipper (for detailed profiling)

### 4.2 Offline Functionality

- [ ] **Offline Detection**
  - [ ] Banner shows "No internet connection"
  - [ ] Retry button appears
  - [ ] Auto-reconnect when online
  
- [ ] **Data Persistence**
  - [ ] Chat messages cached locally
  - [ ] Child profiles accessible offline
  - [ ] Settings persist offline
  
- [ ] **Sync on Reconnect**
  - [ ] Pending actions sync automatically
  - [ ] No data loss
  - [ ] Conflict resolution works

### 4.3 Security Testing

- [ ] **Authentication**
  - [ ] JWT tokens expire correctly
  - [ ] Refresh token works
  - [ ] Session hijacking prevented
  - [ ] XSS/CSRF protections enabled
  
- [ ] **Data Privacy**
  - [ ] Child photos not publicly accessible
  - [ ] User data encrypted at rest
  - [ ] API keys not exposed in client
  - [ ] Sensitive data not logged
  
- [ ] **Permissions**
  - [ ] Users only see their own data
  - [ ] RLS policies enforced (Supabase)
  - [ ] No unauthorized API access

### 4.4 Error Handling

- [ ] **Network Errors**
  - [ ] Graceful degradation
  - [ ] User-friendly error messages
  - [ ] Retry mechanism
  
- [ ] **API Errors**
  - [ ] 400 Bad Request → Show field validation
  - [ ] 401 Unauthorized → Force re-login
  - [ ] 500 Server Error → "Please try again"
  - [ ] Timeout → "Server not responding"
  
- [ ] **Crash Recovery**
  - [ ] App doesn't crash on unexpected data
  - [ ] Error boundaries catch React errors
  - [ ] Sentry/Bugsnag logging (if integrated)

---

## Phase 5: Cross-Platform Testing

### 5.1 iOS Testing

**Devices** (test on minimum 3):
- [ ] iPhone 15 Pro (iOS 17) - Latest flagship
- [ ] iPhone 12 (iOS 16) - Mid-range
- [ ] iPhone SE 2020 (iOS 15) - Budget/older

**OS-Specific Tests**:
- [ ] Face ID login works
- [ ] Push notifications arrive
- [ ] App Store screenshots match branding
- [ ] No visual glitches in dark mode (if supported)
- [ ] Share sheet works (Export chat)

### 5.2 Android Testing

**Devices** (test on minimum 3):
- [ ] Samsung Galaxy S23 (Android 13) - Flagship
- [ ] Google Pixel 6 (Android 12) - Stock Android
- [ ] Xiaomi Redmi Note (Android 11) - Budget

**OS-Specific Tests**:
- [ ] Fingerprint login works
- [ ] Push notifications arrive
- [ ] Back button behavior correct
- [ ] No visual glitches (various screen sizes)
- [ ] Share intent works

### 5.3 Screen Sizes

- [ ] Small phones (iPhone SE, 320px width)
- [ ] Regular phones (iPhone 13, 375-390px)
- [ ] Large phones (iPhone Pro Max, 428px)
- [ ] Tablets (iPad, 768px+) - optional

**Layout Tests**:
- [ ] No text cutoff
- [ ] Buttons accessible (not off-screen)
- [ ] Proper padding/margins
- [ ] Images scale correctly

---

## 🐛 Bug Tracking Template

Use this format to report bugs during testing:

```markdown
## Bug #001: [Short Description]

**Severity**: Critical | High | Medium | Low
**Platform**: iOS | Android | Both
**Device**: iPhone 15 Pro, iOS 17.2
**Steps to Reproduce**:
1. Open app
2. Navigate to Settings
3. Tap "Logout"
4. ...

**Expected Behavior**:
User should be logged out and redirected to login screen.

**Actual Behavior**:
App crashes with white screen.

**Screenshots**:
[Attach screenshot or screen recording]

**Console Logs**:
```
Error: Cannot read property 'user' of null
at Settings.tsx:123
```

**Priority**: P0 (blocker) | P1 (must fix) | P2 (should fix) | P3 (nice to have)
```

---

## ✅ Sign-Off Checklist

Before declaring "ready for production":

### Critical (Must Pass 100%)
- [ ] All signup/login flows work
- [ ] Email delivery 100% success rate
- [ ] No crash bugs
- [ ] Data persistence works
- [ ] Security vulnerabilities addressed

### High Priority (Must Pass >95%)
- [ ] All core features functional
- [ ] Performance metrics met
- [ ] Cross-platform compatibility
- [ ] Error handling robust

### Medium Priority (Must Pass >80%)
- [ ] UI polish complete
- [ ] Edge cases handled
- [ ] Offline mode works
- [ ] Accessibility guidelines followed

### Nice-to-Have (Optional)
- [ ] Dark mode (if time permits)
- [ ] Advanced animations
- [ ] Additional languages
- [ ] Tablet optimization

---

## 📊 Test Results Summary

| Test Phase | Pass Rate | Status | Notes |
|------------|-----------|--------|-------|
| Email Delivery | 0/6 | ⏳ Pending | Templates ready, awaiting Resend |
| Authentication | 0/4 | ⏳ Pending | - |
| Core Features | 0/7 | ⏳ Pending | - |
| Performance | 0/4 | ⏳ Pending | - |
| Cross-Platform | 0/3 | ⏳ Pending | - |
| **OVERALL** | **0%** | ⏳ **NOT READY** | Testing in progress |

**Target for Launch**: >95% pass rate across all phases

---

## 🚀 Next Steps After Testing

1. **Fix critical bugs** (P0/P1)
2. **Retest failed scenarios**
3. **Update app store assets** (screenshots, descriptions)
4. **Submit for review** (iOS App Store / Google Play)
5. **Monitor production** (first 48 hours critical)

---

**Testing Started**: [DATE]  
**Testing Completed**: [DATE]  
**Tester**: [NAME]  
**App Version**: 1.0.0  
**Build Number**: [BUILD]
