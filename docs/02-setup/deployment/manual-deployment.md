# Manual Deployment Guide - Azure OpenAI Edge Functions

## ⚠️ PENTING: Edge Function Belum Deployed!

Aplikasi saat ini menggunakan **fallback response** (template) karena:
1. ✅ Azure OpenAI API terverifikasi bekerja (tested locally)
2. ❌ Edge Function belum deployed ke Supabase production
3. ❌ Environment variables belum diset di Supabase

---

## 📋 Prerequisites

Anda harus memiliki akses ke:
- Supabase Dashboard: https://supabase.com/dashboard
- Project ID: `gbcxzkgzhylpbmzbymwj`

---

## 🚀 Step-by-Step Deployment

### Method 1: Via Supabase Dashboard (RECOMMENDED)

#### Step 1: Set Environment Secrets

1. **Login** ke https://supabase.com/dashboard
2. **Pilih project**: `parentingAI` (gbcxzkgzhylpbmzbymwj)
3. **Klik**: Settings → Edge Functions → Environment Variables
4. **Add** secrets berikut:

```bash
# Azure OpenAI Configuration
AZURE_OPENAI_ENDPOINT = https://artco-mem1xkia-eastus2.cognitiveservices.azure.com
AZURE_OPENAI_KEY = 7ia5i78FrJXNBc8lHU1wvdMiDMxqTZewts419GadIqqimKMa57A5JQQJ99BHACHYHv6XJ3w3AAAAACOGIJ1I
AZURE_OPENAI_DEPLOYMENT = gpt-5-mini

# Mode Configuration
SIMULATE_OPENAI = 0

# Supabase Configuration (untuk Edge Function internal calls)
SUPABASE_URL = https://gbcxzkgzhylpbmzbymwj.supabase.co
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiY3h6a2d6aHlscGJtemJ5bXdqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjM2MTQ0OSwiZXhwIjoyMDc3OTM3NDQ5fQ.S-kIP7fauHgOoxhn8hIku4NnNM5VIppgk-K28RW9aFs
```

#### Step 2: Deploy Edge Functions

**Via Dashboard:**

1. Go to: **Edge Functions** → **Deploy new function**

2. **Function 1: chat**
   - Name: `chat`
   - Source: Upload folder `/workspaces/parentingAI/supabase/functions/chat/`
   - Entrypoint: `index.ts`
   - JWT verification: **Enabled** (requires user auth)

3. **Function 2: generate-tip**
   - Name: `generate-tip`
   - Source: Upload folder `/workspaces/parentingAI/supabase/functions/generate-tip/`
   - Entrypoint: `index.ts`
   - JWT verification: **Enabled**

**Via VS Code (if you have Supabase extension):**

1. Install "Supabase" extension in VS Code
2. Open Command Palette (`Ctrl+Shift+P`)
3. Run: `Supabase: Deploy Function`
4. Select: `chat`
5. Repeat for: `generate-tip`

---

### Method 2: Via Supabase CLI (Alternative)

**If you can install Supabase CLI on your local machine (not in this container):**

```bash
# On your local machine:
# Install via homebrew (Mac) or scoop (Windows)
brew install supabase/tap/supabase  # Mac
# OR
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git  # Windows
scoop install supabase

# Login
supabase login

# Link project
cd /path/to/parentingAI
supabase link --project-ref gbcxzkgzhylpbmzbymwj

# Set secrets
supabase secrets set AZURE_OPENAI_ENDPOINT="https://artco-mem1xkia-eastus2.cognitiveservices.azure.com"
supabase secrets set AZURE_OPENAI_KEY="7ia5i78FrJXNBc8lHU1wvdMiDMxqTZewts419GadIqqimKMa57A5JQQJ99BHACHYHv6XJ3w3AAAAACOGIJ1I"
supabase secrets set AZURE_OPENAI_DEPLOYMENT="gpt-5-mini"
supabase secrets set SIMULATE_OPENAI="0"
supabase secrets set SUPABASE_URL="https://gbcxzkgzhylpbmzbymwj.supabase.co"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_KEY"

# Deploy
supabase functions deploy chat
supabase functions deploy generate-tip

# Verify
supabase secrets list
supabase functions list
```

---

### Method 3: Via GitHub Actions (Automated)

**Setup CI/CD for automatic deployment:**

Create `.github/workflows/deploy-functions.yml`:

```yaml
name: Deploy Supabase Functions

on:
  push:
    branches: [main]
    paths:
      - 'supabase/functions/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: supabase/setup-cli@v1
        with:
          version: latest
      
      - name: Deploy functions
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_PROJECT_ID: gbcxzkgzhylpbmzbymwj
        run: |
          supabase link --project-ref $SUPABASE_PROJECT_ID
          supabase functions deploy chat
          supabase functions deploy generate-tip
```

Then set GitHub secrets in repository settings.

---

## ✅ Verification After Deployment

### 1. Check Secrets

Dashboard → Edge Functions → Environment Variables
- Verify all 6 secrets are set
- No typos in keys or values

### 2. Check Function Status

Dashboard → Edge Functions
- `chat`: ✅ Deployed
- `generate-tip`: ✅ Deployed
- Last deployed: [timestamp]

### 3. Test via Dashboard

1. Go to function → **Invoke**
2. Payload:
```json
{
  "message": "Bagaimana cara menenangkan bayi?"
}
```
3. Should return: AI response (not template)

### 4. Test via curl

```bash
# Get your auth token first (from mobile app console or Supabase dashboard)
curl -X POST "https://gbcxzkgzhylpbmzbymwj.supabase.co/functions/v1/chat" \
  -H "Authorization: Bearer YOUR_USER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Test AI"}'
```

Expected response:
```json
{
  "session_id": "xxx",
  "answer": "Detailed AI response in Bahasa Indonesia..."
}
```

### 5. Test in Mobile App

```bash
# Start app
cd /workspaces/parentingAI
npm start

# In app:
1. Login
2. Open Chat
3. Send message: "Tips menenangkan bayi?"
4. Should get AI response (NOT template fallback)

# Check logs in Metro bundler console:
✅ User authenticated: xxx
🚀 Invoking Edge Function: chat
📤 Payload: {...}
✅ Edge Function Success - Answer length: 500+
```

---

## 🐛 Troubleshooting

### Issue: Still getting template response

**Check:**
1. ✅ User logged in? (check auth status)
2. ✅ Function deployed? (check Supabase dashboard)
3. ✅ Secrets set? (check environment variables)
4. ✅ JWT valid? (check token expiry)

**Console logs to look for:**
```
❌ Edge Function Error: FunctionsHttpError
❌ No active session - user not authenticated
```

### Issue: "Invalid JWT"

**Solution:**
- User needs to logout and login again
- Token expired → refresh session
- Check auth in app before sending message

### Issue: "Model failed" (500 error)

**Check Edge Function logs:**
```bash
supabase functions logs chat
```

Look for:
- Azure API connection errors
- Missing environment variables
- Incorrect API key

### Issue: Empty AI response

**Check:**
- `max_completion_tokens` ≥ 2000 ✅ (already fixed)
- No `temperature` parameter ✅ (already fixed)
- Azure deployment name correct

---

## 📊 Expected Behavior After Deployment

### Before Deployment (Current State):
```
User sends message
  → App invokes Edge Function
    → Edge Function fails (not deployed/no secrets)
      → Fallback activated
        → Template response: "😊 Maaf, fitur AI chat..."
```

### After Deployment (Expected):
```
User sends message
  → App invokes Edge Function ✅
    → Edge Function calls Azure OpenAI ✅
      → GPT-5-mini processes request ✅
        → Returns detailed response ✅
          → Saved to database ✅
            → Displayed in app ✅
```

---

## 📝 Quick Checklist

- [ ] Login to Supabase Dashboard
- [ ] Set all 6 environment variables
- [ ] Deploy `chat` function
- [ ] Deploy `generate-tip` function
- [ ] Verify secrets in dashboard
- [ ] Test function via dashboard "Invoke"
- [ ] Test in mobile app
- [ ] Check console logs for success
- [ ] Verify AI response quality

---

## 🎯 Success Indicators

✅ Console shows: `"✅ Edge Function Success - Answer length: 500+"`
✅ Response is detailed and contextual (not template)
✅ Response in Bahasa Indonesia
✅ No "Maaf, fitur AI chat sementara tidak tersedia"
✅ Answer varies based on question
✅ Database contains new messages

---

## 📞 Need Help?

If deployment fails, check:
1. Supabase Dashboard → Edge Functions → Logs
2. Mobile app Metro bundler console logs
3. Browser DevTools console (if web)
4. This file: `/docs/AI_CONNECTION_STATUS.md`

---

**Last Updated**: November 10, 2025
**Status**: ⚠️ Awaiting manual deployment
**Action Required**: Deploy via Supabase Dashboard
