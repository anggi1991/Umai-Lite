# ⚡ Quick Reference - Production Launch Checklist

**Last Updated:** November 15, 2025  
**Status:** Pre-Production  
**Time to Launch:** 13 hours critical work + 1 week testing

---

## 🎯 Critical Path (13 Hours)

### 🔴 **1. RevenueCat Setup** (4 hours)
```bash
# Login to RevenueCat Dashboard
https://app.revenuecat.com

# Create Products:
- monthly_premium → IDR 49,000
- monthly_family → IDR 79,000

# Configure Offering:
- Current offering → Add packages
- Set as default

# Setup Webhook:
URL: https://[your-domain]/api/revenuecat-webhook
Events: All subscription events
```

### 🔴 **2. Google Play Products** (2 hours)
```bash
# Login to Play Console
https://play.google.com/console

# Navigate to: Monetization → Products → In-app products

# Create Products:
Product ID: premium_monthly
Title: Premium Monthly Subscription
Price: Rp 49.000

Product ID: family_monthly
Title: Family Monthly Subscription
Price: Rp 79.000

# Status: Active
```

### 🔴 **3. Fix Test** (15 minutes)
```typescript
// File: src/services/__tests__/subscriptionService.test.ts
// Add at top:
import {
  getCurrentSubscription,
  hasActiveSubscription,
  getSubscriptionTierInfo,
} from '../subscriptionService';

// Run:
npm test
```

### 🔴 **4. Generate Keystore** (30 minutes)
```bash
# Generate keystore
keytool -genkeypair -v -storetype PKCS12 \
  -keystore parenting-ai.keystore \
  -alias parenting-ai \
  -keyalg RSA -keysize 2048 \
  -validity 10000

# Save credentials securely
# Update eas.json with keystore path
```

### 🔴 **5. Store Listing** (6 hours)
```bash
# Prepare Assets:
- 8 screenshots (1080x1920 or 1080x2340)
- Feature graphic (1024x500)
- App icon (512x512)
- Promo video (optional)

# Write Descriptions:
- Short: 80 characters
- Full: 4000 characters
- Indonesian + English

# Content Rating:
- PEGI 3 / ESRB Everyone
- Target: Parents 18-45
```

---

## 🟡 Important (Optional for Launch)

### **AdMob Integration** (8 hours)
```bash
npm install react-native-google-mobile-ads

# app.json
{
  "react-native-google-mobile-ads": {
    "android_app_id": "ca-app-pub-xxxxx~xxxxx"
  }
}

# Create ad units:
- Banner (320x50)
- Interstitial (Full screen)

# Show only for free tier
```

### **Restore Purchases** (2 hours)
```typescript
// SettingsScreen.tsx
const handleRestore = async () => {
  const info = await Purchases.restorePurchases();
  if (info.entitlements.active['razqashop Pro']) {
    Alert.alert('Success', 'Subscription restored!');
  }
};
```

### **Annual Plans** (3 hours)
```typescript
// Add in RevenueCat:
yearly_premium → IDR 499,000 (save IDR 89k)
yearly_family → IDR 799,000 (save IDR 149k)

// Update UI to show savings
```

---

## 📊 Test Commands

```bash
# Run all tests
npm test

# Run specific test
npm test -- revenueCatService.test.ts

# Coverage report
npm run test:coverage

# Watch mode
npm run test:watch

# Lint
npm run lint

# Build for Android
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

---

## 🔧 Environment Variables

```bash
# .env (NEVER COMMIT)
SUPABASE_URL=https://gbcxzkgzhylpbmzbymwj.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
REVENUECAT_API_KEY=test_GrJfMWRWqLTeIJSBnfYxbtSXEOw  # CHANGE TO PROD
AZURE_OPENAI_KEY=your_azure_key
GOOGLE_OAUTH_CLIENT_ID=your_client_id
```

---

## 📱 Testing Checklist

### **Manual Tests:**
- [ ] Sign up new user
- [ ] Log activity → hit limit (3 AI tips)
- [ ] See upgrade prompt
- [ ] Purchase Premium (sandbox)
- [ ] Verify unlimited access
- [ ] Generate referral code
- [ ] Share code
- [ ] Earn badge
- [ ] Upload photo
- [ ] Chat with AI
- [ ] Receive push notification
- [ ] Restore purchase after reinstall

### **Automated Tests:**
```bash
npm test  # Should show:
# PASS  40+ tests
# Coverage: >70%
```

---

## 🚀 Build & Deploy

### **Production Build:**
```bash
# Update version in app.json
"version": "1.0.0",
"android": {
  "versionCode": 1
}

# Build
eas build --platform android --profile production

# Wait ~15 minutes
# Download .aab file

# Test on device
adb install parenting-ai.aab
```

### **Submit to Play Store:**
```bash
# Via EAS
eas submit --platform android

# Or manually upload .aab to Play Console
# → Release → Production → Upload
```

---

## 📈 Monitoring (Post-Launch)

### **Key Metrics:**
```
DAU/MAU: >40%
Conversion: 5-8%
Churn: <10%/month
Crashes: <0.5%
Rating: >4.5 stars
```

### **Revenue Tracking:**
```bash
# RevenueCat Dashboard
- MRR (Monthly Recurring Revenue)
- Active subscriptions
- Trial conversions
- Churn rate

# Google Play Console
- Installs per day
- Revenue
- Ratings/reviews
```

### **Analytics:**
```typescript
// Track key events
logEvent('upgrade_clicked');
logEvent('purchase_completed');
logEvent('referral_shared');
logEvent('badge_earned');
```

---

## 🆘 Troubleshooting

### **Purchase Not Working:**
```bash
# Check:
1. RevenueCat products configured?
2. Google Play products created & active?
3. App version code matches?
4. Testing in sandbox mode?
5. Correct product IDs?
```

### **Test Failing:**
```bash
# Clear cache
npm run test -- --clearCache

# Reinstall
rm -rf node_modules
npm install
npm test
```

### **Build Failing:**
```bash
# Check:
1. Java/Gradle versions
2. Android SDK installed
3. Keystore path correct
4. EAS credentials valid

# Re-authenticate
eas login
eas build --clear-cache
```

---

## 📞 Quick Links

| Resource | URL |
|----------|-----|
| **RevenueCat** | [app.revenuecat.com](https://app.revenuecat.com) |
| **Play Console** | [play.google.com/console](https://play.google.com/console) |
| **Supabase** | [app.supabase.com](https://app.supabase.com) |
| **EAS Build** | [expo.dev/accounts/[account]/projects/parenting-ai/builds](https://expo.dev) |
| **Docs** | `/docs/EXECUTIVE_SUMMARY.md` |

---

## 🎯 Success Criteria

Before marking as "Production Ready":

- [x] Database schema complete
- [x] RPC functions working
- [x] Usage limits enforced
- [x] Tests passing (>70% coverage)
- [ ] RevenueCat products configured
- [ ] Google Play products created
- [ ] Store listing complete
- [ ] Production build successful
- [ ] Manual testing passed
- [ ] Beta test feedback incorporated

---

## ⏱️ Timeline

```
Day 1-2:  Fix critical issues (13h)
Day 3:    Build & internal test
Day 4-5:  Beta testing
Week 2:   Polish & submit
Week 3:   Production launch 🚀
```

---

**Quick Start:**
```bash
# 1. Fix test (15 min)
# 2. Configure RevenueCat (4h)
# 3. Create Play products (2h)
# 4. Generate keystore (30min)
# 5. Prepare store assets (6h)
# 6. Build & test (1 day)
# 7. Launch! 🚀
```

---

**Last Updated:** November 15, 2025  
**Total Time to Launch:** ~3 weeks from today
