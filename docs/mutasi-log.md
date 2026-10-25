# Mutasi log Bug API

## Daftar bug

| No | File | Lokasi | Ubah dari | Menjadi                                                 |
|----|------|--------|-----------|---------------------------------------------------------|
| 1 | `src/services/auth.service.ts` | `login`, saat email tidak ditemukan | `throw this.kredensialSalah();` | `throw new UnauthorizedError("Email tidak ditemukan");` |
| 2 | `src/services/auth.service.ts` | `register` | `password: await hashPassword(data.password),` | `password: data.password,`                              |
| 3 | `src/services/auth.service.ts` | konstanta di atas class | `7 * 24 * 60 * 60 * 1000` | `6 * 24 * 60 * 60 * 1000`                               |
| 4 | `src/services/jurnal.service.ts` | `pastikanPemilik` | `jurnal.pesertaId !== pengguna.id` | `jurnal.pesertaId === pengguna.id`                      |
| 5 | `src/services/jurnal.service.ts` | `ambilJurnalYangBolehDiubah` | `jurnal.statusReview === "sudah"` | `jurnal.statusReview === "belum"`                       |
| 6 | `src/services/jurnal.service.ts` | `updateReviewJurnal` | `pengguna.role !== "mentor"` | `pengguna.role !== "mentor" && false`                   |
| 7 | `src/services/peserta.service.ts` | `hapusPeserta` | `if (!result.affected)` | `if (false)`                                            |
| 8 | `src/services/peserta.service.ts` | `pastikanTidakDuplikat` | `if (duplikat && duplikat.id !== kecualiId)` | `if (duplikat)`                                         |
| 9 | `src/services/peserta.service.ts` | `getSemuaPeserta` | `skip: (lq.page - 1) * lq.limit` | `skip: lq.page * lq.limit`                              |
| 10 | `src/routes/peserta.routes.ts` | route `DELETE /peserta/:id` | role yang diizinkan hanya `mentor` | menambah `peserta` ke daftar role                       |


## Log hasil

| No | File dan fungsi | Hasil    | Test yang gagal                                                                              |
|----|-----------------|----------|----------------------------------------------------------------------------------------------|
| 1 | `auth.service.ts` › `login` | Killed   | `auth.service.test.ts` (1 test)                                                              |
| 2 | `auth.service.ts` › `register` | Killed   | `auth.service.test.ts` (1 test) dan `auth-flow.test.ts` (1 test)                             |
| 3 | `auth.service.ts` › konstanta masa berlaku | Killed   | `auth.service.test.ts` (1 test, kemungkinan `expiresAt tepat 7 hari`)                        |
| 4 | `jurnal.service.ts` › `pastikanPemilik` | Killed   | `jurnal.service.test.ts` (6 test)                                                            |
| 5 | `jurnal.service.ts` › `ambilJurnalYangBolehDiubah` | Killed   | `jurnal.service.test.ts` (2 test)                                                            |
| 6 | `jurnal.service.ts` › `updateReviewJurnal` | Killed   | `jurnal.service.test.ts` (1 test, kemungkinan `peserta tidak boleh me-review`)               |
| 7 | `peserta.service.ts` › `hapusPeserta` | Killed   | `peserta.service.test.ts` (1 test, kemungkinan `NotFoundError jika tidak ada yang terhapus`) |
| 8 | `peserta.service.ts` › `pastikanTidakDuplikat` | Survived | tidak ada, 144 lolos                                                                         |
| 9 | `peserta.service.ts` › `getSemuaPeserta` | Survived | tidak ada, 144 lolos                                                                         |
| 10 | `peserta.routes.ts` › `DELETE /peserta/:id` | Killed   | `kontrak-api.test.ts`: 403 jika peserta mencoba menghapus peserta                              |

Skor mutasi: **8 / 10** bug terbunuh.
