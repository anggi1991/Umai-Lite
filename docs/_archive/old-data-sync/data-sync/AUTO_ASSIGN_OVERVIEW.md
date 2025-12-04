# 🚀 Auto-Assign child_id - Overview

## 🔎 Masalah Awal
Aktivitas tersimpan dengan `child_id = NULL` menyebabkan halaman `/statistics` gagal menampilkan sleep/feeding padahal muncul di Dashboard & History.

## 🎯 Solusi Inti
Pakai pendekatan preventif: saat create activity, sistem memastikan `child_id` terisi melalui prioritas:
1. Explicit `child_id` yang dipilih user
2. `default_child_id` di profil user (preferensi)
3. Child pertama (oldest created)
4. NULL hanya jika user belum punya child

## 🛡️ Lapisan Pertahanan
| Layer | Implementasi | File |
|-------|--------------|------|
| App | Fallback logic | `src/services/activityService.ts` |
| Preference | Default child | `profiles.default_child_id` (migration 008) |
| Database | Trigger sebelum INSERT | `006_add_auto_assign_trigger.sql` |
| Resilience | Trigger sebelum DELETE child | `007_handle_child_delete.sql` |
| Migration | Perbaiki data lama | `scripts/migrate-assign-child-id.sql` |

## ⚙️ Potongan Kode Kunci
```typescript
// activityService.ts (ringkas)
if (!data.child_id) {
  const defaultChild = await getDefaultChild(userId);
  if (defaultChild) chosen = defaultChild;
  else chosen = await getFirstChild(userId); // oldest
  if (chosen) data.child_id = chosen;
}
```

## 🧪 Test Paling Penting
| Kasus | Ekspektasi |
|-------|------------|
| User punya 1 child | child_id = child itu |
| Multi child + default | child_id = default |
| Multi child tanpa default | child_id = oldest |
| Tanpa child | child_id NULL diterima |
| Insert langsung SQL tanpa child_id | Trigger isi otomatis |
| Delete child yang punya aktivitas | Reassign ke child lain / flag unlinked |

## 📊 Query Audit Cepat
```sql
-- Cek sisa aktivitas NULL yang seharusnya sudah punya child
SELECT COUNT(*) FROM activities a
JOIN children c ON c.user_id = a.user_id
WHERE a.child_id IS NULL;

-- Cek distribusi auto-assign
SELECT child_id, COUNT(*) FILTER (WHERE metadata @> '{"auto_assigned": true}') AS auto_assigned
FROM activities GROUP BY child_id ORDER BY auto_assigned DESC LIMIT 10;
```

## 🚀 Deployment Super Singkat
```bash
supabase db dump --data-only > backup_pre_auto_assign.sql
supabase db execute --file supabase/migrations/006_add_auto_assign_trigger.sql
supabase db execute --file supabase/migrations/007_handle_child_delete.sql
supabase db execute --file supabase/migrations/008_add_default_child.sql
supabase db execute --file scripts/migrate-assign-child-id.sql
```

## 🩺 Monitoring 24 Jam
| MetriK | Target |
|--------|--------|
| NULL child_id (user yang punya child) | 0 |
| Auto-assign success | > 99% |
| Waktu insert (trigger) | < 10ms |
| Error di log | < 0.1% aktivitas |

## 🧷 Metadata Penting
| Key | Arti |
|-----|------|
| `auto_assigned` | Ditentukan otomatis di create |
| `assigned_at` | Timestamp auto-assign |
| `migrated` | Diperbaiki oleh script migrasi |
| `reassigned_from` | Asal child sebelum delete |
| `unlinked` | Child dihapus & tidak ada fallback |

## 🔗 Dokumen Lanjutan
- `AUTO_ASSIGN_TECHNICAL.md` (Detail lengkap trigger & fungsi)
- `AUTO_ASSIGN_TESTING.md` (Semua test case)
- `AUTO_ASSIGN_DEPLOYMENT.md` (Checklist produksi)
- `AUTO_ASSIGN_IMPLEMENTATION.md` (File & statistik perubahan)

## ✅ Status
Siap diuji lebih lanjut & masuk deployment checklist.
