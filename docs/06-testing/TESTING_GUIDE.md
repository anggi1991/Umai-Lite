# 🧪 Testing Guide for Bug Fixes

## Quick Test Commands

```bash
# 1. Ensure dependencies are installed
npm install

# 2. Clear cache and restart
npm start -- --clear

# 3. For physical device testing
npm run android  # or npm run ios
```

---

## 🔍 Manual Testing Steps

### Test 1: Tombol + Button When No Child Exists

**Steps:**
1. Clear app data atau gunakan user baru tanpa anak
2. Login ke aplikasi
3. Navigate ke "Profil Anak" dari dashboard
4. **Expected:** Lihat empty state dengan tombol "Tambah Anak"
5. Tap tombol "Tambah Anak"
6. **Expected:** Redirect ke halaman Add Child
7. Isi form dan save
8. **Expected:** Langsung kembali ke list dengan anak yang baru ditambahkan

**Pass Criteria:**
- ✅ Tombol terlihat jelas di empty state
- ✅ Tidak perlu back untuk tambah anak
- ✅ Redirect berfungsi dengan baik

---

### Test 2: Auto-Refresh After Adding Child

**Steps:**
1. Dari halaman Profil Anak (kosong)
2. Tap tombol + atau "Tambah Anak"
3. Isi form anak baru
4. Save
5. **Expected:** Langsung muncul di list tanpa perlu pull-to-refresh
6. Navigate ke halaman lain (Dashboard)
7. Kembali ke Profil Anak
8. **Expected:** Anak masih terlihat di list

**Pass Criteria:**
- ✅ Anak langsung muncul setelah save
- ✅ Tidak perlu hard reset atau force close
- ✅ Data persist setelah navigate away

---

### Test 3: Block Activity Access Before Child Added

**Steps:**
1. Login dengan user yang belum punya anak
2. Dari dashboard, tap "Catat Aktivitas"
3. **Expected:** Lihat empty state dengan pesan:
   - "👶 Belum ada profil anak"
   - "Tambahkan anak terlebih dahulu untuk mencatat aktivitas"
   - Tombol "Tambah Anak"
4. Tap tombol "Tambah Anak"
5. **Expected:** Redirect ke Add Child
6. Tambah anak dan kembali
7. Tap "Catat Aktivitas" lagi
8. **Expected:** Sekarang bisa akses halaman aktivitas

**Pass Criteria:**
- ✅ Empty state muncul saat belum ada anak
- ✅ Pesan jelas dan helpful
- ✅ Tombol redirect ke Add Child
- ✅ Bisa akses setelah tambah anak

**Also Test:**
- "Pantau Pertumbuhan" - should already have this guard
- "Journal" - uses same ActivityHistory component

---

### Test 4: Session Persistence (No Auto-Logout)

**Steps:**
1. Login ke aplikasi
2. Pastikan sudah masuk ke dashboard
3. **Close aplikasi sepenuhnya** (swipe close dari recent apps)
4. Wait 1 minute
5. Buka aplikasi lagi
6. **Expected:** Langsung masuk ke dashboard tanpa login screen
7. **Test Extended Session:**
   - Keep app closed for 30 minutes
   - Buka lagi
   - **Expected:** Masih login (token should auto-refresh)
8. **Test After Device Restart:**
   - Restart device
   - Buka aplikasi
   - **Expected:** Masih login

**Pass Criteria:**
- ✅ Session persist setelah close app
- ✅ Session persist setelah beberapa jam
- ✅ Session persist setelah device restart
- ✅ Token auto-refresh berfungsi

**Debug Tips:**
Jika masih logout, check logs untuk:
```
[Supabase] Error getting session
[Auth] No session found
```

---

### Test 5: Configuration Review

#### A. RevenueCat Test

**Steps:**
1. Navigate ke halaman Subscription
2. **Expected:** Lihat offering products (Monthly, Yearly, Lifetime)
3. Tap "Subscribe" pada salah satu product
4. **Expected:** Flow subscription berjalan (sandbox mode)
5. Check logs untuk:
```
[RevenueCat] SDK initialized successfully
[RevenueCat] Offerings loaded: ...
```

**Pass Criteria:**
- ✅ SDK initialize tanpa error
- ✅ Products load properly
- ✅ Purchase flow bisa dijalankan (sandbox)

#### B. Google Sign-In Test

**Steps:**
1. Logout dari aplikasi
2. Tap "Masuk dengan Google"
3. **Expected:** Browser opens untuk Google login
4. Pilih account Google
5. **Expected:** Redirect kembali ke app
6. **Expected:** Login berhasil, masuk ke dashboard
7. Check logs untuk:
```
[Google Sign-In] OAuth URL opened
[Google Sign-In] Session found
[Auth] User signed in
```

**Pass Criteria:**
- ✅ Browser opens properly
- ✅ Redirect berfungsi
- ✅ Session created
- ✅ Profile created di Supabase

**Common Issues:**
- **Redirect tidak berfungsi:** Check Supabase Dashboard → Auth → URL Configuration
- **Token error:** Verify Client IDs in Google Cloud Console

#### C. AdMob Check

**Status:** Not implemented yet

**If you want to implement AdMob:**
1. Install package:
```bash
npm install expo-ads-admob
```

2. Add to app.json:
```json
{
  "expo": {
    "plugins": [
      [
        "expo-ads-admob",
        {
          "androidAppId": "ca-app-pub-xxxxx~xxxxx",
          "iosAppId": "ca-app-pub-xxxxx~xxxxx"
        }
      ]
    ]
  }
}
```

3. Rebuild app:
```bash
npx expo prebuild --clean
```

---

## 🐛 Debugging Tips

### Check Supabase Client Config

```typescript
// In supabaseClient.ts, add log:
console.log('[Supabase] Config:', {
  hasCustomStorage: !!customStorage,
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: false,
});
```

### Check AsyncStorage

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Check saved session
AsyncStorage.getItem('supabase.auth.token').then(token => {
  console.log('[AsyncStorage] Saved token:', token ? 'YES' : 'NO');
});
```

### Check Session State

```typescript
// In AuthContext or any component
supabase.auth.getSession().then(({ data, error }) => {
  console.log('[Session Check]', {
    hasSession: !!data.session,
    hasUser: !!data.session?.user,
    expiresAt: data.session?.expires_at,
    error: error?.message,
  });
});
```

---

## 📊 Automated Testing (Optional)

### Unit Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- src/__tests__/unit/services/supabaseClient.test.ts
```

### Integration Tests

```bash
# Test auth flow
npm test -- src/__tests__/integration/auth.test.ts

# Test child management
npm test -- src/__tests__/integration/child.test.ts
```

---

## ✅ Final Checklist

Before marking as complete:

- [ ] Test 1: + Button when no child - PASS
- [ ] Test 2: Auto-refresh after add - PASS
- [ ] Test 3: Block activity access - PASS
- [ ] Test 4: Session persistence - PASS
- [ ] Test 5A: RevenueCat config - PASS
- [ ] Test 5B: Google Sign-In - PASS
- [ ] Test 5C: AdMob (if needed) - PASS / SKIP

- [ ] Test on Android device
- [ ] Test on iOS device (if available)
- [ ] Test with new user account
- [ ] Test with existing user account
- [ ] Test after app update (if deployed)

---

## 🚨 Known Issues & Workarounds

### Issue: Session still logs out
**Workaround:**
1. Clear app data
2. Reinstall app
3. Login again
4. Should persist properly now

### Issue: Google Sign-In redirect fails
**Fix:**
1. Check Supabase redirect URLs
2. Add these URLs:
   - `parentingai://auth-callback`
   - `exp://[YOUR_IP]:8081`
   - `http://localhost:8081`

### Issue: RevenueCat not loading
**Fix:**
1. Check API key in app.json
2. Verify package installed: `npm list react-native-purchases`
3. Rebuild app: `npm start -- --clear`

---

## 📝 Test Report Template

```
Date: ___________
Tester: ___________
Device: ___________
OS Version: ___________

Test Results:
1. + Button: ☐ PASS ☐ FAIL
2. Auto-refresh: ☐ PASS ☐ FAIL
3. Block access: ☐ PASS ☐ FAIL
4. Session persist: ☐ PASS ☐ FAIL
5. Config review: ☐ PASS ☐ FAIL

Notes:
___________________________________
___________________________________
___________________________________
```

---

**Last Updated:** November 24, 2025
