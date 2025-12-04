# 📱 Product Requirements Document (PRD)
## Parenting AI Assistant - AI Features Deep Dive

**Version:** 1.0.0  
**Date:** November 8, 2025  
**Status:** Implementation Phase  
**Document Owner:** Product & Engineering Team

---

## 1. AI Feature Overview

This PRD documents the **AI-powered features** that differentiate Parenting AI Assistant from competitors:

1. **AI Daily Tips** - Personalized parenting advice
2. **AI Chat Assistant** - 24/7 parenting coach
3. **AI Persona System** - Customizable AI personality
4. **Future AI Features** - Predictive analytics, voice assistant

---

## 2. AI Daily Tips Generator

### 2.1 User Stories

```gherkin
Feature: Daily Parenting Tips
  As a new mother
  I want to receive daily parenting tips for my 6-month-old
  So that I can learn age-appropriate care without searching

Scenario: Free user requests tip within daily limit
  Given I am a Free tier user
  And I have used 2 tips today
  When I tap "Dapatkan Tips" button
  Then I should see a personalized tip
  And my remaining tips should show "1/3"

Scenario: Free user exceeds daily limit
  Given I am a Free tier user
  And I have used 3 tips today
  When I tap "Dapatkan Tips" button
  Then I should see upgrade prompt
  And button should be disabled

Scenario: Premium user requests unlimited tips
  Given I am a Premium tier user
  When I tap "Dapatkan Tips" button multiple times
  Then I should always receive a new tip
  And no usage limit should be shown
```

### 2.2 Technical Specification

**Edge Function:** `supabase/functions/generate-tip/index.ts`

**Input:**
```typescript
interface TipRequest {
  child_id: string;
  user_id: string;
  force_category?: 'sleep' | 'feeding' | 'development' | 'health' | 'behavior';
}
```

**Output:**
```typescript
interface DailyTip {
  id: string;
  child_id: string;
  title: string;
  content: string; // Markdown supported
  category: string;
  age_range: string;
  created_at: string;
  model_used: string;
  tokens_used: number;
}
```

**AI Prompt Template:**
```
You are a compassionate parenting expert. Generate a tip for a {age_months}-month-old baby.

Context:
- Age: {age_months} months
- Recent activities: {activity_summary}
- Focus: {age_appropriate_topics}

Requirements:
- 2-3 paragraphs (150-200 words)
- Warm, encouraging tone
- Actionable advice
- Cite sources (WHO, AAP)
- No medical advice
- Bahasa Indonesia

Format:
{
  "title": "Short title",
  "content": "Full content",
  "category": "sleep|feeding|development|health|behavior"
}
```

---

## 3. AI Chat Assistant

### 3.1 User Stories

```gherkin
Feature: AI Parenting Chat
  As a parent at 2 AM
  I want to ask why my baby won't stop crying
  So that I can get immediate guidance

Scenario: User starts new chat session
  Given I am on the Chat screen
  When I tap "New Chat" button
  Then a new session should be created
  And I should see empty chat interface

Scenario: User sends message within limit
  Given I am a Free user with 3 messages remaining
  When I type "Why is my baby crying?" and send
  Then I should see typing indicator
  And receive AI response within 3 seconds
  And my remaining messages should show "2/10"

Scenario: User exceeds message limit
  Given I am a Free user with 0 messages remaining
  When I try to send a message
  Then input should be disabled
  And I should see upgrade CTA

Scenario: Emergency detected
  Given I send "My baby is choking!"
  Then AI should immediately respond:
  "🚨 Ini situasi darurat. Segera hubungi 119 atau bawa ke IGD terdekat."
```

### 3.2 AI Persona System

**4 Persona Options:**

| Persona | Tone | Response Style | Use Case |
|---------|------|----------------|----------|
| **Ramah** (Friendly) | Warm, casual, uses emojis 😊 | Conversational, like talking to a friend | Parents who want emotional support |
| **Profesional** (Professional) | Formal, evidence-based | Cites sources, clinical tone | Parents who want expert advice |
| **Motivasi** (Encouraging) | Positive, uplifting | Celebrates wins, motivational | Parents needing confidence boost |
| **Ringkas** (Concise) | Direct, to-the-point | Short answers, bullet points | Busy parents wanting quick info |

**Implementation:**
```typescript
const PERSONA_PROMPTS = {
  friendly: "Use warm, casual tone with emojis. Make them feel supported.",
  professional: "Use formal language and cite sources (WHO, AAP).",
  encouraging: "Focus on positive reinforcement and motivation.",
  concise: "Keep responses under 100 words. Use bullet points.",
}
```

### 3.3 Context Awareness

AI has access to:
1. **Child Data:**
   - Age in months
   - Gender (for pronoun usage)
   - Name (use in responses)
   
2. **Activity Summary (last 7 days):**
   - Feeding count
   - Average sleep duration
   - Diaper changes
   - Mood patterns
   
3. **Conversation History:**
   - Last 10 messages in session
   - Maintains context across questions

4. **User Preferences:**
   - Selected AI persona
   - Language preference

**Example Context Injection:**
```typescript
const systemPrompt = `
You are helping ${user.name} with their ${child.age_months}-month-old ${child.name}.

Recent patterns:
- Feeding: ${summary.feeding_count} times/week
- Sleep: ${summary.avg_sleep_hours} hours/day
- Mood: Mostly ${summary.dominant_mood}

Persona: ${PERSONA_PROMPTS[user.ai_persona]}

Previous conversation context:
${messages.slice(-10).map(m => `${m.role}: ${m.content}`).join('\n')}
`
```

---

## 4. Safety & Compliance

### 4.1 Medical Disclaimer

Every AI response must include:

**For general advice:**
> ⚠️ *Tips ini edukatif, bukan pengganti konsultasi medis. Konsultasikan dengan dokter anak untuk kondisi spesifik.*

**For medical questions:**
> 🏥 *Saya bukan dokter. Untuk diagnosis atau pengobatan, segera konsultasikan dengan dokter anak.*

**For emergencies:**
> 🚨 *Ini terdengar seperti situasi darurat. Segera hubungi 119 atau bawa ke IGD terdekat!*

### 4.2 Content Filters

**Prohibited Topics:**
- ❌ Medical diagnosis ("Your baby has...")
- ❌ Medication dosages ("Give 5mg of...")
- ❌ Treatment plans ("Do this for 10 days...")
- ❌ Emergency medical procedures (CPR, Heimlich)

**Allowed Topics:**
- ✅ General parenting advice
- ✅ Developmental milestones
- ✅ Activity suggestions
- ✅ Emotional support
- ✅ When to consult a doctor

**Emergency Detection Keywords:**
```typescript
const EMERGENCY_KEYWORDS = [
  'tersedak', 'choking', 'tidak bernapas', 'not breathing',
  'demam tinggi', 'high fever', 'kejang', 'seizure',
  'pingsan', 'unconscious', 'berdarah', 'bleeding',
  'keracunan', 'poisoning', 'muntah terus', 'vomiting'
]
```

If detected → Immediate emergency response with 119 hotline

### 4.3 Fallback Mechanisms

**If Azure OpenAI fails:**
1. **Simulation Mode:** Use pre-written responses
2. **Error Message:** "Layanan AI sedang tidak tersedia. Silakan coba lagi."
3. **Retry Logic:** 3 attempts with exponential backoff

**Pre-written Fallback Responses:**
```typescript
const FALLBACK_RESPONSES = {
  sleep: "Untuk masalah tidur, coba rutinitas tidur konsisten: mandi hangat, baca buku, dan kamar gelap. Hindari layar 1 jam sebelum tidur.",
  feeding: "Frekuensi makan bayi bervariasi. Usia 0-3 bulan: 8-12x/hari. 6-12 bulan: 4-6x/hari + MPASI. Ikuti isyarat lapar bayi.",
  crying: "Bayi menangis karena: lapar, popok basah, capek, tidak nyaman, atau butuh perhatian. Cek satu per satu dengan sabar.",
}
```

---

## 5. Usage Limits & Monetization

### 5.1 Feature Gating

| Feature | Free | Premium | Family |
|---------|------|---------|--------|
| Daily Tips | 3/day | Unlimited | Unlimited |
| Chat Messages | 10/day | Unlimited | Unlimited |
| Chat History | Last 7 days | Unlimited | Unlimited |
| AI Persona | ❌ Default only | ✅ 4 options | ✅ 4 options |
| Tip Categories | Random | ✅ Choose category | ✅ Choose category |

### 5.2 Upgrade Prompts

**When Free user hits limit:**

```typescript
<UpgradeModal>
  <Icon>🚀</Icon>
  <Title>Dapatkan Tips Tanpa Batas!</Title>
  <Description>
    Anda sudah mencapai batas harian. Upgrade ke Premium untuk:
    • Unlimited AI tips & chat
    • 4 pilihan AI persona
    • Pilih kategori tips
    • Tanpa iklan
  </Description>
  <PriceTag>Rp 29.000/bulan</PriceTag>
  <Buttons>
    <PrimaryButton>Mulai Free Trial 7 Hari</PrimaryButton>
    <SecondaryButton>Nanti Saja</SecondaryButton>
  </Buttons>
</UpgradeModal>
```

**Conversion Hooks:**
- Show after 3rd tip request (Free user)
- Show after 10th chat message (Free user)
- Show when user selects locked persona
- Show when user tries to filter tip categories

---

## 6. Analytics & Tracking

### 6.1 AI Usage Metrics

**Track these events:**
```typescript
// Daily Tips
trackEvent('ai_tip_generated', {
  child_id, category, age_months, tier,
  tokens_used, response_time_ms
})

trackEvent('ai_tip_limit_reached', {
  tier: 'free', tips_used_today: 3
})

trackEvent('ai_tip_shared', {
  platform: 'whatsapp' | 'instagram' | 'facebook'
})

// Chat
trackEvent('chat_session_started', {
  child_id, tier
})

trackEvent('chat_message_sent', {
  session_id, message_length, persona,
  tokens_used, response_time_ms
})

trackEvent('chat_limit_reached', {
  tier: 'free', messages_used_today: 10
})

trackEvent('emergency_detected', {
  keywords, response_time_ms
})

// Persona
trackEvent('ai_persona_changed', {
  from_persona, to_persona, tier
})
```

### 6.2 AI Quality Metrics

**Monitor these KPIs:**
- Average response time: <3 seconds
- Token usage per request: <500 tokens (tips), <200 tokens (chat)
- Error rate: <1%
- Fallback mode activations: <5%
- User satisfaction (thumbs up/down): >80% positive

**Cost Monitoring:**
- Daily Azure OpenAI spend
- Cost per user per month
- Average tokens per feature

---

## 7. Future AI Features (Roadmap)

### 7.1 Phase 3 (Months 3-6)

#### Predictive Sleep Analytics
**Description:** Analyze sleep patterns and predict optimal bedtime

**Features:**
- ML model trained on activity history
- Predicts best bedtime based on past 30 days
- Suggests optimal nap times
- Alerts when sleep pattern deviates

**Tech Stack:**
- TensorFlow.js for on-device ML
- Supabase for training data storage
- Push notifications for predictions

#### AI-Powered MPASI Planner
**Description:** Generate personalized meal plans for 6-12 month olds

**Features:**
- Age-appropriate recipes
- Allergy considerations
- Nutritional balance tracking
- Shopping list generation

**Integration:**
- Azure OpenAI for recipe generation
- Affiliate links to grocery delivery

### 7.2 Phase 4 (Months 7-12)

#### Voice Assistant Integration
**Description:** Voice-activated AI assistant for hands-free help

**Features:**
- "Hey Baby Buddy, why is my baby crying?"
- Voice-to-text input
- Text-to-speech responses
- Works while cooking, feeding, etc.

**Tech Stack:**
- Expo Speech (speech recognition)
- Azure Speech Services (TTS)
- Always-on listening (opt-in)

#### Growth Prediction Model
**Description:** Predict baby's growth trajectory using CDC charts

**Features:**
- Plot weight/height on growth chart
- Predict future growth percentiles
- Alert if deviating from normal range
- Suggest when to consult pediatrician

**Tech Stack:**
- Custom ML model (regression)
- CDC/WHO growth chart data
- Visualization with recharts

#### Community AI Moderation
**Description:** Auto-moderate community forum posts

**Features:**
- Detect spam, hate speech, medical misinformation
- Flag inappropriate content for review
- Suggest helpful resources based on post content

**Tech Stack:**
- Azure Content Moderator
- Custom NLP model for parenting context

---

## 8. Technical Architecture

### 8.1 System Diagram

```
┌─────────────┐
│  React      │
│  Native     │
│  App        │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│  Supabase Edge Functions    │
│  ┌──────────────────────┐   │
│  │  generate-tip        │   │
│  │  - Get child data    │   │
│  │  - Calculate summary │   │
│  │  - Call Azure OpenAI │   │
│  │  - Save to database  │   │
│  └──────────────────────┘   │
│  ┌──────────────────────┐   │
│  │  chat                │   │
│  │  - Load history      │   │
│  │  - Build context     │   │
│  │  - Call Azure OpenAI │   │
│  │  - Save message      │   │
│  └──────────────────────┘   │
└─────────────┬───────────────┘
              │
              ▼
      ┌───────────────┐
      │  Azure OpenAI │
      │  GPT-4o-mini  │
      └───────────────┘
              │
              ▼
      ┌───────────────┐
      │  Supabase     │
      │  PostgreSQL   │
      │  - daily_tips │
      │  - messages   │
      │  - sessions   │
      └───────────────┘
```

### 8.2 Database Schema

**Table: daily_tips**
```sql
CREATE TABLE daily_tips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('sleep', 'feeding', 'development', 'health', 'behavior')),
  age_range TEXT NOT NULL,
  model_used TEXT NOT NULL,
  tokens_used INTEGER,
  prompt_used TEXT,
  cost_cents INTEGER, -- in cents
  created_at TIMESTAMPTZ DEFAULT NOW(),
  helpful BOOLEAN, -- user feedback
  CONSTRAINT tips_user_child_fk FOREIGN KEY (user_id, child_id) REFERENCES user_children(user_id, child_id)
);

CREATE INDEX idx_tips_user_date ON daily_tips(user_id, created_at DESC);
CREATE INDEX idx_tips_child ON daily_tips(child_id);
```

**Table: chat_sessions**
```sql
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id UUID REFERENCES children(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT 'New Chat',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sessions_user ON chat_sessions(user_id, updated_at DESC);
```

**Table: messages**
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'assistant')),
  content TEXT NOT NULL,
  tokens_used INTEGER,
  model_used TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_session ON messages(session_id, created_at ASC);
```

### 8.3 Cost Management

**Azure OpenAI Pricing (GPT-4o-mini):**
- Input: $0.15 / 1M tokens
- Output: $0.60 / 1M tokens

**Average Usage:**
- Daily Tip: ~300 tokens (250 output + 50 input) = $0.00018
- Chat Message: ~150 tokens (100 output + 50 input) = $0.00009

**Monthly Cost Estimate:**
```
10,000 users:
- Tips: 10K users × 3 tips/day × 30 days × $0.00018 = $162
- Chat: 10K users × 5 messages/day × 30 days × $0.00009 = $135
Total: ~$300/month

25,000 users: ~$750/month
```

**Cost Optimization:**
- Cache common responses (e.g., "Why is my baby crying?")
- Use lower-cost model for simple queries
- Implement rate limiting (10 requests/minute per user)
- Monitor token usage per request

---

## 9. Testing & QA

### 9.1 Test Scenarios

**AI Tips:**
- ✅ Generate tip for 0-month-old (newborn)
- ✅ Generate tip for 6-month-old (MPASI stage)
- ✅ Generate tip for 18-month-old (toddler)
- ✅ Free user hits daily limit (3 tips)
- ✅ Premium user generates 10+ tips
- ✅ Tip includes disclaimer
- ✅ Fallback mode when API fails
- ✅ Response time <3 seconds

**AI Chat:**
- ✅ Start new chat session
- ✅ Send message and receive response
- ✅ Free user hits message limit (10/day)
- ✅ Premium user sends 50+ messages
- ✅ Emergency keyword detection
- ✅ Persona changes response tone
- ✅ Context maintained across messages
- ✅ Markdown rendering works

### 9.2 Quality Assurance

**Manual Review:**
- Review 100 random AI tips for quality
- Review 50 random chat conversations
- Check for inappropriate content
- Verify medical disclaimers present

**A/B Testing:**
- Test different prompt templates
- Test different personas
- Test response length (short vs detailed)
- Measure user satisfaction ratings

---

## 10. Success Metrics

### 10.1 Engagement Metrics

**Target KPIs (Month 3):**
- AI Tips generated: >10,000/month
- Chat messages sent: >15,000/month
- Average tips per user: >3/week
- Average chat sessions per user: >2/week
- AI feature usage rate: >60% of active users

### 10.2 Quality Metrics

**Target KPIs:**
- User satisfaction (helpful rating): >80%
- Response time: <3 seconds (95th percentile)
- Error rate: <1%
- Fallback mode usage: <5%
- Medical disclaimer presence: 100%

### 10.3 Business Metrics

**Target KPIs:**
- Conversion rate (AI-driven): >8% (vs 5% baseline)
- Upgrade triggered by AI limit: >30% of upgrades
- AI feature retention: >50% use AI weekly

---

**Document Version:** 1.0.0  
**Last Updated:** November 8, 2025  
**Next Review:** After beta launch feedback  
**Approval:** Product & Engineering Lead
