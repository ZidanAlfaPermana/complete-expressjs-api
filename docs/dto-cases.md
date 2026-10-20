# DTO Cases: Payload Valid dan Tidak Valid per DTO

## Ringkasan

| # | DTO | Endpoint |
|---|-----|----------|
| 1 | RegisterDto | POST /register |
| 2 | LoginDto | POST /login |
| 3 | PesertaDto | POST /peserta |
| 4 | UpdateProfilDto | PATCH /peserta/me |
| 5 | ListPesertaQueryDto | GET /peserta |
| 6 | CreateJurnalDto | POST /jurnal |
| 7 | UpdateJurnalDto | PATCH /jurnal/:id |
| 8 | ReviewJurnalDto | PATCH /jurnal/:id/review |
| 9 | ListJurnalQueryDto | GET /jurnal |

## Detail per DTO

### 1. RegisterDto

| # | Payload | Harapan | Hasil nyata                                  |
|---|---------|---------|----------------------------------------------|
| V1 | `{"nama":"Budi Santoso","sekolah":"SMKN 5 Malang","email":"budi@mail.com","password":"rahasia123","konfirmasiPassword":"rahasia123"}` | 201 | 201 |
| V2 | `{"nama":"  Siti  ","sekolah":"SMKN 5 Malang","email":"  Siti@Mail.COM  ","password":"rahasia123","konfirmasiPassword":"rahasia123"}` | 201 | 201 |
| V3 | `{"nama":"Ani","sekolah":"SMK","email":"ani@mail.com","password":"abcd1234","konfirmasiPassword":"abcd1234"}` | 201 | 201 |
| I1 | `{}` | 422 | 422 VALIDATION_ERROR, nama: Nama maksimal 100 karakter, nama: Nama minimal 3 karakter |
| I2 | `{"nama":"      ","sekolah":"SMKN 5 Malang","email":"a@mail.com","password":"rahasia123","konfirmasiPassword":"rahasia123"}` | 422 | 422 VALIDATION_ERROR, nama: Nama minimal 3 karakter |
| I3 | `{"nama":"Budi","sekolah":"SMKN 5 Malang","email":"a@mail.com","password":"abcdefgh","konfirmasiPassword":"abcdefgh"}` | 422 | 422 VALIDATION_ERROR, password: Password harus mengandung huruf dan angka |
| I4 | `{"nama":"Budi","sekolah":"SMKN 5 Malang","email":"a@mail.com","password":"rahasia123","konfirmasiPassword":"beda12345"}` | 422 | 422 VALIDATION_ERROR, konfirmasiPassword: Konfirmasi password tidak cocok |
| I5 | `{"nama":"Budi","sekolah":"SMKN 5 Malang","email":"a@mail.com","password":"rahasia123","konfirmasiPassword":"rahasia123","role":"mentor"}` | 422 | 422 VALIDATION_ERROR, role: Properti ini tidak diizinkan |

### 2. LoginDto

| # | Payload | Harapan | Hasil nyata |
|---|---------|---------|-------------|
| V1 | `{"email":"budi@mail.com","password":"rahasia123"}` | 200 | 200 |
| V2 | `{"email":"ani@mail.com","password":"abcd1234"}` | 200 | 200 |
| V3 | `{"email":"budi@mail.com","password":"salah-total"}` | 401 | 401 UNAUTHORIZED, Email atau password salah |
| I1 | `{}` | 422 | 422 VALIDATION_ERROR, email: Format email tidak valid, password: Password wajib diisi |
| I2 | `{"email":"bukan-email","password":"x"}` | 422 | 422 VALIDATION_ERROR, email: Format email tidak valid |
| I3 | `{"email":"budi@mail.com"}` | 422 | 422 VALIDATION_ERROR, password: Password wajib diisi, password: Password harus berupa teks |
| I4 | `{"email":["a@b.co"],"password":"x"}` | 422 | 422 VALIDATION_ERROR, email: Format email tidak valid |
| I5 | `{"email":"budi@mail.com","password":""}` | 422 | 422 VALIDATION_ERROR, password: Password wajib diisi |

### 3. PesertaDto

| # | Payload | Harapan | Hasil nyata                                                                                |
|---|---------|---------|--------------------------------------------------------------------------------------------|
| V1 | `{"nama":"Budi Santoso","sekolah":"SMKN 5 Malang","email":"p1@mail.com","status":"aktif","telepon":"081234567890","fase":1,"role":"peserta","password":"rahasia123"}` | 201 | 201                                                                                        |
| V2 | `{"nama":"Siti Aminah","sekolah":"SMKN 5 Malang","email":"p2@mail.com","status":"lulus","telepon":"081234567890","fase":5,"skillIds":[],"role":"peserta","password":"rahasia123"}` | 201 | 201                                                                                        |
| V3 | `{"nama":"Pak Mentor","sekolah":"SMKN 5 Malang","email":"p3@mail.com","status":"aktif","telepon":"081234567890","fase":1,"role":"mentor","password":"rahasia123"}` | 201 | 201                                                                                        |
| I1 | `{"nama":"Budi Santoso","sekolah":"SMKN 5 Malang","email":"p4@mail.com","status":"aktif","telepon":"081234567890","fase":6,"role":"peserta","password":"rahasia123"}` | 422 | 422 VALIDATION_ERROR, fase: Fase wajib diisi, dan fase hanya ada fase 1 sampai 5           |
| I2 | `{"nama":"Budi Santoso","sekolah":"SMKN 5 Malang","email":"p4@mail.com","status":"magang","telepon":"081234567890","fase":1,"role":"peserta","password":"rahasia123"}` | 422 | 422 VALIDATION_ERROR, status: Status tidak valid. harus berisi aktif, lulus, atau berhenti |
| I3 | `{"nama":"ab","sekolah":"SMKN 5 Malang","email":"p4@mail.com","status":"aktif","telepon":"081234567890","fase":1,"role":"peserta","password":"rahasia123"}` | 422 | 422 VALIDATION_ERROR, nama: Nama wajib diisi, minimal 3 karakter                           |
| I4 | `{"nama":"Budi Santoso","sekolah":"SMKN 5 Malang","email":"p4@mail.com","status":"aktif","telepon":"081234567890","fase":1,"role":"admin","password":"rahasia123"}` | 422 | 422 VALIDATION_ERROR, role: Role wajib diisi, dengan memilih role peserta atau mentor      |
| I5 | `{"nama":"Budi Santoso","sekolah":"SMKN 5 Malang","email":"p4@mail.com","status":"aktif","telepon":"081234567890","fase":1,"role":"peserta","password":"rahasia123","id":99}` | 422 | 422 VALIDATION_ERROR, id: Properti ini tidak diizinkan                                     |

### 4. UpdateProfilDto

| # | Payload | Harapan | Hasil nyata |
|---|---------|---------|-------------|
| V1 | `{"nama":"Budi Baru"}` | 200 | 200 |
| V2 | `{"telepon":"081234567890"}` | 200 | 200 |
| V3 | `{"nama":"Budi Baru","sekolah":"SMKN 1 Malang","telepon":"081234567890"}` | 200 | 200 |
| I1 | `{"nama":"ab"}` | 422 | 422 VALIDATION_ERROR, nama: Nama minimal 3 karakter |
| I2 | `{"nama":123}` | 422 | 422 VALIDATION_ERROR, nama: Nama maksimal 100 karakter, nama: Nama minimal 3 karakter |
| I3 | `{"telepon":"12345"}` | 422 | 422 VALIDATION_ERROR, telepon: Format nomor telepon Indonesia tidak valid |
| I4 | `{"sekolah":"a"}` | 422 | 422 VALIDATION_ERROR, sekolah: sekolah must be longer than or equal to 3 characters |
| I5 | `{"role":"mentor"}` | 422 | 422 VALIDATION_ERROR, role: Properti ini tidak diizinkan |

### 5. ListPesertaQueryDto

| # | Query | Harapan | Hasil nyata |
|---|-------|---------|-------------|
| V1 | `?sekolah=SMKN 5 Malang` | 200 | 200 |
| V2 | `?sortBy=nama&fase=3` | 200 | 200 |
| V3 | (tanpa query) | 200 | 200 |
| I1 | `?sortBy=password` | 422 | 422 VALIDATION_ERROR, sortBy: sortBy harus salah satu dari: nama, fase, createdAt |
| I2 | `?fase=6` | 422 | 422 VALIDATION_ERROR, fase: fase maksimal 5 |
| I3 | `?fase=abc` | 422 | 422 VALIDATION_ERROR, fase: fase maksimal 5, fase: fase minimal 1 |
| I4 | `?sekolah=a&sekolah=b` | 422 | 422 VALIDATION_ERROR, sekolah: sekolah harus berupa teks, sekolah: nama sekolah maksimal 100 kata |

### 6. CreateJurnalDto

| # | Payload | Harapan | Hasil nyata |
|---|---------|---------|-------------|
| V1 | `{"kegiatan":"Belajar membuat endpoint dengan DTO","rencanaBesok":"Menulis test"}` | 201 | 201 |
| V2 | `{"kegiatan":"Belajar membuat endpoint dengan DTO","hambatan":"Sempat bingung","rencanaBesok":"Menulis test","linkCommit":"https://github.com/user/repo/commit/abc123","lampiran":[{"url":"https://example.com/a.png","keterangan":"screenshot"}]}` | 201 | 201 |
| V3 | `{"kegiatan":"1234567890","rencanaBesok":"12345"}` | 201 | 201 |
| I1 | `{}` | 422 | 422 VALIDATION_ERROR, kegiatan: Kegiatan maksimal 2000 karakter, kegiatan: Kegiatan minimal 10 karakter |
| I2 | `{"kegiatan":"pendek","rencanaBesok":"Menulis test"}` | 422 | 422 VALIDATION_ERROR, kegiatan: Kegiatan minimal 10 karakter |
| I3 | `{"kegiatan":"Belajar membuat endpoint dengan DTO","rencanaBesok":"Menulis test","linkCommit":"bukan-url"}` | 422 | 422 VALIDATION_ERROR, linkCommit: Link commit harus berupa URL yang valid |
| I4 | `{"kegiatan":"Belajar membuat endpoint dengan DTO","rencanaBesok":"Menulis test","lampiran":[{"url":"bukan-url"}]}` | 422 | 422 VALIDATION_ERROR, lampiran.0.url: URL lampiran tidak valid |
| I5 | `{"kegiatan":"Belajar membuat endpoint dengan DTO","rencanaBesok":"Menulis test","pesertaId":2}` | 422 | 422 VALIDATION_ERROR, pesertaId: Properti ini tidak diizinkan |

### 7. UpdateJurnalDto

| # | Payload | Harapan | Hasil nyata |
|---|---------|---------|-------------|
| V1 | `{"kegiatan":"Kegiatan yang sudah diperbarui"}` | 200 | 200 |
| V2 | `{"hambatan":"Tidak ada hambatan"}` | 200 | 200 |
| V3 | `{"linkCommit":"https://github.com/user/repo/commit/abc123"}` | 200 | 200 |
| I1 | `{"kegiatan":"12345"}` | 422 | 422 VALIDATION_ERROR, kegiatan: kegiatan must be longer than or equal to 10 characters |
| I2 | `{"kegiatan":123}` | 422 | 422 VALIDATION_ERROR, kegiatan: kegiatan must be shorter than or equal to 2000 characters, kegiatan: kegiatan must be longer than or equal to 10 characters |
| I3 | `{"linkCommit":"bukan-url"}` | 422 | 422 VALIDATION_ERROR, linkCommit: Link commit harus berupa URL yang valid |
| I4 | `{"lampiran":"x"}` | 422 | 422 VALIDATION_ERROR, lampiran: Lampiran maksimal 5 item, lampiran: lampiran must be an array |
| I5 | `{"statusReview":"sudah"}` | 422 | 422 VALIDATION_ERROR, statusReview: Properti ini tidak diizinkan |

### 8. ReviewJurnalDto

| # | Payload | Harapan | Hasil nyata |
|---|---------|---------|-------------|
| V1 | `{"statusReview":"belum"}` | 200 | 200 |
| V2 | `{"statusReview":"sudah","catatan":"Sudah bagus, lanjutkan"}` | 200 | 200 |
| V3 | `{"statusReview":"sudah","catatan":"12345"}` | 200 | 200 |
| I1 | `{}` | 422 | 422 VALIDATION_ERROR, statusReview: statusReview harus belum atau sudah |
| I2 | `{"statusReview":"selesai"}` | 422 | 422 VALIDATION_ERROR, statusReview: statusReview harus belum atau sudah |
| I3 | `{"statusReview":"sudah"}` | 422 | 422 VALIDATION_ERROR, catatan: Catatan minimal 5 karakter, catatan: Catatan wajib diisi saat jurnal ditandai sudah direview |
| I4 | `{"statusReview":"sudah","catatan":"abcd"}` | 422 | 422 VALIDATION_ERROR, catatan: Catatan minimal 5 karakter |
| I5 | `{"statusReview":"belum","kegiatan":"diubah mentor"}` | 422 | 422 VALIDATION_ERROR, kegiatan: Properti ini tidak diizinkan |

### 9. ListJurnalQueryDto

| # | Query | Harapan | Hasil nyata |
|---|-------|---------|-------------|
| V1 | `?sortBy=statusReview&statusReview=sudah` | 200 | 200 |
| V2 | `?from=2026-09-01&to=2026-09-30` | 200 | 200 |
| V3 | `?belumDireview=true&pesertaId=1` | 200 | 200 |
| I1 | `?sortBy=kegiatan` | 422 | 422 VALIDATION_ERROR, sortBy: sortBy must be one of the following values: createdAt, statusReview |
| I2 | `?statusReview=selesai` | 422 | 422 VALIDATION_ERROR, statusReview: statusReview harus belum atau sudah |
| I3 | `?from=kemarin` | 422 | 422 VALIDATION_ERROR, from: from harus berformat tanggal ISO, contoh 2026-09-01 |
| I4 | `?pesertaId=abc` | 422 | 422 VALIDATION_ERROR, pesertaId: pesertaId must not be less than 1, pesertaId: pesertaId must be an integer number |
| I5 | `?belumDireview=mungkin` | 422 | 422 VALIDATION_ERROR, belumDireview: belumDireview harus true atau false |

## Tabel test payload pada setiap DTO

| DTO | Valid | Tidak Valid | Status |
|-----|-------|-------------|--------|
|     |       |             | PASS   |
|     |       |             | PASS   |
