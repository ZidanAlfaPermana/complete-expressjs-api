// tests/http/kontrak-api.test.ts
import request from "supertest";
import jwt from "jsonwebtoken";
import { app } from "../../src/app";
import { bearer, tokenMentor, tokenPeserta } from "../helpers/token";

// Ganti modul services dengan tiruan. Sesuaikan path dan nama method dengan kodemu.
// Penting: mock modul yang DI-IMPORT oleh controller-mu.
jest.mock("../../src/services", () => ({
    pesertaService: {
        getSemuaPeserta: jest.fn(),
        getPesertaById: jest.fn(),
        getPesertaDenganJurnal: jest.fn(),
        getTotalPeserta: jest.fn(),
        buatPeserta: jest.fn(),
        updatePeserta: jest.fn(),
        updatePesertaBeberapa: jest.fn(),
        ubahProfil: jest.fn(),
        hapusPeserta: jest.fn(),
    },
    jurnalService: {
        getSemuaJurnal: jest.fn(),
        getJurnalById: jest.fn(),
        getJurnalByPesertaId: jest.fn(),
        getJurnalDenganPeserta: jest.fn(),
        getTotalJurnal: jest.fn(),
        getTotalJurnalBelumReview: jest.fn(),
        getRataRataJurnalPeserta: jest.fn(),
        getUserIdFromJurnal: jest.fn(),
        buatJurnal: jest.fn(),
        updateJurnal: jest.fn(),
        updateBeberapaDataJurnal: jest.fn(),
        updateReviewJurnal: jest.fn(),
        hapusJurnal: jest.fn(),
    },
    authService: {
        register: jest.fn(),
        login: jest.fn(),
        refresh: jest.fn(),
        logout: jest.fn(),
    },
}));
import { jurnalService, pesertaService } from "../../src/services";
beforeEach(() => {
    jest.resetAllMocks();
});

describe("Autentikasi", () => {
    it("401 UNAUTHORIZED jika tidak ada token", async () => {
        const res = await request(app).get("/api/v1/peserta/me");

        expect(res.status).toBe(401);
        expect(res.body.sukses).toBe(false);
        expect(res.body.error.kode).toBe("UNAUTHORIZED");
    });

    it("401 INVALID_TOKEN untuk token asal-asalan", async () => {
        const res = await request(app).get("/api/v1/peserta/me").set("Authorization", "Bearer token-palsu");

        expect(res.status).toBe(401);
        expect(res.body.error.kode).toBe("INVALID_TOKEN");
    });

    it("401 TOKEN_EXPIRED untuk token kedaluwarsa", async () => {
        const kedaluwarsa = jwt.sign(
            { id: 1, email: "a@mail.com", role: "peserta", exp: Math.floor(Date.now() / 1000) - 60 },
            process.env.JWT_SECRET as string
        );

        const res = await request(app).get("/api/v1/peserta/me").set("Authorization", bearer(kedaluwarsa));

        expect(res.status).toBe(401);
        expect(res.body.error.kode).toBe("TOKEN_EXPIRED");
    });
});

describe("Otorisasi (role)", () => {
    it("403 FORBIDDEN jika peserta mengakses daftar jurnal (khusus mentor)", async () => {
        const res = await request(app).get("/api/v1/jurnal").set("Authorization", bearer(tokenPeserta()));

        expect(res.status).toBe(403);
        expect(res.body.error.kode).toBe("FORBIDDEN");
        expect(jurnalService.getSemuaJurnal).not.toHaveBeenCalled();
    });

    it("200 dengan meta pagination jika mentor mengakses daftar jurnal", async () => {
        jest.mocked(jurnalService.getSemuaJurnal).mockResolvedValue({ data: [], total: 0 } as never);

        const res = await request(app).get("/api/v1/jurnal").set("Authorization", bearer(tokenMentor()));

        expect(res.status).toBe(200);
        expect(res.body.meta).toEqual({
            page: 1, limit: 10, total: 0, totalPages: 1, hasNext: false, hasPrev: false,
        });
    });
});

describe("Validasi input", () => {
    it("422 dengan detail per field untuk register yang tidak valid", async () => {
        const res = await request(app)
            .post("/api/v1/register")
            .send({ nama: "Bu", email: "bukan-email", password: "123" });

        expect(res.status).toBe(422);
        expect(res.body.error.kode).toBe("VALIDATION_ERROR");
        const fields = res.body.error.detail.map((d: { field: string }) => d.field);
        expect(fields).toEqual(expect.arrayContaining(["nama", "email", "password"]));
    });

    it("422 jika id di URL bukan angka", async () => {
        const res = await request(app).get("/api/v1/peserta/abc").set("Authorization", bearer(tokenPeserta()));

        expect(res.status).toBe(422);
        expect(res.body.error.detail[0].field).toBe("id");
    });

    it("422 jika limit melebihi batas", async () => {
        const res = await request(app)
            .get("/api/v1/jurnal")
            .query({ limit: 1000 })
            .set("Authorization", bearer(tokenMentor()));

        expect(res.status).toBe(422);
    });

    it("422 dan service TIDAK dipanggil saat PATCH /peserta/me membawa role (mass assignment)", async () => {
        const res = await request(app)
            .patch("/api/v1/peserta/me")
            .set("Authorization", bearer(tokenPeserta()))
            .send({ nama: "Budi Santoso", role: "mentor" });

        expect(res.status).toBe(422);
        expect(res.body.error.detail).toEqual([{ field: "role", pesan: "Properti ini tidak diizinkan" }]);
        expect(pesertaService.ubahProfil).not.toHaveBeenCalled();
    });

    it("urutan middleware: tanpa token dan body rusak tetap 401, bukan 422", async () => {
        const res = await request(app).post("/api/v1/jurnal").send({});

        expect(res.status).toBe(401);
    });
});

describe("Penanganan error", () => {
    it("400 INVALID_JSON untuk body JSON yang rusak", async () => {
        const res = await request(app)
            .post("/api/v1/login")
            .set("Content-Type", "application/json")
            .send("{rusak");

        expect(res.status).toBe(400);
        expect(res.body.error.kode).toBe("INVALID_JSON");
    });

    it("413 PAYLOAD_TOO_LARGE untuk body lebih dari 1 MB", async () => {
        const res = await request(app)
            .post("/api/v1/login")
            .send({ email: "a@mail.com", password: "x".repeat(2 * 1024 * 1024) });

        expect(res.status).toBe(413);
        expect(res.body.error.kode).toBe("PAYLOAD_TOO_LARGE");
    });

    it("404 NOT_FOUND untuk route yang tidak ada", async () => {
        const res = await request(app).get("/api/v1/tidak-ada");

        expect(res.status).toBe(404);
        expect(res.body.error.kode).toBe("NOT_FOUND");
    });

    it("500 dengan pesan generik, tanpa membocorkan penyebab, untuk error tak terduga", async () => {
        jest.mocked(jurnalService.getSemuaJurnal).mockRejectedValue(new Error("koneksi db putus: password=rahasia"));

        const res = await request(app).get("/api/v1/jurnal").set("Authorization", bearer(tokenMentor()));

        expect(res.status).toBe(500);
        expect(res.body.error.kode).toBe("INTERNAL_ERROR");
        expect(res.body.error.pesan).toBe("Terjadi kesalahan di server");
    });

    it("requestId dari header diteruskan ke header dan body response", async () => {
        const res = await request(app).get("/api/v1/tidak-ada").set("X-Request-Id", "abc-123");

        expect(res.headers["x-request-id"]).toBe("abc-123");
        expect(res.body.requestId).toBe("abc-123");
    });
});

describe("Response DTO", () => {
    it("password tidak pernah ikut keluar walau service mengembalikannya", async () => {
        jest.mocked(pesertaService.getPesertaById).mockResolvedValue({
            id: 1, nama: "Budi", email: "budi@mail.com", password: "HASH_RAHASIA",
        } as never);

        const res = await request(app).get("/api/v1/peserta/1").set("Authorization", bearer(tokenPeserta()));

        expect(res.status).toBe(200);
        console.log(JSON.stringify(res.body));
        expect(res.body.dataBersih).not.toHaveProperty("password");
        expect(JSON.stringify(res.body)).not.toContain("HASH_RAHASIA");
    });
});