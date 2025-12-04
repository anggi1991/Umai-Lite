# 🚀 Monetization Quick Start

Panduan cepat untuk menjalankan dan testing fitur monetization Phase 1.

---

## ⚡ Quick Commands

```bash
# 1. Apply database migration
./scripts/apply-monetization-migration.sh

# 2. Start development server
npm start

# 3. Run app and test
# Navigate to: Settings > Developer Tools > Run Tests
```

---

## 📋 What's Included in Phase 1

### ✅ Database Infrastructure
- 8 tables: `usage_limits`, `iap_receipts`, `ads_metrics`, `referrals`, `badges`, `user_badges`, `affiliate_links`, `affiliate_clicks`
- 4 functions: `check_and_increment_usage()`, `get_usage_status()`, `generate_referral_code()`, `check_and_award_badges()`
- RLS policies for all tables
- 8 sample badges (Bronze to Platinum tier)

### ✅ Service Layer
- `usageLimitService.ts` - Feature usage tracking & gating
- `referralService.ts` - Referral code generation & sharing
- `badgeService.ts` - Gamification & achievements
- `subscriptionService.ts` - Subscription management (RevenueCat prep)
- Updated `dailyTipsService.ts` - AI tips with usage limits
- Updated `chatService.ts` - Chat messages with usage limits

### ✅ UI Components
- `UpgradeModal.tsx` - Upgrade prompt when limits reached
- `FeatureLockBadge.tsx` - Premium feature lock indicators (3 variants)
- `UsageLimitBadge.tsx` - Usage progress badge (e.g., "3/3 AI Tips")
- `ReferralScreen.tsx` - Invite friends, share referral code
- `SubscriptionScreen.tsx` - Manage subscription, upgrade to Premium
- `BadgeShowcase.tsx` - Display earned badges with filtering

### ✅ Integration
- **Dashboard**: Shows usage limits, UpgradeModal on limit reached
- **Settings**: Navigation links to Subscription, Referral, Badges
- **Navigation Routes**: `/subscription`, `/referral`, `/badges`, `/test-usage-limits`

### ✅ Testing Infrastructure
- 6 automated integration tests
- Test UI screen (Settings > Developer Tools)
- Comprehensive testing guide (docs/MONETIZATION_TESTING_GUIDE.md)
- Manual test scenarios (8 flows)

---

## 🎯 Testing Flow (5 Minutes)

### Step 1: Apply Migration (1 min)
```bash
./scripts/apply-monetization-migration.sh
# Choose option 1 (Supabase CLI) or 2 (Dashboard)
```

### Step 2: Start App (1 min)
```bash
npm start
# Press 'i' for iOS or 'a' for Android
```

### Step 3: Run Automated Tests (2 min)
1. Sign in to app
2. Navigate to **Settings**
3. Scroll to **Developer Tools**
4. Tap **"Run Tests"**
5. Verify: **6/6 tests PASS**

### Step 4: Manual Testing (1 min)
1. Navigate to **Dashboard**
2. Tap **"Generate Daily Tip"** 3 times
3. Observe **UsageLimitBadge** update: 0/3 → 1/3 → 2/3 → 3/3
4. Tap **"Generate Daily Tip"** again (4th time)
5. **UpgradeModal** should appear
6. Tap **"Upgrade Now"** → navigates to **Subscription** screen

---

## 📊 Verify Results

### Automated Tests Expected:
- ✅ Initial Usage Status: PASS
- ✅ Increment Usage Count: PASS
- ✅ Limit Reached Scenario: PASS
- ✅ Chat Message Limits: PASS
- ✅ Setup Test User: PASS
- ✅ Cleanup Test Data: PASS

**Total: 6/6 PASS**

### Manual Testing Expected:
- ✅ UsageLimitBadge shows "AI Tips 0/3" initially
- ✅ Badge updates after each tip: 1/3, 2/3, 3/3
- ✅ Progress bar animates correctly
- ✅ UpgradeModal appears on 4th tip attempt
- ✅ Modal shows: "3/3 AI Tips used today"
- ✅ Upgrade button navigates to /subscription
- ✅ Settings → Subscription/Referral/Badges navigation works

---

## 🗄️ Database Verification

After testing, verify data in Supabase:

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('usage_limits', 'referrals', 'badges', 'user_badges');

-- Check functions exist
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('check_and_increment_usage', 'get_usage_status');

-- Check sample badges
SELECT * FROM badges ORDER BY points_required;

-- Check your usage limits
SELECT * FROM usage_limits 
WHERE user_id = auth.uid()
ORDER BY feature, created_at DESC;
```

**Expected:**
- 4 tables created
- 4 functions created
- 8 badges inserted
- 2 usage_limits rows (ai_tips: 3/3, chat_messages: 0/10)

---

## 🐛 Troubleshooting

### "Function does not exist"
**Fix:** Re-run migration script, verify all functions created

### UpgradeModal tidak muncul
**Fix:** Check Dashboard.tsx, ensure handleGenerateTip catches USAGE_LIMIT_REACHED

### UsageLimitBadge shows 0/0
**Fix:** Check getAllUsageStatus() returns data, verify user profile exists

### TypeScript errors
**Fix:** Run `npm run typecheck`, fix type mismatches (FeatureType, UsageStatus)

### Test fails
**Fix:** Check migration applied, verify database functions work, check RLS policies

---

## 📚 Documentation

- **Full Testing Guide:** [docs/MONETIZATION_TESTING_GUIDE.md](docs/MONETIZATION_TESTING_GUIDE.md)
- **Launch Checklist:** [docs/MONETIZATION_LAUNCH_CHECKLIST.md](docs/MONETIZATION_LAUNCH_CHECKLIST.md)
- **Growth Strategy:** [docs/MONETIZATION_GROWTH_STRATEGY.md](docs/MONETIZATION_GROWTH_STRATEGY.md)

---

## ✨ Features Overview

### Free Tier (Default)
- ✅ 3 AI tips per day
- ✅ 10 chat messages per day
- ✅ Basic activity tracking
- ✅ Ads shown (Phase 2)

### Premium Tier (Rp 29,000/month)
- ✅ Unlimited AI tips
- ✅ Unlimited chat messages
- ✅ Advanced analytics
- ✅ Ad-free experience
- ✅ Priority support
- ✅ Custom reminders

### Family Tier (Rp 49,000/month)
- ✅ All Premium features
- ✅ Up to 3 children profiles
- ✅ Family sharing
- ✅ Parenting resources

---

## 🎁 Growth Features

### Referral Program
- Share unique referral code
- Get **1 month Premium free** per successful referral
- Track referrals: pending, completed, expired
- Share via WhatsApp, Instagram, Copy Link

### Gamification (Badges)
- Earn badges for activities
- 8 badge types: Activity, Social, Engagement, Growth
- Bronze → Silver → Gold → Platinum tiers
- Point system for ranking

---

## 🚀 Next Steps

1. ✅ **Phase 1 Complete** - Database, Services, UI, Integration, Testing
2. ⏳ **RevenueCat Setup** - Create account, configure products
3. ⏳ **Phase 2** - AdMob integration (banner, interstitial, rewarded ads)
4. ⏳ **Production Deployment** - TestFlight, Internal Testing
5. ⏳ **Public Launch** - App Store, Google Play

---

## 📞 Support

Questions? Issues?
- Check: [docs/MONETIZATION_TESTING_GUIDE.md](docs/MONETIZATION_TESTING_GUIDE.md)
- Review: Error logs in Supabase Dashboard
- Debug: React Native console output

---

**Happy Testing! 🎉**

Phase 1 Progress: **100% Complete** ✅
