// src/index.ts
import "reflect-metadata";
import {app} from "./app";
import { AppDataSource } from "./config/database.config";
import { config } from "./config/env.config";
import { logger } from "./utils/logger";
import type { Server } from "http";

let server: Server;

function shutdown(sinyal: string, kodeKeluar: number = 0): void {
    logger.info(`Menerima ${sinyal}, mematikan server...`);

    // Paksa keluar jika proses shutdown menggantung lebih dari 10 detik
    setTimeout(() => {
        logger.error("Shutdown paksa karena timeout");
        process.exit(1);
    }, 10_000).unref();

    // 1. Berhenti menerima request baru, tunggu request yang berjalan selesai
    server.close(async () => {
        try {
            // 2. Tutup koneksi database
            await AppDataSource.destroy();
            logger.info("Server dan koneksi database ditutup dengan rapi");
            process.exit(kodeKeluar);
        } catch (err) {
            logger.error("Gagal menutup database", { error: String(err) });
            process.exit(1);
        }
    });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// Promise ditolak tanpa .catch() — catat, jangan diam-diam hilang
process.on("unhandledRejection", (reason) => {
    logger.error("unhandledRejection", {
        error: reason instanceof Error ? reason.stack : String(reason),
    });
});

// Exception yang lolos dari semua try/catch — state proses sudah tidak bisa dipercaya
process.on("uncaughtException", (err) => {
    logger.error("uncaughtException", { error: err.stack });
    shutdown("uncaughtException", 1);
});

async function bootstrap(): Promise<void> {
    await AppDataSource.initialize();
    logger.info("Database terhubung");

    server = app.listen(config.app.port, () => {
        logger.info(`Server berjalan di http://localhost:${config.app.port}`);
    });
}

bootstrap().catch((err) => {
    logger.error("Gagal start", { error: err instanceof Error ? err.stack : String(err) });
    process.exit(1);
});