# 📱 Google Play Store Deployment Guide

Complete guide untuk publish Parenting AI app ke Google Play Store.

---

## 📋 Prerequisites

### 1. Google Play Console Account
- [ ] Google Play Developer Account ($25 one-time fee)
- [ ] Login ke [Google Play Console](https://play.google.com/console)
- [ ] Verifikasi identity dan payment method

### 2. Required Tools
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login
```

### 3. App Requirements
- [ ] App icon (512x512 PNG)
- [ ] Feature graphic (1024x500 PNG)
- [ ] Screenshots (2-8 images, different screen sizes)
- [ ] Privacy policy URL
- [ ] App description (short & full)
- [ ] Content rating questionnaire completed

---

## 🔧 Step 1: Configure App for Production

### 1.1 Update `app.json`
```json
{
  "expo": {
    "name": "Parenting AI",
    "slug": "parenting-ai",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "scheme": "parentingai",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "android": {
      "package": "com.razqashop91.parentingai",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ],
      "playStoreUrl": "https://play.google.com/store/apps/details?id=com.razqashop91.parentingai"
    },
    "extra": {
      "eas": {
        "projectId": "YOUR_PROJECT_ID"
      }
    }
  }
}
```

### 1.2 Update `eas.json`
```json
{
  "cli": {
    "version": ">= 5.9.0"
  },
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
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-play-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

---

## 🏗️ Step 2: Build Production AAB

### 2.1 Create Production Build
```bash
# Build Android App Bundle (AAB) for Play Store
eas build --platform android --profile production

# Monitor build progress
# Build will be available at: https://expo.dev
```

### 2.2 Download AAB
```bash
# Download from Expo dashboard or use CLI
eas build:list

# Download specific build
eas build:download --id BUILD_ID
```

---

## 🔑 Step 3: Generate Upload Key

### 3.1 Create Keystore (if not using EAS managed credentials)
```bash
# Generate upload keystore
keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore upload-keystore.jks \
  -alias upload \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# Save credentials securely:
# - Keystore password
# - Key alias
# - Key password
```

### 3.2 Configure Credentials in EAS
```bash
# Let EAS manage credentials (recommended)
eas credentials

# Or configure manually in eas.json
```

---

## 📤 Step 4: Create App in Play Console

### 4.1 Create New App
1. Go to [Google Play Console](https://play.google.com/console)
2. Click **"Create app"**
3. Fill in:
   - **App name:** Parenting AI
   - **Default language:** English (United States)
   - **App or game:** App
   - **Free or paid:** Free

### 4.2 Set Up App Content
Navigate to **Policy** section and complete:

#### Privacy Policy
```
URL: https://your-domain.com/privacy-policy
```

#### App Access
- [ ] All functionality is available without restrictions
- [ ] OR: Provide test credentials for restricted features

#### Ads
- [ ] No, my app does not contain ads
- [ ] OR: Yes, my app contains ads

#### Content Rating
Complete questionnaire:
- Target age groups
- Content descriptors
- Interactive elements

#### Target Audience
- **Target age group:** Parents (18+)
- **Age-appropriate content:** Yes

#### News Apps
- [ ] Not a news app

---

## 📝 Step 5: Prepare Store Listing

### 5.1 Store Listing Assets

Create folder: `docs/assets/store-listing/`

#### Required Images:

**App Icon**
- Size: 512 x 512 px
- Format: PNG (32-bit)
- No transparency
- Location: `docs/assets/store-listing/icon-512.png`

**Feature Graphic**
- Size: 1024 x 500 px
- Format: PNG or JPEG
- Location: `docs/assets/store-listing/feature-graphic.png`

**Screenshots (Phone)**
- Minimum: 2 screenshots
- Maximum: 8 screenshots
- Size: 320-3840 px on long side
- Aspect ratio: 16:9 or 9:16
- Format: PNG or JPEG
- Location: `docs/assets/store-listing/screenshots/phone/`

**Screenshots (Tablet)** (Optional)
- Same requirements as phone
- Location: `docs/assets/store-listing/screenshots/tablet/`

### 5.2 App Description

**Short Description (80 characters max)**
```
AI-powered parenting assistant to track, analyze & support your baby's growth
```

**Full Description (4000 characters max)**
```markdown
🍼 **Parenting AI - Your Smart Baby Care Companion**

Transform your parenting journey with AI-powered insights and effortless tracking. Parenting AI helps parents monitor their baby's daily activities, growth milestones, and health patterns—all in one beautiful, easy-to-use app.

✨ **KEY FEATURES**

📊 **Smart Activity Tracking**
• Log feeding, sleep, diaper changes, and moods instantly
• AI-powered pattern recognition
• Visual charts and statistics
• Export data for pediatrician visits

📈 **Growth Monitoring**
• Track weight, height, and development
• WHO growth charts comparison
• Milestone reminders
• Photo diary with AI-tagged memories

🤖 **AI Chat Assistant**
• 24/7 parenting advice powered by GPT-4
• Evidence-based recommendations
• Multi-language support (English, Indonesian, Japanese, Chinese)
• Context-aware responses based on your baby's data

📸 **Media Library**
• Organize baby photos and videos
• AI-powered face recognition
• Automatic tagging by child
• Secure cloud backup

🔔 **Smart Reminders**
• Feeding schedule notifications
• Immunization alerts
• Custom reminders
• Sleep routine tracking

📱 **Beautiful Interface**
• Cute baby mascot (Baby Buddy)
• Intuitive navigation
• Dark mode support
• Smooth animations

🔒 **Privacy & Security**
• End-to-end encryption
• Local data storage
• GDPR compliant
• No ads, ever

🌍 **Multi-Language Support**
• English
• Indonesian (Bahasa Indonesia)
• Japanese (日本語)
• Chinese (中文)

💎 **Premium Features**
• Unlimited AI chat conversations
• Advanced analytics
• Multiple child profiles
• Export to PDF/Excel
• Priority support

Perfect for new parents, experienced caregivers, and anyone raising a baby. Download now and experience the future of parenting!

---

📧 **Support:** support@parentingai.app
🌐 **Website:** https://parentingai.app
📖 **Privacy Policy:** https://parentingai.app/privacy
```

### 5.3 Categorization
- **Category:** Parenting
- **Tags:** baby tracker, parenting app, growth tracker, AI assistant

---

## 📤 Step 6: Upload to Play Console

### 6.1 Create Release

1. Navigate to **Production** track
2. Click **"Create new release"**
3. Upload AAB file

### 6.2 Release Details
```
Release name: 1.0.0 (1)

Release notes:
🎉 Initial release of Parenting AI!

✨ Features:
• Smart activity tracking (feeding, sleep, diaper, mood)
• AI-powered parenting assistant
• Growth monitoring with charts
• Photo & video library
• Multi-language support (EN, ID, JP, ZH)
• Beautiful UI with Baby Buddy mascot

🔒 Privacy-focused and ad-free!
```

### 6.3 Review and Rollout
1. Review all information
2. Click **"Save"**
3. Click **"Review release"**
4. Click **"Start rollout to Production"**

---

## 🚀 Step 7: Submit for Review

### 7.1 Pre-Submission Checklist
- [ ] App bundle uploaded
- [ ] Store listing completed
- [ ] Privacy policy URL added
- [ ] Content rating received
- [ ] Target audience selected
- [ ] All required screenshots uploaded
- [ ] App tested thoroughly
- [ ] Release notes written

### 7.2 Submit
1. Go to **"Publishing overview"**
2. Address any warnings/errors
3. Click **"Send X changes for review"**

### 7.3 Review Process
- **Timeline:** Usually 1-7 days
- **Status:** Check in Play Console Dashboard
- **Notifications:** Via email

---

## 🔄 Step 8: Post-Release Updates

### 8.1 Update Version Numbers

**In `app.json`:**
```json
{
  "expo": {
    "version": "1.0.1",
    "android": {
      "versionCode": 2
    }
  }
}
```

### 8.2 Build & Submit Update
```bash
# Build new version
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android --profile production
```

---

## 📊 Step 9: Monitor & Analytics

### 9.1 Play Console Dashboard
- **Statistics:** Installs, ratings, crashes
- **User reviews:** Respond to feedback
- **Pre-launch report:** Device compatibility

### 9.2 Firebase Analytics (Optional)
```bash
# Install Firebase
expo install @react-native-firebase/app @react-native-firebase/analytics

# Configure in app.json
```

---

## 🐛 Troubleshooting

### Build Errors

**Error: Invalid package name**
```bash
# Check app.json → android.package
# Must be unique and follow format: com.company.appname
```

**Error: Missing credentials**
```bash
# Clear credentials and regenerate
eas credentials --platform android --clear
eas build --platform android --profile production
```

### Submission Rejected

**Reason: Privacy Policy**
- Ensure URL is accessible
- Must explain data collection
- Include contact information

**Reason: Content Rating**
- Re-complete questionnaire
- Ensure age appropriateness

**Reason: Misleading Claims**
- Remove unverified health claims
- Add disclaimers for medical advice

---

## 📞 Support Resources

- **Expo Docs:** https://docs.expo.dev/submit/android/
- **Play Console Help:** https://support.google.com/googleplay/android-developer
- **EAS Build Status:** https://expo.dev/accounts/YOUR_ACCOUNT/projects/parenting-ai

---

## ✅ Quick Reference Commands

```bash
# Login to EAS
eas login

# Configure project
eas build:configure

# Build production AAB
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android --profile production

# Check build status
eas build:list

# View project
eas open
```

---

## 📝 Checklist Summary

### Pre-Build
- [ ] Google Play Console account created
- [ ] EAS CLI installed and configured
- [ ] app.json properly configured
- [ ] Privacy policy URL live
- [ ] Store assets prepared

### Build & Upload
- [ ] Production AAB built successfully
- [ ] AAB uploaded to Play Console
- [ ] Release notes written
- [ ] All store listing fields completed

### Submission
- [ ] Content rating obtained
- [ ] Target audience set
- [ ] Privacy policy added
- [ ] Screenshots uploaded
- [ ] App submitted for review

### Post-Release
- [ ] Monitor review status
- [ ] Respond to user reviews
- [ ] Track analytics
- [ ] Plan updates

---

**Last Updated:** January 14, 2025  
**App Version:** 1.0.0  
**Build:** 1
