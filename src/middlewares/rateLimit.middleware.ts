// src/middlewares/rateLimit.middleware.ts
import rateLimit from "express-rate-limit";
import { AppError } from "../utils/AppError";
import { ErrorCode } from "../utils/errorCodes";

export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV === "test",
    handler: (req, res) => {
        res.status(429).json({
            sukses: false,
            error: { kode: "RATE_LIMITED", pesan: "Terlalu banyak percobaan, coba lagi nanti" },
        });
    },
});
