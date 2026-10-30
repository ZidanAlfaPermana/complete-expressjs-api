// src/app.ts — urutan middleware sekarang
import helmet from "helmet";
import cors from "cors";
import { requestId } from "./middlewares/requestId.middleware";
import {requestLogger} from "./middlewares/logger.middleware";
import {Application} from "express";
import healthRoutes from "./routes/health.routes";
import routes from "./routes";
import {errorHandler, notFoundHandler} from "./middlewares/error.middleware";
import {config} from "./config/env.config";
import express from "express";
import swaggerUi from "swagger-ui-express";
import { spec } from "./docs/swagger";

export const app: Application = express();

app.use(requestId);                                  // 1. beri ID dulu, supaya semua log punya ID
if (config.docs.enabled) {
    // Dokumen mentah (JSON) — dipakai Postman dan generator tipe
    app.get("/api/docs.json", (_req, res) => {
        res.json(spec);
    });

    app.use(helmet())

    // Dipasang sebelum helmet global: CSP bawaan helmet bisa memblokir aset Swagger UI
    app.use(
        "/api/docs",
        helmet({ contentSecurityPolicy: false }),
        swaggerUi.serve,
        swaggerUi.setup(spec, {
            customSiteTitle: "API Magang Batch 4 — Dokumentasi",
            swaggerOptions: { persistAuthorization: true, docExpansion: "list" },
        })
    );
}

app.use(helmet());                                   // 2. security header standar
app.use(cors({
    origin: config.cors.origins,                       //    daftar origin yang diizinkan
    credentials: true,
}));
app.use(express.json({ limit: "1mb" }));             // 3. batasi ukuran body
app.use(requestLogger);                              // 4. log request
app.use("/api/v1", healthRoutes);
app.use("/api/v1", routes);                             // 5. route aplikasi
app.use(notFoundHandler);                            // 6. 404
app.use(errorHandler);                               // 7. error handler PALING AKHIR