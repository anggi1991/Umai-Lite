# 🤖 Android Release Build - Specific Fixes

## Issue Context
Bugs ditemukan saat pengujian tertutup di Google Play Console pada perangkat Android nyata. Release builds memiliki behavior berbeda dengan development builds karena:
- ProGuard/R8 code obfuscation
- Bundle/APK compression
- Production mode optimizations
- Native module linking differences

---

## 🔧 Critical Fixes for Android Release

### 1. AsyncStorage Keep Rules (ProGuard)

**Problem:** AsyncStorage mungkin ter-obfuscate oleh ProGuard di release build, menyebabkan session tidak persist.

**Solution:** Buat ProGuard rules untuk AsyncStorage

**File:** `android/app/proguard-rules.pro` (create if not exists)

```proguard
# AsyncStorage
-keep class com.reactnativecommunity.asyncstorage.** { *; }
-keepclassmembers class com.reactnativecommunity.asyncstorage.** { *; }

# React Native
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }

# Supabase
-keep class io.supabase.** { *; }

# RevenueCat
-keep class com.revenuecat.** { *; }
-dontwarn com.revenuecat.**

# Expo
-keep class expo.** { *; }
-keep class versioned.host.exp.exponent.** { *; }

# Keep all native modules
-keep class * extends com.facebook.react.bridge.NativeModule { *; }
-keep class * extends com.facebook.react.bridge.JavaScriptModule { *; }
```

---

### 2. Android Manifest Permissions

**File:** `android/app/src/main/AndroidManifest.xml`

Pastikan permissions sudah lengkap:

```xml
<manifest>
  <!-- Internet for Supabase -->
  <uses-permission android:name="android.permission.INTERNET" />
  <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
  
  <!-- Storage for AsyncStorage -->
  <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
  <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
  
  <!-- Camera for profile photos -->
  <uses-permission android:name="android.permission.CAMERA" />
  
  <!-- AdMob (if implemented) -->
  <uses-permission android:name="com.google.android.gms.permission.AD_ID" />
</manifest>
```

---

### 3. Build Configuration Check

**File:** `app.json`

Verify ProGuard is enabled:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "enableProguardInReleaseBuilds": true,
            "enableShrinkResourcesInReleaseBuilds": true
          }
        }
      ]
    ]
  }
}
```

✅ Already configured correctly in your app.json

---

### 4. Network Security Config (for older Android)

**File:** `android/app/src/main/res/xml/network_security_config.xml` (create if needed)

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="false">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
    <!-- Allow Supabase -->
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="true">supabase.co</domain>
    </domain-config>
</network-security-config>
```

Then reference in AndroidManifest.xml:

```xml
<application
    android:networkSecurityConfig="@xml/network_security_config">
```

---

## 🐛 Specific Bug Fixes for Android Release

### Bug 1 & 2: Child Profile Issues

**Android-specific Issue:**
- State management bisa berbeda di release build
- Navigation stack bisa ter-clear

**Additional Fix:**

**File:** `src/screens/ChildProfile/ChildList.tsx`

Add deep link handling:

```tsx
// Add at top of component
useEffect(() => {
  // Force refresh on mount for release builds
  if (!__DEV__) {
    loadChildren();
  }
}, []);
```

---

### Bug 3: Activity Access Guard

**Android-specific Issue:**
- Children array bisa null/undefined di release build
- Guard condition perlu lebih defensive

**Additional Fix:**

**File:** `src/screens/Activities/ActivityHistory.tsx`

Make guard more defensive:

```tsx
// More defensive check for release builds
if (!loading && (!children || children.length === 0)) {
  return (
    // ... empty state
  );
}
```

---

### Bug 4: Session Persistence - CRITICAL for Android

**Android-specific Issues:**
1. AsyncStorage path bisa berbeda di release
2. Session keys bisa ter-obfuscate
3. Background mode bisa clear storage

**Additional Fixes:**

**File:** `src/services/supabaseClient.ts`

Add error handling and logging:

```typescript
const customStorage = {
  getItem: async (key: string) => {
    try {
      const value = await AsyncStorage.getItem(key);
      if (!__DEV__ && value) {
        console.log('[Storage] Retrieved key:', key.substring(0, 20));
      }
      return value;
    } catch (error) {
      console.error('[Storage] Error getting item:', key, error);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
      if (!__DEV__) {
        console.log('[Storage] Saved key:', key.substring(0, 20));
      }
    } catch (error) {
      console.error('[Storage] Error setting item:', key, error);
      // Don't throw - allow app to continue
    }
  },
  removeItem: async (key: string) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('[Storage] Error removing item:', key, error);
    }
  },
};
```

---

### Bug 5: RevenueCat & Google Sign-In

**Android-specific Issues:**

#### RevenueCat
- Native module linking bisa berbeda di release
- API key perlu di-keep dari obfuscation

**Fix:** Already handled by ProGuard rules above

#### Google Sign-In
- OAuth redirect bisa gagal di release build
- Deep link handling berbeda

**Additional Check:**

**File:** `android/app/src/main/AndroidManifest.xml`

Pastikan intent-filter untuk deep link:

```xml
<activity android:name=".MainActivity">
  <!-- Deep linking for OAuth -->
  <intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="parentingai" />
  </intent-filter>
</activity>
```

---

## 🧪 Android Release Testing Steps

### Pre-Release Checklist

```bash
# 1. Clean build
cd android
./gradlew clean

# 2. Build release APK
cd ..
eas build --platform android --profile production

# 3. Or local build
npx expo run:android --variant release
```

### Testing on Real Device

1. **Install via Google Play Internal Testing**
   - Upload AAB to Google Play Console
   - Join internal testing track
   - Install dari Play Store

2. **Test Session Persistence**
   ```
   ✓ Login
   ✓ Force close app (swipe from recent apps)
   ✓ Clear from memory
   ✓ Wait 5 minutes
   ✓ Reopen app
   ✓ Expected: Still logged in
   ```

3. **Test Child Profile Flow**
   ```
   ✓ Open app (no children)
   ✓ Navigate to Child Profile
   ✓ See + button
   ✓ Add child
   ✓ Verify immediately shows in list
   ✓ Navigate away and back
   ✓ Verify still shows
   ```

4. **Test Activity Guard**
   ```
   ✓ New user (no children)
   ✓ Try access Activities
   ✓ See blocked message
   ✓ Add child from block screen
   ✓ Return to Activities
   ✓ Can now access
   ```

5. **Test Background/Foreground**
   ```
   ✓ Open app
   ✓ Switch to another app
   ✓ Wait 10 minutes
   ✓ Return to app
   ✓ Expected: Still logged in, data intact
   ```

---

## 🚨 Common Android Release Issues

### Issue 1: "Network request failed"
**Cause:** Network security config atau missing internet permission
**Fix:** Check AndroidManifest.xml permissions

### Issue 2: AsyncStorage returns null
**Cause:** ProGuard obfuscation
**Fix:** Add ProGuard rules (see above)

### Issue 3: App crashes on startup
**Cause:** Native module not linked properly
**Fix:** 
```bash
cd android
./gradlew clean
cd ..
npx expo prebuild --clean
```

### Issue 4: OAuth redirect fails
**Cause:** Intent filter missing or misconfigured
**Fix:** Check AndroidManifest.xml intent-filter

### Issue 5: Session expires immediately
**Cause:** AsyncStorage not persisting
**Fix:** Check storage permissions and ProGuard rules

---

## 📦 Build Commands for Testing

### Development Build (for testing release behavior)
```bash
# Build release variant locally
npx expo run:android --variant release
```

### Production Build (for Play Store)
```bash
# Using EAS Build
eas build --platform android --profile production

# Check build progress
eas build:list
```

### Install Release APK for Testing
```bash
# Download APK from EAS
eas build:download --platform android

# Install via ADB
adb install app-release.apk

# Check logs
adb logcat | grep -i "parentingai\|supabase\|asyncstorage"
```

---

## 🔍 Debug Logging for Release

Add temporary logging to track issues:

```typescript
// In supabaseClient.ts
console.log('[Build] Running in:', __DEV__ ? 'DEV' : 'PROD');
console.log('[Build] AsyncStorage available:', !!AsyncStorage);

// In AuthContext.tsx
console.log('[Auth] Session check on mount');
console.log('[Auth] User state:', user ? 'LOGGED_IN' : 'LOGGED_OUT');

// In ChildList.tsx
console.log('[Children] Count:', children.length);
console.log('[Children] Loading:', loading);
```

**Remove before final production release!**

---

## ✅ Final Checklist for Google Play Release

Before submitting to production:

- [ ] ProGuard rules added for AsyncStorage
- [ ] All permissions in AndroidManifest.xml
- [ ] Network security config configured
- [ ] Deep link intent-filter for OAuth
- [ ] Tested on multiple Android versions (8.0+)
- [ ] Tested on different device manufacturers
- [ ] Session persists after force close
- [ ] Session persists after device restart
- [ ] All child profile flows work
- [ ] Activity guard works correctly
- [ ] RevenueCat loads properly
- [ ] Google Sign-In redirects work
- [ ] No crashes in crash reports
- [ ] Memory usage acceptable
- [ ] Battery usage acceptable

---

## 📊 Monitoring After Release

### Check Google Play Console

1. **Crashes & ANRs**
   - Look for AsyncStorage errors
   - Check for native module crashes
   - Monitor session-related errors

2. **Vitals**
   - Crash rate < 1%
   - ANR rate < 0.5%
   - Battery usage normal

3. **User Feedback**
   - Filter reviews for "logout" or "session"
   - Look for child profile issues
   - Check for navigation complaints

### Crashlytics/Sentry Setup (Recommended)

```bash
# Install Sentry for better error tracking
npm install @sentry/react-native

# Configure in App.tsx
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  enableInExpoDevelopment: false,
  debug: __DEV__,
});
```

---

## 🆘 Emergency Rollback Plan

If critical issues found after release:

1. **Immediate:**
   ```bash
   # Halt rollout in Google Play Console
   # Release Management → Production → Halt Rollout
   ```

2. **Quick Fix:**
   ```bash
   # Build hotfix
   eas build --platform android --profile production
   
   # Submit as emergency update
   # Target only affected users via staged rollout
   ```

3. **Rollback:**
   ```bash
   # In Google Play Console
   # Deactivate current release
   # Reactivate previous stable version
   ```

---

## 📝 Additional Notes for Google Play Testing

### Closed Testing Best Practices

1. **Start with small group (10-20 users)**
2. **Monitor for 48-72 hours**
3. **Check crash reports daily**
4. **Expand gradually** (50%, 100%)
5. **Collect feedback actively**

### Version Management

```json
// In app.json, increment properly
{
  "android": {
    "versionCode": 5,  // Increment for each build
    "package": "com.razqashop.parentingai"
  }
}
```

---

**For Production Release:** November 24, 2025
**Target Android:** 8.0+ (API 26+)
**Tested Devices:** Multiple manufacturers recommended
