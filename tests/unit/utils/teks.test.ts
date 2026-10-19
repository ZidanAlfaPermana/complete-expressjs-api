// 1. RED — tests/unit/utils/teks.test.ts (src/utils/teks.ts belum ada)
import {teks} from "../../../src/utils";

describe("potongTeks", () => {
    it("tidak memotong teks yang tidak melebihi batas", () => {
        expect(teks.potongTeks("halo", 10)).toBe("halo");
    });

    it("memotong dan menambah titik tiga jika melebihi batas", () => {
        expect(teks.potongTeks("Belajar TypeScript", 10)).toBe("Belajar...");
    });

    it("teks berisi kosong akan mengembalikan nilai kosong", () => {
        expect(teks.potongTeks("", 10)).toBe("");
    });
});