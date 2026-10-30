// src/routes/health.routes.ts
import { Router } from "express";
import { AppDataSource } from "../config/database.config";
import {AuthMiddleware, RoleMiddleware} from "../middlewares";

const router = Router();

// Liveness — "apakah proses hidup?" (tidak menyentuh database)
/**
 * @openapi
 * /health:
 *   get:
 *     tags: [Sistem]
 *     summary: Cek apakah server hidup (liveness)
 *     security: []
 *     servers:
 *       - url: /api/v1
 *     responses:
 *       '200':
 *         description: Server hidup
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: ok }
 *                 uptime: { type: number, example: 1234.56 }
 * /health/ready:
 *   get:
 *     tags: [Sistem]
 *     summary: Cek apakah server siap melayani (database terhubung)
 *     security: []
 *     servers:
 *       - url: /api/v1
 *     responses:
 *       '200':
 *         description: Database aktif, server siap
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: ready }
 *                 database: { type: string, example: up }
 *       '503':
 *         description: Database mati, server belum siap
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: not_ready }
 *                 database: { type: string, example: down }
 */
router.get("/health", (_req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
});

// Readiness — "apakah siap melayani request?" (cek dependensi)
router.get("/health/ready", async (_req, res) => {
    try {
        await AppDataSource.query("SELECT 1");
        res.json({ status: "ready", database: "up" });
    } catch {
        res.status(503).json({ status: "not_ready", database: "down" });
    }
});
router.get("/test/crash", AuthMiddleware.authGuard, RoleMiddleware.requireRole("mentor"), () => {
    throw new Error("Crash buatan untuk uji log");
});

export default router;