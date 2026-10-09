// src/middlewares/rateLimit.middleware.ts
import rateLimit from "express-rate-limit";
import { AppError } from "../utils/AppError";
import { ErrorCode } from "../utils/errorCodes";

export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,   // jendela 15 menit
    limit: 10,                  // maksimal 10 percobaan per IP
    standardHeaders: true,      // kirim header RateLimit-* ke client
    legacyHeaders: false,
    // Teruskan ke errorHandler supaya format error tetap seragam
    handler: (_req, _res, next) => {
        next(new AppError("Terlalu banyak percobaan, coba lagi nanti", 429, ErrorCode.RATE_LIMITED));
    },
});
