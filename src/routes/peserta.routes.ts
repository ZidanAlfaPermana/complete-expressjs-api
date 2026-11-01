import { Router } from "express";
import { PesertaController, JurnalController } from "./../controllers";
import {ValidationMiddleware, AuthMiddleware, RoleMiddleware} from "../middlewares";
import {ListPesertaQueryDto, PesertaDto, UpdateProfilDto} from "../dto/peserta.dto";
import {IdParamDto} from "../dto/common.dto";

const router = Router();

/**
 * @openapi
 * /peserta/me:
 *   get:
 *     tags: [Profil]
 *     summary: Ambil profil pengguna yang sedang login
 *     description: |
 *       Mengembalikan data profil milik pengguna yang sedang login.
 *       Identitas diambil dari token, jadi tidak perlu mengirim id.
 *     responses:
 *       '200':
 *         description: Berhasil
 *         headers:
 *           X-Request-Id:
 *             $ref: '#/components/headers/XRequestId'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PesertaResponse'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '409':
 *         $ref: '#/components/responses/Conflict'
 *   patch:
 *     tags: [Profil]
 *     summary: Ubah profil pengguna yang sedang login
 *     description: |
 *       Hanya `nama`, `sekolah`, dan `telepon` yang boleh diubah.
 *       Properti lain (termasuk `role`, `email`, `password`) **ditolak dengan 422**
 *       untuk mencegah mass assignment. Minimal satu field harus diisi.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfilRequest'
 *           examples:
 *             ubahNama:
 *               summary: Ubah nama saja
 *               value:
 *                 nama: Budi Santoso Putra
 *     responses:
 *       '200':
 *         description: Profil berhasil diubah
 *         headers:
 *           X-Request-Id:
 *             $ref: '#/components/headers/XRequestId'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PesertaResponse'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '413':
 *         $ref: '#/components/responses/PayloadTooLarge'
 *       '422':
 *         $ref: '#/components/responses/ValidationError'
 *       '400':
 *         $ref: '#/components/responses/InvalidJson'
 * /peserta:
 *   get:
 *     tags: [Peserta]
 *     summary: Daftar semua peserta
 *     description: |
 *       Mendukung pagination, filter, pengurutan, dan pencarian pada nama atau email.
 *       Parameter yang tidak valid ditolak dengan 422 (tidak dikoreksi diam-diam).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/Limit'
 *       - $ref: '#/components/parameters/Order'
 *       - $ref: '#/components/parameters/Q'
 *       - $ref: '#/components/parameters/Sekolah'
 *       - $ref: '#/components/parameters/Fase'
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [nama, fase, createdAt]
 *           default: createdAt
 *       - in: query
 *         name: sekolah
 *         schema: { type: string, maxLength: 100 }
 *       - in: query
 *         name: fase
 *         schema: { type: integer, minimum: 1, maximum: 5 }
 *     responses:
 *       '200':
 *         description: Berhasil
 *         headers:
 *           X-Request-Id:
 *             $ref: '#/components/headers/XRequestId'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PesertaListResponse'
 *       '422':
 *         $ref: '#/components/responses/ValidationError'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *   post:
 *     tags: [Peserta]
 *     summary: Mendaftarkan peserta baru secara manual (khusus mentor)
 *     description: |
 *       Khusus mentor. Mendaftarkan peserta atau mentor baru secara manual,
 *       lengkap dengan role, status, dan fase. Semua field wajib diisi
 *       kecuali skillIds. Ditolak dengan 409 jika email atau kombinasi
 *       nama dan sekolah sudah terdaftar. Alamat data baru dikembalikan
 *       lewat header Location.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PesertaRequest'
 *     responses:
 *       '201':
 *         description: Peserta berhasil dibuat
 *         headers:
 *           X-Request-Id:
 *             $ref: '#/components/headers/XRequestId'
 *           Location:
 *             description: URL peserta yang baru dibuat
 *             schema:
 *               type: string
 *               example: /api/v1/peserta/12
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PesertaResponse'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '413':
 *         $ref: '#/components/responses/PayloadTooLarge'
 *       '422':
 *         $ref: '#/components/responses/ValidationError'
 *       '409':
 *         $ref: '#/components/responses/Conflict'
 *       '400':
 *         $ref: '#/components/responses/InvalidJson'
 * /peserta/{id}:
 *   get:
 *     tags: [Peserta]
 *     summary: Data peserta dengan id spesifik (mentor atau pemilik data)
 *     description: |
 *       Mengambil data satu peserta berdasarkan id. Mentor boleh melihat
 *       peserta mana pun, sedangkan peserta hanya boleh melihat datanya
 *       sendiri.
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
 *               $ref: '#/components/schemas/PesertaResponse'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *       '422':
 *         $ref: '#/components/responses/ValidationError'
 *   put:
 *     tags: [Peserta]
 *     summary: Mengubah seluruh data peserta dengan id spesifik (khusus mentor)
 *     description: |
 *       Khusus mentor. Mengganti seluruh data peserta, jadi semua field
 *       wajib dikirim ulang. Gunakan PATCH jika hanya ingin mengubah
 *       sebagian field. Ditolak dengan 409 jika email atau kombinasi
 *       nama dan sekolah bentrok dengan peserta lain.
 *     parameters:
 *       - $ref: '#/components/parameters/IdPath'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PesertaRequest'
 *     responses:
 *       '200':
 *         description: Berhasil
 *         headers:
 *           X-Request-Id:
 *             $ref: '#/components/headers/XRequestId'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PesertaResponse'
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
 *       '409':
 *         $ref: '#/components/responses/Conflict'
 *       '400':
 *         $ref: '#/components/responses/InvalidJson'
 *   patch:
 *     tags: [Peserta]
 *     summary: Mengubah sebagian data peserta dengan id spesifik (khusus mentor)
 *     description: |
 *       Khusus mentor. Mengubah sebagian data peserta, hanya field yang
 *       dikirim yang berubah. Ditolak dengan 409 jika email atau kombinasi
 *       nama dan sekolah bentrok dengan peserta lain.
 *     parameters:
 *       - $ref: '#/components/parameters/IdPath'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PesertaRequest'
 *     responses:
 *       '200':
 *         description: Berhasil
 *         headers:
 *           X-Request-Id:
 *             $ref: '#/components/headers/XRequestId'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PesertaResponse'
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
 *     tags: [Peserta]
 *     summary: Menghapus peserta dengan id spesifik (khusus mentor)
 *     description: |
 *       Khusus mentor. Menghapus peserta secara permanen. Berhasil
 *       dengan status 204 tanpa body, dan data yang sudah dihapus tidak
 *       bisa dipulihkan lewat API.
 *     parameters:
 *       - $ref: '#/components/parameters/IdPath'
 *     responses:
 *       '204':
 *         description: Peserta berhasil dihapus
 *         headers:
 *           X-Request-Id:
 *             $ref: '#/components/headers/XRequestId'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '422':
 *         $ref: '#/components/responses/ValidationError'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *       '409':
 *         description: Peserta masih punya data terkait (mis. jurnal) sehingga tidak bisa dihapus
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * /peserta/{id}/jurnal:
 *   get:
 *     tags: [Peserta]
 *     summary: Data peserta beserta jurnalnya (hanya pemilik dan mentor yang bisa melihat)
 *     description: |
 *       Mengambil data peserta beserta seluruh jurnalnya dalam satu
 *       response (jurnalList). Hanya pemilik data dan mentor yang boleh mengakses;
 *       pengguna lain mendapat 403.
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
 *               $ref: '#/components/schemas/JurnalAndPesertaResponse'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *       '422':
 *         $ref: '#/components/responses/ValidationError'
 */

router.get("/", AuthMiddleware.authGuard, RoleMiddleware.requireRole("mentor"), ValidationMiddleware.validasi(ListPesertaQueryDto, "query"), PesertaController.getSemuaPeserta);
router.get("/me", AuthMiddleware.authGuard, PesertaController.getProfilSaya);
router.patch("/me", AuthMiddleware.authGuard, ValidationMiddleware.validasi(UpdateProfilDto), PesertaController.updateProfileSaya);
router.get("/:id", AuthMiddleware.authGuard, ValidationMiddleware.validasi(IdParamDto, "params"), PesertaController.getPesertaById);
router.get("/:id/jurnal", AuthMiddleware.authGuard, ValidationMiddleware.validasi(IdParamDto, "params"), JurnalController.getJurnalPesertaById);
router.post("/", AuthMiddleware.authGuard, RoleMiddleware.requireRole("mentor"), ValidationMiddleware.validasi(PesertaDto), PesertaController.buatPeserta);
router.put("/:id", AuthMiddleware.authGuard, RoleMiddleware.requireRole("mentor"), ValidationMiddleware.validasi(IdParamDto, "params"), ValidationMiddleware.validasi(PesertaDto), PesertaController.updatePeserta);
router.patch("/:id", AuthMiddleware.authGuard, RoleMiddleware.requireRole("mentor"), ValidationMiddleware.validasi(IdParamDto, "params"), ValidationMiddleware.validasi(UpdateProfilDto), PesertaController.updateProfilePeserta);
router.delete("/:id", AuthMiddleware.authGuard, RoleMiddleware.requireRole("mentor"/*, "peserta"*/), ValidationMiddleware.validasi(IdParamDto, "params"), PesertaController.hapusPeserta);

export default router;