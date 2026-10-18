# Konvensi API SiTrack

1. URL
    - Kata benda jamak, huruf kecil, kebab-case, tanpa trailing slash
    - Prefix versi: /api/v1
    - Endpoint milik user yang login: /me, /me/jurnal

2. Method & status code
    - GET 200 | POST 201 + Location | PATCH 200 | DELETE 204
    - 400 hanya untuk body yang tidak bisa di-parse sama sekali (INVALID_JSON) | 401 belum login | 403 tidak berhak | 404 tidak ada
    - 409 konflik data | 422 SEMUA kegagalan validasi DTO (body, query, maupun params) | 429 terlalu banyak request | 500 bug server

3. Format response sukses
   { sukses: true, pesan, data, meta? }

4. Format response error
   { sukses: false, error: { kode, pesan, detail? }, requestId }

5. Daftar (list)
    - page, limit (maks 100), sortBy (whitelist), order, q
    - meta: page, limit, total, totalPages, hasNext, hasPrev

6. Keamanan
    - Password tidak pernah dikirim dan tidak pernah dicatat di log
    - Field yang boleh diubah dipilih eksplisit (tanpa mass assignment)
    - Error DB dan stack trace tidak dikirim ke client di production

7. Penamaan
    - Bahasa Indonesia untuk field dan pesan
    - camelCase untuk nama field JSON

8. Validasi (422)
   - Semua input (body, query, params) divalidasi lewat DTO sebelum masuk controller.
   - Kegagalan validasi → HTTP 422, code VALIDATION_ERROR, detail per field di `details`.

9. Whitelist
   - Properti yang tidak dideklarasikan di DTO ditolak (422), bukan dibuang diam-diam.
   - Contoh: `{"role":"mentor"}` pada register → 422.

10. Response DTO
   - Response peserta dan jurnal wajib lewat PesertaResponseDto / JurnalResponseDto.
  - Hanya field yang diberi @Expose() yang keluar. Password tidak pernah dikirim.