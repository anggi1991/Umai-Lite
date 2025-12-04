# <!-- Moved from root path: /DEEP_ANALYSIS_SYNC_ISSUE.md on 2025-11-11. Original location consolidated into docs/data-sync/. -->
# 🔍 ANALISIS MENDALAM: Data Sync Activities

## 📊 Struktur Database (Fakta)

### Tabel `activities`
```sql
CREATE TABLE activities (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL,
  child_id uuid,              -- ⚠️ NULLABLE (bisa NULL)
  type text NOT NULL,         -- 'feeding', 'sleep', 'diaper', 'mood', 'growth'
  start_time timestamptz,
  end_time timestamptz,
  duration_seconds int,
  value text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);
```

**Key Point:** `child_id` adalah **NULLABLE** - aktivitas bisa tidak memiliki child_id.

---

## 🔄 Analisis Service Layer (3 Services)

### 1. activityService.ts

#### Function: `getActivities(userId, childId?, limit)`
```typescript
// Line 29-47
export const getActivities = async (
  userId: string,
  childId?: string,
  limit: number = 50
): Promise<Activity[]> => {
  let query = supabase
    .from('activities')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (childId) {
    query = query.eq('child_id', childId);  // ❌ STRICT FILTER
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Activity[];
};
```

**Behavior:**
- Jika `childId` tidak diberikan: Ambil **SEMUA** aktivitas user
- Jika `childId` diberikan: Ambil **HANYA** aktivitas dengan `child_id = childId`
- Aktivitas dengan `child_id = NULL` **TIDAK** diambil jika childId diberikan

#### Function: `getTodayActivities(userId, childId?)`
```typescript
// Line 54-78
export const getTodayActivities = async (
  userId: string,
  childId?: string
): Promise<Activity[]> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  let query = supabase
    .from('activities')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', todayISO)
    .order('created_at', { ascending: false });

  if (childId) {
    query = query.eq('child_id', childId);  // ❌ STRICT FILTER
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Activity[];
};
```

**Behavior:** Sama seperti `getActivities`, tapi hanya untuk hari ini.

#### Function: `getActivitySummary(userId, childId?)`
```typescript
// Line 82-99
export const getActivitySummary = async (
  userId: string,
  childId?: string
): Promise<Record<string, number>> => {
  const activities = await getTodayActivities(userId, childId);
  
  const summary: Record<string, number> = {
    feeding: 0,
    sleep: 0,
    diaper: 0,
    mood: 0,
    growth: 0,
  };

  activities.forEach((activity) => {
    if (activity.type in summary) {
      summary[activity.type]++;
    }
  });

  return summary;
};
```

**Behavior:** Menghitung jumlah aktivitas per type dari `getTodayActivities`.

---

### 2. statisticsService.ts

#### Function: `getActivitiesForPeriod(userId, childId?, days)`
```typescript
// Line 38-61 (SETELAH FIX)
export async function getActivitiesForPeriod(
  userId: string,
  childId?: string,
  days: number = 7
): Promise<Activity[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  let query = supabase
    .from('activities')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false });

  if (childId) {
    // ✅ INCLUSIVE FILTER (setelah fix)
    query = query.or(`child_id.eq.${childId},child_id.is.null`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Activity[];
}
```

**Behavior (SETELAH FIX):**
- Jika `childId` tidak diberikan: Ambil **SEMUA** aktivitas user
- Jika `childId` diberikan: Ambil aktivitas dengan `child_id = childId` **OR** `child_id = NULL`
- ✅ Inklusif untuk aktivitas tanpa child_id

#### Function: `getComprehensiveStats(userId, childId?, days)`
```typescript
// Line 103-117
export async function getComprehensiveStats(
  userId: string,
  childId?: string,
  days: number = 7
): Promise<ComprehensiveStats> {
  const activities = await getActivitiesForPeriod(userId, childId, days);

  return {
    feeding: calculateActivityStats(activities, 'feeding', days),
    sleep: calculateActivityStats(activities, 'sleep', days),
    diaper: calculateActivityStats(activities, 'diaper', days),
    mood: calculateActivityStats(activities, 'mood', days),
    growth: calculateActivityStats(activities, 'growth', days),
    totalActivities: activities.length,
    period: `Last ${days} days`,
  };
}
```

**Behavior:** Menggunakan `getActivitiesForPeriod`, jadi ikut behavior yang baru (inklusif).

---

## 🖥️ Analisis Screen Layer (3 Screens)

### 1. Dashboard (Dashboard.tsx)

#### Load Data:
```typescript
// Line 76-78
const [todayActivities, summary, usageData] = await Promise.all([
  getTodayActivities(user.id),        // ❌ TANPA childId
  getActivitySummary(user.id),        // ❌ TANPA childId
  UsageLimitService.getAllUsageStatus().catch(() => null),
]);
```

**Query yang digunakan:**
```sql
SELECT * FROM activities 
WHERE user_id = 'xxx' 
  AND created_at >= '2025-01-11 00:00:00'
ORDER BY created_at DESC;
```

**Hasil:**
- ✅ Mengambil **SEMUA** aktivitas user hari ini
- ✅ Termasuk aktivitas dengan `child_id = NULL`
- ✅ Termasuk aktivitas dengan `child_id = 'apapun'`

---

### 2. Activities/History (ActivityHistory.tsx)

#### Load Data:
```typescript
// Line 64
const data = await getActivities(user.id, selectedChildId || undefined, 100);
```

**Behavior:**
- Jika **TIDAK** ada child yang dipilih (`selectedChildId = null`):
  ```sql
  SELECT * FROM activities 
  WHERE user_id = 'xxx' 
  ORDER BY created_at DESC 
  LIMIT 100;
  ```
  ✅ Mengambil **SEMUA** aktivitas user

- Jika **ADA** child yang dipilih (`selectedChildId = 'yyy'`):
  ```sql
  SELECT * FROM activities 
  WHERE user_id = 'xxx' 
    AND child_id = 'yyy'
  ORDER BY created_at DESC 
  LIMIT 100;
  ```
  ❌ **HANYA** mengambil aktivitas dengan `child_id = 'yyy'`
  ❌ **TIDAK** mengambil aktivitas dengan `child_id = NULL`

---

### 3. Statistics (StatisticsScreen.tsx)

#### Load Data:
```typescript
// Line 110
const comprehensiveStats = await getComprehensiveStats(user!.id, childId, statsPeriod);

// Line 114
const activities = await getActivities(user!.id, childId, 10);

// Line 117
await loadChartData(childId, activeTab);
```

**Query yang digunakan (SETELAH FIX):**

**getComprehensiveStats:**
```sql
SELECT * FROM activities 
WHERE user_id = 'xxx' 
  AND created_at >= '2025-01-04 00:00:00'  -- 7 days ago
  AND (child_id = 'yyy' OR child_id IS NULL)
ORDER BY created_at DESC;
```
✅ Mengambil aktivitas dengan `child_id = yyy` **OR** `child_id = NULL`

**getActivities (recent activities):**
```sql
SELECT * FROM activities 
WHERE user_id = 'xxx' 
  AND child_id = 'yyy'
ORDER BY created_at DESC 
LIMIT 10;
```
❌ **HANYA** mengambil aktivitas dengan `child_id = yyy`
❌ **TIDAK** mengambil aktivitas dengan `child_id = NULL`

---

## 🚨 MASALAH YANG DITEMUKAN

### Masalah 1: Inkonsistensi Filter di Statistics ❌

**Lokasi:** `StatisticsScreen.tsx` line 114

```typescript
// Line 114 - Recent Activities
const activities = await getActivities(user!.id, childId, 10);
```

**Problem:**
- `getComprehensiveStats` menggunakan **INCLUSIVE filter** (child_id = X OR NULL)
- `getActivities` menggunakan **STRICT filter** (child_id = X only)
- **INKONSISTEN!**

**Impact:**
- Ringkasan Aktivitas (7 Hari) menampilkan aktivitas dengan child_id NULL ✅
- Recent Activities (10 terakhir) **TIDAK** menampilkan aktivitas dengan child_id NULL ❌

---

### Masalah 2: activityService.ts Tidak Punya Inclusive Filter ❌

**Lokasi:** `activityService.ts`

**Problem:**
- `getActivities` dan `getTodayActivities` hanya punya **STRICT filter**
- Tidak ada option untuk inclusive filter (child_id = X OR NULL)

**Impact:**
- Tidak bisa digunakan untuk kasus inklusif
- Harus membuat fungsi baru atau memodifikasi yang ada

---

## ✅ SOLUSI YANG DIPERLUKAN

### Fix 1: Tambahkan Parameter Inclusive di activityService ✅ WAJIB

**File:** `src/services/activityService.ts`

**Option A: Tambah parameter `includeNull`**
```typescript
export const getActivities = async (
  userId: string,
  childId?: string,
  limit: number = 50,
  includeNull: boolean = false  // ✅ NEW PARAMETER
): Promise<Activity[]> => {
  let query = supabase
    .from('activities')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (childId) {
    if (includeNull) {
      // ✅ INCLUSIVE: child_id = X OR child_id IS NULL
      query = query.or(`child_id.eq.${childId},child_id.is.null`);
    } else {
      // ❌ STRICT: child_id = X only
      query = query.eq('child_id', childId);
    }
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Activity[];
};
```

**Option B: Buat fungsi baru `getActivitiesInclusive`**
```typescript
export const getActivitiesInclusive = async (
  userId: string,
  childId?: string,
  limit: number = 50
): Promise<Activity[]> => {
  let query = supabase
    .from('activities')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (childId) {
    // ✅ INCLUSIVE: child_id = X OR child_id IS NULL
    query = query.or(`child_id.eq.${childId},child_id.is.null`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Activity[];
};
```

---

### Fix 2: Update StatisticsScreen untuk Konsistensi ✅ WAJIB

**File:** `src/screens/Statistics/StatisticsScreen.tsx`

**Sebelum:**
```typescript
// Line 114 (INKONSISTEN)
const activities = await getActivities(user!.id, childId, 10);
```

**Sesudah (Option A):**
```typescript
// ✅ KONSISTEN dengan getComprehensiveStats
const activities = await getActivities(user!.id, childId, 10, true);
                                                           // ↑ includeNull = true
```

**Sesudah (Option B):**
```typescript
// ✅ KONSISTEN dengan getComprehensiveStats
const activities = await getActivitiesInclusive(user!.id, childId, 10);
```

---

### Fix 3: Update ActivityHistory untuk Konsistensi (Optional) ⚠️

**File:** `src/screens/Activities/ActivityHistory.tsx`

**Current:**
```typescript
// Line 64 - STRICT filter when child selected
const data = await getActivities(user.id, selectedChildId || undefined, 100);
```

**Pertanyaan untuk UX:**
Ketika user memilih child di Activity History, apakah:
- **Option A:** Hanya tampilkan aktivitas child tersebut (STRICT) - Current behavior
- **Option B:** Tampilkan aktivitas child tersebut + aktivitas tanpa child (INCLUSIVE) - Konsisten dengan Statistics

**Rekomendasi:** **INCLUSIVE** untuk konsistensi dengan Statistics.

**Jika INCLUSIVE:**
```typescript
// ✅ KONSISTEN dengan Statistics
const data = await getActivities(user.id, selectedChildId || undefined, 100, true);
```

---

## 📊 Comparison Table

| Screen | Service Call | Filter Type | Include NULL? |
|--------|-------------|-------------|---------------|
| **Dashboard** | `getTodayActivities(userId)` | No filter | ✅ Yes (all activities) |
| **Dashboard** | `getActivitySummary(userId)` | No filter | ✅ Yes (all activities) |
| **Activities/History** (no child) | `getActivities(userId)` | No filter | ✅ Yes (all activities) |
| **Activities/History** (child selected) | `getActivities(userId, childId)` | STRICT | ❌ No |
| **Statistics** (Comprehensive) | `getComprehensiveStats(userId, childId, 7)` | INCLUSIVE | ✅ Yes (AFTER FIX) |
| **Statistics** (Recent 10) | `getActivities(userId, childId, 10)` | STRICT | ❌ No (NEEDS FIX) |
| **Statistics** (Chart Sleep) | `getSleepDurationChart(userId, childId, 7)` | INCLUSIVE | ✅ Yes (uses getActivitiesForPeriod) |

---

## 🎯 KESIMPULAN

### Yang Sudah Benar ✅
1. ✅ `statisticsService.ts` → `getActivitiesForPeriod` sudah INCLUSIVE
2. ✅ `getComprehensiveStats` menggunakan filter INCLUSIVE
3. ✅ `getSleepDurationChart` menggunakan filter INCLUSIVE
4. ✅ Dashboard mengambil semua aktivitas (no filter)

### Yang Perlu Diperbaiki ❌
1. ❌ `activityService.ts` tidak punya option INCLUSIVE filter
2. ❌ `StatisticsScreen.tsx` line 114 menggunakan STRICT filter (inkonsisten)
3. ⚠️ `ActivityHistory.tsx` line 64 menggunakan STRICT filter (perlu diskusi UX)

### Root Cause Masalah User
**User melaporkan:**
- Dashboard: ✅ Tidur 30 menit, Makan breast - 20 (muncul)
- Activities/History: ✅ Data muncul
- Statistics: ❌ 0x / 0.0/hari

**Penyebab:**
1. ✅ Dashboard tidak filter by child → **Data muncul**
2. ✅ Activities/History (jika tidak pilih child) → **Data muncul**
3. ✅ Statistics Comprehensive Stats sudah fix dengan INCLUSIVE → **Data muncul**
4. ❌ Statistics Recent Activities masih STRICT → **Data tidak muncul di list bawah**

**Jadi masalah sebenarnya:**
- Ringkasan Aktivitas (7 Hari) **SEHARUSNYA SUDAH MUNCUL** setelah fix statisticsService
- Tapi "Aktivitas Terkini" (recent 10) **MASIH TIDAK MUNCUL** karena pakai `getActivities` strict

---

## 📝 Action Items

### Prioritas TINGGI (Wajib)
- [ ] **Fix 1:** Tambahkan parameter `includeNull` ke `getActivities` di activityService
- [ ] **Fix 2:** Update StatisticsScreen line 114 pakai `includeNull: true`
- [ ] **Test:** Verifikasi Statistics menampilkan semua data (comprehensive + recent)

### Prioritas MEDIUM (Rekomendasi)
- [ ] **Fix 3:** Update ActivityHistory pakai `includeNull: true` untuk konsistensi
- [ ] **Test:** Verifikasi ActivityHistory behavior dengan child selected

### Prioritas RENDAH (Optional)
- [ ] Tambahkan `getTodayActivities` dengan `includeNull` parameter
- [ ] Refactor semua screen untuk konsistensi filter

---

**Status:** ⚠️ PARTIAL FIX - statisticsService sudah benar, tapi activityService perlu update  
**Next Step:** Implement Fix 1 & Fix 2  
**Testing Required:** Manual test dengan aktivitas child_id = NULL  
