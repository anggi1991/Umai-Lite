# 🚀 Quick Setup Guide: Azure Assistant Integration

## ⚡ Quick Start (5 Minutes)

### Step 1: Copy Form Data
File `azure-assistant-form-data.json` berisi semua konfigurasi. Buka file dan copy data berikut ke Azure Portal:

```json
Agent ID: asst_YMKXI1FnSIwSDJvW9AWFFT8P
Agent Name: Umai Parenting Assistant
Model: gpt-4o (version: 2025-08-07)
Temperature: 0.7
Top P: 0.9
Max Tokens: 2000
```

### Step 2: Copy Instructions
Buka file `azure-assistant-form-data.json`, copy seluruh field **"instructions"** dan paste ke Azure Portal.

### Step 3: Deploy Edge Functions
```bash
cd /workspaces/parentingAI
./scripts/deploy-assistant-functions.sh
```

### Step 4: Run Migration
```bash
npx supabase db push
```

### Step 5: Configure Actions in Azure
Di Azure Portal → Assistants → Actions, tambahkan 4 actions dengan schema dari `azure-assistant-form-data.json`:
- get_child_profile
- get_growth_history
- get_activity_logs
- save_chat_context

---

## 📋 Form Field Mapping

### Basic Information Section
| Azure Form Field | Value dari JSON | Path |
|-----------------|----------------|------|
| Agent ID | `asst_YMKXI1FnSIwSDJvW9AWFFT8P` | `.assistant_configuration.agent_id` |
| Agent Name | `Umai Parenting Assistant` | `.assistant_configuration.agent_name` |
| Deployment | `gpt-4o (2025-08-07)` | `.assistant_configuration.deployment` |

### Instructions Section
Copy entire text from:
```json
.assistant_configuration.instructions
```
**Character count**: ~2,500 characters

### Agent Description
Copy from:
```json
.assistant_configuration.description
```

### Model Settings
| Field | Value | Path |
|-------|-------|------|
| Temperature | `0.7` | `.assistant_configuration.model_settings.temperature` |
| Top P | `0.9` | `.assistant_configuration.model_settings.top_p` |
| Max Completion Tokens | `2000` | `.assistant_configuration.model_settings.max_completion_tokens` |

---

## 📚 Knowledge Base Upload

Upload 5 PDF files (prepare these first):

1. **WHO Child Growth Standards** (`who_child_growth_standards.pdf`)
   - Download dari: https://www.who.int/tools/child-growth-standards
   - Size: ~5MB

2. **Milestone Development Guide** (`milestone_development_0_5_years.pdf`)
   - Create dari CDC Milestone Tracker atau AAP resources
   - Content: Motor skills, cognitive, social milestones untuk 0-5 tahun

3. **Indonesian Parenting Tips** (`indonesian_parenting_culture.pdf`)
   - Compile tips parenting lokal Indonesia
   - Include: MPASI recipes, traditional baby care, cultural practices

4. **Common Health Issues** (`common_baby_health_issues.pdf`)
   - Demam, pilek, diare, ruam - red flags dan kapan ke dokter
   - Bahasa Indonesia

5. **Nutrition Guide** (`baby_nutrition_guide_indonesia.pdf`)
   - MPASI guide lengkap
   - Nutrisi per age group

**Note**: Jika PDF belum siap, skip dulu. Assistant tetap bisa jalan tanpa knowledge base.

---

## 🔧 Actions Configuration

### Action 1: get_child_profile

**Name**: `get_child_profile`

**Description**: 
```
Fetch child profile data including name, birth_date, gender, and latest growth measurements from Supabase database
```

**Schema** (paste ke JSON schema field):
```json
{
  "type": "function",
  "function": {
    "name": "get_child_profile",
    "description": "Fetch child profile data from Supabase",
    "parameters": {
      "type": "object",
      "properties": {
        "child_id": {
          "type": "string",
          "description": "The unique identifier of the child"
        }
      },
      "required": ["child_id"]
    }
  }
}
```

**Endpoint URL**:
```
https://gbcxzkgzhylpbmzbymwj.supabase.co/functions/v1/get-child-data
```

**Authentication**: Bearer Token (Supabase Anon Key)

---

### Action 2: get_growth_history

**Name**: `get_growth_history`

**Description**: 
```
Fetch growth history (weight, height, head circumference) for the child to analyze growth trends
```

**Schema**:
```json
{
  "type": "function",
  "function": {
    "name": "get_growth_history",
    "description": "Fetch growth history for trend analysis",
    "parameters": {
      "type": "object",
      "properties": {
        "child_id": {
          "type": "string",
          "description": "The unique identifier of the child"
        },
        "limit": {
          "type": "number",
          "description": "Number of recent records to fetch (default: 10)",
          "default": 10
        }
      },
      "required": ["child_id"]
    }
  }
}
```

**Endpoint URL**:
```
https://gbcxzkgzhylpbmzbymwj.supabase.co/functions/v1/get-growth-history
```

---

### Action 3: get_activity_logs

**Name**: `get_activity_logs`

**Description**: 
```
Fetch recent activity logs (feeding, sleep, diaper changes) to provide context-aware recommendations
```

**Schema**:
```json
{
  "type": "function",
  "function": {
    "name": "get_activity_logs",
    "description": "Fetch activity logs for context",
    "parameters": {
      "type": "object",
      "properties": {
        "child_id": {
          "type": "string",
          "description": "The unique identifier of the child"
        },
        "activity_type": {
          "type": "string",
          "enum": ["feeding", "sleep", "diaper", "all"],
          "description": "Type of activity to fetch",
          "default": "all"
        },
        "days": {
          "type": "number",
          "description": "Number of days to look back (default: 7)",
          "default": 7
        }
      },
      "required": ["child_id"]
    }
  }
}
```

**Endpoint URL**:
```
https://gbcxzkgzhylpbmzbymwj.supabase.co/functions/v1/get-activity-logs
```

---

### Action 4: save_chat_context

**Name**: `save_chat_context`

**Description**: 
```
Save important context from the conversation for future learning and personalization
```

**Schema**:
```json
{
  "type": "function",
  "function": {
    "name": "save_chat_context",
    "description": "Save conversation context for learning",
    "parameters": {
      "type": "object",
      "properties": {
        "user_id": {
          "type": "string",
          "description": "The user's unique identifier"
        },
        "child_id": {
          "type": "string",
          "description": "The child's unique identifier"
        },
        "topic": {
          "type": "string",
          "description": "Main topic of the conversation"
        },
        "user_preference": {
          "type": "object",
          "description": "Detected user preferences"
        },
        "key_insights": {
          "type": "array",
          "items": {"type": "string"},
          "description": "Key insights detected"
        }
      },
      "required": ["user_id", "topic"]
    }
  }
}
```

**Endpoint URL**:
```
https://gbcxzkgzhylpbmzbymwj.supabase.co/functions/v1/save-chat-context
```

---

## ✅ Testing Actions

### Test get-child-data
```bash
curl -X POST https://gbcxzkgzhylpbmzbymwj.supabase.co/functions/v1/get-child-data \
  -H "Content-Type: application/json" \
  -d '{"child_id": "YOUR_CHILD_ID"}'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "Baby Name",
    "age": {
      "formatted": "8 bulan"
    },
    "latest_growth": {
      "weight": 8.5,
      "height": 70
    }
  }
}
```

---

## 🔗 Connected Agents (Optional)

Skip ini dulu jika belum siap. Bisa ditambahkan nanti setelah main assistant jalan.

---

## 🎯 Final Checklist

- [ ] Agent ID configured
- [ ] Agent Name set
- [ ] Deployment selected (gpt-4o)
- [ ] Instructions pasted (full text)
- [ ] Temperature = 0.7
- [ ] Top P = 0.9
- [ ] Max Tokens = 2000
- [ ] 4 Actions configured dengan schemas
- [ ] Action endpoints updated dengan URL yang benar
- [ ] Edge Functions deployed
- [ ] Migration run (assistant_learnings table created)
- [ ] Test 1 action endpoint berhasil
- [ ] Knowledge base uploaded (optional)

---

## 🚨 Common Issues

### Issue 1: Action endpoints return 404
**Solution**: Make sure Edge Functions sudah di-deploy:
```bash
./scripts/deploy-assistant-functions.sh
```

### Issue 2: Actions tidak dipanggil Assistant
**Solution**: Check schema JSON format - harus valid JSON. Test di jsonlint.com dulu.

### Issue 3: Assistant tidak use child data
**Solution**: Pastikan metadata `child_id` dikirim saat create message di thread.

---

## 📞 Support

Jika stuck, check:
1. `AZURE_ASSISTANT_CONFIG.md` - Full documentation
2. `azure-assistant-form-data.json` - Complete form data reference
3. Supabase logs: https://supabase.com/dashboard/project/gbcxzkgzhylpbmzbymwj/logs

---

**Setup Time**: ~15 minutes (tanpa knowledge base)
**Last Updated**: 2025-11-15
