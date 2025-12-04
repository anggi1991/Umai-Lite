# 🛠️ Auto-Assign child_id - Technical Deep Dive

## 1. Arsitektur Konseptual
```
[User Action] → createActivity() → (fallback logic) → INSERT activities
                                               ↓
                                 DB Trigger (BEFORE INSERT)
                                               ↓
                                   Guaranteed child_id
```

## 2. Fallback Prioritas
1. Explicit `child_id` → dipakai apa adanya
2. `profiles.default_child_id` → preferensi user (editable via service)
3. First child (order by created_at ASC) → fallback
4. NULL → hanya jika user belum punya anak

## 3. Skema & Kolom Relevan
| Tabel | Kolom | Fungsi |
|-------|-------|--------|
| `profiles` | `default_child_id` | Preferensi child default user |
| `children` | `created_at` | Menentukan oldest saat fallback |
| `activities` | `child_id`, `metadata` | Track penugasan, migrasi, reassignment |

## 4. Kode Aplikasi Inti
```typescript
// activityService.ts (bagian ringkas)
async function createActivity(userId: string, input: ActivityInput) {
  const data = { ...input };

  if (!data.child_id) {
    const defaultChild = await getDefaultChild(userId);
    if (defaultChild) {
      data.child_id = defaultChild;
      data.metadata = { ...data.metadata, auto_assigned: true, assigned_at: new Date().toISOString(), strategy: 'default_child' };
    } else {
      const { data: children } = await supabase
        .from('children')
        .select('id')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(1);
      if (children && children.length) {
        data.child_id = children[0].id;
        data.metadata = { ...data.metadata, auto_assigned: true, assigned_at: new Date().toISOString(), strategy: 'first_child' };
      } else {
        // Dibiarkan NULL - acceptable untuk user baru
      }
    }
  }

  const { data: inserted } = await supabase
    .from('activities')
    .insert([{ user_id: userId, ...data }])
    .select()
    .single();

  return inserted as Activity;
}
```

## 5. Database Trigger (Lapisan Proteksi)
**File:** `supabase/migrations/006_add_auto_assign_trigger.sql`
```sql
CREATE OR REPLACE FUNCTION auto_assign_child_id()
RETURNS TRIGGER AS $$
DECLARE
  chosen UUID;
BEGIN
  -- Jika sudah ada child_id, lewati
  IF NEW.child_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Ambil default child jika ada
  SELECT default_child_id INTO chosen FROM profiles WHERE id = NEW.user_id AND default_child_id IS NOT NULL;

  -- Jika belum, ambil oldest child
  IF chosen IS NULL THEN
    SELECT id INTO chosen FROM children WHERE user_id = NEW.user_id ORDER BY created_at ASC LIMIT 1;
  END IF;

  -- Assign jika ditemukan
  IF chosen IS NOT NULL THEN
    NEW.child_id = chosen;
    IF NEW.metadata IS NULL THEN NEW.metadata = '{}'::jsonb; END IF;
    NEW.metadata = NEW.metadata || jsonb_build_object('auto_assigned', true, 'assigned_at', NOW(), 'layer', 'db_trigger');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_assign_child_id
BEFORE INSERT ON activities
FOR EACH ROW EXECUTE FUNCTION auto_assign_child_id();
```

## 6. Trigger Delete Child (Reassign / Unlink)
**File:** `supabase/migrations/007_handle_child_delete.sql`
```sql
CREATE OR REPLACE FUNCTION reassign_activities_on_child_delete()
RETURNS TRIGGER AS $$
DECLARE
  fallback UUID;
BEGIN
  -- Cari fallback child lain
  SELECT id INTO fallback FROM children WHERE user_id = OLD.user_id AND id <> OLD.id ORDER BY created_at ASC LIMIT 1;

  IF fallback IS NOT NULL THEN
    UPDATE activities
    SET child_id = fallback,
        metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('reassigned_from', OLD.id, 'reassigned_at', NOW())
    WHERE child_id = OLD.id;
  ELSE
    UPDATE activities
    SET child_id = NULL,
        metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('unlinked', true, 'unlinked_from', OLD.id, 'unlinked_at', NOW())
    WHERE child_id = OLD.id;
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_reassign_on_child_delete
BEFORE DELETE ON children
FOR EACH ROW EXECUTE FUNCTION reassign_activities_on_child_delete();
```

## 7. Script Migrasi Data Lama
**File:** `scripts/migrate-assign-child-id.sql`
Tujuan:
- Backup permanen tabel lama → `activities_backup_20250111`
- Assign child_id untuk aktivitas NULL jika user punya child
- Tambah metadata `migrated: true`, `migrated_at`

Potongan penting:
```sql
UPDATE activities a
SET child_id = m.new_child_id,
    metadata = COALESCE(a.metadata, '{}'::jsonb) || jsonb_build_object('migrated', true, 'migrated_at', NOW())
FROM temp_child_mapping m
WHERE a.id = m.id AND m.new_child_id IS NOT NULL;
```

## 8. Metadata Konvensi
| Key | Tipe | Sumber | Deskripsi |
|-----|------|--------|-----------|
| `auto_assigned` | boolean | App/Trigger | Aktivitas ditentukan otomatis |
| `assigned_at` | timestamp | App/Trigger | Waktu penentuan child_id |
| `strategy` | string | App | `default_child` atau `first_child` |
| `layer` | string | Trigger | Menandai penugasan dari trigger |
| `migrated` | boolean | Script | Aktivitas direvisi oleh migrasi |
| `migrated_at` | timestamp | Script | Waktu migrasi |
| `reassigned_from` | UUID | Trigger delete | Child asal sebelum dihapus |
| `reassigned_at` | timestamp | Trigger delete | Waktu reassignment |
| `unlinked` | boolean | Trigger delete | Child dihapus tanpa fallback |
| `unlinked_from` | UUID | Trigger delete | Child yang dihapus |
| `unlinked_at` | timestamp | Trigger delete | Waktu unlink |

## 9. Query Audit Lanjutan
```sql
-- Semua aktivitas tanpa child padahal user punya child → harus 0
SELECT COUNT(*) FROM activities a
JOIN children c ON c.user_id = a.user_id
WHERE a.child_id IS NULL;

-- Distribusi strategi auto-assign
SELECT metadata->>'strategy' AS strat, COUNT(*)
FROM activities WHERE metadata ? 'strategy'
GROUP BY strat;

-- Reassignment historis
SELECT metadata->>'reassigned_from', COUNT(*)
FROM activities WHERE metadata ? 'reassigned_from'
GROUP BY metadata->>'reassigned_from';
```

## 10. Performa & Optimisasi
Index penting:
```sql
CREATE INDEX IF NOT EXISTS idx_profiles_default_child_id ON profiles(default_child_id);
CREATE INDEX IF NOT EXISTS idx_children_user_created ON children(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_activities_user_child ON activities(user_id, child_id);
```
Semua query utama sekarang menggunakan conditional sederhana `eq('child_id', ...)` tanpa OR kompleks → lebih cepat di Postgres planner.

## 11. Edge Cases Dipertimbangkan
| Kasus | Perlakuan |
|-------|-----------|
| User tanpa child | child_id tetap NULL |
| Default child invalid (sudah dihapus) | Fallback ke first child |
| Simultan create & delete child (race) | Trigger tetap konsisten; worst-case fallback skip → manual audit |
| Batch insert tanpa child_id | Trigger mengisi otomatis |
| Delete last remaining child | child_id aktivitas jadi NULL + metadata `unlinked` |

## 12. Alasan Tidak Menyimpan child_id NULL Lagi
- Mengurangi kompleksitas query OR / union
- Menghindari statistik menampilkan 0 padahal aktivitas ada
- Memudahkan caching & indexing

## 13. Dampak Terhadap Statistik
Semua perhitungan di `statisticsService` kembali ke filtrasi sederhana:
```typescript
query.eq('child_id', childId)
```
Tanpa lagi harus mempertimbangkan `child_id IS NULL` di jalur utama.

## 14. Alignment dengan Konvensi Proyek
- Penamaan metadata snake_case di DB tetap JSONB camelCase? → Mengikuti standar sebelumnya (metadata campuran) → Konsisten.
- Tidak melanggar RLS (child_id selalu valid milik user).
- Tidak menambah risiko security.

## 15. Next Improvement Ideas
| Ide | Nilai |
|-----|-------|
| Tambah analytics event untuk auto_assign strategi | Observability |
| Tambah endpoint audit JSON export | Compliance |
| Tambah toggle "force choose child" di settings | UX optional |
| Auto-clean metadata migrated setelah 6 bulan | Kebersihan data |

---
**Selesai** – Lanjut ke `AUTO_ASSIGN_TESTING.md` untuk memastikan implementasi lolos semua uji.
