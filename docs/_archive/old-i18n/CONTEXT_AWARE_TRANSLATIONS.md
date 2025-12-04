# Context-Aware Translation Features

## 📋 Overview

Parenting AI now supports advanced context-aware translation features including pluralization, locale-specific date/time formatting, and number formatting.

---

## ✨ Features

### 1. Pluralization Support

Handle singular and plural forms automatically based on count.

#### Usage

```typescript
import { useTranslation } from '@/hooks/useTranslation';

function MyComponent() {
  const { plural } = useTranslation();
  
  return (
    <View>
      <Text>{plural('common.day', 1)}</Text>  {/* "1 day" */}
      <Text>{plural('common.day', 5)}</Text>  {/* "5 days" */}
    </View>
  );
}
```

#### Language-Specific Rules

- **Indonesian (id)**: No plural distinction - uses same form
- **English (en)**: one/other - "1 day" vs "2 days"
- **Japanese (jp)**: No plural distinction - uses same form
- **Chinese (zh)**: No plural distinction - uses same form

#### Translation Structure

For languages with plural forms (like English), add plural keys:

```typescript
// en.ts
{
  common: {
    day_one: '{{count}} day',
    day_other: '{{count}} days',
    hour_one: '{{count}} hour',
    hour_other: '{{count}} hours',
  }
}

// id.ts (no plural distinction)
{
  common: {
    day: '{{count}} hari',
    hour: '{{count}} jam',
  }
}
```

---

### 2. Number Formatting

Format numbers according to locale conventions (decimal separators, thousand separators).

#### Usage

```typescript
const { formatNumber } = useTranslation();

// Basic formatting
formatNumber(1234.56);
// id-ID: 1.234,56
// en-US: 1,234.56
// ja-JP: 1,234.56
// zh-CN: 1,234.56

// Currency formatting
formatNumber(1234.56, { 
  style: 'currency', 
  currency: 'USD' 
});
// en-US: $1,234.56
// id-ID: US$1.234,56

// Percentage
formatNumber(0.85, { 
  style: 'percent' 
});
// All: 85%

// Custom decimal places
formatNumber(1234.56789, { 
  minimumFractionDigits: 2,
  maximumFractionDigits: 2 
});
// Result: 1,234.57 (or locale equivalent)
```

#### Options

```typescript
interface NumberFormatOptions {
  style?: 'decimal' | 'currency' | 'percent' | 'unit';
  currency?: string; // 'USD', 'IDR', 'JPY', 'CNY'
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  minimumIntegerDigits?: number;
  useGrouping?: boolean;
}
```

---

### 3. Date/Time Formatting

Format dates and times according to locale conventions.

#### Usage

```typescript
const { formatDate } = useTranslation();

const date = new Date('2025-11-12T10:30:00');

// Full date
formatDate(date, { 
  dateStyle: 'full' 
});
// id-ID: Rabu, 12 November 2025
// en-US: Wednesday, November 12, 2025
// ja-JP: 2025年11月12日水曜日
// zh-CN: 2025年11月12日星期三

// Short date
formatDate(date, { 
  dateStyle: 'short' 
});
// id-ID: 12/11/25
// en-US: 11/12/25
// ja-JP: 2025/11/12
// zh-CN: 2025/11/12

// Time only
formatDate(date, { 
  timeStyle: 'short' 
});
// id-ID: 10.30
// en-US: 10:30 AM
// ja-JP: 10:30
// zh-CN: 上午10:30

// Custom format
formatDate(date, {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
});
// id-ID: 12 November 2025 pukul 10.30
// en-US: November 12, 2025 at 10:30 AM
```

#### Options

```typescript
interface DateTimeFormatOptions {
  dateStyle?: 'full' | 'long' | 'medium' | 'short';
  timeStyle?: 'full' | 'long' | 'medium' | 'short';
  year?: 'numeric' | '2-digit';
  month?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';
  day?: 'numeric' | '2-digit';
  hour?: 'numeric' | '2-digit';
  minute?: 'numeric' | '2-digit';
  second?: 'numeric' | '2-digit';
  weekday?: 'long' | 'short' | 'narrow';
  hour12?: boolean;
}
```

---

### 4. Relative Time Formatting

Format time relative to now (e.g., "2 hours ago", "in 3 days").

#### Usage

```typescript
const { formatRelativeTime } = useTranslation();

const pastDate = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
formatRelativeTime(pastDate);
// id-ID: 2 jam yang lalu
// en-US: 2 hours ago
// ja-JP: 2 時間前
// zh-CN: 2小时前

const futureDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days from now
formatRelativeTime(futureDate);
// id-ID: dalam 3 hari
// en-US: in 3 days
// ja-JP: 3 日後
// zh-CN: 3天后
```

#### Supported Units

- seconds
- minutes
- hours
- days
- weeks
- months
- years

---

## 🎯 Real-World Examples

### Example 1: Activity Timeline

```typescript
function ActivityItem({ activity }: { activity: Activity }) {
  const { t, formatRelativeTime, formatNumber } = useTranslation();
  
  return (
    <View>
      <Text>{t(`activities.${activity.type}`)}</Text>
      <Text>{formatRelativeTime(activity.timestamp)}</Text>
      {activity.duration && (
        <Text>
          {t('activities.duration')}: {formatNumber(activity.duration)} {t('common.minutes')}
        </Text>
      )}
    </View>
  );
}

// Output:
// Feeding
// 2 hours ago
// Duration: 15 minutes
```

### Example 2: Growth Statistics

```typescript
function GrowthCard({ weight, height }: { weight: number; height: number }) {
  const { t, formatNumber, formatDate } = useTranslation();
  
  return (
    <Card>
      <Text>{t('statistics.weight')}: {formatNumber(weight, { minimumFractionDigits: 1 })} kg</Text>
      <Text>{t('statistics.height')}: {formatNumber(height, { minimumFractionDigits: 1 })} cm</Text>
      <Text>{formatDate(new Date(), { dateStyle: 'medium' })}</Text>
    </Card>
  );
}

// Output (en-US):
// Weight: 12.5 kg
// Height: 85.0 cm
// Nov 12, 2025
```

### Example 3: Notification Badge

```typescript
function NotificationBadge({ count }: { count: number }) {
  const { plural } = useTranslation();
  
  return (
    <Badge>
      {plural('common.notification', count)}
    </Badge>
  );
}

// Output:
// count = 1: "1 notification"
// count = 5: "5 notifications"
```

### Example 4: Subscription Pricing

```typescript
function PricingCard({ price, currency }: { price: number; currency: string }) {
  const { formatNumber, t } = useTranslation();
  
  return (
    <Card>
      <Text>
        {formatNumber(price, { 
          style: 'currency', 
          currency 
        })} / {t('subscription.perMonth')}
      </Text>
    </Card>
  );
}

// Output (id-ID):
// Rp49.000 / bulan

// Output (en-US):
// $4.99 / month
```

---

## 🛠️ Translation Validation Tool

A script to validate translation consistency across all languages.

### Run Validation

```bash
node scripts/validate-translations.js
```

### What It Checks

- ✅ All languages have the same keys
- ✅ Parameter placeholders are consistent
- ✅ No missing translations
- ✅ No duplicate keys

### Sample Output

```
🔍 Starting Translation Validation...

📂 Loading translation files...
  ✓ id.ts loaded
  ✓ en.ts loaded
  ✓ jp.ts loaded
  ✓ zh.ts loaded

📋 Extracting translation keys...
  id: 654 keys
  en: 654 keys
  jp: 654 keys
  zh: 654 keys

🔎 Checking for missing keys...
  ✓ All languages have the same keys

🔧 Checking parameter consistency...
  ✓ All parameters are consistent

📊 Validation Summary:
  Total languages: 4
  Total keys per language: 654
  Total translations: 2616

✅ Validation completed successfully!
```

---

## 📝 Best Practices

### 1. Use Pluralization Consistently

```typescript
// ✅ Good
plural('common.day', count)

// ❌ Avoid
count === 1 ? t('common.day') : t('common.days')
```

### 2. Format Numbers for Display

```typescript
// ✅ Good
<Text>{formatNumber(weight, { minimumFractionDigits: 1 })} kg</Text>

// ❌ Avoid
<Text>{weight.toFixed(1)} kg</Text>
```

### 3. Use Relative Time for Recent Events

```typescript
// ✅ Good - for recent activities
<Text>{formatRelativeTime(activity.timestamp)}</Text>

// ✅ Also good - for historical records
<Text>{formatDate(activity.timestamp, { dateStyle: 'medium' })}</Text>
```

### 4. Let the System Handle Locale

```typescript
// ✅ Good - system handles locale
formatDate(date, { dateStyle: 'short' })

// ❌ Avoid - hardcoded format
date.toISOString().split('T')[0]
```

---

## 🌍 Locale-Specific Behavior

### Indonesian (id-ID)
- Decimal separator: `,` (comma)
- Thousands separator: `.` (dot)
- Date format: DD/MM/YYYY
- Time format: 24-hour (HH.mm)

### English (en-US)
- Decimal separator: `.` (dot)
- Thousands separator: `,` (comma)
- Date format: MM/DD/YYYY
- Time format: 12-hour (h:mm AM/PM)

### Japanese (ja-JP)
- Decimal separator: `.` (dot)
- Thousands separator: `,` (comma)
- Date format: YYYY/MM/DD
- Time format: 24-hour (HH:mm)
- Year format: 2025年

### Chinese (zh-CN)
- Decimal separator: `.` (dot)
- Thousands separator: `,` (comma)
- Date format: YYYY/MM/DD
- Time format: 12-hour with 上午/下午
- Date format: 2025年11月12日

---

## 🔧 Advanced Usage

### Custom Locale Formatting

```typescript
// Weight in different locales
const weight = 12.345;

formatNumber(weight, {
  minimumFractionDigits: 1,
  maximumFractionDigits: 2,
  useGrouping: false
});
// All locales: 12.35 (or 12,35 for id-ID)
```

### Date Range Formatting

```typescript
function DateRange({ startDate, endDate }: { startDate: Date; endDate: Date }) {
  const { formatDate } = useTranslation();
  
  return (
    <Text>
      {formatDate(startDate, { month: 'short', day: 'numeric' })} - 
      {formatDate(endDate, { month: 'short', day: 'numeric', year: 'numeric' })}
    </Text>
  );
}
// Output: Nov 1 - Nov 30, 2025
```

### Conditional Formatting

```typescript
function ActivityAge({ timestamp }: { timestamp: Date }) {
  const { formatRelativeTime, formatDate } = useTranslation();
  
  const isRecent = Date.now() - timestamp.getTime() < 24 * 60 * 60 * 1000;
  
  return (
    <Text>
      {isRecent 
        ? formatRelativeTime(timestamp)
        : formatDate(timestamp, { dateStyle: 'medium' })
      }
    </Text>
  );
}
// Recent: "2 hours ago"
// Older: "Nov 10, 2025"
```

---

## 🚀 Migration Guide

### Before (Manual Formatting)

```typescript
// Old way
function OldComponent({ days }: { days: number }) {
  const { t } = useTranslation();
  return <Text>{days} {days === 1 ? t('day') : t('days')}</Text>;
}
```

### After (Context-Aware)

```typescript
// New way
function NewComponent({ days }: { days: number }) {
  const { plural } = useTranslation();
  return <Text>{plural('common.day', days)}</Text>;
}
```

---

## 📊 Performance Notes

- All formatting functions use native `Intl` APIs
- Formatting is cached when possible
- Minimal performance impact
- No external dependencies required

---

## 🐛 Troubleshooting

### Issue: Formatting not working

```typescript
// Check if locale is supported
console.log('Current locale:', i18n.getLocale());

// Test formatting
console.log(formatNumber(1234.56));
console.log(formatDate(new Date()));
```

### Issue: Plural forms not showing

```typescript
// Check if plural keys exist in translation file
// For English, you need both _one and _other variants
{
  common: {
    day_one: '{{count}} day',
    day_other: '{{count}} days'
  }
}
```

---

**Last Updated:** November 12, 2025  
**Version:** 2.1.0  
**Status:** ✅ Complete and Production Ready
