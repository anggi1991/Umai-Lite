# <!-- Moved from root path: /REPLACE_PERSONA_ICONS.md on 2025-11-11. Consolidated into docs/implementation/personalization/. -->
# 🎭 AI Persona Mascot Icons - Quick Reference

## 📍 Location
**Settings Screen** → Scroll to **"AI Personality"** section

---

## 🖼️ Icon Mapping

| Persona | Icon File | Expression | Current Icon |
|---------|-----------|------------|--------------|
| **Friendly** | `buddy-friendly.png` | 👍 Thumbs up | *(placeholder)* |
| **Professional** | `buddy-professional.png` | 💬 Chat icons | *(placeholder)* |
| **Encouraging** | `buddy-encouraging.png` | 😄 Big smile | *(placeholder)* |
| **Concise** | `buddy-concise.png` | 🤔 Focused | *(placeholder)* |

---

## 📥 Replace Placeholders

Untuk mengganti placeholder dengan gambar final dari attachment:

### Step 1: Simpan 4 Gambar
Dari attachment, simpan gambar ke folder ini:
```
/workspaces/parentingAI/src/assets/mascot/
```

### Step 2: Rename Files
```
Gambar 1 (chat icons)    → buddy-professional.png
Gambar 2 (thumbs up)     → buddy-friendly.png
Gambar 3 (serious face)  → buddy-concise.png
Gambar 4 (big smile)     → buddy-encouraging.png
```

### Step 3: Reload App
- Restart Expo dev server
- atau tekan `r` di terminal untuk reload

---

## ✅ Verification Checklist

Setelah mengganti gambar, verifikasi:

- [ ] Buka Settings screen
- [ ] Scroll ke "AI Personality"
- [ ] 4 persona cards show custom mascot icons (bukan emoji)
- [ ] Icons dalam circular container dengan baby blue background
- [ ] Icons size consistent (60x60 dalam 80x80 container)
- [ ] Tap persona card → border berubah menjadi blue
- [ ] Icons match dengan personality descriptions

---

## 🎨 Design Specs

**Icon Container:**
- Size: 80x80 dp
- Background: `#CDE9F920` (baby blue 20% opacity)
- Border radius: 40 dp (circular)

**Icon Image:**
- Size: 60x60 dp
- Format: PNG with transparency
- Recommended resolution: 512x512px or higher

---

## 📱 Current Status

**Code:** ✅ Implemented  
**Placeholders:** ✅ Created (using existing mascot images)  
**Final Icons:** ⏳ Waiting for user to save from attachments  

---

## 🚀 Next Steps

1. Save 4 gambar dari attachment dengan nama yang benar
2. Replace placeholder files di `/src/assets/mascot/`
3. Reload app untuk melihat hasil final
4. Hapus file `INSTRUCTIONS.txt` setelah selesai
