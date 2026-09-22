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