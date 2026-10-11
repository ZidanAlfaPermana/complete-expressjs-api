# Uji Skenario Lengkap

- Variabel yang dipakai:

```bash
BASE=http://localhost:3000/api/v1
TOKEN_PESERTA=<access token peserta>
TOKEN_PESERTA_LAIN=<access token peserta kedua>
TOKEN_MENTOR=<access token mentor>
```

## Ringkasan Hasil

| No | Skenario | Ekspektasi |
|----|----------|------------|
| 1 | Register berhasil | 201 + header Location |
| 2 | Register email duplikat | 409 CONFLICT |
| 3 | Register email format salah | 422 VALIDATION_ERROR |
| 4 | Login salah 11 kali | 429 RATE_LIMITED di percobaan ke-11 |
| 5 | /me tanpa token | 401 UNAUTHORIZED |
| 6 | /me token expired | 401 TOKEN_EXPIRED |
| 7 | Peserta akses GET /jurnal | 403 FORBIDDEN |
| 8 | Peserta edit jurnal peserta lain | 403 FORBIDDEN |
| 9 | GET /peserta/9999 | 404 NOT_FOUND |
| 10 | Body JSON rusak | 400 INVALID_JSON |
| 11 | Query pagination dan sort tidak aman | 200, nilai dikoreksi, tidak bocor |
| 12 | PATCH /me dengan role | role tidak berubah |
| 13 | PostgreSQL mati, /health/ready | 503 |
| 14 | Ctrl+C saat server berjalan | log shutdown rapi |

---

## 1. Register berhasil

**Ekspektasi:** status 201 dan header `Location` mengarah ke resource baru.

**Perintah:**

```bash
curl -i -X POST $BASE/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nama":"Budi Santoso","sekolah":"SMKN 5 Malang","email":"budi@gmail.com","password":"rahasia123"}'
```

**Hasil:**

```json
{
    "sukses": true,
    "pesan": "Registrasi berhasil",
    "dataBersih": {
        "id": 66,
        "nama": "Budi Santoso",
        "sekolah": "SMKN 5 Malang",
        "email": "budi@gmail.com",
        "fase": 1,
        "status": "aktif",
        "role": "peserta",
        "createdAt": "2026-10-11T04:15:08.235Z",
        "updatedAt": "2026-10-11T04:15:08.235Z",
        "skills": []
    }
}
```

**Lulus:**
1. [x] Ya  
2. [ ] Tidak

---

## 2. Register email duplikat

**Ekspektasi:** 409 dengan `kode: "CONFLICT"`.

**Perintah:** jalankan ulang perintah skenario 1.

**Hasil:**

```json
{
    "sukses": false,
    "error": {
        "kode": "CONFLICT",
        "pesan": "Email sudah terdaftar",
        "debug": {
            "asli": "Email sudah terdaftar",
            "stack": "ConflictError: Email sudah terdaftar\n    at Object.register (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\src\\services\\auth.service.ts:59:15)\n    at processTicksAndRejections (node:internal/process/task_queues:104:5)\n    at async D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\src\\controllers\\auth.controller.ts:7:18"
        }
    },
    "requestId": "d574750d-842e-4f17-98c3-12c037293090"
}
```

**Lulus:**
1. [x] Ya  
2. [ ] Tidak

---

## 3. Register dengan email format salah

**Ekspektasi:** 422 dengan `kode: "VALIDATION_ERROR"` dan `detail` berupa array `{ field, pesan }`.

**Perintah:**

```bash
curl -i -X POST $BASE/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nama":"Budi Santoso","sekolah":"SMKN 5 Malang","email":"bukan-email","password":"rahasia123"}'
```

**Hasil:**

```json
{
    "sukses": false,
    "error": {
        "kode": "VALIDATION_ERROR",
        "pesan": "Validasi gagal",
        "detail": [
            {
                "field": "email",
                "pesan": "Email wajib diisi dan formatnya harus valid (contoh: mentor@gmail.com)"
            }
        ],
        "debug": {
            "asli": "Validasi gagal",
            "stack": "ValidationError: Validasi gagal\n    at validasiRegister (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\src\\middlewares\\validasi.middleware.ts:182:14)\n    at Layer.handleRequest (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\lib\\layer.js:152:17)\n    at next (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\lib\\route.js:157:13)\n    at Route.dispatch (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\lib\\route.js:117:3)\n    at handle (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\index.js:435:11)\n    at Layer.handleRequest (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\lib\\layer.js:152:17)\n    at D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\index.js:295:15\n    at processParams (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\index.js:582:12)\n    at next (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\index.js:291:5)\n    at router.handle (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\index.js:186:3)"
        }
    },
    "requestId": "eb1fe68a-48e5-46ff-b6cf-f3db1d863e8d"
}
```

**Lulus:** 
1. [x] Ya  
2. [ ] Tidak

---

## 4. Login password salah 11 kali

**Ekspektasi:** percobaan 1 sampai 10 mengembalikan 401, percobaan ke-11 mengembalikan 429 dengan `kode: "RATE_LIMITED"`.

**Catatan:** jika limiter memakai `skip: () => !isProd`, jalankan server dengan `NODE_ENV=production` untuk skenario ini. Restart server sebelum mulai agar counter bersih.

**Perintah:**

```bash
for i in $(seq 1 10); do
  curl -s -o /dev/null -w "percobaan $i: %{http_code}\n" -X POST $BASE/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"budi@gmail.com","password":"passwordsalah"}'
done

curl -i -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"budi@gmail.com","password":"passwordsalah"}'
```

**Hasil (status percobaan 1 sampai 10):**

```json
{
    "sukses": false,
    "error": {
        "kode": "UNAUTHORIZED",
        "pesan": "Email atau password salah",
        "debug": {
            "asli": "Email atau password salah",
            "stack": "UnauthorizedError: Email atau password salah\n    at Object.login (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\src\\services\\auth.service.ts:31:15)\n    at processTicksAndRejections (node:internal/process/task_queues:104:5)\n    at async D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\src\\controllers\\auth.controller.ts:18:18"
        }
    },
    "requestId": "09ed8086-cc90-452b-8bd3-97f1025b9836"
}
```

**Hasil (percobaan ke-11):**

```json
{
    "sukses": false,
    "error": {
        "kode": "RATE_LIMITED",
        "pesan": "Terlalu banyak percobaan, coba lagi nanti",
        "debug": {
            "asli": "Terlalu banyak percobaan, coba lagi nanti",
            "stack": "AppError: Terlalu banyak percobaan, coba lagi nanti\n    at Object.handler (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\src\\middlewares\\rateLimit.middleware.ts:13:14)\n    at D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\express-rate-limit\\dist\\index.cjs:1060:16\n    at processTicksAndRejections (node:internal/process/task_queues:104:5)\n    at async D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\express-rate-limit\\dist\\index.cjs:879:5"
        }
    },
    "requestId": "fa5acb08-ca22-4044-98b5-460af28da7a9"
}
```

**Lulus:** 
1. [x] Ya  
2. [ ] Tidak

---

## 5. Akses /me tanpa token

**Ekspektasi:** 401 dengan `kode: "UNAUTHORIZED"`.

**Perintah:**

```bash
curl -i $BASE/auth/me
```

**Hasil:**

```json
{
    "sukses": false,
    "error": {
        "kode": "UNAUTHORIZED",
        "pesan": "Token tidak ditemukan",
        "debug": {
            "asli": "Token tidak ditemukan",
            "stack": "UnauthorizedError: Token tidak ditemukan\n    at authGuard (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\src\\middlewares\\auth.middleware.ts:17:15)\n    at Layer.handleRequest (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\lib\\layer.js:152:17)\n    at next (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\lib\\route.js:157:13)\n    at Route.dispatch (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\lib\\route.js:117:3)\n    at handle (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\index.js:435:11)\n    at Layer.handleRequest (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\lib\\layer.js:152:17)\n    at D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\index.js:295:15\n    at processParams (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\index.js:582:12)\n    at next (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\index.js:291:5)\n    at router.handle (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\index.js:186:3)"
        }
    },
    "requestId": "b15deef8-63cc-4c18-a2db-00b37a514884"
}
```

**Lulus:** 
1. [x] Ya  
2. [ ] Tidak

---

## 6. Akses /me dengan token expired

**Ekspektasi:** 401 dengan `kode: "TOKEN_EXPIRED"`.

**Cara membuat token expired:** ubah masa berlaku access token jadi sangat pendek (misalnya 1 detik) di konfigurasi, login, tunggu beberapa detik, lalu pakai tokennya. Kembalikan konfigurasi setelah selesai.

**Perintah:**

```bash
curl -i $BASE/auth/me -H "Authorization: Bearer <token expired>"
```

**Hasil:**

```json
{
    "sukses": false,
    "error": {
        "kode": "UNAUTHORIZED",
        "pesan": "Token tidak valid atau sudah kedaluwarsa",
        "debug": {
            "asli": "Token tidak valid atau sudah kedaluwarsa",
            "stack": "UnauthorizedError: Token tidak valid atau sudah kedaluwarsa\n    at authGuard (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\src\\middlewares\\auth.middleware.ts:27:15)\n    at Layer.handleRequest (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\lib\\layer.js:152:17)\n    at trimPrefix (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\index.js:342:13)\n    at D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\index.js:297:9\n    at processParams (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\index.js:582:12)\n    at next (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\index.js:291:5)\n    at router.handle (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\index.js:186:3)\n    at router (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\index.js:60:12)\n    at Layer.handleRequest (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\lib\\layer.js:152:17)\n    at trimPrefix (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\index.js:342:13)"
        }
    },
    "requestId": "32992adb-2993-4495-9184-03ca75754566"
}
```

**Lulus:** 
1. [x] Ya  
2. [ ] Tidak

---

## 7. Peserta akses GET /jurnal (khusus mentor)

**Ekspektasi:** 403 dengan `kode: "FORBIDDEN"`.

**Perintah:**

```bash
curl -i $BASE/jurnal -H "Authorization: Bearer $TOKEN_PESERTA"
```

**Hasil:**

```json
{
    "sukses": false,
    "error": {
        "kode": "FORBIDDEN",
        "pesan": "Aksi ini hanya untuk: mentor",
        "debug": {
            "asli": "Aksi ini hanya untuk: mentor",
            "stack": "ForbiddenError: Aksi ini hanya untuk: mentor\n    at D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\src\\middlewares\\role.middleware.ts:11:19\n    at Layer.handleRequest (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\lib\\layer.js:152:17)\n    at next (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\lib\\route.js:157:13)\n    at authGuard (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\src\\middlewares\\auth.middleware.ts:25:9)\n    at Layer.handleRequest (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\lib\\layer.js:152:17)\n    at next (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\lib\\route.js:157:13)\n    at Route.dispatch (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\lib\\route.js:117:3)\n    at handle (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\index.js:435:11)\n    at Layer.handleRequest (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\lib\\layer.js:152:17)\n    at D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\index.js:295:15"
        }
    },
    "requestId": "cd038d3f-0196-4969-a7b2-f8276d66eb74"
}
```

**Lulus:** 
1. [x] Ya  
2. [ ] Tidak

---

## 8. Peserta mengedit jurnal milik peserta lain

**Ekspektasi:** 403 dengan `kode: "FORBIDDEN"`.

**Persiapan:** jurnal dengan ID `<id>` dimiliki peserta A, sedangkan token yang dipakai milik peserta B.

**Perintah:**

```bash
curl -i -X PUT $BASE/jurnal/<id> \
  -H "Authorization: Bearer $TOKEN_PESERTA_LAIN" \
  -H "Content-Type: application/json" \
  -d '{"kegiatan":"isi kegiatan minimal sepuluh kata supaya lolos validasi dengan baik dan benar","rencanaBesok":"isi rencana besok minimal sepuluh kata supaya lolos validasi dengan baik dan benar","status":"proses","review":"belum","pesertaId":1,"reviewerId":1}'
```

**Hasil:**

```json
{
    "sukses": false,
    "error": {
        "kode": "FORBIDDEN",
        "pesan": "Anda tidak memiliki akses untuk mengubah data ini",
        "debug": {
            "asli": "Anda tidak memiliki akses untuk mengubah data ini",
            "stack": "ForbiddenError: Anda tidak memiliki akses untuk mengubah data ini\n    at D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\src\\controllers\\jurnal.controller.ts:120:15\n    at processTicksAndRejections (node:internal/process/task_queues:104:5)"
        }
    },
    "requestId": "49c9074c-7726-4477-9208-65c458d437b6"
}
```

**Lulus:** 
1. [x] Ya  
2. [ ] Tidak

---

## 9. GET /peserta/9999

**Ekspektasi:** 404 dengan `kode: "NOT_FOUND"`.

**Perintah:**

```bash
curl -i $BASE/peserta/9999 -H "Authorization: Bearer $TOKEN_MENTOR"
```

**Hasil:**

```
{
    "sukses": false,
    "error": {
        "kode": "NOT_FOUND",
        "pesan": "Peserta dengan id 1 tidak ditemukan tidak ditemukan",
        "debug": {
            "asli": "Peserta dengan id 1 tidak ditemukan tidak ditemukan",
            "stack": "NotFoundError: Peserta dengan id 1 tidak ditemukan tidak ditemukan\n    at D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\src\\controllers\\peserta.controller.ts:40:15\n    at processTicksAndRejections (node:internal/process/task_queues:104:5)"
        }
    },
    "requestId": "41ae2509-0747-49e9-bc72-57b1e6cdac62"
}
```

**Lulus:** 
1. [x] Ya  
2. [ ] Tidak

---

## 10. Body JSON rusak

**Ekspektasi:** 400 dengan `kode: "INVALID_JSON"`.

**Perintah:**

```bash
curl -i -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "budi@gmail.com", "password": '
```

**Hasil:**

```json
{
    "sukses": false,
    "error": {
        "kode": "INVALID_JSON",
        "pesan": "Format JSON pada body tidak valid",
        "debug": {
            "asli": "Expected ',' or '}' after property value in JSON at position 89 (line 6 column 3)",
            "stack": "SyntaxError: Expected ',' or '}' after property value in JSON at position 89 (line 6 column 3)\n    at JSON.parse (<anonymous>)\n    at parse (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\body-parser\\lib\\types\\json.js:91:21)\n    at D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\body-parser\\lib\\read.js:162:18\n    at AsyncResource.runInAsyncScope (node:async_hooks:227:14)\n    at invokeCallback (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\raw-body\\index.js:238:16)\n    at done (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\raw-body\\index.js:227:7)\n    at IncomingMessage.onEnd (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\raw-body\\index.js:287:7)\n    at IncomingMessage.emit (node:events:509:28)\n    at IncomingMessage.emit (node:domain:489:12)\n    at endReadableNT (node:internal/streams/readable:1729:12)"
        }
    },
    "requestId": "c269338d-3167-4e12-a95f-4b873d5ac0ae"
}
```

**Lulus:** 
1. [x] Ya  
2. [ ] Tidak

---

## 11. Pagination dan sort tidak aman

**Ekspektasi:** 200. `page` dan `limit` dikoreksi ke batas yang valid, `sortBy=password` diabaikan atau diganti default, dan field `password` tidak muncul di response.

**Perintah:**

```bash
curl -i "$BASE/peserta?page=0&limit=1000&sortBy=password" \
  -H "Authorization: Bearer $TOKEN_MENTOR"
```

**Nilai setelah dikoreksi (page / limit / sortBy):** `password tidak bocor dan limit max 100 dan page 1`

**Hasil:**

```json
{
    "sukses": true,
    "pesan": "Berhasil",
    "data": [
        {
            "id": 66,
            "nama": "Budi Santoso",
            "sekolah": "SMKN 5 Malang",
            "email": "budi@gmail.com",
            "fase": 1,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-11T04:15:08.235Z",
            "updatedAt": "2026-10-11T04:15:08.235Z"
        },
        {
            "id": 65,
            "nama": "Zidan Alfa",
            "sekolah": "SMKN 5",
            "email": "zidan22@gmail.com",
            "fase": 1,
            "status": "aktif",
            "role": "mentor",
            "createdAt": "2026-10-09T15:01:26.989Z",
            "updatedAt": "2026-10-09T15:01:26.989Z"
        },
        {
            "id": 59,
            "nama": "Eka Kusuma 45",
            "sekolah": "SMK Brawijaya",
            "email": "peserta45@seed.test",
            "fase": 3,
            "status": "berhenti",
            "role": "peserta",
            "createdAt": "2026-10-08T12:39:35.029Z",
            "updatedAt": "2026-10-08T12:39:35.029Z"
        },
        {
            "id": 58,
            "nama": "Dewi Saputra 44",
            "sekolah": "SMKN 2 Singosari",
            "email": "peserta44@seed.test",
            "fase": 2,
            "status": "lulus",
            "role": "peserta",
            "createdAt": "2026-10-08T12:39:35.029Z",
            "updatedAt": "2026-10-08T12:39:35.029Z"
        },
        {
            "id": 60,
            "nama": "Fajar Pratama 46",
            "sekolah": "SMKN 5 Malang",
            "email": "peserta46@seed.test",
            "fase": 1,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-08T12:39:35.029Z",
            "updatedAt": "2026-10-08T12:39:35.029Z"
        },
        {
            "id": 61,
            "nama": "Gita Lestari 47",
            "sekolah": "SMKN 4 Malang",
            "email": "peserta47@seed.test",
            "fase": 2,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-08T12:39:35.029Z",
            "updatedAt": "2026-10-08T12:39:35.029Z"
        },
        {
            "id": 62,
            "nama": "Hadi Wijaya 48",
            "sekolah": "SMK Telkom Malang",
            "email": "peserta48@seed.test",
            "fase": 3,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-08T12:39:35.029Z",
            "updatedAt": "2026-10-08T12:39:35.029Z"
        },
        {
            "id": 63,
            "nama": "Indah Saputra 49",
            "sekolah": "SMKN 2 Singosari",
            "email": "peserta49@seed.test",
            "fase": 1,
            "status": "lulus",
            "role": "peserta",
            "createdAt": "2026-10-08T12:39:35.029Z",
            "updatedAt": "2026-10-08T12:39:35.029Z"
        },
        {
            "id": 64,
            "nama": "Joko Kusuma 50",
            "sekolah": "SMK Brawijaya",
            "email": "peserta50@seed.test",
            "fase": 2,
            "status": "berhenti",
            "role": "peserta",
            "createdAt": "2026-10-08T12:39:35.029Z",
            "updatedAt": "2026-10-08T12:39:35.029Z"
        },
        {
            "id": 15,
            "nama": "Andi Pratama 1",
            "sekolah": "SMKN 5 Malang",
            "email": "peserta01@seed.test",
            "fase": 1,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-08T12:39:35.029Z",
            "updatedAt": "2026-10-08T12:39:35.029Z"
        },
        {
            "id": 16,
            "nama": "Budi Lestari 2",
            "sekolah": "SMKN 4 Malang",
            "email": "peserta02@seed.test",
            "fase": 2,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-08T12:39:35.029Z",
            "updatedAt": "2026-10-08T12:39:35.029Z"
        },
        {
            "id": 17,
            "nama": "Citra Wijaya 3",
            "sekolah": "SMK Telkom Malang",
            "email": "peserta03@seed.test",
            "fase": 3,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-08T12:39:35.029Z",
            "updatedAt": "2026-10-08T12:39:35.029Z"
        },
        {
            "id": 18,
            "nama": "Dewi Saputra 4",
            "sekolah": "SMKN 2 Singosari",
            "email": "peserta04@seed.test",
            "fase": 1,
            "status": "lulus",
            "role": "peserta",
            "createdAt": "2026-10-08T12:39:35.029Z",
            "updatedAt": "2026-10-08T12:39:35.029Z"
        },
        {
            "id": 19,
            "nama": "Eka Kusuma 5",
            "sekolah": "SMK Brawijaya",
            "email": "peserta05@seed.test",
            "fase": 2,
            "status": "berhenti",
            "role": "peserta",
            "createdAt": "2026-10-08T12:39:35.029Z",
            "updatedAt": "2026-10-08T12:39:35.029Z"
        },
        {
            "id": 20,
            "nama": "Fajar Pratama 6",
            "sekolah": "SMKN 5 Malang",
            "email": "peserta06@seed.test",
            "fase": 3,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-08T12:39:35.029Z",
            "updatedAt": "2026-10-08T12:39:35.029Z"
        },
        {
            "id": 21,
            "nama": "Gita Lestari 7",
            "sekolah": "SMKN 4 Malang",
            "email": "peserta07@seed.test",
            "fase": 1,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-08T12:39:35.029Z",
            "updatedAt": "2026-10-08T12:39:35.029Z"
        },
        {
            "id": 22,
            "nama": "Hadi Wijaya 8",
            "sekolah": "SMK Telkom Malang",
            "email": "peserta08@seed.test",
            "fase": 2,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-08T12:39:35.029Z",
            "updatedAt": "2026-10-08T12:39:35.029Z"
        },
        {
            "id": 23,
            "nama": "Indah Saputra 9",
            "sekolah": "SMKN 2 Singosari",
            "email": "peserta09@seed.test",
            "fase": 3,
            "status": "lulus",
            "role": "peserta",
            "createdAt": "2026-10-08T12:39:35.029Z",
            "updatedAt": "2026-10-08T12:39:35.029Z"
        },
        {
            "id": 24,
            "nama": "Joko Kusuma 10",
            "sekolah": "SMK Brawijaya",
            "email": "peserta10@seed.test",
            "fase": 1,
            "status": "berhenti",
            "role": "peserta",
            "createdAt": "2026-10-08T12:39:35.029Z",
            "updatedAt": "2026-10-08T12:39:35.029Z"
        },
        {
            "id": 25,
            "nama": "Andi Pratama 11",
            "sekolah": "SMKN 5 Malang",
            "email": "peserta11@seed.test",
            "fase": 2,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-08T12:39:35.029Z",
            "updatedAt": "2026-10-08T12:39:35.029Z"
        },
        {
            "id": 26,
            "nama": "Budi Lestari 12",
            "sekolah": "SMKN 4 Malang",
            "email": "peserta12@seed.test",
            "fase": 3,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-08T12:39:35.029Z",
            "updatedAt": "2026-10-08T12:39:35.029Z"
        },
        {
            "id": 27,
            "nama": "Citra Wijaya 13",
            "sekolah": "SMK Telkom Malang",
            "email": "peserta13@seed.test",
            "fase": 1,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-08T12:39:35.029Z",
            "updatedAt": "2026-10-08T12:39:35.029Z"
        },
        {
            "id": 28,
            "nama": "Dewi Saputra 14",
            "sekolah": "SMKN 2 Singosari",
            "email": "peserta14@seed.test",
            "fase": 2,
            "status": "lulus",
            "role": "peserta",
            "createdAt": "2026-10-08T12:39:35.029Z",
            "updatedAt": "2026-10-08T12:39:35.029Z"
        },
        {
            "id": 29,
            "nama": "Eka Kusuma 15",
            "sekolah": "SMK Brawijaya",
            "email": "peserta15@seed.test",
            "fase": 3,
            "status": "berhenti",
            "role": "peserta",
            "createdAt": "2026-10-08T12:39:35.029Z",
            "updatedAt": "2026-10-08T12:39:35.029Z"
        },
        {
            "id": 30,
            "nama": "Fajar Pratama 16",
            "sekolah": "SMKN 5 Malang",
            "email": "peserta16@seed.test",
            "fase": 1,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-08T12:39:35.029Z",
            "updatedAt": "2026-10-08T12:39:35.029Z"
        },
        {
            "id": 32,
            "nama": "Hadi Wijaya 18",
            "sekolah": "SMK Telkom Malang",
            "email": "peserta18@seed.test",
            "fase": 3,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-08T12:39:35.029Z",
            "updatedAt": "2026-10-08T12:39:35.029Z"
        },
        {
            "id": 33,
            "nama": "Indah Saputra 19",
            "sekolah": "SMKN 2 Singosari",
            "email": "peserta19@seed.test",
            "fase": 1,
            "status": "lulus",
            "role": "peserta",
            "createdAt": "2026-10-08T12:39:35.029Z",
            "updatedAt": "2026-10-08T12:39:35.029Z"
        },
        {
            "id": 34,
            "nama": "Joko Kusuma 20",
            "sekolah": "SMK Brawijaya",
            "email": "peserta20@seed.test",
            "fase": 2,
            "status": "berhenti",
            "role": "peserta",
            "createdAt": "2026-10-08T12:39:35.029Z",
            "updatedAt": "2026-10-08T12:39:35.029Z"
        },
        {
            "id": 35,
            "nama": "Andi Pratama 21",
            "sekolah": "SMKN 5 Malang",
            "email": "peserta21@seed.test",
            "fase": 3,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-08T12:39:35.029Z",
            "updatedAt": "2026-10-08T12:39:35.029Z"
        },
        {
            "id": 36,
            "nama": "Budi Lestari 22",
            "sekolah": "SMKN 4 Malang",
            "email": "peserta22@seed.test",
            "fase": 1,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-08T12:39:35.029Z",
            "updatedAt": "2026-10-08T12:39:35.029Z"
        },
        {
            "id": 37,
            "nama": "Citra Wijaya 23",
            "sekolah": "SMK Telkom Malang",
            "email": "peserta23@seed.test",
            "fase": 2,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-08T12:39:35.029Z",
            "updatedAt": "2026-10-08T12:39:35.029Z"
        },
        {
            "id": 38,
            "nama": "Dewi Saputra 24",
            "sekolah": "SMKN 2 Singosari",
            "email": "peserta24@seed.test",
            "fase": 3,
            "status": "lulus",
            "role": "peserta",
            "createdAt": "2026-10-08T12:39:35.029Z",
            "updatedAt": "2026-10-08T12:39:35.029Z"
        },
        {
            "id": 39,
            "nama": "Eka Kusuma 25",
            "sekolah": "SMK Brawijaya",
            "email": "peserta25@seed.test",
            "fase": 1,
            "status": "berhenti",
            "role": "peserta",
            "createdAt": "2026-10-08T12:39:35.029Z",
            "updatedAt": "2026-10-08T12:39:35.029Z"
        },
        {
            "id": 40,
            "nama": "Fajar Pratama 26",
            "sekolah": "SMKN 5 Malang",
            "email": "peserta26@seed.test",
            "fase": 2,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-08T12:39:35.029Z",
            "updatedAt": "2026-10-08T12:39:35.029Z"
        },
        {
            "id": 41,
            "nama": "Gita Lestari 27",
            "sekolah": "SMKN 4 Malang",
            "email": "peserta27@seed.test",
            "fase": 3,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-08T12:39:35.029Z",
            "updatedAt": "2026-10-08T12:39:35.029Z"
        },
        {
            "id": 42,
            "nama": "Hadi Wijaya 28",
            "sekolah": "SMK Telkom Malang",
            "email": "peserta28@seed.test",
            "fase": 1,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-08T12:39:35.029Z",
            "updatedAt": "2026-10-08T12:39:35.029Z"
        },
        {
            "id": 43,
            "nama": "Indah Saputra 29",
            "sekolah": "SMKN 2 Singosari",
            "email": "peserta29@seed.test",
            "fase": 2,
            "status": "lulus",
            "role": "peserta",
            "createdAt": "2026-10-08T12:39:35.029Z",
            "updatedAt": "2026-10-08T12:39:35.029Z"
        },
        {
            "id": 44,
            "nama": "Joko Kusuma 30",
            "sekolah": "SMK Brawijaya",
            "email": "peserta30@seed.test",
            "fase": 3,
            "status": "berhenti",
            "role": "peserta",
            "createdAt": "2026-10-08T12:39:35.029Z",
            "updatedAt": "2026-10-08T12:39:35.029Z"
        },
        {
            "id": 45,
            "nama": "Andi Pratama 31",
            "sekolah": "SMKN 5 Malang",
            "email": "peserta31@seed.test",
            "fase": 1,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-08T12:39:35.029Z",
            "updatedAt": "2026-10-08T12:39:35.029Z"
        },
        {
            "id": 46,
            "nama": "Budi Lestari 32",
            "sekolah": "SMKN 4 Malang",
            "email": "peserta32@seed.test",
            "fase": 2,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-08T12:39:35.029Z",
            "updatedAt": "2026-10-08T12:39:35.029Z"
        },
        {
            "id": 47,
            "nama": "Citra Wijaya 33",
            "sekolah": "SMK Telkom Malang",
            "email": "peserta33@seed.test",
            "fase": 3,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-08T12:39:35.029Z",
            "updatedAt": "2026-10-08T12:39:35.029Z"
        },
        {
            "id": 48,
            "nama": "Dewi Saputra 34",
            "sekolah": "SMKN 2 Singosari",
            "email": "peserta34@seed.test",
            "fase": 1,
            "status": "lulus",
            "role": "peserta",
            "createdAt": "2026-10-08T12:39:35.029Z",
            "updatedAt": "2026-10-08T12:39:35.029Z"
        },
        {
            "id": 49,
            "nama": "Eka Kusuma 35",
            "sekolah": "SMK Brawijaya",
            "email": "peserta35@seed.test",
            "fase": 2,
            "status": "berhenti",
            "role": "peserta",
            "createdAt": "2026-10-08T12:39:35.029Z",
            "updatedAt": "2026-10-08T12:39:35.029Z"
        },
        {
            "id": 50,
            "nama": "Fajar Pratama 36",
            "sekolah": "SMKN 5 Malang",
            "email": "peserta36@seed.test",
            "fase": 3,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-08T12:39:35.029Z",
            "updatedAt": "2026-10-08T12:39:35.029Z"
        },
        {
            "id": 51,
            "nama": "Gita Lestari 37",
            "sekolah": "SMKN 4 Malang",
            "email": "peserta37@seed.test",
            "fase": 1,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-08T12:39:35.029Z",
            "updatedAt": "2026-10-08T12:39:35.029Z"
        },
        {
            "id": 52,
            "nama": "Hadi Wijaya 38",
            "sekolah": "SMK Telkom Malang",
            "email": "peserta38@seed.test",
            "fase": 2,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-08T12:39:35.029Z",
            "updatedAt": "2026-10-08T12:39:35.029Z"
        },
        {
            "id": 53,
            "nama": "Indah Saputra 39",
            "sekolah": "SMKN 2 Singosari",
            "email": "peserta39@seed.test",
            "fase": 3,
            "status": "lulus",
            "role": "peserta",
            "createdAt": "2026-10-08T12:39:35.029Z",
            "updatedAt": "2026-10-08T12:39:35.029Z"
        },
        {
            "id": 54,
            "nama": "Joko Kusuma 40",
            "sekolah": "SMK Brawijaya",
            "email": "peserta40@seed.test",
            "fase": 1,
            "status": "berhenti",
            "role": "peserta",
            "createdAt": "2026-10-08T12:39:35.029Z",
            "updatedAt": "2026-10-08T12:39:35.029Z"
        },
        {
            "id": 55,
            "nama": "Andi Pratama 41",
            "sekolah": "SMKN 5 Malang",
            "email": "peserta41@seed.test",
            "fase": 2,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-08T12:39:35.029Z",
            "updatedAt": "2026-10-08T12:39:35.029Z"
        },
        {
            "id": 56,
            "nama": "Budi Lestari 42",
            "sekolah": "SMKN 4 Malang",
            "email": "peserta42@seed.test",
            "fase": 3,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-08T12:39:35.029Z",
            "updatedAt": "2026-10-08T12:39:35.029Z"
        },
        {
            "id": 57,
            "nama": "Citra Wijaya 43",
            "sekolah": "SMK Telkom Malang",
            "email": "peserta43@seed.test",
            "fase": 1,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-10-08T12:39:35.029Z",
            "updatedAt": "2026-10-08T12:39:35.029Z"
        },
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
            "id": 4,
            "nama": "Agus Pratama",
            "sekolah": "SMKN 1 Singosari",
            "email": "agus.pratama@outlook.com",
            "fase": 3,
            "status": "aktif",
            "role": "peserta",
            "createdAt": "2026-09-29T07:27:22.553Z",
            "updatedAt": "2026-09-29T07:27:22.553Z"
        }
    ],
    "meta": {
        "page": 1,
        "limit": 100,
        "total": 57,
        "totalPages": 1,
        "hasNext": false,
        "hasPrev": false
    }
}
```

**Lulus:** 
1. [x] Ya  
2. [ ] Tidak

---

## 12. PATCH /me dengan role

**Ekspektasi:** role tidak berubah. Response tidak error atau mengabaikan field `role`, dan GET /me setelahnya tetap menunjukkan role semula.

**Perintah:**

```bash
curl -i -X PATCH $BASE/peserta/me \
  -H "Authorization: Bearer $TOKEN_PESERTA" \
  -H "Content-Type: application/json" \
  -d '{"role":"mentor"}'

curl -i $BASE/peserta/me -H "Authorization: Bearer $TOKEN_PESERTA"
```

**Hasil PATCH:**

```json
{
    "sukses": true,
    "pesan": "Peserta dengan id 66 berhasil di edit",
    "dataBersih": {
        "id": 66,
        "nama": "Budi Santoso",
        "sekolah": "SMKN 5 Malang",
        "email": "budi@gmail.com",
        "fase": 1,
        "status": "aktif",
        "role": "peserta",
        "createdAt": "2026-10-11T04:15:08.235Z",
        "updatedAt": "2026-10-11T06:26:17.044Z"
    }
}
```

**Hasil GET /me sesudahnya (cek field role):**

```json
{
    "sukses": true,
    "pesan": "Berhasil",
    "dataBersih": {
        "id": 66,
        "nama": "Budi Santoso",
        "sekolah": "SMKN 5 Malang",
        "email": "budi@gmail.com",
        "fase": 1,
        "status": "aktif",
        "role": "peserta",
        "createdAt": "2026-10-11T04:15:08.235Z",
        "updatedAt": "2026-10-11T06:26:17.044Z"
    }
}
```

**Lulus:** 
1. [x] Ya  
2. [ ] Tidak

---

## 13. PostgreSQL mati, panggil /health/ready

**Ekspektasi:** 503 dengan `status: "not_ready"` dan `database: "down"`. Endpoint `/health` (liveness) tetap 200.

**Langkah:** hentikan service `postgresql-x64-XX` lewat `services.msc`, lalu jalankan perintah. Nyalakan kembali service-nya setelah selesai.

**Perintah:**

```bash
curl -i $BASE/health/ready
curl -i $BASE/health
```

**Hasil /health:**

```json
{
    "status": "ok",
    "uptime": 129.4191814
}
```

**Hasil /health/ready:**

```json
{
    "status": "ready",
    "database": "up"
}
```

**Lulus:** 
1. [x] Ya 
2. [ ] Tidak

---

## 14. Ctrl+C saat server berjalan

**Ekspektasi:** muncul log shutdown yang rapi: menerima sinyal, server berhenti, koneksi database ditutup, lalu proses keluar.

**Langkah:** jalankan server, tekan `Ctrl+C` di terminal.

**Log yang muncul:**

```json
{"waktu":"2026-10-11T06:40:55.702Z","level":"info","pesan":"Menerima SIGINT, mematikan server..."}
{"waktu":"2026-10-11T06:40:55.705Z","level":"info","pesan":"Server dan koneksi database ditutup dengan rapi"}
```

**Lulus:** 
1. [x] Ya  
2. [ ] Tidak

---

## Kesimpulan

- Jumlah skenario lulus: `14 / 14`
- Skenario yang gagal dan tindak lanjutnya: `null`