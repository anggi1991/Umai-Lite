# 🚀 Quick Deploy Guide for Android Release

## Untuk Google Play Console Testing

### 1. Update Version (Wajib setiap build baru!)

**File:** `app.json`

```json
{
  "expo": {
    "version": "1.0.1",  // Increment ini
    "android": {
      "versionCode": 5   // Increment ini juga (harus > previous)
    }
  }
}
```

---

### 2. Build Release dengan EAS

```bash
# Login ke EAS (first time only)
eas login

# Build untuk Android
eas build --platform android --profile production

# Monitor progress
eas build:list
```

**Output:** AAB file siap upload ke Play Console

---

### 3. Upload ke Google Play Console

1. **Login:** https://play.google.com/console
2. **Select App:** Parenting AI
3. **Release → Testing → Internal testing**
4. **Create new release**
5. **Upload AAB** dari EAS build
6. **Release notes:**
   ```
   Bug Fixes:
   - Fixed session persistence (no more auto-logout)
   - Added + button when no child exists
   - Block activity access before adding child
   - Improved child profile refresh
   ```
7. **Save → Review → Start rollout**

---

### 4. Install dari Play Store

**Untuk Tester:**
1. Buka link internal testing di email
2. Atau: https://play.google.com/apps/internaltest/[YOUR_TEST_ID]
3. Accept invitation
4. Install dari Play Store
5. Test semua bugs yang sudah difix

---

### 5. Testing Checklist

Setelah install dari Play Store:

#### Test 1: Session Persistence ⭐ CRITICAL
```
1. Login ke app
2. Navigate around (dashboard, profile, etc.)
3. Force close app (swipe dari recent apps)
4. Wait 2 minutes
5. Open app lagi
6. ✅ Expected: Masih login, langsung ke dashboard
7. ❌ If fails: Logout otomatis (BUG BELUM FIX)
```

#### Test 2: Child Profile + Button
```
1. New user atau delete all children
2. Go to "Profil Anak"
3. ✅ Expected: See empty state + button "Tambah Anak"
4. Tap button
5. ✅ Expected: Goes to Add Child form
6. Fill form & save
7. ✅ Expected: Langsung muncul di list
```

#### Test 3: Activity Access Guard
```
1. User tanpa anak
2. Tap "Catat Aktivitas"
3. ✅ Expected: Blocked dengan message + button
4. Tap "Tambah Anak"
5. Add child
6. Go to Activities lagi
7. ✅ Expected: Bisa akses sekarang
```

#### Test 4: Background Behavior
```
1. Open app (logged in)
2. Switch ke app lain
3. Wait 10 minutes
4. Return to app
5. ✅ Expected: Still logged in, data intact
```

---

### 6. Check Logs (if issues found)

```bash
# Connect device via USB
adb devices

# View logs
adb logcat | grep -E "parentingai|AsyncStorage|Supabase|Storage"

# Filter errors only
adb logcat *:E | grep -E "parentingai|AsyncStorage"
```

**Look for:**
- `[Storage] Error` - AsyncStorage issues
- `[Auth] No session` - Session lost
- `Supabase` errors - Auth problems

---

### 7. Common Issues & Quick Fixes

#### Issue: "Still auto-logout"

**Check:**
```bash
# See if ProGuard removed AsyncStorage
adb logcat | grep AsyncStorage

# Should see:
# [Storage] Saved session key
# [Storage] Retrieved session key
```

**Fix:**
1. Make sure `android-proguard-rules.pro` ada di project root
2. Rebuild: `eas build --platform android --profile production`

---

#### Issue: "Children tidak muncul setelah add"

**Check:** useFocusEffect should reload

**Debug:**
Add temporary log di `ChildList.tsx`:
```tsx
const loadChildren = async () => {
  console.log('[ChildList] Loading children...');
  // ... existing code
  console.log('[ChildList] Loaded:', data.length, 'children');
};
```

---

#### Issue: "Activity guard tidak muncul"

**Check:** children array

**Debug:**
Add log di `ActivityHistory.tsx`:
```tsx
console.log('[ActivityHistory] Children count:', children?.length);
console.log('[ActivityHistory] Loading:', loading);
```

---

### 8. Emergency Rollback

Jika ada critical bug:

1. **Halt Rollout** di Play Console:
   - Release management → Internal testing
   - Click "Halt rollout"

2. **Fix & Rebuild:**
   ```bash
   # Fix code
   # Increment versionCode
   eas build --platform android --profile production
   ```

3. **Upload new version**

---

### 9. Promotion to Production

Setelah internal testing sukses (2-3 hari):

1. **Internal Testing → Production**
   - Promote release
   - Set staged rollout: 10% → 50% → 100%

2. **Monitor:**
   - Crash reports
   - ANR rate
   - User reviews
   - Session metrics

---

### 10. Version History

| Version | versionCode | Changes | Status |
|---------|-------------|---------|--------|
| 1.0.0 | 4 | Initial release | ❌ Has bugs |
| 1.0.1 | 5 | Session fix + child profile fixes | ✅ Testing |

---

## 📱 Required Files for Android Release

Make sure these exist:

```
✅ app.json (version updated)
✅ eas.json (production profile)
✅ android-proguard-rules.pro (new file)
✅ src/services/supabaseClient.ts (updated)
✅ src/screens/ChildProfile/ChildList.tsx (updated)
✅ src/screens/Activities/ActivityHistory.tsx (updated)
```

---

## 🔥 Quick Commands Reference

```bash
# Build
eas build -p android --profile production

# Check build status
eas build:list

# Download APK for local testing
eas build:download --platform android

# View build logs
eas build:view [BUILD_ID]

# Cancel build
eas build:cancel [BUILD_ID]
```

---

## 📊 Success Criteria

Before promoting to production:

- [ ] Session persists after force close ✅
- [ ] Session persists after 30 min ✅
- [ ] + Button shows when no child ✅
- [ ] Child list auto-refreshes ✅
- [ ] Activity guard works ✅
- [ ] No crashes in crash reports ✅
- [ ] Tested on 3+ devices ✅
- [ ] Tested on Android 9, 11, 13 ✅
- [ ] All testers confirm fixes ✅

---

**Last Updated:** November 24, 2025
**For:** Google Play Console Internal Testing
