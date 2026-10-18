# Dokumentasi Kode Error

| Kode | HTTP | Kapan terjadi |
|------|------|---------------|
| `VALIDATION_ERROR` | 422 | Input (body, query, atau params) gagal divalidasi DTO: tipe salah, kosong, terlalu pendek/panjang, di luar rentang, format salah, **properti tidak diizinkan (whitelist)**, atau body bukan object (array, kosong, Content-Type bukan JSON). Nilai yang ditolak database karena format salah (PG `22P02`) juga memakai kode ini |
| `INVALID_JSON` | 400 | Body berupa JSON rusak sehingga gagal di-parse oleh `express.json()` |
| `UNAUTHORIZED` | 401 | Header `Authorization: Bearer <token>` tidak ada atau formatnya salah, atau login gagal |
| `TOKEN_EXPIRED` | 401 | Token JWT sudah kedaluwarsa |
| `INVALID_TOKEN` | 401 | Token JWT tidak valid (salah format atau signature tidak cocok) |
| `FORBIDDEN` | 403 | Sudah login tetapi tidak berhak: role salah (`requireRole`) atau mengubah jurnal milik orang lain (ownership check) |
| `NOT_FOUND` | 404 | Data dengan ID yang diminta tidak ada, atau route tidak terdaftar |
| `CONFLICT` | 409 | (1) Aturan bisnis bentrok, misalnya peserta dengan nama dan sekolah yang sama sudah terdaftar; atau jurnal yang sudah direview diedit lagi. (2) Nilai duplikat di kolom unique (PG `23505`, misalnya email sudah terdaftar). (3) Relasi tidak valid atau data masih dipakai (PG `23503`, misalnya menghapus peserta yang masih punya jurnal) |
| `PAYLOAD_TOO_LARGE` | 413 | Body request JSON melebihi batas ukuran `express.json` (**100 KB**, sesuaikan dengan nilai `limit` di `app.ts`) |
| `RATE_LIMITED` | 429 | Terlalu banyak request dari satu klien. *(Hapus baris ini jika rate limiter tidak dipasang)* |
| `INTERNAL_ERROR` | 500 | Error tidak dikenali (bug server). Isi error asli hanya masuk log, tidak dikirim ke client |

## Contoh response

### VALIDATION_ERROR

Data tidak valid (tipe salah dan nama terlalu pendek):

```json
{
  "sukses": false,
  "error": {
    "kode": "VALIDATION_ERROR",
    "pesan": "Validasi gagal",
    "detail": [
      { "field": "nama", "pesan": "Nama minimal 3 karakter" },
      { "field": "email", "pesan": "Format email tidak valid" }
    ]
  },
  "requestId": "a5c0d93c-e31b-4ef6-8d20-a94ad85e62e1"
}
```

**Kasus: properti tidak diizinkan (whitelist).** Contoh: `{ "nama": "Budi", ..., "role": "mentor" }` pada register atau `PATCH /peserta/me`. Properti yang tidak dideklarasikan di DTO ditolak, bukan dibuang diam-diam:

```json
{
  "sukses": false,
  "error": {
    "kode": "VALIDATION_ERROR",
    "pesan": "Validasi gagal",
    "detail": [{ "field": "role", "pesan": "property role should not exist" }]
  },
  "requestId": "a5c0d93c-e31b-4ef6-8d20-a94ad85e62e1"
}
```

**Kasus: body bukan object.** Body `[]`, body kosong, atau Content-Type bukan `application/json` (misalnya `text/plain`, sehingga body tidak di-parse):

```json
{
  "sukses": false,
  "error": {
    "kode": "VALIDATION_ERROR",
    "pesan": "Validasi gagal",
    "detail": [{ "field": "body", "pesan": "body harus berupa object" }]
  },
  "requestId": "a5c0d93c-e31b-4ef6-8d20-a94ad85e62e1"
}
```

**Kasus: query tidak valid.** Contoh `?sekolah=a&sekolah=b` atau `?page[x]=1&limit[]=5`:

```json
{
  "sukses": false,
  "error": {
    "kode": "VALIDATION_ERROR",
    "pesan": "Validasi gagal",
    "detail": [{ "field": "sekolah", "pesan": "sekolah must be a string" }]
  },
  "requestId": "a5c0d93c-e31b-4ef6-8d20-a94ad85e62e1"
}
```

### INVALID_JSON

```json
{
  "sukses": false,
  "error": { "kode": "INVALID_JSON", "pesan": "Format JSON pada body tidak valid" },
  "requestId": "a5c0d93c-e31b-4ef6-8d20-a94ad85e62e1"
}
```

### UNAUTHORIZED

```json
{
  "sukses": false,
  "error": { "kode": "UNAUTHORIZED", "pesan": "Token tidak ditemukan" },
  "requestId": "a5c0d93c-e31b-4ef6-8d20-a94ad85e62e1"
}
```

### TOKEN_EXPIRED

```json
{
  "sukses": false,
  "error": { "kode": "TOKEN_EXPIRED", "pesan": "Token sudah kedaluwarsa" },
  "requestId": "a5c0d93c-e31b-4ef6-8d20-a94ad85e62e1"
}
```

### INVALID_TOKEN

```json
{
  "sukses": false,
  "error": { "kode": "INVALID_TOKEN", "pesan": "Token tidak valid" },
  "requestId": "a5c0d93c-e31b-4ef6-8d20-a94ad85e62e1"
}
```

### FORBIDDEN

```json
{
  "sukses": false,
  "error": { "kode": "FORBIDDEN", "pesan": "Aksi ini hanya untuk: mentor" },
  "requestId": "a5c0d93c-e31b-4ef6-8d20-a94ad85e62e1"
}
```

### NOT_FOUND

```json
{
  "sukses": false,
  "error": { "kode": "NOT_FOUND", "pesan": "Route GET /api/jur tidak ditemukan" },
  "requestId": "a5c0d93c-e31b-4ef6-8d20-a94ad85e62e1"
}
```

### CONFLICT

Aturan bisnis (dari service):

```json
{
  "sukses": false,
  "error": {
    "kode": "CONFLICT",
    "pesan": "Peserta bernama Feri dari sekolah SMKN 1 Malang sudah terdaftar!"
  },
  "requestId": "a5c0d93c-e31b-4ef6-8d20-a94ad85e62e1"
}
```

Email duplikat (unique constraint, PG `23505`):

```json
{
  "sukses": false,
  "error": { "kode": "CONFLICT", "pesan": "Data dengan nilai yang sama sudah ada" },
  "requestId": "a5c0d93c-e31b-4ef6-8d20-a94ad85e62e1"
}
```

Menghapus peserta yang masih punya jurnal (foreign key, PG `23503`):

```json
{
  "sukses": false,
  "error": {
    "kode": "CONFLICT",
    "pesan": "Data berelasi dengan data lain (tidak ditemukan atau masih dipakai)"
  },
  "requestId": "a5c0d93c-e31b-4ef6-8d20-a94ad85e62e1"
}
```

### PAYLOAD_TOO_LARGE

Body lebih dari 100 KB:

```json
{
  "sukses": false,
  "error": { "kode": "PAYLOAD_TOO_LARGE", "pesan": "Ukuran request terlalu besar" },
  "requestId": "a5c0d93c-e31b-4ef6-8d20-a94ad85e62e1"
}
```

### INTERNAL_ERROR

Isi error asli hanya ada di log server (dicari lewat `requestId`):

```json
{
  "sukses": false,
  "error": { "kode": "INTERNAL_ERROR", "pesan": "Terjadi kesalahan di server" },
  "requestId": "a5c0d93c-e31b-4ef6-8d20-a94ad85e62e1"
}
```

## Perbedaan 401, 403, dan 422

| Status | Arti | Dipakai untuk |
|--------|------|---------------|
| 401 | Identitas tidak terbukti | Token hilang (`UNAUTHORIZED`), token invalid (`INVALID_TOKEN`), token expired (`TOKEN_EXPIRED`), login gagal |
| 403 | Identitas jelas tetapi tidak punya izin | Role tidak sesuai (`requireRole`), bukan pemilik jurnal |
| 422 | Request dipahami tetapi isinya tidak valid | Gagal validasi DTO, termasuk properti yang tidak diizinkan |

## Urutan pengecekan sebuah request

1. Ukuran body dan parsing JSON (`PAYLOAD_TOO_LARGE`, `INVALID_JSON`)
2. Autentikasi token (`UNAUTHORIZED`, `TOKEN_EXPIRED`, `INVALID_TOKEN`)
3. Role (`FORBIDDEN`)
4. Validasi DTO (`VALIDATION_ERROR`)
5. Aturan bisnis di service (`NOT_FOUND`, `FORBIDDEN` untuk kepemilikan, `CONFLICT`)
6. Database (`CONFLICT` dari unique dan foreign key)
7. Selain itu → `INTERNAL_ERROR`