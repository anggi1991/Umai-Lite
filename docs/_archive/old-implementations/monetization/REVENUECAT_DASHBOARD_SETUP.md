# 🚀 RevenueCat Dashboard Setup - Quick Start

**Time Required:** 20-30 minutes  
**Goal:** Configure products and entitlements in RevenueCat Dashboard

---

## 📋 Prerequisites

- [ ] RevenueCat account created
- [ ] API key already in app: `test_GrJfMWRWqLTeIJSBnfYxbtSXEOw`
- [ ] SDK integrated in app (✅ Done)

---

## 🎯 Step-by-Step Setup

### Step 1: Create App in RevenueCat Dashboard

1. Go to **https://app.revenuecat.com**
2. Sign in to your account
3. Click **"Create New Project"** (if first time)
4. Name project: **"Parenting AI Assistant"**
5. Click **"Create"**

---

### Step 2: Add iOS App

1. In your project, click **"Add App"**
2. Select **"iOS"**
3. Fill in details:
   - **App Name:** Parenting AI (iOS)
   - **Bundle ID:** `com.yourcompany.parentingai` (from app.json)
   - **Shared Secret:** Get from App Store Connect (later)
4. Click **"Create App"**
5. Note: You can add Shared Secret later when you set up App Store Connect

---

### Step 3: Add Android App

1. Click **"Add App"** again
2. Select **"Android"**
3. Fill in details:
   - **App Name:** Parenting AI (Android)
   - **Package Name:** `com.yourcompany.parentingai` (from app.json)
4. Click **"Create App"**
5. Note: Google Play credentials can be added later

---

### Step 4: Create Products

#### 4.1 Create Monthly Product

1. Go to **"Products"** tab
2. Click **"Add Product"**
3. Select platform: **iOS** first
4. Fill in:
   - **Product ID:** `monthly`
   - **Type:** Auto-renewable subscription
   - **Duration:** 1 month
5. Click **"Create"**
6. Repeat for **Android** with same Product ID: `monthly`

#### 4.2 Create Yearly Product

1. Click **"Add Product"**
2. Select platform: **iOS**
3. Fill in:
   - **Product ID:** `yearly`
   - **Type:** Auto-renewable subscription
   - **Duration:** 1 year
4. Click **"Create"**
5. Repeat for **Android** with same Product ID: `yearly`

#### 4.3 Create Lifetime Product

1. Click **"Add Product"**
2. Select platform: **iOS**
3. Fill in:
   - **Product ID:** `lifetime`
   - **Type:** Non-consumable
4. Click **"Create"**
5. Repeat for **Android** with same Product ID: `lifetime`

---

### Step 5: Create Entitlement

1. Go to **"Entitlements"** tab
2. Click **"Add Entitlement"**
3. Fill in:
   - **Entitlement ID:** `razqashop Pro` (must match exactly!)
   - **Description:** Pro subscription access to all features
4. Click **"Create"**

---

### Step 6: Attach Products to Entitlement

1. In **"razqashop Pro"** entitlement, click **"Attach Products"**
2. Select all three products:
   - [x] monthly (iOS)
   - [x] monthly (Android)
   - [x] yearly (iOS)
   - [x] yearly (Android)
   - [x] lifetime (iOS)
   - [x] lifetime (Android)
3. Click **"Attach"**

---

### Step 7: Create Offering

1. Go to **"Offerings"** tab
2. Click **"Create Offering"**
3. Fill in:
   - **Offering ID:** `default`
   - **Description:** Default subscription offering
   - **Current Offering:** ✅ Yes (make this the current offering)
4. Click **"Create"**

---

### Step 8: Add Packages to Offering

#### 8.1 Add Monthly Package

1. In **"default"** offering, click **"Add Package"**
2. Fill in:
   - **Package ID:** `monthly`
   - **Product:** Select `monthly` from dropdown
   - **Position:** 1
3. Click **"Add"**

#### 8.2 Add Yearly Package

1. Click **"Add Package"** again
2. Fill in:
   - **Package ID:** `yearly`
   - **Product:** Select `yearly` from dropdown
   - **Position:** 2
3. Click **"Add"**

#### 8.3 Add Lifetime Package

1. Click **"Add Package"** again
2. Fill in:
   - **Package ID:** `lifetime`
   - **Product:** Select `lifetime` from dropdown
   - **Position:** 3
3. Click **"Add"**

---

### Step 9: Verify Configuration

✅ **Checklist:**
- [ ] iOS app created
- [ ] Android app created
- [ ] 3 products created (monthly, yearly, lifetime) for both platforms
- [ ] Entitlement "razqashop Pro" created
- [ ] All 6 products attached to entitlement
- [ ] Offering "default" created as current offering
- [ ] 3 packages added to offering (monthly, yearly, lifetime)

---

### Step 10: Test Configuration in App

Run this code in your app to verify setup:

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

---

## 🍎 App Store Connect Setup (iOS)

### Prerequisites
- Apple Developer Account ($99/year)
- App registered in App Store Connect

### Steps

1. **Create In-App Purchases:**
   - Go to App Store Connect → Your App → In-App Purchases
   - Click **"+"** → **Auto-Renewable Subscription**
   - Create subscription group: "Parenting AI Pro"
   
2. **Create Monthly Subscription:**
   - Product ID: `monthly` (must match RevenueCat)
   - Reference Name: "Monthly Premium"
   - Duration: 1 month
   - Price: Rp 29,000 (Indonesia)

3. **Create Yearly Subscription:**
   - Product ID: `yearly` (must match RevenueCat)
   - Reference Name: "Yearly Premium"
   - Duration: 1 year
   - Price: Rp 290,000 (Indonesia)

4. **Create Lifetime Purchase:**
   - Product ID: `lifetime` (must match RevenueCat)
   - Type: Non-Consumable
   - Reference Name: "Lifetime Access"
   - Price: Rp 499,000 (Indonesia)

5. **Get Shared Secret:**
   - In App Store Connect, go to App-Specific Shared Secret
   - Copy the secret
   - Paste in RevenueCat Dashboard → iOS App → Shared Secret

---

## 🤖 Google Play Console Setup (Android)

### Prerequisites
- Google Play Developer Account ($25 one-time)
- App registered in Play Console

### Steps

1. **Create In-App Products:**
   - Go to Play Console → Your App → Monetization → Products
   - Click **"Create product"** → **Subscription**

2. **Create Monthly Subscription:**
   - Product ID: `monthly` (must match RevenueCat)
   - Name: "Monthly Premium"
   - Billing period: 1 month
   - Price: IDR 29,000

3. **Create Yearly Subscription:**
   - Product ID: `yearly` (must match RevenueCat)
   - Name: "Yearly Premium"
   - Billing period: 1 year
   - Price: IDR 290,000

4. **Create Lifetime Purchase:**
   - Product ID: `lifetime` (must match RevenueCat)
   - Type: One-time product (non-consumable)
   - Name: "Lifetime Access"
   - Price: IDR 499,000

5. **Link to RevenueCat:**
   - Get Service Account JSON from Google Cloud Console
   - Upload to RevenueCat Dashboard → Android App → Google Play Credentials

---

## 🧪 Testing Configuration

### Test in Development

1. **Run app:**
   ```bash
   npm start
   ```

2. **Check logs for RevenueCat initialization:**
   ```
   [App] Initializing RevenueCat...
   [RevenueCat] SDK initialized successfully
   ```

3. **Test offerings fetch:**
   - Navigate to subscription screen
   - Should see loading → products displayed

4. **Test purchase flow (Sandbox):**
   - iOS: Use sandbox Apple ID
   - Android: Use test account
   - Click "Upgrade to Premium"
   - Complete purchase
   - Verify entitlement granted

---

## 🔍 Troubleshooting

### Issue: "No offerings available"

**Solution:**
1. Wait 5 minutes after creating offerings (cache)
2. Check offering is marked as "Current"
3. Verify products attached to entitlement
4. Check API key is correct in code

### Issue: "Product not found"

**Solution:**
1. Verify Product IDs match exactly in:
   - RevenueCat Dashboard
   - App Store Connect / Play Console
   - App code (`monthly`, `yearly`, `lifetime`)
2. Case-sensitive! Use lowercase.

### Issue: "Entitlement not granted after purchase"

**Solution:**
1. Check products are attached to "razqashop Pro" entitlement
2. Verify entitlement ID matches in code (case-sensitive)
3. Test restore purchases
4. Check RevenueCat Dashboard → Customers → Your User

---

## ✅ Setup Complete Checklist

- [ ] RevenueCat account created
- [ ] iOS app added to RevenueCat
- [ ] Android app added to RevenueCat
- [ ] 3 products created for both platforms (6 total)
- [ ] Entitlement "razqashop Pro" created
- [ ] Products attached to entitlement
- [ ] Offering "default" created as current
- [ ] 3 packages added to offering
- [ ] Configuration verified in app logs
- [ ] App Store Connect products created (iOS)
- [ ] Google Play Console products created (Android)
- [ ] Sandbox purchase tested (iOS)
- [ ] Test purchase tested (Android)

---

## 📚 Next Steps

After dashboard setup:

1. **Update Checklist:**
   - Mark RevenueCat configuration tasks as complete
   - In `docs/MONETIZATION_LAUNCH_CHECKLIST.md`

2. **Test Purchase Flow:**
   - Use TestFlight (iOS)
   - Use Internal Testing (Android)
   - Verify entitlement granted
   - Verify unlimited access to features

3. **Production Readiness:**
   - Replace test API key with production key
   - Enable production mode in RevenueCat
   - Submit for App Store / Play Store review

---

## 🆘 Need Help?

- **RevenueCat Docs:** https://docs.revenuecat.com
- **Community:** https://community.revenuecat.com
- **Support:** support@revenuecat.com

---

**Setup Time:** ~20-30 minutes  
**Status:** 📋 Ready to Configure  
**Last Updated:** January 12, 2025
