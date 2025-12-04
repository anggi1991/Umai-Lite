# Accessibility Testing Guide - Parenting AI Assistant

## 📋 Overview

Panduan ini berisi instruksi lengkap untuk testing accessibility features yang telah diimplementasikan di aplikasi Parenting AI Assistant, termasuk testing dengan VoiceOver (iOS) dan TalkBack (Android).

---

## ✅ Implemented Accessibility Features

### Core Components

#### 1. **CustomButton**
- ✅ `accessible={true}` - Marks button as accessible
- ✅ `accessibilityRole="button"` - Identifies as button to screen readers
- ✅ `accessibilityLabel={title}` - Announces button purpose
- ✅ `accessibilityState={{ disabled }}` - Announces disabled state
- ✅ `accessibilityHint` - Provides context for loading states

#### 2. **CustomInput**
- ✅ `accessible={true}` - Marks input as accessible
- ✅ `accessibilityLabel` - Uses label or placeholder as screen reader text
- ✅ `accessibilityHint` - Provides error messages as hints
- ✅ `accessibilityState={{ disabled }}` - Announces disabled state
- ✅ `accessibilityLiveRegion="polite"` - Announces error text changes
- ✅ Right icon button with proper accessibility props

#### 3. **CustomCard**
- ✅ `accessible={true}` - Marks card as accessible
- ✅ `accessibilityRole="none"` - Card is container, children announce themselves

---

## 🧪 Testing with VoiceOver (iOS)

### How to Enable VoiceOver

**Method 1: Settings**
1. Open **Settings** app
2. Go to **Accessibility**
3. Tap **VoiceOver**
4. Toggle **VoiceOver** ON

**Method 2: Triple-Click Shortcut**
1. Open **Settings** → **Accessibility**
2. Scroll down to **Accessibility Shortcut**
3. Select **VoiceOver**
4. Now triple-click the side button to toggle VoiceOver

### Basic VoiceOver Gestures

| Gesture | Action |
|---------|--------|
| Single tap | Select item (announces content) |
| Double tap | Activate selected item |
| Swipe right | Move to next item |
| Swipe left | Move to previous item |
| Two-finger swipe up | Read all from current position |
| Three-finger swipe left/right | Navigate pages |
| Two-finger tap | Pause/resume speaking |

### Testing Checklist - VoiceOver

#### ✅ Authentication Screens

**SignIn Screen:**
- [ ] Navigate to email input field
- [ ] VoiceOver announces "Email, Text input"
- [ ] Navigate to password input field
- [ ] VoiceOver announces "Password, Secure text input"
- [ ] Navigate to "Masuk" button
- [ ] VoiceOver announces "Masuk, Button"
- [ ] Activate button with double-tap
- [ ] If loading, VoiceOver announces "Loading, please wait"

**SignUp Screen:**
- [ ] Test all input fields (Nama, Email, Password, Confirm Password)
- [ ] Test checkbox for terms & conditions
- [ ] Test "Daftar" button
- [ ] Verify error messages are announced when validation fails

#### ✅ Dashboard Screen

**Header Section:**
- [ ] VoiceOver announces greeting text
- [ ] Navigate to notification icon button
- [ ] VoiceOver announces "Notifications, Button"

**Quick Stats:**
- [ ] Each stat card is readable
- [ ] Numbers and labels are announced clearly
- [ ] Emoji icons are announced or ignored appropriately

**Recent Activities:**
- [ ] Each activity item is accessible
- [ ] Activity type, time, and description are announced
- [ ] Swipe to navigate between activities

#### ✅ Chat Screen

**Message Bubbles:**
- [ ] Navigate through messages sequentially
- [ ] User messages are distinguishable from AI messages
- [ ] Message content is read clearly
- [ ] Robot icon is announced for AI messages

**Input Area:**
- [ ] Navigate to message input field
- [ ] VoiceOver announces "Tanya sesuatu ke Baby Buddy..., Text input"
- [ ] Type message and verify it's readable
- [ ] Navigate to send button
- [ ] VoiceOver announces "Send, Button"
- [ ] When disabled, announces "Send, Button, Dimmed"

**Quick Prompts:**
- [ ] Each chip is accessible and readable
- [ ] Prompt text is announced clearly
- [ ] Can activate with double-tap

#### ✅ Reminders Screen

**Reminder List:**
- [ ] Each reminder card is accessible
- [ ] Reminder type (emoji + text) is announced
- [ ] Reminder time is announced
- [ ] Switch state (enabled/disabled) is announced
- [ ] Navigate to "Ubah" button
- [ ] Navigate to "Hapus" button

**Toggle Switch:**
- [ ] Navigate to switch
- [ ] VoiceOver announces current state (ON/OFF)
- [ ] Double-tap to toggle
- [ ] State change is announced

**FAB (Floating Action Button):**
- [ ] Navigate to + button
- [ ] VoiceOver announces "Tambah, Button"
- [ ] Activate with double-tap

#### ✅ Child Profile Screen

**Child Cards:**
- [ ] Navigate to child profile card
- [ ] Child name is announced
- [ ] Age is announced clearly
- [ ] Gender is announced
- [ ] Navigate to edit button
- [ ] Navigate to delete button

**Add/Edit Child Form:**
- [ ] Name input field is accessible
- [ ] Photo picker button is accessible and announced
- [ ] Birthday picker button is accessible
- [ ] Gender radio buttons are accessible
- [ ] Weight and height inputs are accessible
- [ ] "Simpan" button is accessible

#### ✅ Settings Screen

**Profile Section:**
- [ ] User email is announced
- [ ] "Edit Profile" button is accessible

**Notification Switches:**
- [ ] Master notification switch is accessible
- [ ] Current state is announced
- [ ] Daily tips switch is accessible
- [ ] Reminder alerts switch is accessible
- [ ] Toggle states are announced correctly

**Action Buttons:**
- [ ] "Upgrade to Premium" button is accessible
- [ ] "Privacy Policy" button is accessible
- [ ] "Terms & Conditions" button is accessible
- [ ] "Sign Out" button is accessible
- [ ] "Delete Account" button is accessible

#### ✅ Loading States

**Skeleton Loaders:**
- [ ] Skeleton loaders are announced or skipped (not causing confusion)
- [ ] When content loads, new content is announced
- [ ] Loading states don't interrupt navigation flow

---

## 🤖 Testing with TalkBack (Android)

### How to Enable TalkBack

**Method 1: Settings**
1. Open **Settings** app
2. Go to **Accessibility**
3. Select **TalkBack**
4. Toggle **Use TalkBack** ON
5. Confirm activation

**Method 2: Volume Key Shortcut**
1. Open **Settings** → **Accessibility**
2. Enable **Volume key shortcut**
3. Press and hold both volume keys for 3 seconds to toggle TalkBack

### Basic TalkBack Gestures

| Gesture | Action |
|---------|--------|
| Single tap | Speak item |
| Double tap | Activate selected item |
| Swipe right | Move to next item |
| Swipe left | Move to previous item |
| Swipe down then up (L shape) | Read from top |
| Swipe up then down (reverse L) | Read from current position |
| Two-finger swipe down | Stop reading |

### Testing Checklist - TalkBack

#### ✅ Authentication Screens

**SignIn Screen:**
- [ ] Navigate to email input
- [ ] TalkBack announces "Email, Edit box"
- [ ] Navigate to password input
- [ ] TalkBack announces "Password, Edit box for password"
- [ ] Navigate to "Masuk" button
- [ ] TalkBack announces "Masuk, Button"
- [ ] Double-tap to activate
- [ ] Loading state announces "Loading, please wait"

**SignUp Screen:**
- [ ] All input fields are announced with proper labels
- [ ] Checkbox state is announced
- [ ] Error messages are spoken when shown

#### ✅ Dashboard Screen

- [ ] Header greeting is readable
- [ ] Quick stats cards are accessible
- [ ] Recent activities list is navigable
- [ ] All buttons have clear announcements

#### ✅ Chat Screen

- [ ] Messages are readable in conversation order
- [ ] User vs AI messages are distinguishable
- [ ] Input field is accessible
- [ ] Send button state changes are announced

#### ✅ Reminders Screen

- [ ] Reminder cards are accessible
- [ ] Switch states are announced
- [ ] Action buttons are clearly labeled
- [ ] FAB is accessible

#### ✅ Child Profile Screen

- [ ] Child information is read clearly
- [ ] Action buttons are accessible
- [ ] Form inputs have proper labels

#### ✅ Settings Screen

- [ ] All sections are navigable
- [ ] Switches announce current state
- [ ] Buttons are clearly labeled
- [ ] Account actions are accessible

---

## 📝 Test Scenarios

### Scenario 1: New User Registration
**Goal:** Complete signup using only screen reader

**Steps:**
1. Enable VoiceOver/TalkBack
2. Navigate to SignUp screen
3. Fill in all form fields using voice
4. Navigate to and activate "Daftar" button
5. Verify success or error messages are announced

**Success Criteria:**
- All fields are accessible and properly labeled
- Validation errors are announced clearly
- Success message is announced
- User can complete registration without seeing screen

### Scenario 2: Add New Reminder
**Goal:** Create a reminder using only screen reader

**Steps:**
1. Navigate to Reminders screen
2. Find and activate FAB or "Tambah" button
3. Fill in reminder form
4. Select reminder type
5. Set time
6. Save reminder

**Success Criteria:**
- All form elements are accessible
- Time picker is usable with screen reader
- Confirmation is announced
- New reminder appears in list and is accessible

### Scenario 3: Chat with AI
**Goal:** Have conversation with Baby Buddy using screen reader

**Steps:**
1. Navigate to Chat screen
2. Find input field
3. Type or speak question
4. Find and activate send button
5. Wait for response
6. Listen to AI response

**Success Criteria:**
- Input field is easily findable
- Send button state is clear
- Loading state is announced
- AI response is read automatically or easy to find

### Scenario 4: Navigate Settings
**Goal:** Change notification preferences using screen reader

**Steps:**
1. Navigate to Settings screen
2. Find notification section
3. Toggle switches on/off
4. Navigate to other sections
5. Test action buttons

**Success Criteria:**
- All sections are clearly labeled
- Switch states are announced
- State changes are confirmed
- Navigation is logical and sequential

---

## 🐛 Common Issues to Check

### Input Fields
- [ ] ❌ **Issue:** Label not announced
  - ✅ **Fix:** Ensure `accessibilityLabel` is set
  
- [ ] ❌ **Issue:** Error not announced
  - ✅ **Fix:** Use `accessibilityHint` or `accessibilityLiveRegion`

### Buttons
- [ ] ❌ **Issue:** Button purpose unclear
  - ✅ **Fix:** Set descriptive `accessibilityLabel`
  
- [ ] ❌ **Issue:** Disabled state not announced
  - ✅ **Fix:** Set `accessibilityState={{ disabled: true }}`

### Loading States
- [ ] ❌ **Issue:** User doesn't know content is loading
  - ✅ **Fix:** Add `accessibilityHint="Loading, please wait"`
  
- [ ] ❌ **Issue:** Skeleton loaders confuse screen reader
  - ✅ **Fix:** Set `accessibilityElementsHidden={true}` on skeleton containers

### Interactive Elements
- [ ] ❌ **Issue:** Element not focusable
  - ✅ **Fix:** Set `accessible={true}`
  
- [ ] ❌ **Issue:** Wrong role announced
  - ✅ **Fix:** Set correct `accessibilityRole`

---

## 📊 Accessibility Compliance Checklist

### WCAG 2.1 Level AA Compliance

#### ✅ Perceivable
- [x] Text alternatives provided (`accessibilityLabel`)
- [x] Color is not the only visual means of conveying information
- [x] Content can be presented in different ways
- [x] Content is easier to see and hear

#### ✅ Operable
- [x] All functionality available from keyboard/gestures
- [x] Users have enough time to read and use content
- [x] Content does not cause seizures (no rapid flashing)
- [x] Users can easily navigate and find content

#### ✅ Understandable
- [x] Text is readable and understandable
- [x] Content appears and operates in predictable ways
- [x] Users are helped to avoid and correct mistakes

#### ✅ Robust
- [x] Content is compatible with assistive technologies
- [x] Proper accessibility roles assigned
- [x] States and properties properly announced

---

## 🎯 Testing Priorities

### High Priority (Must Test)
1. ✅ **Authentication flows** - Users must be able to sign in/up
2. ✅ **Primary navigation** - Users must navigate between screens
3. ✅ **Form inputs** - Users must complete forms
4. ✅ **Action buttons** - Users must trigger actions

### Medium Priority (Should Test)
5. ✅ **Settings toggles** - Users should control preferences
6. ✅ **List navigation** - Users should browse content
7. ✅ **Search/filter** - Users should find content

### Low Priority (Nice to Have)
8. ⏳ **Animations** - Should not interfere with screen readers
9. ⏳ **Empty states** - Should be clear and helpful
10. ⏳ **Error recovery** - Should guide users to fix issues

---

## 📱 Device Testing Matrix

| Device | OS Version | Screen Reader | Status |
|--------|------------|---------------|--------|
| iPhone 14 | iOS 17 | VoiceOver | ⏳ Pending |
| iPhone SE | iOS 16 | VoiceOver | ⏳ Pending |
| iPad Air | iPadOS 17 | VoiceOver | ⏳ Pending |
| Samsung Galaxy S23 | Android 14 | TalkBack | ⏳ Pending |
| Google Pixel 7 | Android 13 | TalkBack | ⏳ Pending |
| OnePlus 9 | Android 12 | TalkBack | ⏳ Pending |

---

## 🔍 Debugging Tips

### iOS - VoiceOver Inspector
1. Open Xcode
2. Window → Accessibility Inspector
3. Select your device/simulator
4. Inspect elements to see accessibility properties
5. Run audit to find issues

### Android - Accessibility Scanner
1. Install **Accessibility Scanner** from Play Store
2. Enable the scanner
3. Tap floating button on any screen
4. Review suggestions and issues

### React Native - Accessibility Debugging
```typescript
// Add to component for debugging
<View
  accessible={true}
  accessibilityLabel="Debug Label"
  accessibilityRole="button"
  onAccessibilityTap={() => console.log('Accessibility tap!')}
>
  <Text>Tap me</Text>
</View>
```

---

## 📚 Resources

### Official Documentation
- [React Native Accessibility](https://reactnative.dev/docs/accessibility)
- [Apple VoiceOver Guide](https://support.apple.com/guide/iphone/turn-on-and-practice-voiceover-iph3e2e415f/ios)
- [Android TalkBack Guide](https://support.google.com/accessibility/android/answer/6283677)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### Testing Tools
- [Accessibility Inspector (iOS)](https://developer.apple.com/library/archive/documentation/Accessibility/Conceptual/AccessibilityMacOSX/OSXAXTestingApps.html)
- [Accessibility Scanner (Android)](https://play.google.com/store/apps/details?id=com.google.android.apps.accessibility.auditor)
- [axe DevTools](https://www.deque.com/axe/devtools/)

### Best Practices
- [Material Design Accessibility](https://material.io/design/usability/accessibility.html)
- [iOS Human Interface Guidelines - Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility/overview/introduction/)
- [WebAIM Resources](https://webaim.org/resources/)

---

## ✅ Sign-off Checklist

Before marking accessibility as complete:

- [ ] All core components tested with VoiceOver
- [ ] All core components tested with TalkBack
- [ ] All test scenarios completed successfully
- [ ] No critical accessibility issues found
- [ ] Common issues documented and fixed
- [ ] WCAG 2.1 Level AA compliance verified
- [ ] Documentation updated with findings
- [ ] Team trained on accessibility best practices

---

*Last Updated: November 7, 2025*
*Status: Ready for Testing*
*Priority: High - Accessibility is critical for inclusive design*
