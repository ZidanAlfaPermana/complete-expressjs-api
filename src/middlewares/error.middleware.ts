import { Request, Response, NextFunction } from "express";
import {
    AppError,
    ConflictError,
    ForbiddenError,
    NotFoundError,
    UnauthorizedError,
    ValidationError
} from "../utils/AppError";

const isDev = process.env.NODE_ENV === "development";

export function errorHandler(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
): void {
    if (err.isOperational) {
        res.status(err.statusCode).json({
            sukses: false,
            pesan: err.message, // Menampilkan "Email atau password salah"
            errors: []
        });
        return;
    }

    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            sukses: false,
            error: err.message,
            ...(err instanceof ValidationError && { detail: err.detail }),
            ...(isDev && { stack: err.stack })
        });
        return;
    }

    // Error yang kita buat sendiri
    if (err instanceof ValidationError) {
        res.status(err.statusCode).json({
            sukses: false,
            error: err.message,
            detail: err.detail,
        });
        return;
    }

    // Error yang kita buat sendiri
    if (err instanceof UnauthorizedError) {
        res.status(err.statusCode).json({
            sukses: false,
            error: "Tidak memiliki izin untuk mengakses API ini",
            ...(isDev && { stack: err.stack })
        });
        return;
    }

    // Error yang kita buat sendiri
    if (err instanceof ForbiddenError) {
        res.status(err.statusCode).json({
            sukses: false,
            error: "Izin API ini terbatas",
            ...(isDev && { stack: err.stack })
        });
        return;
    }

    // Error yang kita buat sendiri
    if (err instanceof ConflictError) {
        res.status(err.statusCode).json({
            sukses: false,
            error: err.message,
            ...(isDev && { stack: err.stack })
        });
        return;
    }

    console.error("[UNEXPECTED ERROR]", err);

    res.status(500).json({
        sukses: false,
        error: "Terjadi kesalahan di server",
        ...(isDev && {
            detail: err.message,
            stack: err.stack,
        }),
    });
}

export function notFoundHandler(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void {
    if (err instanceof NotFoundError) {
        res.status(err.statusCode).json({
            sukses: false,
            error: "API ini tidak ditemukan",
        });
        return;
    }
    console.error("[UNEXPECTED ERROR]", err);

    res.status(500).json({
        sukses: false,
        error: "Terjadi kesalahan di server",
        ...(isDev && {
            detail: err.message,
            stack: err.stack,
        }),
    });
}