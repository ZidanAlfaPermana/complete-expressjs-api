import { Router } from "express";
import { AuthController } from "../controllers";
import { validasi } from "../middlewares/validasi.middleware";
import {loginLimiter} from "../middlewares/rateLimit.middleware";
import {LoginDto/*, RefreshTokenDto*/, RegisterDto} from "../dto/auth.dto";

const router = Router();
/**
 * @openapi
 * /register:
 *   post:
 *     tags: [Auth]
 *     summary: Registrasi peserta baru
 *     description: |
 *       Membuat akun dengan role `peserta`.
 *       - Email dinormalkan (spasi tepi dibuang, huruf kecil), sehingga
 *         `Budi@Mail.com` dan `budi@mail.com` dianggap email yang sama.
 *       - Properti di luar yang tercantum ditolak (422).
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       '201':
 *         description: Registrasi berhasil
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PesertaResponse'
 *       '409':
 *         $ref: '#/components/responses/Conflict'
 *       '422':
 *         $ref: '#/components/responses/ValidationError'
 *       '400':
 *         $ref: '#/components/responses/InvalidJson'
 *
 * /login:
 *   post:
 *     tags: [Auth]
 *     summary: Login dengan akun yang tersedia
 *     security: []
 *     description: |
 *       Pesan error SAMA untuk email yang tidak terdaftar maupun password yang salah
 *       (supaya penyerang tidak bisa menebak email mana yang valid).
 *       Dibatasi 10 percobaan per 15 menit per IP.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       '200':
 *         description: Login berhasil
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       '422':
 *         $ref: '#/components/responses/ValidationError'
 *       '429':
 *          $ref: '#/components/responses/TooManyRequests'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '400':
 *         $ref: '#/components/responses/InvalidJson'
 *
 * /refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh Token akses untuk api
 *     description: |
 *       Menukar refresh token dengan access token baru. Kirim refresh token
 *       lewat header Authorization (Bearer), bukan lewat body.
 *       Access token berlaku 15 menit, refresh token berlaku 7 hari.
 *     security:
 *       - refreshAuth: []
 *     responses:
 *       '200':
 *         description: Refresh Token berhasil
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RefreshResponse'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *
 * /logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout akun yang sedang login
 *     description: |
 *       Mengakhiri sesi dengan mencabut refresh token yang dikirim lewat
 *       header Authorization (Bearer). Setelah logout, refresh token itu
 *       tidak bisa lagi ditukar dengan access token baru.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '204':
 *         description: Logout akun berhasil
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PesanResponse'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 */

// src/routes/auth.routes.ts
router.post("/register", validasi(RegisterDto), AuthController.register);
router.post("/login", loginLimiter, validasi(LoginDto), AuthController.login);
router.post("/refresh", AuthController.refresh);
router.post("/logout", AuthController.logout);

export default router;