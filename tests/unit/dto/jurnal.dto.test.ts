// tests/unit/dto/jurnal.dto.test.ts
import "reflect-metadata";
import { JurnalDto, ReviewJurnalDto } from "../../../src/dto/jurnal.dto";
import { validasiDto } from "../../../src/utils/validasi.util";
import { fieldYangGagal } from "../../helpers/dto";

describe("JurnalDto — objek bersarang", () => {
    const dasar = {
        kegiatan: "Belajar membuat endpoint dengan DTO",
        rencanaBesok: "Menulis test",
    };

    it("menerima lampiran yang valid", async () => {
        const hasil = await validasiDto(JurnalDto, {
            ...dasar,
            lampiran: [{ url: "https://contoh.com/ss1.png", keterangan: "tangkapan layar" }],
        });
        expect(hasil.lampiran).toHaveLength(1);
    });

    it("melaporkan field bersarang dengan notasi titik", async () => {
        const gagal = await fieldYangGagal(
            validasiDto(JurnalDto, {
                ...dasar,
                lampiran: [{ url: "https://contoh.com/ok.png" }, { url: "bukan-url" }],
            })
        );
        expect(gagal).toContain("lampiran.1.url");
    });

    it("menolak lampiran lebih dari 5 item", async () => {
        const enam = Array.from({ length: 6 }, () => ({ url: "https://contoh.com/x.png" }));
        const gagal = await fieldYangGagal(validasiDto(JurnalDto, { ...dasar, lampiran: enam }));
        expect(gagal).toContain("lampiran");
    });

    it("menolak pesertaId dari body (harus dari token)", async () => {
        const gagal = await fieldYangGagal(validasiDto(JurnalDto, { ...dasar, pesertaId: 99 }));
        expect(gagal).toEqual(["pesertaId"]);
    });
});

describe("ReviewJurnalDto — validasi bersyarat", () => {
    it("catatan wajib jika statusReview sudah", async () => {
        const gagal = await fieldYangGagal(validasiDto(ReviewJurnalDto, { statusReview: "sudah" }));
        expect(gagal).toContain("catatan");
    });

    it("catatan boleh kosong jika statusReview belum", async () => {
        await expect(
            validasiDto(ReviewJurnalDto, { statusReview: "belum" })
        ).resolves.toBeDefined();
    });
});