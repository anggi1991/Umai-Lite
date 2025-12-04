# Multi-Language Support (i18n) Implementation

## 📋 Overview

Aplikasi **Parenting AI** kini mendukung multi-bahasa (internationalization/i18n) dengan bahasa default **Bahasa Indonesia** dan bahasa tambahan **English**.

---

## 🏗️ Architecture

### Folder Structure
```
src/
├── i18n/
│   ├── index.ts                 # i18n service (core logic)
│   └── translations/
│       ├── index.ts             # Translation exports
│       ├── id.ts                # Indonesian translations
│       └── en.ts                # English translations
├── hooks/
│   └── useTranslation.ts        # React hook for i18n
```

### Components
1. **I18nService** (`i18n/index.ts`)
   - Manages current language state
   - Handles language switching
   - Provides translation function `t(key, params)`
   - Persists language preference to AsyncStorage

2. **useTranslation Hook** (`hooks/useTranslation.ts`)
   - React hook for components
   - Returns `{ t, language, setLanguage }`
   - Auto-updates when language changes

3. **Translation Files**
   - `id.ts`: Bahasa Indonesia
   - `en.ts`: English
   - Structured by module/feature

---

## 🚀 Usage

### 1. Import the Hook
```typescript
import { useTranslation } from '../hooks/useTranslation';
```

### 2. Use in Component
```typescript
function MyComponent() {
  const { t, language, setLanguage } = useTranslation();
  
  return (
    <View>
      <Text>{t('dashboard.welcome')}</Text>
      <Text>{t('dashboard.subtitle')}</Text>
      <Button onPress={() => setLanguage('en')}>
        {t('common.save')}
      </Button>
    </View>
  );
}
```

### 3. With Parameters
```typescript
// Translation key: "Hello, {{name}}!"
const message = t('greeting.hello', { name: 'John' });
// Output: "Hello, John!"
```

---

## 📝 Translation Keys Structure

### Common Keys
```typescript
common: {
  save: 'Simpan',
  cancel: 'Batal',
  delete: 'Hapus',
  // ...
}
```

### Module-Specific Keys
```typescript
dashboard: {
  title: 'Dashboard',
  welcome: 'Halo! 👋',
  subtitle: 'Apa kabar si kecil hari ini?',
  // ...
}

activities: {
  feeding: 'Makan',
  sleep: 'Tidur',
  addActivity: 'Catat Aktivitas',
  // ...
}
```

---

## 🔄 Language Switching

### In Settings Screen
```typescript
import { useTranslation } from '../../hooks/useTranslation';

function SettingsScreen() {
  const { t, language, setLanguage } = useTranslation();
  
  return (
    <View>
      <Text>{t('settings.language')}</Text>
      <RadioButton.Group value={language} onValueChange={setLanguage}>
        <RadioButton.Item label={t('settings.indonesian')} value="id" />
        <RadioButton.Item label={t('settings.english')} value="en" />
      </RadioButton.Group>
    </View>
  );
}
```

---

## 📦 Adding New Translations

### Step 1: Add to `id.ts`
```typescript
export const id = {
  // ...
  newModule: {
    title: 'Judul Baru',
    description: 'Deskripsi baru',
  },
};
```

### Step 2: Add to `en.ts`
```typescript
export const en = {
  // ...
  newModule: {
    title: 'New Title',
    description: 'New description',
  },
};
```

### Step 3: Use in Component
```typescript
const title = t('newModule.title');
```

---

## 🎯 Implementation Status

### ✅ Completed Modules

#### 1. **Core Infrastructure**
- [x] i18n service
- [x] useTranslation hook
- [x] Language persistence
- [x] Translation files (id, en)

#### 2. **Common Translations**
- [x] Buttons (save, cancel, delete, etc.)
- [x] Status messages (loading, error, success)
- [x] Greetings (morning, afternoon, evening)

#### 3. **Module Translations**
- [x] Authentication (signin, signup, forgot password)
- [x] Dashboard (welcome, summary, actions)
- [x] Activities (feeding, sleep, diaper, mood, growth)
- [x] Feeding (breast, bottle, solid, duration, volume)
- [x] Sleep (duration, hours, minutes)
- [x] Diaper (wet, dirty, both)
- [x] Mood (happy, neutral, fussy, crying)
- [x] Statistics (charts, periods, summaries)
- [x] Child Profile (add, edit, delete)
- [x] Settings (language, mascot, AI personality)
- [x] Reminders (add, edit, repeat)
- [x] Chat (messages, export, delete)
- [x] Media (upload, caption, delete)
- [x] Subscription (plans, features)
- [x] Errors (generic, network, validation)
- [x] Success messages (saved, deleted, uploaded)
- [x] Tips (sleep, tummy time, bonding)

---

## 🔧 Migration Plan

### Phase 1: Infrastructure ✅
- [x] Create i18n service
- [x] Create translation files
- [x] Create useTranslation hook
- [x] Install AsyncStorage

### Phase 2: Core Screens (Priority: High)
- [x] Dashboard - Fully translated (welcome, menu, alerts, tips)
- [x] Settings - Language selector added
- [x] AddActivityModal - Complete (25+ keys implemented)
- [x] ActivityHistory - Hook added (ready for translation)
- [x] CalendarModal - Complete (day headers, notes, legend)

### Phase 3: Secondary Screens (Priority: Medium)
- [x] ChildList - Fully translated (empty state, gender labels, growth button)
- [x] StatisticsScreen - Complete (loading text, header title, export modal)
- [x] PhotoUpload - Complete (button labels, uploading state)
- [x] MediaGallery - Already translated (uses existing media keys)
- [x] ChatSession - Already translated (uses existing chat keys)

### Phase 4: Auxiliary Screens (Priority: Low)
- [x] Auth (SignIn, SignUp) - Already translated (uses existing auth keys)
- [x] Reminders - Already translated (uses existing reminders keys)
- [x] Subscription - Already translated (uses existing subscription keys)
- [x] About/Help - Complete (Privacy Policy & Terms screens translated)

### Phase 5: Additional Features (New - January 2025)
- [x] BadgeShowcase - Complete (12 keys: stats, categories, empty states)
- [x] ReferralScreen - Complete (21 keys: hero, share buttons, stats, how-it-works)
- [x] Privacy Policy - Expanded (34 keys: 8 sections with full content)
- [x] Terms & Conditions - Expanded (43 keys: 10 sections with full legal content)
- [x] Edit Profile - Complete (14 keys: form labels, placeholders, status messages)

---

## 🎨 Best Practices

### 1. **Key Naming Convention**
- Use dot notation: `module.feature.action`
- Be specific: `activities.feeding.duration` not `feeding.duration`
- Use camelCase for multi-word keys

### 2. **Parameter Naming**
- Use double curly braces: `{{paramName}}`
- Be descriptive: `{{childName}}` not `{{name}}`

### 3. **Fallback Handling**
- Always provide fallback in translations
- Use key itself as fallback if translation missing
- Log warnings for missing keys (dev mode)

### 4. **Consistency**
- Keep same structure across languages
- Use same parameters across translations
- Maintain same tone/style per language

---

## 🧪 Testing

### Manual Testing
```typescript
// Test language switching
setLanguage('id');
console.log(t('dashboard.welcome')); // "Halo! 👋"

setLanguage('en');
console.log(t('dashboard.welcome')); // "Hello! 👋"
```

### Test Parameters
```typescript
const greeting = t('greeting.welcome', { name: 'John', age: 3 });
// "Selamat datang, John! Umur: 3 tahun"
```

---

## 📊 Statistics

| Category | ID | EN | JP | ZH | Coverage |
|----------|----|----|----|----|----------|
| Common | 28 | 28 | 28 | 28 | 100% |
| Greeting | 4 | 4 | 4 | 4 | 100% |
| Calendar | 7 | 7 | 7 | 7 | 100% |
| Auth | 35 | 35 | 35 | 35 | 100% |
| Dashboard | 31 | 31 | 31 | 31 | 100% |
| Activities | 76 | 76 | 76 | 76 | 100% |
| Feeding | 9 | 9 | 9 | 9 | 100% |
| Sleep | 4 | 4 | 4 | 4 | 100% |
| Diaper | 5 | 5 | 5 | 5 | 100% |
| Mood | 6 | 6 | 6 | 6 | 100% |
| Statistics | 48 | 48 | 48 | 48 | 100% |
| Child | 40 | 40 | 40 | 40 | 100% |
| Settings | 78 | 78 | 78 | 78 | 100% |
| Reminders | 20 | 20 | 20 | 20 | 100% |
| Chat | 30 | 30 | 30 | 30 | 100% |
| Media | 28 | 28 | 28 | 28 | 100% |
| Subscription | 24 | 24 | 24 | 24 | 100% |
| Errors | 34 | 34 | 34 | 34 | 100% |
| Success | 17 | 17 | 17 | 17 | 100% |
| Tips | 6 | 6 | 6 | 6 | 100% |
| Badges | 12 | 12 | 12 | 12 | 100% |
| Referral | 21 | 21 | 21 | 21 | 100% |
| Privacy | 34 | 34 | 34 | 34 | 100% |
| Terms | 43 | 43 | 43 | 43 | 100% |
| Profile | 14 | 14 | 14 | 14 | 100% |
| **TOTAL** | **654** | **654** | **654** | **654** | **100%** |

### Supported Languages
- 🇮🇩 **Indonesian (id)** - Bahasa Indonesia (Default)
- 🇬🇧 **English (en)** - English Language
- 🇯🇵 **Japanese (jp)** - 日本語 (NEW!)
- 🇨🇳 **Chinese Simplified (zh)** - 中文（简体）(NEW!)

---

## 🌏 Multi-Language Expansion (November 2025)

### New Languages Added

#### 🇯🇵 Japanese (jp.ts)
- **Native Name:** 日本語
- **Total Keys:** 654
- **Status:** ✅ Complete
- **Target Audience:** Japanese-speaking parents
- **Special Features:**
  - Formal/polite language forms
  - Kanji, Hiragana, and Katakana mix
  - Cultural context for parenting terms
  - Time period greetings (morning, afternoon, evening, night)

#### 🇨🇳 Chinese Simplified (zh.ts)
- **Native Name:** 中文（简体）
- **Total Keys:** 654
- **Status:** ✅ Complete
- **Target Audience:** Mandarin-speaking parents (Mainland China, Singapore)
- **Special Features:**
  - Simplified Chinese characters
  - Formal yet friendly tone
  - Culturally appropriate parenting terminology
  - Numbers and time formatting

### Implementation Details

1. **Translation Files Created:**
   - `/src/i18n/translations/jp.ts` - Japanese translations
   - `/src/i18n/translations/zh.ts` - Chinese Simplified translations

2. **Service Updates:**
   - Updated `Language` type to include `'jp' | 'zh'`
   - Extended language validation in `i18n.init()`
   - Updated translations export in `index.ts`

3. **UI Updates:**
   - Added flag emojis to language selector: 🇮🇩 🇬🇧 🇯🇵 🇨🇳
   - Extended RadioButton.Group to support 4 languages
   - Native language names for better UX

4. **Quality Assurance:**
   - All 654 keys translated per language
   - Consistent structure across all languages
   - Parameter placeholders maintained ({{name}}, {{count}}, etc.)
   - Cultural sensitivity reviewed

### Usage Examples

```typescript
// Settings Screen - Language Selector
<RadioButton.Group value={language} onValueChange={(value) => setLanguage(value as 'id' | 'en' | 'jp' | 'zh')}>
  <View style={styles.settingRow}>
    <Text>🇮🇩 {t('settings.indonesian')}</Text>
    <RadioButton value="id" />
  </View>
  <View style={styles.settingRow}>
    <Text>🇬🇧 {t('settings.english')}</Text>
    <RadioButton value="en" />
  </View>
  <View style={styles.settingRow}>
    <Text>🇯🇵 {t('settings.japanese')}</Text>
    <RadioButton value="jp" />
  </View>
  <View style={styles.settingRow}>
    <Text>🇨🇳 {t('settings.chinese')}</Text>
    <RadioButton value="zh" />
  </View>
</RadioButton.Group>
```

### Translation Key Examples

#### Common Keys (4 Languages)
```typescript
// Indonesian
common: { save: 'Simpan', cancel: 'Batal', delete: 'Hapus' }

// English
common: { save: 'Save', cancel: 'Cancel', delete: 'Delete' }

// Japanese
common: { save: '保存', cancel: 'キャンセル', delete: '削除' }

// Chinese
common: { save: '保存', cancel: '取消', delete: '删除' }
```

#### Dashboard Welcome (4 Languages)
```typescript
// Indonesian
dashboard: { welcome: 'Halo! 👋', subtitle: 'Apa kabar si kecil hari ini?' }

// English
dashboard: { welcome: 'Hello! 👋', subtitle: "How's your little one doing today?" }

// Japanese
dashboard: { welcome: 'こんにちは！ 👋', subtitle: '今日のお子様の様子はいかがですか？' }

// Chinese
dashboard: { welcome: '你好！ 👋', subtitle: '今天宝宝怎么样？' }
```

---

## ✨ Context-Aware Features (NEW!)

### 1. **Pluralization Support** ✅ IMPLEMENTED
Automatic handling of singular/plural forms:
```typescript
const { plural } = useTranslation();
plural('common.day', 1)  // "1 day"
plural('common.day', 5)  // "5 days"
```

### 2. **Number Formatting** ✅ IMPLEMENTED
Locale-aware number formatting with decimal/thousand separators:
```typescript
const { formatNumber } = useTranslation();
formatNumber(1234.56)  
// id-ID: 1.234,56
// en-US: 1,234.56
// ja-JP: 1,234.56
// zh-CN: 1,234.56
```

### 3. **Date/Time Formatting** ✅ IMPLEMENTED
Locale-specific date and time display:
```typescript
const { formatDate } = useTranslation();
formatDate(new Date(), { dateStyle: 'full' })
// id-ID: Rabu, 12 November 2025
// en-US: Wednesday, November 12, 2025
// ja-JP: 2025年11月12日水曜日
// zh-CN: 2025年11月12日星期三
```

### 4. **Relative Time Formatting** ✅ IMPLEMENTED
Human-friendly time display:
```typescript
const { formatRelativeTime } = useTranslation();
formatRelativeTime(date)
// "2 hours ago" / "dalam 3 hari" / "3日後" / "3天前"
```

📖 **Full Documentation:** See [`CONTEXT_AWARE_TRANSLATIONS.md`](./CONTEXT_AWARE_TRANSLATIONS.md)

---

## 🛠️ Translation Management

### Validation Tool ✅ IMPLEMENTED
Automated validation script to ensure translation consistency:

```bash
node scripts/validate-translations.js
```

**Checks:**
- ✅ All languages have identical keys
- ✅ Parameter placeholders are consistent
- ✅ No missing or duplicate translations
- ✅ Structural integrity across all files

**Output:**
```
✅ Validation completed successfully!
All translation files are consistent and complete.
Total: 2,616 translations across 4 languages
```

---

## 🚀 Next Steps

1. **Test Context-Aware Features**
   - Test pluralization in all languages
   - Verify number formatting with different locales
   - Test date/time formatting across screens
   - Validate relative time display

2. **Additional Languages** (Future)
   - Spanish (es.ts)
   - French (fr.ts)
   - German (de.ts)
   - Portuguese (pt.ts)
   - Arabic (ar.ts) - requires RTL support

3. **Advanced Features** (Future Enhancement)
   - Gender-specific translations
   - Context-aware greetings based on time of day
   - Cultural date formats (e.g., Islamic calendar)
   - Voice pronunciation support

4. **Translation Platform Integration** (Future)
   - Crowdin integration for community translations
   - Automated translation quality scoring
   - Translation memory for consistency
   - Continuous localization workflow

---

## 📚 References

- React i18n patterns
- React Native AsyncStorage
- TypeScript type safety for translations

---

**Last Updated:** 2025-11-12  
**Version:** 2.0.0  
**Status:** ✅ Complete - Multi-Language Support (4 Languages: Indonesian, English, Japanese, Chinese)
**Total Keys:** 654 translation keys per language  
**Coverage:** 100% across all 25 modules
