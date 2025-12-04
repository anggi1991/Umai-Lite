# <!-- Moved from root path: /GOOGLE_OAUTH_LOCALHOST_FIX.md on 2025-11-11. Consolidated into docs/troubleshooting/auth/. -->
# 🔥 CRITICAL FIX: Google OAuth + Expo Go Compatibility

## ❌ ROOT CAUSE IDENTIFIED:

**Google OAuth DOES NOT accept custom URL schemes** like `exp://` or `parentingai://`

From Google Console:
```
Authorized redirect URIs: For use with requests from a web server
❌ exp://192.168.1.10:8081/--/auth-callback  (NOT ALLOWED by Google)
❌ parentingai://auth-callback (NOT ALLOWED by Google)
✅ http://localhost:8081/auth-callback (ALLOWED)
✅ https://... (ALLOWED)
```

**Result:** Google rejects redirect → User stuck on consent page

---

## ✅ SOLUTION: Use localhost Redirect + Session Polling

### Architecture:
```
1. App opens browser with Google OAuth
2. Redirect to: http://localhost:8081/auth-callback  ✅ (Google accepts)
3. Supabase creates session in their database
4. App polls for session every 1 second
5. Session detected → Browser dismissed → Login success!
```

---

## 🔧 REQUIRED CONFIGURATION:

### 1. **Supabase Redirect URLs**

🔗 https://supabase.com/dashboard/project/gbcxzkgzhylpbmzbymwj/auth/url-configuration

**Add this URL:**
```
http://localhost:8081/auth-callback
```

**Full list should include:**
```
parentingai://auth-callback
http://localhost:8081/auth-callback  ← ADD THIS
http://localhost:8081
http://localhost:19006/auth-callback
exp://192.168.1.10:8081/--/auth-callback
```

⚠️ **SAVE CHANGES!**

### 2. **Google Console** (Already Configured ✅)

Your Google Console already has:
```
✅ http://localhost:8081 (URI 4)
✅ http://127.0.0.1:8081 (URI 6)
```

---

## 🎯 How It Works:

### Traditional Flow (BROKEN in Expo Go):
```
App → Google → Redirect to exp:// → ❌ Google rejects
```

### New Flow (WORKS):
```
1. App opens browser with OAuth URL
   Redirect URL: http://localhost:8081/auth-callback ✅

2. User clicks "Lanjutkan"
   Google redirects to: http://localhost:8081/auth-callback ✅
   
3. Browser shows localhost page (might be blank/error - doesn't matter!)
   Meanwhile, Supabase has created session in their DB ✅

4. App is polling session every 1 second
   Poll #1: No session
   Poll #2: No session
   Poll #3: Session found! ✅

5. App dismisses browser
6. onAuthStateChange triggered
7. Navigate to Dashboard ✅
```

---

## 📋 Testing Steps:

### 1. **Update Supabase Configuration**
- Go to URL Configuration
- Add `http://localhost:8081/auth-callback`
- Click SAVE

### 2. **Reload App**
```bash
# In Expo Go: Shake device → Reload
# Or press 'r' in terminal
```

### 3. **Test Google Sign-In**
```
1. Click "Masuk dengan Google"
2. Browser opens
3. Select account
4. Click "Lanjutkan"
5. Browser redirects to localhost (might show error page - that's OK!)
6. Wait 1-3 seconds...
7. Browser dismisses automatically
8. Dashboard appears! 🎉
```

---

## 📊 Expected Logs:

```
✅ [Google Sign-In] Starting Supabase OAuth flow...
✅ [Google Sign-In] Redirect URL: http://localhost:8081/auth-callback
✅ [Google Sign-In] Opening OAuth URL in browser...
✅ [Google Sign-In] Starting session polling...
(user clicks Lanjutkan... wait 1-3 seconds)
✅ [Google Sign-In] Session detected via polling!
✅ [Google Sign-In] User: artconcept91@gmail.com
✅ [Auth] State change: SIGNED_IN
```

---

## 🤔 Why localhost Works:

### Problem with Custom Schemes:
```
exp:// and parentingai:// are mobile deep links
Google OAuth: "I don't trust custom schemes" ❌
```

### Why localhost is Safe:
```
http://localhost is standard web protocol
Google OAuth: "localhost is safe for development" ✅
Supabase: "I can redirect to localhost" ✅
Browser: "I can open localhost" ✅
```

### Magic: Session Polling
```
App doesn't need to capture redirect!
Just check: "Does session exist yet?"
If yes → Login success!
```

---

## 🚨 Important Notes:

### 1. **Browser Might Show Error**
After clicking "Lanjutkan", browser might show:
```
"This site can't be reached"
"localhost refused to connect"
```

**This is NORMAL and EXPECTED!** The session is already created. App will detect it and dismiss browser.

### 2. **Why Not Use Web Server?**
We could run actual server on localhost:8081, but:
- Overkill for mobile development
- Session polling is simpler
- Works without extra dependencies

### 3. **Production vs Development**
- **Expo Go (dev):** Uses `http://localhost:8081/auth-callback`
- **Standalone (prod):** Will use `parentingai://auth-callback` (works in native build)

---

## ✅ After Configuration:

```
✅ Supabase allows localhost redirect
✅ Google allows localhost redirect (already configured)
✅ App polls for session (already implemented)
✅ Browser dismissed when session found (already implemented)
```

**Result:** Google Sign-In will work perfectly! 🚀

---

## 🔍 Troubleshooting:

### Issue: "Still stuck after clicking Lanjutkan"
**Check:**
1. Did you add `http://localhost:8081/auth-callback` to Supabase?
2. Did you click SAVE in Supabase dashboard?
3. Did you reload the app?

### Issue: "Browser shows error page"
**This is normal!** localhost:8081 doesn't have a server running. The important thing is Supabase session is created. Just wait 1-3 seconds for polling to detect it.

### Issue: "Polling timeout"
**Check:**
1. Internet connection stable?
2. Supabase URL correct in .env?
3. Check logs for session errors

---

**Last Updated:** 2025-11-10  
**Status:** 🔥 CRITICAL FIX - Must apply before testing  
**Priority:** ⚡ IMMEDIATE
