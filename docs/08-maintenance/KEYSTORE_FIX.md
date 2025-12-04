# 🔑 Solusi Keystore Mismatch

## Masalah
Google Play Console menolak AAB karena ditandatangani dengan keystore berbeda.

**Expected SHA1:** `71:A0:C4:57:96:62:4E:B3:94:74:C2:02:F2:E1:09:B9:96:D3:17:86`  
**Current SHA1:** `D5:05:D3:DB:0D:BA:ED:02:47:CF:3E:BB:94:60:34:71:87:FA:56:74`

---

## ✅ Solusi 1: Gunakan Google Play App Signing (RECOMMENDED)

### Langkah 1: Export Upload Key dari EAS
```bash
cd /Users/anggiandriyana/Downloads/parentingAI-main
eas credentials
```

1. Pilih **Android**
2. Pilih **production**
3. Pilih **Keystore: Set up a new keystore**
4. Pilih **Download existing keystore**
5. Save file sebagai `upload-keystore.jks`

### Langkah 2: Upload ke Google Play Console

1. Buka Google Play Console → App Integrity → App signing
2. Klik **"Use Google Play App Signing"**
3. Upload `upload-keystore.jks` sebagai **Upload Key**
4. Google akan manage signing key otomatis

### Langkah 3: Upload AAB Lagi
Sekarang Anda bisa upload AAB yang baru.

---

## ✅ Solusi 2: Gunakan Build Lama

Jika Anda punya build lama yang sudah pernah berhasil upload:

1. **Download build lama**:
   - https://expo.dev/accounts/shinigami91/projects/parenting-ai/builds
   - Cari build terakhir yang berhasil (Nov 17, 2025)
   - Download AAB

2. **Upload build lama ke Internal Testing**
   - Test dengan build yang sudah verified

3. **Update keystore EAS dengan keystore lama**
   ```bash
   eas credentials
   # Upload keystore lama jika Anda punya file .jks
   ```

---

## ✅ Solusi 3: Reset App (LAST RESORT)

**HANYA jika app belum live di production:**

1. Hapus app dari Google Play Console
2. Buat app baru dengan package name berbeda (misalnya `com.razqashop.umai`)
3. Upload dengan keystore baru

---

## 🎯 Rekomendasi

**Gunakan Solusi 1** karena:
- ✅ Google Play App Signing adalah best practice
- ✅ Tidak perlu manage keystore manual
- ✅ Lebih aman (Google backup keystore Anda)
- ✅ Bisa rotate key jika hilang

---

## 📋 Checklist

- [ ] Export keystore dari EAS
- [ ] Enable Google Play App Signing
- [ ] Upload upload key ke Google Play
- [ ] Upload AAB lagi
- [ ] Verify upload berhasil
