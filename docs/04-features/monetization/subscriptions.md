# 📱 RevenueCat Subscription Management

**Last Updated:** January 12, 2025  
**Status:** ✅ SDK Integrated - Ready for Dashboard Setup  
**Priority:** HIGH (Monetization Core)  
**Implementation Time:** ~2 hours  
**Total Code:** 1,055+ lines (445 service + 515 UI + 95 hooks)

**Related Documentation:**
- Monetization Folder: `/docs/04-features/monetization/README.md`
- Setup Guide: `/docs/02-setup/revenuecat.md`
- Growth Strategy: `/docs/04-features/monetization/growth-strategy.md`
- Testing: `/docs/06-testing/manual-testing.md` (Monetization section)
- Troubleshooting: `/docs/08-maintenance/troubleshooting.md` (RevenueCat section)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Architecture](#architecture)
4. [API Reference](#api-reference)
5. [UI Components](#ui-components)
6. [Dashboard Setup](#dashboard-setup)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## 📊 Overview

RevenueCat handles in-app purchase management for iOS and Android, providing:
- Cross-platform subscription management
- Automatic receipt validation
- Customer information syncing
- Real-time entitlement checking
- Pre-built paywall UI
- Customer Center for self-service

### Product Tiers

| Tier | Price | Features | Product ID |
|------|-------|----------|------------|
| **Free** | Rp 0 | 3 AI tips/day, 10 chat messages/day | - |
| **Premium** | Rp 29,000/month | Unlimited access, priority support | `monthly` |
| **Yearly** | Rp 290,000/year | 17% savings, all Premium features | `yearly` |
| **Lifetime** | Rp 499,000 | One-time payment, forever access | `lifetime` |

### Configuration

```typescript
// API Key (in revenueCatService.ts)
const REVENUECAT_API_KEY = 'test_GrJfMWRWqLTeIJSBnfYxbtSXEOw';

// Entitlement ID
const ENTITLEMENT_ID = 'razqashop Pro';

// Product IDs
monthly   → Monthly subscription
yearly    → Yearly subscription
lifetime  → Lifetime purchase
```

---

## 🚀 Quick Start

### 1. Check If User Has Pro Access

```typescript
import { hasProEntitlement } from '../services/revenueCatService';

const isPro = await hasProEntitlement();
if (isPro) {
  // Grant unlimited access to all features
}
```

### 2. Show Paywall

```tsx
import { RevenueCatPaywall } from '../components/monetization/RevenueCatPaywall';

<RevenueCatPaywall
  onPurchaseComplete={() => {
    // Refresh UI, update subscription status
    console.log('Purchase successful!');
  }}
  onDismiss={() => {
    // Handle user closing paywall
    console.log('Paywall dismissed');
  }}
  displayCloseButton={true}
/>
```

### 3. Display Customer Center

```tsx
import { CustomerCenter } from '../components/monetization/CustomerCenter';

<CustomerCenter />
```

### 4. Use Subscription Hook

```typescript
import { useRevenueCat } from '../hooks/useRevenueCat';

const { isPro, subscriptionStatus, isLoading, refresh } = useRevenueCat();

if (isPro) {
  console.log('Active subscription:', subscriptionStatus?.tier);
}
```

---

## 🏗️ Architecture

### File Structure

```
src/
├── services/
│   └── revenueCatService.ts         # Core RevenueCat service (445 lines)
├── components/
│   └── monetization/
│       ├── RevenueCatPaywall.tsx    # Paywall UI component (238 lines)
│       └── CustomerCenter.tsx       # Subscription management (277 lines)
├── hooks/
│   └── useRevenueCat.ts             # React hook for subscription state (95 lines)
└── contexts/
    └── AuthContext.tsx              # Updated with RC user identification
```

### Integration Flow

```
User Authentication
       ↓
identifyUser() in RevenueCat
       ↓
User makes purchase → RevenueCat Paywall
       ↓
Purchase processed by Apple/Google
       ↓
RevenueCat validates & grants entitlement
       ↓
Synced to Supabase iap_receipts table
       ↓
usageLimitService checks hasProEntitlement()
       ↓
Grants unlimited access if Pro
```

### Integration Points

1. **App Initialization** (`app/_layout.tsx`)
   - RevenueCatBootstrap component initializes SDK on app start

2. **User Authentication** (`src/contexts/AuthContext.tsx`)
   - Identifies user in RevenueCat on sign-in
   - Logs out user on sign-out

3. **Feature Gating** (`src/services/usageLimitService.ts`)
   - Checks Pro entitlement before enforcing limits
   - Allows unlimited access for Pro users

4. **Subscription Screens**
   - Paywall for upgrade prompts
   - Customer Center for subscription management

---

## 📚 API Reference

### Core Functions (`revenueCatService.ts`)

#### Initialize SDK

```typescript
await initializeRevenueCat(userId?: string)
```
- Configures RevenueCat with API key
- Sets log level for debugging
- Optionally identifies user

#### User Identification

```typescript
await identifyUser(userId: string)
```
- Links user to RevenueCat customer
- Syncs purchases across devices
- Returns CustomerInfo

#### Get Offerings

```typescript
const offerings = await getOfferings()
```
- Fetches available products (Monthly, Yearly, Lifetime)
- Returns PurchasesOfferings object

#### Purchase Product

```typescript
const { customerInfo, success } = await purchasePackage(package)
```
- Initiates purchase flow
- Handles success, cancellation, and errors
- Syncs to Supabase

#### Restore Purchases

```typescript
const customerInfo = await restorePurchases()
```
- Restores previous purchases
- Syncs entitlements

#### Check Entitlement ⭐

```typescript
const hasAccess = await hasProEntitlement()
```
- Returns `true` if user has "razqashop Pro" entitlement
- Used for feature gating throughout the app

#### Get Subscription Status

```typescript
const status = await getSubscriptionStatus()
```
Returns detailed subscription info:
```typescript
{
  isActive: boolean,
  tier: 'free' | 'premium' | 'family' | 'lifetime',
  expiresAt: Date | null,
  willRenew: boolean,
  isInTrial: boolean
}
```

#### Additional Functions

```typescript
// Get customer information
const customerInfo = await getCustomerInfo();

// Add real-time updates listener
addCustomerInfoUpdateListener((info) => {
  console.log('Subscription updated!', info);
});

// Check promotional offer eligibility
const isEligible = await checkPromotionalOffer('intro-offer');

// Set marketing attributes
await setAttributes({
  campaign: 'summer-sale',
  channel: 'facebook'
});

// Determine if paywall should be shown
const shouldShow = await shouldShowPaywall();
```

---

## 🎨 UI Components

### 1. RevenueCat Paywall (238 lines)

**Location:** `src/components/monetization/RevenueCatPaywall.tsx`

**Features:**
- Pre-built UI from RevenueCat
- Handles purchase flow automatically
- Restore purchases button
- Loading states
- Error handling
- Success/cancel callbacks

**Props:**
```typescript
interface RevenueCatPaywallProps {
  onPurchaseComplete?: () => void;  // Called after successful purchase
  onDismiss?: () => void;           // Called when user closes paywall
  displayCloseButton?: boolean;     // Show X button (default: true)
}
```

**Example:**
```tsx
<RevenueCatPaywall
  onPurchaseComplete={() => {
    Alert.alert('Success', 'Welcome to Premium!');
    navigation.navigate('Dashboard');
  }}
  onDismiss={() => {
    console.log('User closed paywall');
  }}
  displayCloseButton={true}
/>
```

### 2. Customer Center (277 lines)

**Location:** `src/components/monetization/CustomerCenter.tsx`

**Features:**
- Displays current subscription status
- Manage subscription button (opens RevenueCat Customer Center)
- Restore purchases
- Trial status display
- Renewal information
- Free tier messaging

**UI Elements:**
- Status badge (Premium/Family/Lifetime with colors)
- Expiration date display
- Auto-renewal toggle status
- Trial countdown (e.g., "5 days left in trial")
- Help section with FAQs

**Example:**
```tsx
<CustomerCenter />
```

---

## 🪝 React Hooks

### useRevenueCat Hook (95 lines)

**Location:** `src/hooks/useRevenueCat.ts`

**Usage:**
```typescript
import { useRevenueCat } from '../hooks/useRevenueCat';

const {
  isLoading,        // boolean - Loading state
  isPro,            // boolean - Has Pro access
  subscriptionStatus, // SubscriptionStatus | null
  customerInfo,     // CustomerInfo | null - Raw RevenueCat data
  error,            // Error | null
  refresh,          // () => Promise<void> - Manual refresh
} = useRevenueCat();

// Check if user is Pro
if (isPro) {
  // Grant access to premium features
}

// Display subscription tier
console.log(subscriptionStatus?.tier); // 'free' | 'premium' | 'family' | 'lifetime'

// Refresh subscription data
await refresh();
```

**Features:**
- Real-time subscription state
- Automatic updates on purchase
- Customer info listener
- Error handling
- Loading states

### useFeatureAccess Hook

```typescript
import { useFeatureAccess } from '../hooks/useRevenueCat';

const hasAccess = useFeatureAccess('ai-insights');

if (!hasAccess) {
  // Show upgrade prompt or lock feature
  navigation.navigate('Subscription');
}
```

---

## 🔐 Feature Gating

### Integration with Usage Limits

The `usageLimitService` checks RevenueCat entitlements before enforcing limits:

```typescript
// In usageLimitService.ts
const hasPro = await hasProEntitlement();

if (hasPro) {
  // Allow unlimited access
  return { allowed: true, status: { is_unlimited: true } };
}

// Otherwise, check Supabase limits for free tier
```

### Feature Gating Pattern

```typescript
import { hasProEntitlement } from '../services/revenueCatService';

async function checkFeatureAccess(feature: string): Promise<boolean> {
  const isPro = await hasProEntitlement();
  
  if (isPro) {
    return true; // Pro users have access
  }
  
  // Check free tier limits
  const { allowed } = await UsageLimitService.checkAndIncrementUsage(feature);
  return allowed;
}
```

---

## 🛠️ Dashboard Setup

### Step-by-Step Configuration (20-30 minutes)

#### 1. Create Account
1. Go to https://app.revenuecat.com
2. Sign up for free account
3. Create new project: "Parenting AI Assistant"

#### 2. Add Apps
1. Click "Add App" → Select "iOS"
   - App Name: Parenting AI (iOS)
   - Bundle ID: `com.yourcompany.parentingai` (from app.json)
2. Click "Add App" → Select "Android"
   - App Name: Parenting AI (Android)
   - Package Name: `com.yourcompany.parentingai`

#### 3. Create Products (6 total: 3 iOS + 3 Android)

| Product ID | Type | Duration | Platform |
|------------|------|----------|----------|
| `monthly` | Auto-renewable subscription | 1 month | iOS + Android |
| `yearly` | Auto-renewable subscription | 1 year | iOS + Android |
| `lifetime` | Non-consumable | Lifetime | iOS + Android |

**Steps for each:**
1. Go to "Products" tab
2. Click "Add Product"
3. Select platform (iOS or Android)
4. Enter Product ID (e.g., `monthly`)
5. Select type and duration
6. Click "Create"
7. Repeat for other platform

#### 4. Create Entitlement
1. Go to "Entitlements" tab
2. Click "Add Entitlement"
3. Enter ID: `razqashop Pro` (must match exactly, case-sensitive!)
4. Description: "Pro subscription access to all features"
5. Click "Create"

#### 5. Attach Products to Entitlement
1. In "razqashop Pro" entitlement, click "Attach Products"
2. Select all 6 products:
   - ☑️ monthly (iOS)
   - ☑️ monthly (Android)
   - ☑️ yearly (iOS)
   - ☑️ yearly (Android)
   - ☑️ lifetime (iOS)
   - ☑️ lifetime (Android)
3. Click "Attach"

#### 6. Create Offering
1. Go to "Offerings" tab
2. Click "Create Offering"
3. Offering ID: `default`
4. Description: "Default subscription offering"
5. ✅ Mark as "Current Offering"
6. Click "Create"

#### 7. Add Packages to Offering
1. In "default" offering, click "Add Package"
2. Add Monthly Package:
   - Package ID: `monthly`
   - Product: Select `monthly`
   - Position: 1
3. Add Yearly Package:
   - Package ID: `yearly`
   - Product: Select `yearly`
   - Position: 2
4. Add Lifetime Package:
   - Package ID: `lifetime`
   - Product: Select `lifetime`
   - Position: 3

### App Store Connect Setup (iOS)

**Prerequisites:** Apple Developer Account ($99/year)

1. **Create In-App Purchases:**
   - Go to App Store Connect → Your App → In-App Purchases
   - Click "+" → "Auto-Renewable Subscription"
   - Create subscription group: "Parenting AI Pro"

2. **Create Products:**
   - Monthly: Product ID `monthly`, Duration 1 month, Price Rp 29,000
   - Yearly: Product ID `yearly`, Duration 1 year, Price Rp 290,000
   - Lifetime: Product ID `lifetime`, Type Non-Consumable, Price Rp 499,000

3. **Get Shared Secret:**
   - In App Store Connect → App-Specific Shared Secret
   - Copy and paste in RevenueCat Dashboard → iOS App → Shared Secret

### Google Play Console Setup (Android)

**Prerequisites:** Google Play Developer Account ($25 one-time)

1. **Create In-App Products:**
   - Go to Play Console → Your App → Monetization → Products
   - Click "Create product" → "Subscription"

2. **Create Products:**
   - Monthly: Product ID `monthly`, Billing period 1 month, Price IDR 29,000
   - Yearly: Product ID `yearly`, Billing period 1 year, Price IDR 290,000
   - Lifetime: Product ID `lifetime`, Type One-time product, Price IDR 499,000

3. **Link to RevenueCat:**
   - Get Service Account JSON from Google Cloud Console
   - Upload to RevenueCat Dashboard → Android App → Google Play Credentials

---

## 🧪 Testing

### Test SDK Initialization

Run app and check console for:
```
[App] Initializing RevenueCat...
[RevenueCat] SDK initialized successfully
[Auth] RevenueCat user identified
```

### Test Offerings Fetch

```typescript
import { getOfferings } from '../services/revenueCatService';

const offerings = await getOfferings();

if (offerings && offerings.current) {
  console.log('✅ Offerings loaded successfully!');
  console.log('Available packages:', offerings.current.availablePackages.length);
  console.log('Packages:', offerings.current.availablePackages.map(p => p.identifier));
  // Expected output: ['monthly', 'yearly', 'lifetime']
} else {
  console.log('❌ No offerings found. Check dashboard configuration.');
}
```

### Test Entitlement Checking

```typescript
import { hasProEntitlement, getSubscriptionStatus } from '../services/revenueCatService';

const isPro = await hasProEntitlement();
const status = await getSubscriptionStatus();

console.log('Is Pro?', isPro);
console.log('Tier:', status.tier);
console.log('Active?', status.isActive);
```

### Test Purchase Flow (Sandbox)

**iOS:**
1. Create sandbox Apple ID in App Store Connect
2. Sign out of App Store on device
3. Run app on device (not simulator)
4. Navigate to subscription screen
5. Tap "Upgrade to Premium"
6. Complete purchase with sandbox account
7. Verify entitlement granted
8. Check unlimited access to features

**Android:**
1. Add test account in Google Play Console
2. Run app on device
3. Navigate to subscription screen
4. Complete test purchase
5. Verify entitlement granted

### Test Restore Purchases

1. Delete and reinstall app
2. Sign in with same account
3. Tap "Restore Purchases" in Customer Center
4. Verify subscription restored
5. Check Pro access granted

---

## 🐛 Troubleshooting

### Issue: "No offerings available"

**Cause:** Products not configured or cache not cleared  
**Solution:**
1. Wait 5 minutes after creating offerings (RevenueCat cache)
2. Check offering is marked as "Current" in dashboard
3. Verify products attached to entitlement
4. Check API key is correct in code

### Issue: "Product not found"

**Cause:** Product IDs don't match  
**Solution:**
1. Verify Product IDs match exactly in:
   - RevenueCat Dashboard
   - App Store Connect / Play Console
   - App code (`monthly`, `yearly`, `lifetime`)
2. Case-sensitive! Use lowercase.

### Issue: "Entitlement not granted after purchase"

**Cause:** Products not attached to entitlement  
**Solution:**
1. Check products are attached to "razqashop Pro" entitlement
2. Verify entitlement ID matches in code (case-sensitive)
3. Test restore purchases
4. Check RevenueCat Dashboard → Customers → Your User

### Issue: "User not identified"

**Cause:** `identifyUser()` not called  
**Solution:**
- Check AuthContext integration
- Ensure `identifyUser()` is called in sign-in flow
- Verify user ID is passed correctly

### Issue: Purchase not syncing to Supabase

**Cause:** Database sync error  
**Solution:**
- Check `iap_receipts` table exists
- Verify RLS policies allow insert
- Check console for sync errors
- Test database connection

---

## ✅ Setup Complete Checklist

### SDK Integration (100% Complete)
- [x] Install react-native-purchases
- [x] Install react-native-purchases-ui
- [x] Create revenueCatService.ts (445 lines)
- [x] Create RevenueCatPaywall component (238 lines)
- [x] Create CustomerCenter component (277 lines)
- [x] Create useRevenueCat hook (95 lines)
- [x] Update app/_layout.tsx
- [x] Update AuthContext.tsx
- [x] Update usageLimitService.ts

### Dashboard Configuration (User Actions)
- [ ] Create RevenueCat account
- [ ] Configure iOS & Android apps
- [ ] Create 6 products (monthly, yearly, lifetime × 2)
- [ ] Create "razqashop Pro" entitlement
- [ ] Attach products to entitlement
- [ ] Create "default" offering as current
- [ ] Add 3 packages to offering
- [ ] Set up App Store Connect (iOS)
- [ ] Set up Google Play Console (Android)

### Testing
- [ ] Verify SDK initialization in console
- [ ] Test offerings fetch (should show 3 packages)
- [ ] Test sandbox purchase (iOS)
- [ ] Test test purchase (Android)
- [ ] Verify entitlement granted
- [ ] Test restore purchases
- [ ] Test subscription management UI
- [ ] Verify Supabase sync

### Production Readiness
- [ ] Replace test API key with production key
- [ ] Enable production mode in RevenueCat
- [ ] Submit for App Store review
- [ ] Submit for Play Store review
- [ ] Monitor analytics
- [ ] Track conversions

---

## 📊 Data Syncing

### Supabase Integration

Purchases are automatically synced to `iap_receipts` table:

```typescript
// Table structure
CREATE TABLE iap_receipts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  product_id TEXT NOT NULL,
  transaction_id TEXT UNIQUE NOT NULL,
  purchase_date TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  platform TEXT,
  receipt_data JSONB
);
```

**Sync happens automatically after purchase:**
```typescript
const syncCustomerInfoToSupabase = async (customerInfo, userId) => {
  await supabase.from('iap_receipts').upsert({
    user_id: userId,
    product_id: 'monthly',
    transaction_id: 'txn_123',
    purchase_date: new Date(),
    expires_at: '2025-02-12',
    is_active: true,
    platform: 'ios',
  });
};
```

---

## 💡 Key Features

### For Users
- ✅ Seamless purchase experience
- ✅ Restore purchases across devices
- ✅ Manage subscriptions in-app
- ✅ Clear pricing information
- ✅ Trial status visibility

### For Developers
- ✅ Simple API (hasProEntitlement())
- ✅ Automatic receipt validation
- ✅ Cross-platform support
- ✅ Real-time subscription updates
- ✅ TypeScript support with strict mode

### For Business
- ✅ Conversion tracking
- ✅ Customer insights
- ✅ Revenue analytics
- ✅ Churn prevention tools
- ✅ A/B testing support

---

## 📚 Resources

- **RevenueCat Docs:** https://www.revenuecat.com/docs
- **React Native SDK:** https://docs.revenuecat.com/docs/reactnative
- **Paywall UI:** https://docs.revenuecat.com/docs/paywalls
- **Customer Center:** https://docs.revenuecat.com/docs/customer-center
- **Community:** https://community.revenuecat.com
- **Support:** support@revenuecat.com

---

## 🎯 Quick Commands

```bash
# Test offerings fetch
npm start
# Navigate to subscription screen

# Check console logs
# Should see: "Offerings loaded successfully!"

# Test purchase (sandbox)
# Use sandbox Apple ID or test Google account

# Restore purchases
# Tap "Restore Purchases" in Customer Center
```

---

## 📈 Implementation Statistics

- **Total Lines Written:** 1,055+ lines
  - Service layer: 445 lines
  - UI components: 515 lines (238 + 277)
  - React hooks: 95 lines
- **Files Created:** 4
- **Files Modified:** 3
- **Package Dependencies:** 2
- **Implementation Time:** ~2 hours

---

**Status:** ✅ SDK Ready → ⏳ Dashboard Setup (30 min) → 🧪 Testing → 🚀 Production

**You are here:** ⏳ Dashboard Setup (Follow steps above to configure products and offerings!)

---

_For detailed implementation history and archived documentation, see `/docs/_archive/old-monetization/`_

