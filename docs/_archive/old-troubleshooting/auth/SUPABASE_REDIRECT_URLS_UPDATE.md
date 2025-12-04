# <!-- Moved from root path: /SUPABASE_REDIRECT_URLS_UPDATE.md on 2025-11-11. Consolidated into docs/troubleshooting/auth/. -->
# 🔧 CRITICAL: Supabase Redirect URLs Configuration

## ❌ MASALAH YANG TERJADI:

Browser terbuka, user klik "Lanjutkan", tapi stuck karena **Supabase tidak menerima redirect URL dari Expo Go**.

**Log menunjukkan:**
```
Redirect URL: exp://192.168.1.10:8081/--/auth-callback
```

Tapi di Supabase configuration kemungkinan hanya ada:
```
parentingai://auth-callback
```

**Result:** Supabase reject redirect → user stuck di Google consent page

---

## ✅ SOLUSI: Update Supabase Redirect URLs

### 🔗 Link Dashboard:
https://supabase.com/dashboard/project/gbcxzkgzhylpbmzbymwj/auth/url-configuration

### 📝 Langkah-langkah:

1. **Buka Supabase Dashboard** → Authentication → URL Configuration

2. **Pastikan "Site URL" adalah:**
   ```
   parentingai://auth-callback
   ```

3. **Tambahkan SEMUA redirect URLs ini (klik "+ Add URL" untuk setiap URL):**

   ```
   parentingai://auth-callback
   exp://192.168.1.10:8081/--/auth-callback
   exp://192.168.1.10:8081
   exp://localhost:8081/--/auth-callback
   exp://localhost:8081
   http://localhost:8081/auth-callback
   http://localhost:8081
   http://localhost:19006/auth-callback
   ```

   **PENTING:** 
   - Ganti `192.168.1.10` dengan IP lokal Anda (lihat di terminal Expo)
   - Jika IP berubah, tambahkan URL baru dengan IP yang baru

4. **Klik "SAVE"** ⚠️ JANGAN LUPA!

---

## 🎯 Penjelasan Setiap URL:

| URL | Digunakan Untuk |
|-----|-----------------|
| `parentingai://auth-callback` | Production build & standalone app |
| `exp://192.168.1.10:8081/--/auth-callback` | Expo Go development (dengan path) |
| `exp://192.168.1.10:8081` | Expo Go development (tanpa path) |
| `exp://localhost:8081/--/auth-callback` | Expo Go via localhost |
| `http://localhost:8081/auth-callback` | Web development |
| `http://localhost:19006/auth-callback` | Web development (alternative port) |

---

## 🔍 Cara Verify Configuration Berhasil:

### 1. Check di Supabase Dashboard
- Semua URL di atas harus terlihat di list
- Pastikan sudah di-SAVE (tidak ada "*" atau "unsaved changes")

### 2. Test Flow:
```
Klik "Masuk dengan Google" 
→ Browser buka 
→ Pilih akun 
→ Klik "Lanjutkan" 
→ Browser TUTUP otomatis ✅
→ App redirect ke Dashboard ✅
```

### 3. Check Logs (harus muncul):
```
✅ [Google Sign-In] Starting Supabase OAuth flow...
✅ [Google Sign-In] Redirect URL: exp://192.168.1.10:8081/--/auth-callback
✅ [Google Sign-In] Opening OAuth URL in browser...
✅ [Google Sign-In] Browser closed with type: success
✅ [Google Sign-In] Deep link received: parentingai://auth-callback#access_token=...
✅ [Google Sign-In] Tokens found, setting session...
✅ [Google Sign-In] Session set successfully!
✅ [Auth] State change: SIGNED_IN
```

---

## 🚨 Common Mistakes:

### ❌ Mistake 1: Lupa Save
- Tambah URL tapi lupa klik "SAVE"
- Supabase tidak apply changes

### ❌ Mistake 2: IP Berubah
- Router DHCP change IP address
- URL lama tidak work lagi
- **Solution:** Tambahkan IP baru ke list

### ❌ Mistake 3: Typo di URL
- `exp://192.168.1.10:8081/--/auth-callback` ✅
- `exp://192.168.1.10:8081/-/auth-callback` ❌ (satu dash)
- `exp://192.168.1.10:8081/auth-callback` ❌ (tanpa --)

### ❌ Mistake 4: Path Salah
- Expo Go menggunakan `/--/` bukan `/`
- Standalone app menggunakan `parentingai://` tanpa port

---

## 🔄 Quick Fix Commands:

```bash
# 1. Check current IP
ipconfig | findstr IPv4

# 2. Restart Expo (jika IP berubah)
npx expo start --clear

# 3. Check Expo logs untuk confirm redirect URL
# Look for: "Redirect URL: exp://..."
```

---

## 📊 Before vs After:

### BEFORE (Stuck):
```
Supabase Redirect URLs:
✅ parentingai://auth-callback

Browser redirect to: exp://192.168.1.10:8081/--/auth-callback
❌ Supabase: "URL not allowed" → User stuck
```

### AFTER (Works):
```
Supabase Redirect URLs:
✅ parentingai://auth-callback
✅ exp://192.168.1.10:8081/--/auth-callback
✅ exp://192.168.1.10:8081

Browser redirect to: exp://192.168.1.10:8081/--/auth-callback
✅ Supabase: "URL allowed" → Success!
✅ App receives callback → Dashboard
```

---

## 🎯 Next Steps After Configuration:

1. ✅ Update Supabase redirect URLs (di atas)
2. ✅ Restart Expo: `npx expo start --clear`
3. ✅ Test Google Sign-In
4. ✅ Check logs untuk confirm
5. ✅ Celebrate! 🎉

---

**Last Updated:** 2025-11-10  
**Status:** ⚠️ CRITICAL - Must configure before OAuth works  
**Priority:** 🔥 HIGH
