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
