# 🚀 Edge Functions Deployment Guide

## ✅ Status: Edge Functions Deployed!

Kedua Edge Functions telah berhasil di-deploy ke Supabase project.

---

## 📦 Deployed Functions

### 1. `generate-tip` 
- **URL**: `https://gbcxzkgzhylpbmzbymwj.supabase.co/functions/v1/generate-tip`
- **Purpose**: Generate personalized parenting tips using Azure OpenAI
- **Features**:
  - Personalization based on child age and recent activities
  - Safety filters for medical content
  - Simulation mode for testing without Azure credits
  - CORS enabled for web/mobile access

### 2. `chat`
- **URL**: `https://gbcxzkgzhylpbmzbymwj.supabase.co/functions/v1/chat`
- **Purpose**: Real-time parenting Q&A chatbot
- **Features**:
  - Medical disclaimer for sensitive topics
  - Auto-create chat sessions
  - Message persistence
  - Simulation mode with keyword-based responses

---

## 🔐 Environment Variables (Supabase Secrets)

Edge Functions membutuhkan environment variables di Supabase Dashboard:

### Required for Production (Azure OpenAI):
```bash
AZURE_OPENAI_ENDPOINT=https://your-resource-name.cognitiveservices.azure.com
AZURE_OPENAI_KEY=your-azure-openai-key-here
AZURE_OPENAI_DEPLOYMENT=your-deployment-name
```

### Required for Functions:
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Optional (for testing without Azure):
```bash
SIMULATE_OPENAI=1
```

---

## 🎯 Setting Environment Variables

### Via Supabase Dashboard:
1. Go to: https://supabase.com/dashboard/project/gbcxzkgzhylpbmzbymwj/settings/functions
2. Scroll to **"Environment variables"** section
3. Add each variable:
   - Key: `AZURE_OPENAI_ENDPOINT`
   - Value: (paste value)
4. Click **"Save"**
5. **Redeploy functions** after adding secrets

### Via CLI (Alternative):
```bash
supabase secrets set AZURE_OPENAI_ENDPOINT=https://your-resource.cognitiveservices.azure.com --project-ref your-project-id
supabase secrets set AZURE_OPENAI_KEY=your_key_here --project-ref your-project-id
supabase secrets set AZURE_OPENAI_DEPLOYMENT=gpt-5-mini --project-ref your-project-id
```

---

## 🧪 Testing Edge Functions

### Test generate-tip:
```bash
curl -X POST \
  'https://gbcxzkgzhylpbmzbymwj.supabase.co/functions/v1/generate-tip' \
  -H 'Authorization: Bearer YOUR_USER_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"child_id": "uuid-here", "context": "Baby having sleep issues"}'
```

### Test chat:
```bash
curl -X POST \
  'https://gbcxzkgzhylpbmzbymwj.supabase.co/functions/v1/chat' \
  -H 'Authorization: Bearer YOUR_USER_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"message": "Bagaimana cara menenangkan bayi rewel?"}'
```

---

## 📱 Frontend Integration

Edge Functions sudah terintegrasi dengan services:

### `dailyTipsService.ts`:
```typescript
import { supabase } from './supabaseClient';

export const generateDailyTip = async (payload) => {
  const { data, error } = await supabase.functions.invoke('generate-tip', {
    body: payload,
  });
  if (error) throw error;
  return data;
};
```

### `chatService.ts`:
```typescript
export const sendMessage = async (sessionId, message, childId) => {
  const { data, error } = await supabase.functions.invoke('chat', {
    body: { session_id: sessionId, message, child_id: childId },
  });
  if (error) throw error;
  return data;
};
```

---

## 🔄 Redeployment

Jika ada perubahan code di Edge Functions:

```bash
# Set access token (use your Supabase access token)
export SUPABASE_ACCESS_TOKEN=your_access_token_here

# Deploy generate-tip
supabase functions deploy generate-tip --project-ref your-project-id

# Deploy chat
supabase functions deploy chat --project-ref your-project-id
```

---

## 🎨 UI Integration Status

### ✅ Dashboard "Dapatkan Tips" Button:
- Button sudah ada di Dashboard
- Connect ke `generateDailyTip()` service
- Menampilkan loading state
- Error handling dengan fallback

### 🔜 Chat Interface (Next):
- Create dedicated chat screen
- Use `chatService.ts`
- Real-time message display
- Session management

---

## 🐛 Troubleshooting

### Error: "Function not found"
✅ **Solusi**: 
- Pastikan functions sudah di-deploy
- Check di: https://supabase.com/dashboard/project/gbcxzkgzhylpbmzbymwj/functions

### Error: "Missing environment variables"
✅ **Solusi**:
- Set secrets di Dashboard → Settings → Functions
- Redeploy after setting secrets

### Error: "Model call failed"
✅ **Solusi**:
- Check Azure OpenAI credentials
- Verify deployment name is correct
- Try with `SIMULATE_OPENAI=1` for testing

### Slow response / Timeout
✅ **Solusi**:
- Edge Functions have cold start (~1-2s first call)
- Add loading state di UI
- Consider caching recent tips

---

## 📊 Monitoring & Logs

View function logs:
1. Go to: https://supabase.com/dashboard/project/gbcxzkgzhylpbmzbymwj/functions
2. Click on function name (generate-tip or chat)
3. View **"Logs"** tab untuk real-time execution logs

---

## 💰 Cost Considerations

### Azure OpenAI:
- gpt-5-mini: ~$0.03 per 1K tokens
- Estimate: 200 tokens per tip = $0.006 per tip
- 1000 users/day = ~$6/day

### Optimization:
- ✅ Cache daily tips (1 per user per day)
- ✅ Use simulation mode for development
- ✅ Limit tip generation frequency
- ✅ Set max_completion_tokens

---

## 🎉 Next Steps

1. ✅ **Deployment**: Edge Functions deployed
2. ✅ **Integration**: Services connected
3. 🔜 **Testing**: Test dari mobile app
4. 🔜 **UI**: Create chat screen
5. 🔜 **Monitoring**: Setup alerts for errors

---

**Happy Coding! 🚀**
