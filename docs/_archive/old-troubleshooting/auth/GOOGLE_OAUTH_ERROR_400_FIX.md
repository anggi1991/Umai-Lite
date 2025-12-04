# <!-- Moved from root path: /GOOGLE_OAUTH_ERROR_400_FIX.md on 2025-11-11. Consolidated into docs/troubleshooting/auth/. -->
# ⚠️ SOLUSI CEPAT: Google OAuth Error 400

## 📍 Error yang Anda Alami:
```
Error 400: invalid_request
redirect_uri=exp://192.168.1.4:8081
```

## 🎯 Penyebab:
Aplikasi mencoba menggunakan redirect URI `exp://192.168.1.4:8081` tetapi URI ini **BELUM terdaftar** di Google Cloud Console Anda.

---

## ✅ SOLUSI - Pilih Salah Satu:

### 🚀 **OPSI 1: Tambahkan Redirect URI (5 Menit)** - RECOMMENDED

#### Langkah Detail:

**1. Buka Google Cloud Console:**
```
https://console.cloud.google.com/apis/credentials
```

**2. Pilih OAuth 2.0 Client ID Anda:**
- Klik pada Client ID yang Anda gunakan (Web, Android, atau iOS)
- Scroll ke bagian **"Authorized redirect URIs"**

**3. Klik "+ ADD URI" dan masukkan:**
```
exp://192.168.1.4:8081
```

**4. Tambahkan juga URI tambahan ini (untuk production):**
```
https://gbcxzkgzhylpbmzbymwj.supabase.co/auth/v1/callback
parentingai://
parentingai://auth-callback
```

**5. Klik tombol "SAVE"** di bagian bawah

**6. Tambahkan Test User:**
- Buka: https://console.cloud.google.com/apis/credentials/consent
- Scroll ke **"Test users"**
- Klik **"+ ADD USERS"**
- Masukkan: `artconcept91@gmail.com`
- Klik **"SAVE"**

**7. Restart Expo:**
```bash
# Tekan Ctrl+C di terminal, lalu:
npx expo start --clear
```

**8. Tunggu 2-3 menit** untuk Google propagate perubahan

**9. Coba Google Sign-In lagi** ✅

---

### 🔄 **OPSI 2: Gunakan Development Build** - LEBIH RELIABLE

Expo Go memiliki limitasi dengan OAuth. Development build lebih stabil:

```bash
# Android
npx expo run:android

# iOS
npx expo run:ios

# Atau dengan EAS Build
eas build --profile development --platform android
```

---

### 📧 **OPSI 3: Gunakan Email/Password Dulu** - TEMPORARY

Sementara setup Google OAuth, Anda bisa login dengan:
- Email/Password authentication (sudah berfungsi)
- Disable tombol Google Sign-In sementara

---

## 🔍 Penjelasan Teknis:

### Kenapa Error Ini Terjadi?

1. **Expo Go menggunakan dynamic redirect URI** berdasarkan IP network Anda:
   - WiFi rumah: `exp://192.168.1.4:8081`
   - WiFi kantor: `exp://10.0.0.5:8081`
   - Mobile hotspot: `exp://172.20.10.2:8081`

2. **Google OAuth sangat strict** - redirect URI harus PERSIS sama dengan yang didaftarkan

3. **Setiap kali ganti WiFi**, redirect URI bisa berubah

### Solusi Jangka Panjang:

1. **Development Build** - Redirect URI tetap (`parentingai://`)
2. **Production Build** - Menggunakan custom scheme yang stabil
3. **Supabase OAuth** - Menggunakan Supabase sebagai OAuth proxy

---

## 📋 Checklist Troubleshooting:

- [ ] Redirect URI `exp://192.168.1.4:8081` sudah ditambahkan di Google Console
- [ ] Supabase redirect URI juga ditambahkan: `https://gbcxzkgzhylpbmzbymwj.supabase.co/auth/v1/callback`
- [ ] Test user (artconcept91@gmail.com) sudah ditambahkan
- [ ] OAuth consent screen sudah dikonfigurasi
- [ ] Sudah tunggu 2-3 menit setelah save
- [ ] Expo sudah di-restart dengan `--clear`
- [ ] Client IDs di `.env` sudah benar

---

## 🆘 Masih Error?

### Debug Steps:

**1. Cek redirect URI yang digunakan:**
```bash
# Lihat di console log saat app start
# Cari: "[Google Sign-In] Generated Redirect URI"
```

**2. Verify di Google Console:**
- Pastikan redirect URI PERSIS sama (case-sensitive)
- Tidak ada trailing slash
- Tidak ada typo

**3. Clear cache:**
```bash
# Clear Expo cache
npx expo start --clear

# Clear Google auth cache di HP
# Settings > Apps > Expo Go > Clear Cache
```

**4. Test di incognito/private browser mode**

**5. Gunakan email/password dulu** sambil tunggu Google propagation

---

## 💡 Tips Pro:

### Untuk Development yang Lancar:

1. **Gunakan Development Build** (bukan Expo Go)
   - Redirect URI stabil
   - Lebih mirip production
   - Tidak perlu update Google Console setiap ganti WiFi

2. **Setup multiple redirect URIs** di Google Console:
   ```
   exp://192.168.1.4:8081     (WiFi rumah)
   exp://10.0.0.5:8081        (WiFi kantor)
   parentingai://             (Production)
   https://...supabase.co/... (Supabase)
   ```

3. **Monitor logs** untuk melihat redirect URI aktual:
   ```bash
   npx expo start --clear
   # Lihat: [Google Sign-In] Generated Redirect URI
   ```

---

## 📞 Contact:

Jika masih stuck, check:
- `GOOGLE_OAUTH_QUICK_FIX.md` - Quick reference
- `docs/setup/GOOGLE_OAUTH_SETUP.md` - Full setup guide

---

**Last Updated:** 10 November 2025  
**Your Current Redirect URI:** `exp://192.168.1.4:8081`  
**Action Required:** Add this to Google Cloud Console ☝️
