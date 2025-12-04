# <!-- Moved from path: /docs/implementation/USER_PREFERENCES_SYNC.md on 2025-11-11. Consolidated into docs/implementation/personalization/. -->
# User Preferences Sync Implementation

## 📅 Date: November 11, 2025

## 🎯 Overview
Implementasi sistem sinkronisasi pilihan Baby Buddy Mascot expression dan AI Personality dari Settings ke semua komponen (Chat, Dashboard, dll) dengan persistent storage di database.

---

## ✨ Features Implemented

### 1. **Database Persistence**
- Kolom baru di tabel `profiles`: `mascot_expression`, `ai_persona`
- Check constraints untuk validasi nilai
- Index untuk performa query
- Migration file: `20251111_add_user_preferences.sql`

### 2. **React Context API**
- `UserPreferencesContext` untuk global state management
- Auto-load preferences dari database saat login
- Auto-save ke database saat ada perubahan
- Type-safe dengan TypeScript

### 3. **Component Synchronization**
Semua komponen berikut sekarang synchronized:
- ✅ **Settings Screen** - Save pilihan ke database
- ✅ **Chat Session** - Avatar mascot sesuai pilihan user
- ✅ **Message Bubble** - AI bubble avatar sync
- ✅ **Dashboard** - Welcome card mascot sync
- ✅ (Future) - AI Persona akan di-pass ke Edge Functions

---

## 🗂️ Files Created/Modified

### New Files Created (3):

#### 1. **UserPreferencesContext.tsx** (132 lines)
**Location:** `/src/contexts/UserPreferencesContext.tsx`

**Exports:**
- `UserPreferencesProvider` - Context provider component
- `useUserPreferences()` - Hook untuk access preferences
- `MascotExpression` - Type definition
- `AIPersona` - Type definition

**Features:**
- Load preferences from database on mount
- Save to database on change
- Sync state across all components
- Loading state indicator
- Error handling

**Code:**
```typescript
export interface UserPreferences {
  mascotExpression: MascotExpression;
  aiPersona: AIPersona;
}

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error('useUserPreferences must be used within UserPreferencesProvider');
  }
  return context;
};
```

#### 2. **Migration File** (27 lines)
**Location:** `/supabase/migrations/20251111_add_user_preferences.sql`

**Changes:**
```sql
-- Add columns
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS mascot_expression TEXT DEFAULT 'happy',
ADD COLUMN IF NOT EXISTS ai_persona TEXT DEFAULT 'friendly';

-- Add constraints
ALTER TABLE profiles 
ADD CONSTRAINT mascot_expression_check 
CHECK (mascot_expression IN ('happy', 'waving', 'thumbs-up', 'sleeping'));

ALTER TABLE profiles 
ADD CONSTRAINT ai_persona_check 
CHECK (ai_persona IN ('friendly', 'professional', 'encouraging', 'concise'));
```

#### 3. **Migration Script**
**Location:** `/scripts/run-preferences-migration.sh`

---

### Modified Files (5):

#### 1. **app/_layout.tsx**
**Changes:**
- Import `UserPreferencesProvider`
- Wrap app with provider (inside AuthProvider)

```typescript
<AuthProvider>
  <UserPreferencesProvider>
    {/* App content */}
  </UserPreferencesProvider>
</AuthProvider>
```

#### 2. **Settings.tsx**
**Changes:**
- Use `useUserPreferences()` hook instead of local state
- async save to database on selection
- Disabled state while loading
- Error handling with Alert

**Before:**
```typescript
const [mascotExpression, setMascotExpression] = useState<MascotExpression>('happy');
onPress={() => setMascotExpression(expression)}
```

**After:**
```typescript
const { mascotExpression, setMascotExpression } = useUserPreferences();
onPress={async () => {
  try {
    await setMascotExpression(expression);
  } catch (error) {
    Alert.alert('Error', 'Gagal menyimpan pilihan mascot');
  }
}}
```

#### 3. **ChatSession.tsx**
**Changes:**
- Import `useUserPreferences`
- Remove local state for mascotExpression
- Use context value directly

**Before:**
```typescript
// TODO: Sync with user settings from profile
const [mascotExpression] = useState<MascotExpression>('happy');
```

**After:**
```typescript
const { mascotExpression } = useUserPreferences();
```

#### 4. **MessageBubble.tsx**
**Changes:**
- Import `useUserPreferences`
- Use context as fallback when no prop provided
- Backwards compatible with prop

```typescript
const { mascotExpression: contextExpression } = useUserPreferences();
const mascotExpression = propExpression || contextExpression;
```

#### 5. **Dashboard.tsx**
**Changes:**
- Import `useUserPreferences`
- Use mascot expression from context

```typescript
const { mascotExpression } = useUserPreferences();

<BabyBuddy 
  expression={mascotExpression}  // Was hardcoded "waving"
  size={80} 
/>
```

---

## 🔄 Data Flow

```
┌─────────────────────────────────────────────────────┐
│                 User Action                         │
│  (Tap mascot expression in Settings)               │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│         setMascotExpression(expression)             │
│  (UserPreferencesContext function)                  │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│     Supabase UPDATE profiles table                  │
│  SET mascot_expression = 'waving'                   │
│  WHERE user_id = current_user_id                    │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│      Update Context State                           │
│  setMascotExpressionState(expression)               │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│     All Components Re-render                        │
│  - ChatSession header avatar                        │
│  - MessageBubble AI avatars                         │
│  - Dashboard welcome card                           │
│  - Settings preview                                 │
└─────────────────────────────────────────────────────┘
```

---

## 🎬 User Experience Flow

### Before (Not Synced):
1. User selects mascot in Settings → "Waving"
2. Goes to Chat → Still shows "Happy" (hardcoded)
3. Goes to Dashboard → Still shows "Waving" (hardcoded different)
4. Closes app → Selection lost (not saved)

### After (Fully Synced):
1. User selects mascot in Settings → "Waving"
2. Goes to Chat → Shows "Waving" ✅
3. Goes to Dashboard → Shows "Waving" ✅
4. Closes app → Selection persisted ✅
5. Reopens app → Still "Waving" ✅

---

## 🧪 Testing Checklist

### Database Testing:
- [ ] Run migration on Supabase (SQL Editor or CLI)
- [ ] Verify columns exist: `mascot_expression`, `ai_persona`
- [ ] Check constraints work (try invalid value)
- [ ] Existing users get default values

### Settings Screen:
- [ ] Change mascot expression
- [ ] Verify saved to database (check Supabase table)
- [ ] Change AI persona
- [ ] Verify saved to database
- [ ] Test error handling (disconnect internet)

### Chat Screen:
- [ ] Open chat
- [ ] Verify header avatar matches selection
- [ ] Verify AI message bubbles match selection
- [ ] Change mascot in Settings
- [ ] Return to chat → Should update

### Dashboard:
- [ ] Open dashboard
- [ ] Verify welcome card mascot matches selection
- [ ] Change mascot in Settings
- [ ] Return to dashboard → Should update

### Persistence:
- [ ] Set mascot to "Thumbs-Up"
- [ ] Close app completely
- [ ] Reopen app
- [ ] Verify still shows "Thumbs-Up"

---

## 📊 Database Schema Changes

### profiles Table:

**New Columns:**
| Column | Type | Default | Constraint |
|--------|------|---------|------------|
| `mascot_expression` | TEXT | 'happy' | CHECK IN ('happy', 'waving', 'thumbs-up', 'sleeping') |
| `ai_persona` | TEXT | 'friendly' | CHECK IN ('friendly', 'professional', 'encouraging', 'concise') |

**Indexes:**
- `idx_profiles_id` - For faster user lookups (profiles.id is primary key)

**Note:** Query uses `profiles.id` not `profiles.user_id` (profiles.id = auth.users.id)

---

## 🔧 API Reference

### useUserPreferences Hook

```typescript
const {
  mascotExpression,      // Current selected expression
  aiPersona,            // Current selected persona
  setMascotExpression,  // async (expression) => Promise<void>
  setAIPersona,         // async (persona) => Promise<void>
  loading,              // boolean - loading state
} = useUserPreferences();
```

### Usage Example:

```typescript
import { useUserPreferences } from '../../contexts/UserPreferencesContext';

function MyComponent() {
  const { mascotExpression, setMascotExpression } = useUserPreferences();

  const handleChange = async () => {
    try {
      await setMascotExpression('waving');
      console.log('Saved!');
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  return <BabyBuddy expression={mascotExpression} />;
}
```

---

## 🚀 Future Enhancements

1. **AI Persona Integration**
   - Pass `aiPersona` to chat Edge Functions
   - Customize response tone based on persona
   - Sample implementation needed in chatService

2. **Additional Preferences**
   - Theme color scheme
   - Language preference
   - Notification settings persistence

3. **Offline Support**
   - Cache preferences in AsyncStorage
   - Sync when back online
   - Optimistic UI updates

4. **Analytics**
   - Track most popular mascot expressions
   - Track persona preference distribution
   - A/B test default values

---

## 🐛 Known Issues & Fixes

### Issue 1: Mascot/Persona buttons not working (Fixed Nov 12, 2025)
**Problem:** Buttons tidak berfungsi karena query menggunakan `user_id` yang salah
**Solution:** 
- Changed `eq('user_id', user.id)` to `eq('id', user.id)`
- Added proper error handling with console warnings
- Added detailed logging for debugging

### Issue 2: Initial Load Delay
Small delay on app start while loading preferences

### Issue 3: No Offline Mode
Requires internet to save/load (will add AsyncStorage cache in future)

### Issue 4: AI Persona Not Applied
Edge Functions don't use persona yet (TODO)

### Issue 5: No Sync Across Devices
User must set preferences on each device

---

## 📚 Related Documentation

- **Context API:** `/src/contexts/UserPreferencesContext.tsx`
- **Migration:** `/supabase/migrations/20251111_add_user_preferences.sql`
- **Settings Screen:** `/src/screens/Settings/Settings.tsx`
- **Chat Session:** `/src/screens/Chat/ChatSession.tsx`
- **Dashboard:** `/src/screens/Dashboard/Dashboard.tsx`

---

## ✅ Summary

Baby Buddy Mascot expression dan AI Personality preferences sekarang **fully synchronized** across semua komponen dengan **persistent storage** di Supabase database. User dapat mengubah pilihan di Settings dan akan langsung ter-reflect di seluruh aplikasi, bahkan setelah app restart.

**Status:** ✅ Implemented and Ready for Testing
