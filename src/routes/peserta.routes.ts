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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfilRequest'
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
 * /peserta:
 *   get:
 *     tags: [Peserta]
 *     summary: Daftar semua peserta
 *     security: []
 *     parameters:
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/Limit'
 *       - $ref: '#/components/parameters/Order'
 *       - $ref: '#/components/parameters/Q'
 *       - $ref: '#/components/parameters/Sekolah'
 *       - $ref: '#/components/parameters/Fase'
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
 *   post:
 *     tags: [Peserta]
 *     summary: Mendaftarkan peserta baru secara manual (khusus mentor)
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
 * /peserta/{id}:
 *   get:
 *     tags: [Peserta]
 *     summary: Data peserta dengan id spesifik (mentor atau pemilik data)
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
 *   patch:
 *     tags: [Peserta]
 *     summary: Mengubah sebagian data peserta dengan id spesifik (khusus mentor)
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
 *   delete:
 *     tags: [Peserta]
 *     summary: Menghapus peserta dengan id spesifik (khusus mentor)
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
 * /peserta/{id}/jurnal:
 *   get:
 *     tags: [Peserta]
 *     summary: Data peserta beserta jurnalnya (hanya pemilik dan mentor yang bisa melihat)
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

router.get("/", ValidationMiddleware.validasi(ListPesertaQueryDto, "query"), PesertaController.getSemuaPeserta);
router.get("/me", AuthMiddleware.authGuard, PesertaController.getProfilSaya);
router.patch("/me", AuthMiddleware.authGuard, ValidationMiddleware.validasi(UpdateProfilDto), PesertaController.updateProfileSaya);
router.get("/:id", AuthMiddleware.authGuard, ValidationMiddleware.validasi(IdParamDto, "params"), PesertaController.getPesertaById);
router.get("/:id/jurnal", AuthMiddleware.authGuard, ValidationMiddleware.validasi(IdParamDto, "params"), JurnalController.getJurnalPesertaById);
router.post("/", AuthMiddleware.authGuard, RoleMiddleware.requireRole("mentor"), ValidationMiddleware.validasi(PesertaDto), PesertaController.buatPeserta);
router.put("/:id", AuthMiddleware.authGuard, RoleMiddleware.requireRole("mentor"), ValidationMiddleware.validasi(IdParamDto, "params"), ValidationMiddleware.validasi(PesertaDto), PesertaController.updatePeserta);
router.patch("/:id", AuthMiddleware.authGuard, RoleMiddleware.requireRole("mentor"), ValidationMiddleware.validasi(IdParamDto, "params"), ValidationMiddleware.validasi(UpdateProfilDto), PesertaController.updateProfilePeserta);
router.delete("/:id", AuthMiddleware.authGuard, RoleMiddleware.requireRole("mentor"/*, "peserta"*/), ValidationMiddleware.validasi(IdParamDto, "params"), PesertaController.hapusPeserta);

export default router;