// src/middlewares/error.middleware.ts
import { Request, Response, NextFunction } from "express";
import { QueryFailedError } from "typeorm";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { AppError, ConflictError, NotFoundError } from "../utils/AppError";
import { ErrorCode } from "../utils/errorCodes";
import { logger } from "../utils/logger";
import { isProd } from "../config/env.config";

// Kode error PostgreSQL — daftar lengkap ada di dokumentasi resmi
const PG_UNIQUE_VIOLATION = "23505";       // nilai duplikat di kolom unique
const PG_FOREIGN_KEY_VIOLATION = "23503";  // relasi tidak valid / masih dipakai
const PG_INVALID_TEXT = "22P02";           // format nilai salah (mis. enum/angka)

function terjemahkanError(err: unknown): AppError {
    if (err instanceof AppError) return err;

    if (err instanceof QueryFailedError) {
        const kodePg = (err.driverError as { code?: string }).code;

        if (kodePg === PG_UNIQUE_VIOLATION) {
            return new ConflictError("Data dengan nilai yang sama sudah ada");
        }
        if (kodePg === PG_FOREIGN_KEY_VIOLATION) {
            return new ConflictError("Data berelasi dengan data lain (tidak ditemukan atau masih dipakai)");
        }
        if (kodePg === PG_INVALID_TEXT) {
            return new AppError("Format nilai tidak valid", 400, ErrorCode.VALIDATION_ERROR);
        }
    }

    // TokenExpiredError turunan dari JsonWebTokenError → periksa yang spesifik dulu
    if (err instanceof TokenExpiredError) {
        return new AppError("Token sudah kedaluwarsa", 401, ErrorCode.TOKEN_EXPIRED);
    }
    if (err instanceof JsonWebTokenError) {
        return new AppError("Token tidak valid", 401, ErrorCode.INVALID_TOKEN);
    }

    // express.json() melempar error bertipe ini saat body JSON rusak
    if (
        typeof err === "object" &&
        err !== null &&
        (err as { type?: string }).type === "entity.parse.failed"
    ) {
        return new AppError("Format JSON pada body tidak valid", 400, ErrorCode.INVALID_JSON);
    }

    // Tidak dikenali → anggap bug server. Jangan bocorkan isinya ke client.
    return new AppError("Terjadi kesalahan di server", 500, ErrorCode.INTERNAL_ERROR);
}

export function errorHandler(
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction
): void {
    // Jika response sudah mulai terkirim, serahkan ke handler bawaan Express
    if (res.headersSent) {
        next(err);
        return;
    }

    const appErr = terjemahkanError(err);

    const info = {
        requestId: req.requestId,
        method: req.method,
        url: req.originalUrl,
        status: appErr.statusCode,
        kode: appErr.kode,
        userId: req.user?.id,
    };

    // 5xx = salah kita (error), 4xx = salah client (warn)
    if (appErr.statusCode >= 500) {
        logger.error(appErr.message, {
            ...info,
            stack: err instanceof Error ? err.stack : String(err),
        });
    } else {
        logger.warn(appErr.message, info);
    }

    res.status(appErr.statusCode).json({
        sukses: false,
        error: {
            kode: appErr.kode,
            pesan: appErr.message,
            ...(appErr.detail !== undefined && { detail: appErr.detail }),
            // Detail teknis HANYA di development
            ...(!isProd &&
                err instanceof Error && { debug: { asli: err.message, stack: err.stack } }),
        },
        requestId: req.requestId,
    });
}

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
    next(new NotFoundError(`Route ${req.method} ${req.originalUrl}`));
}