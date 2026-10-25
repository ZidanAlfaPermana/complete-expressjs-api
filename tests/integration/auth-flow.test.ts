// tests/integration/auth-flow.test.ts
import request from "supertest";
import { app } from "../../src/app";
import { AppDataSource } from "../../src/config/database.config";
import { Peserta } from "../../src/entities/Peserta.entity";
import { bersihkanDatabase } from "../helpers/db";

describe("Alur autentikasi lengkap (database sungguhan)", () => {
    const akun = {
        nama: "Budi Santoso",
        sekolah: "SMK 5 Malang",
        email: "budi@mail.com",
        password: "rahasia123",
        konfirmasiPassword: "rahasia123",
    };

    beforeAll(async () => {
        await AppDataSource.initialize();
        await AppDataSource.runMigrations();
    });

    beforeEach(async () => {
        await bersihkanDatabase();
    });

    afterAll(async () => {
        await AppDataSource.destroy();
    });

    it("register, login, akses /me, tolak mass assignment, refresh, logout, refresh ditolak", async () => {
        const reg = await request(app).post("/api/v1/register").send(akun);
        expect(reg.status).toBe(201);
        expect(reg.body.dataBersih).not.toHaveProperty("password");

        const login = await request(app)
            .post("/api/v1/login")
            .send({ email: akun.email, password: akun.password });
        expect(login.status).toBe(200);
        const { accessToken, refreshToken } = login.body.dataBersih;
        console.log("login:", login.body);
        expect(accessToken).toEqual(expect.any(String));

        const me = await request(app).get("/api/v1/peserta/me").set("Authorization", `Bearer ${accessToken}`);
        expect(me.status).toBe(200);
        expect(me.body.dataBersih.email).toBe(akun.email);
        expect(me.body.dataBersih).not.toHaveProperty("password");

        const nakal = await request(app)
            .patch("/api/v1/peserta/me")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ role: "mentor" });
        expect(nakal.status).toBe(422);
        const dariDb = await AppDataSource.getRepository(Peserta).findOneByOrFail({ email: akun.email });
        expect(dariDb.role).toBe("peserta");

        const refresh = await request(app)
            .post("/api/v1/refresh")
            .set("Authorization", `Bearer ${refreshToken}`);
        expect(refresh.status).toBe(200);
        expect(refresh.body.dataBersih.accessToken).toEqual(expect.any(String));

        const logout = await request(app)
            .post("/api/v1/logout")
            .set("Authorization", `Bearer ${refreshToken}`);
        expect([200, 204]).toContain(logout.status);

        const refreshLagi = await request(app)
            .post("/api/v1/refresh")
            .set("Authorization", `Bearer ${refreshToken}`);
        expect(refreshLagi.status).toBe(401);
        expect(refreshLagi.body.error.pesan).toBe("Refresh token tidak dikenali atau sudah dicabut");
    });

    it("menolak email duplikat walau beda huruf besar dan spasi (409)", async () => {
        await request(app).post("/api/v1/register").send(akun);

        const res = await request(app)
            .post("/api/v1/register")
            .send({ ...akun, email: "  BUDI@mail.com " });

        expect(res.status).toBe(409);
        expect(res.body.error.kode).toBe("CONFLICT");
    });

    it("dua register bersamaan dengan email sama: satu 201, satu 409 (UNIQUE constraint)", async () => {
        const [a, b] = await Promise.all([
            request(app).post("/api/v1/register").send(akun),
            request(app).post("/api/v1/register").send(akun),
        ]);

        expect([a.status, b.status].sort()).toEqual([201, 409]);
    });
});