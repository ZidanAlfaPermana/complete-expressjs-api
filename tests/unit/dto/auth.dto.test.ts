// tests/unit/dto/auth.dto.test.ts
import "reflect-metadata";
import { RegisterDto } from "../../../src/dto/auth.dto";
import { validasiDto } from "../../../src/utils/validasi.util";
import { fieldYangGagal } from "../../helpers/dto";

describe("RegisterDto", () => {
    const valid = {
        nama: "Budi Santoso",
        sekolah: "SMK 5 Malang",
        email: "budi@mail.com",
        password: "rahasia123",
        konfirmasiPassword: "rahasia123",
    };

    it("menerima payload yang valid", async () => {
        const hasil = await validasiDto(RegisterDto, valid);
        expect(hasil.nama).toBe("Budi Santoso");
    });

    it("menormalkan email: buang spasi tepi dan ubah ke huruf kecil", async () => {
        const hasil = await validasiDto(RegisterDto, { ...valid, email: "  Budi@Mail.COM  " });
        expect(hasil.email).toBe("budi@mail.com");
    });

    it.each<[string, Record<string, unknown>, string]>([
        ["nama hanya 2 karakter", { nama: "Bu" }, "nama"],
        ["nama hanya spasi", { nama: "      " }, "nama"],
        ["email salah format", { email: "bukan-email" }, "email"],
        ["password tanpa angka", { password: "hanyahuruf", konfirmasiPassword: "hanyahuruf" }, "password"],
        ["password lebih dari 72 karakter", { password: "a1".repeat(40), konfirmasiPassword: "a1".repeat(40) }, "password"],
        ["konfirmasi password berbeda", { konfirmasiPassword: "lain12345" }, "konfirmasiPassword"],
        ["properti asing role", { role: "mentor" }, "role"],
    ])("menolak: %s", async (_judul, ubahan, fieldDiharapkan) => {
        const gagal = await fieldYangGagal(validasiDto(RegisterDto, { ...valid, ...ubahan }));
        expect(gagal).toContain(fieldDiharapkan);
    });

    it("menolak body kosong dan melaporkan semua field wajib", async () => {
        const gagal = await fieldYangGagal(validasiDto(RegisterDto, {}));
        expect(gagal).toEqual(expect.arrayContaining(["nama", "sekolah", "email", "password"]));
    });

    it("menolak body yang bukan objek (array)", async () => {
        const gagal = await fieldYangGagal(validasiDto(RegisterDto, []));
        expect(gagal).toEqual(["body"]);
    });

    it("tidak membocorkan nilai password di detail error", async () => {
        try {
            await validasiDto(RegisterDto, { ...valid, password: "123", konfirmasiPassword: "123" });
            fail("seharusnya melempar error");   // baris ini tidak boleh tercapai
        } catch (err) {
            expect(JSON.stringify(err)).not.toContain("\"123\"");
        }
    });
});