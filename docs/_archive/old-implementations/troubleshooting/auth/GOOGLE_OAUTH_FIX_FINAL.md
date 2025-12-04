# <!-- Moved from root path: /GOOGLE_OAUTH_FIX_FINAL.md on 2025-11-11. Consolidated into docs/troubleshooting/auth/. -->
# 🔧 Google OAuth Deep Link Fix - SOLUSI FINAL

## 📍 Masalah yang Diselesaikan

**Gejala:**
- User klik "Masuk dengan Google"
- Browser terbuka dan user memilih akun Google
- Setelah pilih akun, browser menutup tapi app stuck/tidak redirect ke dashboard
- Logs menunjukkan OAuth URL opened tapi tidak ada callback

```
LOG  [Google Sign-In] Opening OAuth URL in browser...
(stuck di sini setelah pilih akun)
```

---

## ✅ Perubahan yang Dilakukan

### 1. **AuthContext.tsx - Improved URL Handling**

**Sebelum:**
```typescript
const result = await WebBrowser.openAuthSessionAsync(
  data.url,
  'parentingai://auth-callback'
);
// Hanya menunggu result.type === 'success'
```

**Sesudah:**
```typescript
// Setup URL listener SEBELUM membuka browser
const urlListener = Linking.addEventListener('url', async (event) => {
  // Extract tokens dari deep link URL
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  
  // Set session dengan tokens
  await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
});

// Open browser
await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

// Cleanup listener
urlListener.remove();
```

**Alasan:**
- `WebBrowser.openAuthSessionAsync` tidak selalu menangkap URL dengan benar di Expo Go
- Perlu listen ke deep link URL secara eksplisit dengan `Linking.addEventListener`
- Extract tokens manual dari URL hash fragment (`#access_token=...`)

### 2. **auth-callback.tsx - Improved Token Extraction**

**Ditambahkan:**
- Extract tokens dari URL hash fragment secara eksplisit
- Fallback untuk check existing session
- Better error handling dengan tombol kembali
- Logging lebih detail untuk debugging

```typescript
// Extract tokens dari URL
const url = await Linking.getInitialURL();
const hash = url.substring(hashIndex + 1);
const params = new URLSearchParams(hash);

const accessToken = params.get('access_token');
const refreshToken = params.get('refresh_token');

if (accessToken && refreshToken) {
  await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
}
```

### 3. **Deep Link Configuration**

**app.config.js sudah dikonfigurasi:**
```javascript
scheme: 'parentingai'
```

**Redirect URLs yang harus dikonfigurasi di Supabase:**
```
parentingai://auth-callback
exp://192.168.1.4:8081 (untuk Expo Go - sesuaikan IP)
http://localhost:8081
```

---

## 🔍 Cara Kerja Flow Baru

### Flow Lengkap:

1. **User klik "Masuk dengan Google"**
   ```typescript
   signInWithGoogle() called
   ```

2. **Setup URL Listener**
   ```typescript
   Linking.addEventListener('url', callback)
   // Listener siap menangkap deep link
   ```

3. **Generate OAuth URL dari Supabase**
   ```typescript
   supabase.auth.signInWithOAuth({
     provider: 'google',
     redirectTo: 'parentingai://auth-callback'
   })
   ```

4. **Buka Browser**
   ```typescript
   WebBrowser.openAuthSessionAsync(oauthUrl, 'parentingai://auth-callback')
   // User pilih akun Google
   ```

5. **Google Redirect ke App**
   ```
   parentingai://auth-callback#access_token=xxx&refresh_token=yyy
   ```

6. **URL Listener Menangkap Deep Link**
   ```typescript
   // Extract tokens dari URL
   const tokens = parseURL(event.url)
   
   // Set session
   await supabase.auth.setSession(tokens)
   ```

7. **Auth State Change Triggered**
   ```typescript
   supabase.auth.onAuthStateChange((event, session) => {
     if (event === 'SIGNED_IN') {
       setUser(session.user)
       // Navigate to dashboard
     }
   })
   ```

---

## 📋 Checklist Troubleshooting

Jika masih stuck, pastikan:

### ✅ Supabase Dashboard Configuration

**1. Google Provider Enabled**
- Dashboard → Authentication → Providers → Google
- Toggle = ON
- Client ID dan Secret sudah diisi

**2. Redirect URLs**
- Dashboard → Authentication → URL Configuration
- Pastikan ada:
  - `parentingai://auth-callback`
  - `exp://[YOUR_IP]:8081` (untuk Expo Go)
  - `http://localhost:8081`

### ✅ Google Cloud Console

**1. OAuth Consent Screen**
- Status: Testing atau Production
- Test users sudah ditambahkan (jika Testing)

**2. Credentials**
- Web application OAuth 2.0 Client ID
- Authorized redirect URIs:
  ```
  https://[PROJECT_REF].supabase.co/auth/v1/callback
  ```

### ✅ Environment Variables

**.env file:**
```env
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

EXPO_PUBLIC_WEB_CLIENT_ID=xxx.apps.googleusercontent.com
EXPO_PUBLIC_IOS_CLIENT_ID=xxx.apps.googleusercontent.com
EXPO_PUBLIC_ANDROID_CLIENT_ID=xxx.apps.googleusercontent.com
```

### ✅ Expo Configuration

**app.config.js:**
```javascript
scheme: 'parentingai'
```

**Clear cache dan restart:**
```bash
npx expo start --clear
```

---

## 🔧 Testing Steps

### 1. **Check Logs Sebelum Test**
```bash
# Terminal 1: Run Expo
npx expo start --clear

# Terminal 2 (optional): Watch logs
npx expo start --android  # atau --ios
```

### 2. **Test Flow**
1. Klik "Masuk dengan Google"
2. Pilih akun Google
3. Perhatikan logs:
   ```
   [Google Sign-In] Starting Supabase OAuth flow...
   [Google Sign-In] Opening OAuth URL in browser...
   [Google Sign-In] Deep link received: parentingai://auth-callback#access_token=...
   [Google Sign-In] Tokens found, setting session...
   [Google Sign-In] Session set successfully!
   [Auth] State change: SIGNED_IN
   ```

### 3. **Expected Behavior**
- Browser buka → user pilih akun
- Browser tutup otomatis
- App redirect ke Dashboard dalam 1-2 detik
- User data muncul di Dashboard

---

## 🚨 Common Issues & Solutions

### Issue 1: "Browser closes but nothing happens"
**Solusi:**
- Check logs untuk "Deep link received"
- Jika tidak ada, pastikan `scheme: 'parentingai'` di app.config.js
- Restart Expo dengan `--clear`

### Issue 2: "No tokens found in URL"
**Solusi:**
- Check Supabase redirect URLs configuration
- Pastikan `parentingai://auth-callback` ada di list
- Check Google Console redirect URIs

### Issue 3: "Session error after setting tokens"
**Solusi:**
- Check Supabase anon key valid
- Check network connection
- Try logout dan login lagi

### Issue 4: "Testing mode - user not allowed"
**Solusi:**
- Google Cloud Console → OAuth Consent Screen
- Add test user email
- Atau publish app (Production mode)

---

## 📝 Verification Commands

```bash
# Check if deep link works
npx expo start --clear

# Test deep link manually (while app running)
npx uri-scheme open "parentingai://auth-callback#test=123" --ios
# atau
npx uri-scheme open "parentingai://auth-callback#test=123" --android

# Should see logs in terminal
```

---

## ✅ Success Indicators

1. **Logs show complete flow:**
   ```
   ✅ OAuth flow started
   ✅ Browser opened
   ✅ Deep link received
   ✅ Tokens extracted
   ✅ Session set
   ✅ Auth state changed to SIGNED_IN
   ✅ Redirected to dashboard
   ```

2. **Dashboard shows user data:**
   - User email visible
   - Welcome message shows name
   - No loading spinner stuck

3. **Subsequent logins faster:**
   - Session persisted
   - Auto-login on app restart

---

## 📚 Related Documentation

- [GOOGLE_OAUTH_STUCK_LOADING_FIX.md](./GOOGLE_OAUTH_STUCK_LOADING_FIX.md) - Konfigurasi Supabase & Google Console
- [CORRECT_GOOGLE_OAUTH_SETUP.md](./CORRECT_GOOGLE_OAUTH_SETUP.md) - Setup lengkap dari awal
- [Expo Linking Docs](https://docs.expo.dev/guides/linking/)
- [Supabase OAuth Docs](https://supabase.com/docs/guides/auth/social-login)

---

## 🎯 Summary

**Root Cause:**
- Deep link callback tidak tertangkap dengan baik oleh `WebBrowser.openAuthSessionAsync`
- Tokens tidak di-extract dari URL

**Solution:**
- Tambahkan explicit `Linking.addEventListener` untuk tangkap deep link
- Extract tokens manual dari URL hash fragment
- Set session dengan tokens secara eksplisit

**Result:**
- Google OAuth flow bekerja smooth
- User langsung redirect ke Dashboard setelah pilih akun
- Session persisted untuk auto-login

---

**Last Updated:** 2025-11-10  
**Tested On:** Expo Go (Android)  
**Status:** ✅ Working
