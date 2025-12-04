# 🍎 Apple App Store Deployment Guide - Parenting AI

Complete guide for publishing Parenting AI app to Apple App Store, including submission preparation and deployment steps.

**Status:** Production-ready  
**Last Updated:** November 2025  
**Source:** Merged from APP_STORE_SUBMISSION_PREP.md + APPSTORE_DEPLOYMENT.md

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Apple Developer Account Setup](#apple-developer-account-setup)
3. [App Configuration](#app-configuration)
4. [Build & Submit](#build--submit)
5. [App Store Assets](#app-store-assets)
6. [App Store Listing](#app-store-listing)
7. [App Review Process](#app-review-process)
8. [Post-Launch](#post-launch)

---

## 🎯 Prerequisites

### Required Accounts & Tools

- [ ] **Apple Developer Program** membership ($99/year)
- [ ] **macOS** Monterey (12.0) or later (for local builds)
- [ ] **Xcode** 14.0 or later
- [ ] **EAS CLI** installed: `npm install -g eas-cli`
- [ ] **Expo account** with EAS project configured

### Mac Requirements

```bash
# Verify macOS version
sw_vers

# Install/update Xcode Command Line Tools
xcode-select --install

# Verify Xcode installation
xcodebuild -version
```

### App Information

```
App Name: Umai - AI Parenting Assistant
Tagline: You + Me + AI = Better Parenting Together
Bundle ID: com.razqashop91.parentingai (or com.artconcept91.parentingai)
Category: Health & Fitness
Target iOS: 13.0+
Version: 1.0.0
```

---

## 🔐 Apple Developer Account Setup

### Step 1: Enroll in Apple Developer Program

1. Visit [Apple Developer Portal](https://developer.apple.com/programs/)
2. Click **"Enroll"** → Select **Individual** or **Organization**
3. Complete enrollment ($99/year)
4. Wait for approval (1-2 business days)

### Step 2: Create App ID

1. Go to [Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources/identifiers/list)
2. Click **"+"** → Select **"App IDs"**
3. Configure:
   ```
   Description: Parenting AI
   Bundle ID: com.razqashop91.parentingai (Explicit)
   Capabilities:
   - ✅ Sign in with Apple
   - ✅ Push Notifications
   - ✅ Associated Domains
   ```
4. Click **"Continue"** → **"Register"**

### Step 3: Create App in App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Click **"My Apps"** → **"+"** → **"New App"**
3. Fill form:
   ```
   Platform: iOS
   Name: Umai
   Primary Language: English (or Indonesian)
   Bundle ID: com.razqashop91.parentingai
   SKU: PARENTINGAI001 (unique identifier)
   User Access: Full Access
   ```
4. Click **"Create"**

---

## 🔧 App Configuration

### Step 1: Update app.json

```json
{
  "expo": {
    "name": "Umai",
    "slug": "umai-parenting-ai",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "scheme": "parentingai",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#AEE1F9"
    },
    "ios": {
      "bundleIdentifier": "com.razqashop91.parentingai",
      "buildNumber": "1",
      "supportsTablet": true,
      "infoPlist": {
        "NSCameraUsageDescription": "This app uses the camera to capture your baby's precious moments.",
        "NSPhotoLibraryUsageDescription": "This app needs access to your photo library to save and organize baby photos.",
        "NSPhotoLibraryAddUsageDescription": "This app needs permission to save photos to your library.",
        "NSUserTrackingUsageDescription": "This identifier will be used to deliver personalized parenting tips."
      },
      "usesAppleSignIn": true,
      "associatedDomains": [
        "applinks:parentingai.app",
        "webcredentials:parentingai.app"
      ]
    },
    "extra": {
      "eas": {
        "projectId": "YOUR_EAS_PROJECT_ID"
      }
    }
  }
}
```

### Step 2: Update eas.json

```json
{
  "cli": {
    "version": ">= 5.9.0"
  },
  "build": {
    "production": {
      "ios": {
        "bundleIdentifier": "com.razqashop91.parentingai",
        "buildConfiguration": "Release"
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false,
        "buildConfiguration": "Release"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "YOUR_ASC_APP_ID",
        "appleTeamId": "YOUR_APPLE_TEAM_ID"
      }
    }
  }
}
```

### Step 3: Environment Variables

Create `.env.production`:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_AZURE_OPENAI_API_KEY=your-azure-key
EXPO_PUBLIC_AZURE_OPENAI_ENDPOINT=https://your-endpoint.openai.azure.com/
```

---

## 🚀 Build & Submit

### Step 1: Build Production App

```bash
# Login to EAS
eas login

# Configure project
eas build:configure

# Build for iOS (production)
eas build --platform ios --profile production

# Wait for build to complete (~15-30 minutes)
# Build will be uploaded to App Store Connect automatically
```

**Build Options:**
- `--auto-submit`: Automatically submit to App Store after build
- `--no-wait`: Don't wait for build to complete

### Step 2: Monitor Build

1. Check build status: `eas build:list`
2. View build logs: `eas build:view [BUILD_ID]`
3. Or monitor at [expo.dev/accounts/builds](https://expo.dev/accounts/your-username/builds)

### Step 3: Submit to App Store (if not auto-submitted)

```bash
# Submit latest build
eas submit --platform ios --profile production

# Or submit specific build
eas submit --platform ios --id [BUILD_ID]
```

---

## 🎨 App Store Assets

### Required Assets

#### 1. App Icon

- [ ] **Size:** 1024x1024px PNG (no alpha channel)
- [ ] **Content:** Umai mascot on gradient background
- [ ] **File:** `assets/icon.png`
- [ ] **Colors:** Baby blue to soft pink gradient (#AEE1F9 → #FADADD)
- [ ] **No text on icon** (App Store guidelines)

#### 2. Screenshots

Required sizes (capture from Simulator):

| Device | Resolution | Quantity |
|--------|-----------|----------|
| 6.7" (iPhone 14 Pro Max) | 1290×2796 | 3-10 screens |
| 6.5" (iPhone 11 Pro Max) | 1242×2688 | 3-10 screens |
| 5.5" (iPhone 8 Plus) | 1242×2208 | 3-10 screens |

**Recommended Screens:**
1. **Splash/Welcome** - Umai mascot + tagline
2. **Dashboard** - Main features overview
3. **AI Chat** - Conversation with Umai
4. **Growth Tracker** - Charts and milestones
5. **Photo Gallery** - Baby moments
6. **Settings** - Personalization options

**Screenshot Tips:**
- Use iPhone simulator for consistent quality
- Add text overlays explaining features (optional)
- Maintain brand colors (pastel blue/pink)
- Capture in light mode
- No status bar (hide in simulator: `⌘ + Y`)

#### 3. App Preview Video (Optional)

- [ ] **Duration:** 15-30 seconds
- [ ] **Format:** MP4 or MOV, H.264 codec
- [ ] **Resolution:** Match screenshot sizes
- [ ] **Content:**
  - Opening: Umai mascot animation
  - Feature showcase (5 seconds each)
  - Closing: App name + tagline
- [ ] **Audio:** Soft background music (royalty-free)
- [ ] **No voiceover** (use text captions instead)

---

## 📝 App Store Listing

### Step 1: App Information (App Store Connect)

1. Go to **App Store Connect** → **My Apps** → **Umai**
2. Navigate to **App Information**

#### Basic Info
```
Name: Umai - AI Parenting Assistant
Subtitle: You + Me + AI for Better Parenting (max 30 chars)
Primary Category: Health & Fitness
Secondary Category: Education (optional)
Primary Language: English
```

#### Privacy Policy & URLs
```
Privacy Policy URL: https://parentingai.app/privacy-policy
Support URL: https://parentingai.app/support
Marketing URL: https://parentingai.app (optional)
```

### Step 2: Version Information

Navigate to **App Store** → **1.0 Prepare for Submission**

#### What's New in This Version
```
🎉 Welcome to Umai v1.0!

✨ Features:
• AI-powered parenting guidance with Umai, your friendly assistant
• Track baby's growth with charts and milestone logging
• Capture precious moments in photo gallery
• Personalized daily parenting tips
• Multi-language support (English, Indonesian)

Umai = You + Me + AI. Let's grow together! ��
```

#### Description (4000 chars max)
```markdown
Meet Umai - Your AI Parenting Companion 👶💙

Umai (pronounced "you + me") is more than just a parenting app—it's your supportive AI friend that combines YOUR parenting instincts with evidence-based AI guidance.

🤖 Chat with Umai
Get instant, personalized parenting advice anytime. Umai understands your baby's unique needs and provides warm, empathetic guidance—never judgmental, always helpful.

📊 Track Baby's Growth
Log milestones, weight, height, and developmental stages. Beautiful charts help you visualize your baby's progress and celebrate every achievement.

📸 Capture Precious Moments
Organize baby photos by date and milestone. Never lose track of those unforgettable firsts.

💡 Daily Parenting Tips
Receive age-appropriate tips tailored to your baby's developmental stage. From feeding schedules to sleep training, Umai's got you covered.

🌍 Multi-Language Support
Available in English and Indonesian (Bahasa Indonesia).

🔒 Privacy First
Your data is secure. We use industry-standard encryption and never sell your personal information.

---

Why Umai?

Parenting is beautiful but challenging. You don't have to do it alone. Umai combines:
• Your instincts (You)
• Expert guidance (Me - AI)
• Evidence-based advice (AI)

= Confident, supported parenting.

---

Perfect For:
• First-time parents seeking guidance
• Busy parents needing quick answers
• Anyone wanting to track baby's development
• Parents looking for a supportive community

---

Download Umai today and discover how AI can make parenting easier, more joyful, and deeply rewarding. 💙

You + Me + AI = Better Parenting Together ✨
```

#### Keywords (100 chars max, comma-separated)
```
parenting,baby,AI assistant,growth tracker,milestones,newborn,infant,toddler,chat,tips,umai
```

#### Promotional Text (170 chars, updateable anytime)
```
🎉 Meet Umai: Your AI parenting buddy! Track growth, get instant advice, and capture precious moments. You + Me + AI for better parenting. Download now!
```

### Step 3: Age Rating

Complete questionnaire:
- **Violence:** None
- **Sexual Content/Nudity:** None
- **Profanity/Crude Humor:** None
- **Horror/Fear Themes:** None
- **Mature/Suggestive Themes:** None
- **Medical/Treatment Information:** Infrequent/Mild (parenting health tips)
- **Gambling:** None
- **Unrestricted Web Access:** No
- **Contests:** No

**Result:** Rated **4+** (suitable for all ages)

### Step 4: App Review Information

```
Contact Information:
- First Name: [Your first name]
- Last Name: [Your last name]
- Phone: +62 [your phone]
- Email: artconcept91@gmail.com

Demo Account (if login required):
- Username: demo@parentingai.app
- Password: Demo1234!
- Notes: Full-featured demo account for review

Notes:
"Umai is an AI-powered parenting assistant. Key features:
1. AI chat requires internet connection (Azure OpenAI)
2. Photo upload uses device camera/gallery permissions
3. Growth tracker data stored securely in Supabase
4. No in-app purchases in v1.0 (planned for v1.1)

Please test the AI chat by asking parenting questions like:
- 'How do I sleep train my 6-month-old?'
- 'What foods can I introduce to my baby?'

Thank you!"
```

---

## 📋 App Review Process

### Step 1: Submit for Review

1. Complete all sections (marked with red dots)
2. Upload all assets (icon, screenshots, optional video)
3. Set pricing: **Free** (or set price tier)
4. Choose availability: **All countries** or select specific regions
5. Click **"Submit for Review"**

### Step 2: Review Timeline

- **Initial Review:** 24-48 hours (average)
- **Resubmission (if rejected):** 1-2 days

### Step 3: Common Rejection Reasons & Fixes

#### 1. Guideline 2.1 - App Completeness
**Issue:** App crashes or has broken features

**Fix:**
- Test thoroughly before submission
- Provide detailed testing notes
- Include demo account credentials

#### 2. Guideline 4.3 - Spam / Copycat
**Issue:** Similar to existing apps

**Fix:**
- Emphasize unique "Umai" AI persona
- Highlight "You + Me + AI" concept
- Show differentiation in description

#### 3. Guideline 5.1.1 - Privacy / Data Collection
**Issue:** Missing privacy policy or incomplete permissions

**Fix:**
- Ensure privacy policy URL is valid and accessible
- Update `NSCameraUsageDescription` and other permissions
- Clearly explain data usage in privacy policy

#### 4. Guideline 2.3.10 - Accurate Metadata
**Issue:** Screenshots don't match actual app

**Fix:**
- Retake screenshots from actual app (not mockups)
- Ensure text overlays are accurate

---

## 🎉 Post-Launch

### Step 1: Monitor Analytics

- **App Store Connect** → **Analytics**
  - App Units (downloads)
  - Sales and Trends
  - App Usage (retention, sessions)
  - Crashes and Diagnostics

### Step 2: Respond to Reviews

- Reply to user reviews within 1-2 days
- Thank positive reviewers
- Address negative feedback professionally
- Use reviews to prioritize feature updates

### Step 3: Plan Updates

**v1.1 Roadmap:**
- In-app purchases (premium features)
- Apple Sign-In integration
- More AI personalization
- Expanded milestone library

**Update Schedule:**
- Bug fixes: As needed (expedited review)
- Feature updates: Monthly or bi-monthly
- Major versions: Quarterly

---

## ✅ Submission Checklist

### Pre-Submission
- [ ] Apple Developer account active ($99/year)
- [ ] App ID created with correct bundle identifier
- [ ] App created in App Store Connect
- [ ] `app.json` and `eas.json` configured correctly
- [ ] Environment variables set for production
- [ ] Privacy policy published and accessible
- [ ] Support URL working

### Assets
- [ ] App icon (1024x1024 PNG, no alpha)
- [ ] Screenshots (6.7", 6.5", 5.5" devices, 3-10 each)
- [ ] App preview video (optional, 15-30 sec)
- [ ] All assets use consistent branding (Umai mascot, pastel colors)

### Listing
- [ ] App name: "Umai - AI Parenting Assistant"
- [ ] Subtitle: "You + Me + AI for Better Parenting"
- [ ] Description (compelling, clear, keyword-rich)
- [ ] Keywords (11 keywords, comma-separated)
- [ ] Promotional text (170 chars, hook users)
- [ ] Age rating completed (4+)
- [ ] Primary category: Health & Fitness
- [ ] Privacy policy URL valid
- [ ] Support URL valid

### App Review
- [ ] Demo account provided (username + password)
- [ ] Testing notes included
- [ ] All features tested and working
- [ ] No crashes or broken functionality
- [ ] Permissions clearly explained

### Build
- [ ] Production build completed: `eas build --platform ios --profile production`
- [ ] Build uploaded to App Store Connect
- [ ] Build processed successfully (no errors)
- [ ] TestFlight tested (optional but recommended)
- [ ] Submitted for review

### Post-Submission
- [ ] Monitor review status daily
- [ ] Respond to reviewer questions within 24 hours
- [ ] Plan celebration for approval! 🎉

---

## 🆘 Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
eas build:cancel
eas build --platform ios --profile production --clear-cache
```

### Upload to App Store Connect Fails

```bash
# Manually submit using Transporter app
# Download .ipa from Expo:
eas build:download --platform ios --id [BUILD_ID]

# Open Transporter app (Mac App Store)
# Drag and drop .ipa file
# Deliver to App Store Connect
```

### TestFlight Not Showing Build

- Wait 5-10 minutes for processing
- Check email for compliance issues
- Verify export compliance answered correctly

### Review Rejected

1. Read rejection reason carefully
2. Fix issue mentioned
3. Increment build number: `"buildNumber": "2"`
4. Rebuild: `eas build --platform ios --profile production`
5. Resubmit: `eas submit --platform ios`

---

## 📚 Resources

- [Apple Developer Portal](https://developer.apple.com/)
- [App Store Connect](https://appstoreconnect.apple.com/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Expo EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [Expo EAS Submit Docs](https://docs.expo.dev/submit/ios/)

---

**Created:** November 2025  
**Status:** ✅ Production-ready  
**Merged From:**
- `APP_STORE_SUBMISSION_PREP.md` (916 lines)
- `APPSTORE_DEPLOYMENT.md` (828 lines)
