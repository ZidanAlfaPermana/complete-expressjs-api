# Dokumentasi Kode Error

| Kode | Status HTTP | Kapan terjadi | Contoh response |
|------|-------------|---------------|-----------------|
| `VALIDATION_ERROR` | 422 | Body request gagal divalidasi oleh middleware validasi (`validasiPeserta`, `validasiJurnal`, `validasiMentor`, `validasiSkill`, `validasiRegister`, `validasiLogin`) | Lihat [VALIDATION_ERROR](#validation_error) |
| `INVALID_JSON` | 400 | Body request berupa JSON yang rusak sehingga gagal di-parse oleh `express.json()` | Lihat [INVALID_JSON](#invalid_json) |
| `TOKEN_EXPIRED` | 401 | Token JWT sudah kedaluwarsa | Lihat [TOKEN_EXPIRED](#token_expired) |
| `INVALID_TOKEN` | 401 | Token JWT tidak valid, misalnya salah format atau signature tidak cocok | Lihat [INVALID_TOKEN](#invalid_token) |
| `FORBIDDEN` | 403 | User sudah login tetapi tidak berhak, misalnya role salah (`requireRole`) atau mengubah jurnal milik orang lain (ownership check `updateJurnal`) | Lihat [FORBIDDEN](#forbidden) |
| `NOT_FOUND` | 404 | Data dengan ID yang diminta tidak ada, atau route tidak terdaftar | Lihat [NOT_FOUND](#not_found) |
| `CONFLICT` | 409 | Nilai duplikat di kolom unique (PostgreSQL `23505`, misalnya email sudah terdaftar) atau data masih berelasi dengan data lain (PostgreSQL `23503`, misalnya menghapus peserta yang masih punya jurnal) | Lihat [CONFLICT](#conflict) |
| `INTERNAL_ERROR` | 500 | Error yang tidak dikenali (bug server). Isi error asli tidak dikirim ke client | Lihat [INTERNAL_ERROR](#internal_error) |

## Contoh Response

### VALIDATION_ERROR

```json
{
  "sukses": false,
  "error": {
    "kode": "VALIDATION_ERROR",
    "pesan": "Validasi gagal",
    "detail": [
      {
        "field": "nama",
        "pesan": "Nama wajib diisi, minimal 3 karakter"
      },
      {
        "field": "sekolah",
        "pesan": "Sekolah wajib diisi"
      },
      {
        "field": "email",
        "pesan": "Email wajib diisi dan formatnya harus valid (contoh: mentor@gmail.com)"
      },
      {
        "field": "status",
        "pesan": "Status tidak valid. harus berisi aktif, lulus, atau berhenti"
      },
      {
        "field": "telepon",
        "pesan": "Telepon wajib diisi, tidak boleh kosong"
      },
      {
        "field": "fase",
        "pesan": "Fase wajib diisi, dan fase hanya ada fase 1 sampai 5"
      },
      {
        "field": "role",
        "pesan": "Role wajib diisi, dengan memilih role peserta atau mentor"
      },
      {
        "field": "password",
        "pesan": "Password harus diisi, tidak boleh kosong"
      }
    ],
    "debug": {
      "asli": "Validasi gagal",
      "stack": "ValidationError: Validasi gagal\n    at validasiPeserta (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\src\\middlewares\\validasi.middleware.ts:59:14)\n    at Layer.handleRequest (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\lib\\layer.js:152:17)\n    at next (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\lib\\route.js:157:13)\n    at authGuard (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\src\\middlewares\\auth.middleware.ts:25:9)\n    at Layer.handleRequest (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\lib\\layer.js:152:17)\n    at next (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\lib\\route.js:157:13)\n    at Route.dispatch (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\lib\\route.js:117:3)\n    at handle (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\index.js:435:11)\n    at Layer.handleRequest (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\lib\\layer.js:152:17)\n    at D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\index.js:295:15"
    }
  }
}
```

### INVALID_JSON

```json
{
  "sukses": false,
  "error": {
    "kode": "INVALID_JSON",
    "pesan": "Format JSON pada body tidak valid",
    "debug": {
      "asli": "Expected property name or '}' in JSON at position 7 (line 3 column 1)",
      "stack": "SyntaxError: Expected property name or '}' in JSON at position 7 (line 3 column 1)\n    at JSON.parse (<anonymous>)\n    at parse (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\body-parser\\lib\\types\\json.js:91:21)\n    at D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\body-parser\\lib\\read.js:162:18\n    at AsyncResource.runInAsyncScope (node:async_hooks:227:14)\n    at invokeCallback (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\raw-body\\index.js:238:16)\n    at done (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\raw-body\\index.js:227:7)\n    at IncomingMessage.onEnd (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\raw-body\\index.js:287:7)\n    at IncomingMessage.emit (node:events:509:28)\n    at IncomingMessage.emit (node:domain:489:12)\n    at endReadableNT (node:internal/streams/readable:1729:12)"
    }
  }
}
```

### TOKEN_EXPIRED

```json
{
  "sukses": false,
  "error": {
    "kode": "UNAUTHORIZED",
    "pesan": "Token tidak valid atau sudah kedaluwarsa",
    "debug": {
      "asli": "Token tidak valid atau sudah kedaluwarsa",
      "stack": "UnauthorizedError: Token tidak valid atau sudah kedaluwarsa\n    at authGuard (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\src\\middlewares\\auth.middleware.ts:27:15)\n    at Layer.handleRequest (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\lib\\layer.js:152:17)\n    at next (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\lib\\route.js:157:13)\n    at Route.dispatch (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\lib\\route.js:117:3)\n    at handle (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\index.js:435:11)\n    at Layer.handleRequest (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\lib\\layer.js:152:17)\n    at D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\index.js:295:15\n    at processParams (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\index.js:582:12)\n    at next (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\index.js:291:5)\n    at router.handle (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\index.js:186:3)"
    }
  }
}
```

### INVALID_TOKEN

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
  }
}
```

### FORBIDDEN

```json
{
  "sukses": false,
  "error": {
    "kode": "FORBIDDEN",
    "pesan": "Aksi ini hanya untuk: mentor",
    "debug": {
      "asli": "Aksi ini hanya untuk: mentor",
      "stack": "ForbiddenError: Aksi ini hanya untuk: mentor\n    at D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\src\\middlewares\\role.middleware.ts:11:19\n    at Layer.handleRequest (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\lib\\layer.js:152:17)\n    at next (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\lib\\route.js:157:13)\n    at Route.dispatch (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\lib\\route.js:117:3)\n    at handle (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\index.js:435:11)\n    at Layer.handleRequest (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\lib\\layer.js:152:17)\n    at D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\index.js:295:15\n    at processParams (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\index.js:582:12)\n    at next (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\index.js:291:5)\n    at authGuard (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\src\\middlewares\\auth.middleware.ts:25:9)"
    }
  }
}
```

### NOT_FOUND

```json
{
  "sukses": false,
  "error": {
    "kode": "NOT_FOUND",
    "pesan": "Route GET /api/ tidak ditemukan",
    "debug": {
      "asli": "Route GET /api/ tidak ditemukan",
      "stack": "NotFoundError: Route GET /api/ tidak ditemukan\n    at notFoundHandler (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\src\\middlewares\\error.middleware.ts:101:10)\n    at Layer.handleRequest (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\lib\\layer.js:152:17)\n    at trimPrefix (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\index.js:342:13)\n    at D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\index.js:297:9\n    at processParams (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\index.js:582:12)\n    at Immediate.next (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\index.js:291:5)\n    at Immediate._onImmediate (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\index.js:688:15)\n    at processImmediate (node:internal/timers:506:21)"
    }
  }
}
```

### CONFLICT

Nama sudah terdaftar:

```json
{
  "sukses": false,
  "error": {
    "kode": "CONFLICT",
    "pesan": "Peserta bernama Feri dari sekolah SMKN 1 Malang sudah terdaftar!",
    "debug": {
      "asli": "Peserta bernama Feri dari sekolah SMKN 1 Malang sudah terdaftar!",
      "stack": "ConflictError: Peserta bernama Feri dari sekolah SMKN 1 Malang sudah terdaftar!\n    at PesertaService.buatPeserta (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\src\\services\\peserta.service.ts:47:19)\n    at processTicksAndRejections (node:internal/process/task_queues:104:5)\n    at async D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\src\\controllers\\peserta.controller.ts:48:25"
    }
  }
}
```

### INTERNAL_ERROR

Di production, tidak ada pesan asli maupun stack trace:

```json
{
  "sukses": false,
  "error": {
    "kode": "NOT_FOUND",
    "pesan": "Route DELETE /api/ tidak ditemukan"
  }
}
```

Di development, ada tambahan `debug`:

```json
{
  "sukses": false,
  "error": {
    "kode": "NOT_FOUND",
    "pesan": "Route GET /api/jur tidak ditemukan",
    "debug": {
      "asli": "Route GET /api/jur tidak ditemukan",
      "stack": "NotFoundError: Route GET /api/jur tidak ditemukan\n    at notFoundHandler (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\src\\middlewares\\error.middleware.ts:101:10)\n    at Layer.handleRequest (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\lib\\layer.js:152:17)\n    at trimPrefix (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\index.js:342:13)\n    at D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\index.js:297:9\n    at processParams (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\index.js:582:12)\n    at Immediate.next (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\index.js:291:5)\n    at Immediate._onImmediate (D:\\ZIDAN\\PKL TOP SECRET\\api-magang-new\\node_modules\\router\\index.js:688:15)\n    at processImmediate (node:internal/timers:506:21)"
    }
  }
}
```

## Perbedaan 401 dan 403

| Status | Arti | Dipakai untuk |
|--------|------|---------------|
| 401 | Identitas tidak terbukti | Token hilang, token invalid, token expired, login gagal |
| 403 | Identitas jelas tetapi tidak punya izin | Role tidak sesuai (`requireRole`), bukan pemilik jurnal (`updateJurnal`) |