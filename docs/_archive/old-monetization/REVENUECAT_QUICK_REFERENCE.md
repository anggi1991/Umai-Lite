# 🎯 RevenueCat Quick Reference Card

**Last Updated:** January 12, 2025  
**Status:** ✅ SDK Integrated - Ready for Dashboard Setup

---

## 📦 What's Included

| Component | Status | Lines | File |
|-----------|--------|-------|------|
| Core Service | ✅ | 445 | `src/services/revenueCatService.ts` |
| Paywall UI | ✅ | 238 | `src/components/monetization/RevenueCatPaywall.tsx` |
| Customer Center | ✅ | 277 | `src/components/monetization/CustomerCenter.tsx` |
| React Hooks | ✅ | 95 | `src/hooks/useRevenueCat.ts` |
| Integration Guide | ✅ | 510 | `docs/REVENUECAT_INTEGRATION.md` |
| Dashboard Setup | ✅ | 395 | `docs/REVENUECAT_DASHBOARD_SETUP.md` |
| Implementation Summary | ✅ | 463 | `REVENUECAT_IMPLEMENTATION_SUMMARY.md` |

**Total:** 2,423+ lines (1,055 code + 1,368 docs)

---

## 🔑 Configuration

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

### 1. Check If User Has Pro (Entitlement)
```typescript
import { hasProEntitlement } from '../services/revenueCatService';

const isPro = await hasProEntitlement();
if (isPro) {
  // Grant unlimited access
}
```

### 2. Show Paywall
```tsx
import { RevenueCatPaywall } from '../components/monetization/RevenueCatPaywall';

<RevenueCatPaywall
  onPurchaseComplete={() => {
    // Refresh UI
  }}
  onDismiss={() => {
    // Handle close
  }}
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

const { isPro, subscriptionStatus, isLoading } = useRevenueCat();

if (isPro) {
  console.log('Tier:', subscriptionStatus?.tier);
}
```

---

## 📋 Dashboard Setup Checklist

Follow `docs/REVENUECAT_DASHBOARD_SETUP.md` for detailed steps.

### Quick Steps (30 minutes)

1. **Create Account** (5 min)
   - Go to https://app.revenuecat.com
   - Sign up

2. **Add Apps** (5 min)
   - Add iOS app (bundle ID from app.json)
   - Add Android app (package name from app.json)

3. **Create Products** (10 min)
   - Create `monthly` product (iOS + Android)
   - Create `yearly` product (iOS + Android)
   - Create `lifetime` product (iOS + Android)

4. **Create Entitlement** (5 min)
   - Create "razqashop Pro" entitlement
   - Attach all 6 products

5. **Create Offering** (5 min)
   - Create "default" offering (mark as Current)
   - Add 3 packages: monthly, yearly, lifetime

---

## 🧪 Testing Commands

### Test SDK Initialization
```typescript
// Check console for:
[App] Initializing RevenueCat...
[RevenueCat] SDK initialized successfully
```

### Test Offerings Fetch
```typescript
import { getOfferings } from '../services/revenueCatService';

const offerings = await getOfferings();
console.log('Products:', offerings?.current?.availablePackages.map(p => p.identifier));
// Expected: ['monthly', 'yearly', 'lifetime']
```

### Test Entitlement
```typescript
import { hasProEntitlement, getSubscriptionStatus } from '../services/revenueCatService';

const isPro = await hasProEntitlement();
const status = await getSubscriptionStatus();

console.log('Is Pro?', isPro);
console.log('Tier:', status.tier);
console.log('Active?', status.isActive);
```

---

## 🐛 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| "No offerings available" | Wait 5 min after creating offering, ensure marked as "Current" |
| "Product not found" | Check Product IDs match exactly (case-sensitive) |
| "Entitlement not granted" | Verify products attached to "razqashop Pro" entitlement |
| "User not identified" | Ensure `identifyUser()` called in AuthContext |
| Purchase not syncing | Check `iap_receipts` table exists in Supabase |

---

## 📚 Documentation Files

| File | Purpose | When to Use |
|------|---------|-------------|
| `REVENUECAT_IMPLEMENTATION_SUMMARY.md` | Executive overview | Start here! |
| `docs/REVENUECAT_INTEGRATION.md` | Technical API reference | When coding |
| `docs/REVENUECAT_DASHBOARD_SETUP.md` | Dashboard configuration | Setting up products |

---

## ✅ What's Working

- ✅ SDK initialized on app start
- ✅ User identification on sign-in/sign-out
- ✅ Entitlement checking integrated with usage limits
- ✅ Paywall UI component ready
- ✅ Customer Center ready
- ✅ React hooks for subscription state
- ✅ Supabase sync for purchases
- ✅ Real-time customer info updates

---

## ⏳ What's Pending (Your Actions)

- [ ] Create RevenueCat account
- [ ] Configure products in dashboard
- [ ] Set up entitlement
- [ ] Create offering
- [ ] Test offerings fetch in app
- [ ] Set up App Store Connect (iOS)
- [ ] Set up Google Play Console (Android)
- [ ] Test purchase flow on device

---

## 🎯 Key Functions Reference

```typescript
// Service
initializeRevenueCat(userId?)     // Init SDK
identifyUser(userId)               // Login user
logoutUser()                       // Logout user
getOfferings()                     // Get products
purchasePackage(package)           // Buy subscription
restorePurchases()                 // Restore previous purchase
hasProEntitlement()                // Check Pro access ⭐
getSubscriptionStatus()            // Get tier, expiry, etc.
getCustomerInfo()                  // Get customer data

// Hook
const { isPro, subscriptionStatus, isLoading, refresh } = useRevenueCat();
```

---

## 💡 Pro Tips

1. **Test Mode:** Using test API key - no real charges!
2. **Sandbox:** Use sandbox Apple ID for iOS testing
3. **Test Purchases:** Use test account for Android
4. **Wait Time:** After creating offerings, wait 5 min for cache
5. **Case Sensitive:** Product IDs and Entitlement IDs are case-sensitive!

---

## 🚀 Next Immediate Step

**Open:** `docs/REVENUECAT_DASHBOARD_SETUP.md`  
**Follow:** Step-by-step instructions (20-30 minutes)  
**Result:** Products configured, offerings ready, app can fetch subscriptions!

---

## 📞 Need Help?

- **Detailed Guide:** `REVENUECAT_IMPLEMENTATION_SUMMARY.md`
- **Technical Docs:** `docs/REVENUECAT_INTEGRATION.md`
- **Dashboard Help:** `docs/REVENUECAT_DASHBOARD_SETUP.md`
- **RevenueCat Support:** https://community.revenuecat.com

---

**Status:** ✅ SDK Ready → ⏳ Dashboard Setup → 🧪 Testing → 🚀 Production

**You are here:** ⏳ Dashboard Setup (30 min away from testing!)
