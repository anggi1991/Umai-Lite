# Edge Functions Setup Guide

## 🎯 Overview
Setup dan deployment Edge Functions untuk AI Chat dan Daily Tips functionality.

## 📋 Prerequisites
- Supabase CLI installed: `brew install supabase/tap/supabase`
- Supabase project created: https://gbcxzkgzhylpbmzbymwj.supabase.co
- Azure OpenAI credentials configured

## 🔐 Environment Variables

### Required Secrets for Edge Functions:
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
AZURE_OPENAI_ENDPOINT=https://your-resource-name.cognitiveservices.azure.com
AZURE_OPENAI_KEY=your-azure-openai-key-here
AZURE_OPENAI_DEPLOYMENT=your-deployment-name
```

### ⚠️ CRITICAL: Endpoint Format
- ✅ CORRECT: `https://your-resource-name.cognitiveservices.azure.com`
- ❌ WRONG: `https://artco-mem1xkia-eastus2.cognitiveservices.azure.com/openai/deployments/...`

**The Edge Functions will append the correct path automatically!**

## 🚀 Deployment Steps

### 1. Login to Supabase CLI
```bash
cd "/Users/anggiandriyana/Downloads/parenting ai/parenting-ai"
supabase login
```

### 2. Link to Project
```bash
supabase link --project-ref gbcxzkgzhylpbmzbymwj
```

### 3. Set Secrets (One-time Setup)
```bash
# Set Supabase secrets
supabase secrets set SUPABASE_URL=https://your-project.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Set Azure OpenAI secrets (BASE URL ONLY!)
supabase secrets set AZURE_OPENAI_ENDPOINT=https://your-resource-name.cognitiveservices.azure.com
supabase secrets set AZURE_OPENAI_KEY=your-azure-openai-key-here
supabase secrets set AZURE_OPENAI_DEPLOYMENT=your-deployment-name

# Optional: Simulation mode
supabase secrets set SIMULATE_OPENAI=0
```

### 4. Verify Secrets
```bash
supabase secrets list
```

### 5. Deploy Edge Functions
```bash
# Deploy both functions
supabase functions deploy generate-tip
supabase functions deploy chat

# Or deploy all at once
supabase functions deploy
```

## 🧪 Testing

### Test Generate Tip Function
```bash
curl -i --location --request POST 'https://gbcxzkgzhylpbmzbymwj.supabase.co/functions/v1/generate-tip' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"context": "Tips untuk bayi 6 bulan"}'
```

### Test Chat Function
```bash
curl -i --location --request POST 'https://gbcxzkgzhylpbmzbymwj.supabase.co/functions/v1/chat' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"message": "Bagaimana cara menenangkan bayi yang rewel?"}'
```

## 🔍 Troubleshooting

### Common Issues:

#### 1. "Model failed" Error
**Cause:** AZURE_OPENAI_ENDPOINT contains full URL with path instead of base URL
**Fix:** Update secret to base URL only:
```bash
supabase secrets set AZURE_OPENAI_ENDPOINT=https://your-resource.cognitiveservices.azure.com
```

#### 2. "Azure config missing" Error
**Cause:** Secrets not set in Supabase Dashboard
**Fix:** Run all `supabase secrets set` commands above

#### 3. "Unsupported parameter: 'max_tokens'" Error
**Cause:** Using old parameter name with newer Azure OpenAI models
**Fix:** Already fixed in code (using `max_completion_tokens`)

#### 4. "Authorization failed" Error
**Cause:** Invalid or missing Authorization header
**Fix:** Ensure you're passing valid Supabase auth token

### Check Function Logs
```bash
# Real-time logs
supabase functions logs generate-tip --follow
supabase functions logs chat --follow
```

### Test in Simulation Mode (No Azure Required)
```bash
supabase secrets set SIMULATE_OPENAI=1
# Then test - will return mock responses
```

## 📊 Current Status

### Edge Functions:
- ✅ `generate-tip` - Code updated with `max_completion_tokens`
- ✅ `chat` - Code updated with `max_completion_tokens`
- ✅ Both deployed to Supabase (version 9)

### Secrets Status:
- ⚠️ Need verification in Supabase Dashboard
- ⚠️ Ensure AZURE_OPENAI_ENDPOINT is base URL only
- ⚠️ All secrets must be set via CLI or Dashboard

### Next Steps:
1. ✅ Login to Supabase CLI
2. ✅ Link to project
3. ⏳ Set/verify all secrets
4. ⏳ Deploy functions
5. ⏳ Test functionality

## 🔗 Useful Links

- Supabase Dashboard: https://supabase.com/dashboard/project/gbcxzkgzhylpbmzbymwj
- Edge Functions Logs: https://supabase.com/dashboard/project/gbcxzkgzhylpbmzbymwj/functions
- Secrets Management: https://supabase.com/dashboard/project/gbcxzkgzhylpbmzbymwj/settings/vault/secrets

## 📝 Notes

- Edge Functions run in Deno runtime (not Node.js)
- Secrets are separate from local `.env` file
- Need to re-deploy after code changes
- Logs available in Supabase Dashboard
- Test locally with `supabase functions serve` before deploying

---

**Last Updated**: November 7, 2025
**Status**: Ready to deploy with correct secrets
