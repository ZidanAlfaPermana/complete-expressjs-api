
# Minggu 14 - Hari Senin

## Soal 1

Di API-mu, kirim body {"nama": 123, "email": true} ke endpoint register yang masih
memakai validasi manual. Catat apa yang terjadi (lolos? crash? error aneh?).

### Response:

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
            },
            {
                "field": "nama",
                "pesan": "Nama wajib diisi, minimal 3 karakter"
            },
            {
                "field": "sekolah",
                "pesan": "Sekolah wajib diisi"
            },
            {
                "field": "password",
                "pesan": "Password harus diisi, tidak boleh kosong"
            }
        ],
        "debug": {
            "asli": "Validasi gagal",
            "stack": "ValidationError: Validasi gagal\n    at validasiRegister (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\src\\middlewares\\validasi.middleware.ts:182:14)\n    at Layer.handleRequest (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\lib\\layer.js:152:17)\n    at next (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\lib\\route.js:157:13)\n    at Route.dispatch (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\lib\\route.js:117:3)\n    at handle (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\index.js:435:11)\n    at Layer.handleRequest (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\lib\\layer.js:152:17)\n    at D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\index.js:295:15\n    at processParams (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\index.js:582:12)\n    at next (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\index.js:291:5)\n    at router.handle (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\index.js:186:3)"
        }
    },
    "requestId": "757306cb-5811-4852-a1fe-8d8677fb13bc"
}
```

## Soal 2

Install class-validator dan class-transformer.
Pastikan experimentalDecorators dan emitDecoratorMetadata aktif.
Jalankan npm ls express dan catat versimu.

### Response:

```text
api-magang-new@1.0.0 D:\ZIDAN\PKL TOP SECRET\api-magang-new
+-- express-rate-limit@8.7.1
| `-- express@5.2.1 deduped
`-- express@5.2.1
```

## Soal 4
payload mana yang menghasilkan array kosong? Apakah properti "role" ditolak
atau diam-diam diabaikan?

### Response:

```text
payload yang menghasilkan array kosong adalah valid json, properti role ditolak
```

## Soal 6
Dari callout "Catatan Versi Express", tulis dengan bahasamu sendiri 3 perbedaan
yang menurutmu paling berpengaruh pada proyekmu.

### Response:

```text
perbedaan yang paling mencolok pada versi Express 5 adalah
1. Error di handler async ditangani otomatis
2. Penulisan path route berubah.
3. req.body bisa undefined
```

# Minggu 14 - Hari Selasa

## Soal 6:
`kenapa value: false penting?`

Secara default class-validator menyertakan nilai asli yang gagal validasi di objek error. Untuk field password, itu berarti password plaintext bisa ikut bocor ke response atau log. value: false (dan target: false) mencegahnya.

## Soal 7: 
`kenapa decorator tidak boleh dihapus?`

class-validator hanya mengenali properti yang punya decorator. Properti tanpa decorator dianggap tidak dikenal: nilainya dibuang diam-diam (whitelist) atau request ditolak (forbidNonWhitelisted).