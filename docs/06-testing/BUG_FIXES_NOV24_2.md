# 🐛 Bug Fixes - November 24, 2025 (Round 2)

## Fixed Issues

---

## 1. 🔐 Google Sign-In - Switched to Native Implementation

**Problem:**
- Supabase OAuth dengan WebBrowser stuck di "Menyelesaikan login..."
- Deep link redirect tidak bekerja di Expo Go
- Browser OAuth tidak reliable untuk mobile apps

**Root Cause:**
- WebBrowser OAuth flow requires proper deep linking
- Expo Go tidak support custom URL schemes dengan baik
- Session management kompleks dengan browser redirects

**Solution:**
- Ganti dengan **Native Google Sign-In** menggunakan `@react-native-google-signin/google-signin`
- Direct integration dengan Google Play Services
- Langsung dapat ID token tanpa browser redirect
- Seamless UX - native dialog picker

**Files Modified:**
- `src/contexts/AuthContext.tsx` - Native Google Sign-In implementation
- `app.json` - Removed OAuth plugin
- `docs/08-maintenance/android-proguard-rules.pro` - Added Google Sign-In ProGuard rules

**Key Changes:**
```tsx
// BEFORE: Supabase OAuth with WebBrowser
const { data } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: { skipBrowserRedirect: false }
});
await WebBrowser.openAuthSessionAsync(data.url);

// AFTER: Native Google Sign-In
import { GoogleSignin } from '@react-native-google-signin/google-signin';

await GoogleSignin.hasPlayServices();
const userInfo = await GoogleSignin.signIn();
const { data } = await supabase.auth.signInWithIdToken({
  provider: 'google',
  token: userInfo.idToken,
});
```

**Setup Required:**
1. Install package: `npm install @react-native-google-signin/google-signin`
2. Configure di `.env`:
   ```
   EXPO_PUBLIC_WEB_CLIENT_ID=your_web_client_id
   EXPO_PUBLIC_ANDROID_CLIENT_ID=your_android_client_id
   EXPO_PUBLIC_IOS_CLIENT_ID=your_ios_client_id
   ```
3. Build with EAS (native modules required)

**Testing:**
1. Tap "Login dengan Google"
2. **Native Google dialog** muncul (bukan browser)
3. Pilih akun Google
4. ✅ Langsung login ke dashboard
5. ✅ Session persist setelah force close
6. ✅ No browser redirect needed

**✅ Benefits:**
- Works di development build & production
- Better UX (native dialog)
- Faster login (no browser overhead)
- More reliable session management
- Works offline (cached credentials)

**⚠️ Note:**
- Butuh development/production build (tidak bisa di Expo Go)
- Google Play Services required (Android)
- Web platform tidak support (gunakan email/password)

---

## 2. ❌ Failed to Delete Child Profile

**Problem:**
- Saat delete child profile, muncul error
- Tidak jelas error apa yang terjadi

**Root Cause:**
- Error message tidak di-log dengan detail
- User tidak tahu apakah masalah RLS policy, foreign key, atau lainnya

**Solution:**
- Enhanced error logging di `childService.deleteChild()`
- Log detail error: message, details, hint, code
- Show error message ke user dengan detail
- User bisa screenshot error untuk debugging

**Files Modified:**
- `src/services/childService.ts` - Enhanced logging
- `src/screens/ChildProfile/ChildList.tsx` - Show detailed error

**Key Changes:**
```typescript
// childService.ts
if (error) {
  console.error('[Delete Child Service] Delete failed:', {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code,
  });
  throw new Error(`Gagal menghapus anak: ${error.message}`);
}

// ChildList.tsx
catch (error: any) {
  console.error('[Delete Child] ❌ Error:', error);
  const errorMsg = error.message || t('errors.deleteChildFailed');
  Alert.alert(
    t('common.error'),
    `${t('errors.deleteChildFailed')}\n\nDetail: ${errorMsg}`
  );
}
```

**Testing:**
1. Buka Child Profile list
2. Tap tombol delete pada salah satu anak
3. Confirm delete
4. Check console logs untuk detail error (jika ada)
5. ✅ Jika berhasil: child terhapus dan list refresh
6. ✅ Jika gagal: tampil error message dengan detail

**Note:**
- Database CASCADE sudah di-set dengan benar
- RLS policy sudah correct: `user_id = auth.uid()`
- Kemungkinan error bisa dari:
  - Network issue
  - Session expired
  - RLS policy issue (rare)

---

## Testing Checklist

### Google OAuth Login
- [ ] Login dengan Google berhasil redirect ke dashboard
- [ ] Session persist setelah force close app
- [ ] Console log menunjukkan "✅ Session found"
- [ ] Tidak ada redirect loop ke signin

### Delete Child Profile  
- [ ] Delete child berhasil tanpa error
- [ ] Child list auto-refresh setelah delete
- [ ] Console log menunjukkan "✅ Child deleted successfully"
- [ ] Error message jelas jika delete gagal

---

## Build Notes

Kedua fixes ini sudah included dalam build **versionCode 5** yang sedang berjalan di EAS Build.

**Next Steps:**
1. Tunggu build selesai
2. Upload AAB ke Google Play Console internal testing
3. Test kedua fixes di device Android via Play Store
4. Monitor console logs untuk debugging

---

> **Context:** Bugs ini ditemukan setelah build versionCode 5 dimulai, jadi perlu build versionCode 6 untuk include fixes ini.
