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
 *
 * /login:
 *   post:
 *     tags: [Auth]
 *     summary: Login dengan akun yang tersedia
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       '201':
 *         description: Login berhasil
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       '422':
 *         $ref: '#/components/responses/ValidationError'
 *       '429':
 *         $ref: '#/components/responses/TooManyRequests'
 *
 * /refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh Token akses untuk api
 *     security:
 *       - refreshAuth: []
 *     responses:
 *       '201':
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