// tests/unit/docs/openapi.test.ts
import SwaggerParser from "@apidevtools/swagger-parser";
import { spec } from "../../../src/docs/swagger";

type Operasi = {
    tags?: string[];
    summary?: string;
    security?: unknown[];
    requestBody?: unknown;
    responses?: Record<string, unknown>;
};

const METODE = ["get", "post", "put", "patch", "delete"] as const;
const paths = (spec.paths ?? {}) as Record<string, Record<string, Operasi>>;

// Daftar [nama operasi, isi operasi] untuk semua endpoint di dokumen
const semuaOperasi = (): [string, Operasi][] =>
    Object.entries(paths).flatMap(([path, item]) =>
        METODE.filter((m) => item[m] !== undefined).map(
            (m): [string, Operasi] => [`${m.toUpperCase()} ${path}`, item[m]]
        )
    );

describe("Dokumen OpenAPI", () => {
    it("valid menurut spesifikasi OpenAPI (semua $ref terselesaikan)", async () => {
        // validate() mengubah objek yang diberikan, jadi kirim salinan
        await expect(SwaggerParser.validate(structuredClone(spec) as never)).resolves.toBeDefined();
    });

    it("memuat minimal satu endpoint", () => {
        expect(semuaOperasi().length).toBeGreaterThan(0);
    });

    it.each(semuaOperasi())("%s memenuhi konvensi dokumentasi", (_nama, op) => {
        const publik = Array.isArray(op.security) && op.security.length === 0;
        const kodeRespons = Object.keys(op.responses ?? {});

        expect(op.summary?.trim()).toBeTruthy();                           // ada ringkasan
        expect(op.tags?.length).toBeGreaterThan(0);                        // terkelompok dalam tag
        expect(kodeRespons.some((k) => /^2\d\d$/.test(k))).toBe(true);     // ada respons sukses

        if (!publik) expect(kodeRespons).toContain("401");                 // endpoint terkunci wajib mendokumentasikan 401
        if (op.requestBody) expect(kodeRespons).toContain("422");          // endpoint ber-body wajib mendokumentasikan 422
    });
});