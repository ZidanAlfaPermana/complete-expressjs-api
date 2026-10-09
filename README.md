# Dokumentasi API

Base URL untuk semua endpoint di bawah ini adalah: `http://localhost:3000`

Beberapa endpoint bersifat *protected* dan membutuhkan *header* otentikasi:
- `x-api-key: <API_KEY_ANDA>` (Contoh: `x-api-key: rahasia123`)

---

##  RESOURCE 1 — Peserta

### Daftar Endpoint

| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| **GET** | `/api/peserta` | Mengambil semua peserta (Mendukung query: `sekolah`, `fase`, `limit`) |
| **GET** | `/api/peserta/:id` | Mengambil detail peserta berdasarkan ID (404 jika tidak ditemukan) |
| **POST** | `/api/peserta` | Menambahkan peserta baru (Status 201) |
| **PUT** | `/api/peserta/:id` | Mengupdate data peserta berdasarkan ID |
| **DELETE**| `/api/peserta/:id` | Menghapus peserta (Wajib header `x-api-key`) |
| **GET** | `/api/peserta/:id/jurnal`| Mengambil daftar jurnal milik peserta tertentu |

### Contoh Request

**1. GET Semua Peserta (dengan Filter)**
```bash
curl -X GET "http://localhost:3000/api/peserta?sekolah=SMK%20Telkom&fase=2&limit=5"
```

**2. POST Tambah Peserta Baru**
```bash
curl -X POST http://localhost:3000/api/peserta \
-H "Content-Type: application/json" \
-d '{
  "nama": "Zidan Alfa",
  "kelas": "XII RPL 1",
  "jurusan": "RPL",
  "sekolah": "SMK Telkom",
  "fase": 3
}'
```

**3. PUT Update Peserta**
```bash
curl -X PUT http://localhost:3000/api/peserta/1 \
-H "Content-Type: application/json" \
-d '{
  "nama": "Zidan Alfa Permana",
  "kelas": "XII RPL 1",
  "jurusan": "RPL",
  "sekolah": "SMK Telkom",
  "fase": 4
}'
```

**4. DELETE Hapus Peserta**
```bash
curl -X DELETE http://localhost:3000/api/peserta/1 \
-H "x-api-key: rahasia123"
```

---

## RESOURCE 2 — Jurnal

### Daftar Endpoint

| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| **GET** | `/api/jurnal` | Mengambil semua jurnal (Mendukung query: `peserta`, `status`, `limit`) |
| **GET** | `/api/jurnal/:id` | Mengambil detail jurnal berdasarkan ID |
| **POST** | `/api/jurnal` | Menambahkan jurnal baru (Status 201) |
| **PUT** | `/api/jurnal/:id` | Mengupdate data jurnal secara keseluruhan |
| **PATCH**| `/api/jurnal/:id/review`| Mengubah status review jurnal saja |
| **DELETE**| `/api/jurnal/:id` | Menghapus jurnal (Wajib header `x-api-key`) |

### Contoh Request

**1. GET Semua Jurnal (dengan Filter)**
```bash
curl -X GET "http://localhost:3000/api/jurnal?peserta=1&status=selesai&limit=10"
```

**2. POST Tambah Jurnal Baru**
```bash
curl -X POST http://localhost:3000/api/jurnal \
-H "Content-Type: application/json" \
-d '{
  "idPeserta": 1,
  "status": "proses",
  "kegiatan": "Mengerjakan Endpoint API",
  "hambatan": "Laptop lemot",
  "rencanaBesok": "Testing API",
  "linkCommit": "[https://github.com/ZidanAlfaPermana](https://github.com/ZidanAlfaPermana)",
  "review": "belum"
}'
```

**3. PUT Update Jurnal (Keseluruhan Data)**
```bash
curl -X PUT http://localhost:3000/api/jurnal/1 \
-H "Content-Type: application/json" \
-d '{
  "idPeserta": 1,
  "status": "selesai",
  "kegiatan": "Endpoint API selesai dikerjakan",
  "hambatan": "Tidak ada",
  "rencanaBesok": "Integrasi Frontend",
  "linkCommit": "[https://github.com/ZidanAlfaPermana](https://github.com/ZidanAlfaPermana)",
  "review": "sudah"
}'
```

**4. PATCH Update Status Review Jurnal**
```bash
curl -X PATCH http://localhost:3000/api/jurnal/1/review \
-H "Content-Type: application/json" \
-d '{
  "review": "sudah"
}'
```

**5. DELETE Hapus Jurnal**
```bash
curl -X DELETE http://localhost:3000/api/jurnal/1 \
-H "x-api-key: rahasia123"
```

---

## RESOURCE 3 — Statistik

### Daftar Endpoint

| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| **GET** | `/api/stats` | Mengambil data total peserta, total jurnal, total jurnal yang belum direview, dan rata-rata jurnal per peserta. |

### Contoh Request

**1. GET Statistik Total**
```bash
curl -X GET http://localhost:3000/api/stats
```

**Contoh Response:**
```json
{
  "data": {
    "total_peserta": "5",
    "total_jurnal": "12",
    "total_belum_direview": "3",
    "rata_rata_jurnal_persiswa": "2.40"
  }
}
```

---

## Apa itu ORM? dan kenapa tidak menulis SQL manual?

**ORM (Object-Relational Mapping)** adalah "penerjemah" yang menjembatani database PostgreSQL (bahasa SQL) dengan aplikasi Node.js/TypeScript (bahasa Object).

## Kenapa Pakai ORM (Bukan SQL Manual)?

1. **Lebih Cepat & Bersih:** Nulis operasi CRUD cukup pakai fungsi bawaan (misal: `jurnal.findMany()`), tidak perlu merangkai string SQL yang panjang.
2. **Keamanan Ekstra (Anti SQL Injection):** Input dari *user* otomatis dibersihkan (*sanitize*) sebelum masuk ke database.
3. **Type Safety & Auto-Complete:** Karena dibaca sebagai Object, editor (VS Code) akan memberikan *auto-complete* nama kolom tabel dan mendeteksi tipe data yang salah sebelum program dijalankan.
4. **Kemudahan Migrasi:** Mengubah struktur tabel (nambah/hapus kolom) bisa dilakukan langsung dari kode tanpa perlu pusing merangkai perintah `ALTER TABLE`.

---

## Cara setup Project dan Database dari nol sampai running

1. buka PgAdmin4, jika blm ada postgres admin/database nya bisa di dowload di: https://www.pgadmin.org/download/ dan pilih versi yang terbaru
2. buat database dengan nama `magang_db`
3. lalu clone project ini: 
```bash
git clone https://github.com/ZidanAlfaPermana/complete-expressjs-api.git
```
4. jalankan cmd ini untuk menginstall package yang diperlukan di project ini:
```bash
npm install
```
5. lalu jalankan cmd ini untuk migrasi database:
```bash
npm run migration:run
```
6. jika sudah menjalankan migrasi lalu jalankan project API ini:
```bash
npm run dev 
```

# Kenapa DELETE Harus Idempotent?

Idempotent artinya dikirim sekali atau sepuluh kali, hasil akhirnya di server sama. `DELETE /peserta/1` yang pertama membalas 204, berikutnya 404, tapi datanya tetap sama: peserta 1 hilang. Status code boleh beda, efeknya tidak.

Ini penting karena jaringan tidak bisa dipercaya. Kalau sinyal putus dan client tidak tahu requestnya sampai atau tidak, client aman mengirim ulang. Itu juga sebabnya DELETE harus menunjuk resource spesifik (`/peserta/1`), bukan "peserta terakhir", karena kalau di-retry bisa menghapus dua orang.
 
---

# Kenapa Tidak Boleh Menghapus Lewat GET?

GET berjanji hanya membaca, dan banyak hal otomatis bergantung pada janji itu: crawler, preview link di WhatsApp, prefetch browser, dan retry otomatis. Link seperti `/peserta/1/hapus` bisa terpicu sendiri oleh semuanya. Selain itu, `<img src="https://situsmu/peserta/1/hapus">` di halaman mana pun sudah cukup untuk serangan CSRF. Pakai DELETE untuk menghapus.

---

# log error dari errorHandler testing

1. Buat endpoint test sementara yang melempar error biasa:

```ts
   router.get("/test/crash", () => {
     throw new Error("Crash buatan untuk uji log");
   });
```

2. Jalankan server dan panggil endpoint dengan token yang valid:

```bash
   curl -i http://localhost:3000/api/test/crash \
     -H "Authorization: Bearer <token>"
```

3. Dari response, catat status (500) dan nilai header `X-Request-Id`, contoh:
   `X-Request-Id: 0a7f268b-04c0-4be9-b47a-d8aebe6e2a35`

4. Cari baris log dengan ID itu di terminal tempat server berjalan (Ctrl+F), atau jika log disimpan ke file:

```powershell
   Select-String -Path server.log -Pattern "0a7f268b-04c0-4be9-b47a-d8aebe6e2a35"
```

5. Pastikan baris log level `error` memuat field berikut:

```json
{
  "waktu": "2026-10-09T15:49:13.628Z",
  "level": "error",
  "pesan": "Terjadi kesalahan di server",
  "requestId": "be040351-4f26-4c78-bfe0-d5b083f88006",
  "method": "GET",
  "url": "/api/test/crash",
  "status": 500,
  "kode": "INTERNAL_ERROR",
  "userId": 65,
  "stack": "Error: Crash buatan untuk uji log\n    at D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\src\\routes\\health.routes.ts:23:11\n    at Layer.handleRequest (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\lib\\layer.js:152:17)\n    at next (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\lib\\route.js:157:13)\n    at D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\src\\middlewares\\role.middleware.ts:16:9\n    at Layer.handleRequest (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\lib\\layer.js:152:17)\n    at next (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\lib\\route.js:157:13)\n    at authGuard (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\src\\middlewares\\auth.middleware.ts:25:9)\n    at Layer.handleRequest (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\lib\\layer.js:152:17)\n    at next (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\lib\\route.js:157:13)\n    at Route.dispatch (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\lib\\route.js:117:3)"
}
```

```json
{
  "waktu": "2026-10-09T15:53:35.456Z",
  "level": "info",
  "pesan": "request selesai",
  "requestId": "1e89694b-0909-4e35-ae54-3b68bafeb269",
  "method": "GET",
  "url": "/api/test/crash",
  "status": 500,
  "durasiMs": 30
}
```

6. Hapus endpoint `/test/crash` setelah selesai.
