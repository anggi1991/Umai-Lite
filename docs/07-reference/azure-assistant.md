# Azure OpenAI Assistant Configuration untuk Umai

## 📋 Assistant Details

### Basic Information
- **Agent ID**: `asst_YMKXI1FnSIwSDJvW9AWFFT8P`
- **Agent Name**: `Umai Parenting Assistant`
- **Model**: `gpt-4o` (GPT-5 Mini - version: 2025-08-07)
- **Purpose**: AI parenting assistant dengan learning capability dari interaksi user

---

## 🎯 Instructions (System Prompt)

```
Anda adalah Umai (You + Me + AI), asisten parenting AI yang cerdas dan empatik dalam aplikasi Umai.

IDENTITAS:
- Nama: Umai
- Peran: Asisten parenting profesional dengan kemampuan learning
- Tujuan: Membantu orang tua Indonesia dalam perjalanan parenting mereka

KEMAMPUAN LEARNING:
- Pelajari pola pertanyaan user dari percakapan sebelumnya
- Adaptasi jawaban berdasarkan konteks profil anak (usia, nama, data pertumbuhan)
- Gunakan data historis untuk memberikan rekomendasi yang lebih personal
- Ingat preferensi komunikasi user (formal/casual, detail/ringkas)

ATURAN UTAMA:
1. SELALU gunakan data profil anak jika tersedia (nama, usia, berat, tinggi)
2. JANGAN tanya informasi yang sudah ada di database
3. Berikan jawaban spesifik sesuai usia anak, BUKAN jawaban umum
4. Fokus pada parenting anak usia 0-5 tahun (bayi dan balita)
5. Hindari diagnosis medis - arahkan ke dokter untuk masalah serius

GAYA KOMUNIKASI (adaptif berdasarkan persona):
- Friendly: Hangat, emoji, seperti teman dekat 🤗
- Professional: Formal, berbasis data dan bukti 👔
- Encouraging: Memotivasi, pujian, positif 💪
- Concise: Ringkas, bullet points, to-the-point 📝

FITUR APLIKASI YANG HARUS DIKETAHUI:
- Growth Tracker: Data berat, tinggi, lingkar kepala dengan WHO percentile
- Statistik: Tracking feeding, sleep, diaper activities
- Journal: Catatan harian aktivitas dan mood bayi
- Reminders: Pengingat feeding, sleep, immunisasi
- Media: Penyimpanan foto dan video milestone

BAHASA:
- Gunakan Bahasa Indonesia yang natural
- Sesuaikan formalitas dengan persona yang dipilih
- Gunakan istilah parenting yang umum di Indonesia

KEAMANAN:
- JANGAN memberikan diagnosis medis
- JANGAN rekomendasikan obat tanpa resep dokter
- SELALU sertakan disclaimer untuk masalah kesehatan serius
- Jaga privasi data anak dan keluarga

CONTOH RESPONS YANG BAIK:
User: "Anak saya 8 bulan, kapan bisa duduk sendiri?"
AI: "Halo! Berdasarkan data profil [Nama Anak] yang sekarang berusia 8 bulan, kebanyakan bayi mulai bisa duduk sendiri tanpa bantuan di usia 6-9 bulan. [Nama] sudah masuk window waktu yang tepat!

Tanda-tanda siap duduk sendiri:
✓ Bisa angkat kepala dengan kuat
✓ Mulai mencoba duduk dari posisi tengkurap
✓ Bisa balance saat didudukkan sebentar

Latihan yang bisa dicoba:
1. Dudukkan dengan bantal di sekelilingnya untuk safety
2. Letakkan mainan di depan untuk motivasi
3. Beri waktu tummy time 20-30 menit/hari

Dari data growth tracker, berat [Nama] [X] kg masih normal untuk usianya. Terus semangat latihan ya! 💪

⚠️ Jika [Nama] belum bisa duduk sama sekali di usia 10 bulan, konsultasi ke dokter anak untuk evaluasi."

LEARNING CAPABILITY:
- Simpan konteks: Jika user sering tanya tentang feeding, prioritaskan insight feeding
- Adaptasi tone: Jika user prefer jawaban singkat, berikan ringkasan
- Personalisasi: Gunakan nama anak dan referensi data sebelumnya
- Proaktif: Jika detect milestone akan datang, beri tips persiapan
```

---

## 📚 Knowledge Base

### 1. **WHO Child Growth Standards**
- Upload: `who_child_growth_standards.pdf`
- Konten: Growth charts untuk weight, height, head circumference (0-5 tahun)
- Purpose: Referensi untuk evaluasi pertumbuhan anak

### 2. **Milestone Development Guide**
- Upload: `milestone_development_0_5_years.pdf`
- Konten: Milestone perkembangan motorik, kognitif, sosial (0-5 tahun)
- Purpose: Panduan tahapan perkembangan normal

### 3. **Indonesian Parenting Tips**
- Upload: `indonesian_parenting_culture.pdf`
- Konten: Tips parenting sesuai budaya Indonesia, makanan tradisional bayi
- Purpose: Konteks lokal untuk rekomendasi

### 4. **Common Health Issues**
- Upload: `common_baby_health_issues.pdf`
- Konten: Demam, pilek, diare, ruam - kapan ke dokter
- Purpose: Panduan basic health untuk orang tua

### 5. **Nutrition Guide**
- Upload: `baby_nutrition_guide_indonesia.pdf`
- Konten: MPASI, jadwal makan, nutrisi penting per usia
- Purpose: Rekomendasi feeding yang tepat

---

## 🔧 Actions (Function Calling)

### Action 1: `get_child_profile`
**Purpose**: Ambil data profil anak dari Supabase

```typescript
{
  "name": "get_child_profile",
  "description": "Fetch child profile data including name, birth_date, gender, and latest growth measurements from Supabase database",
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
```

**Endpoint**: `https://[PROJECT-REF].supabase.co/functions/v1/get-child-data`

---

### Action 2: `get_growth_history`
**Purpose**: Ambil riwayat pertumbuhan anak

```typescript
{
  "name": "get_growth_history",
  "description": "Fetch growth history (weight, height, head circumference) for the child to analyze growth trends",
  "parameters": {
    "type": "object",
    "properties": {
      "child_id": {
        "type": "string",
        "description": "The unique identifier of the child"
      },
      "limit": {
        "type": "number",
        "description": "Number of recent records to fetch (default: 10)"
      }
    },
    "required": ["child_id"]
  }
}
```

**Endpoint**: `https://[PROJECT-REF].supabase.co/functions/v1/get-growth-history`

---

### Action 3: `get_activity_logs`
**Purpose**: Ambil log aktivitas harian (feeding, sleep, diaper)

```typescript
{
  "name": "get_activity_logs",
  "description": "Fetch recent activity logs (feeding, sleep, diaper changes) to provide context-aware recommendations",
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
        "description": "Type of activity to fetch"
      },
      "days": {
        "type": "number",
        "description": "Number of days to look back (default: 7)"
      }
    },
    "required": ["child_id"]
  }
}
```

**Endpoint**: `https://[PROJECT-REF].supabase.co/functions/v1/get-activity-logs`

---

### Action 4: `save_chat_context`
**Purpose**: Simpan konteks percakapan untuk learning

```typescript
{
  "name": "save_chat_context",
  "description": "Save important context from the conversation for future learning and personalization",
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
        "description": "Main topic of the conversation (e.g., 'feeding', 'sleep', 'milestone')"
      },
      "user_preference": {
        "type": "object",
        "description": "Detected user preferences (tone, detail level, etc.)"
      },
      "key_insights": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Key insights or patterns detected"
      }
    },
    "required": ["user_id", "topic"]
  }
}
```

**Endpoint**: `https://[PROJECT-REF].supabase.co/functions/v1/save-chat-context`

---

## 🔗 Connected Agents

### 1. **Medical Specialist Agent**
- **Agent ID**: `asst_MEDICAL_SPECIALIST`
- **Purpose**: Handle medical-related questions that need professional advice
- **Hand-off trigger**: User ask about serious symptoms, medication, diagnosis
- **Example**: "My baby has high fever for 3 days" → Transfer to Medical Agent

### 2. **Nutrition Expert Agent**
- **Agent ID**: `asst_NUTRITION_EXPERT`
- **Purpose**: Deep dive into nutrition, MPASI, allergies
- **Hand-off trigger**: Complex nutrition questions, meal planning, allergies
- **Example**: "Create 1-month MPASI menu for 6-month-old" → Transfer to Nutrition Agent

---

## ⚙️ Model Settings

```json
{
  "temperature": 0.7,
  "top_p": 0.9,
  "max_completion_tokens": 2000,
  "response_format": { "type": "text" }
}
```

**Penjelasan**:
- **Temperature 0.7**: Balance antara creativity dan consistency
  - 0.7 = Cukup kreatif untuk variasi jawaban, tapi tetap konsisten dengan facts
  - Tidak terlalu rendah (robotic) atau terlalu tinggi (unpredictable)

- **Top P 0.9**: Fokus pada token dengan probabilitas tinggi
  - 0.9 = Lebih fokus, menghindari jawaban yang terlalu random

- **Max Completion Tokens 2000**: Cukup untuk jawaban detail
  - 2000 tokens ≈ 1500 words = Cukup untuk penjelasan lengkap + contoh

---

## 🔄 Integrasi dengan Supabase Edge Function

### Update Edge Function untuk menggunakan Assistant API

```typescript
// supabase/functions/chat/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const ASSISTANT_ID = 'asst_YMKXI1FnSIwSDJvW9AWFFT8P'

serve(async (req) => {
  const { message, child_id, ai_persona, session_id } = await req.json()
  
  // 1. Create thread (or use existing)
  let threadId = session_id
  if (!threadId) {
    const threadResp = await fetch(
      `${AZURE_ENDPOINT}/openai/threads?api-version=2024-08-01`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': AZURE_KEY
        }
      }
    )
    const thread = await threadResp.json()
    threadId = thread.id
  }
  
  // 2. Add message to thread
  await fetch(
    `${AZURE_ENDPOINT}/openai/threads/${threadId}/messages?api-version=2024-08-01`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': AZURE_KEY
      },
      body: JSON.stringify({
        role: 'user',
        content: message,
        metadata: {
          child_id,
          ai_persona
        }
      })
    }
  )
  
  // 3. Run assistant
  const runResp = await fetch(
    `${AZURE_ENDPOINT}/openai/threads/${threadId}/runs?api-version=2024-08-01`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': AZURE_KEY
      },
      body: JSON.stringify({
        assistant_id: ASSISTANT_ID,
        stream: true
      })
    }
  )
  
  // 4. Stream response
  return new Response(runResp.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Access-Control-Allow-Origin': '*'
    }
  })
})
```

---

## 📊 Learning & Analytics

### Data yang Disimpan untuk Learning:
1. **User Preferences**
   - Preferred AI persona
   - Response length preference (short/detailed)
   - Common topics asked

2. **Child Context**
   - Age-specific questions patterns
   - Growth concerns
   - Development milestones tracking

3. **Interaction Patterns**
   - Time of day when asking questions
   - Frequency of certain topics
   - Follow-up questions

### Supabase Table: `assistant_learnings`
```sql
CREATE TABLE assistant_learnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  child_id UUID REFERENCES children(id),
  conversation_topic TEXT,
  user_preference JSONB,
  key_insights TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🚀 Setup Steps

### 1. Create Assistant di Azure Portal
```bash
# Gunakan Azure CLI atau Portal
az cognitiveservices account create \
  --name umai-assistant \
  --resource-group umai-rg \
  --kind OpenAI \
  --sku S0 \
  --location eastus
```

### 2. Upload Knowledge Base Files
- Login ke Azure OpenAI Studio
- Navigate ke Assistants → Knowledge
- Upload 5 PDF files yang sudah disiapkan

### 3. Configure Actions
- Setup 4 Edge Functions untuk data fetching
- Register function schemas di Assistant

### 4. Update Environment Variables
```env
AZURE_ASSISTANT_ID=asst_YMKXI1FnSIwSDJvW9AWFFT8P
AZURE_ASSISTANT_ENDPOINT=https://your-resource.openai.azure.com
AZURE_ASSISTANT_KEY=your-api-key
```

### 5. Deploy Updated Edge Function
```bash
npx supabase functions deploy chat
```

---

## 🧪 Testing

### Test Case 1: Basic Chat
```json
{
  "message": "Anak saya 8 bulan, kapan bisa jalan?",
  "child_id": "123e4567-e89b-12d3-a456-426614174000",
  "ai_persona": "friendly"
}
```

Expected: Jawaban dengan nama anak, data usia, milestone prediction

### Test Case 2: Learning Context
```json
{
  "message": "Gimana cara mengatasi GTM?",
  "child_id": "123e4567-e89b-12d3-a456-426614174000",
  "ai_persona": "concise"
}
```

Expected: Ringkas, bullet points, sesuai persona

---

## 📈 Benefits

✅ **Learning Capability**: Assistant API menyimpan context dan bisa learn dari interaksi
✅ **Function Calling**: Bisa fetch data real-time dari Supabase
✅ **Knowledge Base**: Akses ke WHO standards dan parenting guides
✅ **Scalable**: Bisa add more assistants untuk specialized tasks
✅ **Cost Effective**: Only pay for tokens used, assistant context stored for free

---

## 📝 Next Steps

1. ✅ Configure Assistant di Azure Portal dengan settings di atas
2. ⏳ Upload knowledge base PDFs
3. ⏳ Create 4 Edge Functions untuk actions
4. ⏳ Update main chat Edge Function untuk gunakan Assistant API
5. ⏳ Test streaming response
6. ⏳ Monitor learning patterns dan adjust instructions

---

**Created**: 2025-11-15
**Last Updated**: 2025-11-15
**Status**: Ready for Implementation
