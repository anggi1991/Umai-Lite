# 🔄 User Flow Documentation
## Parenting AI Assistant

**Version:** 1.0.0  
**Date:** November 8, 2025  
**Document Type:** User Journey & Flow Diagrams  
**Status:** Complete

---

## 1. Primary User Flows

### 1.1 Onboarding Flow (New User)

```
┌─────────────────┐
│  Splash Screen  │
│  (2 seconds)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Welcome Screen │
│  • App intro    │
│  • Key features │
│  • [Mulai]      │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  Sign Up / Sign In      │
│  • Email + Password     │
│  • [or] Google Sign-In  │
│  • [or] Apple Sign-In   │
│  • Terms acceptance ☑   │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Add First Child        │
│  • Name *required       │
│  • Birth date *required │
│  • Gender (optional)    │
│  • Photo (optional)     │
│  • [Simpan]             │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Notification Permission│
│  "Izinkan notifikasi    │
│  untuk reminder?"       │
│  [Izinkan] [Nanti Saja] │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Trial Offer (Optional) │
│  "Coba Premium GRATIS   │
│  7 hari!"               │
│  [Mulai Trial] [Lewati] │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  🎉 Welcome to         │
│  Dashboard!             │
│  (Auto-generate 1st tip)│
└─────────────────────────┘
```

**Key Decision Points:**
1. **Auth Method:** Email vs Google vs Apple
2. **Notification:** Allow vs Skip (can enable later)
3. **Trial:** Start vs Skip (impacts conversion)

**Analytics Events:**
```typescript
trackEvent('onboarding_started')
trackEvent('auth_method_selected', { method: 'google' })
trackEvent('first_child_added', { age_months: 6 })
trackEvent('notification_permission', { granted: true })
trackEvent('trial_started', { tier: 'premium' })
trackEvent('onboarding_completed', { duration_seconds: 120 })
```

---

### 1.2 Dashboard Flow (Daily Use)

```
┌──────────────────────────────────────┐
│          Dashboard Home              │
│                                      │
│  👋 Hi, Mama Sarah!                  │
│  ┌──────────────────────────────┐   │
│  │  Baby: Aisha (6 months) ▼    │   │
│  └──────────────────────────────┘   │
│                                      │
│  ┌──────────────────────────────┐   │
│  │ 📊 Today's Summary           │   │
│  │ 🍼 5 feedings  💤 12h sleep  │   │
│  │ 👶 4 diapers   😊 Happy mood │   │
│  └──────────────────────────────┘   │
│                                      │
│  ┌──────────────────────────────┐   │
│  │ 💡 Tips Hari Ini             │   │
│  │ "Cara Memulai MPASI 6 Bulan" │   │
│  │ Bayi 6 bulan siap MPASI...   │   │
│  │ [Baca Selengkapnya]          │   │
│  └──────────────────────────────┘   │
│                                      │
│  Quick Add:                          │
│  [🍼] [💤] [👶] [😊] [📏]          │
│                                      │
│  📋 Recent Activities                │
│  • 14:30 - Feeding (30 min)         │
│  • 12:00 - Sleep (2 hours)          │
│  • 10:30 - Diaper change            │
│                                      │
│  [+ Tambah Aktivitas]                │
│  [📈 Lihat Grafik]                   │
│                                      │
│  Bottom Navigation:                  │
│  [🏠 Home] [💬 Chat] [📸] [⚙️]    │
└──────────────────────────────────────┘
```

**User Actions:**
1. **Quick Add Activity** → Opens modal
2. **Read Full Tip** → Opens detail screen
3. **Get More Tips** → Generates new tip (Free: 3/day limit)
4. **View Charts** → Navigate to Activity History
5. **Start Chat** → Navigate to AI Chat
6. **Switch Child** → Dropdown selector

**Analytics Events:**
```typescript
trackEvent('dashboard_viewed', { child_id, tier })
trackEvent('quick_add_tapped', { activity_type: 'feeding' })
trackEvent('tip_read', { tip_id, category: 'feeding' })
trackEvent('get_tip_tapped', { remaining_tips: 2 })
```

---

### 1.3 Activity Tracking Flow

```
Dashboard
   │
   ▼ [Quick Add: 🍼 Feeding]
┌──────────────────────────┐
│  Add Activity Modal      │
│                          │
│  Activity Type:          │
│  [🍼 Feeding] selected   │
│                          │
│  Start Time:             │
│  [14:30] (time picker)   │
│                          │
│  Duration:               │
│  [30 minutes] (slider)   │
│                          │
│  Feeding Type:           │
│  ○ Breastfeeding         │
│  ● Bottle (Formula)      │
│  ○ MPASI                 │
│                          │
│  Amount:                 │
│  [120 ml] (optional)     │
│                          │
│  Notes:                  │
│  [Baby seemed hungry...] │
│                          │
│  [Cancel] [Simpan]       │
└─────────┬────────────────┘
          │
          ▼
    ┌─────────────┐
    │ Saving...   │
    └─────────────┘
          │
          ▼
    ┌─────────────┐
    │ ✅ Success! │
    │ Activity    │
    │ saved!      │
    └─────────────┘
          │
          ▼
    Back to Dashboard
    (Updated summary)
          │
          ▼ [FREE USER, 5th activity]
    ┌──────────────────┐
    │ Interstitial Ad  │
    │ (Skip in 5s)     │
    └──────────────────┘
```

**Type-Specific Fields:**

**Feeding:**
- Type: Breastfeeding / Bottle / MPASI
- Amount (ml)
- Side (left/right breast)

**Sleep:**
- Start time
- End time (or duration)
- Location (crib, carrier, bed)

**Diaper:**
- Type: Wet / Dirty / Both
- Notes (color, consistency)

**Mood:**
- Mood: Happy / Calm / Fussy / Crying
- Notes (what triggered)

**Growth:**
- Weight (kg)
- Height (cm)
- Head circumference (cm)

**Analytics Events:**
```typescript
trackEvent('activity_modal_opened', { type: 'feeding' })
trackEvent('activity_saved', { type, duration, has_notes })
trackEvent('interstitial_ad_shown', { activity_count_today: 5 })
```

---

### 1.4 AI Tips Flow

```
Dashboard
   │
   ▼ [Dapatkan Tips]
┌──────────────────────┐
│ Checking limits...   │
└──────────┬───────────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
FREE USER     PREMIUM USER
(2/3 used)    (unlimited)
    │             │
    ▼             │
┌────────────┐    │
│ Generating │◄───┘
│ tip...     │
│ [AI icon]  │
└─────┬──────┘
      │
      ▼
┌──────────────────────────────┐
│  Daily Tip Detail            │
│                              │
│  💡 Cara Memulai MPASI       │
│  🏷️ Feeding • 6-12 months    │
│                              │
│  Bayi berusia 6 bulan sudah  │
│  siap untuk MPASI. Berikut   │
│  panduan memulai...          │
│                              │
│  **Langkah Pertama:**        │
│  1. Pilih waktu yang tepat   │
│  2. Tekstur lembut dulu      │
│  3. Satu jenis makanan       │
│                              │
│  ⚠️ Tips ini edukatif...     │
│                              │
│  [👍 Berguna] [👎]           │
│  [Bagikan 📤]                │
│  [Lihat Tips Lain]           │
└──────────────────────────────┘
      │
      ▼ [Lihat Tips Lain]
    (Free user, 3rd tip)
┌──────────────────────────────┐
│  ⚠️ Limit Reached            │
│                              │
│  Anda sudah mencapai batas   │
│  harian (3 tips).            │
│                              │
│  🚀 Upgrade ke Premium:      │
│  • Unlimited AI tips         │
│  • Unlimited chat            │
│  • No ads                    │
│                              │
│  Rp 29.000/bulan             │
│                              │
│  [Mulai Free Trial 7 Hari]   │
│  [Nanti Saja]                │
└──────────────────────────────┘
```

**Share Flow:**
```
[Bagikan] button
   │
   ▼
┌──────────────────┐
│ Share to:        │
│ • WhatsApp       │
│ • Instagram      │
│ • Facebook       │
│ • Copy Link      │
└──────────────────┘
   │
   ▼
Share with text:
"Tips parenting dari Parenting AI:
[Tip Title]
[Tip Content snippet...]

Coba juga: parentingai.app/ref/ABC123"
```

**Analytics Events:**
```typescript
trackEvent('tip_generated', { category, age_months, tier })
trackEvent('tip_limit_reached', { tier: 'free', tips_used: 3 })
trackEvent('upgrade_modal_shown', { source: 'tip_limit' })
trackEvent('tip_shared', { platform: 'whatsapp' })
trackEvent('tip_rated', { helpful: true })
```

---

### 1.5 AI Chat Flow

```
Bottom Nav: [💬 Chat]
   │
   ▼
┌──────────────────────────────┐
│  Chat Sessions List          │
│                              │
│  [+ New Chat]                │
│                              │
│  Recent Chats:               │
│  ┌────────────────────────┐  │
│  │ 💬 Why baby won't sleep│  │
│  │ 2 hours ago            │  │
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │ 💬 MPASI recipes       │  │
│  │ Yesterday              │  │
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │ 💬 Teething relief     │  │
│  │ 3 days ago             │  │
│  └────────────────────────┘  │
└──────────────────────────────┘
   │
   ▼ [+ New Chat]
┌──────────────────────────────┐
│  Chat with AI                │
│  About: Aisha (6 months) ▼   │
│  Messages: 3/10 today 🆓     │
│                              │
│  ┌────────────────────────┐  │
│  │ 🤖 AI Baby Buddy       │  │
│  │ Halo! Ada yang bisa    │  │
│  │ saya bantu hari ini?   │  │
│  │ 10:30                  │  │
│  └────────────────────────┘  │
│                              │
│  ┌────────────────────────┐  │
│  │         Kenapa bayi    │  │
│  │         saya sering    │  │
│  │         terbangun      │  │
│  │         malam?         │  │
│  │                 10:31  │  │
│  └────────────────────────┘  │
│                              │
│  [AI typing...]              │
│                              │
│  ┌────────────────────────┐  │
│  │ 🤖 AI Baby Buddy       │  │
│  │ Bayi 6 bulan seperti   │  │
│  │ Aisha sering terbangun │  │
│  │ karena:                │  │
│  │ 1. **Sleep regression**│  │
│  │ 2. **Lapar**           │  │
│  │ 3. **Tumbuh gigi**     │  │
│  │                        │  │
│  │ Tips: Coba rutinitas   │  │
│  │ tidur konsisten...     │  │
│  │                        │  │
│  │ ⚠️ Bukan saran medis   │  │
│  │ 10:31                  │  │
│  └────────────────────────┘  │
│                              │
│  ┌────────────────────────┐  │
│  │ Type your message...   │  │
│  │                   [▶️] │  │
│  └────────────────────────┘  │
└──────────────────────────────┘
   │
   ▼ [User sends 10th message]
┌──────────────────────────────┐
│  ⚠️ Daily Limit Reached      │
│                              │
│  Anda sudah mencapai batas   │
│  10 pesan hari ini.          │
│                              │
│  🎁 Opsi:                    │
│  1. Nonton iklan → 3 pesan   │
│     bonus                    │
│  2. Upgrade ke Premium →     │
│     unlimited chat           │
│                              │
│  [Nonton Iklan] [Upgrade]    │
└──────────────────────────────┘
   │
   ▼ [Nonton Iklan]
┌──────────────────────────────┐
│  Rewarded Ad                 │
│  (30 seconds video)          │
│  Skip in 27s...              │
└──────────────────────────────┘
   │
   ▼
┌──────────────────────────────┐
│  ✅ Bonus Granted!           │
│  +3 pesan untuk hari ini     │
│  [Lanjutkan Chat]            │
└──────────────────────────────┘
```

**Analytics Events:**
```typescript
trackEvent('chat_session_started', { child_id, tier })
trackEvent('chat_message_sent', { session_id, message_count: 5 })
trackEvent('chat_limit_reached', { tier: 'free' })
trackEvent('rewarded_ad_watched', { reward: '3_messages' })
trackEvent('upgrade_modal_shown', { source: 'chat_limit' })
```

---

### 1.6 Subscription Flow

```
Upgrade CTA (any screen)
   │
   ▼
┌──────────────────────────────┐
│  Choose Your Plan            │
│                              │
│  ┌────────────────────────┐  │
│  │ FREE ✅ Current        │  │
│  │ Rp 0/bulan             │  │
│  │ • 3 tips/day           │  │
│  │ • 10 chat/day          │  │
│  │ • With ads             │  │
│  └────────────────────────┘  │
│                              │
│  ┌────────────────────────┐  │
│  │ PREMIUM ⭐             │  │
│  │ Rp 29,000/bulan        │  │
│  │ • Unlimited tips       │  │
│  │ • Unlimited chat       │  │
│  │ • No ads               │  │
│  │ • AI persona           │  │
│  │ [7 Hari Gratis]        │  │
│  └────────────────────────┘  │
│                              │
│  ┌────────────────────────┐  │
│  │ FAMILY 👨‍👩‍👧‍👦         │  │
│  │ Rp 49,000/bulan        │  │
│  │ • All Premium          │  │
│  │ • Up to 3 children     │  │
│  │ • Family sharing       │  │
│  │ [7 Hari Gratis]        │  │
│  └────────────────────────┘  │
│                              │
│  [Bandingkan Fitur]          │
└──────────────────────────────┘
   │
   ▼ [7 Hari Gratis - Premium]
┌──────────────────────────────┐
│  Start Free Trial            │
│                              │
│  You'll get 7 days FREE      │
│  Then Rp 29,000/month        │
│                              │
│  Cancel anytime              │
│                              │
│  ✓ Unlimited AI tips         │
│  ✓ Unlimited chat            │
│  ✓ No ads                    │
│  ✓ AI persona customization  │
│                              │
│  [Continue with Apple Pay]   │
│  [Continue with Google Pay]  │
│                              │
│  By continuing, you agree to │
│  Terms & Conditions          │
└──────────────────────────────┘
   │
   ▼
┌──────────────────────────────┐
│  Processing payment...       │
│  [Loading spinner]           │
└──────────────────────────────┘
   │
   ▼
┌──────────────────────────────┐
│  🎉 Welcome to Premium!      │
│                              │
│  Your 7-day free trial       │
│  has started!                │
│                              │
│  Enjoy unlimited:            │
│  ✓ AI tips                   │
│  ✓ Chat messages             │
│  ✓ Ad-free experience        │
│                              │
│  [Jelajahi Fitur Premium]    │
└──────────────────────────────┘
```

**Analytics Events:**
```typescript
trackEvent('pricing_page_viewed', { source: 'tip_limit' })
trackEvent('plan_selected', { plan: 'premium', trial: true })
trackEvent('payment_initiated', { plan, amount: 29000 })
trackEvent('subscription_purchased', { 
  plan, trial_duration: 7, payment_method: 'apple_pay' 
})
trackEvent('subscription_activated', { 
  plan, tier_changed_from: 'free' 
})
```

---

### 1.7 Referral Flow

```
Settings → [Ajak Teman]
   │
   ▼
┌──────────────────────────────┐
│  Refer a Friend              │
│                              │
│  🎁 Dapatkan 1 bulan         │
│  Premium GRATIS!             │
│                              │
│  Your referral code:         │
│  ┌────────────────────────┐  │
│  │  SARAH2025            │  │
│  │  [Copy]               │  │
│  └────────────────────────┘  │
│                              │
│  Share via:                  │
│  [WhatsApp] [Instagram]      │
│  [Facebook] [Copy Link]      │
│                              │
│  How it works:               │
│  1. Teman daftar pakai kode  │
│  2. Mereka dapat trial 7 hr  │
│  3. Kamu dapat 1 bln gratis  │
│                              │
│  Referrals: 2                │
│  Rewards earned: 2 months    │
└──────────────────────────────┘
   │
   ▼ [Share via WhatsApp]
┌──────────────────────────────┐
│  WhatsApp Message            │
│                              │
│  Halo! Aku pakai app keren   │
│  buat tracking baby 👶       │
│                              │
│  Parenting AI Assistant:     │
│  • AI tips harian            │
│  • Chat dengan AI coach      │
│  • Tracking lengkap          │
│                              │
│  Download pakai kodeku:      │
│  SARAH2025                   │
│                              │
│  Kamu dapat trial 7 hari     │
│  GRATIS! 🎁                  │
│                              │
│  Link: parentingai.app/      │
│  ref/SARAH2025               │
│                              │
│  [Send]                      │
└──────────────────────────────┘
```

**New User with Referral:**
```
Klik link referral
   │
   ▼
App install / Open
   │
   ▼
┌──────────────────────────────┐
│  Welcome!                    │
│                              │
│  🎁 You've been invited by   │
│  Sarah                       │
│                              │
│  Get 7-day Premium trial     │
│  (instead of 3 days)         │
│                              │
│  [Sign Up to Claim]          │
└──────────────────────────────┘
   │
   ▼
Sign up process
   │
   ▼
Trial activated (7 days)
Referrer gets 1 month free
```

**Analytics Events:**
```typescript
trackEvent('referral_page_viewed')
trackEvent('referral_code_copied', { code: 'SARAH2025' })
trackEvent('referral_link_shared', { platform: 'whatsapp' })
trackEvent('referral_signup', { 
  referrer_id, referred_id, code: 'SARAH2025' 
})
trackEvent('referral_reward_granted', { 
  user_id, reward_months: 1 
})
```

---

## 2. Edge Case Flows

### 2.1 No Internet Connection

```
User tries to load Dashboard
   │
   ▼
┌──────────────────────────────┐
│  ⚠️ No Internet Connection   │
│                              │
│  You're offline. Some        │
│  features are limited:       │
│                              │
│  ✅ View saved activities    │
│  ✅ Add activities (sync     │
│      later)                  │
│  ❌ AI tips                  │
│  ❌ Chat                     │
│  ❌ Cloud sync               │
│                              │
│  [Retry] [Continue Offline]  │
└──────────────────────────────┘
```

### 2.2 API Error (Azure OpenAI Down)

```
User requests AI tip
   │
   ▼
Try Azure OpenAI (3 attempts)
   │
   ▼ All failed
┌──────────────────────────────┐
│  ⚠️ Service Temporarily      │
│  Unavailable                 │
│                              │
│  AI service is experiencing  │
│  issues. Using cached tips:  │
│                              │
│  [Show cached tip]           │
│                              │
│  Or try again later          │
│  [Retry]                     │
└──────────────────────────────┘
```

### 2.3 Emergency Detected in Chat

```
User: "Bayi saya tersedak!"
   │
   ▼
Keyword detection: "tersedak"
   │
   ▼
┌──────────────────────────────┐
│  🚨 EMERGENCY DETECTED       │
│                              │
│  Ini terdengar seperti       │
│  situasi darurat!            │
│                              │
│  SEGERA:                     │
│  1. Call 119 (Emergency)     │
│  2. Bawa ke IGD terdekat     │
│                              │
│  [📞 Call 119]               │
│  [🏥 Find Nearest Hospital]  │
│                              │
│  Jangan mengandalkan AI      │
│  untuk kondisi darurat!      │
└──────────────────────────────┘
```

---

## 3. Conversion Funnel

```
App Install (100%)
   │
   ▼
Sign Up (70%)
   │
   ▼
Add Child Profile (60%)
   │
   ▼
Log First Activity (50%)
   │
   ▼
View AI Tip (40%)
   │
   ▼
Use Chat (30%)
   │
   ▼
Hit Free Limit (20%)
   │
   ▼
View Pricing (10%)
   │
   ▼
Start Trial (7%)
   │
   ▼
Convert to Paid (5%)
```

**Optimization Points:**
1. **Onboarding (70% → 80%):** Simplify signup, social login priority
2. **Profile Creation (60% → 75%):** Pre-fill DOB from dropdown, skip optional fields
3. **First Activity (50% → 65%):** In-app tutorial, quick add prompts
4. **AI Engagement (40% → 55%):** Auto-generate first tip, chat prompts
5. **Limit Awareness (20% → 30%):** Show counter earlier, value messaging
6. **Trial Start (7% → 10%):** Optimize CTA copy, social proof, urgency

---

## 4. Key Screens Wireframes

### 4.1 Dashboard (Annotated)

```
┌────────────────────────────────────────┐
│ ⚙️                            sarah@… │ Header
├────────────────────────────────────────┤
│ 👋 Hi, Mama Sarah!                     │ Greeting
│ ┌──────────────────────────────────┐   │
│ │ Baby: Aisha (6 months) ▼        │   │ Child Selector
│ └──────────────────────────────────┘   │
│                                        │
│ ┌──────────────────────────────────┐   │
│ │ 📊 Today's Summary               │   │ Activity Stats
│ │ 🍼 5 feedings  💤 12h sleep      │   │
│ │ 👶 4 diapers   😊 Happy mood     │   │
│ │ [Lihat Detail]                   │   │
│ └──────────────────────────────────┘   │
│                                        │
│ ┌──────────────────────────────────┐   │
│ │ 💡 Tips Hari Ini                 │   │ AI Tip Card
│ │ "Cara Memulai MPASI 6 Bulan"     │   │
│ │ Bayi 6 bulan siap MPASI. Mulai   │   │
│ │ dengan tekstur halus...           │   │
│ │ [Baca Selengkapnya]              │   │
│ │                                  │   │
│ │ [Dapatkan Tips Lagi] 2/3 🆓     │   │ Usage Counter
│ └──────────────────────────────────┘   │
│                                        │
│ Quick Add:                             │ Action Chips
│ [🍼] [💤] [👶] [😊] [📏]             │
│                                        │
│ 📋 Recent Activities                   │ Activity List
│ • 14:30 - Feeding (30 min)            │
│ • 12:00 - Sleep (2 hours)             │
│ • 10:30 - Diaper change               │
│ [Lihat Semua]                          │
│                                        │
│ [+ Tambah Aktivitas]                   │ Primary CTA
│ [📈 Lihat Grafik]                      │ Secondary CTA
├────────────────────────────────────────┤
│ [🏠] [💬] [📸] [⚙️]                  │ Bottom Nav
└────────────────────────────────────────┘
```

**Interaction Notes:**
- Tap child selector → Switch between children
- Swipe tip card → See next tip
- Tap quick add icon → Open activity modal
- Pull down → Refresh data

---

## 5. Analytics Dashboard (For Product Team)

### 5.1 Funnel Visualization

```
Acquisition → Activation → Engagement → Monetization → Retention

[1000 users]
    ↓ 70%
[700 signup]
    ↓ 60%
[420 add child]
    ↓ 50%
[210 log activity]
    ↓ 40%
[84 use AI]
    ↓ 20%
[17 hit limit]
    ↓ 10%
[2 view pricing]
    ↓ 50%
[1 subscribe] ← 0.1% overall conversion
```

**Improvement Opportunities:**
- **Biggest drop: Signup → Profile (70% → 60%)**
  - Simplify form
  - Allow skip and complete later
  - Show progress bar

- **Low pricing views (10% of limited users)**
  - Better CTAs
  - Show value proposition
  - Add urgency (limited time offer)

---

**Document Version:** 1.0.0  
**Last Updated:** November 8, 2025  
**Next Review:** After user testing  
**Maintained by:** Product Design Team
