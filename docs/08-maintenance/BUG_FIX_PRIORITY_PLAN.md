# Bug Fix Priority Plan - Umai App

**Date**: November 14, 2025  
**Total Bugs**: 6 critical issues found during testing  
**Target**: Fix P0/P1 bugs before launch

---

## 🚨 Priority 0 (CRITICAL - Must Fix Before Launch)

### Bug #6: Chat History Lost When Navigating Away

**Impact**: BLOCKING - Core feature unusable  
**Effort**: Medium (2-3 hours)  
**Status**: 🔴 Open

**Root Cause**:
- Messages stored in local state only (`useState`)
- Screen unmounts when navigating away
- No persistence mechanism (not using database properly)
- Missing `useFocusEffect` to reload on screen focus

**Fix Strategy**:
1. **Add useFocusEffect** to reload messages when returning to chat
   ```tsx
   import { useFocusEffect } from '@react-navigation/native';
   
   useFocusEffect(
     useCallback(() => {
       load(); // Reload messages from database
     }, [load])
   );
   ```

2. **Verify messages are saved** to Supabase database:
   - Check `handleSend` function saves to DB
   - Ensure AI responses also saved to DB
   - Add error handling for save failures

3. **Add loading state** when returning:
   - Show skeleton loader
   - Prevent duplicate loads
   
**Files to Edit**:
- `src/screens/Chat/ChatSession.tsx` (main fix)
- `src/services/chatService.ts` (verify save logic)

**Test After Fix**:
- Send messages in chat
- Navigate away (Dashboard, Settings)
- Return to chat
- Verify messages still visible ✅

---

### Bug #7: AI Context Awareness Missing

**Impact**: CRITICAL - AI gives generic advice  
**Effort**: High (4-6 hours)  
**Status**: 🔴 Open

**Root Cause**:
- AI doesn't have access to child profile data
- No integration with journal/statistics data
- Missing context in AI prompts

**Fix Strategy**:
1. **Fetch active child profile** before sending AI request:
   ```tsx
   const activeChild = await getActiveChild(userId);
   // Include: name, age, birth date, milestones
   ```

2. **Fetch recent journal entries**:
   ```tsx
   const recentJournal = await getRecentJournalEntries(childId, limit: 10);
   // Include: feeding, sleep, activities from last 7 days
   ```

3. **Fetch growth statistics**:
   ```tsx
   const growthData = await getLatestGrowthMeasurements(childId);
   // Include: weight, height, percentiles
   ```

4. **Build enhanced AI context**:
   ```tsx
   const contextPrompt = `
   Child Profile:
   - Name: ${child.name}
   - Age: ${calculateAge(child.birthDate)}
   - Latest Weight: ${growth.weight}kg (${growth.weightPercentile}th percentile)
   - Latest Height: ${growth.height}cm
   
   Recent Activities (last 7 days):
   ${recentJournal.map(entry => `- ${entry.type}: ${entry.notes}`).join('\n')}
   
   User Question: ${userMessage}
   
   Please provide personalized advice based on this child's specific data and development stage.
   `;
   ```

5. **Update AI system prompt** in `chatService.ts`:
   - Add context building function
   - Pass to Azure OpenAI API
   - Handle cases where data is missing

**Files to Edit**:
- `src/services/chatService.ts` (AI prompt enhancement)
- `src/screens/Chat/ChatSession.tsx` (fetch child data)
- `src/services/childService.ts` (add getActiveChild if missing)
- `src/services/journalService.ts` (add getRecentEntries if missing)
- `src/services/growthService.ts` (add getLatestMeasurements if missing)

**Test After Fix**:
- Add child profile with specific data
- Add journal entries (feeding, sleep)
- Add growth measurements
- Ask AI: "How is my baby developing?"
- Verify AI references specific child data ✅

---

## 🔥 Priority 1 (HIGH - Should Fix Before Launch)

### Bug #3: Notification Icon Not Clickable

**Impact**: Users can't access notifications  
**Effort**: Low (30 min)  
**Status**: 🔴 Open

**Fix Strategy**:
1. Find notification icon component in header
2. Add `onPress` handler
3. Navigate to notifications screen (or create if missing)
4. Add unread count badge

**Files to Edit**:
- `src/components/ui/AppHeader.tsx` or similar
- Create `src/screens/Notifications.tsx` if needed

---

### Bug #4: Three Dots Menu Not Clickable

**Impact**: Users can't access menu options  
**Effort**: Low (30 min)  
**Status**: 🔴 Open

**Fix Strategy**:
1. Find three dots menu component
2. Add `onPress` handler
3. Show dropdown menu with options
4. Add menu items: Settings, Help, About

**Files to Edit**:
- `src/components/ui/AppHeader.tsx` or similar

---

## ⚠️ Priority 2 (MEDIUM - Can Fix Post-Launch)

### Bug #2: Add Reminder Form Not Multilingual

**Impact**: Poor UX for English users  
**Effort**: Low (1 hour)  
**Status**: 🔴 Open

**Fix Strategy**:
1. Find hardcoded strings in reminder form
2. Replace with `t()` translation keys
3. Add English translations
4. Test language toggle

**Hardcoded Strings to Fix**:
```tsx
// BEFORE
"Tipe Reminder *"
"Waktu *"
"Catatan (opsional)"
"* Wajib diisi | Notifikasi lokal akan dijadwalkan."

// AFTER
{t('reminders.type')} *
{t('reminders.time')} *
{t('reminders.notesOptional')}
{t('reminders.requiredFieldsNote')}
```

**Files to Edit**:
- Find reminder form component (likely `src/screens/Reminders/AddReminderDialog.tsx`)
- `src/i18n/translations/en.ts` (add translations)
- `src/i18n/translations/id.ts` (verify existing)

---

### Bug #5: Search Button Blank on Android (Journal Popup)

**Impact**: Android users can't search journal  
**Effort**: Low (30 min)  
**Status**: 🔴 Open

**Fix Strategy**:
1. Find search button in journal popup
2. Check icon rendering on Android
3. Replace with cross-platform icon (e.g., Material Icons)
4. Test on Android emulator

**Files to Edit**:
- Journal popup component (find via grep search)

---

## 📊 Fix Timeline Estimate

| Priority | Bugs | Est. Time | Must Fix? |
|----------|------|-----------|-----------|
| P0 (Critical) | 2 | 6-9 hours | ✅ YES |
| P1 (High) | 2 | 1 hour | ✅ YES |
| P2 (Medium) | 2 | 1.5 hours | ⚠️ Optional |
| **TOTAL** | **6** | **8.5-11.5 hours** | - |

**Recommended approach**:
1. **Today**: Fix P0 bugs (chat history + AI context) - 6-9 hours
2. **Tomorrow**: Fix P1 bugs (navigation icons) - 1 hour
3. **Post-launch**: Fix P2 bugs (i18n, search button) - 1.5 hours

---

## 🎯 Launch Decision

**Current Status**: ⏳ **NOT READY FOR LAUNCH**

**Blockers**:
- ❌ Bug #6: Chat history lost (P0)
- ❌ Bug #7: AI not context-aware (P0)

**After P0 Fixes**: ✅ **READY FOR SOFT LAUNCH**
- Core features working
- Auth flows complete
- Email delivery reliable
- Minor bugs acceptable for MVP

**After P0 + P1 Fixes**: ✅ **READY FOR PUBLIC LAUNCH**
- All critical bugs fixed
- Navigation fully functional
- Professional user experience

---

## 🚀 Next Steps

### Option 1: Fix P0 Now (Recommended)
**Time**: 6-9 hours  
**Goal**: Make app usable for soft launch

**Tasks**:
1. Fix chat history persistence (Bug #6)
2. Add AI context awareness (Bug #7)
3. Test both fixes thoroughly
4. Commit and prepare for soft launch

### Option 2: Document & Launch As-Is
**Time**: 30 min  
**Risk**: High - users will experience chat history loss

**Tasks**:
1. Add known issues to app description
2. Prepare hotfix plan
3. Launch with disclaimer
4. Fix bugs immediately post-launch

### Option 3: Fix All P0+P1 (Best Quality)
**Time**: 7-10 hours  
**Goal**: Professional launch experience

**Tasks**:
1. Fix P0 bugs (chat + AI context)
2. Fix P1 bugs (navigation)
3. Comprehensive testing
4. Launch with confidence

---

**Recommendation**: **Option 1 or 3**

Bug #6 (chat history) is a deal-breaker. Users will be frustrated if conversations disappear. Bug #7 (AI context) makes AI less useful but not broken.

**Minimum for launch**: Fix Bug #6 (chat history)  
**Ideal for launch**: Fix Bug #6 + Bug #7 (chat + AI context)

---

**Decision Time**: Mau fix bugs sekarang, atau document as known issues dan launch? 🤔
