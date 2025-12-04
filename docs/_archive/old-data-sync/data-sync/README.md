# 🔄 Data Sync & Auto-Assign child_id

## 🎯 Tujuan
Menghilangkan inkonsistensi data antar layar (Dashboard, Statistics, Activity History) yang sebelumnya disebabkan oleh aktivitas dengan `child_id = NULL`. Semua logika sekarang berorientasi pada **pencegahan** (prevent null) bukan **penanganan menyeluruh** (filter OR di banyak query).

## 🧩 Komponen Utama
| Dokumen | Fungsi |
|---------|--------|
| `AUTO_ASSIGN_OVERVIEW.md` | Ringkasan cepat cara kerja & perintah penting |
| `AUTO_ASSIGN_TECHNICAL.md` | Detail arsitektur, trigger, fallback, metadata |
| `AUTO_ASSIGN_IMPLEMENTATION.md` | File diubah, statistik perubahan, dampak |
| `AUTO_ASSIGN_TESTING.md` | 10 test case fungsional + edge/performance |
| `AUTO_ASSIGN_DEPLOYMENT.md` | Checklist deployment & rollback |
| `CHANGELOG_DATA_SYNC.md` | Kronologi perbaikan dari awal sampai final |

## 🛡️ Strategi "Defense in Depth"
1. Application Layer → `activityService.createActivity()` auto-assign child
2. Preference Layer → `profiles.default_child_id` (user memilih default)
3. Database Layer → Trigger `auto_assign_child_id()` memastikan child_id terisi walau API dilewati
4. Resilience Layer → Trigger delete child melakukan reassignment / flag unlinked
5. Migration Layer → Script migrasi + full backup `activities_backup_20250111`

## 🔁 Prioritas Fallback Auto-Assign
1. Explicit `child_id` (dipilih user)
2. `default_child_id` (preferensi user)
3. First child (oldest created)
4. NULL hanya jika user belum punya child sama sekali

## 🧪 Ringkas Testing (lihat detail di `AUTO_ASSIGN_TESTING.md`)
- Single child → otomatis pakai child itu
- Multiple children + default → pakai default
- Multiple children tanpa default → pakai yang paling tua
- Tanpa children → NULL acceptable
- Trigger insert & trigger delete → metadata tercatat

## 🚀 Ringkas Deployment (lihat `AUTO_ASSIGN_DEPLOYMENT.md`)
Urutan:
1. Backup penuh database
2. Jalankan migrations: 006 → 007 → 008
3. Jalankan migrasi data lama: `scripts/migrate-assign-child-id.sql`
4. Deploy kode aplikasi (services yang diupdate)
5. Verifikasi & monitor (24–48 jam)

## 📊 Dampak Utama
| Sebelum | Sesudah |
|---------|---------|
| Banyak aktivitas `child_id = NULL` | Hampir seluruh aktivitas punya child_id valid |
| Query penuh kondisi OR | Query STRICT sederhana (`eq('child_id', ...)`) |
| Inkonsistensi statistik | Statistik konsisten & akurat |
| Kompleks (includeNull param) | Sederhana & maintainable |
| Sulit audit | Metadata lengkap (auto_assigned, migrated, reassigned) |

## 🔍 Audit Metadata Utama
```sql
-- Aktivitas hasil auto-assign
SELECT id, child_id, metadata->>'auto_assigned', metadata->>'assigned_at'
FROM activities WHERE metadata @> '{"auto_assigned": true}'
ORDER BY created_at DESC LIMIT 50;

-- Aktivitas hasil migrasi
SELECT id, child_id, metadata->>'migrated_at'
FROM activities WHERE metadata @> '{"migrated": true}' LIMIT 50;

-- Aktivitas direassign akibat delete child
SELECT id, child_id, metadata->>'reassigned_from', metadata->>'reassigned_at'
FROM activities WHERE metadata ? 'reassigned_from' LIMIT 50;
```

## 🔗 Integrasi ke Dokumentasi Global
Tambahan link baru ini disarankan di:
- `docs/ARCHITECTURE.md` → Bagian Data Consistency
- Root `README.md` → Bagian Dokumentasi

## ✅ Status
Semua komponen (kode, trigger, migrasi, dokumentasi) siap diuji & deploy.

---
Teruskan ke: `AUTO_ASSIGN_OVERVIEW.md` untuk mulai paling cepat.
