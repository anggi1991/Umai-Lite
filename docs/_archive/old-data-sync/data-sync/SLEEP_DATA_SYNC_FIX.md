# <!-- Moved from root path: /SLEEP_DATA_SYNC_FIX.md on 2025-11-11. Original location consolidated into docs/data-sync/. -->
# Fix: Sinkronisasi Data Tidur di Statistics

## Masalah
Data tidur pada `/statistics` tidak tersinkronisasi dengan aktivitas yang dicatat di `/activities/history`.

**Status saat ini:**
- Ringkasan Aktivitas (7 Hari) menunjukkan:
  - 💤 Sleep: 0x / 0.0/hari
- Chart tidur menunjukkan: "Belum ada data tidur"
- Tombol "Tambah Data Tidur" mengarahkan ke halaman yang salah

## Analisis
1. ✅ **Data source sudah benar**: Baik `/statistics` maupun `/activities/history` mengambil data dari tabel `activities` yang sama
2. ✅ **Service layer sudah benar**: 
   - `getComprehensiveStats()` menghitung count aktivitas sleep dari tabel `activities`
   - `getSleepDurationChart()` menghitung durasi tidur dari `duration_seconds`
3. ❌ **Navigasi tombol "Tambah Data Tidur" salah**: Mengarahkan ke `/(tabs)/media` bukan ke form aktivitas

## Solusi yang Diterapkan

### 1. Perbaiki Navigasi "Tambah Data Tidur"
**File**: `/src/screens/Statistics/StatisticsScreen.tsx`

**Sebelum:**
```typescript
const handleAddRecord = () => {
  if (!selectedChildId) return;

  if (activeTab === 'weight' || activeTab === 'height') {
    router.push(`/growth-tracker?childId=${selectedChildId}`);
  } else {
    // Navigate to journal for adding sleep
    router.push('/(tabs)/media'); // ❌ Salah
  }
};
```

**Sesudah:**
```typescript
const handleAddRecord = () => {
  if (!selectedChildId) return;

  if (activeTab === 'weight' || activeTab === 'height') {
    router.push(`/growth-tracker?childId=${selectedChildId}`);
  } else {
    // Navigate to activities/history for adding sleep activity
    router.push(`/activities/history?childId=${selectedChildId}&type=sleep`); // ✅ Benar
  }
};
```

## Cara Kerja Sinkronisasi

### Flow Data Sleep
```
User di /activities/history
    ↓
Klik "+ Catat Aktivitas"
    ↓
Pilih "💤 Sleep" (type: 'sleep')
    ↓
Isi durasi tidur (duration_seconds)
    ↓
Simpan ke tabel `activities`
    ↓
    ↓───────────────────────┐
    ↓                       ↓
/statistics              /activities/history
    ↓                       ↓
getComprehensiveStats()   getActivities()
    ↓                       ↓
Hitung sleep count      Tampilkan list
dan average per day     semua aktivitas
```

### Tabel Activities (Supabase)
```sql
CREATE TABLE activities (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL,
  child_id uuid,
  type text NOT NULL,           -- 'sleep', 'feeding', 'diaper', dll
  start_time timestamptz,
  end_time timestamptz,
  duration_seconds int,         -- Durasi tidur dalam detik
  value text,
  metadata jsonb,
  created_at timestamptz
);
```

### Service Functions

#### 1. Ringkasan Aktivitas (Count)
```typescript
// statisticsService.ts
export async function getComprehensiveStats(
  userId: string,
  childId?: string,
  days: number = 7
): Promise<ComprehensiveStats> {
  const activities = await getActivitiesForPeriod(userId, childId, days);

  return {
    sleep: calculateActivityStats(activities, 'sleep', days),
    // Returns: { count: X, averagePerDay: Y, ... }
    // ...
  };
}
```

#### 2. Chart Data (Durasi per Hari)
```typescript
// statisticsService.ts
export async function getSleepDurationChart(
  userId: string,
  childId?: string,
  days: number = 7
): Promise<ChartDataPoint[]> {
  const activities = await getActivitiesForPeriod(userId, childId, days);
  const sleepActivities = activities.filter((a) => a.type === 'sleep');

  // Group by date and sum duration_seconds
  // Convert to hours for display
  // ...
}
```

## Testing Checklist

### Manual Testing
- [ ] Buka `/activities/history`
- [ ] Tambah aktivitas "💤 Sleep" dengan durasi (misal: 2 jam)
- [ ] Simpan aktivitas
- [ ] Buka `/statistics`
- [ ] Verifikasi Ringkasan Aktivitas (7 Hari):
  - [ ] 💤 Sleep count bertambah (misal: 1x)
  - [ ] Average per day berubah (misal: 0.1/hari jika 7 hari)
- [ ] Klik tab "zZz Tidur"
- [ ] Verifikasi chart menampilkan data durasi tidur
- [ ] Klik tombol "+ Tambah Data Tidur"
- [ ] Verifikasi redirect ke `/activities/history` dengan parameter `type=sleep`

### Verifikasi Database
```sql
-- Check activities table
SELECT 
  type, 
  COUNT(*) as count,
  AVG(duration_seconds) as avg_duration_sec
FROM activities
WHERE type = 'sleep'
  AND user_id = '<user_id>'
  AND child_id = '<child_id>'
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY type;
```

## Catatan Penting

1. **Data Source Consistency**: 
   - Semua data aktivitas (termasuk sleep) disimpan di tabel `activities`
   - Tidak ada duplikasi data di `growth_records` untuk sleep
   - `growth_records` hanya untuk weight/height

2. **Real-time Sync**:
   - Setiap kali user menambah aktivitas di `/activities/history`, data langsung tersimpan ke database
   - Ketika user membuka `/statistics`, data di-fetch ulang dari database
   - Gunakan `useFocusEffect` untuk auto-refresh saat screen focused

3. **Chart vs Count**:
   - **Ringkasan Aktivitas**: Menampilkan **count** (jumlah catatan sleep)
   - **Chart "zZz Tidur"**: Menampilkan **durasi** (jam tidur per hari)
   - Kedua metrik ini berbeda tetapi sama-sama mengambil dari tabel `activities`

## Files Changed
- ✅ `/src/screens/Statistics/StatisticsScreen.tsx` (handleAddRecord navigation)
- ✅ `/src/screens/Activities/ActivityHistory.tsx` (URL params support, auto-open modal)

## Related Files (No Changes)
- `/src/services/statisticsService.ts` (already correct)
- `/src/services/activityService.ts` (already correct)
- `/src/components/activities/AddActivityModal.tsx` (already supports preselectedType)

## Additional Improvements Implemented

### 2. URL Parameter Support di ActivityHistory
**File**: `/src/screens/Activities/ActivityHistory.tsx`

**Changes:**
1. Import `useLocalSearchParams` dari `expo-router`
2. Extract URL params: `childId` dan `type`
3. Auto-select child jika ada `childId` di URL
4. Auto-filter activities jika ada `type` di URL
5. Auto-open AddActivityModal dengan pre-selected type
6. Pass `preselectedType` ke `AddActivityModal`

**Before:**
```typescript
export default function ActivityHistoryScreen() {
  const { user } = useAuth();
  // No URL params support
}
```

**After:**
```typescript
export default function ActivityHistoryScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const preselectedChildId = params?.childId as string;
  const preselectedType = params?.type as string;
  
  // Auto-select child and filter
  useEffect(() => {
    if (preselectedChildId && !selectedChildId) {
      setSelectedChildId(preselectedChildId);
    }
    if (preselectedType && selectedFilter === 'all') {
      setSelectedFilter(preselectedType);
    }
  }, [preselectedChildId, preselectedType]);
  
  // Auto-open modal with pre-selected type
  useEffect(() => {
    if (preselectedType && !addModalVisible && activities.length >= 0) {
      setTimeout(() => setAddModalVisible(true), 500);
    }
  }, [preselectedType]);
}
```

**Modal Props:**
```typescript
<AddActivityModal
  visible={addModalVisible}
  onDismiss={() => setAddModalVisible(false)}
  onSubmit={handleAddActivity}
  preselectedType={preselectedType as any} // ✅ Pass dari URL
/>
```

## User Flow Improvement

### Flow Sebelum Fix:
```
User di /statistics (tab Sleep)
    ↓
Klik "+ Tambah Data Tidur"
    ↓
❌ Redirect ke /(tabs)/media (salah)
    ↓
User bingung, harus cari sendiri dimana form add sleep
```

### Flow Setelah Fix:
```
User di /statistics (tab Sleep)
    ↓
Klik "+ Tambah Data Tidur"
    ↓
✅ Redirect ke /activities/history?childId=X&type=sleep
    ↓
✅ Auto-select child (jika ada childId)
    ↓
✅ Auto-filter ke "Sleep" activities
    ↓
✅ Auto-open AddActivityModal dengan type="sleep" pre-selected
    ↓
User tinggal isi durasi dan klik simpan
    ↓
Data tersimpan ke tabel activities
    ↓
User kembali ke /statistics
    ↓
✅ Ringkasan Aktivitas dan Chart terupdate otomatis
```

## Next Steps (Optional)
1. ✅ ~~Tambahkan parameter URL support di `/activities/history`~~ (DONE)
2. Tambahkan quick action button "Tambah Sleep" di dashboard
3. Tambahkan notifikasi setelah menambah aktivitas: "Data berhasil disimpan dan tersinkronisasi ke Statistics"
4. Tambahkan loading state saat redirect dari Statistics ke ActivityHistory
