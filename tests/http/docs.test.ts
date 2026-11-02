// tests/http/docs.test.ts
import request from "supertest";
import { app } from "../../src/app";

describe("Endpoint dokumentasi", () => {
    it("GET /api/docs.json mengembalikan dokumen OpenAPI", async () => {
        const res = await request(app).get("/api/docs.json");

        expect(res.status).toBe(200);
        expect(res.body.openapi).toBe("3.0.3");
        expect(Object.keys(res.body.paths).length).toBeGreaterThan(10);
    });

    it("GET /api/docs/ menyajikan halaman Swagger UI", async () => {
        const res = await request(app).get("/api/docs/");

        expect(res.status).toBe(200);
        expect(res.headers["content-type"]).toContain("text/html");
    });
});