# Dynamic Pricing Implementation Guide

## 📋 Overview

Sistem dynamic pricing yang mendeteksi lokasi user dan menampilkan harga dalam mata uang lokal mereka. Applicable untuk website dan mobile app.

---

## 💰 Supported Currencies

| Currency | Code | Symbol | Free | Premium | Family | Region |
|----------|------|--------|------|---------|--------|--------|
| Indonesian Rupiah | IDR | Rp | 0 | 49,000 | 79,000 | Indonesia |
| US Dollar | USD | $ | 0 | 3.99 | 5.99 | United States, International |
| Japanese Yen | JPY | ¥ | 0 | 450 | 690 | Japan |
| Euro | EUR | € | 0 | 3.49 | 5.49 | Europe (DE, FR, IT, ES, NL) |
| British Pound | GBP | £ | 0 | 2.99 | 4.99 | United Kingdom |
| Australian Dollar | AUD | A$ | 0 | 5.99 | 8.99 | Australia |
| Singapore Dollar | SGD | S$ | 0 | 4.99 | 7.99 | Singapore |
| Chinese Yuan | CNY | ¥ | 0 | 22 | 35 | China Mainland |
**Note**: Pricing adalah estimasi berdasarkan purchasing power parity (PPP). Dapat di-adjust sesuai strategi pricing.

---

## 🌐 Website Implementation

### Current Status (November 14, 2025)

**✅ Phase 1 Completed**: Static IDR with note
```tsx
// app/page.tsx
const pricing = {
  free: 'Rp 0',
  premium: 'Rp 49K',
  family: 'Rp 79K',
};
```

Display note:
> "Prices shown in IDR (Indonesian Rupiah). Pricing varies by region."

**⏳ Phase 2 Pending**: Client-side detection

### Implementation Steps

#### 1. Create Currency Utils (`lib/utils/currency.ts`)

✅ Already created with:
- Type definitions for Currency
- PricingData interface
- PRICING_MAP for all currencies
- getPricing() function

#### 2. Create Client Component for Dynamic Pricing

```tsx
// app/components/PricingSelector.tsx
'use client';

import { useEffect, useState } from 'react';

type Currency = 'IDR' | 'USD' | 'JPY' | 'EUR' | 'GBP' | 'AUD' | 'SGD';

interface PricingData {
  free: string;
  premium: string;
  family: string;
  code: Currency;
}

const PRICING_MAP: Record<Currency, PricingData> = {
  IDR: { free: 'Rp 0', premium: 'Rp 49K', family: 'Rp 79K', code: 'IDR' },
  USD: { free: '$0', premium: '$3.99', family: '$5.99', code: 'USD' },
  JPY: { free: '¥0', premium: '¥450', family: '¥690', code: 'JPY' },
  EUR: { free: '€0', premium: '€3.49', family: '€5.49', code: 'EUR' },
  GBP: { free: '£0', premium: '£2.99', family: '£4.99', code: 'GBP' },
  AUD: { free: 'A$0', premium: 'A$5.99', family: 'A$8.99', code: 'AUD' },
  SGD: { free: 'S$0', premium: 'S$4.99', family: 'S$7.99', code: 'SGD' },
};

export function useCurrencyDetection() {
  const [pricing, setPricing] = useState<PricingData>(PRICING_MAP.IDR);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function detectCurrency() {
      try {
        // Try IP geolocation API
        const response = await fetch('https://ipapi.co/json/');
        if (response.ok) {
          const data = await response.json();
          const countryCode = data.country_code as string;
          
          // Map country to currency
          const currencyMap: Record<string, Currency> = {
            ID: 'IDR', US: 'USD', JP: 'JPY',
            DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR', NL: 'EUR',
            GB: 'GBP', AU: 'AUD', SG: 'SGD',
          };
          
          const currency = currencyMap[countryCode] || 'IDR';
          setPricing(PRICING_MAP[currency]);
        }
      } catch (error) {
        console.error('Currency detection failed:', error);
        // Fallback to IDR
        setPricing(PRICING_MAP.IDR);
      } finally {
        setLoading(false);
      }
    }

    detectCurrency();
  }, []);

  return { pricing, loading };
}
```

#### 3. Update page.tsx to use Client Component

```tsx
// app/page.tsx
import { PricingSection } from './components/PricingSection';

export default function Home() {
  return (
    <div>
      {/* ... other sections ... */}
      <PricingSection />
    </div>
  );
}
```

```tsx
// app/components/PricingSection.tsx
'use client';

import { useCurrencyDetection } from './PricingSelector';

export function PricingSection() {
  const { pricing, loading } = useCurrencyDetection();

  const plans = [
    {
      name: 'Free',
      price: pricing.free,
      period: 'forever',
      features: [/* ... */],
    },
    {
      name: 'Premium',
      price: pricing.premium,
      period: 'per month',
      badge: 'MOST POPULAR',
      features: [/* ... */],
    },
    {
      name: 'Family',
      price: pricing.family,
      period: 'per month',
      badge: 'FAMILY',
      features: [/* ... */],
    },
  ];

  if (loading) {
    return <PricingSkeletonLoader />;
  }

  return (
    <section id="pricing" className="py-16 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2>Choose Your Plan</h2>
          <p>Prices in {pricing.code}</p>
        </div>
        {/* Render plans */}
      </div>
    </section>
  );
}
```

#### 4. Add Currency Selector (Optional)

```tsx
// app/components/CurrencySelector.tsx
'use client';

export function CurrencySelector() {
  const currencies = ['IDR', 'USD', 'JPY', 'EUR', 'GBP', 'AUD', 'SGD'];
  
  return (
    <select className="px-4 py-2 border rounded-lg">
      {currencies.map(curr => (
        <option key={curr} value={curr}>{curr}</option>
      ))}
    </select>
  );
}
```

---

## 📱 Mobile App Implementation (React Native)

### Setup AsyncStorage for Currency Preference

```typescript
// src/utils/currency.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

const CURRENCY_KEY = '@parenting_ai_currency';

export async function detectUserCurrency(): Promise<Currency> {
  try {
    // Check if user has manually selected currency
    const savedCurrency = await AsyncStorage.getItem(CURRENCY_KEY);
    if (savedCurrency) {
      return savedCurrency as Currency;
    }
    
    // Detect from device locale
    const locale = Localization.locale; // "en-US", "id-ID", "ja-JP"
    const country = locale.split('-')[1];
    
    const countryToCurrency: Record<string, Currency> = {
      ID: 'IDR',
      US: 'USD',
      JP: 'JPY',
      DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR', NL: 'EUR',
      GB: 'GBP',
      AU: 'AUD',
      SG: 'SGD',
    };
    
    return countryToCurrency[country] || 'IDR';
  } catch (error) {
    console.error('Currency detection failed:', error);
    return 'IDR';
  }
}

export async function saveCurrencyPreference(currency: Currency) {
  await AsyncStorage.setItem(CURRENCY_KEY, currency);
}
```

### Create Currency Context

```typescript
// src/contexts/CurrencyContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { detectUserCurrency, getPricing, type Currency, type PricingData } from '../utils/currency';

interface CurrencyContextType {
  currency: Currency;
  pricing: PricingData;
  setCurrency: (currency: Currency) => Promise<void>;
  loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('IDR');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initialize() {
      const detected = await detectUserCurrency();
      setCurrencyState(detected);
      setLoading(false);
    }
    initialize();
  }, []);

  const setCurrency = async (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    await saveCurrencyPreference(newCurrency);
  };

  const pricing = getPricing(currency);

  return (
    <CurrencyContext.Provider value={{ currency, pricing, setCurrency, loading }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
}
```

### Update Subscription Screen

```typescript
// src/screens/Subscription/Subscription.tsx
import { useCurrency } from '../../contexts/CurrencyContext';

export function SubscriptionScreen() {
  const { pricing, currency, loading } = useCurrency();

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: pricing.free,
      period: 'forever',
      features: [/* ... */],
    },
    {
      id: 'premium',
      name: 'Premium',
      price: pricing.premium,
      period: 'per month',
      features: [/* ... */],
    },
    {
      id: 'family',
      name: 'Family',
      price: pricing.family,
      period: 'per month',
      features: [/* ... */],
    },
  ];

  if (loading) {
    return <ActivityIndicator />;
  }

  return (
    <ScrollView>
      <Text style={styles.currency}>Prices in {currency}</Text>
      {plans.map(plan => (
        <PricingCard key={plan.id} plan={plan} />
      ))}
    </ScrollView>
  );
}
```

### Add Currency Selector in Settings

```typescript
// src/screens/Settings/Settings.tsx
import { useCurrency } from '../../contexts/CurrencyContext';

export function SettingsScreen() {
  const { currency, setCurrency } = useCurrency();
  const currencies = ['IDR', 'USD', 'JPY', 'EUR', 'GBP', 'AUD', 'SGD'];

  return (
    <View>
      <Text>Currency / Region</Text>
      <Picker
        selectedValue={currency}
        onValueChange={(value) => setCurrency(value as Currency)}
      >
        {currencies.map(curr => (
          <Picker.Item key={curr} label={curr} value={curr} />
        ))}
      </Picker>
    </View>
  );
}
```

---

## 🔗 Integration dengan Payment Gateway

### RevenueCat Setup

```typescript
// src/services/revenueCat.ts
import Purchases from 'react-native-purchases';

const PRODUCT_IDS: Record<Currency, { premium: string; family: string }> = {
  IDR: { premium: 'premium_idr_monthly', family: 'family_idr_monthly' },
  USD: { premium: 'premium_usd_monthly', family: 'family_usd_monthly' },
  JPY: { premium: 'premium_jpy_monthly', family: 'family_jpy_monthly' },
  // ... etc
};

export async function purchaseSubscription(planId: string, currency: Currency) {
  try {
    const productId = planId === 'premium' 
      ? PRODUCT_IDS[currency].premium 
      : PRODUCT_IDS[currency].family;
    
    const { customerInfo } = await Purchases.purchaseProduct(productId);
    return customerInfo;
  } catch (error) {
    console.error('Purchase failed:', error);
    throw error;
  }
}
```

### Google Play & App Store Configuration

**App Store Connect**:
1. Navigate to Pricing & Availability
2. Set base price tier (e.g., Tier 3 = $3.99 USD)
3. Apple automatically converts to local currencies
4. Manual adjustments available per region

**Google Play Console**:
1. Go to Monetize → Subscriptions
2. Set base price in USD
3. Enable "Use automatically converted prices"
4. Or manually set for each country

---

## 🧪 Testing

### Test Currency Detection

```typescript
// __tests__/currency.test.ts
import { detectUserCurrency, getPricing } from '../utils/currency';

describe('Currency Detection', () => {
  test('should detect IDR for Indonesian users', async () => {
    // Mock location to Indonesia
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ country_code: 'ID' }),
    });
    
    const currency = await detectUserCurrency();
    expect(currency).toBe('IDR');
  });

  test('should return correct pricing for USD', () => {
    const pricing = getPricing('USD');
    expect(pricing.premium).toBe('$3.99');
    expect(pricing.family).toBe('$5.99');
  });
});
```

### Manual Testing Checklist

- [ ] Test with VPN dari berbagai negara
- [ ] Verify pricing display benar untuk setiap currency
- [ ] Test fallback ke IDR jika detection gagal
- [ ] Test currency selector di Settings
- [ ] Verify purchase flow dengan RevenueCat
- [ ] Test offline behavior (use cached currency)

---

## 📊 Analytics & Monitoring

### Track Currency Usage

```typescript
// src/utils/analytics.ts
import analytics from '@react-native-firebase/analytics';

export function trackCurrencyChanged(oldCurrency: Currency, newCurrency: Currency) {
  analytics().logEvent('currency_changed', {
    old_currency: oldCurrency,
    new_currency: newCurrency,
    timestamp: new Date().toISOString(),
  });
}

export function trackPricingViewed(currency: Currency) {
  analytics().logEvent('pricing_viewed', {
    currency,
    timestamp: new Date().toISOString(),
  });
}
```

### Monitor Conversion Rates by Currency

Create dashboard di Firebase Analytics untuk track:
- Subscription conversion rate per currency
- Average revenue per user (ARPU) per region
- Churn rate per currency
- Popular plans per region

---

## 🚀 Deployment Checklist

### Website

- [x] Create currency.ts utils
- [ ] Create client-side detection component
- [ ] Update pricing section to use dynamic pricing
- [ ] Add currency selector (optional)
- [ ] Test dengan VPN
- [ ] Deploy to Netlify

### Mobile App

- [ ] Install expo-localization: `npm install expo-localization`
- [ ] Create currency utils
- [ ] Create CurrencyContext
- [ ] Wrap app dengan CurrencyProvider
- [ ] Update Subscription screen
- [ ] Add currency selector to Settings
- [ ] Configure RevenueCat products per currency
- [ ] Test with TestFlight/Internal Testing
- [ ] Submit to App Store/Google Play

---

## 💡 Future Enhancements

1. **Smart Pricing Recommendations**
   - Use ML to recommend optimal pricing per region
   - A/B test different price points

2. **Purchasing Power Parity (PPP) Adjustment**
   - Automatically adjust prices based on PPP index
   - Make premium features more accessible in developing countries

3. **Dynamic Discounts**
   - Show special offers based on user location
   - Regional promotions (e.g., Ramadan in Indonesia)

4. **Multi-Currency Wallet**
   - Allow users to see all currencies
   - Compare prices across regions

5. **Crypto Payment Support**
   - Accept Bitcoin, Ethereum for subscriptions
   - Universal pricing regardless of location

---

**Status**: Phase 1 Complete (Static with note)  
**Priority**: Medium (Can be implemented post-launch)  
**Estimated Time**: 3-4 hours for full implementation
