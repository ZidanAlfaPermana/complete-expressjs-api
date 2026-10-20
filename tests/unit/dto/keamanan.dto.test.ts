import "reflect-metadata";
import { validasiDto } from "../../../src/utils/validasi.util";
import { RegisterDto } from "../../../src/dto/auth.dto";
import { LoginDto } from "../../../src/dto/auth.dto";
import { UpdateProfilDto } from "../../../src/dto/peserta.dto";
import { ListPesertaQueryDto } from "../../../src/dto/peserta.dto";
import { ListJurnalQueryDto } from "../../../src/dto/jurnal.dto";
import {fieldYangGagal} from "../../helpers/dto";

async function tangkap(promise: Promise<unknown>): Promise<any | null> {
    try {
        await promise;
        return null;
    } catch (err) {
        return err;
    }
}
function serialisasi(err: unknown): string {
    return JSON.stringify(err, Object.getOwnPropertyNames(err as object));
}

function fieldGagal(err: any): string[] {
    const daftar = err?.details ?? err?.errors ?? [];
    return [...new Set<string>(daftar.map((d: any) => d.field ?? d.property))];
}

describe("Keamanan — a. UpdateProfilDto menolak role, id, password", () => {
    it.each([
        ["role", { role: "mentor" }],
        ["id", { id: 99 }],
        ["password", { password: "rahasia123" }],
    ])("menolak properti %s", async (field, payload) => {
        const gagal = await fieldYangGagal(validasiDto(UpdateProfilDto, payload));
        expect(gagal).toContain(field);
    });

    it("tetap menolak walau dikirim bersama field yang valid", async () => {
        const gagal = await fieldYangGagal(validasiDto(UpdateProfilDto, { nama: "Budi Baru", role: "mentor", id: 1, password: "x12345678" }));
        expect([...new Set(gagal)].sort()).toEqual(["id", "password", "role"]);
    });
});

describe("Keamanan — b. nilai password tidak muncul di detail error", () => {
    const rahasia = "RAHASIA-unik-98765";

    it("RegisterDto: password tidak valid + konfirmasi beda", async () => {
        const err = await tangkap(
            validasiDto(RegisterDto, {
                nama: "Budi",
                sekolah: "SMKN 5 Malang",
                email: "a@mail.com",
                password: rahasia + "abc",
                konfirmasiPassword: "beda-" + rahasia,
            })
        );
        expect(err).not.toBeNull();
        const teks = serialisasi(err);
        expect(teks).not.toContain(rahasia);
    });

    it("LoginDto: email salah, password ikut dikirim", async () => {
        const err = await tangkap(validasiDto(LoginDto, { email: "bukan-email", password: rahasia }));
        expect(err).not.toBeNull();
        expect(serialisasi(err)).not.toContain(rahasia);
    });

    it("UpdateProfilDto: password dikirim lewat properti terlarang", async () => {
        const err = await tangkap(validasiDto(UpdateProfilDto, { password: rahasia }));
        expect(err).not.toBeNull();
        expect(serialisasi(err)).not.toContain(rahasia);
    });
});

describe("Keamanan — c. sortBy=password ditolak di kedua query DTO", () => {
    it.each([
        ["ListPesertaQueryDto", ListPesertaQueryDto],
        ["ListJurnalQueryDto", ListJurnalQueryDto],
    ])("%s menolak sortBy=password", async (_nama, Dto) => {
        const gagal = await fieldYangGagal(validasiDto(Dto as any, { sortBy: "password" }));
        expect([...new Set(gagal)]).toEqual(["sortBy"]);
    });
});

describe("Keamanan — d. email dinormalkan", () => {
    it.each([
        ["  Siti@Mail.COM  ", "siti@mail.com"],
        ["BUDI@MAIL.COM", "budi@mail.com"],
        ["\tani@Mail.com\n", "ani@mail.com"],
    ])("RegisterDto: %j menjadi %j", async (masuk, keluar) => {
        const hasil: any = await validasiDto(RegisterDto, {
            nama: "Siti",
            sekolah: "SMKN 5 Malang",
            email: masuk,
            password: "rahasia123",
            konfirmasiPassword: "rahasia123",
        });
        expect(hasil.email).toBe(keluar);
    });

    it("RegisterDto: nama juga di-trim", async () => {
        const hasil: any = await validasiDto(RegisterDto, {
            nama: "  Siti  ",
            sekolah: "SMKN 5 Malang",
            email: "siti@mail.com",
            password: "rahasia123",
            konfirmasiPassword: "rahasia123",
        });
        expect(hasil.nama).toBe("Siti");
    });
});