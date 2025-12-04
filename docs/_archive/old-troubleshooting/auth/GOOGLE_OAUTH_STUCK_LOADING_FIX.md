# <!-- Moved from root path: /GOOGLE_OAUTH_STUCK_LOADING_FIX.md on 2025-11-11. Consolidated into docs/troubleshooting/auth/. -->
# 🚀 FINAL SOLUTION: Google OAuth "Stuck on Loading"

## 📍 Masalah yang Terjadi:

```
LOG  [Google Sign-In] Using Supabase OAuth flow...
LOG  [Google Sign-In] Opening OAuth URL...
(kemudian stuck loading setelah pilih akun Google)
```

### Penyebab:
Browser berhasil membuka Google login, tapi **tidak bisa redirect kembali ke app** karena:
1. Supabase redirect URLs belum dikonfigurasi dengan benar
2. App scheme (`parentingai://`) belum terdaftar di Supabase

---

## ✅ SOLUSI LENGKAP (3 Tempat Setup):

### 1️⃣ Google Cloud Console

🔗 https://console.cloud.google.com/apis/credentials

**Yang Perlu Ditambahkan:**
- Pilih **Web application** OAuth 2.0 Client ID
- Di "Authorized redirect URIs", tambahkan **HANYA**:

```
https://gbcxzkgzhylpbmzbymwj.supabase.co/auth/v1/callback
```

- **JANGAN** tambahkan `exp://` atau `parentingai://` (Google akan menolak)
- Klik **SAVE**
- **Copy Client ID dan Client Secret** untuk langkah berikutnya

---

### 2️⃣ Supabase Dashboard - Enable Google Provider

🔗 https://supabase.com/dashboard/project/gbcxzkgzhylpbmzbymwj/auth/providers

**Steps:**
1. Scroll cari **"Google"**
2. Toggle **"Enable Sign in with Google"** = **ON**
3. Paste **Client ID (for OAuth)** dari Google Console
4. Paste **Client Secret (for OAuth)** dari Google Console
5. **SAVE**

**Screenshot reference:**
```
Google enabled: ✅ ON

Client ID (for OAuth): 377421031313-xxxx.apps.googleusercontent.com
Client Secret (for OAuth): GOCSPX-xxxxxxxxxx

Authorized Client IDs: (kosongkan atau isi jika pakai native)
```

---

### 3️⃣ Supabase Dashboard - Configure Redirect URLs

🔗 https://supabase.com/dashboard/project/gbcxzkgzhylpbmzbymwj/auth/url-configuration

**Site URL:**
```
parentingai://auth-callback
```

**Redirect URLs** (tambahkan satu per satu dengan tombol "+ Add URL"):
```
parentingai://auth-callback
exp://192.168.1.4:8081
http://localhost:8081
http://localhost:19006
```

**PENTING:** Klik **SAVE** setelah menambahkan semua URLs!

---

### 4️⃣ Google Cloud Console - Add Test User

🔗 https://console.cloud.google.com/apis/credentials/consent

**Steps:**
1. Scroll ke **"Test users"**
2. Klik **"+ ADD USERS"**
3. Masukkan: `artconcept91@gmail.com`
4. Klik **"SAVE"**

**Note:** Jika app masih status "Testing", HANYA test users yang bisa login!

---

### 5️⃣ Restart Expo & Test

```bash
# Stop Expo (Ctrl+C di terminal)
npx expo start --clear
```

**Tunggu 2-3 menit** untuk Google propagate perubahan, lalu:

1. Buka app di Expo Go
2. Klik "Masuk dengan Google"
3. Browser akan terbuka → Google login
4. Pilih akun: `artconcept91@gmail.com`
5. **Browser akan close otomatis**
6. **App akan redirect ke dashboard** ✅

---

## 🔄 Bagaimana OAuth Flow Bekerja:

```
User klik "Sign in with Google" di app
         ↓
App calls Supabase signInWithOAuth()
         ↓
Supabase generates OAuth URL
         ↓
WebBrowser.openAuthSessionAsync() opens URL
         ↓
User signs in with Google
         ↓
Google redirects to: 
https://gbcxzkgzhylpbmzbymwj.supabase.co/auth/v1/callback
         ↓
Supabase validates & creates session
         ↓
Supabase redirects to: parentingai://auth-callback
         ↓
App receives deep link & session
         ↓
onAuthStateChange triggers → User logged in! ✅
```

**Kunci:** Supabase bertindak sebagai **OAuth proxy** antara Google dan app Anda.

---

## 🐛 Troubleshooting:

### Problem: "Access blocked: invalid_request"
**Solution:**
- Pastikan redirect URI di Google Console PERSIS: `https://gbcxzkgzhylpbmzbymwj.supabase.co/auth/v1/callback`
- Tidak ada typo, tidak ada trailing slash

### Problem: "Error 403: access_denied"
**Solution:**
- Pastikan `artconcept91@gmail.com` sudah ditambahkan sebagai test user
- Tunggu 2-3 menit setelah menambahkan test user

### Problem: Browser opens but doesn't redirect back
**Solution:**
- Check Supabase redirect URLs sudah termasuk `parentingai://auth-callback`
- Check `exp://192.168.1.4:8081` (sesuai IP Anda)
- Restart Expo dengan `--clear`

### Problem: "Invalid client" atau "Client ID not found"
**Solution:**
- Pastikan Client ID dan Secret di Supabase sudah benar
- Copy paste langsung dari Google Console (jangan ketik manual)
- Pastikan menggunakan **Web Client** (bukan Android/iOS)

### Problem: Still stuck loading after selecting account
**Solution:**
- Clear Expo Go app cache: Settings > Apps > Expo Go > Clear Cache
- Reinstall Expo Go app
- Check logs di Metro bundler untuk error messages

---

## 📋 Checklist Final:

Pastikan SEMUA langkah ini sudah selesai:

- [ ] **Google Console:** Redirect URI Supabase ditambahkan
- [ ] **Google Console:** Client ID & Secret sudah di-copy
- [ ] **Google Console:** Test user `artconcept91@gmail.com` ditambahkan
- [ ] **Supabase Providers:** Google enabled
- [ ] **Supabase Providers:** Client ID & Secret di-paste dan SAVE
- [ ] **Supabase URL Config:** Site URL = `parentingai://auth-callback`
- [ ] **Supabase URL Config:** Redirect URLs termasuk `parentingai://` dan `exp://192.168.1.4:8081`
- [ ] **Expo:** Di-restart dengan `npx expo start --clear`
- [ ] **Wait:** Tunggu 2-3 menit untuk propagation
- [ ] **Test:** Coba Google Sign-In lagi

---

## 💡 Catatan Penting:

### Perbedaan Client Types di Google Console:

**Web Application** (✅ Yang Anda butuhkan):
- Untuk OAuth flow via browser
- Redirect URI: Supabase callback URL
- **Inilah yang digunakan untuk Expo Go!**

**Android** (❌ Bukan untuk Expo Go):
- Untuk native Android app (standalone build)
- Butuh package name & SHA-1 fingerprint
- Hanya untuk production

**iOS** (❌ Bukan untuk Expo Go):
- Untuk native iOS app (standalone build)  
- Butuh Bundle ID
- Hanya untuk production

### Development vs Production:

**Development (Expo Go - sekarang):**
```
App → Browser → Google → Supabase → exp://192.168.1.4:8081 → App
```

**Production (Standalone build - nanti):**
```
App → Browser → Google → Supabase → parentingai://auth-callback → App
```

---

## 🎯 Yang Sudah Saya Perbaiki di Kode:

1. ✅ **Changed approach:** Dari `expo-auth-session` ke `Supabase OAuth + WebBrowser`
2. ✅ **Fixed redirect handling:** Menggunakan `parentingai://auth-callback`
3. ✅ **Added session check:** Verify session setelah OAuth complete
4. ✅ **Updated auth-callback screen:** Handle OAuth response dengan benar
5. ✅ **Added proper error handling:** Catch dan log semua errors

**File yang diubah:**
- `src/contexts/AuthContext.tsx` - Menggunakan Supabase OAuth flow
- `app/auth-callback.tsx` - Handle OAuth redirect

---

## 🚀 Next Steps Setelah Berhasil:

1. **Test thoroughly:** Coba login beberapa kali untuk memastikan stabil
2. **Test with different WiFi:** Pastikan tidak stuck saat ganti network
3. **Add error messages:** Tampilkan error yang user-friendly di UI
4. **Build production:** Gunakan `eas build` untuk standalone app
5. **Publish OAuth consent screen:** Untuk allow public users (tidak hanya test users)

---

## 📚 Resources:

- [Supabase Google OAuth Docs](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Expo WebBrowser](https://docs.expo.dev/versions/latest/sdk/webbrowser/)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)

---

**Created:** 10 November 2025  
**Status:** Ready to test  
**Expected Result:** Login dengan Google berhasil tanpa stuck! ✅

---

## 🆘 Jika Masih Bermasalah:

Kirimkan screenshot dari:
1. Google Console > Credentials > Web Client > Redirect URIs
2. Supabase > Auth > Providers > Google settings
3. Supabase > Auth > URL Configuration
4. Metro bundler logs saat klik Google Sign-In

Atau baca file lengkap: `CORRECT_GOOGLE_OAUTH_SETUP.md`
