# <!-- Moved from root path: /PREFERENCES_SYNC_GUIDE.md on 2025-11-11. Consolidated into docs/implementation/personalization/. -->
# 🔄 Baby Buddy Preferences - Quick Start Guide

## ✨ What's New?

Pilihan Baby Buddy mascot dan AI Personality di Settings sekarang **sync ke seluruh aplikasi** dan **tersimpan permanen**!

---

## 🎯 How It Works

### 1️⃣ **Pilih Mascot Expression di Settings**

```
Settings → Baby Buddy Mascot → Pilih salah satu:
- 😊 Happy
- 👋 Waving
- 👍 Thumbs Up
- 😴 Sleeping
```

### 2️⃣ **Lihat Perubahan di Semua Screen**

Pilihan Anda langsung ter-apply di:
- ✅ **Chat Screen** - Avatar Baby Buddy di header dan message bubbles
- ✅ **Dashboard** - Welcome card mascot
- ✅ **Settings** - Preview mascot

### 3️⃣ **Pilihan Tersimpan Otomatis**

- ✅ Close app → Pilihan tetap ada
- ✅ Open app → Auto-load pilihan terakhir
- ✅ Sync across screens

---

## 📱 Step-by-Step Usage

### Change Mascot Expression:

1. Buka **Settings** (dari menu atau bottom nav)
2. Scroll ke section **"Baby Buddy Mascot"**
3. Lihat preview mascot saat ini (120px, animated)
4. Tap salah satu dari 4 pilihan thumbnail
5. ✅ Preview langsung update
6. ✅ Otomatis tersimpan ke database

### Verify Synchronization:

1. Setelah pilih mascot di Settings
2. Buka **Chat** → Check avatar Baby Buddy di header
3. Scroll chat messages → Check avatar di AI message bubbles
4. Kembali ke **Dashboard** → Check mascot di welcome card
5. Semua should match dengan pilihan Anda! ✅

### Test Persistence:

1. Pilih mascot "Thumbs Up" di Settings
2. **Close app completely** (swipe from recent apps)
3. **Reopen app**
4. Check chat/dashboard → Should still show "Thumbs Up" ✅

---

## 🎭 AI Personality (Coming Soon)

Sama seperti mascot, AI Personality juga akan sync:

```
Settings → AI Personality → Pilih:
- 😊 Friendly
- 👨‍⚕️ Professional
- 💪 Encouraging
- ⚡ Concise
```

**Current Status:**
- ✅ Saved to database
- ✅ Selection UI working
- 🔄 **TODO:** Apply to chat responses (Edge Functions integration)

---

## 🔧 For Developers

### Run Migration First:

```bash
# Option 1: Supabase Dashboard
1. Go to SQL Editor in Supabase dashboard
2. Copy content from: supabase/migrations/20251111_add_user_preferences.sql
3. Click "Run"

# Option 2: Supabase CLI
cd /workspaces/parentingAI
supabase db push
```

### Use the Hook:

```typescript
import { useUserPreferences } from '@/contexts/UserPreferencesContext';

function MyComponent() {
  const { 
    mascotExpression,      // 'happy' | 'waving' | 'thumbs-up' | 'sleeping'
    aiPersona,            // 'friendly' | 'professional' | 'encouraging' | 'concise'
    setMascotExpression,  // async (expression) => Promise<void>
    setAIPersona,         // async (persona) => Promise<void>
    loading               // boolean
  } = useUserPreferences();

  return (
    <BabyBuddy expression={mascotExpression} size={80} />
  );
}
```

### Components Already Updated:
- ✅ `Settings.tsx` - Save to DB
- ✅ `ChatSession.tsx` - Use from context
- ✅ `MessageBubble.tsx` - Use from context (fallback)
- ✅ `Dashboard.tsx` - Use from context

---

## 🧪 Testing Checklist

### Functionality:
- [ ] Change mascot in Settings → Saves successfully
- [ ] Go to Chat → Avatar matches selection
- [ ] Go to Dashboard → Mascot matches selection
- [ ] Close app → Selection persists
- [ ] Reopen app → Selection auto-loads

### Error Handling:
- [ ] Disconnect internet → Error message shows
- [ ] Invalid mascot value → Constrained by database
- [ ] Rapid clicking → No race conditions

### UI/UX:
- [ ] Loading state while saving
- [ ] Visual feedback on selection
- [ ] Smooth transitions
- [ ] No flickering

---

## 📊 Data Flow Diagram

```
┌───────────────┐
│   Settings    │
│   (User Tap)  │
└───────┬───────┘
        │
        ▼
┌──────────────────────┐
│  setMascotExpression │
│     (Context)        │
└─────────┬────────────┘
          │
          ▼
┌──────────────────────┐
│  Supabase UPDATE     │
│  profiles table      │
└─────────┬────────────┘
          │
          ▼
┌──────────────────────┐
│  Context State       │
│  mascotExpression    │
└─────────┬────────────┘
          │
          ├──────────────────┬──────────────────┐
          ▼                  ▼                  ▼
    ┌──────────┐      ┌──────────┐      ┌──────────┐
    │   Chat   │      │Dashboard │      │ Settings │
    │ Re-render│      │Re-render │      │ Preview  │
    └──────────┘      └──────────┘      └──────────┘
```

---

## ❓ FAQ

**Q: Apakah pilihan mascot sync antar device?**  
A: Belum. Saat ini per-device. Multi-device sync coming in future update.

**Q: Apakah bisa reset ke default?**  
A: Ya, pilih "Happy" di Settings atau hapus row di database.

**Q: Kenapa ada delay saat first load?**  
A: Normal, context loading preferences dari database (~100ms).

**Q: AI Persona sudah berfungsi?**  
A: Pilihan tersimpan, tapi belum di-apply ke chat responses. Coming soon!

**Q: Apakah offline supported?**  
A: Tidak sekarang. Requires internet. AsyncStorage cache planned.

---

## 🐛 Known Issues

1. Small delay on app start (loading from DB)
2. No offline mode (will add AsyncStorage cache)
3. AI Persona not applied to Edge Functions yet
4. No sync across devices (same user, different device)

---

## 🚀 Future Roadmap

- [ ] Apply AI Persona to chat responses
- [ ] AsyncStorage cache for offline support
- [ ] Multi-device sync
- [ ] More mascot expressions
- [ ] More AI personas
- [ ] Custom theme colors

---

## 📚 Documentation

- **Technical Docs:** `/docs/implementation/USER_PREFERENCES_SYNC.md`
- **API Reference:** See UserPreferencesContext.tsx
- **Migration:** `/supabase/migrations/20251111_add_user_preferences.sql`

---

**Status:** ✅ **LIVE & READY TO USE**

Sekarang Anda bisa personalize Baby Buddy sesuai keinginan, dan pilihan akan tersimpan permanen! 🎉
