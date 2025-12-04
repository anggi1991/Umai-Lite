# <!-- Moved from root path: /CORRECT_GOOGLE_OAUTH_SETUP.md on 2025-11-11. Consolidated into docs/troubleshooting/auth/. -->
# ✅ SOLUSI BENAR: Google OAuth Setup

## ❌ Error yang Anda Alami:

```
Invalid Origin: must end with a public top-level domain (such as .com or .org)
Invalid Origin: cannot contain whitespace
Invalid Origin: URIs must not contain a path or end with "/"
```

## 🎯 Penjelasan:

**Google Cloud Console HANYA menerima HTTP/HTTPS URIs**, TIDAK menerima:
- ❌ `exp://192.168.1.4:8081` (custom scheme)
- ❌ `parentingai://` (custom scheme)
- ❌ `parentingai://auth-callback` (custom scheme)

**Solusi:** Gunakan **Supabase sebagai OAuth proxy**

---

## 🔄 Cara Kerja OAuth Flow yang Benar:

```
1. User klik "Sign in with Google" di app
   ↓
2. App membuka browser → Google login page
   ↓
3. User login → Google redirect ke: 
   https://gbcxzkgzhylpbmzbymwj.supabase.co/auth/v1/callback
   ↓
4. Supabase validates token → Redirect kembali ke app:
   parentingai://auth-callback
   ↓
5. App menerima session → User berhasil login ✅
```

**Kesimpulan:** Google hanya perlu tahu tentang Supabase URL, bukan custom app scheme!

---

## ⚡ LANGKAH-LANGKAH SETUP (10 Menit):

### 1️⃣ Setup di Google Cloud Console

**URL:** https://console.cloud.google.com/apis/credentials

#### A. Edit Web Application OAuth Client

1. Klik pada **Web application** OAuth 2.0 Client ID
2. Scroll ke **"Authorized redirect URIs"**
3. Klik **"+ ADD URI"**
4. Tambahkan **HANYA** URI ini:

```
https://gbcxzkgzhylpbmzbymwj.supabase.co/auth/v1/callback
```

5. Klik **"SAVE"**

#### B. Copy Client ID dan Secret

Setelah save, copy:
- ✅ **Client ID** (contoh: 123456789-abc.apps.googleusercontent.com)
- ✅ **Client secret** (contoh: GOCSPX-xxxxx)

---

### 2️⃣ Setup di Supabase Dashboard

**URL:** https://supabase.com/dashboard/project/gbcxzkgzhylpbmzbymwj/auth/providers

#### A. Enable Google Provider

1. Cari **"Google"** di list providers
2. Toggle **"Enable Sign in with Google"** = ON
3. Masukkan **Client ID** dari Google Console
4. Masukkan **Client Secret** dari Google Console
5. Klik **"Save"**

#### B. Configure Redirect URLs

**URL:** https://supabase.com/dashboard/project/gbcxzkgzhylpbmzbymwj/auth/url-configuration

**Site URL:**
```
parentingai://auth-callback
```

**Redirect URLs** (tambahkan satu per satu):
```
parentingai://auth-callback
exp://192.168.1.4:8081
http://localhost:8081
http://localhost:19006
```

Klik **"Save"**

---

### 3️⃣ Tambahkan Test User di Google

**URL:** https://console.cloud.google.com/apis/credentials/consent

1. Scroll ke **"Test users"**
2. Klik **"+ ADD USERS"**
3. Masukkan email: `artconcept91@gmail.com`
4. Klik **"SAVE"**

⚠️ **Penting:** Jika app masih status "Testing", HANYA test users yang bisa login!

---

### 4️⃣ Verify Environment Variables

Check file `.env`:

```bash
# Pastikan ada Client IDs ini:
EXPO_PUBLIC_IOS_CLIENT_ID=377421031313-bn9iih0t3kj7jf9b07imp4io3jvsgdvs.apps.googleusercontent.com
EXPO_PUBLIC_ANDROID_CLIENT_ID=377421031313-o97uil0t57eigrlvg0cbm4rafqa66ceo.apps.googleusercontent.com
EXPO_PUBLIC_WEB_CLIENT_ID=377421031313-bdc7t0lbgu18qba51saufpjuvppr1qsq.apps.googleusercontent.com
```

**PENTING:** 
- Untuk native apps (Expo), gunakan `EXPO_PUBLIC_WEB_CLIENT_ID`
- Supabase akan handle OAuth flow

---

### 5️⃣ Restart App

```bash
# Stop Expo (Ctrl+C)
# Clear cache dan restart
npx expo start --clear
```

---

### 6️⃣ Test Google Sign-In

1. Buka app di Expo Go
2. Klik **"Masuk dengan Google"**
3. Browser akan terbuka → Google login page
4. Login dengan: `artconcept91@gmail.com`
5. Approve permissions
6. Browser akan close otomatis
7. Kamu akan login di app! ✅

---

## 🐛 Troubleshooting:

### Error: "Access blocked: This app's request is invalid"
**Solusi:** 
- Pastikan redirect URI di Google Console PERSIS: `https://gbcxzkgzhylpbmzbymwj.supabase.co/auth/v1/callback`
- Tidak ada trailing slash
- Tidak ada typo

### Error: "Error 403: access_denied"
**Solusi:**
- Tambahkan email Anda sebagai test user di OAuth consent screen
- Atau publish app (butuh review dari Google)

### Browser terbuka tapi tidak redirect kembali ke app
**Solusi:**
- Check Supabase redirect URLs sudah ada `parentingai://auth-callback`
- Restart Expo dengan `--clear`

### Error: "Invalid client"
**Solusi:**
- Pastikan Client ID dan Secret di Supabase sudah benar
- Copy paste dari Google Console (jangan ketik manual)

---

## 📋 Checklist Final:

- [ ] Google Console: Redirect URI Supabase ditambahkan
- [ ] Google Console: Test user (artconcept91@gmail.com) ditambahkan
- [ ] Supabase: Google provider enabled
- [ ] Supabase: Client ID & Secret dikonfigurasi
- [ ] Supabase: Redirect URLs dikonfigurasi (parentingai://, exp://)
- [ ] .env: Web Client ID tersedia
- [ ] Expo: Di-restart dengan `--clear`
- [ ] Tunggu 2-3 menit untuk propagation

---

## 💡 Catatan Penting:

### Perbedaan Client IDs:

**Web Client ID:**
- Digunakan oleh Supabase
- Untuk OAuth flow via browser
- **Inilah yang Anda butuhkan untuk Expo Go!**

**Android Client ID:**
- Hanya untuk native Android app (bukan Expo Go)
- Butuh SHA-1 fingerprint
- Untuk production build

**iOS Client ID:**
- Hanya untuk native iOS app (bukan Expo Go)
- Butuh Bundle ID
- Untuk production build

### Development vs Production:

**Development (Expo Go):**
```
App → Browser → Google → Supabase → exp://... → App
```

**Production (Standalone Build):**
```
App → Browser → Google → Supabase → parentingai:// → App
```

---

## 🚀 Next Steps:

Setelah Google Sign-In berhasil, Anda bisa:

1. **Publish OAuth Consent Screen** untuk public access:
   - https://console.cloud.google.com/apis/credentials/consent
   - Klik "PUBLISH APP"
   - Submit for verification (opsional)

2. **Build Production App:**
   ```bash
   eas build --profile production --platform android
   ```

3. **Add More OAuth Providers:**
   - Facebook
   - Apple
   - GitHub
   - dll.

---

## 📚 Resources:

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Setup](https://developers.google.com/identity/protocols/oauth2)
- [Expo AuthSession](https://docs.expo.dev/versions/latest/sdk/auth-session/)

---

**Last Updated:** 10 November 2025  
**Status:** Ready to implement ✅  
**ETA:** 10 minutes
