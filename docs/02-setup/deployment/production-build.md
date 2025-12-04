# 🏭 Production Build & Deployment Guide

**Date**: November 15, 2025  
**Status**: ⏳ **Ready for Configuration**  
**Priority**: 🔴 **Critical**  
**Estimated Time**: 2 hours

---

## 🎯 Overview

Panduan lengkap untuk membuild dan mendeploy aplikasi Parenting AI ke Google Play Store dan Apple App Store.

---

## 📋 Pre-Build Checklist

### **1. Code Configuration** ✅
- [x] Bundle ID set: `com.razqashop.parentingai`
- [x] App name configured
- [x] Privacy policy URL added
- [x] AdMob SDK configured (test IDs)
- [x] RevenueCat SDK installed
- [ ] ⚠️ Replace AdMob test IDs with production IDs
- [ ] ⚠️ Update RevenueCat API keys

### **2. Assets & Resources**
- [ ] App icon (1024x1024 PNG)
- [ ] Splash screen
- [ ] Feature graphics (1024x500)
- [ ] Screenshots (4-8 per platform)
- [ ] Privacy policy live at URL
- [ ] Terms of service

### **3. Store Accounts**
- [ ] Google Play Developer account ($25 one-time)
- [ ] Apple Developer account ($99/year)
- [ ] RevenueCat account (free tier OK)
- [ ] AdMob account

---

## 🔐 Step 1: Generate Production Keystore (Android)

### **Option A: Using EAS (Recommended)**

EAS automatically generates and manages keystores for you.

```bash
# EAS will create keystore automatically on first production build
eas build --platform android --profile production
```

**Advantages**:
- ✅ Automatic keystore generation
- ✅ Secure cloud storage
- ✅ No local management needed
- ✅ Team collaboration support

### **Option B: Manual Keystore Generation**

If you prefer to manage your own keystore:

```bash
# Generate keystore
keytool -genkeypair -v \
  -keystore parentingai-release.keystore \
  -alias parentingai-key-alias \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# You'll be prompted for:
# - Keystore password (SAVE THIS!)
# - Key password (SAVE THIS!)
# - Your name
# - Organization
# - City
# - State
# - Country code (ID)
```

**⚠️ CRITICAL**: Save these safely!
- Keystore file: `parentingai-release.keystore`
- Keystore password
- Key alias: `parentingai-key-alias`
- Key password

**Store in**:
1. Password manager (1Password, LastPass)
2. Secure cloud storage (encrypted)
3. **NEVER commit to Git**

### **Configure in eas.json** (if using manual keystore):

```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "app-bundle",
        "credentialsSource": "local"
      }
    }
  }
}
```

---

## 📱 Step 2: Configure eas.json

Create/update `eas.json` in project root:

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle",
        "autoIncrement": true
      },
      "ios": {
        "autoIncrement": true
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-play-service-account.json",
        "track": "internal"
      },
      "ios": {
        "appleId": "your-apple-id@email.com",
        "ascAppId": "XXXXXXXXXX",
        "appleTeamId": "XXXXXXXXXX"
      }
    }
  }
}
```

---

## 🔨 Step 3: Build Commands

### **Development Build** (for testing AdMob, subscriptions)

```bash
# Android
eas build --profile development --platform android

# iOS
eas build --profile development --platform ios

# Install on device:
# Android: adb install build.apk
# iOS: Install via TestFlight or direct install
```

### **Preview Build** (internal testing)

```bash
# Android APK for quick testing
eas build --profile preview --platform android

# iOS for TestFlight
eas build --profile preview --platform ios
```

### **Production Build** (for store submission)

```bash
# Android App Bundle (AAB) for Play Store
eas build --profile production --platform android

# iOS IPA for App Store
eas build --profile production --platform ios

# Both platforms
eas build --profile production --platform all
```

---

## 📦 Step 4: Version Management

### **Update version in app.json**:

```json
{
  "expo": {
    "version": "1.0.0",
    "android": {
      "versionCode": 1
    },
    "ios": {
      "buildNumber": "1"
    }
  }
}
```

### **Version Increment Rules**:

| **Type** | **Semantic Version** | **When** |
|----------|---------------------|----------|
| Major | 2.0.0 | Breaking changes, major redesign |
| Minor | 1.1.0 | New features, non-breaking |
| Patch | 1.0.1 | Bug fixes, small updates |

### **Auto-increment with EAS** (Recommended):

```json
{
  "build": {
    "production": {
      "android": {
        "autoIncrement": true  // Automatically increments versionCode
      },
      "ios": {
        "autoIncrement": true  // Automatically increments buildNumber
      }
    }
  }
}
```

---

## 🤖 Step 5: Google Play Store Submission

### **Prerequisites**:
- [ ] Google Play Developer account ($25)
- [ ] Production AAB built
- [ ] App icon & graphics ready
- [ ] Screenshots prepared (phone, tablet, 7-inch tablet)
- [ ] Privacy policy published

### **Steps**:

1. **Create App in Play Console**:
   - https://play.google.com/console
   - Click **"Create app"**
   
   ```
   App name: Parenting AI - Baby Tracker
   Default language: Indonesian
   App or game: App
   Free or paid: Free (with in-app purchases)
   ```

2. **App Content**:
   - **Category**: Parenting
   - **Target audience**: Parents (ages 18+)
   - **Content rating**: Fill questionnaire (E for Everyone expected)
   - **Privacy policy**: https://parentingai.netlify.app/privacy-policy

3. **Store Listing**:
   
   **Indonesian**:
   ```
   Short description (80 chars):
   Aplikasi tracking perkembangan bayi dengan AI assistant

   Full description (4000 chars):
   Parenting AI adalah aplikasi lengkap untuk melacak perkembangan bayi Anda.
   
   Fitur Utama:
   • AI Assistant untuk pertanyaan parenting
   • Tracking pertumbuhan dan perkembangan
   • Log aktivitas (makan, tidur, popok)
   • Galeri foto milestone
   • Reminder pintar
   • Statistik dan grafik pertumbuhan
   
   Fitur Premium:
   • Unlimited AI chat
   • Advanced analytics
   • Export data ke PDF
   • Bebas iklan
   • Dukungan prioritas
   
   Download sekarang dan kelola perkembangan buah hati dengan lebih mudah!
   ```
   
   **English**:
   ```
   Short description:
   Baby development tracker with AI assistant for smart parenting

   Full description:
   Parenting AI is a comprehensive baby development tracking app.
   
   Key Features:
   • AI Assistant for parenting questions
   • Growth and development tracking
   • Activity logging (feeding, sleep, diaper)
   • Photo milestone gallery
   • Smart reminders
   • Growth statistics and charts
   
   Premium Features:
   • Unlimited AI chat
   • Advanced analytics
   • Export data to PDF
   • Ad-free experience
   • Priority support
   
   Download now and manage your baby's development with ease!
   ```

4. **Graphics**:
   - Icon: 512x512 PNG (32-bit)
   - Feature graphic: 1024x500 PNG/JPEG
   - Screenshots: Minimum 2, recommended 4-8
     - Phone: 16:9 or 9:16 ratio
     - 7-inch tablet: 16:9 or 9:16
     - 10-inch tablet: 16:9 or 9:16

5. **App Releases**:
   
   **Internal Testing** (first):
   ```bash
   # Upload AAB
   eas submit --platform android --track internal
   
   # Or manual upload:
   # Play Console → Testing → Internal testing → Create new release
   # Upload: parentingai-xxx.aab
   ```
   
   **Closed Testing** (after internal tested):
   - Create tester group (friends, family, beta testers)
   - Promote from internal → closed testing
   - Send opt-in URL to testers
   
   **Open Testing** (public beta):
   - Promote from closed → open testing
   - Available to anyone with opt-in link
   
   **Production**:
   - Promote from open testing → production
   - OR submit directly to production if confident

6. **Review Process**:
   - Initial review: 3-7 days
   - Subsequent updates: 1-3 days
   - Response time: Check email daily

---

## 🍎 Step 6: Apple App Store Submission

### **Prerequisites**:
- [ ] Apple Developer account ($99/year)
- [ ] Production IPA built
- [ ] App Store Connect access
- [ ] Screenshots prepared (multiple device sizes)
- [ ] Privacy policy published

### **Steps**:

1. **Create App in App Store Connect**:
   - https://appstoreconnect.apple.com
   - Click **"+"** → **New App**
   
   ```
   Platforms: iOS
   Name: Parenting AI - Baby Tracker
   Primary Language: Indonesian
   Bundle ID: com.razqashop.parentingai
   SKU: PARENTINGAI001
   ```

2. **App Information**:
   
   **Primary Category**: Health & Fitness > Parenting
   **Secondary Category**: Lifestyle
   
   **Privacy Policy URL**: 
   https://parentingai.netlify.app/privacy-policy
   
   **Support URL**:
   https://parentingai.netlify.app/support
   (create support page if needed)

3. **Pricing & Availability**:
   ```
   Price: Free (with in-app purchases)
   Availability: All territories
   ```

4. **App Store Listing**:
   
   **Name**: Parenting AI - Baby Tracker
   
   **Subtitle** (30 chars):
   Smart Baby Development Tracker
   
   **Description** (4000 chars):
   ```
   Parenting AI helps you track your baby's development with the power of AI.
   
   FEATURES:
   • AI Assistant for parenting questions
   • Growth tracking (height, weight, head circumference)
   • Activity logging (feeding, sleep, diaper changes)
   • Photo milestone gallery
   • Smart reminders
   • Beautiful charts and statistics
   
   PREMIUM FEATURES:
   • Unlimited AI conversations
   • Advanced analytics
   • Export reports to PDF
   • Ad-free experience
   • Priority support
   • Up to 5 children profiles (Family plan)
   
   Whether you're a first-time parent or experienced, Parenting AI makes
   tracking your baby's development easier and more insightful.
   
   Download now and join thousands of parents using smart technology for
   better parenting!
   ```
   
   **Keywords** (100 chars):
   ```
   baby,tracker,parenting,growth,ai,assistant,milestone,feeding,sleep,newborn
   ```
   
   **Promotional Text** (170 chars):
   ```
   Track your baby's growth with AI-powered insights. Get instant answers to
   parenting questions. Join smart parents today!
   ```

5. **Screenshots Requirements**:
   
   | Device | Size | Quantity |
   |--------|------|----------|
   | 6.7" iPhone | 1290 x 2796 | 3-10 |
   | 6.5" iPhone | 1284 x 2778 | 3-10 |
   | 5.5" iPhone | 1242 x 2208 | 3-10 |
   | 12.9" iPad Pro | 2048 x 2732 | 3-10 |
   
   **Tips**:
   - Use real app screenshots
   - Add captions explaining features
   - Show key features first
   - Use consistent branding

6. **App Privacy**:
   
   Complete questionnaire honestly:
   
   **Data Collection**:
   - ✅ Contact Info (email for registration)
   - ✅ Health & Fitness (baby development data)
   - ✅ User Content (photos, activities)
   - ✅ Identifiers (user ID)
   
   **Data Usage**:
   - App functionality
   - Analytics
   - Product personalization
   
   **Data Linked to User**: YES
   
   **Tracking**: NO (if not using Facebook Ads or similar)

7. **Build Upload**:
   
   ```bash
   # Upload via EAS
   eas submit --platform ios
   
   # OR manual upload via Xcode:
   # 1. Download IPA from EAS
   # 2. Open Xcode → Window → Organizer
   # 3. Distribute App → Upload to App Store
   ```

8. **Submit for Review**:
   
   **Version**: 1.0.0
   
   **Copyright**: 2025 RazqaShop
   
   **Review Information**:
   ```
   Sign-in Required: YES
   Demo Account:
     Username: demo@parentingai.com
     Password: Demo123456!
   
   Notes:
   This app helps parents track their baby's development. The AI assistant
   provides parenting guidance. Premium subscription unlocks advanced features.
   Test subscriptions are available in sandbox environment.
   ```
   
   **App Review**: Click **"Submit for Review"**
   
   **Review Time**: 24-48 hours (first submission may take longer)

---

## 🧪 Step 7: Testing Builds

### **Internal Testing (Before Store Submission)**:

1. **Device Testing Checklist**:
   - [ ] Android 10+ (minimum SDK)
   - [ ] Android 13+ (target SDK)
   - [ ] iOS 13+ (minimum)
   - [ ] iOS 17+ (latest)
   - [ ] Tablet (7-10 inch)
   - [ ] Small phone (< 5 inch)
   - [ ] Large phone (> 6 inch)

2. **Feature Testing**:
   - [ ] Registration & login
   - [ ] Profile creation
   - [ ] Add child profile
   - [ ] Log activity (feeding, sleep, diaper)
   - [ ] Upload photo
   - [ ] AI chat (free tier limit)
   - [ ] Growth tracker
   - [ ] View statistics
   - [ ] Notifications
   - [ ] Settings
   - [ ] Subscription purchase (sandbox)
   - [ ] Premium feature access
   - [ ] Referral code
   - [ ] Badge earning
   - [ ] AdMob ads (free tier)

3. **Performance Testing**:
   - [ ] App launch < 3 seconds
   - [ ] Screen transitions smooth
   - [ ] No memory leaks
   - [ ] Battery usage reasonable
   - [ ] Network error handling
   - [ ] Offline mode (where applicable)

---

## 📊 Step 8: Analytics & Monitoring

### **Configure Analytics**:

1. **Firebase Analytics** (Optional but recommended):
   ```bash
   expo install @react-native-firebase/app
   expo install @react-native-firebase/analytics
   ```

2. **Sentry** (Error tracking):
   ```bash
   npx @sentry/wizard -s -i reactNative
   ```

3. **RevenueCat Analytics**:
   - Already included with RevenueCat SDK
   - Dashboard: https://app.revenuecat.com

---

## 🚀 Step 9: Production Launch

### **Launch Day Checklist**:

**Before Launch**:
- [ ] All tests passing
- [ ] Production builds created
- [ ] Store listings complete
- [ ] Screenshots uploaded
- [ ] Privacy policy live
- [ ] Support email active
- [ ] RevenueCat products configured
- [ ] AdMob ads configured
- [ ] Subscriptions tested (sandbox)
- [ ] Demo account credentials provided
- [ ] Review submitted

**Launch Week**:
- [ ] Monitor crash reports (Sentry)
- [ ] Check app reviews daily
- [ ] Respond to user feedback
- [ ] Monitor subscription conversions
- [ ] Track ad revenue (AdMob)
- [ ] Monitor API usage (Supabase)
- [ ] Check server load
- [ ] Prepare hotfix if needed

**Post-Launch** (Week 2-4):
- [ ] Collect user feedback
- [ ] Analyze usage patterns
- [ ] Identify most-used features
- [ ] Plan first update
- [ ] Optimize conversion funnel
- [ ] A/B test subscription pricing
- [ ] Improve user onboarding

---

## 🐛 Common Build Issues & Solutions

### **Issue**: "Keystore not found"
```bash
# Solution: Generate keystore first or use EAS managed credentials
eas build --platform android --clear-credentials
```

### **Issue**: "Bundle ID mismatch"
```
# Solution: Check consistency across:
# - app.json (expo.android.package & expo.ios.bundleIdentifier)
# - Google Play Console (package name)
# - App Store Connect (bundle ID)
```

### **Issue**: "Build failed - dependency conflict"
```bash
# Solution: Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
eas build --clear-cache
```

### **Issue**: "iOS signing failed"
```bash
# Solution: Re-authenticate or use automatic credentials
eas credentials
# OR
eas build --platform ios --clear-credentials
```

---

## 📞 Support Resources

- **EAS Build Docs**: https://docs.expo.dev/build/introduction/
- **Google Play Console**: https://support.google.com/googleplay/android-developer
- **App Store Connect**: https://developer.apple.com/support/app-store-connect/
- **EAS Submit Docs**: https://docs.expo.dev/submit/introduction/

---

## ✅ Final Checklist

- [ ] eas.json configured
- [ ] Production keystore generated (Android)
- [ ] iOS signing certificates configured
- [ ] AdMob production ad IDs updated
- [ ] RevenueCat API keys updated
- [ ] Version numbers set (1.0.0)
- [ ] Production builds created
- [ ] Google Play listing complete
- [ ] App Store listing complete
- [ ] Internal testing completed
- [ ] Beta testing completed (optional)
- [ ] Submitted to stores
- [ ] Monitoring tools configured
- [ ] Support system ready

---

**Status**: ⏳ **Ready for Build**  
**Estimated Timeline**: 
- Build setup: 1 hour
- Store listings: 2 hours
- Testing: 1-2 days
- Review process: 3-7 days
- **Total to Launch: 1-2 weeks**
