# <!-- Moved from root path: /GOOGLE_OAUTH_QUICK_FIX.md on 2025-11-11. Consolidated into docs/troubleshooting/auth/. -->
# 🚨 QUICK FIX: Google OAuth Error 400

## Error yang Anda alami:
```
Error 400: invalid_request
Akses diblokir: Error Otorisasi
```

## ⚡ SOLUSI CEPAT (5 Menit):

### 1️⃣ Tambahkan Redirect URI di Google Cloud Console

**🔗 Link:** https://console.cloud.google.com/apis/credentials

**Langkah:**
1. Pilih project Anda
2. Klik OAuth 2.0 Client ID yang digunakan
3. Tambahkan **Authorized redirect URIs** berikut:

```
exp://192.168.1.4:8081
https://gbcxzkgzhylpbmzbymwj.supabase.co/auth/v1/callback
parentingai://
parentingai://auth-callback
```

4. **SAVE**

### 2️⃣ Tambahkan Test User

**🔗 Link:** https://console.cloud.google.com/apis/credentials/consent

**Langkah:**
1. Scroll ke bagian **Test users**
2. Klik **+ ADD USERS**
3. Masukkan email: `artconcept91@gmail.com`
4. **SAVE**

### 3️⃣ Verify di Supabase

**🔗 Link:** https://supabase.com/dashboard/project/gbcxzkgzhylpbmzbymwj/auth/providers

**Pastikan:**
- ✅ Google provider **Enabled**
- ✅ Client ID terisi (Web Client ID dari Google)
- ✅ Client Secret terisi (Web Client Secret dari Google)
- ✅ Authorized Client IDs berisi:
  - Android: `377421031313-o97uil0t57eigrlvg0cbm4rafqa66ceo.apps.googleusercontent.com`
  - iOS: `377421031313-bn9iih0t3kj7jf9b07imp4io3jvsgdvs.apps.googleusercontent.com`

### 4️⃣ Restart App

```bash
# Stop Expo
Ctrl+C

# Clear cache dan restart
npx expo start --clear
```

---

## 📋 Checklist Cepat:

- [ ] Redirect URIs ditambahkan di Google Console
- [ ] Test user (artconcept91@gmail.com) ditambahkan
- [ ] Google provider enabled di Supabase
- [ ] Client IDs dikonfigurasi di Supabase
- [ ] App di-restart dengan `--clear`

---

## 🎯 Kenapa Error Ini Terjadi?

Google OAuth mengharuskan:
1. **Redirect URI** yang digunakan app HARUS terdaftar di Google Console
2. Jika app masih status "Testing", user HARUS ditambahkan sebagai test user
3. Supabase harus dikonfigurasi sebagai OAuth provider

**Aplikasi Anda menggunakan:** `exp://192.168.1.4:8081` untuk development
**Tapi ini belum terdaftar** di Google Cloud Console ❌

---

## 💡 Tips Development:

### Untuk Testing di Expo Go:
Redirect URI akan berubah sesuai IP network Anda:
- `exp://192.168.1.4:8081` (WiFi rumah)
- `exp://10.0.0.5:8081` (WiFi lain)

**Solusi:**
1. Gunakan **wildcard** jika memungkinkan
2. Atau tambahkan semua IP yang mungkin
3. **Atau build development build** (recommended)

### Untuk Production:
Gunakan custom scheme yang tetap:
- `parentingai://auth-callback`
- `com.artconcept91.parentingai://`

---

## 🔍 Debug Info dari Log:

```
[Google Sign-In] Generated Redirect URI: exp://192.168.1.4:8081

Client IDs:
- Android: 377421031313-o97uil0t57eigrlvg0cbm4rafqa66ceo
- iOS: 377421031313-bn9iih0t3kj7jf9b07imp4io3jvsgdvs
- Web: 377421031313-bdc7t0lbgu18qba51saufpjuvppr1qsq
```

---

## 🆘 Jika Masih Tidak Berhasil:

1. **Clear browser cache** Google account
2. **Logout** dari Google di browser
3. **Tunggu 5-10 menit** setelah update redirect URI (propagation time)
4. Coba **incognito mode** di browser
5. Gunakan **development build** instead of Expo Go:
   ```bash
   npx expo run:android
   ```

---

## 📚 Dokumentasi Lengkap:
- File: `docs/setup/GOOGLE_OAUTH_SETUP.md`
- Berisi panduan lengkap step-by-step

---

**Last Updated:** 10 November 2025  
**Status:** Ready to fix  
**ETA:** 5 minutes
