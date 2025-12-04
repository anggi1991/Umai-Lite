# 📱 AdMob Integration Complete Guide

**Date**: November 15, 2025  
**Status**: ✅ **IMPLEMENTED**  
**Priority**: 🔴 **Critical** (was missing in initial analysis)

---

## 📊 Overview

Sistem monetisasi iklan menggunakan **Google AdMob** telah diimplementasikan untuk user free tier. Sistem ini mendukung:

- ✅ **Banner Ads** - Di bottom screen
- ✅ **Interstitial Ads** - Full-screen ads setelah aktivitas
- ✅ **Rewarded Ads** - User dapat rewards setelah nonton iklan

---

## 🎯 Business Rules

### **1. Who Sees Ads?**
```typescript
✅ Free tier users only
❌ Premium users (IDR 49k/month)
❌ Family users (IDR 79k/month)
```

### **2. Frequency Limits**
```typescript
- Interstitial: Minimum 5 minutes interval
- Maximum 10 ads per session
- Maximum 30 ads per day
- Auto-reset at midnight (local time)
```

### **3. Ad Types & Placement**

| **Ad Type** | **Placement** | **Trigger** |
|-------------|---------------|-------------|
| Banner | Bottom of screen | Always visible on free tier |
| Interstitial | Full screen | After activity logging, navigation |
| Rewarded | User-initiated | "Watch ad for reward" button |

---

## 🔧 Implementation Details

### **Files Created**

#### **1. Core Service**
```
src/services/adService.ts (450+ lines)
```

**Key Functions**:
```typescript
// Initialization
initializeAds(): Promise<void>

// Eligibility check
shouldShowAds(): Promise<boolean>

// Banner ads
getBannerAdUnitId(): string

// Interstitial ads
showInterstitialAd(): Promise<boolean>

// Rewarded ads
showRewardedAd(): Promise<boolean>
isRewardedAdReady(): boolean

// Analytics
getUserAdStats(): Promise<AdStats>
trackAdImpression(type, earnedReward): Promise<void>

// Utilities
resetSessionAdCounter(): void
getAdState(): AdState
```

#### **2. UI Component**
```
src/components/ads/BannerAdComponent.tsx
```

**Usage Example**:
```typescript
import BannerAdComponent from '@/components/ads/BannerAdComponent';

// In your screen component
<View style={{ flex: 1 }}>
  <ScrollView>
    {/* Your content */}
  </ScrollView>
  
  {/* Banner ad at bottom - only shows for free tier */}
  <BannerAdComponent />
</View>
```

---

## 📱 Configuration (app.json)

### **Updated Configuration**:

```json
{
  "expo": {
    "plugins": [
      "expo-router",
      "expo-secure-store",
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "ca-app-pub-3940256099942544~3347511713",
          "iosAppId": "ca-app-pub-3940256099942544~1458002511"
        }
      ]
    ],
    "android": {
      "package": "com.razqashop.parentingai",
      "permissions": [
        "INTERNET",
        "ACCESS_NETWORK_STATE",
        "com.google.android.gms.permission.AD_ID"
      ],
      "config": {
        "googleMobileAdsAppId": "ca-app-pub-3940256099942544~3347511713"
      }
    },
    "ios": {
      "bundleIdentifier": "com.razqashop.parentingai",
      "config": {
        "googleMobileAdsAppId": "ca-app-pub-3940256099942544~1458002511"
      },
      "infoPlist": {
        "GADApplicationIdentifier": "ca-app-pub-3940256099942544~1458002511",
        "SKAdNetworkItems": [
          {
            "SKAdNetworkIdentifier": "cstr6suwn9.skadnetwork"
          }
        ]
      }
    }
  }
}
```

### **⚠️ IMPORTANT: Test Ad IDs**

Current configuration uses **Google Test Ad IDs**. Replace with your **production Ad IDs** before release:

**In `src/services/adService.ts`**, update:
```typescript
const AD_UNIT_IDS = {
  BANNER: Platform.select({
    ios: 'ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY', // Your iOS banner ID
    android: 'ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY', // Your Android banner ID
  }),
  INTERSTITIAL: Platform.select({
    ios: 'ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY',
    android: 'ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY',
  }),
  REWARDED: Platform.select({
    ios: 'ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY',
    android: 'ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY',
  }),
};
```

---

## 🚀 Integration in App

### **Automatic Initialization**

AdMob automatically initializes on app start via `app/_layout.tsx`:

```typescript
function AdMobBootstrap() {
  useEffect(() => {
    const initAdMob = async () => {
      try {
        console.log('[App] Initializing AdMob...');
        await initializeAds();
        console.log('[App] AdMob initialized successfully');
      } catch (error) {
        console.error('[App] AdMob initialization error:', error);
      }
    };
    initAdMob();
  }, []);
  return null;
}
```

---

## 📈 Usage Examples

### **1. Show Banner Ad (Bottom of Screen)**

```typescript
import BannerAdComponent from '@/components/ads/BannerAdComponent';

export default function DashboardScreen() {
  return (
    <View style={{ flex: 1 }}>
      <ScrollView>
        {/* Dashboard content */}
      </ScrollView>
      
      {/* Ad automatically shows only for free tier */}
      <BannerAdComponent />
    </View>
  );
}
```

### **2. Show Interstitial Ad (After Activity)**

```typescript
import { showInterstitialAd } from '@/services/adService';

async function handleActivitySaved() {
  // Save activity to database
  await saveActivity(activityData);
  
  // Show interstitial ad (respects frequency limits)
  await showInterstitialAd();
  
  // Navigate to next screen
  router.push('/dashboard');
}
```

### **3. Show Rewarded Ad (Earn Rewards)**

```typescript
import { showRewardedAd, isRewardedAdReady } from '@/services/adService';

export default function RewardsScreen() {
  const [adReady, setAdReady] = useState(false);
  
  useEffect(() => {
    setAdReady(isRewardedAdReady());
  }, []);
  
  async function handleWatchAd() {
    const earnedReward = await showRewardedAd();
    
    if (earnedReward) {
      // Grant reward to user
      await grantBonusFeature();
      Alert.alert('Success', 'You earned a bonus feature!');
    }
  }
  
  return (
    <Button 
      disabled={!adReady}
      onPress={handleWatchAd}
    >
      Watch Ad for Reward
    </Button>
  );
}
```

---

## 📊 Analytics & Tracking

### **Ad Metrics Table**

```sql
CREATE TABLE ads_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  ad_type TEXT NOT NULL CHECK (ad_type IN ('banner', 'interstitial', 'rewarded')),
  impression_date TIMESTAMPTZ DEFAULT NOW(),
  earned_reward BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ads_metrics_user ON ads_metrics(user_id);
CREATE INDEX idx_ads_metrics_date ON ads_metrics(impression_date);
```

### **Get User Ad Stats**

```typescript
import { getUserAdStats } from '@/services/adService';

const stats = await getUserAdStats();
console.log(stats);
// {
//   totalImpressions: 25,
//   rewardsEarned: 3,
//   lastAdDate: "2025-11-15T10:30:00Z"
// }
```

---

## 🔒 Privacy & Compliance

### **1. COPPA Compliance**
```typescript
// Configured in adService.ts initialization
await MobileAds().setRequestConfiguration({
  maxAdContentRating: 'G', // Family-friendly
  tagForChildDirectedTreatment: true, // COPPA compliance
  tagForUnderAgeOfConsent: false,
});
```

### **2. Privacy Policy**
Ensure your privacy policy (already at `https://parentingai.netlify.app/privacy-policy`) mentions:
- Ad personalization
- Google AdMob usage
- Data collection for ads
- User rights (opt-out, data deletion)

---

## 🧪 Testing

### **Test Ads (Development)**

**Status**: ✅ Currently configured with Google Test Ad IDs

When `__DEV__ === true`, app uses test ad IDs:
- No need for real AdMob account during development
- Test ads always fill (100% fill rate)
- No revenue generated from test ads

### **Production Ads**

Before releasing to production:

1. **Create AdMob Account**: https://admob.google.com
2. **Create App in AdMob**:
   - Android app: `com.razqashop.parentingai`
   - iOS app: `com.razqashop.parentingai`
3. **Create Ad Units**:
   - Banner (320x50)
   - Interstitial (Full screen)
   - Rewarded video
4. **Update ad unit IDs** in `src/services/adService.ts`
5. **Update App IDs** in `app.json`

---

## 📋 Pre-Production Checklist

- [x] ✅ AdMob SDK installed
- [x] ✅ Ad service implemented
- [x] ✅ Banner component created
- [x] ✅ App.json configured
- [x] ✅ Auto-initialization setup
- [x] ✅ Free tier detection working
- [x] ✅ Frequency limits implemented
- [x] ✅ Analytics tracking ready
- [x] ✅ Privacy settings configured
- [ ] ⏳ Replace test ad IDs with production IDs
- [ ] ⏳ Create AdMob account & app
- [ ] ⏳ Add banner ads to all free tier screens
- [ ] ⏳ Add interstitial triggers
- [ ] ⏳ Test on physical devices (Android & iOS)

---

## 💰 Revenue Estimates

### **Assumptions**:
- 1,000 daily active free users
- 10 ad impressions/user/day
- $2 RPM (Revenue per 1000 impressions)

### **Monthly Revenue**:
```
1,000 users × 10 impressions × 30 days = 300,000 impressions/month
300,000 / 1,000 × $2 = $600/month
```

### **Conversion to Premium**:
If ads motivate 5% to upgrade:
```
50 users × IDR 49,000 = IDR 2,450,000/month (~$155)
Total: $600 (ads) + $155 (premium) = $755/month
```

---

## 🚨 Known Limitations

1. **Expo Go**: AdMob doesn't work in Expo Go, requires development build
2. **Simulator**: Ads may not load on iOS Simulator, use physical device
3. **Ad Blockers**: Some users may have ad blockers installed
4. **Fill Rate**: Not 100% in production (varies by region, 60-90% typical)
5. **GDPR**: Consider adding consent dialog for EU users

---

## 🛠️ Troubleshooting

### **Problem**: Ads not showing

**Check**:
1. User is free tier: `shouldShowAds()` returns `true`
2. Frequency limits not exceeded
3. AdMob SDK initialized: Check console logs
4. Not in Expo Go (requires development build)
5. Internet connection available

### **Problem**: "Ad failed to load"

**Causes**:
- No internet connection
- Test ad IDs malformed
- AdMob account suspended (production)
- Region restrictions

**Solution**:
```typescript
// Check ad state
import { getAdState } from '@/services/adService';
console.log(getAdState());
```

---

## 📞 Support Resources

- **AdMob Support**: https://support.google.com/admob
- **React Native Ads Docs**: https://docs.page/invertase/react-native-google-mobile-ads
- **Expo AdMob Guide**: https://docs.expo.dev/guides/google-mobile-ads/

---

## ✅ Next Steps

1. **Test in development build**:
   ```bash
   eas build --profile development --platform android
   ```

2. **Add banner ads to screens**:
   - Dashboard
   - Activity list
   - Growth tracker
   - Chat screen (free tier)

3. **Add interstitial triggers**:
   - After logging activity
   - After viewing growth chart
   - Before navigating to new section

4. **Create AdMob account & configure production IDs**

5. **Test on physical devices** (Android & iOS)

---

**Status**: ✅ **AdMob Integration Complete**  
**Production Ready**: ⚠️ **After replacing test ad IDs**  
**Estimated Impact**: 🎯 **$600-1000/month additional revenue**
