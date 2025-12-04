# 📦 Implementasi & Dampak - Auto-Assign child_id

## 1. Ringkas Masalah Awal
Data aktivitas muncul di Dashboard & History tetapi kosong di Statistics karena banyak baris `activities.child_id = NULL` sehingga query statistik yang strict gagal.

## 2. Strategi Perbaikan
Berpindah dari pendekatan "inclusive filtering" (OR child_id/null) → ke pendekatan "prevent null" melalui:
- Fallback logic di service
- Preferensi user (default child)
- Trigger DB sebelum insert
- Trigger DB sebelum delete child
- Migrasi data lama + backup permanen

## 3. File yang Diubah / Dibuat
| No | File | Jenis | Status |
|----|------|-------|--------|
| 1 | `src/services/activityService.ts` | Modified | Tambah fallback + metadata |
| 2 | `src/services/statisticsService.ts` | Modified | Query revert ke STRICT |
| 3 | `src/services/userPreferencesService.ts` | New | CRUD default_child_id |
| 4 | `supabase/migrations/006_add_auto_assign_trigger.sql` | New | Trigger insert |
| 5 | `supabase/migrations/007_handle_child_delete.sql` | New | Trigger delete |
| 6 | `supabase/migrations/008_add_default_child.sql` | New | Kolom + FK + RPC |
| 7 | `scripts/migrate-assign-child-id.sql` | Modified | Backup + verification + rollback |
| 8 | (Dokumentasi) | New | Multi file dipusatkan ke folder ini |

## 4. Perubahan Logika Utama
Sebelum:
```typescript
query.or(`child_id.eq.${childId},child_id.is.null`)
```
Sesudah:
```typescript
query.eq('child_id', childId) // aman karena prevent null
```

## 5. Metadata Ditambahkan
| Key | Sumber | Tujuan |
|-----|--------|--------|
| `auto_assigned` | App/Trigger | Menandai penugasan otomatis |
| `assigned_at` | App/Trigger | Timestamp penugasan |
| `strategy` | App | default_child / first_child |
| `layer` | Trigger | Asal penugasan dari DB |
| `migrated` | Migrasi | Menandai data diperbaiki |
| `migrated_at` | Migrasi | Timestamp perbaikan |
| `reassigned_from` | Trigger delete | Child asal sebelum dipindah |
| `reassigned_at` | Trigger delete | Timestamp pindah |
| `unlinked` | Trigger delete | Tidak ada fallback child |

## 6. Dampak Terhadap Query & Performa
| Aspek | Sebelum | Sesudah |
|-------|---------|---------|
| Filtering | OR + kondisi ekstra | Satu kondisi eq() |
| Indeks | Kurang efektif | Lebih optimal (idx_activities_user_child) |
| Maintainability | Banyak parameter includeNull | Sederhana, 1 jalur |
| Statistik | Sering 0 padahal ada data | Akurat & sinkron |

## 7. Keamanan & Integritas Data
- No hardcoded secrets
- Tidak melanggar Row Level Security (child_id selalu valid milik user)
- Memberi jejak audit lengkap di metadata JSONB

## 8. Skala & Pertumbuhan
- Query lebih ringan untuk jangka panjang
- Mudah ditambah pengayaan (misal analytics tambahan) tanpa memodifikasi schema lagi

## 9. Migrasi Data Lama
Langkah-langkah utama:
1. Backup → `activities_backup_20250111`
2. Mapping child pertama per user
3. Update baris NULL
4. Tambah metadata migrated
5. Verification & optional rollback tersedia

## 10. Integrasi ke Layer Lain
| Layer | Dampak |
|-------|--------|
| UI Screens | Tidak perlu lagi prop includeNull |
| Services | Simpler function signature |
| DB | Menambah 2 trigger + 1 kolom + index |
| Documentation | Dipusatkan & rapi di `docs/data-sync/` |

## 11. Statistik Perubahan (Estimasi)
| Jenis | Nilai |
|-------|-------|
| File ditambah | 7 |
| File diubah | 3 |
| Baris dokumentasi | > 1500 |
| Baris kode TS/SQL baru | ~300 |
| Kompleksitas query | Berkurang signifikan |

## 12. Risiko & Mitigasi
| Risiko | Mitigasi |
|--------|----------|
| Trigger gagal silent | Audit NOTICE + log manual |
| Data migrasi salah assign | Backup permanen + rollback script |
| Default child dihapus | Fallback ke oldest child |
| Kinerja menurun | Query simpler → risiko rendah |

## 13. Checklist Validasi Akhir
- [ ] Semua aktivitas baru punya child_id (kecuali no-child user)
- [ ] Statistik menampilkan data konsisten
- [ ] Tidak ada query OR lama tersisa
- [ ] Triggers aktif & diuji
- [ ] Migrasi diverifikasi
- [ ] Dokumentasi terhubung ke arsitektur global

## 14. Saran Lanjutan
- Tambah unit test khusus fallback
- Buat dashboard admin audit auto-assign
- Cleanup metadata `migrated` setelah periode tertentu

## 15. Status Implementasi
✅ Selesai & Siap masuk pipeline testing/deployment.

---
Lanjutkan ke: `AUTO_ASSIGN_TESTING.md` untuk eksekusi test.
