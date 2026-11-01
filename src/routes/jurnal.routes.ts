import { Router } from "express";
import { JurnalController } from "../controllers";
import { ValidationMiddleware, AuthMiddleware, RoleMiddleware } from "../middlewares";
import {JurnalDto, ListJurnalQueryDto, ReviewJurnalDto, UpdateJurnalDto} from "../dto/jurnal.dto";
import {IdParamDto} from "../dto/common.dto";

const router = Router();

/**
 * @openapi
 * /jurnal/me:
 *   get:
 *     tags: [Jurnal]
 *     summary: Daftar jurnal milik pengguna yang sedang login
 *     description: |
 *       Mengembalikan semua jurnal milik pengguna yang sedang login.
 *       Identitas diambil dari token. Response memuat jumlah total
 *       jurnal dan tidak memakai pagination.
 *     responses:
 *       '200':
 *         description: Berhasil
 *         headers:
 *           X-Request-Id:
 *             $ref: '#/components/headers/XRequestId'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JurnalListTotalResponse'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 * /jurnal/peserta:
 *   get:
 *     tags: [Jurnal]
 *     summary: Daftar peserta beserta jurnalnya (khusus mentor)
 *     description: |
 *       Khusus mentor. Mengembalikan daftar peserta beserta jurnal
 *       masing-masing, berguna untuk melihat perkembangan seluruh peserta
 *       sekaligus. Response memuat jumlah total dan tidak memakai
 *       pagination.
 *     responses:
 *       '200':
 *         description: Berhasil
 *         headers:
 *           X-Request-Id:
 *             $ref: '#/components/headers/XRequestId'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JurnalAndPesertaListResponse'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 * /jurnal:
 *   get:
 *     tags: [Jurnal]
 *     summary: Daftar semua jurnal (khusus mentor)
 *     description: |
 *       Khusus mentor. Daftar semua jurnal dengan pagination, pengurutan,
 *       dan filter (peserta, status review, rentang tanggal).
 *       Rentang tanggal memakai format YYYY-MM-DD dan bersifat inklusif:
 *       from dihitung sejak 00:00 dan to sampai 23:59 pada hari itu.
 *       Parameter belumDireview=true sama dengan statusReview=belum;
 *       jika keduanya dikirim, statusReview yang dipakai.
 *     parameters:
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/Limit'
 *       - $ref: '#/components/parameters/Order'
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [createdAt, statusReview], default: createdAt }
 *       - in: query
 *         name: pesertaId
 *         schema: { type: integer, minimum: 1 }
 *       - in: query
 *         name: statusReview
 *         schema: { type: string, enum: [belum, sudah] }
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: belumDireview
 *         schema: { type: boolean }
 *     responses:
 *       '200':
 *         description: Berhasil
 *         headers:
 *           X-Request-Id:
 *             $ref: '#/components/headers/XRequestId'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JurnalListResponse'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '422':
 *         $ref: '#/components/responses/ValidationError'
 *   post:
 *     tags: [Jurnal]
 *     summary: Membuat jurnal baru
 *     description: |
 *       Membuat jurnal harian baru untuk pengguna yang sedang login.
 *       Pemilik jurnal diambil dari token, bukan dari body. Kegiatan dan
 *       rencana besok wajib diisi, lampiran maksimal 5 item.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateJurnalRequest'
 *           examples:
 *             sederhana:
 *               summary: Tanpa lampiran
 *               value:
 *                 kegiatan: Belajar unit testing dengan Jest dan Supertest
 *             denganLampiran:
 *               summary: Dengan lampiran tangkapan layar
 *               value:
 *                 kegiatan: Menulis test untuk DTO dan service
 *                 hambatan: Bingung cara mock repository
 *                 linkCommit: https://github.com/budi/api-magang/commit/abc123
 *                 lampiran:
 *                   - url: https://contoh.com/ss1.png
 *                     keterangan: Hasil npm test
 *     responses:
 *       '201':
 *         description: Jurnal berhasil dibuat
 *         headers:
 *           X-Request-Id:
 *             $ref: '#/components/headers/XRequestId'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JurnalResponse'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '413':
 *         $ref: '#/components/responses/PayloadTooLarge'
 *       '422':
 *         $ref: '#/components/responses/ValidationError'
 *       '400':
 *         $ref: '#/components/responses/InvalidJson'
 * /jurnal/{id}:
 *   get:
 *     tags: [Jurnal]
 *     summary: Detail jurnal berdasarkan id
 *     description: |
 *       Mengambil satu jurnal berdasarkan id. Mentor boleh melihat jurnal
 *       mana pun, sedangkan peserta hanya boleh melihat jurnalnya sendiri.
 *     parameters:
 *       - $ref: '#/components/parameters/IdPath'
 *     responses:
 *       '200':
 *         description: Berhasil
 *         headers:
 *           X-Request-Id:
 *             $ref: '#/components/headers/XRequestId'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JurnalResponse'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *       '422':
 *         $ref: '#/components/responses/ValidationError'
 *   put:
 *     tags: [Jurnal]
 *     summary: Mengubah seluruh isi jurnal (semua field wajib dikirim ulang)
 *     description: |
 *       Mengganti seluruh isi jurnal, jadi field wajib (kegiatan dan
 *       rencanaBesok) harus dikirim ulang. Gunakan PATCH jika hanya ingin
 *       mengubah sebagian field. Hanya pemilik jurnal atau mentor yang
 *       boleh mengubah.
 *     parameters:
 *       - $ref: '#/components/parameters/IdPath'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateJurnalRequest'
 *     responses:
 *       '200':
 *         description: Jurnal berhasil diubah
 *         headers:
 *           X-Request-Id:
 *             $ref: '#/components/headers/XRequestId'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JurnalResponse'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *       '413':
 *         $ref: '#/components/responses/PayloadTooLarge'
 *       '422':
 *         $ref: '#/components/responses/ValidationError'
 *       '400':
 *         $ref: '#/components/responses/InvalidJson'
 *   patch:
 *     tags: [Jurnal]
 *     summary: Mengubah sebagian isi jurnal
 *     description: |
 *       Mengubah sebagian isi jurnal, hanya field yang dikirim yang
 *       berubah. Hanya pemilik jurnal atau mentor yang boleh mengubah.
 *     parameters:
 *       - $ref: '#/components/parameters/IdPath'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateJurnalRequest'
 *           examples:
 *             ubahKegiatan:
 *               summary: Mengubah satu field
 *               value:
 *                 kegiatan: Menulis test untuk DTO, service, dan controller jurnal
 *             ubahBeberapaField:
 *               summary: Mengubah hambatan dan lampiran
 *               value:
 *                 hambatan: Mock repository sudah teratasi
 *                 lampiran:
 *                   - url: https://contoh.com/ss2.png
 *                     keterangan: Hasil npm run test:coverage
 *     responses:
 *       '200':
 *         description: Jurnal berhasil diubah
 *         headers:
 *           X-Request-Id:
 *             $ref: '#/components/headers/XRequestId'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JurnalResponse'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *       '413':
 *         $ref: '#/components/responses/PayloadTooLarge'
 *       '422':
 *         $ref: '#/components/responses/ValidationError'
 *       '400':
 *         $ref: '#/components/responses/InvalidJson'
 *   delete:
 *     tags: [Jurnal]
 *     summary: Menghapus jurnal
 *     description: |
 *       Menghapus jurnal secara permanen. Hanya pemilik jurnal atau mentor
 *       yang boleh menghapus. Berhasil dengan status 204 tanpa body.
 *     parameters:
 *       - $ref: '#/components/parameters/IdPath'
 *     responses:
 *       '204':
 *         description: Jurnal berhasil dihapus
 *         headers:
 *           X-Request-Id:
 *             $ref: '#/components/headers/XRequestId'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *       '422':
 *         $ref: '#/components/responses/ValidationError'
 * /jurnal/{id}/review:
 *   patch:
 *     tags: [Jurnal]
 *     summary: Menandai status review jurnal (khusus mentor)
 *     description: |
 *       Khusus mentor. Menandai jurnal sebagai sudah atau belum direview.
 *       Catatan wajib diisi (minimal 5 karakter) saat statusReview
 *       bernilai sudah, dan boleh dikosongkan saat bernilai belum.
 *     parameters:
 *       - $ref: '#/components/parameters/IdPath'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReviewJurnalRequest'
 *           examples:
 *             tandaiSudah:
 *               summary: Tandai sudah direview (catatan wajib)
 *               value:
 *                 statusReview: sudah
 *                 catatan: Sudah bagus, lanjutkan ke tahap integrasi
 *             tandaiBelum:
 *               summary: Kembalikan ke belum direview
 *               value:
 *                 statusReview: belum
 *     responses:
 *       '200':
 *         description: Status review berhasil diubah
 *         headers:
 *           X-Request-Id:
 *             $ref: '#/components/headers/XRequestId'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JurnalResponse'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *       '413':
 *         $ref: '#/components/responses/PayloadTooLarge'
 *       '422':
 *         description: Input tidak lolos validasi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               catatanKosong:
 *                 summary: Menandai sudah tanpa catatan
 *                 value:
 *                   sukses: false
 *                   error:
 *                     kode: VALIDATION_ERROR
 *                     pesan: Validasi gagal
 *                     detail:
 *                       - field: catatan
 *                         pesan: Catatan wajib diisi saat jurnal ditandai sudah direview
 *                   requestId: b7a1c9e2-4f6d-4a9b-8d3e-1c2f5a7e9b10
 *       '400':
 *         $ref: '#/components/responses/InvalidJson'
 */

router.use(AuthMiddleware.authGuard);

router.get("/me", AuthMiddleware.authGuard, RoleMiddleware.requireRole("mentor", "peserta"), JurnalController.getJurnalSaya);
router.get("/", AuthMiddleware.authGuard, RoleMiddleware.requireRole("mentor"), ValidationMiddleware.validasi(ListJurnalQueryDto, "query"), JurnalController.getSemuaJurnal);
router.get("/peserta", AuthMiddleware.authGuard, RoleMiddleware.requireRole("mentor"), JurnalController.getJurnalDenganPeserta);

router.get("/:id", ValidationMiddleware.validasi(IdParamDto, "params"), JurnalController.getJurnalById);
router.post("/", AuthMiddleware.authGuard, RoleMiddleware.requireRole("mentor", "peserta"), ValidationMiddleware.validasi(JurnalDto), JurnalController.buatJurnal);
router.put("/:id", ValidationMiddleware.validasi(IdParamDto, "params"), ValidationMiddleware.validasi(JurnalDto), JurnalController.updateJurnal);
router.patch("/:id", ValidationMiddleware.validasi(IdParamDto, "params"), ValidationMiddleware.validasi(UpdateJurnalDto), JurnalController.updateJurnalBeberapa);
router.patch("/:id/review", AuthMiddleware.authGuard, RoleMiddleware.requireRole("mentor"), ValidationMiddleware.validasi(IdParamDto, "params"), ValidationMiddleware.validasi(ReviewJurnalDto), JurnalController.updateReviewJurnal);
router.delete("/:id", ValidationMiddleware.validasi(IdParamDto, "params"), JurnalController.hapusJurnal);

export default router;