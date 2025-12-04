# Multi-Language Quick Reference Guide

## 🌍 Supported Languages

| Code | Language | Native Name | Flag | Status |
|------|----------|-------------|------|--------|
| `id` | Indonesian | Bahasa Indonesia | 🇮🇩 | ✅ Default |
| `en` | English | English Language | 🇬🇧 | ✅ Complete |
| `jp` | Japanese | 日本語 | 🇯🇵 | ✅ Complete |
| `zh` | Chinese | 中文（简体） | 🇨🇳 | ✅ Complete |

---

## 📂 File Locations

```
src/
├── i18n/
│   ├── index.ts                    # i18n service & Language type
│   └── translations/
│       ├── index.ts                # Export all translations
│       ├── id.ts                   # Indonesian - 654 keys
│       ├── en.ts                   # English - 654 keys
│       ├── jp.ts                   # Japanese - 654 keys ⭐ NEW
│       └── zh.ts                   # Chinese - 654 keys ⭐ NEW
├── hooks/
│   └── useTranslation.ts           # React hook
└── screens/
    └── Settings/
        └── Settings.tsx            # Language selector UI
```

---

## 💻 Code Usage

### Import Hook
```typescript
import { useTranslation } from '@/hooks/useTranslation';
```

### Basic Usage
```typescript
function MyComponent() {
  const { t, language, setLanguage } = useTranslation();
  
  return (
    <View>
      <Text>{t('dashboard.welcome')}</Text>
      <Text>{t('dashboard.subtitle')}</Text>
    </View>
  );
}
```

### With Parameters
```typescript
// Translation: "Hello, {{name}}!"
const greeting = t('greeting.hello', { name: 'John' });
// Output: "Hello, John!"

// Translation: "{{count}} days ago"
const time = t('activities.daysAgo', { count: 3 });
// Output: "3 days ago"
```

### Change Language
```typescript
const { setLanguage } = useTranslation();

// Switch to Japanese
setLanguage('jp');

// Switch to Chinese
setLanguage('zh');
```

---

## 🔤 Translation Key Examples

### Common Keys
```typescript
t('common.save')        // 保存 | Save | 保存 | 保存
t('common.cancel')      // Batal | Cancel | キャンセル | 取消
t('common.delete')      // Hapus | Delete | 削除 | 删除
t('common.loading')     // Memuat... | Loading... | 読み込み中... | 加载中...
t('common.comingSoon')  // Segera Hadir | Coming Soon | 近日公開 | 即将推出
```

### Greetings
```typescript
t('greeting.morning')   // Pagi | Morning | おはようございます | 早上好
t('greeting.afternoon') // Siang | Afternoon | こんにちは | 下午好
t('greeting.evening')   // Sore | Evening | こんばんは | 晚上好
t('greeting.night')     // Malam | Night | おやすみなさい | 晚安
```

### Dashboard
```typescript
t('dashboard.welcome')   // Halo! 👋 | Hello! 👋 | こんにちは！ 👋 | 你好！ 👋
t('dashboard.subtitle')  // Apa kabar si kecil hari ini? | How's your little one doing today? | 今日のお子様の様子はいかがですか？ | 今天宝宝怎么样？
```

### Activities
```typescript
t('activities.feeding')  // Makan | Feeding | 授乳 | 喂养
t('activities.sleep')    // Tidur | Sleep | 睡眠 | 睡眠
t('activities.diaper')   // Popok | Diaper | おむつ | 尿布
t('activities.mood')     // Mood | Mood | 気分 | 情绪
```

### Settings
```typescript
t('settings.language')      // Bahasa | Language | 言語 | 语言
t('settings.indonesian')    // Bahasa Indonesia
t('settings.english')       // English
t('settings.japanese')      // 日本語 ⭐ NEW
t('settings.chinese')       // 中文 ⭐ NEW
```

---

## 🎨 Language Selector UI

```tsx
<RadioButton.Group 
  value={language} 
  onValueChange={(value) => setLanguage(value as Language)}
>
  {/* Indonesian */}
  <View style={styles.settingRow}>
    <Text>🇮🇩 {t('settings.indonesian')}</Text>
    <RadioButton value="id" />
  </View>
  
  {/* English */}
  <View style={styles.settingRow}>
    <Text>🇬🇧 {t('settings.english')}</Text>
    <RadioButton value="en" />
  </View>
  
  {/* Japanese ⭐ NEW */}
  <View style={styles.settingRow}>
    <Text>🇯🇵 {t('settings.japanese')}</Text>
    <RadioButton value="jp" />
  </View>
  
  {/* Chinese ⭐ NEW */}
  <View style={styles.settingRow}>
    <Text>🇨🇳 {t('settings.chinese')}</Text>
    <RadioButton value="zh" />
  </View>
</RadioButton.Group>
```

---

## 📱 Testing Commands

### Check TypeScript Errors
```bash
npx tsc --noEmit
```

### Run Tests
```bash
npm test
```

### Start Development Server
```bash
npm start
```

---

## 🔍 Key Translation Modules

1. **common** (28 keys) - Buttons, status messages
2. **greeting** (4 keys) - Time-based greetings
3. **calendar** (7 keys) - Day names
4. **auth** (35 keys) - Sign in, sign up, auth flows
5. **dashboard** (31 keys) - Main screen, quick actions
6. **activities** (76 keys) - Feeding, sleep, diaper, mood
7. **statistics** (48 keys) - Growth charts, data
8. **child** (40 keys) - Child profiles, management
9. **settings** (78 keys) - App preferences, account
10. **chat** (30 keys) - AI chat interface
11. **media** (28 keys) - Photo gallery
12. **badges** (12 keys) - Achievements
13. **referral** (21 keys) - Invite friends
14. **privacy** (34 keys) - Privacy policy
15. **terms** (43 keys) - Terms & conditions
16. **profile** (14 keys) - User profile edit

---

## ⚡ Quick Tips

### Adding New Translation Key
1. Add to all 4 language files (id, en, jp, zh)
2. Use same key structure
3. Keep parameter placeholders consistent
4. Test in all languages

### Parameter Naming
```typescript
// Good
{{name}}, {{count}}, {{date}}, {{childName}}

// Bad
{{n}}, {{x}}, {{val}}
```

### Key Naming Convention
```typescript
// Good
'dashboard.welcome'
'activities.feeding'
'settings.changePassword'

// Bad
'welcome'
'feed'
'pwd'
```

---

## 🐛 Troubleshooting

### Translation Not Showing
```typescript
// Check if key exists
console.log(t('your.key.here'));

// Check current language
const { language } = useTranslation();
console.log('Current language:', language);
```

### Language Not Persisting
```typescript
// Check AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';
AsyncStorage.getItem('@app_language').then(console.log);
```

### Missing Translation
```typescript
// Check browser console for warnings
// Will show: "Translation key not found: your.key.here"
```

---

## 📞 Support

For questions or issues:
- Check `I18N_IMPLEMENTATION.md` for detailed docs
- Check `MULTI_LANGUAGE_IMPLEMENTATION_SUMMARY.md` for overview
- Review translation files in `/src/i18n/translations/`

---

**Last Updated:** November 12, 2025  
**Version:** 2.0.0
