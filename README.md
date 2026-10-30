# Dokumentasi API

Base URL untuk semua endpoint di bawah ini adalah: `http://localhost:3000`

Beberapa endpoint bersifat *protected* dan membutuhkan *header* otentikasi:
- `x-api-key: <API_KEY_ANDA>` (Contoh: `x-api-key: rahasia123`)

---

##  RESOURCE 1 — Peserta

### Daftar Endpoint

| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| **GET** | `/api/v1/peserta` | Mengambil semua peserta (Mendukung query: `sekolah`, `fase`, `limit`) |
| **GET** | `/api/v1/peserta/:id` | Mengambil detail peserta berdasarkan ID (404 jika tidak ditemukan) |
| **POST** | `/api/v1/peserta` | Menambahkan peserta baru (Status 201) |
| **PUT** | `/api/v1/peserta/:id` | Mengupdate data peserta berdasarkan ID |
| **DELETE**| `/api/v1/peserta/:id` | Menghapus peserta (Wajib header `x-api-key`) |
| **GET** | `/api/v1/peserta/:id/jurnal`| Mengambil daftar jurnal milik peserta tertentu |

### Contoh Request

**1. GET Semua Peserta (dengan Filter)**
```bash
curl -X GET "http://localhost:3000/api/v1/peserta?sekolah=SMK%20Telkom&fase=2&limit=5"
```

**2. POST Tambah Peserta Baru**
```bash
curl -X POST http://localhost:3000/api/v1/peserta \
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
curl -X PUT http://localhost:3000/api/v1/peserta/1 \
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
curl -X DELETE http://localhost:3000/api/v1/peserta/1 \
-H "x-api-key: rahasia123"
```

---

## RESOURCE 2 — Jurnal

### Daftar Endpoint

| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| **GET** | `/api/v1/jurnal` | Mengambil semua jurnal (Mendukung query: `peserta`, `status`, `limit`) |
| **GET** | `/api/v1/jurnal/:id` | Mengambil detail jurnal berdasarkan ID |
| **POST** | `/api/v1/jurnal` | Menambahkan jurnal baru (Status 201) |
| **PUT** | `/api/v1/jurnal/:id` | Mengupdate data jurnal secara keseluruhan |
| **PATCH**| `/api/v1/jurnal/:id/review`| Mengubah status review jurnal saja |
| **DELETE**| `/api/v1/jurnal/:id` | Menghapus jurnal (Wajib header `x-api-key`) |

### Contoh Request

**1. GET Semua Jurnal (dengan Filter)**
```bash
curl -X GET "http://localhost:3000/api/v1/jurnal?peserta=1&status=selesai&limit=10"
```

**2. POST Tambah Jurnal Baru**
```bash
curl -X POST http://localhost:3000/api/v1/jurnal \
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
curl -X PUT http://localhost:3000/api/v1/jurnal/1 \
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
curl -X PATCH http://localhost:3000/api/v1/jurnal/1/review \
-H "Content-Type: application/json" \
-d '{
  "review": "sudah"
}'
```

**5. DELETE Hapus Jurnal**
```bash
curl -X DELETE http://localhost:3000/api/v1/jurnal/1 \
-H "x-api-key: rahasia123"
```

---

## RESOURCE 3 — Statistik

### Daftar Endpoint

| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| **GET** | `/api/v1/stats` | Mengambil data total peserta, total jurnal, total jurnal yang belum direview, dan rata-rata jurnal per peserta. |

### Contoh Request

**1. GET Statistik Total**
```bash
curl -X GET http://localhost:3000/api/v1/stats
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
   curl -i http://localhost:3000/api/v1/test/crash \
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
  "url": "/api/v1/test/crash",
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
  "url": "/api/v1/test/crash",
  "status": 500,
  "durasiMs": 30
}
```

6. Hapus endpoint `/test/crash` setelah selesai.

---

## Jawaban Soal 5
Apa beda Entity dan DTO? Kenapa Entity Peserta tidak boleh dipakai langsung
sebagai bentuk body register?

**Jawaban:**

Entity itu cerminan tabel di database, jadi isinya lengkap: id, password hash, role, timestamp, dan sebagainya. DTO itu bentuk data yang sengaja dibatasi hanya untuk satu keperluan, misalnya register cuma butuh nama, email, dan password.

Kalau Entity dipakai langsung sebagai body register, orang bisa menyelipkan field yang tidak seharusnya mereka isi, seperti role: "mentor" atau id sendiri, dan itu bisa lolos tanpa sengaja (namanya mass assignment). Selain itu, validasinya jadi campur aduk dan setiap perubahan di tabel ikut mengubah kontrak API.

---

## Test jest apakah berfungsi atau tidak (response.test.ts)

### Sebelum kode dirusak:

```ts
export function dibuat<T>(res: Response, data: T, pesan: string = "Data berhasil dibuat"): void {
   const dataBersih = tanpaPassword(data);
   res.status(201).json({ sukses: true, pesan, dataBersih });
}

export function diubah<T>(res: Response, data: T, pesan: string = "Data berhasil diedit"): void {
   const dataBersih = tanpaPassword(data);
   res.status(200).json({ sukses: true, pesan, dataBersih });
}
```

### Hasil Test:

```bash
 PASS  tests/unit/utils/response.test.ts (9.32 s)
 
Test Suites: 4 passed, 4 total
Tests:       36 passed, 36 total
Snapshots:   0 total
Time:        11.679 s
Ran all test suites.
```

### Sesudah kode dirusak:

```ts
export function dibuat<T>(res: Response, data: T, pesan: string = "Data berhasil dibuat"): void {
   const dataBersih = tanpaPassword(data);
   res.status(/*201*/195).json({ sukses: true, pesan, dataBersih });
}

export function diubah<T>(res: Response, data: T, pesan: string = "Data berhasil diedit"): void {
   const dataBersih = tanpaPassword(data);
   res.status(/*200*/195).json({ sukses: true, pesan, dataBersih });
}
```

### Hasil Test:

```bash
 FAIL  tests/unit/utils/response.test.ts (10.408 s)

 RUNS  tests/unit/utils/response.test.ts
  ● response.dibuat › mengirim status 201

    expect(jest.fn()).toHaveBeenCalledWith(...expected)

    Expected: 201
    Received: 195

    Number of calls: 1

      19 |         fn(res, { id: 1, nama: "Budi" });
      20 |
    > 21 |         expect(res.status).toHaveBeenCalledWith(statusHarapan);
         |                            ^
      22 |     });
      23 |
      24 |     it("mengirim body { sukses: true, pesan, data } dengan pesan default", () => {

      at Object.<anonymous> (tests/unit/utils/response.test.ts:21:28)

  ● response.diubah › mengirim status 200

    expect(jest.fn()).toHaveBeenCalledWith(...expected)

    Expected: 200
    Received: 195

    Number of calls: 1

      19 |         fn(res, { id: 1, nama: "Budi" });
      20 |
    > 21 |         expect(res.status).toHaveBeenCalledWith(statusHarapan);
         |                            ^
      22 |     });
      23 |
      24 |     it("mengirim body { sukses: true, pesan, data } dengan pesan default", () => {

      at Object.<anonymous> (tests/unit/utils/response.test.ts:21:28)


RUNS  tests/unit/utils/response.test.ts
Test Suites: 1 failed, 3 passed, 4 total
Tests:       2 failed, 34 passed, 36 total
Snapshots:   0 total
Time:        11.859 s, estimated 14 s
Ran all test suites.
```

## Test untuk async (Benar) dan tanpa async (Salah)

| Kondisi getTotalJurnal                              | Test<br/>SALAH | Test<br/>BENAR |
|-----------------------------------------------------|----------------|----------------|
| Normal (error diteruskan)                           | lulus          | lulus          |
| Dirusak (try/catch yang menelan error dan return 0) | tetap lulus    | gagal          |
| Kembali seperti semula                              | lulus          | lulus          |

## Refleksi: menguji "apa yang terjadi" vs "bagaimana caranya"

Menguji "apa yang terjadi" berarti memeriksa hasil yang bisa diamati dari luar: nilai kembalian, error yang dilempar, dan data yang akhirnya disimpan. Menguji "bagaimana caranya" berarti mengunci langkah internal seperti jumlah pemanggilan, urutan, atau method mana yang dipakai, sehingga test patah saat kode di-refactor padahal perilakunya masih benar. Test jenis pertama tahan terhadap refactor dan berfungsi sebagai dokumentasi perilaku, sedangkan jenis kedua membuat kita takut mengubah kode. Mock tetap berguna di batas sistem seperti database dan JWT, tetapi yang diperiksa sebaiknya isi data yang keluar ke batas itu, bukan jalur yang ditempuh service untuk sampai ke sana.

### Contoh test yang terlalu terikat pada implementasi

```ts
it("register memanggil repo dengan benar", async () => {
    pesertaRepo.findByEmail.mockResolvedValue(null);
    mockHashPassword.mockResolvedValue("HASH");
    pesertaRepo.save.mockResolvedValue({ id: 1 });

    await service.register(inputRegister);

    expect(pesertaRepo.findByEmail).toHaveBeenCalledTimes(1);
    expect(mockHashPassword).toHaveBeenCalledTimes(1);
    expect(pesertaRepo.save).toHaveBeenCalledTimes(1);
    expect(pesertaRepo.save).toHaveBeenCalledWith({
        nama: "Budi",
        sekolah: "SMKN 1 Contoh",
        email: "budi@mail.com",
        password: "HASH",
        fase: 1,
        role: "peserta",
        skills: [],
    });
});
```

Test ini patah jika pengecekan email diganti method lain, jika `skills: []` dihapus, atau jika `hashPassword` dipanggil dua kali, padahal hasil register bagi pengguna tidak berubah.

### Ditulis ulang

```ts
it("register menyimpan hash dan tidak membocorkan password", async () => {
    pesertaRepo.findByEmail.mockResolvedValue(null);
    mockHashPassword.mockResolvedValue("HASH");
    pesertaRepo.save.mockImplementation(async (data: object) => ({ id: 1, ...data }));

    const hasil = await service.register(inputRegister);

    expect(pesertaRepo.save.mock.calls[0][0].password).toBe("HASH");
    expect(hasil).not.toHaveProperty("password");
});
```

# Panduan Menjalankan Automated Testing

Dokumen ini berisi panduan lengkap mengenai cara menyiapkan lingkungan pengujian (database test) serta menjalankan berbagai jenis automated testing pada proyek ini.

---

## 1. Persiapan Database Test

Sebelum menjalankan unit test atau integration test yang berinteraksi dengan database, pastikan database khusus pengujian (*test database*) sudah disiapkan agar tidak mengganggu data di lingkungan *development* atau *production*.

### Langkah-Langkah Menyiapkan Database Test:

1. **Buat Database Baru Khusus Test**
   Buat database baru di DBMS kamu (misalnya PostgreSQL / MySQL / MongoDB):
   ```sql
   CREATE DATABASE magang_test;
   ```

2. **Atur Environment Variables (`.env.test`)**
   Buat file `.env.test` di akar direktori proyek dan isi koneksi database yang mengarah ke database test:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=magang_test
   DB_USER=dbuser
   DB_PASSWORD=dbpassword
   JWT_SECRET=secret-code
   JWT_REFRESH_SECRET=secret-code
   ```

3. **Jalankan Migrasi & Schema=**
   ```bash
     npm run migrate
     ```

---

## 2. Perintah-Perintah Menjalankan Test

Proyek ini menyediakan beberapa *script* bawaan di `package.json` untuk menjalankan test sesuai kebutuhan.

### 2.1. Jalankan Seluruh Test (Unit Test / Default)
Menjalankan seluruh rangkaian pengujian standar atau unit test.

```bash
npm test
```

---

### 2.2. Jalankan Integration Test
Menjalankan pengujian integrasi yang menguji alur kerja antar modul (termasuk interaksi langsung dengan database test dan endpoint API).

```bash
npm run test:int
```

> **Catatan:** Pastikan server/container database test sudah dalam keadaan aktif sebelum menjalankan perintah ini.

---

### 2.3. Jalankan Test dengan Coverage (Laporan Cakupan Kode)
Menjalankan seluruh test sekaligus menghitung persentase baris kode, fungsi, dan cabang (*branches*) yang sudah tersentuh oleh test.

```bash
npm run test:coverage
```

Setelah perintah selesai dijalankan, kamu bisa melihat ringkasan coverage di terminal atau membuka laporan HTML mendalam di folder `coverage/`:
* Buka file `coverage/lcov-report/index.html` pada browser untuk melihat visualisasi cakupan kode per file secara detail.

---

## Ringkasan Perintah Quick-Reference

| Perintah | Deskripsi |
| :--- | :--- |
| `npm test` | Menjalankan seluruh unit test standar |
| `npm run test:int` | Menjalankan pengujian integrasi (API & DB) |
| `npm run test:coverage` | Menjalankan test dan membuat laporan cakupan kode (*code coverage*) |

---

## Apa beda OpenAPI dan Swagger?
OpenAPI adalah spesifikasi, yaitu standar format untuk mendeskripsikan REST API, sedangkan Swagger adalah kumpulan tool (Swagger UI, Editor, Codegen) yang membaca dan memakai spesifikasi tersebut. Dulu spesifikasinya sendiri bernama Swagger, lalu diganti menjadi OpenAPI sejak versi 3.

## Kenapa dokumen API perlu dibuat bahkan kalau kamu sendiri yang menulis seluruh kodenya?
Dokumen API tetap perlu dibuat walau kita menulis semua kodenya, karena kode tidak menjelaskan cara pemakaian, format request/response, dan kemungkinan error dengan jelas bagi orang lain. Dokumen ini membantu tim frontend, mentor, atau developer baru memakai API tanpa membaca source code, dan bisa langsung dicoba lewat Try it out. Bahkan kita sendiri bisa lupa detail endpoint beberapa bulan kemudian.