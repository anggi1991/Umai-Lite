# 🚀 Quick Reference Cards

**Purpose:** Fast access to common development tasks  
**Target Audience:** New developers, DevOps, QA team  
**Last Updated:** November 16, 2025

---

## 📋 Quick Navigation

1. [🏁 Quick Start (5 Minutes)](#-quick-start-5-minutes)
2. [🚢 Deploy to Production](#-deploy-to-production)
3. [✨ Add New Feature](#-add-new-feature)
4. [🐛 Troubleshoot Common Errors](#-troubleshoot-common-errors)
5. [🧪 Run Tests](#-run-tests)
6. [📱 Build App](#-build-app)

---

## 🏁 Quick Start (5 Minutes)

### Prerequisites Checklist
- [ ] Node.js 18+ installed
- [ ] Expo CLI installed (`npm install -g expo-cli`)
- [ ] Git configured
- [ ] Code editor (VS Code recommended)

### Setup Steps

```bash
# 1. Clone repository
git clone https://github.com/razqashop91/parentingAI.git
cd parentingAI

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.example .env

# 4. Add your credentials to .env
# - EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
# - EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
# - EXPO_PUBLIC_AZURE_OPENAI_KEY=your_azure_key
# etc.

# 5. Start development server
npm start
```

### Test It Works
- Press `i` for iOS simulator
- Press `a` for Android emulator  
- Press `w` for web browser
- Scan QR code with Expo Go app

**✅ Success:** You should see the login screen!

**📚 Detailed Guide:** [docs/QUICK_START.md](./QUICK_START.md)

---

## 🚢 Deploy to Production

### Pre-Deployment Checklist

**Environment:**
- [ ] All `.env` variables configured for production
- [ ] Azure OpenAI API key added
- [ ] Supabase production database ready
- [ ] RevenueCat products configured
- [ ] Google OAuth credentials for production domain
- [ ] Push notification certificates uploaded

**Code Quality:**
- [ ] All tests passing (`npm test`)
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] No console.logs in production code
- [ ] App version bumped in `app.json`

**App Store:**
- [ ] Screenshots prepared (all required sizes)
- [ ] App description written (EN, ID, JP, ZH)
- [ ] Privacy policy URL added
- [ ] Terms of service URL added

### iOS Deployment

```bash
# 1. Build iOS app
eas build --platform ios --profile production

# 2. Wait for build (15-30 min)
# EAS will email you when done

# 3. Submit to App Store
eas submit --platform ios --latest

# 4. Fill App Store Connect form
# - Go to https://appstoreconnect.apple.com
# - Add metadata, screenshots
# - Submit for review
```

**⏱️ Timeline:** Review takes 1-3 days

### Android Deployment

```bash
# 1. Build Android app
eas build --platform android --profile production

# 2. Submit to Play Store
eas submit --platform android --latest

# 3. Fill Play Console form
# - Go to https://play.google.com/console
# - Add store listing details
# - Submit for review
```

**⏱️ Timeline:** Review takes 2-7 days

**📚 Detailed Guide:** [docs/02-setup/deployment/pre-deployment-checklist.md](./02-setup/deployment/pre-deployment-checklist.md)

---

## ✨ Add New Feature

### Step-by-Step Process

#### 1. Plan Feature (5-10 min)
```
- Define feature requirements
- Check if affects existing features
- Review ARCHITECTURE.md for data flow
```

#### 2. Update Database (if needed)
```sql
-- Create migration file: supabase/migrations/YYYYMMDD_feature_name.sql

-- Example: Add new table
CREATE TABLE IF NOT EXISTS public.new_feature (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.new_feature ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data"
  ON public.new_feature FOR SELECT
  USING (auth.uid() = user_id);
```

**Apply migration:**
```bash
# Local development
supabase db push

# Production (via Supabase Dashboard)
# Copy SQL → Supabase → SQL Editor → Run
```

#### 3. Create Service (Business Logic)
```bash
# Create new service file
touch src/services/newFeatureService.ts
```

```typescript
// src/services/newFeatureService.ts
import { supabase } from './supabaseClient';

export const newFeatureService = {
  async getFeatureData(userId: string) {
    const { data, error } = await supabase
      .from('new_feature')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data;
  },

  async createFeatureData(userId: string, featureData: any) {
    const { data, error } = await supabase
      .from('new_feature')
      .insert({ user_id: userId, data: featureData })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
};
```

#### 4. Create Screen/Component
```bash
# Create new screen
mkdir -p app/new-feature
touch app/new-feature/index.tsx
```

```typescript
// app/new-feature/index.tsx
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { newFeatureService } from '../../src/services/newFeatureService';
import { useAuth } from '../../src/contexts/AuthContext';

export default function NewFeatureScreen() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const result = await newFeatureService.getFeatureData(user.id);
      setData(result);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Text>New Feature Screen</Text>
      {/* Your UI here */}
    </View>
  );
}
```

#### 5. Add Navigation
```typescript
// app/(tabs)/_layout.tsx or wherever appropriate
<Tabs.Screen
  name="new-feature"
  options={{
    title: 'New Feature',
    tabBarIcon: ({ color }) => <Ionicons name="star" size={24} color={color} />,
  }}
/>
```

#### 6. Add i18n Translations
```typescript
// src/locales/en.json
{
  "newFeature": {
    "title": "New Feature",
    "description": "Feature description",
    "action": "Do Action"
  }
}

// Repeat for id.json, ja.json, zh.json
```

#### 7. Test Feature
```bash
# Run app
npm start

# Test on device
# - Navigate to new feature
# - Try all actions
# - Check error handling
# - Test with/without internet
```

#### 8. Document Feature
```bash
# Create feature documentation
touch docs/04-features/new-feature.md
```

**📚 Example:** See [docs/04-features/chat-ai.md](./04-features/chat-ai.md) for reference

---

## 🐛 Troubleshoot Common Errors

### Quick Fixes

#### 1. **"Authentication Stuck Loading"**
```bash
# Clear Expo cache
expo start -c

# Clear AsyncStorage
# In app: Settings → Clear Cache (or add this button)
```
**Root Cause:** Cached authentication state  
**📚 Details:** [docs/08-maintenance/troubleshooting.md#authentication-stuck-loading](./08-maintenance/troubleshooting.md)

---

#### 2. **"Usage Limit Exceeded" (RPC Error)**
```bash
# Check user's usage limits
SELECT * FROM public.usage_limits WHERE user_id = 'user-uuid';

# Reset limits manually
UPDATE public.usage_limits 
SET chat_count = 0, tip_count = 0, last_reset = NOW()
WHERE user_id = 'user-uuid';
```
**Root Cause:** Usage limit not resetting daily  
**Fix:** Implement automated reset with Supabase cron job  
**📚 Details:** [docs/08-maintenance/troubleshooting.md#usage-limits](./08-maintenance/troubleshooting.md)

---

#### 3. **"Google OAuth Not Working"**
```bash
# 1. Check Expo redirect URI matches Google Console
# Expo: https://auth.expo.io/@yourusername/parenting-ai
# Google Console: Add exact URI above

# 2. Verify Android/iOS client IDs in .env
EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS=your_ios_id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID=your_android_id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB=your_web_id.apps.googleusercontent.com

# 3. Test with expo start --clear
```
**Root Cause:** Mismatched redirect URI or wrong client ID  
**📚 Details:** [docs/02-setup/google-oauth.md](./02-setup/google-oauth.md)

---

#### 4. **"Email Not Delivered"**
```bash
# Check Resend dashboard
# Go to: https://resend.com/dashboard

# Common issues:
# 1. Email in spam folder → Check DNS records (SPF, DKIM, DMARC)
# 2. Daily limit reached → Upgrade Resend plan
# 3. Custom domain not verified → Verify in Resend dashboard
```
**Root Cause:** DNS configuration or spam filters  
**📚 Details:** [docs/02-setup/email-smtp.md](./02-setup/email-smtp.md)

---

#### 5. **"RevenueCat Purchase Not Working"**
```bash
# 1. Check product IDs match RevenueCat dashboard
# 2. Verify API keys in .env
EXPO_PUBLIC_REVENUECAT_API_KEY_IOS=your_ios_key
EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID=your_android_key

# 3. Test with sandbox/test account
# iOS: Settings → App Store → Sandbox Account
# Android: Use test email from Google Play Console
```
**Root Cause:** Product ID mismatch or wrong API key  
**📚 Details:** [docs/04-features/monetization/subscriptions.md](./04-features/monetization/subscriptions.md)

---

#### 6. **"App Crashes on Startup"**
```bash
# 1. Check error logs
npx expo start --dev-client

# 2. Common causes:
# - Missing .env variables
# - Supabase URL/key incorrect
# - TypeScript errors

# 3. Verify .env file
cat .env | grep "EXPO_PUBLIC"
```
**Quick Fix:** Copy `.env.example` and fill all required variables

---

#### 7. **"Data Not Syncing / NULL child_id"**
```sql
-- Fix NULL child_id issues
-- Run this in Supabase SQL Editor:

-- 1. Find affected records
SELECT * FROM public.activities WHERE child_id IS NULL;

-- 2. Auto-assign child_id (if user has only 1 child)
UPDATE public.activities
SET child_id = (
  SELECT id FROM public.children 
  WHERE user_id = activities.user_id 
  LIMIT 1
)
WHERE child_id IS NULL;

-- 3. For users with multiple children, assign to first child
UPDATE public.activities
SET child_id = (
  SELECT id FROM public.children 
  WHERE user_id = activities.user_id 
  ORDER BY created_at ASC 
  LIMIT 1
)
WHERE child_id IS NULL;
```
**📚 Details:** [docs/05-implementation/completed/data-sync.md](./05-implementation/completed/data-sync.md)

---

## 🧪 Run Tests

### Manual Testing

```bash
# Run app in development
npm start

# Test checklist:
# 1. Authentication (Sign up, Login, Logout)
# 2. Dashboard (View stats, quick actions)
# 3. AI Chat (Send message, get response)
# 4. Growth Tracker (Add measurement, view charts)
# 5. Activities (Log feeding, sleep, diaper)
# 6. Subscription (View plans, purchase)
```

**📚 Full Checklist:** [docs/06-testing/manual-testing.md](./06-testing/manual-testing.md)

---

### Automated Tests (Unit Tests)

```bash
# Run all tests
npm test

# Run specific test file
npm test -- activityService.test.ts

# Run with coverage
npm test -- --coverage

# Watch mode (re-run on file change)
npm test -- --watch
```

**Expected Output:**
```
PASS  src/__tests__/services/activityService.test.ts
PASS  src/__tests__/services/chatService.test.ts
PASS  src/__tests__/services/growthService.test.ts

Test Suites: 15 passed, 15 total
Tests:       87 passed, 87 total
Snapshots:   0 total
Time:        12.345 s
```

---

### Integration Tests

```bash
# Test Supabase connection
npm run test:integration

# Test specific service integration
npm test -- --testPathPattern=integration/supabase.test.ts
```

---

### End-to-End Tests (E2E)

```bash
# Install Detox (if not already)
npm install --save-dev detox

# Build app for E2E testing
detox build --configuration ios.sim.debug

# Run E2E tests
detox test --configuration ios.sim.debug
```

**📚 E2E Guide:** [docs/06-testing/e2e-testing.md](./06-testing/e2e-testing.md)

---

## 📱 Build App

### Development Build

```bash
# Build for iOS simulator
eas build --profile development --platform ios

# Build for Android emulator
eas build --profile development --platform android

# Install on device
eas build:run --profile development --platform ios
```

---

### Production Build

```bash
# iOS Production
eas build --profile production --platform ios

# Android Production (AAB for Play Store)
eas build --profile production --platform android

# Both platforms
eas build --profile production --platform all
```

**⏱️ Build Time:** 15-30 minutes per platform

---

### Build Profiles (eas.json)

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "aab"
      }
    }
  }
}
```

**📚 Build Guide:** [docs/02-setup/deployment/production-build.md](./02-setup/deployment/production-build.md)

---

## 🔗 Related Documentation

### Essential Docs
- **[QUICK_START.md](./QUICK_START.md)** - Detailed setup guide
- **[ARCHITECTURE.md](./03-architecture/system-overview.md)** - System overview
- **[02-setup/](./02-setup/)** - All setup guides

### Feature Documentation
- **[04-features/authentication.md](./04-features/authentication.md)** - User auth
- **[04-features/chat-ai.md](./04-features/chat-ai.md)** - AI chat
- **[04-features/growth-tracker.md](./04-features/growth-tracker.md)** - Growth tracking
- **[04-features/monetization/subscriptions.md](./04-features/monetization/subscriptions.md)** - RevenueCat

### Troubleshooting
- **[08-maintenance/troubleshooting.md](./08-maintenance/troubleshooting.md)** - Common issues
- **[08-maintenance/bug-fixes.md](./08-maintenance/bug-fixes.md)** - Known bugs

---

## 💡 Tips & Best Practices

### Development
- ✅ Always run `expo start -c` after pulling new code
- ✅ Use TypeScript strict mode (catch errors early)
- ✅ Test on both iOS and Android before PR
- ✅ Write meaningful commit messages

### Code Quality
- ✅ Follow existing code patterns
- ✅ Add JSDoc comments for complex functions
- ✅ Keep components under 300 lines
- ✅ Extract reusable components
- ✅ Use custom hooks for shared logic

### Performance
- ✅ Use `React.memo()` for heavy components
- ✅ Optimize images (use WebP, compress)
- ✅ Lazy load screens with `React.lazy()`
- ✅ Debounce expensive operations
- ✅ Cache API responses when possible

### Security
- ✅ Never commit `.env` file
- ✅ Validate all user inputs
- ✅ Use RLS policies in Supabase
- ✅ Sanitize data before AI processing
- ✅ Keep dependencies updated

---

## 📞 Need Help?

### Resources
- **Documentation:** `/docs` folder (this repository)
- **GitHub Issues:** Report bugs and feature requests
- **Team:** Contact project maintainers

### Quick Links
- **Supabase Dashboard:** https://app.supabase.com
- **RevenueCat Dashboard:** https://app.revenuecat.com
- **Google Cloud Console:** https://console.cloud.google.com
- **Expo Dashboard:** https://expo.dev

---

**Last Updated:** November 16, 2025  
**Maintained By:** Parenting AI Team  
**Status:** ✅ Active and Updated
