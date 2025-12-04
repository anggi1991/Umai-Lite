# Google Sign-In Setup Guide (Native)

## Overview

Aplikasi menggunakan **native Google Sign-In** dengan `@react-native-google-signin/google-signin` untuk login yang seamless dan reliable.

## Prerequisites

1. Google Cloud Project dengan OAuth 2.0 credentials
2. SHA-1 certificate fingerprint untuk Android
3. Bundle ID untuk iOS

## Setup Steps

### 1. Get SHA-1 Certificate Fingerprint

```bash
# Debug keystore (untuk development)
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# Production keystore (untuk release)
keytool -list -v -keystore path/to/your/keystore.jks -alias your-key-alias
```

Copy **SHA-1** fingerprint (format: `AA:BB:CC:DD:...`)

### 2. Configure Google Cloud Console

1. Buka [Google Cloud Console](https://console.cloud.google.com)
2. Pilih/buat project
3. Enable **Google Sign-In API**
4. Buka **Credentials** → Create OAuth 2.0 Client IDs

**Create 3 Client IDs:**

#### A. Android Client ID
- Application type: **Android**
- Package name: `com.razqashop.parentingai`
- SHA-1: (paste SHA-1 from step 1)
- Save dan copy **Client ID**

#### B. iOS Client ID
- Application type: **iOS**
- Bundle ID: `com.razqashop.parentingai`
- Save dan copy **Client ID**

#### C. Web Client ID
- Application type: **Web application**
- Authorized redirect URIs: `https://gbcxzkgzhylpbmzbymwj.supabase.co/auth/v1/callback`
- Save dan copy **Client ID**

### 3. Configure Supabase

1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project `gbcxzkgzhylpbmzbymwj`
3. Go to **Authentication** → **Providers** → **Google**
4. Enable Google provider
5. Paste **Web Client ID** dan **Client Secret**
6. Save

### 4. Update Environment Variables

Edit `.env`:

```env
# Google Sign-In
EXPO_PUBLIC_WEB_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
EXPO_PUBLIC_ANDROID_CLIENT_ID=YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com
EXPO_PUBLIC_IOS_CLIENT_ID=YOUR_IOS_CLIENT_ID.apps.googleusercontent.com
```

### 5. Build & Test

```bash
# Development build (untuk testing)
npx expo run:android

# Production build (untuk Play Store)
eas build --platform android --profile production
```

## Testing

### Test di Development Build

1. Run `npx expo run:android`
2. Tap "Login dengan Google"
3. Native Google picker dialog muncul
4. Pilih akun
5. Langsung login → redirect ke dashboard

### Test di Production Build

1. Build via EAS: `eas build --platform android`
2. Upload ke Play Store internal testing
3. Install dari Play Store
4. Test login flow

## Troubleshooting

### Error: DEVELOPER_ERROR

**Penyebab:**
- SHA-1 fingerprint tidak match
- Package name salah
- Client ID salah

**Solusi:**
1. Verify SHA-1 di Google Cloud Console
2. Check package name: `com.razqashop.parentingai`
3. Rebuild app setelah update credentials

### Error: SIGN_IN_REQUIRED

**Penyebab:**
- Google Play Services not installed/outdated
- Emulator tidak support Google Play

**Solusi:**
- Test di real device
- Update Google Play Services
- Use emulator with Google Play

### Error: PLAY_SERVICES_NOT_AVAILABLE

**Penyebab:**
- Device tidak ada Google Play Services

**Solusi:**
- Install Google Play Services
- Test di device yang support

## Implementation Details

### Code Flow

```typescript
// 1. Configure Google Sign-In
GoogleSignin.configure({
  webClientId: EXPO_PUBLIC_WEB_CLIENT_ID,
  offlineAccess: true,
});

// 2. Sign in with Google
const userInfo = await GoogleSignin.signIn();

// 3. Get ID token
const idToken = userInfo.idToken;

// 4. Sign in to Supabase
const { data } = await supabase.auth.signInWithIdToken({
  provider: 'google',
  token: idToken,
});
```

### Session Management

- Session automatically saved by Supabase
- Persisted via AsyncStorage
- Auto-refresh token handled by Supabase
- No manual session management needed

## Security Notes

- **Never** commit `.env` file
- Use EAS Secrets for production builds
- Rotate credentials periodically
- Monitor auth logs di Supabase Dashboard

## References

- [Google Sign-In Docs](https://github.com/react-native-google-signin/google-signin)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [EAS Build Secrets](https://docs.expo.dev/build-reference/variables/)
