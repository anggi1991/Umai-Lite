# 🧪 Auto-Assign child_id - Testing Suite

## 📋 Tujuan
Memastikan seluruh jalur logika penugasan `child_id` bekerja untuk kasus normal, edge case, dan kondisi resilien (trigger DB + migrasi).

## 🧱 Struktur Pengujian
| Kategori | Test Case | ID |
|----------|-----------|----|
| Fungsional | Single child auto-assign | TC1 |
| Fungsional | Multiple children fallback oldest | TC2 |
| Fungsional | Default child preference override | TC3 |
| Fungsional | Explicit child_id prioritas | TC4 |
| Fungsional | User tanpa child | TC5 |
| Database | Insert lewat SQL (trigger assign) | TC6 |
| Database | Delete child → reassignment | TC7 |
| Database | Delete last child → unlinked flag | TC8 |
| Migrasi | Perbaikan data lama NULL | TC9 |
| Service | Preference set/get/clear | TC10 |
| Performa | Trigger insert massal | P1 |
| Performa | Query eq('child_id') scan | P2 |
| Edge | Default child invalid | EC1 |
| Edge | Simultan create + delete | EC2 |
| Edge | Batch insert tanpa child_id | EC3 |

## 🔧 Setup Umum
Gunakan database staging / dev. Jalankan per test dalam transaksi bila perlu.

## ✅ Test Case Detail
### TC1: Single Child Auto-Assign
```sql
INSERT INTO profiles (id, email) VALUES ('u1', 'u1@example.com');
INSERT INTO children (id, user_id, name, created_at) VALUES ('c1', 'u1', 'Baby A', NOW());
```
```typescript
const act = await createActivity('u1', { type: 'sleep', startTime: new Date().toISOString() });
expect(act.child_id).toBe('c1');
expect(act.metadata.auto_assigned).toBe(true);
```

### TC2: Multiple Children Fallback Oldest
Pastikan tanpa default child.
```sql
INSERT INTO children (id, user_id, name, created_at) VALUES ('c2a', 'u2', 'A', '2023-01-01'), ('c2b', 'u2', 'B', '2024-01-01');
```
Ekspektasi: assign ke `c2a`.

### TC3: Default Child Preference Override
```sql
UPDATE profiles SET default_child_id = 'c2b' WHERE id = 'u2';
```
Ekspektasi: aktivitas baru pakai `c2b` meski `c2a` lebih tua.

### TC4: Explicit child_id Prioritas
Berikan `child_id` langsung → metadata tidak menambahkan `auto_assigned`.

### TC5: User Tanpa Child
Ekspektasi: `child_id = NULL`, tidak ada metadata `auto_assigned`.

### TC6: Trigger Insert Via SQL
```sql
INSERT INTO activities (id, user_id, type, start_time, child_id) VALUES (gen_random_uuid(), 'u1', 'sleep', NOW(), NULL);
SELECT child_id, metadata FROM activities WHERE user_id = 'u1' ORDER BY created_at DESC LIMIT 1;
```
Ekspektasi: child_id terisi + metadata layer `db_trigger`.

### TC7: Delete Child → Reassignment
Delete child yang punya sibling → aktivitas berpindah & metadata `reassigned_from`.

### TC8: Delete Last Child → Unlink
Delete satu-satunya child → aktivitas child_id jadi NULL + `unlinked`.

### TC9: Migrasi Data Lama
Siapkan baris lama dengan child_id NULL + user punya child → jalankan script → cek metadata `migrated`.

### TC10: Preference Service
`setDefaultChild` → `getDefaultChild` → `clearDefaultChild` → verifikasi kolom di `profiles` & efek di create activity.

## ⚙️ Performance
### P1: Trigger Mass Insert
Benchmark 100 inserts (loop PL/pgSQL). Total < 1s.

### P2: Query Simplicity
`EXPLAIN ANALYZE SELECT * FROM activities WHERE child_id = '...' ORDER BY start_time DESC LIMIT 20;` → Index scan.

## 🧪 Edge Cases
### EC1: Default Child Invalid
Set default ke UUID tidak ada → fallback ke oldest child tanpa error.
### EC2: Race Condition
Simulasi delete child tepat sebelum insert (dua transaksi) → Minimal dampak; audit manual jika terjadi.
### EC3: Batch Insert Tanpa child_id
Insert multi baris tanpa child_id → Semua terisi oleh trigger.

## 📊 Verifikasi Pasca Test
```sql
-- Harus 0
SELECT COUNT(*) FROM activities a JOIN children c ON c.user_id = a.user_id WHERE a.child_id IS NULL;

-- Distribusi strategi
SELECT metadata->>'strategy', COUNT(*) FROM activities WHERE metadata ? 'strategy' GROUP BY 1;
```

## ✅ Acceptance Criteria
| Kriteria | Target |
|----------|--------|
| Aktivitas valid (punya child_id bila user punya child) | 100% |
| Metadata audit lengkap | Ada untuk semua auto-assign/reassign |
| Performa insert (100 ops) | < 1 detik |
| Query statistik akurat | Konsisten di semua layar |
| NULL child_id (eligible) | 0 |

## 🐛 Troubleshooting Ringkas
| Gejala | Aksi |
|--------|------|
| Aktivitas masih NULL | Cek trigger & default_child_id invalid |
| child_id salah assign | Cek preferensi default & urutan created_at |
| Metadata kosong | Pastikan service tidak bypass & trigger aktif |
| Performa buruk | Cek index `idx_activities_user_child` |

## 📝 Output Testing
Simpat hasil akhir di: `docs/testing/RESULTS_AUTO_ASSIGN.md` (buat jika belum ada).

---
Lanjut ke: `AUTO_ASSIGN_DEPLOYMENT.md` setelah semua pass.
