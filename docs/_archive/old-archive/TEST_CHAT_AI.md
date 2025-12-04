# Test Chat AI Connection

## Quick Test Command

Run this to test the app and see detailed logs:

```bash
cd /workspaces/parentingAI
npm start
```

Then in the app:
1. **Login** (if not logged in)
2. **Open Chat**
3. **Send message**: "Tips tidur bayi?"
4. **Check Metro bundler console** for logs:

Expected logs after deployment:
```
✅ User authenticated: [user_id]
🚀 Invoking Edge Function: chat
📤 Payload: { session_id: ..., message: "Tips tidur bayi?", child_id: ... }
🔑 Auth token present: true
📥 Edge Function Response: { hasData: true, hasError: false }
✅ Edge Function Success - Answer length: 500+
```

If you see:
```
❌ Edge Function Error: ...
⚠️ Falling back to template response
```

Then check:
1. User is authenticated (`supabase.auth.getSession()` returns valid session)
2. Edge Function deployed correctly
3. Environment variables set correctly
4. Azure OpenAI API accessible

---

## Manual Test with Real User Token

To get real user JWT token:

### Method 1: From Mobile App Console

1. Start app: `npm start`
2. Login to app
3. Open browser DevTools → Console
4. Run: `localStorage.getItem('sb-gbcxzkgzhylpbmzbymwj-supabase-co-auth-token')`
5. Copy the access_token from JSON

### Method 2: Via Supabase Auth API

```bash
# Login and get token
curl -X POST 'https://gbcxzkgzhylpbmzbymwj.supabase.co/auth/v1/token?grant_type=password' \
-H "apikey: YOUR_ANON_KEY" \
-H "Content-Type: application/json" \
-d '{
  "email": "your@email.com",
  "password": "your-password"
}'
```

Then test with real token:

```bash
curl -X POST "https://gbcxzkgzhylpbmzbymwj.supabase.co/functions/v1/chat" \
  -H "Authorization: Bearer YOUR_USER_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"message":"Tips tidur bayi?"}'
```

---

## Deployment Status

✅ **Supabase CLI Installed**: v2.54.11
✅ **Logged in**: Yes
✅ **Project linked**: gbcxzkgzhylpbmzbymwj
✅ **Secrets set**:
   - AZURE_OPENAI_ENDPOINT ✅
   - AZURE_OPENAI_KEY ✅
   - AZURE_OPENAI_DEPLOYMENT ✅
   - SIMULATE_OPENAI=0 ✅
   - SUPABASE_URL ✅ (auto)
   - SUPABASE_SERVICE_ROLE_KEY ✅ (auto)

✅ **Functions deployed**:
   - chat ✅
   - generate-tip ✅

---

## What to Expect

### With Valid User Session:
- App will call Edge Function with real JWT token
- Edge Function will call Azure OpenAI
- Response will be detailed AI answer (500+ chars)
- Message saved to database

### Without Valid Session:
- App detects no session
- Throws NOT_AUTHENTICATED error
- Falls back to template response
- User needs to login

---

## Next Steps

1. **Start app**: `npm start`
2. **Make sure you're logged in**
3. **Send chat message**
4. **Check console logs**
5. **Verify AI response** (should be detailed, not template)

If still getting template response, check console for specific error message.

---

**Status**: Edge Functions deployed ✅
**Action**: Test in mobile app with logged-in user
