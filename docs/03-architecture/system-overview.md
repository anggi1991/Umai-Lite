# 🏗️ Parenting AI - Architecture Documentation

**Last Updated:** November 11, 2025  
**Project Status:** MVP Complete + Monetization Integrated  
**Version:** 1.0.0

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Database Schema](#database-schema)
3. [Service Layer](#service-layer)
4. [Screen Components](#screen-components)
5. [Data Flow](#data-flow)
6. [Security & RLS](#security--rls)
7. [Integration Points](#integration-points)

---

## 🎯 System Overview

### Tech Stack

```
Frontend: React Native (Expo 51) + TypeScript
├── UI Framework: React Native Paper
├── Navigation: Expo Router (file-based)
├── State Management: React Context API
└── Local Storage: AsyncStorage

Backend: Supabase (PostgreSQL + Edge Functions)
├── Authentication: Supabase Auth (Email/Password, Google OAuth)
├── Database: PostgreSQL 15 with Row Level Security
├── Storage: Supabase Storage (child media)
├── Edge Functions: Deno runtime
└── Realtime: Supabase Realtime subscriptions

AI Services:
├── Azure OpenAI: GPT-4 for chat and tips
└── Model: gpt-4-turbo-preview

Monetization:
├── RevenueCat: Subscription management
├── Supabase: Usage tracking and limits
└── Gamification: Badges and referral system
```

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    MOBILE APP (Expo)                        │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Screens   │  │   Services   │  │   Contexts   │      │
│  │  (UI Layer) │→→│ (Logic Layer)│→→│    (State)   │      │
│  └─────────────┘  └──────────────┘  └──────────────┘      │
└────────────┬────────────────────────────────────────────────┘
             │ HTTPS / WebSocket
             ↓
┌─────────────────────────────────────────────────────────────┐
│                   SUPABASE BACKEND                          │
│  ┌──────────┐  ┌─────────────┐  ┌──────────────┐          │
│  │   Auth   │  │  PostgreSQL │  │    Storage   │          │
│  │ (Users)  │  │  (Database) │  │    (Media)   │          │
│  └──────────┘  └─────────────┘  └──────────────┘          │
│  ┌──────────────────────────────────────────────┐          │
│  │       Edge Functions (Deno Runtime)          │          │
│  │  • generate-tip (AI tips)                    │          │
│  │  • chat (AI conversation)                    │          │
│  └──────────────────────────────────────────────┘          │
└────────────┬────────────────────────────────────────────────┘
             │ HTTPS API
             ↓
┌─────────────────────────────────────────────────────────────┐
│              EXTERNAL SERVICES                              │
│  • Azure OpenAI (GPT-4)                                     │
│  • RevenueCat (Subscriptions)                               │
│  • Expo Push Notifications                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema

### Data Consistency & child_id Auto-Assign (NEW)

Untuk menjaga konsistensi statistik aktivitas (sleep, feeding, diaper, dll), sistem menerapkan mekanisme **auto-assign `child_id`**:

| Layer | Mekanisme | Tujuan |
|-------|-----------|--------|
| Application | Fallback logic (`activityService.createActivity`) | Mencegah `child_id = NULL` ketika user punya child |
| Preference | Kolom `profiles.default_child_id` | User dapat memilih anak default |
| Database | Trigger `auto_assign_child_id()` | Proteksi jika insert langsung lewat SQL / bypass service |
| Resilience | Trigger `reassign_activities_on_child_delete()` | Hindari orphan & simpan jejak asal |
| Migration | Script `migrate-assign-child-id.sql` | Memperbaiki data lama + backup permanen |

Prioritas penentuan `child_id` otomatis:
1. Explicit `child_id` (dipilih user)
2. `default_child_id` preferensi user
3. First child (oldest by `created_at`)
4. NULL hanya jika user belum punya child

Metadata di tabel `activities.metadata` yang relevan:
| Key | Asal | Fungsi |
|-----|------|--------|
| `auto_assigned` | Service/Trigger | Menandai aktivitas ditentukan otomatis |
| `assigned_at` | Service/Trigger | Waktu penentuan |
| `strategy` | Service | `default_child` / `first_child` |
| `layer` | Trigger | Menandai penugasan dari lapisan DB |
| `migrated` | Migrasi | Aktivitas diperbaiki oleh script |
| `reassigned_from` | Trigger delete | Child asal sebelum dihapus |
| `unlinked` | Trigger delete | Child dihapus tanpa fallback |

Kinerja meningkat karena query statistik sekarang cukup menggunakan filter sederhana:
```sql
SELECT * FROM activities
WHERE user_id = $1 AND child_id = $2
ORDER BY created_at DESC;
```
Tanpa lagi harus OR `child_id IS NULL` yang memperburuk readability & performa planner.

Lebih lanjut lihat: `docs/data-sync/README.md` dan dokumen teknis pendukung di folder `docs/data-sync/`.

### Core Tables (11 tables)

#### 1. **profiles**
Stores user profile information linked to Supabase Auth.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,              -- References auth.users.id
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  locale TEXT DEFAULT 'id',         -- Language preference
  push_token TEXT,                  -- Expo push token
  device_info JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Purpose:** User identity and preferences  
**RLS:** Users can only access their own profile  
**Indexes:** Primary key on `id`

---

#### 2. **children**
Child profiles (max 3 per user in free tier).

```sql
CREATE TABLE children (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dob DATE NOT NULL,
  gender TEXT,
  photo_url TEXT,
  initial_weight_kg NUMERIC,
  initial_height_cm NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Purpose:** Store child information for personalized AI advice  
**RLS:** Users can only see/edit their own children  
**Indexes:** `user_id`, `created_at`

---

#### 3. **activities**
Daily activity tracking (feeding, sleep, diaper, mood, growth).

```sql
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  type TEXT NOT NULL,               -- 'feeding', 'sleep', 'diaper', 'mood', 'growth'
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  duration_seconds INT,
  value TEXT,                       -- Optional (e.g., amount for feeding)
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Purpose:** Track daily baby care activities  
**RLS:** Users can only access activities for their children  
**Indexes:** `user_id`, `child_id`, `type`, `created_at`

---

#### 4. **reminders**
Smart reminders with recurrence support.

```sql
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  next_at TIMESTAMPTZ NOT NULL,
  recurrence JSONB,                 -- RRule format
  timezone TEXT,
  enabled BOOLEAN DEFAULT TRUE,
  local_notification_id TEXT,       -- Expo notification ID
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Purpose:** Schedule recurring reminders (vaccines, feeding, checkups)  
**RLS:** Users can only manage their own reminders  
**Indexes:** `user_id`, `next_at`, `enabled`

---

#### 5. **daily_tips**
AI-generated parenting tips.

```sql
CREATE TABLE daily_tips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  child_id UUID REFERENCES children(id),
  tip_text TEXT NOT NULL,
  model TEXT,                       -- 'gpt-4-turbo-preview'
  prompt JSONB,
  cost_info JSONB,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Purpose:** Store AI-generated tips for users  
**RLS:** Users can only see their own tips  
**Indexes:** `user_id`, `generated_at DESC`

---

#### 6. **chat_sessions**
Chat conversation sessions.

```sql
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  child_id UUID REFERENCES children(id),
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Purpose:** Group chat messages into sessions  
**RLS:** Users can only access their own sessions  
**Indexes:** `user_id`, `updated_at DESC`

---

#### 7. **messages**
Individual chat messages.

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  sender TEXT NOT NULL,             -- 'user' | 'assistant' | 'system'
  role TEXT,
  content TEXT NOT NULL,
  tokens INT,
  model TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Purpose:** Store individual messages in chat sessions  
**RLS:** Users can access messages in their sessions  
**Indexes:** `session_id`, `created_at`

---

#### 8. **media**
Photo gallery for child milestones.

```sql
CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  child_id UUID REFERENCES children(id),
  url TEXT NOT NULL,
  type TEXT,
  caption TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Purpose:** Store child photos and milestone images  
**RLS:** Users can only see/upload their own media  
**Indexes:** `user_id`, `child_id`, `uploaded_at DESC`  
**Storage:** Supabase Storage bucket `child-media`

---

#### 9. **subscriptions**
User subscription and billing info.

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tier TEXT,                        -- 'free', 'premium', 'family'
  status TEXT,                      -- 'active', 'expired', 'cancelled'
  started_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Purpose:** Track subscription status  
**RLS:** Users can only see their own subscription  
**Indexes:** `user_id`, `expires_at`

---

#### 10. **notification_logs**
Push notification history.

```sql
CREATE TABLE notification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  child_id UUID REFERENCES children(id),
  reminder_id UUID REFERENCES reminders(id),
  provider TEXT,
  provider_response JSONB,
  status TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Purpose:** Track notification delivery  
**RLS:** Users can view their notification logs  
**Indexes:** `user_id`, `sent_at DESC`

---

#### 11. **audit_logs**
User action tracking for analytics.

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  action TEXT,
  table_name TEXT,
  record_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Purpose:** Track user actions for analytics  
**RLS:** Read-only for users  
**Indexes:** `user_id`, `action`, `created_at DESC`

---

### Monetization Tables (8 tables)

#### 12. **usage_limits**
Daily feature usage tracking for tier-based limits.

```sql
CREATE TABLE usage_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  feature_type TEXT NOT NULL,       -- 'ai_tips', 'chat_messages', 'media_upload'
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  usage_count INT DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, feature_type, usage_date)
);
```

**Purpose:** Enforce daily limits (free: 3 tips/day, 10 chats/day)  
**RLS:** Users can view/update their own limits  
**Indexes:** `(user_id, feature_type, usage_date DESC)`

---

#### 13. **iap_receipts**
In-app purchase receipts for subscription validation.

```sql
CREATE TABLE iap_receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  subscription_id UUID REFERENCES subscriptions(id),
  platform TEXT NOT NULL,           -- 'ios', 'android', 'web'
  transaction_id TEXT UNIQUE NOT NULL,
  product_id TEXT NOT NULL,         -- 'premium_monthly', 'family_monthly'
  purchase_date TIMESTAMPTZ NOT NULL,
  expiry_date TIMESTAMPTZ,
  receipt_data TEXT,
  is_validated BOOLEAN DEFAULT FALSE,
  revenue_cents INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Purpose:** Store purchase receipts from RevenueCat webhooks  
**RLS:** Users can view own receipts  
**Indexes:** `user_id`, `transaction_id UNIQUE`

---

#### 14. **referrals**
Referral tracking for viral growth.

```sql
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_user_id UUID NOT NULL,
  referred_user_id UUID,
  referral_code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending',    -- 'pending', 'completed', 'rewarded'
  reward_granted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Purpose:** Track referral links and rewards (1 month free per referral)  
**RLS:** Users can see referrals they created  
**Indexes:** `referral_code UNIQUE`, `referrer_user_id`

---

#### 15. **badges**
Achievement badge definitions for gamification.

```sql
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  points_required INT DEFAULT 0,
  tier TEXT,                        -- 'bronze', 'silver', 'gold', 'platinum'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Purpose:** Define achievement badges  
**RLS:** Public read access  
**Default Data:** 8 badges (First Step, Week Warrior, etc.)

---

#### 16. **user_badges**
Track which badges users have earned.

```sql
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  badge_id UUID NOT NULL REFERENCES badges(id),
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);
```

**Purpose:** Award badges to users  
**RLS:** Users can view their own badges  
**Indexes:** `(user_id, earned_at DESC)`

---

#### 17. **affiliate_links**
Partner product affiliate links.

```sql
CREATE TABLE affiliate_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_name TEXT NOT NULL,
  product_url TEXT NOT NULL,
  affiliate_code TEXT,
  commission_rate NUMERIC,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Purpose:** Monetize through affiliate product recommendations  
**RLS:** Public read access  

---

#### 18. **affiliate_clicks**
Track affiliate link clicks for analytics.

```sql
CREATE TABLE affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  affiliate_link_id UUID REFERENCES affiliate_links(id),
  clicked_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Purpose:** Track click-through rates on affiliate links  
**RLS:** Insert-only for authenticated users  

---

#### 19. **ads_metrics**
Advertising performance tracking (future feature).

```sql
CREATE TABLE ads_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_provider TEXT,
  ad_unit_id TEXT,
  impressions INT DEFAULT 0,
  clicks INT DEFAULT 0,
  revenue_cents INT DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Purpose:** Track ad performance if ads are implemented  
**RLS:** Service role only  

---

### Database RPC Functions

#### 1. **check_and_increment_usage**
Check if user can use a feature and increment usage counter.

```sql
CREATE OR REPLACE FUNCTION check_and_increment_usage(
  p_user_id UUID,
  p_feature_type TEXT,
  p_tier TEXT DEFAULT 'free'
) RETURNS JSONB AS $$
DECLARE
  v_limit INT;
  v_current_count INT;
  v_allowed BOOLEAN;
BEGIN
  -- Get tier limits
  v_limit := CASE p_tier
    WHEN 'free' THEN CASE p_feature_type
      WHEN 'ai_tips' THEN 3
      WHEN 'chat_messages' THEN 10
      WHEN 'media_upload' THEN 20
      ELSE 999
    END
    ELSE 999 -- Unlimited for paid tiers
  END;

  -- Get current usage
  SELECT COALESCE(usage_count, 0) INTO v_current_count
  FROM usage_limits
  WHERE user_id = p_user_id
    AND feature_type = p_feature_type
    AND usage_date = CURRENT_DATE;

  -- Check if allowed
  v_allowed := (v_current_count < v_limit) OR (p_tier != 'free');

  -- Increment if allowed
  IF v_allowed THEN
    INSERT INTO usage_limits (user_id, feature_type, usage_date, usage_count, last_used_at)
    VALUES (p_user_id, p_feature_type, CURRENT_DATE, 1, NOW())
    ON CONFLICT (user_id, feature_type, usage_date)
    DO UPDATE SET
      usage_count = usage_limits.usage_count + 1,
      last_used_at = NOW();
      
    v_current_count := v_current_count + 1;
  END IF;

  RETURN jsonb_build_object(
    'allowed', v_allowed,
    'current_count', v_current_count,
    'limit', v_limit,
    'remaining', GREATEST(0, v_limit - v_current_count)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Usage:**
```typescript
const { data } = await supabase.rpc('check_and_increment_usage', {
  p_user_id: userId,
  p_feature_type: 'ai_tips',
  p_tier: 'free'
});
// Returns: { allowed: true, current_count: 1, limit: 3, remaining: 2 }
```

---

#### 2. **get_usage_status**
Get current usage status for a feature without incrementing.

```sql
CREATE OR REPLACE FUNCTION get_usage_status(
  p_user_id UUID,
  p_feature_type TEXT,
  p_tier TEXT DEFAULT 'free'
) RETURNS JSONB AS $$
-- Similar to check_and_increment_usage but no INSERT/UPDATE
$$;
```

---

#### 3. **force_reset_usage_limits**
**Testing only** - Reset usage limits (bypasses RLS with SECURITY DEFINER).

```sql
CREATE OR REPLACE FUNCTION force_reset_usage_limits(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_deleted_count INT;
BEGIN
  DELETE FROM usage_limits WHERE user_id = p_user_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN jsonb_build_object(
    'success', TRUE,
    'deleted_count', v_deleted_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Note:** This function is for integration tests only. Uses SECURITY DEFINER to bypass RLS policies.

---

#### 4. **generate_referral_code**
Generate unique referral code for users.

```sql
CREATE OR REPLACE FUNCTION generate_referral_code(p_user_id UUID)
RETURNS TEXT AS $$
-- Generates 8-character alphanumeric code
$$;
```

---

#### 5. **check_and_award_badges**
Check user progress and award badges.

```sql
CREATE OR REPLACE FUNCTION check_and_award_badges(p_user_id UUID)
RETURNS JSONB AS $$
-- Check activity counts and award badges
$$;
```

---

## 🔧 Service Layer

### Service Architecture

```
src/services/
├── supabaseClient.ts          # Supabase client initialization
├── authService.ts             # Authentication (sign in/up/out)
├── childService.ts            # Child CRUD operations
├── activityService.ts         # Activity tracking
├── reminderService.ts         # Reminder scheduling
├── dailyTipsService.ts        # AI tips generation
├── chatService.ts             # AI chat conversations
├── mediaService.ts            # Photo upload/download
├── subscriptionService.ts     # Subscription management
├── notificationService.ts     # Push notifications
├── analyticsService.ts        # Event tracking
└── usageLimitService.ts       # Usage limit enforcement
```

---

### Key Services

#### **usageLimitService.ts**
Enforces tier-based feature limits.

```typescript
class UsageLimitService {
  /**
   * Check if user can use feature and increment counter
   * @throws Error('USAGE_LIMIT_REACHED') if limit exceeded
   */
  static async checkAndIncrementUsage(
    featureType: FeatureType,
    userId?: string
  ): Promise<UsageCheckResult> {
    const tier = await this.getUserTier(userId);
    
    const { data, error } = await supabase.rpc('check_and_increment_usage', {
      p_user_id: userId,
      p_feature_type: featureType,
      p_tier: tier,
    });

    if (error) throw error;
    
    // Throw error if limit reached
    if (!data.allowed) {
      await logEvent({
        action: 'usage_limit_reached',
        details: { feature: featureType, tier, limit: data.limit }
      });
      throw new Error('USAGE_LIMIT_REACHED');
    }

    return {
      allowed: data.allowed,
      status: {
        current_count: data.current_count,
        limit: data.limit,
        remaining: data.remaining,
        is_unlimited: tier !== 'free',
      },
    };
  }

  /**
   * Get current usage status without incrementing
   */
  static async getUsageStatus(
    featureType: FeatureType,
    userId?: string
  ): Promise<UsageStatus> {
    const tier = await this.getUserTier(userId);
    
    const { data, error } = await supabase.rpc('get_usage_status', {
      p_user_id: userId,
      p_feature_type: featureType,
      p_tier: tier,
    });

    if (error) throw error;

    // Normalize null to 0
    return {
      ...data,
      current_count: data.current_count ?? 0,
    };
  }
}
```

**Usage in screens:**
```typescript
// Before generating AI tip
try {
  await UsageLimitService.checkAndIncrementUsage('ai_tips');
  // Proceed with AI generation
} catch (error) {
  if (error.message === 'USAGE_LIMIT_REACHED') {
    Alert.alert('Limit Reached', 'Upgrade to Premium for unlimited tips!');
    router.push('/subscription');
  }
}
```

---

#### **dailyTipsService.ts**
Generate AI tips via Supabase Edge Function.

```typescript
export const generateDailyTip = async (
  childId: string,
  userId?: string
): Promise<string> => {
  // Check usage limit first
  await UsageLimitService.checkAndIncrementUsage('ai_tips', userId);

  const { data, error } = await supabase.functions.invoke('generate-tip', {
    body: {
      user_id: userId,
      child_id: childId,
      prompt_type: 'daily_tip',
    },
  });

  if (error) throw error;
  return data.tip;
};
```

---

#### **chatService.ts**
AI chat conversation via Edge Function.

```typescript
export const sendChatMessage = async (
  sessionId: string,
  message: string,
  userId?: string
): Promise<ChatMessage> => {
  // Check usage limit
  await UsageLimitService.checkAndIncrementUsage('chat_messages', userId);

  const { data, error } = await supabase.functions.invoke('chat', {
    body: {
      session_id: sessionId,
      user_id: userId,
      message,
    },
  });

  if (error) throw error;
  return data;
};
```

---

#### **subscriptionService.ts**
RevenueCat integration for subscriptions.

```typescript
export const initializeRevenueCat = async () => {
  await Purchases.configure({
    apiKey: Platform.select({
      ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY!,
      android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY!,
    })!,
  });
};

export const purchaseSubscription = async (
  productId: string
): Promise<void> => {
  const customerInfo = await Purchases.purchasePackage(productId);
  
  // Sync to Supabase
  await supabase.from('iap_receipts').insert({
    user_id: userId,
    product_id: productId,
    transaction_id: customerInfo.activeSubscriptions[0],
    purchase_date: new Date(),
    is_validated: true,
  });
};
```

---

## 🖥️ Screen Components

### Screen Architecture

```
app/                               # Expo Router screens
├── index.tsx                      # Welcome/Landing
├── dashboard.tsx                  # Main dashboard
├── settings.tsx                   # User settings
├── subscription.tsx               # Subscription plans
├── referral.tsx                   # Referral program
├── badges.tsx                     # Achievement badges
├── (auth)/
│   ├── signin.tsx                 # Email + Google OAuth
│   └── signup.tsx                 # Registration
├── child/
│   ├── index.tsx                  # Child list
│   ├── add.tsx                    # Add new child
│   └── edit/[id].tsx              # Edit child
├── activities/
│   └── history.tsx                # Activity timeline
├── chat/
│   ├── index.tsx                  # Chat session list
│   └── [id].tsx                   # Chat conversation
└── (tabs)/
    └── media.tsx                  # Photo gallery

src/screens/
├── Dashboard/
│   └── DashboardScreen.tsx        # Main UI logic
├── Settings/
│   └── Settings.tsx               # Settings UI
└── Statistics/
    └── StatisticsScreen.tsx       # Growth charts
```

---

### Data Flow Example: Dashboard Screen

```typescript
// app/dashboard.tsx
import DashboardScreen from '../src/screens/Dashboard/DashboardScreen';

export default function Dashboard() {
  return <DashboardScreen />;
}
```

```typescript
// src/screens/Dashboard/DashboardScreen.tsx
export default function DashboardScreen() {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [usageStatus, setUsageStatus] = useState<UsageStatus | null>(null);

  useEffect(() => {
    loadChildren();
    loadUsageStatus();
  }, [user]);

  const loadChildren = async () => {
    const data = await childService.getChildren(user.id);
    setChildren(data);
    if (data.length > 0) setSelectedChild(data[0]);
  };

  const loadUsageStatus = async () => {
    const status = await UsageLimitService.getAllUsageStatus(user.id);
    setUsageStatus(status);
  };

  const handleGenerateTip = async () => {
    try {
      // Service checks limit and throws if exceeded
      const tip = await dailyTipsService.generateDailyTip(
        selectedChild.id,
        user.id
      );
      
      Alert.alert('Daily Tip', tip);
      
      // Refresh usage status
      loadUsageStatus();
    } catch (error) {
      if (error.message === 'USAGE_LIMIT_REACHED') {
        Alert.alert(
          'Limit Reached',
          'You\'ve used all 3 free tips today. Upgrade for unlimited!',
          [
            { text: 'Cancel' },
            { text: 'Upgrade', onPress: () => router.push('/subscription') }
          ]
        );
      }
    }
  };

  return (
    <View>
      {/* Child selector */}
      <ChildSelector
        children={children}
        selected={selectedChild}
        onSelect={setSelectedChild}
      />

      {/* Usage status */}
      <UsageLimitCard status={usageStatus} />

      {/* Generate tip button */}
      <CustomButton
        title="Generate Daily Tip"
        onPress={handleGenerateTip}
      />
    </View>
  );
}
```

**Data Flow:**
1. User clicks "Generate Daily Tip"
2. `handleGenerateTip()` calls `dailyTipsService.generateDailyTip()`
3. Service calls `UsageLimitService.checkAndIncrementUsage('ai_tips')`
4. Service calls RPC `check_and_increment_usage` in database
5. RPC checks current usage, increments if allowed, returns result
6. If allowed: Service invokes Edge Function `generate-tip`
7. Edge Function calls Azure OpenAI GPT-4
8. Response flows back: OpenAI → Edge Function → Service → Screen
9. Screen displays tip and refreshes usage status

---

## 🔄 Data Flow

### 1. Authentication Flow

```
User Input (Email/Password)
  ↓
authService.signIn()
  ↓
supabase.auth.signInWithPassword()
  ↓
Supabase Auth validates
  ↓
Auth state updated in AuthContext
  ↓
Router navigates to /dashboard
  ↓
Profile created via trigger (if new user)
```

---

### 2. Child Activity Tracking Flow

```
User logs activity (e.g., feeding)
  ↓
ActivityForm collects data
  ↓
activityService.createActivity()
  ↓
supabase.from('activities').insert()
  ↓
Row Level Security checks user_id
  ↓
Activity saved to database
  ↓
analyticsService.logEvent('activity_logged')
  ↓
Dashboard refreshes activity list
  ↓
Statistics screen updates charts
```

---

### 3. AI Tip Generation Flow (with Usage Limits)

```
User requests AI tip
  ↓
UsageLimitService.checkAndIncrementUsage('ai_tips')
  ↓
RPC: check_and_increment_usage(user_id, 'ai_tips', 'free')
  ↓
Database checks usage_limits table
  ↓
If current_count < limit (3 for free):
  ├─ Increment usage_count
  ├─ Return { allowed: true, current_count: 1, remaining: 2 }
  └─ dailyTipsService.generateDailyTip()
      ↓
      Edge Function: generate-tip
      ↓
      Azure OpenAI GPT-4 API
      ↓
      Save to daily_tips table
      ↓
      Return tip text to screen
Else:
  ├─ Return { allowed: false, current_count: 3, remaining: 0 }
  ├─ Service throws Error('USAGE_LIMIT_REACHED')
  └─ Screen shows upgrade prompt
```

---

### 4. Subscription Purchase Flow

```
User selects Premium plan
  ↓
subscriptionService.purchaseSubscription('premium_monthly')
  ↓
RevenueCat.purchasePackage()
  ↓
Platform payment (App Store / Google Play)
  ↓
RevenueCat webhook → Backend
  ↓
Backend validates receipt
  ↓
Insert into iap_receipts table
  ↓
Update subscriptions table (tier: 'premium', status: 'active')
  ↓
subscriptionService.syncCustomerInfo()
  ↓
App refreshes subscription status
  ↓
UsageLimitService now returns unlimited limits
```

---

### 5. Real-time Updates Flow (Chat)

```
User sends chat message
  ↓
chatService.sendChatMessage()
  ↓
Check usage limit (10 messages/day for free)
  ↓
Insert into messages table
  ↓
Edge Function: chat (invoked)
  ↓
Azure OpenAI streams response
  ↓
Assistant message saved to messages table
  ↓
Supabase Realtime broadcasts change
  ↓
Chat screen listens via subscription:
  supabase
    .channel('messages')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' })
    .subscribe((payload) => {
      setMessages(prev => [...prev, payload.new]);
    });
```

---

## 🔒 Security & RLS

### Row Level Security (RLS) Policies

All tables have RLS enabled. Example policies:

```sql
-- profiles: Users can only see/edit their own profile
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_can_manage_own_profile"
  ON profiles
  USING (id = auth.uid());

-- children: Users can only manage their own children
ALTER TABLE children ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_can_view_own_children"
  ON children FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "users_can_insert_own_children"
  ON children FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_can_update_own_children"
  ON children FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "users_can_delete_own_children"
  ON children FOR DELETE
  USING (user_id = auth.uid());

-- activities: Users can only see activities for their children
CREATE POLICY "users_can_view_own_activities"
  ON activities FOR SELECT
  USING (
    user_id = auth.uid() OR
    child_id IN (SELECT id FROM children WHERE user_id = auth.uid())
  );

-- usage_limits: Users can view/update their own limits
CREATE POLICY "users_can_manage_own_usage"
  ON usage_limits
  USING (user_id = auth.uid());
```

### SECURITY DEFINER Functions

Some RPC functions use `SECURITY DEFINER` to bypass RLS when necessary:

```sql
-- force_reset_usage_limits: Testing only, bypasses RLS to delete records
CREATE OR REPLACE FUNCTION force_reset_usage_limits(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER  -- Runs with function owner's privileges
AS $$
BEGIN
  DELETE FROM usage_limits WHERE user_id = p_user_id;
  -- ...
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION force_reset_usage_limits TO authenticated;
```

**⚠️ Security Note:** `SECURITY DEFINER` functions must be carefully audited. Only use for testing utilities or operations that genuinely need elevated privileges.

---

## 🔗 Integration Points

### 1. Supabase Auth ↔ Profile Creation

```sql
-- Trigger: Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

### 2. Edge Functions ↔ Azure OpenAI

```typescript
// supabase/functions/generate-tip/index.ts
const response = await fetch(
  `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=2024-02-15-preview`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': AZURE_OPENAI_KEY,
    },
    body: JSON.stringify({
      messages: [
        {
          role: 'system',
          content: 'You are Baby Buddy, a friendly parenting assistant...'
        },
        {
          role: 'user',
          content: `Generate a parenting tip for a ${childAge}-month-old baby.`
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    }),
  }
);
```

---

### 3. RevenueCat ↔ Supabase Subscriptions

```typescript
// Webhook handler (backend/server)
app.post('/webhooks/revenuecat', async (req, res) => {
  const event = req.body;

  if (event.type === 'INITIAL_PURCHASE' || event.type === 'RENEWAL') {
    await supabase.from('iap_receipts').insert({
      user_id: event.app_user_id,
      transaction_id: event.transaction_id,
      product_id: event.product_id,
      purchase_date: event.purchased_at_ms,
      expiry_date: event.expiration_at_ms,
      is_validated: true,
    });

    await supabase.from('subscriptions').upsert({
      user_id: event.app_user_id,
      tier: 'premium',
      status: 'active',
      expires_at: event.expiration_at_ms,
    });
  }

  res.json({ received: true });
});
```

---

### 4. Expo Push Notifications ↔ Reminders

```typescript
// reminderService.ts
export const scheduleReminder = async (reminder: Reminder) => {
  // Schedule local notification
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: reminder.type,
      body: `Reminder for ${reminder.child_name}`,
    },
    trigger: {
      date: new Date(reminder.next_at),
    },
  });

  // Save notification ID to database
  await supabase
    .from('reminders')
    .update({ local_notification_id: notificationId })
    .eq('id', reminder.id);
};
```

---

## 📊 Performance & Optimization

### Database Indexes

```sql
-- High-frequency queries
CREATE INDEX idx_activities_user_child ON activities(user_id, child_id, created_at DESC);
CREATE INDEX idx_messages_session ON messages(session_id, created_at);
CREATE INDEX idx_usage_user_date ON usage_limits(user_id, feature_type, usage_date DESC);
CREATE INDEX idx_children_user ON children(user_id, created_at DESC);
```

### Caching Strategy

- **AsyncStorage:** User preferences, selected child, theme
- **React Query:** API responses cached for 5 minutes
- **Supabase Realtime:** Live updates reduce need for polling

### Bundle Size Optimization

```json
// app.json
{
  "expo": {
    "experiments": {
      "tsconfigPaths": true
    },
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "enableProguardInReleaseBuilds": true,
            "enableShrinkResourcesInReleaseBuilds": true
          }
        }
      ]
    ]
  }
}
```

---

## 🧪 Testing

### Integration Tests

```typescript
// src/tests/usageLimitIntegrationTest.ts
export class UsageLimitIntegrationTest {
  async testLimitReached() {
    // Use 3 AI tips (free tier limit)
    for (let i = 0; i < 3; i++) {
      await UsageLimitService.checkAndIncrementUsage('ai_tips');
    }

    // 4th attempt should throw error
    try {
      await UsageLimitService.checkAndIncrementUsage('ai_tips');
      throw new Error('Expected USAGE_LIMIT_REACHED error');
    } catch (error) {
      if (error.message !== 'USAGE_LIMIT_REACHED') {
        throw error;
      }
    }
  }

  async cleanup() {
    // Reset test data using SECURITY DEFINER function
    await supabase.rpc('force_reset_usage_limits', {
      p_user_id: this.testUserId
    });
  }
}
```

**Run tests:**
```bash
# In app: Settings → Developer Tools → Run Tests
# Or: app/test-usage-limits.tsx
```

---

## 🚀 Deployment

### Supabase Migrations

```bash
# Apply migrations
supabase db push

# Reset database (local dev only)
supabase db reset
```

### Edge Functions

```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy generate-tip

# View logs
supabase functions logs generate-tip
```

### Mobile App Build

```bash
# Development build
eas build --profile development --platform ios

# Production build
eas build --profile production --platform all

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

---

## 📝 Recent Changes (Nov 11, 2025)

### ✅ Completed Fixes

1. **Usage Limit Integration Tests** - 6/6 tests passing
   - Fixed null `current_count` handling in `getUsageStatus`
   - Fixed error re-throwing in `checkAndIncrementUsage`
   - Created `force_reset_usage_limits` RPC with SECURITY DEFINER
   - Fixed parameter order in test function calls

2. **Indonesian Translations** - All UI consistent
   - StatisticsScreen: "Berat Saat Ini", "Tinggi Saat Ini"
   - All menus and screens use Indonesian language

3. **Monetization System** - Fully integrated
   - RevenueCat for subscriptions
   - Usage limits enforced dynamically
   - Referral system with rewards
   - Gamification with badges

4. **Error Handling** - Robust error propagation
   - `USAGE_LIMIT_REACHED` error thrown and caught properly
   - User-friendly upgrade prompts
   - Analytics event logging

---

## 🔮 Future Enhancements

### Planned Features

- [ ] **Offline Mode:** Cache data locally for offline access
- [ ] **Multi-language:** English, Bahasa Indonesia, Chinese
- [ ] **Health Integrations:** Apple Health, Google Fit
- [ ] **AI Voice Assistant:** Voice input for activity logging
- [ ] **Community Features:** Parent forums, Q&A
- [ ] **Advanced Analytics:** Predictive insights, growth predictions
- [ ] **Wearable Integration:** Smartwatch activity tracking

---

## 📞 Support & Documentation

- **Main Docs:** `/docs/README.md`
- **Monetization:** `/docs/monetization/`
- **Testing:** `/docs/testing/`
- **API Reference:** `/docs/references/`

---

**Last Updated:** November 11, 2025  
**Maintained by:** Development Team  
**Version:** 1.0.0
