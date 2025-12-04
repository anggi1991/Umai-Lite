# Supabase Edge Functions

This directory contains Deno-based Edge Functions for the Parenting AI application.

## 📁 Structure
```
supabase/functions/
├── chat/              # AI chat conversation handler
│   ├── index.ts
│   └── deno.json
├── generate-tip/      # Daily personalized parenting tips
│   ├── index.ts
│   ├── test_local.ts
│   ├── deno.json
│   └── README.md
└── TYPESCRIPT_LINTING.md  # Explains editor warnings
```

## 🚨 Important: TypeScript Editor Warnings

**You will see red squiggles** on Deno imports like:
```typescript
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
```

### ✅ This is NORMAL and SAFE TO IGNORE

- VS Code's TypeScript checker doesn't understand Deno's URL imports
- The code **runs perfectly** in Deno runtime
- Tests pass successfully
- Deployment works fine

📖 See [TYPESCRIPT_LINTING.md](./TYPESCRIPT_LINTING.md) for detailed explanation.

## 🛠️ Setup

### Install Deno (for local testing)
```bash
brew install deno
```

### Optional: Install Deno VS Code Extension
This will remove the red squiggles:
```bash
code --install-extension denoland.vscode-deno
```

## 🧪 Testing

Each function has its own test harness:

### Test generate-tip (with simulation)
```bash
cd supabase/functions/generate-tip
SIMULATE_OPENAI=1 deno run --allow-env --allow-net test_local.ts
```

### Test chat (requires Azure OpenAI credentials)
```bash
cd supabase/functions/chat
# Set env vars first
deno run --allow-env --allow-net test_local.ts
```

## 🚀 Deployment

```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy generate-tip
supabase functions deploy chat
```

## 📦 Environment Variables

Set these in Supabase Dashboard → Edge Functions → Secrets:

### Required for both functions:
- `AZURE_OPENAI_ENDPOINT`
- `AZURE_OPENAI_KEY`
- `AZURE_OPENAI_DEPLOYMENT`

### Auto-provided by Supabase:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## 📚 Documentation

- [generate-tip/README.md](./generate-tip/README.md) - Detailed docs for tip generation
- [TYPESCRIPT_LINTING.md](./TYPESCRIPT_LINTING.md) - Why editor shows errors

## 🔍 Debugging

### Local serve (requires Supabase CLI)
```bash
supabase functions serve function-name
```

### Check logs
```bash
supabase functions logs function-name
```

## 💡 Key Differences from Node.js

| Feature | Node.js | Deno (Edge Functions) |
|---------|---------|----------------------|
| Import | `require()` or local paths | URL imports |
| Runtime | V8 + Node APIs | Deno runtime |
| Package manager | npm/yarn | Direct URL imports |
| Config | `package.json` | `deno.json` |
| TypeScript | Needs compilation | Native support |

## ✨ Best Practices

1. **Export handlers** for testing (see generate-tip/index.ts)
2. **Use simulation mode** for local tests without API calls
3. **Add safety filters** for medical content
4. **Store metadata** in prompt fields for debugging
5. **Handle missing data** gracefully with fallbacks
