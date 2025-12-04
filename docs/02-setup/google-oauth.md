# Google OAuth Setup & Troubleshooting - Parenting AI

Complete guide for configuring Google Sign-In using Supabase Auth and Expo, including common fixes.

---

## 📋 Table of Contents

1. [Initial Setup](#initial-setup)
2. [Google Cloud Console Configuration](#google-cloud-console)
3. [Supabase Configuration](#supabase-configuration)
4. [Expo App Configuration](#expo-app-configuration)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)
7. [Production Deployment](#production-deployment)

---

## 🚀 Initial Setup

### Prerequisites

- Google Cloud account
- Supabase project created
- Expo app initialized with `parentingai` scheme

### Package Requirements

```bash
npm install expo-web-browser expo-auth-session expo-crypto
```

---

## ☁️ Google Cloud Console Configuration

### Step 1: Create Google Cloud Project

1. Open [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** → **New Project**
3. Project name: `Parenting AI Assistant`
4. Click **Create**

### Step 2: Enable Google+ API

1. Navigate to **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click **Enable**

### Step 3: Configure OAuth Consent Screen

1. Navigate to **APIs & Services** → **OAuth consent screen**
2. Select **External** (for public app) → **Create**

#### App Information
```
App name: Parenting AI Assistant
User support email: artconcept91@gmail.com
App logo: [upload logo if available]
```

#### App Domain
```
Application home page: https://parentingai.app
Application privacy policy: https://parentingai.app/privacy-policy
Application terms of service: https://parentingai.app/terms
```

#### Authorized Domains
```
supabase.co
expo.dev
```

#### Developer Contact
```
Email: artconcept91@gmail.com
```

#### Scopes (Click "Add or Remove Scopes")

Select minimal required scopes:
- ✅ `.../auth/userinfo.email`
- ✅ `.../auth/userinfo.profile`
- ✅ `openid`

⚠️ **Important:** Only request necessary permissions
- ❌ DO NOT add: calendar, contacts (too invasive)
- ✅ Keep it minimal: email, profile, openid only

#### Test Users

**Required for "Testing" status:**

Add test user emails:
- ✅ `artconcept91@gmail.com`
- ✅ Add other emails that need access during testing

Click **Save and Continue** until complete.

---

### Step 4: Create OAuth Client IDs

Navigate to **APIs & Services** → **Credentials**

#### A. Web Application (for Supabase)

```
Application type: Web application
Name: Parenting AI - Web Client

Authorized JavaScript origins:
- https://gbcxzkgzhylpbmzbymwj.supabase.co

Authorized redirect URIs:
- https://gbcxzkgzhylpbmzbymwj.supabase.co/auth/v1/callback
```

**📝 Save:** Client ID and Client Secret (needed for Supabase)

#### B. Android Client

```
Application type: Android
Name: Parenting AI - Android

Package name: com.artconcept91.parentingai
SHA-1 certificate fingerprint: [see below]
```

**Get SHA-1 fingerprint:**
```bash
# Option 1: Debug keystore
keytool -list -v -keystore ~/.android/debug.keystore \
  -alias androiddebugkey -storepass android -keypass android

# Option 2: From EAS
eas credentials -p android
```

**📝 Save:** Android Client ID

#### C. iOS Client

```
Application type: iOS
Name: Parenting AI - iOS

Bundle ID: com.artconcept91.parentingai
```

**📝 Save:** iOS Client ID

---

## 🔧 Supabase Configuration

### Step 1: Enable Google Provider

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Select project: **parentingai**
3. Navigate to **Authentication** → **Providers**

#### Configure Google Provider

```
Enabled: ✅ ON

Client ID (for OAuth): [Web Client ID from Google Console]
Client Secret (for OAuth): [Web Secret from Google Console]

Authorized Client IDs (for native apps):
- [Android Client ID]
- [iOS Client ID]
```

### Step 2: Configure Redirect URLs

Navigate to **Authentication** → **URL Configuration**

```
Site URL: exp://192.168.1.4:8081

Redirect URLs:
- exp://192.168.1.4:8081
- parentingai://auth-callback
- https://gbcxzkgzhylpbmzbymwj.supabase.co/auth/v1/callback
```

### Step 3: Verify Supabase Redirect URI

Copy your Supabase redirect URI:
```
https://[your-project-ref].supabase.co/auth/v1/callback
```

**Go back to Google Console** and verify this URI is in:
- **Credentials** → **Web Application** → **Authorized redirect URIs**

---

## 📱 Expo App Configuration

### Step 1: Verify app.json

App scheme is already configured:

```json
{
  "expo": {
    "scheme": "parentingai",
    "plugins": [
      "expo-router",
      "expo-secure-store"
    ]
  }
}
```

### Step 2: Environment Variables

Create `.env.local` (DO NOT commit):

```bash
EXPO_PUBLIC_SUPABASE_URL=https://gbcxzkgzhylpbmzbymwj.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
GOOGLE_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com
GOOGLE_ANDROID_CLIENT_ID=your-android-client-id.apps.googleusercontent.com
```

### Step 3: Verify Deep Linking

Deep link configuration (already set):
- **Scheme:** `parentingai://`
- **Auth Callback:** `parentingai://auth-callback`

Test deep link:
```bash
# iOS
npx uri-scheme open parentingai://auth-callback --ios

# Android
npx uri-scheme open parentingai://auth-callback --android
```

---

## 🧪 Testing

### Development Testing

```bash
# Start Expo dev server
npx expo start

# Test on iOS Simulator
npx expo start --ios

# Test on Android Emulator
npx expo start --android

# Test on Physical Device
# Scan QR code with Expo Go
```

### Test Flow

1. Open app → Navigate to SignIn/SignUp screen
2. Tap **"Masuk dengan Google"** or **"Daftar dengan Google"**
3. Google OAuth popup opens
4. Select Google account
5. Grant email & profile permissions
6. Redirect back to app
7. ✅ User logged in → Navigate to Dashboard

### Enable Debug Logs

```typescript
// src/contexts/AuthContext.tsx
const signInWithGoogle = async () => {
  console.log('[Google Sign-In] Starting...');
  
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'parentingai',
    path: 'auth-callback'
  });
  console.log('[Google Sign-In] Redirect URI:', redirectUri);
  
  // ... rest of implementation
};
```

---

## 🐛 Troubleshooting

### Error 1: "Error 400: invalid_request"

```
Akses diblokir: Error Otorisasi
This app doesn't comply with Google's OAuth 2.0 policy
```

**Causes:**
1. Redirect URI not registered in Google Cloud Console
2. OAuth consent screen not configured correctly
3. App in "Testing" status but user not added as test user

**Solutions:**

#### Option 1: Add Test User
1. Google Cloud Console → OAuth consent screen
2. Scroll to **Test users**
3. Click **+ ADD USERS**
4. Enter: `artconcept91@gmail.com`
5. Save

#### Option 2: Publish App (Production)
1. Google Cloud Console → OAuth consent screen
2. Click **PUBLISH APP**
3. Submit for review (may take several days)

#### Option 3: Use Email Auth (Temporary)
- Use Supabase email/password authentication
- Disable Google Sign-In temporarily

---

### Error 2: "redirect_uri_mismatch"

**Cause:** Redirect URI in app doesn't match Google Console

**Fix:**
1. Check redirect URI in code:
   ```typescript
   const redirectUri = AuthSession.makeRedirectUri({
     scheme: 'parentingai',
   });
   console.log('Redirect URI:', redirectUri);
   // Output: parentingai://
   ```

2. Verify this URI is registered in Google Console:
   - **Credentials** → **Web Application**
   - **Authorized redirect URIs** → Add: `parentingai://`

3. For Expo Go, use:
   ```
   https://auth.expo.io/@yourusername/parenting-ai
   ```

---

### Error 3: "popup_closed_by_user"

**Cause:** User closed Google OAuth popup

**Fix:** This is normal behavior, no fix needed. Show message:
```
"Login dibatalkan. Silakan coba lagi."
```

---

### Error 4: "access_denied"

**Cause:** User denied permission request

**Fix:** Show message:
```
"Permission diperlukan untuk login dengan Google."
```

---

### Error 5: "invalid_client"

**Cause:** Client ID incorrect or doesn't match

**Fix:**
1. Verify Client ID in Supabase matches Google Console
2. Check Web Client ID (not Android/iOS Client ID)
3. Regenerate credentials if necessary

---

### Error 6: Deep Link Not Working

**Cause:** Scheme not registered or app not rebuilt

**Fix:**
1. Check `app.json` scheme: `"scheme": "parentingai"`
2. Rebuild app:
   ```bash
   # Clear cache
   npx expo start --clear
   
   # Or rebuild development build
   npx expo run:android
   npx expo run:ios
   ```

---

### Error 7: "session_not_found"

**Cause:** Session expired or not created

**Fix:**
1. Check Supabase logs for token exchange errors
2. Verify PKCE flow is correct
3. Check if `codeVerifier` is stored correctly

---

### Error 8: TypeScript Errors (Fixed)

**Issues resolved in `GOOGLE_SIGNIN_FIXES.md`:**

1. ✅ CustomButton - Missing `leftIcon` prop
2. ✅ AuthContext - Missing `expo-web-browser` dependency
3. ✅ AuthContext - Wrong `AuthSession.startAsync` API
4. ✅ AuthContext - PKCE base64URL encoding type errors

**Verification:**
```bash
npx tsc --noEmit
# ✅ No errors
```

---

## 🔒 Security Best Practices

### 1. Environment Variables

**Never commit credentials to Git!**

Create `.env.local`:
```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GOOGLE_WEB_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

Add to `.gitignore`:
```
.env.local
.env*.local
```

### 2. Supabase RLS Policies

Enable Row Level Security for `profiles` table:

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

### 3. Minimal OAuth Scopes

Only request necessary permissions:
- ✅ `email` - User identification
- ✅ `profile` - Name and avatar
- ❌ `calendar` - NOT needed (too invasive)
- ❌ `contacts` - NOT needed

---

## 🚀 Production Deployment

### Step 1: Publish OAuth Consent Screen

1. Google Cloud Console → OAuth consent screen
2. Click **PUBLISH APP**
3. Submit for verification (if needed for >100 users)

### Step 2: Add Production Redirect URIs

For custom domain deployment:

**Supabase:**
```
https://api.yourapp.com/auth/v1/callback
```

**Google Console:**
- Add production redirect URI
- Add production JavaScript origins

### Step 3: EAS Build Configuration

Update `eas.json`:

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "https://your-project.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "your-anon-key"
      },
      "ios": {
        "bundleIdentifier": "com.artconcept91.parentingai"
      },
      "android": {
        "package": "com.artconcept91.parentingai"
      }
    }
  }
}
```

### Step 4: Use Development Build (Recommended)

Expo Go has limitations with Google Sign-In. Use development build:

```bash
# Android development build
npx expo run:android

# iOS development build
npx expo run:ios

# Or with EAS
eas build --profile development --platform android
eas build --profile development --platform ios
```

---

## 📋 Complete Setup Checklist

### Google Cloud Console
- [ ] Project created: "Parenting AI Assistant"
- [ ] Google+ API enabled
- [ ] OAuth consent screen configured
- [ ] Test users added (artconcept91@gmail.com)
- [ ] Authorized domains: supabase.co, expo.dev
- [ ] Scopes: email, profile, openid
- [ ] Web OAuth client created
- [ ] Android OAuth client created (with SHA-1)
- [ ] iOS OAuth client created
- [ ] Client ID & Secret saved securely

### Supabase
- [ ] Google provider enabled
- [ ] Web Client ID & Secret configured
- [ ] Android & iOS Client IDs added to "Authorized Client IDs"
- [ ] Redirect URLs configured
- [ ] RLS policies active on `profiles` table

### Expo App
- [ ] Dependencies installed: expo-web-browser, expo-auth-session, expo-crypto
- [ ] AuthContext updated with `signInWithGoogle`
- [ ] SignIn screen updated with Google button
- [ ] SignUp screen updated with Google button
- [ ] Deep linking configured (scheme: parentingai)
- [ ] Environment variables set in `.env.local`
- [ ] `.env.local` added to `.gitignore`

### Testing
- [ ] Google Sign-In works on iOS simulator
- [ ] Google Sign-In works on Android emulator
- [ ] Google Sign-In works on physical device
- [ ] User profile created/updated correctly
- [ ] Deep linking redirect works
- [ ] Error handling works (popup closed, access denied, etc.)
- [ ] Debug logs enabled for troubleshooting

### Production
- [ ] OAuth consent screen published
- [ ] Production redirect URIs added
- [ ] EAS build configuration set
- [ ] iOS bundle identifier configured
- [ ] Android package name configured
- [ ] Development build tested (not Expo Go)

---

## 🔍 Debug Checklist

Use this when troubleshooting issues:

```
✅ OAuth consent screen configured
✅ Test users added (artconcept91@gmail.com)
✅ Authorized domains: supabase.co, expo.dev
✅ Scopes: email, profile, openid
✅ Web OAuth client created
✅ Android OAuth client created (with SHA-1)
✅ iOS OAuth client created
✅ Supabase Google provider enabled
✅ Client IDs configured in Supabase
✅ Redirect URIs match between Google Console and app
✅ Deep linking scheme configured
✅ Environment variables set
✅ TypeScript errors resolved
```

---

## 📚 Resources

### Official Documentation
- [Supabase Auth - Google](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Expo AuthSession](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [React Native Google Sign-In](https://github.com/react-native-google-signin/google-signin)

### Support
- Supabase Discord: https://discord.supabase.com
- Expo Forums: https://forums.expo.dev
- Stack Overflow: Tag `supabase` + `expo`

---

## 💡 Tips

1. **Don't commit credentials** to Git → Use `.env.local`
2. **Use test users** when app status is "Testing"
3. **For production**, publish app in Google OAuth consent screen
4. **Development build** is more reliable than Expo Go for OAuth
5. **Monitor logs** with `npx expo start --clear` and check console
6. **Clear cache** if issues persist: `npx expo start --clear`
7. **Restart app** after configuration changes
8. **Verify all redirect URIs match** between Google Console, Supabase, and app code

---

## 🆘 Still Having Issues?

1. Clear Expo cache: `npx expo start --clear`
2. Restart Expo Go or rebuild app
3. Verify all redirect URIs match exactly
4. Check console logs for detailed error messages
5. Ensure test user is added (for Testing status)
6. Try using email/password auth temporarily
7. Check Supabase logs for token exchange errors

---

**Created:** November 10, 2025  
**Last Updated:** November 2025  
**Status:** ✅ Complete - Consolidated from 3 separate guides  
**Project:** Parenting AI Assistant  
**Developer:** artconcept91@gmail.com

**Source Files Merged:**
- `GOOGLE_OAUTH_SETUP.md` (258 lines) - OAuth consent screen & Error 400 fixes
- `GOOGLE_SIGNIN_SETUP_GUIDE.md` (401 lines) - Initial Google Cloud setup
- `GOOGLE_SIGNIN_FIXES.md` (190 lines) - TypeScript error fixes
