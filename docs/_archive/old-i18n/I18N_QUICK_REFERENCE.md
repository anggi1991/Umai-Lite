# 🌍 i18n Quick Reference Guide

**Quick access guide for developers working with translations**

---

## 🚀 Quick Start

### 1. Import the Hook
```typescript
import { useTranslation } from '@/hooks/useTranslation';
```

### 2. Use in Component
```typescript
function MyScreen() {
  const { t, language, setLanguage } = useTranslation();
  
  return (
    <View>
      <Text>{t('common.welcome')}</Text>
      <Button 
        title={t('common.save')} 
        onPress={handleSave} 
      />
    </View>
  );
}
```

### 3. With Parameters
```typescript
<Text>{t('settings.defaultChildSet', { name: childName })}</Text>
// Output: "Default child set to: Sarah"
```

---

## 📝 Common Translation Keys

### Universal UI Elements (`common`)
```typescript
t('common.save')          // "Simpan" / "Save"
t('common.cancel')        // "Batal" / "Cancel"
t('common.delete')        // "Hapus" / "Delete"
t('common.edit')          // "Edit" / "Edit"
t('common.back')          // "Kembali" / "Back"
t('common.next')          // "Lanjut" / "Next"
t('common.close')         // "Tutup" / "Close"
t('common.confirm')       // "Konfirmasi" / "Confirm"
t('common.loading')       // "Memuat..." / "Loading..."
t('common.refresh')       // "Refresh" / "Refresh"
t('common.search')        // "Cari" / "Search"
t('common.filter')        // "Filter" / "Filter"
```

### Messages
```typescript
// Success
t('success.dataSaved')           // "Data berhasil disimpan"
t('success.dataDeleted')         // "Data berhasil dihapus"

// Errors
t('errors.general')              // "Terjadi kesalahan"
t('errors.networkError')         // "Tidak ada koneksi internet"
t('errors.invalidValue')         // "Nilai tidak valid"

// Empty States
t('common.noData')               // "Belum ada data"
t('common.noDataAvailable')      // "Data tidak tersedia"
```

### Authentication (`auth`)
```typescript
t('auth.signIn')                 // "Masuk"
t('auth.signUp')                 // "Daftar"
t('auth.email')                  // "Email"
t('auth.password')               // "Password"
t('auth.forgotPassword')         // "Lupa Password?"
t('auth.signInWithGoogle')       // "Masuk dengan Google"
```

### Dashboard (`dashboard`)
```typescript
t('dashboard.welcome')           // "Selamat Datang"
t('dashboard.addActivity')       // "Tambah Aktivitas"
t('dashboard.todayActivities')   // "Aktivitas Hari Ini"
t('dashboard.viewAll')           // "Lihat Semua"
```

### Activities (`activities`)
```typescript
t('activities.feeding')          // "Menyusui"
t('activities.sleep')            // "Tidur"
t('activities.diaper')           // "Popok"
t('activities.mood')             // "Mood"
t('activities.addNew')           // "Tambah Baru"
t('activities.history')          // "Riwayat"
```

### Child Profile (`child`)
```typescript
t('child.name')                  // "Nama Anak"
t('child.birthDate')             // "Tanggal Lahir"
t('child.gender')                // "Jenis Kelamin"
t('child.addChild')              // "Tambah Anak"
t('child.editChild')             // "Edit Anak"
t('child.selectChild')           // "Pilih Anak"
```

### Statistics (`statistics`)
```typescript
t('statistics.title')            // "Statistik"
t('statistics.growth')           // "Pertumbuhan"
t('statistics.weight')           // "Berat"
t('statistics.height')           // "Tinggi"
t('statistics.changePeriod')     // "Ubah Periode"
t('statistics.exportData')       // "Export Data"
```

### Chat AI Assistant (`chat`)
```typescript
t('chat.title')                  // "Baby Buddy"
t('chat.sendMessage')            // "Kirim Pesan"
t('chat.newChat')                // "Chat Baru"
t('chat.clearFromView')          // "Hapus dari Tampilan"
t('chat.deletePermanent')        // "Hapus Permanen"
```

### Settings (`settings`)
```typescript
t('settings.title')              // "Pengaturan"
t('settings.language')           // "Bahasa"
t('settings.notifications')      // "Notifikasi"
t('settings.darkMode')           // "Mode Gelap"
t('settings.logout')             // "Keluar"
```

---

## 🎯 Usage Patterns

### Simple Translation
```typescript
<Text>{t('common.welcome')}</Text>
```

### With Dynamic Parameters
```typescript
// Translation: "Hello, {{name}}!"
<Text>{t('greeting.hello', { name: userName })}</Text>
```

### In Alert Dialogs
```typescript
Alert.alert(
  t('common.confirm'),
  t('messages.deleteConfirm'),
  [
    { text: t('common.cancel'), style: 'cancel' },
    { text: t('common.delete'), onPress: handleDelete }
  ]
);
```

### In Menu Items
```typescript
const menuItems = [
  {
    title: t('common.edit'),
    icon: 'pencil',
    onPress: handleEdit,
  },
  {
    title: t('common.delete'),
    icon: 'delete',
    onPress: handleDelete,
  }
];
```

### Language Switcher
```typescript
<Button 
  title={language === 'id' ? '🇬🇧 English' : '🇮🇩 Indonesia'}
  onPress={() => setLanguage(language === 'id' ? 'en' : 'id')}
/>
```

---

## 📦 Translation File Structure

### Location
- Indonesian: `/src/i18n/translations/id.ts`
- English: `/src/i18n/translations/en.ts`

### Categories (20)
1. `common` - Universal UI elements
2. `greeting` - Welcome messages
3. `calendar` - Date/time
4. `auth` - Authentication
5. `dashboard` - Home screen
6. `activities` - Activity tracking
7. `feeding` - Feeding logs
8. `sleep` - Sleep tracking
9. `diaper` - Diaper logs
10. `mood` - Mood tracking
11. `statistics` - Analytics
12. `child` - Child profiles
13. `reminders` - Reminders
14. `chat` - AI Assistant
15. `media` - Gallery
16. `subscription` - Premium
17. `settings` - Settings
18. `errors` - Error messages
19. `success` - Success messages
20. `tips` - Parenting tips

---

## ✅ Adding New Translations

### Step 1: Add to Indonesian (`id.ts`)
```typescript
export const id = {
  // ... existing
  newFeature: {
    title: 'Judul',
    description: 'Deskripsi',
  }
}
```

### Step 2: Add to English (`en.ts`)
```typescript
export const en = {
  // ... existing
  newFeature: {
    title: 'Title',
    description: 'Description',
  }
}
```

### Step 3: Use in Code
```typescript
const { t } = useTranslation();
<Text>{t('newFeature.title')}</Text>
```

### Step 4: Verify
```bash
# Check for TypeScript errors
npx tsc --noEmit
```

---

## 🔍 Finding Existing Keys

### Method 1: Grep Search
```bash
# Search in Indonesian file
grep -n "title:" src/i18n/translations/id.ts

# Search in English file
grep -n "title:" src/i18n/translations/en.ts
```

### Method 2: VS Code Search
- `Cmd+Shift+F` (Mac) or `Ctrl+Shift+F` (Windows/Linux)
- Search in `/src/i18n/translations/`

### Method 3: Check This Guide
Scroll to **Common Translation Keys** section above

---

## ⚠️ Common Pitfalls

### ❌ Don't: Hardcode Strings
```typescript
// BAD
<Button title="Simpan" onPress={handleSave} />
```

### ✅ Do: Use Translation
```typescript
// GOOD
<Button title={t('common.save')} onPress={handleSave} />
```

### ❌ Don't: String Concatenation
```typescript
// BAD
const message = "Welcome, " + userName + "!";
```

### ✅ Do: Use Parameters
```typescript
// GOOD
const message = t('greeting.welcome', { name: userName });
```

### ❌ Don't: Forget English Translation
```typescript
// BAD - Only added to id.ts
export const id = {
  newKey: 'New Value'
}
```

### ✅ Do: Add to Both Files
```typescript
// GOOD - Added to both id.ts and en.ts
export const id = {
  newKey: 'Nilai Baru'
}
export const en = {
  newKey: 'New Value'
}
```

---

## 🧪 Testing Translations

### Manual Test
1. Open Settings screen
2. Tap Language switcher
3. Navigate through all screens
4. Verify all text updates correctly

### Automated Test (Example)
```typescript
import { i18nService } from '@/i18n/I18nService';

describe('Translations', () => {
  it('should return Indonesian text by default', () => {
    expect(i18nService.t('common.save')).toBe('Simpan');
  });
  
  it('should return English text after switching', async () => {
    await i18nService.setLanguage('en');
    expect(i18nService.t('common.save')).toBe('Save');
  });
});
```

---

## 📊 Translation Coverage

- **Total Keys**: 605+
- **Languages**: 2 (Indonesian, English)
- **Parity**: 100%
- **Status**: Production Ready ✅

---

## 🆘 Troubleshooting

### Issue: Translation not updating
**Solution**: Check if `useTranslation()` hook is imported and used

### Issue: Key not found error
**Solution**: Verify key exists in both `id.ts` and `en.ts`

### Issue: Parameter not showing
**Solution**: Check parameter name matches: `{{name}}` in translation and `{ name: value }` in code

### Issue: TypeScript error after adding key
**Solution**: Restart TypeScript server in VS Code (`Cmd+Shift+P` → "Restart TS Server")

---

## 📚 Full Documentation

For complete implementation details, see:
- `/docs/implementation/I18N_IMPLEMENTATION_COMPLETE.md`

---

*Last Updated: November 12, 2025*  
*Quick Reference v1.0*
