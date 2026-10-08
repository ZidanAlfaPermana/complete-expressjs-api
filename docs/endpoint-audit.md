# Endpoint Audit

## Router Jurnal

| Method | Path | Perlu login? | Role | Masalah desain (jika ada) |
|--------|------|--------------|------|---------------------------|
| GET | `/jurnal/saya` | Ya | mentor, peserta | "saya" tetap kata ganti; samakan dengan `/peserta/saya` (atau ganti keduanya jadi `/me`) |
| GET | `/jurnal` | Ya | mentor | - |
| GET | `/jurnal/peserta` | Ya | mentor | Ambigu dengan `/peserta/:id/jurnal`; lebih bersih jadi `GET /jurnal?include=peserta` |
| GET | `/jurnal/:id` | Ya | semua role | Belum ada cek kepemilikan; peserta lain masih bisa membaca jurnal orang lain |
| POST | `/jurnal` | Ya | mentor, peserta | - |
| PUT | `/jurnal/:id` | Ya | semua role | Belum ada cek kepemilikan/role; wajib dicek di controller atau middleware |
| PATCH | `/jurnal/:id/review` | Ya | mentor | - (duplikat middleware sudah dihapus) |
| DELETE | `/jurnal/:id` | Ya | semua role | Belum ada cek kepemilikan/role; wajib dicek di controller atau middleware |

## Router Peserta

| Method | Path | Perlu login? | Role | Masalah desain (jika ada) |
|--------|------|--------------|------|---------------------------|
| GET | `/peserta/saya` | Ya | semua role | Samakan pola dengan `/jurnal/saya` |
| GET | `/peserta` | Ya | mentor | - |
| GET | `/peserta/:id` | Ya | pemilik atau mentor | Bergantung pada `requireOwnerOrMentor` yang belum ada di kode |
| GET | `/peserta/:id/jurnal` | Ya | pemilik atau mentor | Bergantung pada `requireOwnerOrMentor` yang belum ada di kode |
| POST | `/peserta` | Ya | mentor | - |
| PUT | `/peserta/:id` | Ya | pemilik atau mentor | Bergantung pada `requireOwnerOrMentor` yang belum ada di kode |
| DELETE | `/peserta/:id` | Ya | mentor | - |

## Penjelasan tiap skenario

**a. 201, bukan 200.** Keduanya "sukses", tapi 201 memberi tahu client bahwa sesuatu yang baru dibuat. Kembalikan data user yang baru (tanpa password, tentu saja). Kalau mau rapi, tambahkan header `Location: /peserta/12`.

**b. 409, bukan 400.** Format emailnya benar dan request-nya masuk akal. Yang bermasalah adalah emailnya sudah dipakai orang lain. Itu konflik dengan kondisi data saat ini, bukan kesalahan format. Sebagian tim memakai 422 untuk ini, dan itu tidak salah, asal konsisten.

**c. 401, dengan pesan yang sengaja kabur.** Pakai pesan seperti "Email atau password salah", jangan "Password salah". Kalau pesannya spesifik, orang jahat bisa menebak email mana yang terdaftar. Kasus email tidak ditemukan juga sebaiknya 401 dengan pesan yang sama, bukan 404.

**d. 401.** Walau namanya "Unauthorized", artinya sebenarnya "belum terautentikasi". Penamaan HTTP-nya memang agak membingungkan.

**e. 403, bukan 401.** Ini perbedaan yang paling sering tertukar:
- 401 = "Kamu siapa? Tunjukkan identitasmu dulu."
- 403 = "Aku tahu kamu siapa, tapi kamu tidak boleh melakukan ini."
  Peserta sudah login dengan token valid, jadi 401 salah. Mengirim ulang token yang sama pun tidak akan mengubah hasilnya.

**f. 404.** Standar. Satu catatan: kalau peserta A mengakses `/peserta/9` milik peserta B dan kamu mau menyembunyikan keberadaan datanya, beberapa API sengaja mengembalikan 404 alih-alih 403. Itu pilihan desain, bukan kewajiban.

**g. 204.** Tidak ada body. Kalau client kamu lebih nyaman menerima JSON, boleh juga 200 dengan pesan singkat, tapi 204 adalah pilihan yang paling umum.

**h. 400.** Kalau memakai `express.json()`, body rusak melempar `SyntaxError`. Tanpa error handler khusus, Express akan membalas dengan HTML berisi stack trace, bukan JSON. Tangkap error ini di error middleware dan balas 400 dengan pesan seperti "Format JSON tidak valid".

**i. 422, bukan 400.** Bedanya dengan (h): di sini server berhasil membaca JSON-nya, hanya isinya yang tidak masuk akal. Banyak API memakai 400 untuk keduanya, dan itu masih bisa diterima. Yang penting seluruh endpoint memakai pola yang sama. Sertakan detail per field di body, misalnya `{ "errors": { "email": "Format email tidak valid" } }`.

**j. 503, bukan 500.** 500 untuk bug tak terduga di kode kita. 503 artinya "layanan sedang tidak bisa dipakai, coba lagi nanti", dan cocok untuk database mati atau koneksi putus. Client dan load balancer bisa memperlakukannya sebagai kondisi sementara. Jangan bocorkan pesan error database mentah ke response.

---

## Test Keamanan API (hasil jika terdapat parameter yang salah atau tidak sesuai)

1. `http://localhost:3000/api/peserta?page=0`

```json
{
    "sukses": true,
    "pesan": "Berhasil",
    "data": [
        {
            "id": 14,
            "nama": "Feri",
            "sekolah": "SMKN 1 Malang",
            "email": "feri2@gmail.com",
            "fase": 2,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-08T12:15:04.092Z",
            "updatedAt": "2026-10-08T12:15:04.092Z"
        },
        {
            "id": 13,
            "nama": "Feri F",
            "sekolah": "SMKN 1 Malang",
            "email": "feri1@gmail.com",
            "fase": 2,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-08T12:14:52.570Z",
            "updatedAt": "2026-10-08T12:14:52.570Z"
        },
        {
            "id": 12,
            "nama": "Zidan A.P",
            "sekolah": "SMKN 1 Malang",
            "email": "zidan2@gmail.com",
            "fase": 2,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-08T12:10:43.696Z",
            "updatedAt": "2026-10-08T12:10:43.696Z"
        },
        {
            "id": 10,
            "nama": "Zidan",
            "sekolah": "SMKN 1 Malang",
            "email": "zidan1@gmail.com",
            "fase": 2,
            "status": "aktif",
            "role": "mentor",
            "createdAt": "2026-10-08T12:10:18.122Z",
            "updatedAt": "2026-10-08T12:10:18.122Z"
        },
        {
            "id": 9,
            "nama": "Zidan Alfa P",
            "sekolah": "SMKN 5",
            "email": "zidan21@gmail.com",
            "fase": 1,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-04T06:59:50.005Z",
            "updatedAt": "2026-10-04T06:59:50.005Z"
        },
        {
            "id": 8,
            "nama": "Zidan Gini nih",
            "sekolah": "SMKN 1 Malang",
            "email": "zidan20@gmail.com",
            "fase": 2,
            "status": "aktif",
            "role": "mentor",
            "createdAt": "2026-10-01T03:16:32.605Z",
            "updatedAt": "2026-10-01T03:16:32.605Z"
        },
        {
            "id": 6,
            "nama": "Zidan Alfa",
            "sekolah": "SMKN 5",
            "email": "zidan18@gmail.com",
            "fase": 1,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-09-30T04:21:29.949Z",
            "updatedAt": "2026-09-30T04:21:29.949Z"
        },
        {
            "id": 5,
            "nama": "Zidan",
            "sekolah": "SMK",
            "email": "zidan54@gmail.com",
            "fase": 1,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-09-30T02:52:16.335Z",
            "updatedAt": "2026-09-30T02:52:16.335Z"
        },
        {
            "id": 4,
            "nama": "Agus Pratama",
            "sekolah": "SMKN 1 Singosari",
            "email": "agus.pratama@outlook.com",
            "fase": 3,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-09-29T07:27:22.553Z",
            "updatedAt": "2026-09-29T07:27:22.553Z"
        },
        {
            "id": 3,
            "nama": "Siti Aminah",
            "sekolah": "SMKN 8 Malang",
            "email": "siti.am@yahoo.com",
            "fase": 1,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-09-29T07:26:43.629Z",
            "updatedAt": "2026-09-29T07:26:43.629Z"
        }
    ],
    "meta": {
        "page": 1,
        "limit": 10,
        "total": 11,
        "totalPages": 2,
        "hasNext": true,
        "hasPrev": false
    }
}
```

2. `http://localhost:3000/api/peserta?page=-5`

```json
{
    "sukses": true,
    "pesan": "Berhasil",
    "data": [
        {
            "id": 14,
            "nama": "Feri",
            "sekolah": "SMKN 1 Malang",
            "email": "feri2@gmail.com",
            "fase": 2,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-08T12:15:04.092Z",
            "updatedAt": "2026-10-08T12:15:04.092Z"
        },
        {
            "id": 13,
            "nama": "Feri F",
            "sekolah": "SMKN 1 Malang",
            "email": "feri1@gmail.com",
            "fase": 2,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-08T12:14:52.570Z",
            "updatedAt": "2026-10-08T12:14:52.570Z"
        },
        {
            "id": 12,
            "nama": "Zidan A.P",
            "sekolah": "SMKN 1 Malang",
            "email": "zidan2@gmail.com",
            "fase": 2,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-08T12:10:43.696Z",
            "updatedAt": "2026-10-08T12:10:43.696Z"
        },
        {
            "id": 10,
            "nama": "Zidan",
            "sekolah": "SMKN 1 Malang",
            "email": "zidan1@gmail.com",
            "fase": 2,
            "status": "aktif",
            "role": "mentor",
            "createdAt": "2026-10-08T12:10:18.122Z",
            "updatedAt": "2026-10-08T12:10:18.122Z"
        },
        {
            "id": 9,
            "nama": "Zidan Alfa P",
            "sekolah": "SMKN 5",
            "email": "zidan21@gmail.com",
            "fase": 1,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-04T06:59:50.005Z",
            "updatedAt": "2026-10-04T06:59:50.005Z"
        },
        {
            "id": 8,
            "nama": "Zidan Gini nih",
            "sekolah": "SMKN 1 Malang",
            "email": "zidan20@gmail.com",
            "fase": 2,
            "status": "aktif",
            "role": "mentor",
            "createdAt": "2026-10-01T03:16:32.605Z",
            "updatedAt": "2026-10-01T03:16:32.605Z"
        },
        {
            "id": 6,
            "nama": "Zidan Alfa",
            "sekolah": "SMKN 5",
            "email": "zidan18@gmail.com",
            "fase": 1,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-09-30T04:21:29.949Z",
            "updatedAt": "2026-09-30T04:21:29.949Z"
        },
        {
            "id": 5,
            "nama": "Zidan",
            "sekolah": "SMK",
            "email": "zidan54@gmail.com",
            "fase": 1,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-09-30T02:52:16.335Z",
            "updatedAt": "2026-09-30T02:52:16.335Z"
        },
        {
            "id": 4,
            "nama": "Agus Pratama",
            "sekolah": "SMKN 1 Singosari",
            "email": "agus.pratama@outlook.com",
            "fase": 3,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-09-29T07:27:22.553Z",
            "updatedAt": "2026-09-29T07:27:22.553Z"
        },
        {
            "id": 3,
            "nama": "Siti Aminah",
            "sekolah": "SMKN 8 Malang",
            "email": "siti.am@yahoo.com",
            "fase": 1,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-09-29T07:26:43.629Z",
            "updatedAt": "2026-09-29T07:26:43.629Z"
        }
    ],
    "meta": {
        "page": 1,
        "limit": 10,
        "total": 11,
        "totalPages": 2,
        "hasNext": true,
        "hasPrev": false
    }
}
```

3. `http://localhost:3000/api/peserta?page=abc`

```json
{
    "sukses": true,
    "pesan": "Berhasil",
    "data": [
        {
            "id": 14,
            "nama": "Feri",
            "sekolah": "SMKN 1 Malang",
            "email": "feri2@gmail.com",
            "fase": 2,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-08T12:15:04.092Z",
            "updatedAt": "2026-10-08T12:15:04.092Z"
        },
        {
            "id": 13,
            "nama": "Feri F",
            "sekolah": "SMKN 1 Malang",
            "email": "feri1@gmail.com",
            "fase": 2,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-08T12:14:52.570Z",
            "updatedAt": "2026-10-08T12:14:52.570Z"
        },
        {
            "id": 12,
            "nama": "Zidan A.P",
            "sekolah": "SMKN 1 Malang",
            "email": "zidan2@gmail.com",
            "fase": 2,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-08T12:10:43.696Z",
            "updatedAt": "2026-10-08T12:10:43.696Z"
        },
        {
            "id": 10,
            "nama": "Zidan",
            "sekolah": "SMKN 1 Malang",
            "email": "zidan1@gmail.com",
            "fase": 2,
            "status": "aktif",
            "role": "mentor",
            "createdAt": "2026-10-08T12:10:18.122Z",
            "updatedAt": "2026-10-08T12:10:18.122Z"
        },
        {
            "id": 9,
            "nama": "Zidan Alfa P",
            "sekolah": "SMKN 5",
            "email": "zidan21@gmail.com",
            "fase": 1,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-04T06:59:50.005Z",
            "updatedAt": "2026-10-04T06:59:50.005Z"
        },
        {
            "id": 8,
            "nama": "Zidan Gini nih",
            "sekolah": "SMKN 1 Malang",
            "email": "zidan20@gmail.com",
            "fase": 2,
            "status": "aktif",
            "role": "mentor",
            "createdAt": "2026-10-01T03:16:32.605Z",
            "updatedAt": "2026-10-01T03:16:32.605Z"
        },
        {
            "id": 6,
            "nama": "Zidan Alfa",
            "sekolah": "SMKN 5",
            "email": "zidan18@gmail.com",
            "fase": 1,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-09-30T04:21:29.949Z",
            "updatedAt": "2026-09-30T04:21:29.949Z"
        },
        {
            "id": 5,
            "nama": "Zidan",
            "sekolah": "SMK",
            "email": "zidan54@gmail.com",
            "fase": 1,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-09-30T02:52:16.335Z",
            "updatedAt": "2026-09-30T02:52:16.335Z"
        },
        {
            "id": 4,
            "nama": "Agus Pratama",
            "sekolah": "SMKN 1 Singosari",
            "email": "agus.pratama@outlook.com",
            "fase": 3,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-09-29T07:27:22.553Z",
            "updatedAt": "2026-09-29T07:27:22.553Z"
        },
        {
            "id": 3,
            "nama": "Siti Aminah",
            "sekolah": "SMKN 8 Malang",
            "email": "siti.am@yahoo.com",
            "fase": 1,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-09-29T07:26:43.629Z",
            "updatedAt": "2026-09-29T07:26:43.629Z"
        }
    ],
    "meta": {
        "page": 1,
        "limit": 10,
        "total": 11,
        "totalPages": 2,
        "hasNext": true,
        "hasPrev": false
    }
}
```

4. `http://localhost:3000/api/peserta?limit=1000`

```json
{
    "sukses": true,
    "pesan": "Berhasil",
    "data": [
        {
            "id": 14,
            "nama": "Feri",
            "sekolah": "SMKN 1 Malang",
            "email": "feri2@gmail.com",
            "fase": 2,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-08T12:15:04.092Z",
            "updatedAt": "2026-10-08T12:15:04.092Z"
        },
        {
            "id": 13,
            "nama": "Feri F",
            "sekolah": "SMKN 1 Malang",
            "email": "feri1@gmail.com",
            "fase": 2,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-08T12:14:52.570Z",
            "updatedAt": "2026-10-08T12:14:52.570Z"
        },
        {
            "id": 12,
            "nama": "Zidan A.P",
            "sekolah": "SMKN 1 Malang",
            "email": "zidan2@gmail.com",
            "fase": 2,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-08T12:10:43.696Z",
            "updatedAt": "2026-10-08T12:10:43.696Z"
        },
        {
            "id": 10,
            "nama": "Zidan",
            "sekolah": "SMKN 1 Malang",
            "email": "zidan1@gmail.com",
            "fase": 2,
            "status": "aktif",
            "role": "mentor",
            "createdAt": "2026-10-08T12:10:18.122Z",
            "updatedAt": "2026-10-08T12:10:18.122Z"
        },
        {
            "id": 9,
            "nama": "Zidan Alfa P",
            "sekolah": "SMKN 5",
            "email": "zidan21@gmail.com",
            "fase": 1,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-04T06:59:50.005Z",
            "updatedAt": "2026-10-04T06:59:50.005Z"
        },
        {
            "id": 8,
            "nama": "Zidan Gini nih",
            "sekolah": "SMKN 1 Malang",
            "email": "zidan20@gmail.com",
            "fase": 2,
            "status": "aktif",
            "role": "mentor",
            "createdAt": "2026-10-01T03:16:32.605Z",
            "updatedAt": "2026-10-01T03:16:32.605Z"
        },
        {
            "id": 6,
            "nama": "Zidan Alfa",
            "sekolah": "SMKN 5",
            "email": "zidan18@gmail.com",
            "fase": 1,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-09-30T04:21:29.949Z",
            "updatedAt": "2026-09-30T04:21:29.949Z"
        },
        {
            "id": 5,
            "nama": "Zidan",
            "sekolah": "SMK",
            "email": "zidan54@gmail.com",
            "fase": 1,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-09-30T02:52:16.335Z",
            "updatedAt": "2026-09-30T02:52:16.335Z"
        },
        {
            "id": 4,
            "nama": "Agus Pratama",
            "sekolah": "SMKN 1 Singosari",
            "email": "agus.pratama@outlook.com",
            "fase": 3,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-09-29T07:27:22.553Z",
            "updatedAt": "2026-09-29T07:27:22.553Z"
        },
        {
            "id": 3,
            "nama": "Siti Aminah",
            "sekolah": "SMKN 8 Malang",
            "email": "siti.am@yahoo.com",
            "fase": 1,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-09-29T07:26:43.629Z",
            "updatedAt": "2026-09-29T07:26:43.629Z"
        },
        {
            "id": 2,
            "nama": "Budi Santoso",
            "sekolah": "SMKN 4 Malang",
            "email": "budi.s@gmail.com",
            "fase": 2,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-09-29T07:26:07.575Z",
            "updatedAt": "2026-09-29T07:26:07.575Z"
        }
    ],
    "meta": {
        "page": 1,
        "limit": 100,
        "total": 11,
        "totalPages": 1,
        "hasNext": false,
        "hasPrev": false
    }
}
```

5. `http://localhost:3000/api/peserta?limit=0`

```json
{
    "sukses": true,
    "pesan": "Berhasil",
    "data": [
        {
            "id": 14,
            "nama": "Feri",
            "sekolah": "SMKN 1 Malang",
            "email": "feri2@gmail.com",
            "fase": 2,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-08T12:15:04.092Z",
            "updatedAt": "2026-10-08T12:15:04.092Z"
        },
        {
            "id": 13,
            "nama": "Feri F",
            "sekolah": "SMKN 1 Malang",
            "email": "feri1@gmail.com",
            "fase": 2,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-08T12:14:52.570Z",
            "updatedAt": "2026-10-08T12:14:52.570Z"
        },
        {
            "id": 12,
            "nama": "Zidan A.P",
            "sekolah": "SMKN 1 Malang",
            "email": "zidan2@gmail.com",
            "fase": 2,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-08T12:10:43.696Z",
            "updatedAt": "2026-10-08T12:10:43.696Z"
        },
        {
            "id": 10,
            "nama": "Zidan",
            "sekolah": "SMKN 1 Malang",
            "email": "zidan1@gmail.com",
            "fase": 2,
            "status": "aktif",
            "role": "mentor",
            "createdAt": "2026-10-08T12:10:18.122Z",
            "updatedAt": "2026-10-08T12:10:18.122Z"
        },
        {
            "id": 9,
            "nama": "Zidan Alfa P",
            "sekolah": "SMKN 5",
            "email": "zidan21@gmail.com",
            "fase": 1,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-04T06:59:50.005Z",
            "updatedAt": "2026-10-04T06:59:50.005Z"
        },
        {
            "id": 8,
            "nama": "Zidan Gini nih",
            "sekolah": "SMKN 1 Malang",
            "email": "zidan20@gmail.com",
            "fase": 2,
            "status": "aktif",
            "role": "mentor",
            "createdAt": "2026-10-01T03:16:32.605Z",
            "updatedAt": "2026-10-01T03:16:32.605Z"
        },
        {
            "id": 6,
            "nama": "Zidan Alfa",
            "sekolah": "SMKN 5",
            "email": "zidan18@gmail.com",
            "fase": 1,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-09-30T04:21:29.949Z",
            "updatedAt": "2026-09-30T04:21:29.949Z"
        },
        {
            "id": 5,
            "nama": "Zidan",
            "sekolah": "SMK",
            "email": "zidan54@gmail.com",
            "fase": 1,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-09-30T02:52:16.335Z",
            "updatedAt": "2026-09-30T02:52:16.335Z"
        },
        {
            "id": 4,
            "nama": "Agus Pratama",
            "sekolah": "SMKN 1 Singosari",
            "email": "agus.pratama@outlook.com",
            "fase": 3,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-09-29T07:27:22.553Z",
            "updatedAt": "2026-09-29T07:27:22.553Z"
        },
        {
            "id": 3,
            "nama": "Siti Aminah",
            "sekolah": "SMKN 8 Malang",
            "email": "siti.am@yahoo.com",
            "fase": 1,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-09-29T07:26:43.629Z",
            "updatedAt": "2026-09-29T07:26:43.629Z"
        }
    ],
    "meta": {
        "page": 1,
        "limit": 10,
        "total": 11,
        "totalPages": 2,
        "hasNext": true,
        "hasPrev": false
    }
}
```

6. `http://localhost:3000/api/peserta?limit=abc`

```json
{
    "sukses": true,
    "pesan": "Berhasil",
    "data": [
        {
            "id": 14,
            "nama": "Feri",
            "sekolah": "SMKN 1 Malang",
            "email": "feri2@gmail.com",
            "fase": 2,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-08T12:15:04.092Z",
            "updatedAt": "2026-10-08T12:15:04.092Z"
        },
        {
            "id": 13,
            "nama": "Feri F",
            "sekolah": "SMKN 1 Malang",
            "email": "feri1@gmail.com",
            "fase": 2,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-08T12:14:52.570Z",
            "updatedAt": "2026-10-08T12:14:52.570Z"
        },
        {
            "id": 12,
            "nama": "Zidan A.P",
            "sekolah": "SMKN 1 Malang",
            "email": "zidan2@gmail.com",
            "fase": 2,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-08T12:10:43.696Z",
            "updatedAt": "2026-10-08T12:10:43.696Z"
        },
        {
            "id": 10,
            "nama": "Zidan",
            "sekolah": "SMKN 1 Malang",
            "email": "zidan1@gmail.com",
            "fase": 2,
            "status": "aktif",
            "role": "mentor",
            "createdAt": "2026-10-08T12:10:18.122Z",
            "updatedAt": "2026-10-08T12:10:18.122Z"
        },
        {
            "id": 9,
            "nama": "Zidan Alfa P",
            "sekolah": "SMKN 5",
            "email": "zidan21@gmail.com",
            "fase": 1,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-04T06:59:50.005Z",
            "updatedAt": "2026-10-04T06:59:50.005Z"
        },
        {
            "id": 8,
            "nama": "Zidan Gini nih",
            "sekolah": "SMKN 1 Malang",
            "email": "zidan20@gmail.com",
            "fase": 2,
            "status": "aktif",
            "role": "mentor",
            "createdAt": "2026-10-01T03:16:32.605Z",
            "updatedAt": "2026-10-01T03:16:32.605Z"
        },
        {
            "id": 6,
            "nama": "Zidan Alfa",
            "sekolah": "SMKN 5",
            "email": "zidan18@gmail.com",
            "fase": 1,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-09-30T04:21:29.949Z",
            "updatedAt": "2026-09-30T04:21:29.949Z"
        },
        {
            "id": 5,
            "nama": "Zidan",
            "sekolah": "SMK",
            "email": "zidan54@gmail.com",
            "fase": 1,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-09-30T02:52:16.335Z",
            "updatedAt": "2026-09-30T02:52:16.335Z"
        },
        {
            "id": 4,
            "nama": "Agus Pratama",
            "sekolah": "SMKN 1 Singosari",
            "email": "agus.pratama@outlook.com",
            "fase": 3,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-09-29T07:27:22.553Z",
            "updatedAt": "2026-09-29T07:27:22.553Z"
        },
        {
            "id": 3,
            "nama": "Siti Aminah",
            "sekolah": "SMKN 8 Malang",
            "email": "siti.am@yahoo.com",
            "fase": 1,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-09-29T07:26:43.629Z",
            "updatedAt": "2026-09-29T07:26:43.629Z"
        }
    ],
    "meta": {
        "page": 1,
        "limit": 10,
        "total": 11,
        "totalPages": 2,
        "hasNext": true,
        "hasPrev": false
    }
}
```

7. `http://localhost:3000/api/peserta?sortBy=password`

```json
{
    "sukses": true,
    "pesan": "Berhasil",
    "data": [
        {
            "id": 14,
            "nama": "Feri",
            "sekolah": "SMKN 1 Malang",
            "email": "feri2@gmail.com",
            "fase": 2,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-08T12:15:04.092Z",
            "updatedAt": "2026-10-08T12:15:04.092Z"
        },
        {
            "id": 13,
            "nama": "Feri F",
            "sekolah": "SMKN 1 Malang",
            "email": "feri1@gmail.com",
            "fase": 2,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-08T12:14:52.570Z",
            "updatedAt": "2026-10-08T12:14:52.570Z"
        },
        {
            "id": 12,
            "nama": "Zidan A.P",
            "sekolah": "SMKN 1 Malang",
            "email": "zidan2@gmail.com",
            "fase": 2,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-08T12:10:43.696Z",
            "updatedAt": "2026-10-08T12:10:43.696Z"
        },
        {
            "id": 10,
            "nama": "Zidan",
            "sekolah": "SMKN 1 Malang",
            "email": "zidan1@gmail.com",
            "fase": 2,
            "status": "aktif",
            "role": "mentor",
            "createdAt": "2026-10-08T12:10:18.122Z",
            "updatedAt": "2026-10-08T12:10:18.122Z"
        },
        {
            "id": 9,
            "nama": "Zidan Alfa P",
            "sekolah": "SMKN 5",
            "email": "zidan21@gmail.com",
            "fase": 1,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-04T06:59:50.005Z",
            "updatedAt": "2026-10-04T06:59:50.005Z"
        },
        {
            "id": 8,
            "nama": "Zidan Gini nih",
            "sekolah": "SMKN 1 Malang",
            "email": "zidan20@gmail.com",
            "fase": 2,
            "status": "aktif",
            "role": "mentor",
            "createdAt": "2026-10-01T03:16:32.605Z",
            "updatedAt": "2026-10-01T03:16:32.605Z"
        },
        {
            "id": 6,
            "nama": "Zidan Alfa",
            "sekolah": "SMKN 5",
            "email": "zidan18@gmail.com",
            "fase": 1,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-09-30T04:21:29.949Z",
            "updatedAt": "2026-09-30T04:21:29.949Z"
        },
        {
            "id": 5,
            "nama": "Zidan",
            "sekolah": "SMK",
            "email": "zidan54@gmail.com",
            "fase": 1,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-09-30T02:52:16.335Z",
            "updatedAt": "2026-09-30T02:52:16.335Z"
        },
        {
            "id": 4,
            "nama": "Agus Pratama",
            "sekolah": "SMKN 1 Singosari",
            "email": "agus.pratama@outlook.com",
            "fase": 3,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-09-29T07:27:22.553Z",
            "updatedAt": "2026-09-29T07:27:22.553Z"
        },
        {
            "id": 3,
            "nama": "Siti Aminah",
            "sekolah": "SMKN 8 Malang",
            "email": "siti.am@yahoo.com",
            "fase": 1,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-09-29T07:26:43.629Z",
            "updatedAt": "2026-09-29T07:26:43.629Z"
        }
    ],
    "meta": {
        "page": 1,
        "limit": 10,
        "total": 11,
        "totalPages": 2,
        "hasNext": true,
        "hasPrev": false
    }
}
```

8. `http://localhost:3000/api/peserta?sortBy=nama;DROP TABLE peserta`

```json
{
    "sukses": true,
    "pesan": "Berhasil",
    "data": [
        {
            "id": 14,
            "nama": "Feri",
            "sekolah": "SMKN 1 Malang",
            "email": "feri2@gmail.com",
            "fase": 2,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-08T12:15:04.092Z",
            "updatedAt": "2026-10-08T12:15:04.092Z"
        },
        {
            "id": 13,
            "nama": "Feri F",
            "sekolah": "SMKN 1 Malang",
            "email": "feri1@gmail.com",
            "fase": 2,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-08T12:14:52.570Z",
            "updatedAt": "2026-10-08T12:14:52.570Z"
        },
        {
            "id": 12,
            "nama": "Zidan A.P",
            "sekolah": "SMKN 1 Malang",
            "email": "zidan2@gmail.com",
            "fase": 2,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-08T12:10:43.696Z",
            "updatedAt": "2026-10-08T12:10:43.696Z"
        },
        {
            "id": 10,
            "nama": "Zidan",
            "sekolah": "SMKN 1 Malang",
            "email": "zidan1@gmail.com",
            "fase": 2,
            "status": "aktif",
            "role": "mentor",
            "createdAt": "2026-10-08T12:10:18.122Z",
            "updatedAt": "2026-10-08T12:10:18.122Z"
        },
        {
            "id": 9,
            "nama": "Zidan Alfa P",
            "sekolah": "SMKN 5",
            "email": "zidan21@gmail.com",
            "fase": 1,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-04T06:59:50.005Z",
            "updatedAt": "2026-10-04T06:59:50.005Z"
        },
        {
            "id": 8,
            "nama": "Zidan Gini nih",
            "sekolah": "SMKN 1 Malang",
            "email": "zidan20@gmail.com",
            "fase": 2,
            "status": "aktif",
            "role": "mentor",
            "createdAt": "2026-10-01T03:16:32.605Z",
            "updatedAt": "2026-10-01T03:16:32.605Z"
        },
        {
            "id": 6,
            "nama": "Zidan Alfa",
            "sekolah": "SMKN 5",
            "email": "zidan18@gmail.com",
            "fase": 1,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-09-30T04:21:29.949Z",
            "updatedAt": "2026-09-30T04:21:29.949Z"
        },
        {
            "id": 5,
            "nama": "Zidan",
            "sekolah": "SMK",
            "email": "zidan54@gmail.com",
            "fase": 1,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-09-30T02:52:16.335Z",
            "updatedAt": "2026-09-30T02:52:16.335Z"
        },
        {
            "id": 4,
            "nama": "Agus Pratama",
            "sekolah": "SMKN 1 Singosari",
            "email": "agus.pratama@outlook.com",
            "fase": 3,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-09-29T07:27:22.553Z",
            "updatedAt": "2026-09-29T07:27:22.553Z"
        },
        {
            "id": 3,
            "nama": "Siti Aminah",
            "sekolah": "SMKN 8 Malang",
            "email": "siti.am@yahoo.com",
            "fase": 1,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-09-29T07:26:43.629Z",
            "updatedAt": "2026-09-29T07:26:43.629Z"
        }
    ],
    "meta": {
        "page": 1,
        "limit": 10,
        "total": 11,
        "totalPages": 2,
        "hasNext": true,
        "hasPrev": false
    }
}
```

9. `http://localhost:3000/api/peserta?q=%`

```json
{
    "sukses": true,
    "pesan": "Berhasil",
    "data": [],
    "meta": {
        "page": 1,
        "limit": 10,
        "total": 0,
        "totalPages": 1,
        "hasNext": false,
        "hasPrev": false
    }
}
```

10. `http://localhost:3000/api/peserta?q=_`

```json
{
    "sukses": true,
    "pesan": "Berhasil",
    "data": [],
    "meta": {
        "page": 1,
        "limit": 10,
        "total": 0,
        "totalPages": 1,
        "hasNext": false,
        "hasPrev": false
    }
}
```

11. `http://localhost:3000/api/peserta?q=`

```json
{
    "sukses": true,
    "pesan": "Berhasil",
    "data": [
        {
            "id": 14,
            "nama": "Feri",
            "sekolah": "SMKN 1 Malang",
            "email": "feri2@gmail.com",
            "fase": 2,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-08T12:15:04.092Z",
            "updatedAt": "2026-10-08T12:15:04.092Z"
        },
        {
            "id": 13,
            "nama": "Feri F",
            "sekolah": "SMKN 1 Malang",
            "email": "feri1@gmail.com",
            "fase": 2,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-08T12:14:52.570Z",
            "updatedAt": "2026-10-08T12:14:52.570Z"
        },
        {
            "id": 12,
            "nama": "Zidan A.P",
            "sekolah": "SMKN 1 Malang",
            "email": "zidan2@gmail.com",
            "fase": 2,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-08T12:10:43.696Z",
            "updatedAt": "2026-10-08T12:10:43.696Z"
        },
        {
            "id": 10,
            "nama": "Zidan",
            "sekolah": "SMKN 1 Malang",
            "email": "zidan1@gmail.com",
            "fase": 2,
            "status": "aktif",
            "role": "mentor",
            "createdAt": "2026-10-08T12:10:18.122Z",
            "updatedAt": "2026-10-08T12:10:18.122Z"
        },
        {
            "id": 9,
            "nama": "Zidan Alfa P",
            "sekolah": "SMKN 5",
            "email": "zidan21@gmail.com",
            "fase": 1,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-04T06:59:50.005Z",
            "updatedAt": "2026-10-04T06:59:50.005Z"
        },
        {
            "id": 8,
            "nama": "Zidan Gini nih",
            "sekolah": "SMKN 1 Malang",
            "email": "zidan20@gmail.com",
            "fase": 2,
            "status": "aktif",
            "role": "mentor",
            "createdAt": "2026-10-01T03:16:32.605Z",
            "updatedAt": "2026-10-01T03:16:32.605Z"
        },
        {
            "id": 6,
            "nama": "Zidan Alfa",
            "sekolah": "SMKN 5",
            "email": "zidan18@gmail.com",
            "fase": 1,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-09-30T04:21:29.949Z",
            "updatedAt": "2026-09-30T04:21:29.949Z"
        },
        {
            "id": 5,
            "nama": "Zidan",
            "sekolah": "SMK",
            "email": "zidan54@gmail.com",
            "fase": 1,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-09-30T02:52:16.335Z",
            "updatedAt": "2026-09-30T02:52:16.335Z"
        },
        {
            "id": 4,
            "nama": "Agus Pratama",
            "sekolah": "SMKN 1 Singosari",
            "email": "agus.pratama@outlook.com",
            "fase": 3,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-09-29T07:27:22.553Z",
            "updatedAt": "2026-09-29T07:27:22.553Z"
        },
        {
            "id": 3,
            "nama": "Siti Aminah",
            "sekolah": "SMKN 8 Malang",
            "email": "siti.am@yahoo.com",
            "fase": 1,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-09-29T07:26:43.629Z",
            "updatedAt": "2026-09-29T07:26:43.629Z"
        }
    ],
    "meta": {
        "page": 1,
        "limit": 10,
        "total": 11,
        "totalPages": 2,
        "hasNext": true,
        "hasPrev": false
    }
}
```