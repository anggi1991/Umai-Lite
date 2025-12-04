# 🔄 Cara Reload App Setelah Update i18n

## ✅ Update Sudah Di-Push ke GitHub

Commits terbaru:
- `35b17a1` - fix(i18n): translate activity values (breast, bottle, wet, etc.)
- `7462cb0` - fix(i18n): translate activity type names in all screens

---

## 📱 Cara Apply Update di App

### Opsi 1: Reload via Expo (Recommended)
1. **Buka terminal** di device/emulator
2. **Tekan `r`** (reload) di terminal tempat Metro bundler running
3. Atau **shake device** → pilih "Reload"

### Opsi 2: Restart Metro Bundler
```bash
# Stop Metro (Ctrl+C di terminal npm)
cd /workspaces/parentingAI

# Clear cache dan restart
npm start -- --reset-cache
```

### Opsi 3: Full Clean Restart
```bash
# Clear all caches
rm -rf node_modules/.cache
rm -rf .expo

# Restart
npm start
```

---

## ✅ Hasil Yang Diharapkan

### Sebelum Update ❌
- "Makan **breast** - 20" (Indonesian)
- "授乳 **breast** - 10" (Japanese)
- "**Sleep**" / "**Feeding**" (English)

### Setelah Update ✅
**Bahasa Indonesia:**
- "Makan **ASI** - 20"
- "Makan **Makanan Padat** - 200"
- "**Tidur**" / "**Makan**"

**Bahasa Jepang:**
- "授乳 **母乳** - 10"
- "授乳 **離乳食** - 200"
- "**睡眠時間**" / "**授乳時間**"

---

## 🔍 Cara Verify Update Berhasil

1. Buka **Dashboard** → check "Aktivitas Terkini"
   - "breast" → "ASI" (ID) atau "母乳" (JP)
   
2. Buka **/activities/history**
   - Activity cards harus show translated values
   
3. Buka **/statistics**
   - Recent activities preview harus translated

---

## 🐛 Jika Masih Belum Berubah

### Check 1: Verify code terbaru
```bash
git pull origin main
git log --oneline -3
# Harus muncul commit 35b17a1 dan 7462cb0
```

### Check 2: Clear Expo cache
```bash
expo start -c
# atau
npx expo start --clear
```

### Check 3: Rebuild app (jika pakai development build)
```bash
eas build --profile development --platform android
```

---

## 📋 Files Yang Sudah Di-Fix

✅ **ActivityHistory.tsx** - Activity cards & journal entries
✅ **StatisticsScreen.tsx** - Activity preview cards  
✅ **RecentActivitiesSection.tsx** - Dashboard recent activities
✅ **CalendarModal.tsx** - Already fixed
✅ **ReminderList.tsx** - Reminder type labels
✅ **AddReminder.tsx** - Reminder titles & messages
✅ **GrowthTrackerScreen.tsx** - Sleep duration labels

---

## 🎯 Translation Coverage

| Value | Indonesian | Japanese | English |
|-------|-----------|----------|---------|
| breast | ASI | 母乳 | Breast Milk |
| bottle | Susu Formula | ミルク | Bottle |
| solid | Makanan Padat | 離乳食 | Solid Food |
| both | Kedua | 両方 | Both |
| wet | Basah | 濡れた | Wet |
| sleep | Tidur | 睡眠 | Sleep |
| feeding | Makan | 授乳 | Feeding |

---

## 💡 Next Steps

Setelah reload, test di app dengan:
1. Switch language ke **Japanese** → verify translation
2. Switch kembali ke **Indonesian** → verify translation
3. Create new activity → check display
4. View existing activities → check historical data
