# RevenueCat Production Setup ✅

## ✅ Yang Sudah Dilakukan

### 1. API Key Configuration
- **Production API Key**: `goog_WhFwFkHaEMlpCpuGOuTGLrSZdTf`
- **App ID**: `appccdb0c4151`
- **Dashboard**: https://app.revenuecat.com/projects/03721891/apps/appccdb0c4151

### 2. Environment Variables
File `.env` sudah diupdate dengan:
```env
EXPO_PUBLIC_REVENUECAT_API_KEY=goog_WhFwFkHaEMlpCpuGOuTGLrSZdTf
```

### 3. Code Changes
- ✅ `app.config.js` - Membaca API key dari environment
- ✅ `revenueCatService.ts` - Menggunakan API key dari Expo Constants
- ✅ `.env` - Production key ditambahkan
- ✅ `.env.example` - Template ditambahkan

---

## 🚀 Langkah Build Ulang

### A. Build untuk Testing (Internal)
```bash
# Clear cache dulu
npm start -- --clear

# Build AAB baru dengan production key
eas build --platform android --profile production
```

### B. Setelah Build Selesai
1. Download file `.aab` dari EAS Build
2. Upload ke Google Play Console → Internal Testing
3. Install dan test di device fisik

### C. Verifikasi Production Key
Setelah install, cek:
- ✅ Tidak ada pesan "test API key" 
- ✅ App tidak crash saat buka
- ✅ Subscription flow berfungsi normal

---

## 📋 RevenueCat Dashboard Setup

### 1. Products Configuration
Pastikan sudah setup di RevenueCat:
- **Monthly**: `monthly` 
- **Yearly**: `yearly`
- **Lifetime**: `lifetime`

### 2. Entitlements
- **Entitlement ID**: `razqashop Pro`
- Attach ke semua products

### 3. Google Play Console Integration
Di RevenueCat Dashboard:
1. Go to **App Settings** → **Google Play**
2. Upload **Service Account JSON**
3. Verifikasi connection

---

## ⚠️ Troubleshooting

### Error: "Wrong API Key"
**Penyebab**: Build masih menggunakan old API key dari cache

**Solusi**:
```bash
# Clear Expo cache
rm -rf node_modules/.cache
npm start -- --clear

# Build ulang
eas build --platform android --profile production
```

### Error: "Products Not Found"
**Penyebab**: Products belum disetup di RevenueCat atau Google Play

**Solusi**:
1. Buat products di Google Play Console
2. Import ke RevenueCat dashboard
3. Wait 24 hours untuk sync

---

## 🎯 Next Steps

1. **Build Production AAB**:
   ```bash
   eas build --platform android --profile production
   ```

2. **Upload ke Play Console**:
   - Internal Testing track
   - Add testers
   - Wait for approval

3. **Test di Device**:
   - Install dari Play Console
   - Test subscription flow
   - Verify no "test key" warnings

4. **Go Live**:
   - Promote to Production
   - Submit for review
   - Monitor RevenueCat dashboard

---

## 📞 Support

**RevenueCat Documentation**:
- https://www.revenuecat.com/docs/getting-started
- https://www.revenuecat.com/docs/android

**Dashboard**:
- https://app.revenuecat.com/projects/03721891/apps/appccdb0c4151

**Support**: support@revenuecat.com
