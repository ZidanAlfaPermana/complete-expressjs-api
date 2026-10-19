import {hanyaYangDiisi} from "../../../src/services/peserta.service";

describe("hanyaYangDiisi", () => {
    describe("nilai yang dibuang", () => {
        it("membuang properti bernilai undefined", () => {
            const hasil = hanyaYangDiisi({ nama: "Budi", telepon: undefined });

            expect(hasil).toStrictEqual({ nama: "Budi" });
            expect(Object.keys(hasil)).toEqual(["nama"]);
            expect("telepon" in hasil).toBe(false);
        });

        it("menghasilkan objek kosong bila semua nilainya undefined", () => {
            const hasil = hanyaYangDiisi({ a: undefined, b: undefined });

            expect(Object.keys(hasil)).toHaveLength(0);
        });
    });

    describe("nilai yang HARUS tetap ada", () => {
        it("mempertahankan null", () => {
            const hasil = hanyaYangDiisi({ hambatan: null });

            expect("hambatan" in hasil).toBe(true);
            expect(hasil.hambatan).toBeNull();
        });

        it("mempertahankan string kosong", () => {
            const hasil = hanyaYangDiisi({ catatan: "" });

            expect("catatan" in hasil).toBe(true);
            expect(hasil.catatan).toBe("");
        });

        it("mempertahankan angka 0", () => {
            const hasil = hanyaYangDiisi({ fase: 0 });

            expect("fase" in hasil).toBe(true);
            expect(hasil.fase).toBe(0);
        });

        it("mempertahankan false", () => {
            const hasil = hanyaYangDiisi({ aktif: false });

            expect("aktif" in hasil).toBe(true);
            expect(hasil.aktif).toBe(false);
        });

        it("mempertahankan null, string kosong, dan 0 sekaligus sambil membuang undefined", () => {
            const hasil = hanyaYangDiisi({
                a: null,
                b: "",
                c: 0,
                d: undefined,
                e: "isi",
            });

            expect(hasil).toStrictEqual({ a: null, b: "", c: 0, e: "isi" });
            expect(Object.keys(hasil)).toEqual(["a", "b", "c", "e"]);
        });
    });

    describe("perilaku lain", () => {
        it("mengembalikan objek kosong untuk input kosong", () => {
            expect(hanyaYangDiisi({})).toStrictEqual({});
        });

        it("tidak mengubah objek asli", () => {
            const asli = { nama: "Budi", telepon: undefined };

            hanyaYangDiisi(asli);

            expect("telepon" in asli).toBe(true);
            expect(asli).toStrictEqual({ nama: "Budi", telepon: undefined });
        });

        it("mengembalikan objek baru, bukan referensi yang sama", () => {
            const asli = { nama: "Budi" };

            expect(hanyaYangDiisi(asli)).not.toBe(asli);
        });

        it("hanya memeriksa level pertama (objek bersarang tidak disentuh)", () => {
            const hasil = hanyaYangDiisi({ detail: { x: undefined, y: 1 } });

            expect(hasil.detail).toStrictEqual({ x: undefined, y: 1 });
        });
    });
});