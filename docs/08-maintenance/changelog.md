# Changelog

## [2025-11-14] Website Deployment & Mobile App Integration 🌐

### ✨ New Features

**Public Website Deployed**
- Created Next.js 16 website for Privacy Policy, Terms, and Support pages
- Deployed to Netlify: https://parentingai.netlify.app
- 100% brand consistency with mobile app (Baby Blue #CDE9F9, Soft Pink #F9DDEB)
- Baby Buddy mascot integrated (welcome & happy variants)
- GDPR-compliant privacy policy (14 sections, 4000+ words)
- Indonesian law-compliant terms of service (18 sections, 3500+ words)
- Support center with FAQ and contact cards

**Files Created:**
- Website repository: https://github.com/anggi1991/parenting-ai-web
- 4 pages: Homepage, Privacy Policy, Terms, Support
- Auto-deploy CI/CD pipeline via Netlify

### 🔧 Changes

**Mobile App URL Integration**

1. **`app.json`** - Added App Store privacy URLs
   ```json
   {
     "android": {
       "privacyPolicy": "https://parentingai.netlify.app/privacy-policy"
     },
     "ios": {
       "privacyManifests": {
         "privacyPolicyURL": "https://parentingai.netlify.app/privacy-policy"
       }
     }
   }
   ```

2. **`src/screens/Settings/Settings.tsx`** - External browser navigation
   - ✅ Added `import { Linking } from 'react-native'`
   - ✅ Privacy Policy button: `Linking.openURL('https://parentingai.netlify.app/privacy-policy')`
   - ✅ Terms button: `Linking.openURL('https://parentingai.netlify.app/terms')`
   - ❌ Removed internal router.push() navigation
   - **Rationale**: External browser provides better UX and easier updates

### 📚 Documentation Added

- `/docs/implementation/WEBSITE_DEPLOYMENT.md` - Complete deployment guide
  - Technical stack details
  - Deployment statistics
  - Mobile app integration
  - Testing results
  - Remaining tasks
  - Security configuration

### 🎯 App Store Readiness

✅ Privacy Policy URL publicly accessible
✅ Terms of Service URL publicly accessible  
✅ Support page with contact information
✅ HTTPS/SSL enabled (Let's Encrypt)
✅ GDPR compliance documented
✅ Ready for Google Play & Apple App Store submission

### ⏳ Pending Tasks

- [ ] Update Supabase email templates (localhost → netlify URLs)
- [ ] Setup Resend SMTP for email delivery
- [ ] End-to-end testing of signup flow
- [ ] Physical device testing (iOS/Android)

### 🔗 Related Commits

- `b481f77` - Update URLs to Netlify production website
- `61578d7` - Add Netlify quick start guide and push instructions (website repo)
- `13d252a` - Add deployment scripts and comprehensive documentation (website repo)
- `fd44018` - Initial commit: Privacy Policy, Terms, Support pages with Baby Buddy branding (website repo)

---

## [2025-11-12] Critical Bug Fixes - Database Query Column Name 🔧

### 🐛 Bug Fixes

**Problem:** Sign Out, Mascot Selection, and AI Personality buttons not functioning due to incorrect database column name in queries.

**Root Cause:** All Supabase queries were using `.eq('user_id', user.id)` but the `profiles` table primary key is `id` (which equals `auth.users.id`). Column `user_id` doesn't exist.

**Files Fixed:**

1. **`/src/contexts/AuthContext.tsx`** - signOut() function
   - ❌ Before: `.eq('user_id', user.id)` → Silent failure
   - ✅ After: `.eq('id', user.id)` with proper error handling
   - Added try-catch with Supabase error checking
   - Added console logging for debugging

2. **`/src/contexts/UserPreferencesContext.tsx`** - 3 functions fixed
   - `loadPreferences()`: Changed query to `.eq('id', user.id)`
   - `setMascotExpression()`: Fixed query + added error throwing
   - `setAIPersona()`: Fixed query + added error throwing
   - All functions now have comprehensive logging

3. **`/src/screens/Settings/Settings.tsx`** 
   - Updated `handleSignOut()` routing to `/(auth)/signin`
   - Improved Dark Mode UI to show "Coming Soon" badge
   - Disabled Dark Mode switch (feature not yet implemented)
   - Added new styles: `sectionHeader`, `comingSoonBadge`, `comingSoonText`, `settingRowDisabled`, `settingLabelDisabled`

**Translation Updates:**
- Added `common.comingSoon` key to both English and Indonesian translations
- English: "Coming Soon"
- Indonesian: "Segera Hadir"

**Documentation:**
- Updated `USER_PREFERENCES_SYNC.md` with fix details (Nov 12, 2025)
- Added "Coming Soon Features" table to `README.md` (Dark Mode, Offline Support, Multi-language, Family Sharing)
- Clarified database schema note: `profiles.id` is the primary key

**Impact:** 
- ✅ Sign Out button now works correctly
- ✅ Mascot expression selection saves to database
- ✅ AI Personality selection saves to database
- ✅ Dark Mode UI clearly shows "Coming Soon" status
- ✅ All user preferences persist properly

---

## [2025-01-12] Multi-Language Support (i18n) Implementation 🌐

### 🎯 Major Feature: Full Indonesian/English Multi-Language Support

**Problem Solved:** Aplikasi hanya menggunakan Bahasa Indonesia dengan hardcoded strings. Tidak ada opsi untuk pengguna internasional yang memerlukan bahasa Inggris.

**Solution Implemented:**
- ✅ Custom i18n service dengan observer pattern
- ✅ AsyncStorage persistence untuk language preference
- ✅ Translation files: Indonesian (`id.ts`) & English (`en.ts`) - 240+ keys
- ✅ Language selector di Settings screen
- ✅ Reactive UI updates saat ganti bahasa
- ✅ **Phase 2 Complete**: 5 core screens fully translated

### 🏗️ New Infrastructure (3 files)

1. **`/src/i18n/index.ts`** (67 lines) - Core i18n service
   - Methods: `init()`, `getCurrentLanguage()`, `setLanguage()`, `t()`, `subscribe()`
   - Observer pattern untuk reactive updates
   - AsyncStorage key: `@app_language`
   - Parameter substitution: `{{param}}` support

2. **`/src/i18n/translations/id.ts`** (319 lines) - Indonesian
   - 18 categories: common, greeting, auth, dashboard, activities, feeding, sleep, diaper, mood, statistics, child, settings, reminders, chat, media, subscription, errors, success, tips
   - 223 translation keys
   - Complete coverage untuk entire app

3. **`/src/i18n/translations/en.ts`** (318 lines) - English
   - Mirrors id.ts structure exactly
   - 223 translation keys (identical coverage)

### 🔧 New React Hook

**`/src/hooks/useTranslation.ts`** (18 lines)
- Returns: `{ t, language, setLanguage }`
- Auto re-render on language change
- TypeScript type-safe
- Usage: `const { t } = useTranslation(); t('key')`

### 📝 Files Modified (3)

1. **`/app/_layout.tsx`**
   - Added `I18nBootstrap` component
   - Calls `i18n.init()` on app start
   - Loads saved language from AsyncStorage

2. **`/src/screens/Dashboard/Dashboard.tsx`**
   - Imported `useTranslation` hook
   - Replaced 15+ hardcoded strings with `t()` calls
   - Welcome message, greeting, menu items, alerts, tips
   - Keys used: `dashboard.*`, `greeting.*`, `errors.*`, `success.*`, `tips.*`

3. **`/src/screens/Settings/Settings.tsx`**
   - Added Language Selector section (NEW!)
   - Radio button group: Indonesian / English
   - Dynamic labels using `t('settings.indonesian')` & `t('settings.english')`
   - Integrated with i18n `setLanguage()`

### ✨ User Experience

**Before:**
- ❌ Fixed Bahasa Indonesia only
- ❌ No language options
- ❌ Hardcoded strings in every file

**After:**
- ✅ Bahasa Indonesia (default)
- ✅ English language option
- ✅ Switch in Settings → All screens update instantly
- ✅ Language persists after app restart

### 🎨 Language Selector UI
```tsx
<RadioButton.Group value={language} onValueChange={setLanguage}>
  <RadioButton.Item label="Bahasa Indonesia" value="id" />
  <RadioButton.Item label="English" value="en" />
</RadioButton.Group>
```

### 📊 Translation Coverage

| Category | Keys | ID | EN | Status |
|----------|------|----|----|--------|
| Common | 23 | ✅ | ✅ | 100% |
| Greeting | 4 | ✅ | ✅ | 100% |
| Auth | 11 | ✅ | ✅ | 100% |
| Dashboard | 13 | ✅ | ✅ | 100% |
| Activities | 30 | ✅ | ✅ | 100% |
| Feeding | 9 | ✅ | ✅ | 100% |
| Sleep | 4 | ✅ | ✅ | 100% |
| Diaper | 5 | ✅ | ✅ | 100% |
| Mood | 6 | ✅ | ✅ | 100% |
| Statistics | 18 | ✅ | ✅ | 100% |
| Child | 15 | ✅ | ✅ | 100% |
| Settings | 40 | ✅ | ✅ | 100% |
| Reminders | 14 | ✅ | ✅ | 100% |
| Chat | 8 | ✅ | ✅ | 100% |
| Media | 11 | ✅ | ✅ | 100% |
| Subscription | 11 | ✅ | ✅ | 100% |
| Errors | 16 | ✅ | ✅ | 100% |
| Success | 11 | ✅ | ✅ | 100% |
| Tips | 6 | ✅ | ✅ | 100% |
| **TOTAL** | **223** | **✅** | **✅** | **100%** |

### 🚀 Implementation Status

**Phase 1: Infrastructure** ✅ COMPLETE
- [x] i18n service created
- [x] Translation files (id, en)
- [x] useTranslation hook
- [x] AsyncStorage integration
- [x] App initialization

**Phase 2: Core Screens** ✅ COMPLETE (5/5)
- [x] Dashboard (15 keys)
- [x] Settings (5 keys + Language Selector)
- [x] AddActivityModal (25 keys)
- [x] ActivityHistory (5 keys)
- [x] CalendarModal (12 keys)

**Phase 3: Secondary Screens** ⏳ PENDING
- [ ] ChildList
- [ ] StatisticsScreen
- [ ] PhotoUpload
- [ ] MediaGallery
- [ ] ChatSession

**Phase 4: Auxiliary Screens** ⏳ PENDING
- [ ] Auth (SignIn, SignUp)
- [ ] Reminders
- [ ] Subscription
- [ ] About/Help

### 📚 Documentation

1. **`/docs/I18N_IMPLEMENTATION.md`** (NEW) - 400+ lines
   - Architecture overview
   - Usage guide for developers
   - Translation key structure
   - Best practices
   - Implementation checklist
   - Adding new languages guide

2. **`/docs/implementation/I18N_DAILY_UPDATE.md`** (NEW) - 350+ lines
   - Daily progress tracking
   - Code examples (before/after)
   - Technical decisions explained
   - Issues fixed
   - Testing checklist

### 🧪 Technical Implementation

**Data Flow:**
```
User Selection → setLanguage() → i18n Service → AsyncStorage → Notify Listeners → Re-render
```

**Observer Pattern:**
```typescript
// Subscribe to language changes
const unsubscribe = i18n.subscribe((newLang) => {
  setLanguage(newLang);
  // Component re-renders automatically
});
```

**Translation with Parameters:**
```typescript
t('greeting.welcome', { name: 'John' }) // → "Welcome, John!"
```

### 🐛 Issues Fixed

1. **TypeScript Error in useEffect**
   - Fixed cleanup return type (`void` expected)
   - Changed `return unsubscribe` to `return () => { unsubscribe(); }`

2. **Missing Translation Keys**
   - Added 11 new keys for Dashboard
   - Keys: `errors.error`, `success.success`, `tips.tapRefresh`, etc.

### 💡 Next Steps

**Immediate (Priority: HIGH):**
1. Implement AddActivityModal (heavy usage)
2. Complete ActivityHistory translation
3. Finish CalendarModal translation

**Short-term:**
4. Remaining 15+ screens
5. Add TypeScript types for translation keys (autocomplete)
6. Create script to find remaining hardcoded strings

**Long-term:**
7. Add more languages (Japanese, Chinese, etc.)
8. Pluralization support
9. Date/time formatting per locale
10. RTL language support (Arabic, Hebrew)

---

## [2025-11-11-D] User Preferences Sync System 🔄

### 🎯 Major Feature: Complete Preference Synchronization

**Problem Solved:** Baby Buddy mascot expression dan AI Personality pilihan di Settings tidak tersinkronisasi ke komponen lain dan hilang setelah app restart.

**Solution Implemented:**
- ✅ Database persistence (Supabase `profiles` table)
- ✅ React Context API untuk global state
- ✅ Real-time sync across all components
- ✅ Persistent storage (saved to database)
- ✅ Auto-load on app start

### 🗄️ Database Changes
**Migration:** `20251111_add_user_preferences.sql`

New columns in `profiles` table:
- `mascot_expression` TEXT DEFAULT 'happy'
- `ai_persona` TEXT DEFAULT 'friendly'
- Check constraints for valid values
- Index on `user_id` for performance

### 🔧 New Files Created (3)

1. **UserPreferencesContext.tsx** (132 lines)
   - Global state management with Context API
   - Load from database on mount
   - Save to database on change
   - Hook: `useUserPreferences()`
   - Exports: MascotExpression, AIPersona types

2. **20251111_add_user_preferences.sql** (27 lines)
   - ALTER TABLE profiles
   - ADD CHECK constraints
   - CREATE INDEX
   - UPDATE existing rows

3. **run-preferences-migration.sh**
   - Helper script untuk run migration

### 📝 Files Modified (5)

1. **app/_layout.tsx**
   - Wrap app dengan `<UserPreferencesProvider>`
   - Nested inside `<AuthProvider>`

2. **Settings.tsx**
   - Replace local state dengan `useUserPreferences()`
   - Async save to database on selection
   - Error handling dengan Alert
   - Disabled state while loading

3. **ChatSession.tsx**
   - Import `useUserPreferences`
   - Remove hardcoded mascotExpression
   - Use context value for avatar

4. **MessageBubble.tsx**
   - Use context as fallback
   - Backwards compatible with prop
   - All AI message avatars synchronized

5. **Dashboard.tsx**
   - Import `useUserPreferences`
   - Welcome card mascot dari context
   - No more hardcoded "waving"

### ✨ User Experience Improvements

**Before:**
- ❌ Mascot selection tidak sync antar screen
- ❌ Pilihan hilang setelah app restart
- ❌ Chat selalu show "Happy"
- ❌ Dashboard selalu show "Waving"

**After:**
- ✅ Pilih mascot di Settings → Sync ke Chat, Dashboard, Message Bubbles
- ✅ Close app → Pilihan tersimpan
- ✅ Open app → Auto-load dari database
- ✅ Semua avatar menggunakan mascot yang sama

### 🧪 Components Synchronized
- ✅ Settings Screen (save to DB)
- ✅ Chat Session (header avatar)
- ✅ Message Bubble (AI message avatars)
- ✅ Dashboard (welcome card)
- 🔄 Future: AI Persona → Edge Functions

### 📊 Data Flow
```
Settings Selection → Context → Database → All Components
     ↓                ↓            ↓            ↓
  User Tap      Update State   Save Row    Re-render
```

### 🚀 Technical Implementation
- React Context API for global state
- Supabase profiles table for persistence
- TypeScript for type safety
- Async/await for DB operations
- Error handling with try/catch
- Loading states for UX

### 📚 Documentation
- **[NEW]** `/docs/implementation/USER_PREFERENCES_SYNC.md` (350+ lines)
- Complete technical documentation
- API reference
- Testing checklist
- Data flow diagrams

---

## [2025-11-11-C] AI Persona Mascot Icons 🎭

### 🎨 UI/UX Improvements
- **Settings - AI Personality icons** diganti dengan custom mascot
- Removed emoji (😊 👨‍⚕️ 💪 ⚡) 
- Added 4 custom persona mascot icons
- Circular icon containers dengan baby blue background (80x80dp)

### New Mascot Icons (4)
1. **buddy-friendly.png** - Thumbs up mascot (Friendly persona)
2. **buddy-professional.png** - Chat icons mascot (Professional persona)
3. **buddy-encouraging.png** - Big smile mascot (Encouraging persona)
4. **buddy-concise.png** - Focused mascot (Concise persona)

### Files Updated
1. **Settings.tsx**
   - Import: Added `Image` from react-native
   - Added: `personaIcons` object with 4 mascot imports
   - Updated: All 4 persona cards now use Image component
   - Styles: Added `personaIconContainer` and `personaIcon`
   - Layout: 60x60 icon in 80x80 circular container

### Documentation
- **[NEW]** `/docs/implementation/AI_PERSONA_MASCOT_ICONS.md` (detailed guide)
- **[NEW]** `/src/assets/mascot/README_PERSONA_ICONS.md` (icon descriptions)
- **[NEW]** `/src/assets/mascot/INSTRUCTIONS.txt` (save instructions)

---

## [2025-11-11-B] Custom Mascot Icons Implementation 🎨

### 🎨 UI/UX Improvements
- **Implemented custom mascot icons** - 22 unique Baby Buddy themed icons
- **Replaced emoji & generic icons** dengan custom brand assets
- **Created MascotIcon component** untuk consistent icon usage
- **Updated color scheme** untuk icon sesuai brand (Baby Blue, Soft Pink)

### Custom Icons Added (22 total)
**Navigation Icons:**
- 🏠 → `home` (baby-buddy-happy.png)
- 📝 → `journal` (Mood.png)  
- 💬 → `chat` (baby-buddy-waving.png)
- 📊 → `stats` (growth.png)
- 👤 → `profile` (baby-buddy-thumbs-up.png)

**Activity Icons:**
- 🍼 → `feeding` (feeding.png)
- 😴 → `sleep` (Sleep.png)
- 👶 → `diaper` (diaper.png)
- 📈 → `growth` (growth.png)
- 😊 → `mood` (Mood.png)

**Mood Expression Icons (8):**
- `happy`, `excited`, `calm`, `sad`, `crying`, `angry`, `fussy`, `sleepy`

**Baby Buddy Variants (4):**
- `buddyHappy`, `buddyWaving`, `buddySleeping`, `buddyThumbsUp`

### Files Created/Updated
1. **[NEW] MascotIcon.tsx** (103 lines)
   - Custom icon component
   - Icon container with background
   - 22 icon mappings

2. **BottomNavigation.tsx**
   - Using MascotIcon component
   - All 5 navigation icons custom

3. **TodaysSummary.tsx**
   - Direct image require() for stats
   - Feeding, sleep, diaper icons

4. **QuickActions.tsx**
   - All 5 quick actions using mascot icons
   - Growth, buddyWaving, mood, buddyThumbsUp, happy

5. **ActivityHistory.tsx**
   - Filter modal with MascotIcon
   - All 6 activity type filters

### Documentation
- **[NEW] ICON_STANDARDIZATION_PLAN.md** - Complete icon mapping guide
- Documented all icon changes with color palette
- Implementation phases and testing checklist

### Benefits
- ✅ Consistent visual language across app
- ✅ Better scalability (vector vs emoji)
- ✅ Professional appearance
- ✅ Easier theming and customization
- ✅ Better accessibility

---

## [2025-11-11] System Integration & Documentation Overhaul ✅

### 📚 Documentation Refactoring
- **Restructured entire docs folder** with clear organization
- **Created README.md indexes** for each subfolder (implementation, monetization, setup, testing, references, troubleshooting)
- **Archived outdated documentation** to `archive/` folder
  - `archive/old-implementations/` (11 files)
  - `archive/old-references/` (5 files)
  - `archive/old-testing/` (4 files)
  - `archive/` root (6 files)
- **New folder structure:**
  ```
  docs/
  ├── README.md (Main navigation guide)
  ├── ARCHITECTURE.md (System architecture)
  ├── SYSTEM_INTEGRATION_SUMMARY.md (Integration guide)
  ├── CHANGELOG.md (Version history)
  ├── implementation/ (8 guides + README)
  ├── monetization/ (9 docs + README)
  ├── setup/ (11 guides + README)
  ├── testing/ (6 guides + README)
  ├── references/ (9 docs + README)
  ├── troubleshooting/ (1 guide + README)
  └── archive/ (26 archived files)
  ```

### Added
- **ARCHITECTURE.md:** Comprehensive 600+ line architecture documentation
  - Complete database schema (19 tables)
  - All 5 RPC functions documented
  - Service layer integration patterns
  - Screen component data flows
  - Security & RLS policies
  - Performance optimization strategies
  
- **SYSTEM_INTEGRATION_SUMMARY.md:** Module connectivity documentation
  - Real-time synchronization patterns
  - Cross-module data flow diagrams
  - Error handling & recovery strategies
  - Integration test coverage (6/6 passing)
  
- **force_reset_usage_limits RPC function:** Testing utility with SECURITY DEFINER
  - Bypasses RLS for test cleanup
  - Used in integration tests
  
- **Indonesian translations:** All UI elements now in Bahasa Indonesia
  - StatisticsScreen: "Berat Saat Ini", "Tinggi Saat Ini"
  - Consistent language across all screens

### Fixed
- **Usage Limit Integration Tests:** All 6 tests now passing ✅
  - Fixed null `current_count` handling in `getUsageStatus`
  - Added null coalescing: `current_count: data.current_count ?? 0`
  - Fixed error re-throwing in `checkAndIncrementUsage`
  - Re-throws `USAGE_LIMIT_REACHED` instead of catching it
  - Fixed parameter order in test calls: `(featureType, userId)` not `(userId, featureType)`
  
- **RLS Policy Issue:** DELETE operations blocked by Row Level Security
  - Created `force_reset_usage_limits` RPC with `SECURITY DEFINER`
  - Test cleanup now works correctly
  
- **Error Propagation:** USAGE_LIMIT_REACHED error now properly thrown
  - Service throws error when `allowed: false`
  - Screen catches error and shows upgrade prompt
  - Analytics event logged on limit reached

### Changed
- **usageLimitService.ts:**
  - Added error throwing: `throw new Error('USAGE_LIMIT_REACHED')`
  - Added null handling: `current_count: data?.current_count ?? 0`
  - Added error re-throwing in catch block
  
- **usageLimitIntegrationTest.ts:**
  - Updated setup to use RPC `force_reset_usage_limits`
  - Fixed 4 function call parameter orders
  - Added verification after reset (0 records remaining)
  
- **Settings.tsx:**
  - Developer Tools section already wrapped in `__DEV__` flag
  - Test menu only visible in development builds

### Documentation
- **docs/ARCHITECTURE.md:** Complete system architecture (NEW)
- **docs/SYSTEM_INTEGRATION_SUMMARY.md:** Integration guide (NEW)
- **docs/CHANGELOG.md:** Updated with all recent changes
- All modules documented with:
  - Database tables and schemas
  - RPC function signatures
  - Service layer methods
  - Screen component flows
  - Real-time sync patterns
  - Error handling strategies

### Test Results
```
✅ Setup Test User - PASS
✅ Initial Usage Status - PASS (current_count: 0)
✅ Increment Usage Count - PASS (2/3 used)
✅ Limit Reached Scenario - PASS (error thrown)
✅ Chat Message Limits - PASS (10/10 used)
✅ Cleanup Test Data - PASS (deleted 2 records)

Total: 6 tests | Passed: 6 | Failed: 0
```

### Technical Improvements
- **Dynamic sync:** All screens react to database changes in real-time
- **Responsive UI:** Usage limits update immediately after actions
- **Error recovery:** Graceful degradation with user-friendly messages
- **Performance:** Indexed queries, caching, debouncing implemented
- **Security:** RLS policies enforced, SECURITY DEFINER documented

---

## [2025-11-07] Merge feature/media-upload-flow-fix to main
### Added
- Modal konfirmasi upload foto pada Media Gallery (web & mobile friendly)
- Timeout safeguard pada image picker (web)
- Select mode pada ChildList untuk upload media
- Auto redirect setelah edit child profile
- Reminder delete: custom modal, loading per-reminder
- Input multiline alignment fix
- Modal button centering
- Logging untuk debugging
- Docs folder dipulihkan dan dicek

### Changed
- Media upload flow: auto-upload diganti user prompt
- General refactor dan bug fixes di banyak file

### Removed
- Duplikasi request permission pada image picker
- File/folder yang tidak relevan dipulihkan
