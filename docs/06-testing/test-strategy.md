# Testing Strategy - Parenting AI

Comprehensive testing strategy and infrastructure for mobile app quality assurance.

**Status:** Active  
**Last Updated:** November 2025

---

## 📋 Testing Approach

### Testing Pyramid

```
        /\
       /  \
      / UI \          ← 10% (E2E, Manual)
     /______\
    /        \
   /Integration\      ← 30% (API, Services)
  /____________\
 /              \
/  Unit Tests    \    ← 60% (Functions, Utils)
/__________________\
```

### Test Coverage Goals

| Category | Target | Current | Priority |
|----------|--------|---------|----------|
| Unit Tests | 80% | 65% | 🔴 High |
| Integration Tests | 60% | 45% | 🟡 Medium |
| E2E Tests | Critical flows | 70% | 🟢 Good |
| Manual Testing | Key features | 100% | ✅ Complete |

---

## 🧪 Testing Infrastructure

### Tools & Frameworks

**Unit & Integration Testing:**
- **Jest** - Test runner
- **React Native Testing Library** - Component testing
- **Mock Service Worker (MSW)** - API mocking

**E2E Testing:**
- **Detox** - React Native E2E framework
- **Appium** (future consideration)

**Manual Testing:**
- **Expo Go** - Quick testing on devices
- **TestFlight** (iOS) - Beta testing
- **Google Play Internal Testing** (Android)

**Performance Testing:**
- **Flashlight** - React Native performance profiler
- **React DevTools Profiler**

### Test Environment Setup

```bash
# Install dependencies
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native

# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests (requires build)
npm run test:e2e
```

### CI/CD Integration

**GitHub Actions Pipeline:**
1. Lint code (ESLint, Prettier)
2. Run unit tests
3. Check TypeScript types
4. Build preview (EAS)
5. Run E2E tests (on build)
6. Generate coverage report

---

## 🎯 Testing Checklist

### Pre-Release Testing

#### Authentication Flow
- [ ] Email/password signup
- [ ] Email/password login
- [ ] Google Sign-In (iOS/Android)
- [ ] Password reset
- [ ] Email verification
- [ ] Session persistence

#### Core Features
- [ ] Dashboard loads correctly
- [ ] AI chat responds (Azure OpenAI)
- [ ] Growth tracker logs data
- [ ] Photo upload works (camera + gallery)
- [ ] Activities tracking functional
- [ ] Notifications delivered
- [ ] Multi-language switching (EN/ID)
- [ ] Dark mode toggle

#### Data Sync
- [ ] Profile updates sync to Supabase
- [ ] Growth data persists
- [ ] Photos uploaded to Supabase Storage
- [ ] Offline mode works (basic functionality)

#### Monetization
- [ ] Ads display (AdMob)
- [ ] Usage limits enforced
- [ ] Referral system works
- [ ] RevenueCat integration (future)

#### Performance
- [ ] App launch < 3 seconds
- [ ] Screen transitions smooth (60fps)
- [ ] No memory leaks
- [ ] API responses < 2 seconds

#### Accessibility
- [ ] Screen reader support (TalkBack/VoiceOver)
- [ ] Sufficient color contrast (WCAG AA)
- [ ] Touch targets ≥ 44x44 points
- [ ] Keyboard navigation (web)

---

## 📱 Manual Testing Guide

### Device Testing Matrix

| Device Type | OS Version | Priority | Status |
|-------------|-----------|----------|--------|
| iPhone 14 Pro | iOS 17 | 🔴 High | ✅ Tested |
| iPhone SE (2nd gen) | iOS 16 | 🟡 Medium | ✅ Tested |
| Samsung Galaxy S23 | Android 14 | 🔴 High | ✅ Tested |
| Google Pixel 6 | Android 13 | 🟡 Medium | ⏳ Pending |
| iPad Pro 11" | iPadOS 17 | 🟢 Low | ⏳ Pending |

### Critical User Flows

#### 1. New User Onboarding
1. Launch app → Splash screen
2. Welcome screen → Skip or Continue
3. Sign Up with email
4. Verify email
5. Create child profile
6. Complete onboarding (name, birthdate, gender)
7. Land on Dashboard

**Expected:** Smooth flow, no crashes, data persists

#### 2. Daily Usage Flow
1. Open app → Dashboard
2. Tap "Chat with Umai" → AI responds
3. Log growth data → Chart updates
4. Upload photo → Gallery displays
5. Check daily tip → Tip shown
6. Navigate Settings → Change language
7. Logout → Return to login screen

**Expected:** All features work, no data loss

#### 3. Premium Feature Flow (Future)
1. Hit usage limit → Limit warning shown
2. Tap "Upgrade" → RevenueCat paywall
3. Select plan → Apple/Google payment
4. Purchase → Unlock premium features
5. Verify unlimited access

**Expected:** Payment works, features unlocked immediately

---

## 🐛 Bug Reporting Template

### Bug Report Format

```markdown
**Title:** [Component] Brief description

**Priority:** 🔴 High / 🟡 Medium / 🟢 Low

**Environment:**
- Device: iPhone 14 Pro
- OS: iOS 17.1
- App Version: 1.0.0 (Build 42)

**Steps to Reproduce:**
1. Open app
2. Navigate to Growth Tracker
3. Tap "Add Entry"
4. Fill weight field
5. Tap "Save"

**Expected Behavior:**
Entry should be saved and appear in chart

**Actual Behavior:**
App crashes with error: "Cannot read property 'weight' of undefined"

**Screenshots/Logs:**
[Attach screenshot or error log]

**Additional Context:**
Only happens when weight is empty
```

---

## 📊 Test Results & Metrics

### Latest Test Run (November 16, 2025)

**Unit Tests:**
- Total: 127 tests
- Passed: 115 ✅
- Failed: 12 ❌
- Coverage: 65%

**E2E Tests:**
- Total: 18 critical flows
- Passed: 13 ✅
- Failed: 5 ❌

**Manual Testing:**
- Devices tested: 4
- Critical bugs: 2 🔴
- Medium bugs: 5 🟡
- Low priority: 8 🟢

**Status:** ⚠️ Not ready for production (12 unit test failures, 2 critical bugs)

---

## 🔄 Continuous Testing

### Daily Testing (Automated)

```bash
# Run on every commit
npm run lint
npm run test:unit
npm run type-check
```

### Weekly Testing (Manual)

- Test on 2-3 physical devices
- Verify critical user flows
- Check new features
- Regression testing

### Pre-Release Testing

- Full manual testing on 5+ devices
- Complete accessibility audit
- Performance profiling
- Security review
- Privacy compliance check

---

## 📚 Testing Resources

### Documentation
- [Jest Docs](https://jestjs.io/docs/getting-started)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Detox E2E](https://wix.github.io/Detox/)

### Internal Docs
- Manual Testing Guide: `manual-testing.md`
- Test Results: `test-results.md`
- Bug Fixes Log: `../08-maintenance/bug-fixes.md`

---

**Created:** November 2025  
**Merged From:**
- `TESTING_INFRASTRUCTURE.md`
- `TEST_SUITE_SUMMARY.md`
- `testing/guides/TESTING_CHECKLIST.md`
- `testing/guides/TESTING_QUICK_START.md`
