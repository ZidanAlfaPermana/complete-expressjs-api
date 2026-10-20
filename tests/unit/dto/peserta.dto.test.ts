// tests/unit/dto/peserta.dto.test.ts
import "reflect-metadata";
import { ListPesertaQueryDto } from "../../../src/dto/peserta.dto";
import { UpdateProfilDto } from "../../../src/dto/peserta.dto";
import { validasiDto } from "../../../src/utils/validasi.util";
import { fieldYangGagal } from "../../helpers/dto";

describe("ListPesertaQueryDto", () => {
    it("memakai nilai bawaan jika query kosong", async () => {
        const q = await validasiDto(ListPesertaQueryDto, {}, "query");
        expect(q).toMatchObject({ page: 1, limit: 10, order: "DESC", sortBy: "createdAt" });
    });

    it("mengubah string dari query menjadi angka", async () => {
        const q = await validasiDto(ListPesertaQueryDto, { page: "2", limit: "20" }, "query");
        expect(q.page).toBe(2);       // number, bukan "2"
        expect(q.limit).toBe(20);
    });

    it("menerima order huruf kecil lalu mengubahnya ke huruf besar", async () => {
        const q = await validasiDto(ListPesertaQueryDto, { order: "asc" }, "query");
        expect(q.order).toBe("ASC");
    });

    it("mengabaikan parameter asing di query (tidak menolak)", async () => {
        const q = await validasiDto(ListPesertaQueryDto, { foo: "bar" }, "query");
        expect(q).not.toHaveProperty("foo");
    });

    it.each<[string, Record<string, unknown>, string]>([
        ["page nol", { page: "0" }, "page"],
        ["page bukan angka", { page: "abc" }, "page"],
        ["limit melebihi 100", { limit: "1000" }, "limit"],
        ["sortBy di luar whitelist", { sortBy: "password" }, "sortBy"],
        ["order sembarang", { order: "sembarang" }, "order"],
        ["sekolah ganda (array)", { sekolah: ["a", "b"] }, "sekolah"],
        ["fase di luar rentang", { fase: "9" }, "fase"],
    ])("menolak: %s", async (_judul, query, fieldDiharapkan) => {
        const gagal = await fieldYangGagal(validasiDto(ListPesertaQueryDto, query, "query"));
        expect(gagal).toContain(fieldDiharapkan);
    });
});

describe("UpdateProfilDto — pencegahan mass assignment", () => {
    it("menolak role walau dikirim bersama field yang sah", async () => {
        const gagal = await fieldYangGagal(
            validasiDto(UpdateProfilDto, { nama: "Budi Santoso", role: "mentor" })
        );
        expect(gagal).toEqual(["role"]);
    });

    it("menolak password dan email (tidak boleh diubah lewat endpoint ini)", async () => {
        const gagal = await fieldYangGagal(
            validasiDto(UpdateProfilDto, { password: "baru12345", email: "x@mail.com" })
        );
        expect(gagal).toEqual(expect.arrayContaining(["password", "email"]));
    });
});